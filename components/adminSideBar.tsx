'use client';

import { 
    Flex,
    Spacer,
    Divider,
    Button,
    Spinner,
    useToast,
    Text,
    IconButton,
    Box,
    useDisclosure,
    CloseButton
} from '@chakra-ui/react'
import { Show, Hide } from '@chakra-ui/react'
import SidebarButton from './sidebarButton'
import 
{ 
    BiBarChartAlt,
    BiCategory,
    BiListUl,
    BiCodeAlt,
    BiPencil,
    BiLayer,
    BiLogOut,
    BiImages,
    BiMenu,
    BiBookAlt,
    BiWalletAlt
} from "react-icons/bi";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import HeaderBlock from './headerBlock';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import { useAppContext } from '../state/appContext';
import { useEffect } from 'react';
import NoCreditsModal from './modals/noCreditsModal';
import { Toaster, toast } from 'sonner';
import useLocalStorage from "use-local-storage";

export default function AdminSidebar()
{
    const supabase = useSupabaseClient()
    let router= useRouter()
    const {profile, setCurrentModal, subscribe} = useAppContext();
    const {purchaseResult} = router.query
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [plan, setPlan] = useLocalStorage("buyPlan", "");

    useEffect(() => {
        if (purchaseResult === 'error'){
            toast.error('Failed to complete a purchase')
            router.replace(router.pathname);
        }

        if (purchaseResult === 'success'){
            toast.success('Payment successful')
            router.replace(router.pathname);
        }
    }, [purchaseResult])

    useEffect(()=>{
        if (profile){
            if (!profile.business_number || profile.business_number.length === 0){
                setCurrentModal('enterPhoneModal')
            } else {
                if (plan){
                    setPlan("")
                    console.log('Found buy plan: ' + plan)
                    subscribe(plan)
                    localStorage.removeItem('buyPLan');
                }
            }
        }
    }, [profile])



    const data = [
        {
            label: 'Dashboard',
            icon: BiListUl,
            url: '/admin'
        }
    ]

    const signOut = async() => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error(`Failed to sign out: error ${error}`)
        } else {
            router.push('/')
        }
    }


    return (
        <>
            <Toaster richColors position="bottom-right" />
            <NoCreditsModal/>
            {isOpen && (
                <Flex backgroundColor='white'
                    position='fixed'
                    width='100%'
                    height='100%'
                    zIndex='3'
                    flexDir='column'
                    paddingX='10px'>
                        <Flex flexDir='row' paddingY='10px'>
                            <CloseButton onClick={onClose}/>
                            <Spacer/>
                        </Flex>

                        <Flex flexDir='column' gap='10px' alignItems='center'>
                        <>

                            {data.map((item, index) => {
                                return  (<Box key={index} cursor='pointer' onClick={() => {
                                            router.replace(item.url)
                                            onClose()
                                        }}>
                                            <Text fontWeight='bold' fontSize='18px'>{item.label}</Text>
                                        </Box>)
                            })}
                        </>
                        </Flex>
                </Flex>
            )}

            <Show above='700px'>
                <Flex width='230px' height='100vh' backgroundColor='#f2f3f5' flexDir='column' padding='10px' gap='10px'>
                    <HeaderBlock/>
                    <Divider borderColor='#bdbbbb'/>
                    
                    <>
                        {data.map((item, index) => {
                            return <SidebarButton label={item.label} icon={item.icon} key={index} url={item.url} />
                        })}
                    </>

                    <Spacer/>
                  
                    <Divider borderColor='#bdbbbb'/>
                    <SidebarButton onClick={signOut} label='Sign out' key={9999} icon={BiLogOut} url='/'  />


                    
                </Flex>
            </Show>



            <Show below='700px'>
                <Flex
                    backgroundColor='#f8f8fa'
                    height='40px'
                    width='100%'
                    position='fixed'
                    top='0'
                    zIndex='2'
                    alignItems='center'
                >
                    <Flex onClick={onOpen}  height='40px'  alignItems='center' justifyContent='center' paddingLeft='15px'>
                        <BiMenu size={30}/>
                    </Flex>

                    <Spacer/>
                    <Text marginRight='25px' fontWeight='bold' fontSize='18px'>Callback <span className="text-blue-500">Wizard</span></Text>
                </Flex>
            
            </Show>
        
        </>
        
    )
}