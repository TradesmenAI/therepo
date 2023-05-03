import { 
    Box,
    Flex,
    Text
} from '@chakra-ui/react'

export default function ContentHeader(props: {title: string})
{
    return (
        <Flex justifyContent='center' alignItems='center' width='100%' >
            <Text fontWeight='bold' fontSize='20px'>{props.title}</Text>
        </Flex>
    )
}