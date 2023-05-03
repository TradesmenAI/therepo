import { 
    Box,
    Flex,
    IconButton,
    Spacer,
    Text,
    Input,
    Spinner,
    useToast,
    border
} from '@chakra-ui/react'
import 
{ 
    BiPencil,
    BiCheck
} from "react-icons/bi";
import { Icon } from '@chakra-ui/react'
import { useEffect, useState } from 'react';

export default function TitleBlock(props: {title: string, value: string, isRequired:boolean, hasEdit: boolean, onValChanged:(val:string)=>Promise<boolean>}) {

    const [val, setVal] = useState(props.value);
    const [isEdit, setIsEdit] = useState(false);
    const [isUpading, setIsUpdating] = useState(false);
    const [hasError, setHasError] = useState(false);

    const toast = useToast()

    useEffect(() => {
        setVal(props.value)
    }, [props.value])

    const onEdit = () => {
        setIsEdit(true);
    };

    const onApply = async () => {
        if (props.isRequired && !val.trim()){
            setHasError(true)
            return;
        }

        setIsEdit(false);
        setIsUpdating(true);

        const res = await props.onValChanged(val.trim());

        setIsUpdating(false);

        if (!res) {
            setIsEdit(true);

            setHasError(true)

            toast({
                title: 'Update failed',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            })
        } else {
            setHasError(false)
        }
    }

    let styles = {}

    if (hasError) {
        styles = {
            border: '1px solid red'
        }
    }

    const handleChange = (event:any) => setVal(event.target.value)

    const fontSize = 16;
    return (
        <Flex  height='40px' flexDir='row' gap={5} width='100%' minW='250px' backgroundColor='#b9bccd1a' borderRadius='5px' paddingX='6px' paddingY='4px' alignItems='center' paddingLeft='15px'>
            <Text fontWeight='bold' fontSize={fontSize} width='80px'>{props.title}:</Text>
            {!isEdit && <Text fontSize={fontSize}>{val}</Text>}
            {isEdit && <Input
                value={val}
                onChange={handleChange}
                placeholder='Enter value'
                width='100%'
                size='sm'
                border='1px solid #0d73b7'
                style={styles}
            />}
            <Spacer/>
            {props.hasEdit && !isUpading && !isEdit && <IconButton onClick={onEdit} size={'sm'} aria-label='Edit value' icon={<Icon as={BiPencil} w={5} h={5} color='#757575' cursor='pointer' />} />}
            {isUpading && <Spinner size='sm' marginRight='8px'/>}
            {isEdit && <IconButton onClick={onApply} size={'sm'} aria-label='Save value' icon={<Icon as={BiCheck} w={7} h={7} color='#0d73b7' cursor='pointer' />} /> }
        </Flex>
    );  
}