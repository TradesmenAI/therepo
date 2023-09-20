import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { Readable, Stream } from 'stream';


export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== 'GET') {
        return res.status(500).json({})
    }

    const code = req.query.code as string;
    const userId = req.query.userId as string;

    if (!userId || !code || code !== process.env.WEBHOOK_SECRET_CUSTOM){
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }
   
    const prisma = new PrismaClient()
    
    let profileData = await prisma.user.findFirst({
        where: {
            uid: userId
        }
    })

    if (!profileData ) {
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'Profile not found',
        })
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename=voicemail.mp3`);

    const dt = await prisma.voicemail.findUnique({ where: { user_id: profileData.uid } })

    if (dt) {
        const stream = Readable.from(dt.recording);
        res.send(stream)
        return;
    }

   
    return res.status(500).json({})
}
