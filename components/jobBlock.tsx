
import { 
    Box,
    Flex,
    Image,
    Spacer,
    Text,
    useDisclosure,
    Button,
    Spinner,
    UnorderedList,
    ListItem,
    useToast
} from '@chakra-ui/react'
import {
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react'
import { ToastContainer, toast } from 'react-toastify';
import 
{ 
    BiPencil,
    BiTrashAlt,
    BiLockOpenAlt,
    BiChevronUp,
    BiChevronDown,
} from "react-icons/bi";
import { Icon } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../state/appContext';
import { uuidv4, selectFile } from '../utils'
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
} from '@chakra-ui/react'
import 'react-toastify/dist/ReactToastify.css';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';
import { JobCompany, JobDetails } from '../state/types';
import { format } from 'date-fns'
import JobDetailsBlock from './jobDetailsBlock';
import FieldWithRename from './fieldWithRename';

type Props = {
    data: JobCompany
}

export default function JobBlock(props: Props) 
{
    const data = props.data;
    const {deleteCompany, setCurrentModal, setModalArgs} = useAppContext();
    const [isHover, setHover] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef(null)


    const onAddWorkXp = () => {
        setCurrentModal('addWorkXpModal')
        setModalArgs({companyId: props.data.id});
    }

    const onRemove = async()=>{
        setIsRemoving(true)

        const isOk = await deleteCompany(props.data.id);

        setIsRemoving(false)

        if (!isOk) {
            toast({
                title: 'Failed to remove company',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            })
        }
    }

    const test = async(val:string) => {
        return false;
    }

    const onValidateJobDetails = (val:string) => {
        if (!val) {
            return false;
        }

        return true;
    }

    return (
        <>
            <AlertDialog
                isOpen={isOpen}
                
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                    Delete company [{data.companyName}]?
                    </AlertDialogHeader>

                    <AlertDialogBody>
                    Are you sure? This action can&apos;t be undone.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme='red' onClick={() => {onRemove(); onClose()}} ml={3}>
                        Delete
                    </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        
            <ToastContainer
                position="bottom-right"
                autoClose={false}
                closeButton={false} 
                transition={Slide}
            />

            <AccordionItem>
                <h2>
                <AccordionButton 
                    width='100%' 
                    height='55px'
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >

                    <AccordionIcon />

                    <Box flex='1' textAlign='left' marginLeft='10px'>
                    <Flex flexDir='row' gap={2}>
                        <Text fontWeight='bold'>{data.companyName}</Text> 
                        {data.location && <Text>{data.location}</Text>}
                        <Text>From {format(new Date(data.date_from), 'MM/yyyy')}</Text>
                        <Text>{data.date_to && (<> - to {format(new Date(data.date_to), 'MM/yyyy')}</>)}</Text>
                    </Flex>
                    </Box>

                    {/* {isHover && !isRemoving && (
                        <Flex onClick={(e) => {onEdit(); e.preventDefault();}} backgroundColor='#ededed' width='35px' height='35px' marginLeft='20px' borderRadius='5px' alignItems='center' justifyContent='center'>
                            <Icon as={BiPencil} w={4} h={4} color='#4a4a4a' />
                        </Flex>
                    )} */}
                    
                    {isHover && !isRemoving && (
                        <Flex onClick={(e) => {onOpen(); e.preventDefault();}} backgroundColor='#f03426' width='35px' height='35px' marginLeft='10px' borderRadius='5px' alignItems='center' justifyContent='center'>
                            <Icon as={BiTrashAlt} w={4} h={4} color='#ffffff' />
                        </Flex>
                    )}

                    {isRemoving && (<Spinner color='red' />)}
                    
                    
                </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>

                {!isRemoving && (
                    <Flex backgroundColor='#7378921a' onClick={onAddWorkXp}  cursor='pointer'  width='100%' height='40px' borderRadius='10px' marginBottom='10px' alignItems='center' justifyContent='center'>
                        <Text color='#454343'>
                            <>+ Add work experience</>
                        </Text>
                    </Flex>
                )}
                
                <UnorderedList>
                {!isRemoving && data.details.map((val:JobDetails, index:number) => {
                    return (
                        // <JobDetailsBlock details={val} id={index} key={index} />
                        <FieldWithRename fieldValue={val} onUpdate={test} validateValue={onValidateJobDetails} key={index}/>
                    );
                })}
                </UnorderedList>
                {/* {!isRemoving && props.uploadingImages.map((img:UploadingImage, index:number) => {
                    return (
                        <LayerImage layerUid={props.item.uid} key={img.image.fileUid} item={img.image} layerIndex={props.index} imageIndex={index} isUploading={img.isUploading} uploadError={img.uploadError} uploadProgress={img.progress} />
                    );
                })} */}
                </AccordionPanel>
            </AccordionItem>
        </>
        
    )
}