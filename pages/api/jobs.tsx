import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';


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

    if (req.method === 'GET') {
        const jobs = await prisma.businessType.findMany({
            orderBy: [
                {
                  name: 'asc',
                },
            ],
        })
        let result:any[] = []

        jobs.map((job)=>{
            result.push({
                id: job.id,
                name: job.name
            })
        })
        

        return res.status(200).json(result)
        return
    }

    return res.status(405).send({ message: 'Not supported' })
}

export default ProtectedRoute