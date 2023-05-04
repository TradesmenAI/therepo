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

    const uploadFileData:CodeExampleData[] = [
        {
            code: `curl --location --request POST  \\
--header 'Authorization: Bearer ${profile?.apiKey}' \\
--form file='@{FILE_PATH}' \\
https://api.chatwithdocs.co/document`,
            language: 'cUrl'
        },
        {
            code: `import axios from "axios";
    
const formData = new FormData();
formData.append("file", {YOUR_FILE});
const resp = await axios.post('https://api.chatwithdocs.co/document', formData, {
    headers: {
        "content-type": "multipart/form-data",
        Authorization: 'Bearer ${profile?.apiKey}',
    },
});

console.log(resp.id) // id of the created file`,
            language: 'JS'
        }
    ]

    const getFileStatusData:CodeExampleData[] = [
        {
            code: `curl --location   \\
--header 'Authorization: Bearer ${profile?.apiKey}' \\
localhost:8000/document/{DOCUMENT_ID}`,
            language: 'cUrl'
        },
        {
            code: `import axios from "axios";
    
const response = await axios.get('https://api.chatwithdocs.co/document/{DOCUMENT_ID}', {
    headers: {
        Authorization: 'Bearer ${profile?.apiKey}',
    },
});
    
console.log(response) // file name, size, status, summary`,
            language: 'JS'
        }
    ]

    const queryData:CodeExampleData[] = [
        {
            code: `curl --location --request POST  \\
    --header 'Authorization: Bearer ${profile?.apiKey}' \\
    --header 'Content-Type: application/json' \\
     --data '{"query":"What is this document about?"}' \\
    https://api.chatwithdocs.co/query/{DOCUMENT_ID}`,
            language: 'cUrl'
        },
        {
            code: `import axios from "axios";
    
const resp = await axios.post('https://api.chatwithdocs.co/query/{DOCUMENT_ID}', {
    headers: {
        "content-type": "application/json",
        Authorization: 'Bearer ${profile?.apiKey}}',
    },
});
    
console.log(resp.result)`,
            language: 'JS'
        }
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

