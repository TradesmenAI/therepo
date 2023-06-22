
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
    Textarea,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import { PhoneInput, usePhoneValidation } from 'react-international-phone';
import 'react-international-phone/style.css';


export default function EditUserModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, modalArgs, updateUser} = useAppContext();
    const [details, setDetails] = useState('')
    const [prompt, setPrompt] = useState('')
    const [botMsg, setBotMsg] = useState('')
    const [userId, setUserId] = useState('')
    const [botIntroMsg, setBotIntroMsg] = useState('')

    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (currentModal === 'editUserModal') {
          setPrompt('')
          setBotMsg('')
          setDetails('')
          setUserId('')
          setBotIntroMsg('')


          const user = modalArgs.user
          setUserId(user.uid)


          if (user.details){
            setDetails(user.details)
          }

          if (user.prompt){
            setPrompt(user.prompt)
          }

          // if (user.bot_fail_message){
          //   setBotMsg(user.bot_fail_message)
          // }

          if (user.bot_intro_message){
            setBotIntroMsg(user.bot_intro_message)
          }
          
          onOpen();

          setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal, modalArgs])

    const onSave = async()=>{
        setSaving(true)
        await updateUser(userId, 'description', details)
        await updateUser(userId, 'prompt', prompt)
        // await updateUser(userId, 'bot_fail_message', botMsg)
        await updateUser(userId, 'bot_intro_message', botIntroMsg)


        setSaving(false)

        onClose()

        setCurrentModal('refresh')
    }

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='xl' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit user</ModalHeader>

            <ModalBody display='flex' flexDir='column' gap={3}>
              <Box>
                <Text>User details (notes only for you)</Text>
                <Textarea value={details} onChange={(e)=>setDetails(e.target.value)}/>
              </Box>

              <Box>
                <Text>Bot prompt</Text>
                <Textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)}/>
              </Box>

              <Box>
                <Text>Intro message</Text>
                <Input value={botIntroMsg} onChange={(e)=>setBotIntroMsg(e.target.value)}/>
              </Box>
{/* 
              <Box>
                <Text>Message if bot failed</Text>
                <Input value={botMsg} onChange={(e)=>setBotMsg(e.target.value)}/>
              </Box> */}
            
            </ModalBody>
  
            <ModalFooter>
                <Button isLoading={saving} colorScheme='gray'  onClick={onClose} marginLeft='10px'>
                      <Text>Close</Text>
                </Button>

                <Button isLoading={saving} colorScheme='blue'  onClick={onSave} marginLeft='10px'>
                      <Text>Save</Text>
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }