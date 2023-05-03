import {
    Box,
    Flex,
    Image,
    Spacer,
    Text,
    useDisclosure,
    Button,
    Spinner,
    UnorderedList,
    ListItem
} from '@chakra-ui/react'
import {
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react'
import { ToastContainer, toast } from 'react-toastify';
import {
BiPencil,
BiTrashAlt,
BiLockOpenAlt,
BiChevronUp,
BiChevronDown,
} from "react-icons/bi";
import { Icon } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../state/appContext';
import { uuidv4, selectFile } from '../utils'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react'
import 'react-toastify/dist/ReactToastify.css';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { JobCompany } from '../state/types';
import { format } from 'date-fns'

export interface JobDetailsBlockProps {
    details: string,
    id: number
}


export default function JobDetailsBlock(props: JobDetailsBlockProps) {
    const [isHover, setHover] = useState(false);

    const onDelete = async () => {

    }

    return (
        <Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} cursor='text'>
            <ListItem>
                <Flex flexDir='row' alignItems='center' justifyContent='center' _hover={{ backgroundColor: '#f7f7f7' }} marginBottom='5px' padding='3px' borderRadius='5px'>
                    <Text>{props.details}</Text>
                    <Spacer />
                    {isHover && (
                        <Flex cursor='pointer' onClick={(e) => { onDelete(); e.preventDefault(); }}
                            backgroundColor='#f26157'
                            width='25px'
                            height='25px'
                            marginLeft='10px'
                            borderRadius='5px'
                            alignItems='center'
                            justifyContent='center'
                            color='white'>
                            {/* <Icon as={BiTrashAlt} w={4} h={4} color='#ffffff' /> */}
                            X
                        </Flex>
                    )}
                </Flex>
            </ListItem>
        </Box>
    )
}