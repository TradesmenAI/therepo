import { NextApiHandler } from 'next'
import { PrismaClient } from '@prisma/client'
import {validateRequest, twiml} from 'twilio';
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const ProtectedRoute: NextApiHandler = async (req, res) => {
    const prisma = new PrismaClient()

    const requests = await prisma.chatRequest.findMany({
        where: {
            responded: false
        }, 
        orderBy: [
            {
                id: 'desc'
            }
        ]
    })

    const uniqueRequests:any = {}
    let duplicates:number[] = []

    requests.map((request)=>{
        if (!uniqueRequests.hasOwnProperty(request.target_number)){
            uniqueRequests[request.target_number] = request
        } else {
            duplicates.push(request.id)
        }
    })

    await prisma.chatRequest.updateMany({data: {
        responded: true
    },
    where: {
        id: {
            in: duplicates
        }
    }})

    console.log('uniqueRequests:')
    console.log(uniqueRequests)

    Object.entries(uniqueRequests).forEach(([k,v]:[k:any, v:any]) => {
        console.log("The key: ", k)
        console.log("The value: ", v)

        const messages = JSON.parse(v.messages).reverse()
        console.log(messages)
    })

    
    return res.status(200).end()
}

export default ProtectedRoute