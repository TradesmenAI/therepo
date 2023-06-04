import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';

export interface Business {
    id:number,
    name:string
    prompt:string
    msg:string
}

export interface BusinessArgs {
    id?:number
    name:string
    prompt:string
    msg:string
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
    console.log(req.method)
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

    if (!profileData?.is_admin){
        return res.status(405).json({
            error: 'not_allowed',
            description: 'Not allwoed',
        })
    }


    if (req.method === 'GET') {
        const data = await prisma.businessType.findMany()
        return res.status(200).json(data)
    }

    const reqData:BusinessArgs = req.body as BusinessArgs;

    // Create new business
    if (req.method === 'POST') {
        await prisma.businessType.create({data: {
            name: reqData.name,
            prompt: reqData.prompt,
            msg: reqData.msg
        }})

        return res.status(200).json({})
    }

    // Update new business
    if (req.method === 'PUT') {
        await prisma.businessType.update({data: {
            name: reqData.name,
            prompt: reqData.prompt,
            msg: reqData.msg
        }, where: {
            id: reqData.id!
        }})

        return res.status(200).json({})
    }


    return res.status(405).send({ message: 'Not supported' })
}

export default ProtectedRoute