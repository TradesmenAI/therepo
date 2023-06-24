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
import {
    List,
    ListItem,
    ListIcon,
    OrderedList,
    UnorderedList,
} from '@chakra-ui/react'

export interface PricingProps {
    color:string,
    price:number,
    tierName:string,
    replies: number,
    price_id:string,
    txt:string
    btnText:string
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
        <Flex position='relative' mb={5} gap={0} flexDir='column' alignItems='center' w='230px' h='295px' bgColor='rgb(0,0,0)' color='white' border='3px solid #B0F127'  borderRadius='8px'>
            <Flex w='100%' borderRadius='8px 8px 0 0' height='60px' alignItems='center' justifyContent='center'>
                <Text color='white' align={'center'} width='100%' fontWeight='bold' fontSize='25'>{props.tierName}</Text>
            </Flex>

            <Text align={'center'} width='100%' fontWeight='bold' mt='10px' fontSize='24px'>£{props.price}</Text>
            {/* <Text align={'center'} width='100%' fontWeight='bold' mt='10px' fontSize='18px'>{props.replies} AI replies / month</Text> */}

            {/* {isCurrent && (
                <Flex position='absolute' top='-20px' background='blue.500' border='1px solid white' borderRadius='15px' width='130px' height='30px' textAlign='center' alignItems='center' justifyContent='center'>
                    <Text color='white' fontWeight='normal'>Current plan</Text>
                </Flex>
            )} */}

            <Box p='10px'>
               <UnorderedList>
                    <ListItem><span style={{color: '#B0F127'}}>{props.replies}</span> AI replies / month</ListItem>
                    <ListItem><span style={{color: '#B0F127'}}>{props.txt}</span></ListItem>
                    <ListItem>Full AI capabilities</ListItem>
                    <ListItem>Phone number included</ListItem>
                    <ListItem>Portal access</ListItem>
                </UnorderedList>
            </Box>
            

            {/* <Text mt={3} align={'center'} width='100%'  fontSize='16px' color='#575757'>1 document upload - 2 credits</Text>
            <Text align={'center'} width='100%'  fontSize='16px' color='#575757'>1 document question - 1 creditn</Text>
             */}
             {!isCurrent && (
                    <Button disabled={(disabled || profile === null)} isLoading={disabled} onClick={onBuy} backgroundColor={'#B0F127'} _hover={{backgroundColor: '#B0F127'}} borderRadius={'20px'} mt={2} w='70%' mb='15px'>{props.btnText}</Button>
             )}
        </Flex>
    )
}