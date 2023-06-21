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
    useDisclosure,
    Textarea,
    Switch
} from '@chakra-ui/react'
import { Show, Hide } from '@chakra-ui/react'
import { Toaster, toast } from 'sonner';
import Sidebar from '../components/sidebar'
import ContentHeader from '../components/contentHeader'
import { useState, useEffect, useMemo, useRef } from 'react'
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
  import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
  } from '@chakra-ui/react'
import { Business } from './api/businesses';
import EditBusinessModal from '../components/modals/editBusinessModal';



export default function BusinessPage() {
    const { updateProfile, profile, getUsersList, setCurrentModal, currentModal, setModalArgs} = useAppContext();
    const {push} = useRouter()
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteId, setDeleteId] = useState(-1)
    const [p, setP] = useState('')
    const [s, setS] = useState(false)
    const [m, setM] = useState('')

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef<HTMLButtonElement>(null)

    const fetchBusinesses = async()=>{
        setLoading(true)

        const res = await fetch('/api/businesses', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
        });

        const data = await res.json();
        setBusinesses(data as Business[])

        setLoading(false);
    }

    const fetchPrompt = async()=>{
        const res = await fetch('/api/genericPrompt', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await res.json();

        setP(data.value)
    }

    const savePrompt = async()=>{
        setS(true)

        const res = await fetch('/api/genericPrompt', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({value: p})
        });

        setS(false)
    }

    const fetchMsg = async()=>{
        const res = await fetch('/api/genericMessage', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await res.json();
        setM(data.value)
    }

    const saveMsg = async()=>{
        setS(true)

        const res = await fetch('/api/genericMessage', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({value: m})
        });

        setS(false)
    }

    useEffect(()=>{
       if (profile && profile.is_admin){
            fetchBusinesses()
            fetchPrompt()
            fetchMsg()
       }
      }, [profile])

      useEffect(()=>{
        if (currentModal === 'refreshBusiness'){
            setCurrentModal(null)
            fetchBusinesses()
        }
    }, [currentModal, setCurrentModal])


    // useEffect(()=>{
    //     if (profile && profile.is_admin){
    //         (async()=>{
    //             setUsers(await getUsersList())
    //         })()
    //     }
    // }, [profile, users])

    const onDelete = async()=>{
        setDeleting(true)

        const res = await fetch(`/api/businesses/${deleteId}`, {
            method: 'DELETE'
        });

        await fetchBusinesses()

        setDeleting(false)

        onClose()
    }



    if (!profile || !profile.is_admin){
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

    const onEdit = async(id:number)=>{
        const bs = businesses.find(x=>x.id === id)
        setModalArgs(bs)
        setCurrentModal('editBusinessModal')
    }


    return (
        
        <Flex dir='row'>
            <AdminSidebar />

            <Toaster  />

            <EditBusinessModal/>

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>
                <Show below='700px'><Box height='40px' width='100%'></Box></Show>
                <ContentHeader title='Businesses' />

               <Flex flexDir='column' width='100%' gap={2}>
                    <Text>Prompt ({`{{jobs}}`} will be replaced with user-selected jobs )</Text>
                    <Textarea value={p} onChange={(e)=>setP(e.target.value)}/>
                    <Button size={'sm'} colorScheme='blue' w='100px' isDisabled={s} isLoading={s} onClick={savePrompt}>Save</Button>
               </Flex>

               <Flex flexDir='column' width='100%' gap={2}>
                    <Text>Default bot message</Text>
                    <Textarea value={m} onChange={(e)=>setM(e.target.value)}/>
                    <Button size={'sm'} colorScheme='blue' w='100px' isDisabled={s} isLoading={s} onClick={saveMsg}>Save</Button>
               </Flex>


                <Flex flexDir='row' width='100%'>
                    <Button size='sm' onClick={()=>{
                        setModalArgs(null)
                        setCurrentModal('editBusinessModal')
                    }} colorScheme='green'>Add business</Button>
                </Flex>

                <Flex  flexDir='column' gap={2} maxW='100%' minW='250px' width='100%' alignItems={'center'} paddingBottom='20px'>
                    <TableContainer w='100%' >
                        <Table variant='striped' colorScheme='gray' size='sm'>
                            <Thead>
                            <Tr>
                                <Th>Name</Th>
                                {/* <Th>Prompt</Th>
                                <Th>Intro message</Th>
                                <Th>Message</Th> */}
                                <Th  textAlign='center'>Edit</Th>
                                <Th  textAlign='center'>Delete</Th>
                            </Tr>
                            </Thead>
                            <Tbody>
                            
                            {businesses.map((bs, index)=>{
                                
                                return (
                                    <Tr key={bs.id} >
                                        <Td>{bs.name}</Td>
                                        {/* <Td>{bs.prompt}</Td>
                                        <Td>{bs.intro_msg}</Td>

                                        <Td>{bs.msg}</Td> */}
                                        <Td width='60px' isNumeric><Button colorScheme='blue' size='sm' onClick={()=>onEdit(bs.id)}>Edit</Button></Td>
                                        <Td width='100px' isNumeric>
                                           {bs.id !== Config.otherBusinessId && (
                                                <Button colorScheme='red' size='sm' onClick={()=>{
                                                    setDeleteId(bs.id)
                                                    onOpen()
                                                }}>Delete</Button>
                                           )}
                                        </Td>
                                    </Tr>
                                )
                            })}

                            </Tbody>
                          
                        </Table>
                    </TableContainer>

                </Flex>
            </Flex>


            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                    Delete business
                    </AlertDialogHeader>

                    <AlertDialogBody>
                    Are you sure? You can not undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose} isDisabled={deleting}>
                        Cancel
                    </Button>
                    <Button colorScheme='red' onClick={onDelete} isDisabled={deleting} isLoading={deleting} ml={3}>
                        Delete
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>



        </Flex>
    )
}

