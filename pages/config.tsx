import { 
    Box,
    Flex
} from '@chakra-ui/react'
import Sidebar from '../components/sidebar'


export default function Config() {
    return (
        <Flex dir='row'> 
           <Sidebar/>
        </Flex>
    );
}