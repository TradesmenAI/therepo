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
    FormControl,
    FormLabel
} from '@chakra-ui/react'
import { Show, Hide } from '@chakra-ui/react'
import { Toaster, toast } from 'sonner';
import Sidebar from '../components/sidebar'
import ContentHeader from '../components/contentHeader'
import TitleBlock from '../components/titleBlock'
import { useState, useEffect, useMemo } from 'react'
import { sleep, useAppContext } from '../state/appContext'
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
import FieldWithRename from '../components/fieldWithRename';
import { Switch } from '@chakra-ui/react'
import Pricing from '../components/pricing';


export default function App() {
    const {openBillingPortal, profile, updateProfile} = useAppContext();
    const session = useSession()
    const {push} = useRouter()
    const [businessPhone, setBusinessPhone] = useState('-')
    const [redirect, setRedirect] = useState(false)
    const [introMsg, setIntroMsg] = useState('')


    useEffect(()=>{
        if (profile) {
            setBusinessPhone(profile.business_number)
            setIntroMsg(profile.bot_intro_message)
        }
    }, [profile])

    const onUpdatePhone = async(val:string)=>{
        await updateProfile('business_number', val)
        return true
    }

    const onUpdateMessage = async(val:string)=>{
        await updateProfile('bot_intro_message', val)
        return true
    }

    const onValidatePhone = (val:string)=>{
        return true
    } 

    useEffect(()=>{
        if (!session){
          push('/');
        } 
      }, [session])
    



    const onUpgrage = async()=>{
        if (profile.total_messages === 0) {
            push('/billing');
        } else {
            setRedirect(true)
            await openBillingPortal()
        }
    }


    return (
        
        <Flex dir='row'>
            <Sidebar />

            <Toaster  />

            <NoCreditsModal/>

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>

                <Show below='700px'><Box height='40px' width='100%'></Box></Show>

                <ContentHeader title='Dashboard' />

                {/* <Flex flexDir='column' gap={2} maxW='100%' minW='250px' width='100%' alignItems={'center'}>
                    
                </Flex> */}

                <Flex flexDir='column' gap={2} maxW='450px' minW='250px' width='100%' alignItems={'center'}>
                    

                    {profile === null && <Flex gap={3} marginTop={20}>
                        <Spinner color='blue.500' />
                        <Text fontWeight='bold'>Loading profile...</Text>
                    </Flex>}

                    {profile !== null && (<>

                        
                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'black'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'white'}>Virtual phone number</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='normal' color={'white'}>
                            {profile.twilio_number}
                            </Text>
                            <Icon as={BiCopy} w={5} h={5} color='white' cursor='pointer' marginLeft='10px' onClick={()=> {
                                navigator.clipboard.writeText(profile.twilio_number)
                                toast.success('Phone Copied')
                            }} />
                            
                        </Flex>

                        <Flex width='100%' bgColor={'black'} gap='10px' flexDir='row' alignItems='center' justifyContent='center' marginTop={1} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'white'}>Messages/month</Text>
                            <Spacer />
                            <Button isDisabled={redirect} isLoading={redirect} size='xs' colorScheme='green' backgroundColor='#B0F127' _hover={{backgroundColor: '#94d10f'}}  color='black' onClick={onUpgrage}>Upgrade ⚡️</Button>
                            <Text fontSize='15px' fontWeight='bold' color={'white'}>
                                {profile.total_messages}
                            </Text>
                        </Flex>

                        <Flex width='100%' bgColor={'black'} flexDir='row' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'white'}>Messages left</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='bold' color={'white'}>
                                {profile.messages_left}
                            </Text>
                        </Flex>


                        <Flex width='100%' bgColor={'black'} flexDir='row' alignItems='center' justifyContent='center' marginTop={2}  padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'white'}>Your phone</Text>
                            <Spacer />
                            <FieldWithRename value={businessPhone} onUpdate={onUpdatePhone} onValidate={onValidatePhone} />
                        </Flex>

                        <Flex width='100%' bgColor={'black'} flexDir='row' alignItems='center' justifyContent='center' marginTop={2}  padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'white'}>* Bot intro message</Text>
                            <Spacer />
                            <FieldWithRename value={introMsg} onUpdate={onUpdateMessage} onValidate={onValidatePhone} />
                        </Flex>
                        <Text fontSize='14px' mt='-5px' fontWeight='bold' fontStyle='italic'>* We recommend leaving this as default</Text>


                    
                    </>)}

                </Flex>
            </Flex>
        </Flex>
    )
}

