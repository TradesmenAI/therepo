
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
import { BusinessArgs } from '../../pages/api/businesses';

export default function EditBusinessModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, modalArgs, updateUser} = useAppContext();
    const [saving, setSaving] = useState(false)
    const [createMode, setCreateMode] = useState(false)
    const [id, setId] = useState<number|null>(null)

    const [name, setName] = useState('')
    const [prompt, setPrompt] = useState('')
    const [msg, setMsg] = useState('')
    const [introMsg, setIntroMsg] = useState('')

    const defaultMsg = 'Sorry we missed your call. What service are you interested in?'

    const updateBusiness = async() => {
        setSaving(true)

        if (id) {
            //update
            const res = await fetch('/api/businesses', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, prompt, id, msg, intro_msg:introMsg})
            });
        } else {
            const res = await fetch('/api/businesses', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, prompt, msg, intro_msg:introMsg})
            });
        }

        setSaving(false)
    }

    useEffect(() => {
        if (currentModal === 'editBusinessModal') {
            const args = modalArgs;
            if (!args){
                setCreateMode(true)
                setId(null)
                setName('')
                setPrompt('')
                setIntroMsg(defaultMsg)
                setMsg('')
            } else {
                setCreateMode(false)
                const data:BusinessArgs = modalArgs as BusinessArgs
                setId(data.id!)
                setName(data.name)
                setPrompt(data.prompt)
                setIntroMsg(data.intro_msg)
                setMsg(data.msg)
            }

            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal, modalArgs])

    const onSave = async()=>{
        await updateBusiness()
        onClose()
        setCurrentModal('refreshBusiness')
    }

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='xl' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{createMode?'Add new':'Edit'} business</ModalHeader>

            <ModalBody display='flex' flexDir='column' gap={3}>
              <Box>
                <Text>Name</Text>
                <Input value={name} onChange={(e)=>setName(e.target.value)}/>
              </Box>


            </ModalBody>
  
            <ModalFooter>
                <Button isLoading={saving} colorScheme='gray'  onClick={onClose} marginLeft='10px'>
                      <Text>Close</Text>
                </Button>

               {!createMode && (
                    <Button isLoading={saving} colorScheme='blue'  onClick={onSave} marginLeft='10px'>
                        <Text>Save</Text>
                    </Button>
                )}

                {createMode && (
                    <Button isLoading={saving} colorScheme='blue'  onClick={onSave} marginLeft='10px'>
                        <Text>Add</Text>
                    </Button>
                )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }