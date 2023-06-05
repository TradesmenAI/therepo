import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'

export interface CallData {
    date: Date
    from:string
    to:string
    status:string
    user_id?:string
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

    if (req.method === 'GET' && profileData.is_admin){
        const calls = await prisma.callLog.findMany({orderBy:[
                {created_at: 'desc'}
            ], 
            take: 300
        })            
        
        const results:CallData[] = []
    
        calls.map((call)=>{
            results.push({
                date: call.created_at,
                from: call.from,
                to: call.to,
                status: call.status,
                user_id: call.user_id?call.user_id:undefined
            })
        })
    
    
        return res.status(200).json(results)
    }

    return res.status(500).end()
}

export default ProtectedRoute