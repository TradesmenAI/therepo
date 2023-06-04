import { useState, useEffect } from "react"
import { 
    Flex,
    Text,
    Icon,
    Input,
    useToast,
    Spinner,
    Spacer,
    Box
} from "@chakra-ui/react"
import 
{ 
    BiPencil,
    BiCheck,
    BiX,
} from "react-icons/bi";


export type Props = {
    value:string,
    onUpdate:(newValue:string) => Promise<boolean>,
    onValidate: (newValue:string) => boolean,
    inputType?:string
}

export default function FieldWithRename(props:Props) {
    const [isUpdating, setIsUpating] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [hasError, setHasError] = useState<boolean>(false)
    const [value, setValue] = useState<string>(props.value)
    const toast = useToast()
    const [isHover, setHover] = useState(false);

    const handleChange = (event:any) => {
        const newVal = event.target.value

        setHasError(!props.onValidate(newVal))
        setValue(newVal)
    }

    const onEdit = async() => {
        setHasError(false)
        setValue(props.value)
        setIsEdit(true)
    }

    const onSave = async() => {
        if (isUpdating) {
            return;
        }
        
        if (hasError) {
            toast({
                title: 'Wrong value',
                status: 'error',
                position: 'bottom',
                duration: 2200,
                isClosable: true,
              })
            return
        }

        if (value === props.value){
            setIsEdit(false)
            return
        }

        setIsUpating(true)
        if (!await props.onUpdate(value)){
            toast({
                title: 'Failed to update',
                status: 'error',
                position: 'top',
                duration: 3500,
                isClosable: true,
            })
        }

        setIsUpating(false)
        setIsEdit(false)
    }

    const onCancel = async() => {
        setIsEdit(false)
    }

    let inputType = 'text'
    if (props.inputType){
        inputType = props.inputType
    }

    const onStartEdit = () => {
        if (isEdit || isUpdating) {
            return;
        }

        onEdit();
    }

    return (
        <Flex onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} flexDir='row' alignItems='center' gap='10px' cursor='text' onClick={onStartEdit} _hover={{backgroundColor: '#f8f8f8'}} borderRadius='5px'>
            {!isEdit && (
                <>
                    <Text >{props.value}</Text>
                    <Spacer/>
                    <Flex onClick={onEdit} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' >
                            <Icon as={BiPencil} w={4} h={4} color='black' />
                        </Flex>
                </>
            )}

            {isEdit && (
                <>
                    <Input isDisabled={isUpdating} placeholder='...' isInvalid={hasError} type={inputType}  height='30px' value={value} onChange={handleChange}   focusBorderColor={hasError?'#d42e22':'#49b9de'} onKeyPress={e=> {
                                    if (e.key === 'Enter') {
                                        onSave()
                                    }
                                }} />
                
                    {!isUpdating && (
                        <>
                            <Flex onClick={onSave} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' _hover={{backgroundColor: '#eeeeee'}}>
                                    <Icon as={BiCheck} w={4} h={4} color='green' />
                            </Flex>

                            <Flex onClick={onCancel} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' _hover={{backgroundColor: '#eeeeee'}}>
                                <Icon as={BiX} w={4} h={4} color='red' />
                            </Flex>
                        </>
                    )}

                    {isUpdating && (<Spinner size='sm' color='blue.500' />)}
                </>
            )}
        </Flex>
    )
}