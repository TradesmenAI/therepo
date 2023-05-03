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
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import SkillView from '../skillView';


export default function NoCreditsModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {purchaseInProgress, purchaseCredits, currentModal, setCurrentModal} = useAppContext();

    useEffect(() => {
        if (currentModal === 'noCreditsModal') {
            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])


   
    const onBuyCredits = async() => {
        if (purchaseInProgress){
            return;
        }

        await purchaseCredits(25)
    }
    

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='sm' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Feedback sent!</ModalHeader>

            <ModalBody>
                <Text>We will get back to you using email</Text>
            </ModalBody>
  
            <ModalFooter>
                <Button colorScheme='gray' onClick={onClose} marginLeft='10px'>
                        <Text>Close</Text>
                </Button>
                
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }