import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'
import { IncomingForm } from "formidable";
import fs from 'fs'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'


export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== 'POST') {
        return res.status(500).json({})
    }

    const supabase = createPagesServerClient({ req, res })
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'The user does not have an active session or is not authenticated',
        })
    }

    const prisma = new PrismaClient()

    const { data: { user }, } = await supabase.auth.getUser()

    if (!user) {
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

    if (!profileData) {
        return res.status(401).json({
            error: 'not_authenticated',
            description: 'Profile not found',
        })
    }

    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

    const srcToFile = (src: string) => fs.readFileSync(src);
    //@ts-ignore
    const path = data.files.file[0].filepath

    if (!path) {
        return res.status(500).json({})
    }

    try {
        // delete is there is existing
        await prisma.voicemail.delete({ where: { user_id: profileData.uid } })
    } catch (e) {
        //pass
    }

    // replace with new
    await prisma.voicemail.create({
        data: {
            user_id: profileData.uid,
            recording: srcToFile(path)
        }
    })

    res.status(200).json({})
}
