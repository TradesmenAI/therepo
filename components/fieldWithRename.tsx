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
import { JobDetails } from "../state/types";
import { useAppContext } from "../state/appContext";



export type Props = {
    fieldValue:JobDetails,
    onUpdate:(newValue:string) => Promise<boolean>,
    validateValue: (newValue:string) => boolean,
    inputType?:string
}

export default function FieldWithRename(props:Props) {
    const [isUpdating, setIsUpating] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [hasError, setHasError] = useState<boolean>(false)
    const [value, setValue] = useState<string>(props.fieldValue.text)
    const toast = useToast()
    const [isHover, setHover] = useState(false);
    const {deleteJobDetails, updateJobDetails} = useAppContext()

    const handleChange = (event:any) => {
        const newVal = event.target.value

        setHasError(!props.validateValue(newVal))
        setValue(newVal)
    }

    const onEdit = async() => {
        setHasError(false)
        setValue(props.fieldValue.text)
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

        if (value === props.fieldValue.text){
            setIsEdit(false)
            return
        }

        setIsUpating(true)
        if (!await updateJobDetails(props.fieldValue.company_id, props.fieldValue.id, value)){
            toast({
                title: 'Failed to update value',
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

    const onDelete = async() => {
        setIsUpating(true)
        const isOk = await deleteJobDetails(props.fieldValue.company_id, props.fieldValue.id);
        setIsUpating(false)

        if (!isOk) {
            toast({
                title: 'Server error, please try again',
                status: 'error',
                position: 'top',
                duration: 3500,
                isClosable: true,
            })
        }
    }

    return (
        <Flex onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} flexDir='row' alignItems='center' gap='10px' cursor='text' onClick={onStartEdit} _hover={{backgroundColor: '#f8f8f8'}} padding='3px' borderRadius='5px'>
            {!isEdit && (
                <>
                    <Box width='4px' height='4px' backgroundColor='black'/>
                    <Text >{props.fieldValue.text}</Text>
                    <Spacer/>
                    {isHover && (
                        <>
                        <Flex onClick={onEdit} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' >
                            <Icon as={BiPencil} w={4} h={4} color='black' />
                        </Flex>
                        <Flex color='white' height='25px' width='25px' onClick={onDelete} alignItems='center' justifyContent='center' backgroundColor='#f26157' padding='5px' borderRadius='5px' cursor='pointer' >
                            X
                        </Flex>
                        </>
                    )}
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