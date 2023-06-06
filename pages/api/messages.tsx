import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'

export interface MessageData {
    date: Date
    from:string
    to:string
    direction:string
    text:string
}

export type MessagesArgs = {
    customer_number: string
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
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
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    if (req.method === 'POST'){
        const requestData:MessagesArgs = req.body as MessagesArgs;

        const messages = await prisma.messageLog.findMany({where: {
                user_email: profileData.email
            }, orderBy:[
                {created_at: 'desc'}
            ]
        })
    
    
        const results:MessageData[] = []
    
        messages.map((msg)=>{
            if (msg.from === requestData.customer_number || msg.to === requestData.customer_number){
                results.push({
                    date: msg.created_at,
                    from: msg.from,
                    to: msg.to,
                    direction: msg.direction,
                    text: msg.text
                })
            }
        })
    
    
        return res.status(200).json(results.reverse())
    }

    return res.status(500).end()
}

export default ProtectedRoute