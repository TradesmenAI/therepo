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
            <Text fontWeight='bold' fontSize='20px'>Chat with <span className="text-blue-500">Docs</span></Text>
        </Flex>
    )
}