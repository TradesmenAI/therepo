import { exec } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client'
import { IncomingForm } from "formidable";
import fs from 'fs'
import { Readable, Stream } from 'stream';


export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const prisma = new PrismaClient()


    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename=voicemail.mp3`);

        const dt = await prisma.voicemail.findUnique({ where: { user_id: 'test' } })

        if (dt) {
            const stream = Readable.from(dt.recording);
            res.send(stream)
            return;
        }

       
        return res.status(500).json({})
    }

    if (req.method !== 'POST') {

        return res.status(500).json({})
    }

    const data = await new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });

    const srcToFile = (src: string) => fs.readFileSync(src);

    const path = data.files.file[0].filepath


    await prisma.voicemail.create({
        data: {
            user_id: 'test',
            recording: srcToFile(path)
        }
    })

    console.log(srcToFile(path));


    res.status(200).json({})
}
