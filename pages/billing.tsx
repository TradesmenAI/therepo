'use client'

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
    Textarea,
    Switch
} from '@chakra-ui/react'
import { Show, Hide } from '@chakra-ui/react'
import { Toaster, toast } from 'sonner';
import Sidebar from '../components/sidebar'
import ContentHeader from '../components/contentHeader'
import { useState, useEffect, useMemo } from 'react'
import { sleep, useAppContext } from '../state/appContext'

import NoCreditsModal from '../components/modals/noCreditsModal'
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router'
import Pricing from '../components/pricing';
import { Config } from '../state/appContext';


export default function Docs() {
    const { updateProfile, profile, openBillingPortal} = useAppContext();
    const {push} = useRouter()
    const [feedback, setFeedback] = useState('')
    const [sending, setSending] = useState(false)
    const [upd1, setUpd1] = useState(false)
    const [annual, setAnnual] = useState(false)


   
    const onManageSubscription = async ()=>{
        setSending(true)
        await openBillingPortal()
        setSending(false)
    }

    const onEnableChange = async (val:boolean)=>{
        if (upd1){
            return
        }

        setUpd1(true)
        await updateProfile('service_enabled', val)
        setUpd1(false)
    }

    const isSubscribed = profile && profile.total_messages > 0;

    return (
        
        <Flex dir='row'>
            <Sidebar />

            <Toaster  />

            <NoCreditsModal/>

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>

                <Show below='700px'><Box height='40px' width='100%'></Box></Show>

                <ContentHeader title='Billing' />

                <Flex flexDir='column' gap={2} maxW='850px' minW='250px' width='100%' alignItems={'center'} paddingBottom='20px'>
                

                    {profile === null && <Flex gap={3} marginTop={20}>
                        <Spinner color='blue.500' />
                        <Text fontWeight='bold'>Loading profile...</Text>
                    </Flex>}


                    {isSubscribed && (
                        <Button w='220px' colorScheme='blue' isDisabled={sending} isLoading={sending} onClick={onManageSubscription} backgroundColor='black' color='white' _hover={{backgroundColor: '#2e2e2e'}}>Manage subscription</Button>
                    )}


                    {profile !== null && (
                        <>
                            <Flex width='220px' gap='5px' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'#000'} padding={2} borderRadius='8px'>
                                <Text fontSize='15px' fontWeight='semibold' color='#fff'>Service enabled</Text>
                                <Spacer />
                                {upd1 && (<Spinner size='sm' color='white' />)}
                                <Switch id='email-alerts' colorScheme='green' isChecked={profile.service_enabled} onChange={(e)=>onEnableChange(e.target.checked)} />

                            </Flex>

                        </>
                    )}

                    {profile !== null && !isSubscribed && (
                       <>
                            <Flex width='220px' gap='5px' flexDir='row' alignItems='center' justifyContent='center' marginTop={4} bgColor={'#000'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color='#fff'>Annual billing</Text>
                            <Spacer />
                            {upd1 && (<Spinner size='sm' color='white' />)}
                            <Switch id='email-alerts' colorScheme='green' isChecked={annual} onChange={(e)=>setAnnual(e.target.checked)} />

                            </Flex>
                            
                            <Flex marginTop='0px' flexDir='row' gap='10px' maxW='100%' flexWrap='wrap' alignItems='center' justifyContent='center'>
                            {Config.plans.filter(x=>x.annual === annual).map((plan:any)=>{
                                    return (<Pricing key={plan.price_id} {...plan}/>)
                            })}
                            </Flex>
                       </>
                    )}

                </Flex>
            </Flex>
        </Flex>
    )
}

