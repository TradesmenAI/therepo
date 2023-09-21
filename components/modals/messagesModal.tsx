
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Flex,
    Spinner,
    Text,
    Divider,
    useToast,
    Box,
    Textarea,
    Badge,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import { PhoneInput, usePhoneValidation } from 'react-international-phone';
import 'react-international-phone/style.css';
import { MessageData } from '../../pages/api/messages';



const VoicemailPrefix = 'voicemail-url://'

export default function MessagesModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { currentModal, setCurrentModal, modalArgs, } = useAppContext();
    const [customerPhone, setCustomerPhone] = useState('')
    const [msgs, setMsgs] = useState<MessageData[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (currentModal === 'messagesModal') {
            setCustomerPhone(modalArgs)

            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal, modalArgs])

    const fetchCalls = async (customer_number: string) => {
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer_number })
        });

        const data = await res.json();
        setMsgs(data as MessageData[])

        setLoading(false)
    }

    useEffect(() => {
        if (customerPhone) {
            setLoading(true)

            fetchCalls(customerPhone)
        }
    }, [customerPhone])

    const close = () => {
        setCustomerPhone('')
        onClose()
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={close} size='md' isCentered>
                <ModalOverlay />
                <ModalContent maxH='90%'>
                    <ModalHeader>Message history</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display='flex' flexDir='column' gap={3} overflowY='auto'>

                        {loading && (
                            <Flex width='100%' flexDir='row' gap='10px' alignItems='center' justifyContent='center' marginTop='30px' marginBottom='70px'>
                                <Spinner />
                                <Text>Loading messages...</Text>
                            </Flex>
                        )}

                        {!loading && (
                            <>
                                {msgs.map((msg, index) => {
                                    const voicemail = msg.text.startsWith(VoicemailPrefix)

                                    if (voicemail) {
                                        return (<Flex flexDir='row' key={index}>
                                            <audio src='https://api.twilio.com/2010-04-01/Accounts/AC330fa21fb5b4983f5bbdc4e84591f130/Recordings/RE9ffee241f41f69b66c95b182f6c7f894' controls></audio>
                                        </Flex>)
                                    }

                                    if (msg.direction === 'in') {
                                        return (
                                            <Flex flexDir='row' key={index}>
                                                <Flex backgroundColor="#f0f0f0" maxW="77%" px='10px' py='7px' minW='160px' borderRadius='15px' flexDir='column' gap='5px'>
                                                    <Flex><Badge variant='solid' colorScheme='blue'>Customer</Badge></Flex>
                                                    <Flex>
                                                        <Text fontSize='14px'>{msg.text}</Text>
                                                    </Flex>
                                                </Flex>
                                            </Flex>
                                        )
                                    }

                                    return (
                                        <Flex flexDir='row' key={index} justifyContent='flex-end'>
                                            <Flex backgroundColor="#dfe3ff" maxW="77%" px='10px' py='7px' minW='160px' borderRadius='15px' flexDir='column' gap='5px'>
                                                <Flex justifyContent='flex-end'><Badge variant='solid' colorScheme='red'>Bot</Badge></Flex>
                                                <Flex flexDir='row' justifyContent='flex-end'>
                                                    <Text fontSize='14px'>{msg.text}</Text>
                                                </Flex>
                                            </Flex>
                                        </Flex>
                                    )
                                })}
                            </>
                        )}


                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}