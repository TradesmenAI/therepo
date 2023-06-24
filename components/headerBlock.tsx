import { 
    Box,
    Flex,
    Spacer,
    Text
} from '@chakra-ui/react'
import Image from 'next/image'

export default function HeaderBlock() 
{
    return (
        <Flex alignItems='center' justifyContent='center' cursor='default'>
            <Image src='/image/logo_1.png' alt='logo' width={200} height={200} />
            {/* <Text fontWeight='bold' fontSize='20px'>Tradesmen <span className="text-blue-500">AI</span></Text> */}
        </Flex>
    )
}