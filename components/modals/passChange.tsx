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
    Checkbox,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import { PhoneInput, usePhoneValidation } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Select } from '@chakra-ui/react'
import { Config } from '../../state/appContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';


export default function PassChangeModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, updateProfile, profile} = useAppContext();
    const [pass, setPass] = useState('');
    const [pass2, setPass2] = useState('');

    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)

    const supabase = useSupabaseClient()


    useEffect(() => {
        if (currentModal === 'recoverPassword') {
          onOpen();

          setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])

   
    
    const canSubmit = pass.trim() && pass2.trim() && pass.trim() === pass2.trim();

    const onChangePass = async()=>{
        setSaving(true)
        const { data, error } = await supabase.auth.updateUser({password: pass})
        setSaving(false)

        onClose()
    }
    

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='md' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Set new password</ModalHeader>

            <ModalBody >
             

                <Box justifyContent='center' alignItems='center' display='flex' flexDirection='column' gap='5px'>
                    <Text>Enter new password:</Text>
                    <Input type='password' value={pass} onChange={(e)=>setPass(e.target.value)} placeholder='New password' w='270px' mt='10px'/>
                </Box>

                <Box justifyContent='center' alignItems='center' display='flex' mt='15px' flexDirection='column' gap='5px'>
                    <Text>Repeat password:</Text>
                    <Input type='password' value={pass2} onChange={(e)=>setPass2(e.target.value)} placeholder='New password' w='270px' mt='10px'/>
                </Box>
              
            </ModalBody>
  
            <ModalFooter>
                <Button isLoading={saving} colorScheme='blackAlpha' isDisabled={!canSubmit} onClick={onChangePass} marginLeft='10px' backgroundColor='#000' >
                      <Text color='#B0F127'>Save</Text>
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }