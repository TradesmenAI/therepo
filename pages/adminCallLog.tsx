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
    Badge,
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
import NoCreditsModal from '../components/modals/noCreditsModal'
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router'
import Pricing from '../components/pricing';
import { Config } from '../state/appContext';
import { CallData } from './api/calls';
import AdminSidebar from '../components/adminSideBar';

export default function CallLog() {
    const { updateProfile, profile, openBillingPortal} = useAppContext();
    const {push} = useRouter()
    const [calls, setCalls] = useState<CallData[]>([])
    const [loading, setLoading] = useState(false)

    const fetchCalls = async()=>{
        const res = await fetch('/api/allCalls', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
        });

        const data = await res.json();
        setCalls(data as CallData[])
    }

    useEffect(()=>{
        setLoading(true)
        fetchCalls()
    }, [])


    return (
        
        <Flex dir='row'>
            <AdminSidebar />

            <Toaster  />

            <NoCreditsModal/>

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>

                <Show below='700px'><Box height='40px' width='100%'></Box></Show>

                <ContentHeader title='Call log' />

                <Flex  flexDir='column' gap={2} maxW='900px' minW='250px' width='100%' alignItems={'center'} paddingBottom='20px'>
                    <TableContainer w='100%' >
                        <Table variant='striped' colorScheme='gray' size='sm'>
                            <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>From</Th>
                                <Th>To</Th>
                                <Th>User</Th>
                                <Th isNumeric>Status</Th>
                            </Tr>
                            </Thead>
                            <Tbody>

                                {calls.map((call, index)=>{
                                    const noAnswer = call.status === 'no-answer'
                                    return (
                                        <Tr key={index}>
                                            <Td>{(new Date(call.date)).toLocaleString("en-GB")}</Td>
                                            <Td>{call.from}</Td>
                                            <Td>{call.to}</Td>
                                            <Td>{call.user_id}</Td>
                                            <Td isNumeric>
                                                {noAnswer && (<Badge variant='solid' colorScheme='red'>Missed</Badge>)}
                                                {!noAnswer && (<Badge variant='solid' colorScheme='green'>Answered</Badge>)}

                                            </Td>
                                        </Tr>
                                    )
                                })}
                           
                            </Tbody>
                          
                        </Table>
                    </TableContainer>

                </Flex>
            </Flex>
        </Flex>
    )
}

