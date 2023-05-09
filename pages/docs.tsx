import {
    Box,
    Flex,
    Image,
    Spacer,
    Text,
    Spinner,
    Divider,
    Button,
    useToast,
    Accordion,
    Skeleton,
    Grid,
    Textarea
} from '@chakra-ui/react'
import { Show, Hide } from '@chakra-ui/react'
import { Toaster, toast } from 'sonner';
import Sidebar from '../components/sidebar'
import ContentHeader from '../components/contentHeader'
import TitleBlock from '../components/titleBlock'
import { useState, useEffect, useMemo } from 'react'
import { sleep, useAppContext } from '../state/appContext'
import { withPageAuth } from '@supabase/auth-helpers-nextjs'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { BiCopy, BiPlusMedical } from "react-icons/bi";
import { Icon } from '@chakra-ui/react'
import { uuidv4, selectFile } from '../utils'
import {
BiAddToQueue,
BiLayer,
BiX,

} from "react-icons/bi";
import NoCreditsModal from '../components/modals/noCreditsModal'
import { useSession } from "@supabase/auth-helpers-react";
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router'
import CodeExample, { CodeExampleData } from '../components/codeExample';


export default function Docs() {
    const { setCurrentModal, profile, purchaseCredits, purchaseInProgress} = useAppContext();
    const [credits, setCredits]= useState(0)
    const [apiKey, setApiKey]= useState('-')
    const [docsCount, setDocsCount]= useState(0)
    const [msgCount, setMsgCount]= useState(0)
    const session = useSession()
    const {push} = useRouter()
    const [feedback, setFeedback] = useState('')
    const [sending, setSending] = useState(false)

    // useEffect(() => {
    //     (async ()=>{
    //         const result = await fetch('https://api.chatwithdocs.co/document/4c7397a8-c15a-4683-93bf-1e05e72de81b', {
    //             headers: {
    //                 'Authorization': 'Bearer 3a9547e1-3bb0-450e-8dcd-230852a2b31b'
    //             },
    //         })

    //         const json = await result.json()
    //         console.log(json.status) // must equal 'ready'
    //     })()
    // }, [])

    const uploadFileData:CodeExampleData[] = [
        {
            code: `curl -X POST \\
-H 'Authorization: Bearer ${profile?.apiKey}' \\
-F 'file=@{FILE_PATH}' https://api.chatwithdocs.co/document`,
            language: 'cUrl'
        },
        {
            code: `files = {'file': open({FILE_PATH}, 'rb')}
url = 'https://api.chatwithdocs.co/document'
headers = {'Authorization': f'Bearer ${profile?.apiKey}'}
r = requests.post(url, files=files, headers=headers)

document_id = r.json()['id'] # id of the created file`,
            language: 'Python'
        },
        {
            code: `const data = new FormData();
data.append('file', {YOUR_FILE});

const result = await fetch('https://api.chatwithdocs.co/document',
    {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'multipart/form-data; ',
            'Authorization': 'Bearer ${profile?.apiKey}'
        },
    }
);

const document_id = result.id // id of the created file`,
            language: 'JS'
        },
        
    ]

    const getFileStatusData:CodeExampleData[] = [
        {
            code: `curl -H 'Authorization: Bearer ${profile?.apiKey}' \\
https://api.chatwithdocs.co/document/{DOCUMENT_ID}`,
            language: 'cUrl'
        },
        {
            code: `url = f'https://api.chatwithdocs.co/document/{DOCUMENT_ID}'
headers = {'Authorization': f'Bearer ${profile?.apiKey}'}
r = requests.get(url, headers=headers)

status = r.json()['status'] # must equal 'ready'`,
            language: 'Python'
        },
        {
            code: `const result = await fetch('https://api.chatwithdocs.co/document/{DOCUMENT_ID}', {
    headers: {
        'Authorization': 'Bearer ${profile?.apiKey}'
    },
})

const json = await result.json() // object {file name, size, status, summary}
console.log(json.status) // must equal 'ready'`,
            language: 'JS'
        }
    ]

    const queryData:CodeExampleData[] = [
        {
          code: `curl -X POST -H 'Authorization: Bearer ${profile?.apiKey}' \\
-H 'Content-Type: application/json' \\
-d '{"query":"What is this document about"}' \\
https://api.chatwithdocs.co/query/{DOCUMENT_ID}`,
          language: 'cUrl'
        },
        {
            code: `data = {'query': 'What is this document about'}
url = f'https://api.chatwithdocs.co/query/{DOCUMENT_ID}'
headers = {'Authorization': f'Bearer ${profile?.apiKey}'}

r = requests.post(url, json=data, headers=headers)`,
            language: 'Python'
        },
        {
            code: `const result = await fetch(\`https://api.chatwithdocs.co/query/\${DOCUMENT_ID}\`, {
    method: 'POST',
    headers: {
        'Authorization': \`Bearer \${profile?.apiKey}\`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({query: 'What is this document about'}),
});`,
            language: 'JS'
        },
        
    ]

    useEffect(()=>{
        if (profile) {
            setCredits(profile.credits)
            setApiKey(profile.apiKey)
            setDocsCount(profile.documents)
            setMsgCount(profile.messages)
        }
    }, [profile])

    return (
        
        <Flex dir='row'>
            <Sidebar />

            <Toaster  />

            <NoCreditsModal/>

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>

                <Show below='700px'><Box height='40px' width='100%'></Box></Show>

                <ContentHeader title='Documentation' />

                <Flex flexDir='column' gap={4} maxW='850px' minW='250px' width='100%' alignItems={'center'} paddingBottom='50px'>
                    
                    <CodeExample title='Upload file' data={uploadFileData} />
                    <CodeExample title='Check file status' data={getFileStatusData} />
                    <CodeExample title='Make a query' data={queryData} />
                    

                    

                </Flex>
            </Flex>
        </Flex>
    )
}

