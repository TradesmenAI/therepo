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
import { useState } from 'react'
import { useAppContext } from '../state/appContext'

export interface PricingProps {
    color:string,
    price:number,
    tierName:string,
    replies: number,
    price_id:string
}

export default function Pricing(props:PricingProps) {
    const [disabled, setDisabled] = useState(false)
    const {profile, purchaseInProgress, subscribe} = useAppContext()

    const onBuy = async()=>{
        if (purchaseInProgress){
            return;
        }

        setDisabled(true)

        await subscribe(props.price_id)
    }

    // const isCurrent = profile !== null && profile.total_messages === props.replies;
    const isCurrent = profile !== null && profile.subscription_status === props.price_id;

    return (
        <Flex position='relative' mb={5} gap={0} flexDir='column' alignItems='center' w='250px' h='295px' bgColor='rgb(246, 248, 250)'  borderRadius='8px'>
            <Flex backgroundColor={props.color} w='100%' borderRadius='8px 8px 0 0' height='60px' alignItems='center' justifyContent='center'>
                <Text color='white' align={'center'} width='100%' fontWeight='bold' fontSize='25'>{props.tierName}</Text>
            </Flex>

            <Text align={'center'} width='100%' fontWeight='bold' mt='10px' fontSize='18px'>{props.replies} AI replies / month</Text>

            {isCurrent && (
                <Flex position='absolute' top='-20px' background='blue.500' border='1px solid white' borderRadius='15px' width='130px' height='30px' textAlign='center' alignItems='center' justifyContent='center'>
                    <Text color='white' fontWeight='normal'>Current plan</Text>
                </Flex>
            )}
            

            <Flex flexDir='column' paddingY='20px' paddingX='10px'>
            <Flex flexDir='row' w='100%' alignItems='center' paddingX='10px' paddingY='5px' gap='7px' justifyContent='flex-start'>
                <Box w={'5px'} h={'5px'} backgroundColor='black' flexShrink={0}/>
                <Box>AI Assistant</Box>
            </Flex>

            <Flex flexDir='row' w='100%' alignItems='center' paddingX='10px' paddingY='5px' gap='7px' justifyContent='flex-start'>
                <Box w={'5px'} h={'5px'} backgroundColor='black' flexShrink={0}/>
                <Box>Auto messages when you are not available</Box>
            </Flex>

            </Flex>
            {/* <Text mt={3} align={'center'} width='100%'  fontSize='16px' color='#575757'>1 document upload - 2 credits</Text>
            <Text align={'center'} width='100%'  fontSize='16px' color='#575757'>1 document question - 1 creditn</Text>
             */}
             {!isCurrent && (
                    <Button disabled={(disabled || profile === null)} isLoading={disabled} onClick={onBuy} colorScheme='blue' mt={4} w='90%' mb='10px'>£{props.price} / month</Button>
             )}
        </Flex>
    )
}