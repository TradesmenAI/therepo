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
    // const session = useSession()
    const {push} = useRouter()
    const [businessPhone, setBusinessPhone] = useState('-')
    const [redirect, setRedirect] = useState(false)


    useEffect(()=>{
        if (profile) {
            setBusinessPhone(profile.business_number)
        }
    }, [profile])

    const onUpdatePhone = async(val:string)=>{
        await updateProfile('business_number', val)
        return true
    }

    const onValidatePhone = (val:string)=>{
        return true
    } 



    const onUpgrage = async()=>{
        setRedirect(true)
        await openBillingPortal()
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

                        
                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Virtual phone number</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='normal'>
                            {profile.twilio_number}
                            </Text>
                            <Icon as={BiCopy} w={5} h={5} color='#4F4F4F' cursor='pointer' marginLeft='10px' onClick={()=> {
                                navigator.clipboard.writeText(profile.twilio_number)
                                toast.success('Phone Copied')
                            }} />
                            
                        </Flex>

                        <Flex width='100%' gap='10px' flexDir='row' alignItems='center' justifyContent='center' marginTop={1} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Messages/month</Text>
                            <Spacer />
                            <Button isDisabled={redirect} isLoading={redirect} size='xs' colorScheme='twitter' onClick={onUpgrage}>Upgrade ⚡️</Button>
                            <Text fontSize='15px' fontWeight='bold'>
                                {profile.total_messages}
                            </Text>
                        </Flex>

                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Messages left</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='bold'>
                                {profile.messages_left}
                            </Text>
                        </Flex>


                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'rgb(246, 248, 250)'} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold'>Your phone</Text>
                            <Spacer />
                            <FieldWithRename value={businessPhone} onUpdate={onUpdatePhone} onValidate={onValidatePhone} />
                        </Flex>




                    
                    </>)}

                </Flex>
            </Flex>
        </Flex>
    )
}

