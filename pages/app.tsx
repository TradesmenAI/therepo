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
BiX
} from "react-icons/bi";
import NoCreditsModal from '../components/modals/noCreditsModal'
import { useSession } from "@supabase/auth-helpers-react";
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router'
export default function App() {
    const { setCurrentModal, profile, purchaseCredits, purchaseInProgress} = useAppContext();
    const [credits, setCredits]= useState(0)
    const [apiKey, setApiKey]= useState('-')
    const [docsCount, setDocsCount]= useState(0)
    const [msgCount, setMsgCount]= useState(0)
    const session = useSession()
    const {push} = useRouter()
    const [feedback, setFeedback] = useState('')
    const [sending, setSending] = useState(false)

    const sendFeedback = async() => {
        if (!feedback.trim()){
            return
        }
        setSending(true)
        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({text: feedback.trim()}),
        })

        if (res.status === 200) {
            // setCurrentModal('noCreditsModal')
            toast.success('Feedback sent')
            setFeedback('')
        }

        setSending(false)
    }

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

                <ContentHeader title='Dashboard' />

                <Flex flexDir='column' gap={2} maxW='450px' minW='250px' width='100%' alignItems={'center'}>
                    {/* <Text fontSize='17' fontWeight='bold'>Settings</Text>
                    <Divider /> */}

                    <Flex mb={5} gap={0} flexDir='column' alignItems='center' w='300px' bgColor='rgb(246, 248, 250)' padding={2} py={4} borderRadius='8px'>
                        <Text mt={2} align={'center'} width='100%' fontWeight='bold' fontSize='25'>$25</Text>
                        <Text align={'center'} width='100%' fontWeight='bold' fontSize='18px'>900 credits/month</Text>
                        <Text mt={3} align={'center'} width='100%'  fontSize='16px' color='#575757'>1 document upload - 2 credits</Text>
                        <Text align={'center'} width='100%'  fontSize='16px' color='#575757'>1 document question - 1 creditn</Text>
                        <Button disabled={(purchaseInProgress || profile === null)} isLoading={purchaseInProgress} onClick={purchaseCredits} colorScheme='blue' mt={4} w='220px'>Buy</Button>
                    </Flex>

                    {profile === null && <Spinner/>}

                    {profile !== null && (<>
                    
                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>API Key</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='normal'>
                            {apiKey}
                            </Text>
                            <Icon as={BiCopy} w={5} h={5} color='#4F4F4F' cursor='pointer' marginLeft='10px' onClick={()=> {
                                navigator.clipboard.writeText(apiKey)
                                toast.success('Api Key Copied')
                            }} />
                            
                        </Flex>

                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Credits left</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='bold'>
                                {credits}
                            </Text>
                        </Flex>
                    

                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={1} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Docs created</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='bold'>
                                {docsCount}
                            </Text>
                        </Flex>

                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={1} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Messages sent</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='bold'>
                                {msgCount}
                            </Text>
                        </Flex>
                    
                    </>)}

                    

                    {/* <Divider/> */}

                    <Text  mt={4} w='100%' fontWeight='bold'>Feedback</Text>
                    <Textarea resize={'none'} value={feedback} onChange={(e:any)=>{
                        setFeedback(e.target.value)
                    }} placeholder='Have any questions or suggestions? We would love to hear!'/>
                    <Flex w='100%' flexDirection={'row'} justifyContent='flex-end'>
                        <Spacer/>
                        <Button isLoading={sending} isDisabled={sending} onClick={sendFeedback}>Send</Button>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )
}

