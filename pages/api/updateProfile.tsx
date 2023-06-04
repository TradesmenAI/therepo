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

    const allowedFields = ['business_number', 'service_enabled']

    if (!allowedFields.includes(requestData.field_name)) {
        res.status(500).send({ message: 'Field not allowed' })
        return
    }

    let updateData = {}
    //@ts-ignore
    updateData[requestData.field_name] = requestData.value;

    await prisma.user.update({
        where: {
            uid: profileData.uid
        },
        data: updateData
    })

    return res.status(200).json({})
}

export default ProtectedRoute