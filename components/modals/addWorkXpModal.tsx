import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Flex,
    Spinner,
    Text,
    Divider,
    useToast,
    Textarea
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import SkillView from '../skillView';


export default function AddWorkXpModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {updateProfile, currentModal, setCurrentModal, profile, modalArgs, addJobDetails} = useAppContext();
    const [skills, setSkills] = useState<string[]>([]);
    const [isProgress, setIsProgress] = useState<boolean>(false)
    const [details, setDetails] = useState('');
    const toast = useToast()

    const handleInputChange = (e:any) => setDetails(e.target.value)

    useEffect(() => {
        if (currentModal === 'addWorkXpModal') {
            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])

    const onSave = async() => {
        setIsProgress(true);
        
        const isOk = await addJobDetails(modalArgs.companyId, details);
        setIsProgress(false);

        if (isOk) {
            onClose()
            setDetails('')
        } else {
            toast({
                title: 'Error, please try again',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            })
        }
    }

    const closeDialog = () => {
        if (isProgress) {
            return;
        }

        onClose();
    }

    return (
      <>  
        <Modal isOpen={isOpen} onClose={closeDialog} size='xl' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add work experience</ModalHeader>

            <ModalBody>
                <Flex gap={5} flexDir='column'>
                    
                        <FormControl>
                            <FormLabel>Describe your responsibilities, achievements or what you have been doing while at this position. Remember to show your experience from the angle that brings most value to your employer.</FormLabel>
                            <Textarea resize='none' value={details} onChange={handleInputChange} height='100px'/>
                        </FormControl>

                </Flex>
            </ModalBody>
  
            <ModalFooter>
                <Button colorScheme='twitter' disabled={isProgress || !details} onClick={onSave} onKeyPress={e=> {
                                    if (e.key === 'Enter') {
                                        onSave()
                                    }
                                }}>
                    <Flex gap={3} alignItems='center'>
                        {isProgress && <Spinner color='#60c0d1' />}
                        
                        <Text>{isProgress?'Saving':'Save'}</Text>
                    </Flex>
                </Button>

                {!isProgress && (
                    <Button colorScheme='gray' onClick={closeDialog} marginLeft='10px'>
                        <Text>Close</Text>
                    </Button>
                )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }