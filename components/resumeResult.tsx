import { 
    Box,
    Flex,
    Image,
    Spacer,
    Accordion,
    Button,
    useDisclosure,
    Spinner,
    Text,
    Divider
} from '@chakra-ui/react'
import Sidebar from '../components/sidebar'
import ContentHeader from '../components/contentHeader'
import 
{ 
    BiAddToQueue,
    BiLayer,
    BiArrowToBottom,
    BiLibrary,
    BiDetail
} from "react-icons/bi";
import { Icon } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../state/appContext'
import { withPageAuth } from '@supabase/auth-helpers-nextjs'
import { uuidv4 } from '../utils';
import { useToast } from '@chakra-ui/react'
import AddResumeModal from '../components/modals/addResumeModal';
import { ResumeRequest } from '../state/types';


interface Props {
    data:ResumeRequest
}

export default function ResumeResult(props:Props) {
    const item = props.data;
    const hasFile = item.resumeUrl !== undefined;

    const showDesc = () => {
        if (item.description) {
            alert(item.description)
        }

        if (item.descriptionUrl) {
            alert(item.descriptionUrl)
        }
    }

    const downloadResume = async() => {

    }

    return (

        <Flex height='38px' gap={1} flexDir='row' border='1px solid #dedede' borderRadius='5px' alignItems='center'>
        <Text marginLeft='10px' fontWeight='bold'>{item.title}</Text>
        <Spacer/>

        <Button onClick={showDesc} leftIcon={<BiDetail />} colorScheme='blackAlpha' variant='outline' size='xs' borderRadius='5px' height='28px' color='black'>Description</Button>

        {!hasFile && (
            <Flex flexDir='row' gap={2} alignItems='center' padding='0 10px 0 10px' borderRadius='0 5px 5px 0' height='100%'>
                <BiLibrary/>
                <Text fontSize='14px' color='black'>Status: queued</Text>
            </Flex>
        )}
       
       {hasFile && (<Button onClick={downloadResume} leftIcon={<BiArrowToBottom />} colorScheme='blackAlpha' size='xs' backgroundColor='black' marginRight='5px' height='28px'>Download</Button>)}
    </Flex>

    )
}