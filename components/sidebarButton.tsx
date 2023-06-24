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
    const bgColor = isOpened ? '#303030': 'none';

    return (
        <Flex onClick={clickHandler} backgroundColor={bgColor} style={{color: 'white'}} alignItems='center' padding='6px' gap='10px' _hover={{backgroundColor: '#303030'}} borderRadius='5px' cursor='pointer' fontSize='16px'>
            <Icon as={props.icon} w={4} h={4} color='#B0F127' marginLeft='10px' />
            {props.label}
        </Flex>
    )
}