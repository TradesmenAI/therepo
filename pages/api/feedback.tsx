import { NextApiHandler } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { PrismaClient } from '@prisma/client'

  
export type FeedbackArgs = {
    text: string
}

const ProtectedRoute: NextApiHandler = async (req, res) => {
    // Generic checks
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    const requestData:FeedbackArgs = req.body as FeedbackArgs;

    if (!requestData.text) {
        res.status(500).send({ message: 'Required fields missing' })
        return
    }

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


    await fetch(
        'https://discord.com/api/webhooks/1103666904540913694/urqBZj-TZrt61wQingvAp-USQo3u-jrMIzYcKxRwwx1IbF9Grz0dtUDozhRvVdREP3HG',
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // the username to be displayed
            username: 'Feedback bot',
            content:
              `${session.user.email}: ${requestData.text}`,
            // enable mentioning of individual users or roles, but not @everyone/@here
            allowed_mentions: {
              parse: ['users', 'roles'],
            },
          }),
        }
    );

    return res.status(200).json({})
}

export default ProtectedRoute