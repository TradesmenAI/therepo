import { 
    Box,
    Flex,
    Spacer,
    Text,
    Button,

} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { Icon } from '@chakra-ui/react'


export default function SidebarButton(props: { key: any, label: string, icon: any, url: string, onClick?:()=>void})
{
    const router = useRouter();

    const clickHandler = () => {
        if (props.onClick){
            props.onClick();
        } else {
            router.replace(props.url);
        }
    };

    const isOpened = router.pathname === props.url;
    const bgColor = isOpened ? '#5b5e731a': 'none';

    return (
        <Flex onClick={clickHandler} backgroundColor={bgColor} alignItems='center' padding='6px' gap='10px' _hover={{backgroundColor: '#5b5e731a'}} borderRadius='5px' cursor='pointer' fontSize='16px'>
            <Icon as={props.icon} w={4} h={4} color='#4d4b4b' marginLeft='10px' />
            {props.label}
        </Flex>
    )
}