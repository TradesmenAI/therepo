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
import AdminSidebar from '../components/adminSideBar';
import NoCreditsModal from '../components/modals/noCreditsModal'
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router'
import Pricing from '../components/pricing';
import { Config } from '../state/appContext';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
  } from '@chakra-ui/react'
import { UserData } from './api/listUsers';
import EditUserModal from '../components/modals/editUserModal';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'


export default function Docs() {
    const { updateProfile, profile, getUsersList, setCurrentModal, currentModal, setModalArgs} = useAppContext();
    const {push} = useRouter()
    const [users, setUsers] = useState<UserData []>([]);
    const session = useSession()
    let router = useRouter()

    useEffect(()=>{
        if (profile && profile.is_admin && users.length === 0){
            (async()=>{
                setUsers(await getUsersList())
            })()
        }
    }, [profile, users])

    useEffect(()=>{
        if (currentModal === 'refresh'){
            setCurrentModal(null)
            setUsers([])
        }
    }, [currentModal, setCurrentModal])

  
    if (!profile){
        return (<>
            <Modal onClose={()=>{}} size='full' isOpen={true}>
                <ModalOverlay />
                <ModalContent>
                <ModalBody alignItems='center' justifyContent='center' display='flex' gap='10px'>
                    <Spinner/> Loading...
                </ModalBody>
                </ModalContent>
            </Modal>
        </>)
    }

    const isAdmin = profile && profile.is_admin;

    if (!isAdmin){
        push('/app')
        return
    }

    const onEditUser = async(uid:string)=>{
        const user = users.find(x=>x.uid === uid)
        setModalArgs({user})
        setCurrentModal('editUserModal')
    }

    return (
        
        <Flex dir='row'>
            <AdminSidebar />

            <Toaster  />

            <EditUserModal/>

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>
                <Show below='700px'><Box height='40px' width='100%'></Box></Show>
                <ContentHeader title='Admin dashboard' />

                <Flex  flexDir='column' gap={2} maxW='100%' minW='250px' width='100%' alignItems={'center'} paddingBottom='20px'>

                    {users.length === 0 && (
                        <Flex alignItems='center' justifyContent='center' display='flex' gap='10px'>
                            <Spinner/> Loading users...
                        </Flex>
                    )}
                    <TableContainer w='100%' >
                        <Table variant='striped' colorScheme='gray' size='sm'>
                            <Thead>
                            <Tr>
                                <Th>Edit</Th>
                                <Th>Email</Th>
                                <Th>Phone</Th>
                                <Th>Business</Th>
                                <Th>Virtual phone</Th>
                                <Th>Subscription</Th>
                                <Th>Created at</Th>
                                <Th>User details</Th>
                                <Th>Prompt</Th>
                                <Th>Intro message</Th>
                                {/* <Th>Fail message</Th> */}
                            </Tr>
                            </Thead>
                            <Tbody>
                            
                            {users.map((user, index)=>{
                                let subTier = ''
                                if (user.subscsription){
                                    const plan = Config.plans.find(x=>x.price_id === user.subscsription)
                                    if (plan){
                                        subTier = plan.tierName
                                    }
                                }
                                let details = user.details?user.details:''
                                let prompt = user.prompt?user.prompt:''
                                let fail_msg = user.bot_fail_message?user.bot_fail_message:''
                                let business_type = user.business_type?user.business_type:''
                                let intro_msg = user.bot_intro_message?user.bot_intro_message:''

                                return (
                                    <Tr key={user.uid} >
                                        <Td><Button colorScheme='blue' size='sm' onClick={()=>onEditUser(user.uid)}>Edit</Button></Td>

                                        <Td>{user.email}</Td>
                                        <Td>{user.phone}</Td>
                                        <Td>{business_type}</Td>
                                        <Td>{user.twilio_phone}</Td>
                                        <Td>{subTier}</Td>
                                        <Td>{(new Date(user.register_date)).toLocaleDateString("en-GB")}</Td>
                                        
                                        <Td minW='180px' h='80px' p='5px'>
                                            <Textarea  w='100%' h='100%' resize='none' disabled textColor='black' style={{opacity: 1, cursor: 'default', padding: '3px'}} border='1px solid #cccccc'>
                                                {details}
                                            </Textarea>
                                        </Td>

                                        <Td minW='180px' h='80px' p='5px'>
                                            <Textarea w='100%' h='100%' resize='none' disabled textColor='black' style={{opacity: 1, cursor: 'default', padding: '3px'}} border='1px solid #cccccc'>
                                                {prompt}
                                            </Textarea>
                                        </Td>

                                        <Td minW='180px' h='80px' p='5px'>
                                            <Textarea w='100%' h='100%' resize='none' disabled textColor='black' style={{opacity: 1, cursor: 'default', padding: '3px'}} border='1px solid #cccccc'>
                                                {intro_msg}
                                            </Textarea>
                                        </Td>

                                        {/* <Td minW='180px' h='80px' p='5px'>
                                            <Textarea w='100%' h='100%' resize='none' disabled textColor='black' style={{opacity: 1, cursor: 'default', padding: '3px'}} border='1px solid #cccccc'>
                                                {fail_msg}
                                            </Textarea>
                                        </Td> */}

                                    </Tr>
                                )
                            })}

                          
                            

                            </Tbody>
                            {/* <Tfoot>
                            <Tr>
                                <Th>To convert</Th>
                                <Th>into</Th>
                                <Th isNumeric>multiply by</Th>
                            </Tr>
                            </Tfoot> */}
                        </Table>
                    </TableContainer>

                </Flex>
            </Flex>
        </Flex>
    )
}

