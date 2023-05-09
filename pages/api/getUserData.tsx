import { NextApiHandler } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';

const ProtectedRoute: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    const supabase = createServerSupabaseClient({ req, res })
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
        // new user, create data
        profileData = await prisma.user.create({data: {
            uid: user.id,
            credits: 0
        }})

        // create new api key

        await prisma.apiKey.create({data: {
            key: uuidv4(),
            enabled: true,
            user_id: user.id
        }})
    }

    const key = await prisma.apiKey.findFirst({where: {
        user_id: user.id
    }})

    const msgs = await prisma.usage.findMany({where: {
        api_key: key?.key,
        operation: 'query'
    }})

    const files = await prisma.file.findMany({where: {
        api_key: key?.key
    }})

    const creditsLeft = profileData.credits - files.length * 2 - msgs.length

    const result = {
        credits: creditsLeft,
        apiKey: key?.key,
        messages: msgs.length,
        documents: files.length
    }


    return res.status(200).json(result)
}

export default ProtectedRoute