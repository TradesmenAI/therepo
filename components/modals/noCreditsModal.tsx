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
    Box,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import { PhoneInput, usePhoneValidation } from 'react-international-phone';
import 'react-international-phone/style.css';


export default function NoCreditsModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, updateProfile, profile} = useAppContext();
    const [phone, setPhone] = useState('');
    const phoneValidation = usePhoneValidation(phone);
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (currentModal === 'enterPhoneModal') {
          onOpen();

          setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])

    useEffect(()=>{
      if (isOpen && profile && profile.business_number){
        onClose()
      }
    }, [profile, isOpen])


    const savePhone = async()=>{
      setSaving(true)
      await updateProfile('business_number', phone)
      setSaving(false)
      onClose()
    }

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='md' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Enter your phone</ModalHeader>

            <ModalBody >
              <Box justifyContent='center' alignItems='center' display='flex' flexDirection='column' gap='20px'>
                  <Text>It will be used to redirect incoming messages from your customers</Text>

                  <PhoneInput
                    defaultCountry="gb"
                    value={phone}
                    onChange={(phone) => setPhone(phone)}
                  />
               </Box>
            </ModalBody>
  
            <ModalFooter>
                <Button isLoading={saving} colorScheme='blue' isDisabled={!phoneValidation.isValid} onClick={savePhone} marginLeft='10px'>
                      <Text>Save</Text>
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }