import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';

export type UpdateProfileArgs = {
    field_name:string,
    value:any
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    const requestData:UpdateProfileArgs = req.body as UpdateProfileArgs;

    const supabase = createPagesServerClient({ req, res })
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session)
    {
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    const prisma = new PrismaClient()

    const {data: { user },} = await supabase.auth.getUser()

    if (!user){
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    let profileData = await prisma.user.findFirst({
        where: {
            uid: user.id
        }
    })

    if (!profileData){
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'Profile not found',
        })
    }

    const allowedFields = ['business_number', 'service_enabled', 'business_type', 'business_id', 'bot_intro_message', 'voicemail_enabled', 'outofhours_enabled', 'out_from_time', 'to_from_time', 'timezone', 'out_of_hours_message']

    if (!allowedFields.includes(requestData.field_name)) {
        res.status(500).send({ message: 'Field not allowed' })
        return
    }

    if (requestData.field_name === 'business_id'){
        const business = await prisma.businessType.findUnique({where: {
            id: requestData.value
        }})

        await prisma.user.update({data: {
            prompt: business?.prompt,
            bot_fail_message: business?.msg,
            business_id: business?.id,
            bot_intro_message: business?.intro_msg
        }, where: {
            uid: profileData.uid
        }})

        return res.status(200).json({})
    }

    if (requestData.field_name === 'business_number') {
        requestData.value = requestData.value.replace(' ', '')
    }

    let updateData = {}
    //@ts-ignore
    updateData[requestData.field_name] = requestData.value;

    if (!profileData.business_type && requestData.field_name === 'business_type'){
        const promptObj = await prisma.config.findFirst({where: {
            key: 'generic_prompt'
        }})

        if (promptObj) {
            let p = promptObj.value
            p = p.replace('{{jobs}}', requestData.value)

            //@ts-ignore
            updateData['prompt'] = p;
        }

        const messageObj = await prisma.config.findFirst({where: {
            key: 'generic_message'
        }})

        if (messageObj) {
            //@ts-ignore
            updateData['bot_intro_message'] = messageObj.value;
        }

        const errorObj = await prisma.config.findFirst({where: {
            key: 'generic_error'
        }})

        if (errorObj){
            //@ts-ignore
            updateData['bot_fail_message'] = errorObj.value;
        }
    }

    await prisma.user.update({
        where: {
            uid: profileData.uid
        },
        data: updateData
    })

    return res.status(200).json({})
}

export default ProtectedRoute