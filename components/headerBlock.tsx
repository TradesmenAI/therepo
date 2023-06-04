import { 
    Box,
    Flex,
    Spacer,
    Text
} from '@chakra-ui/react'

export default function HeaderBlock() 
{
    return (
        <Flex alignItems='center' justifyContent='center' cursor='default'>
            <Text fontWeight='bold' fontSize='20px'>Tradesmen <span className="text-blue-500">AI</span></Text>
        </Flex>
    )
}