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
    BiMenu
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


export default function Sidebar()
{
    const supabase = useSupabaseClient()
    let router= useRouter()
    const {setCurrentModal, purchaseCredits, purchaseInProgress, profile} = useAppContext();
    const {purchaseResult, session_id} = router.query
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        if (purchaseResult === 'error'){
            toast({
                title: 'Failed to complete a purchase',
                status: 'error',
                position: 'top',
                duration: 5000,
                isClosable: true,
            })

            router.replace(router.pathname);
        }

        if (purchaseResult === 'success'){
            toast({
                title: 'Payment successful',
                status: 'success',
                position: 'top',
                duration: 5000,
                isClosable: true,
            })

            router.replace(router.pathname);
        }
    }, [purchaseResult])

    const data = [
        {
            label: 'Dashboard',
            icon: BiListUl,
            url: '/app'
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

    const onBuyCredits = async() => {
        if (purchaseInProgress){
            return;
        }

        await purchaseCredits(25)
    }

    let credits = null;
    if (profile){
        credits = profile.credits.toString()
    }

   

    return (
        <>

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
                                return  <Box key={index} cursor='pointer' onClick={() => {
                                    router.replace(item.url)
                                    onClose()
                                }}>
                                            <Text fontWeight='bold' fontSize='18px'>{item.label}</Text>
                                        </Box>
                                // return <SidebarButton label={item.label} icon={item.icon} key={index} url={item.url} />
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
                    {/* <Text align='center'>{credits?credits:<Spinner size="sm"/>} Credits</Text>
                    <Button onClick={onBuyCredits} colorScheme='orange' color='white'>{!purchaseInProgress ? 'Buy credits':<Spinner/>}</Button> */}
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
                    <Text marginRight='25px' fontWeight='bold' fontSize='18px'>Chat with <span className="text-blue-500">Docs</span></Text>
                </Flex>
            
            </Show>
        
        </>
        
    )
}