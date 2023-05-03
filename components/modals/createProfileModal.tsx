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
    Text
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';

export default function CreateProfileModal(props: {full_name:string|null, email:string|null}) {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const {createProfile} = useAppContext();

    const [name, setName] = useState(props.full_name?props.full_name:'');
    const [email, setEmail] = useState(props.email?props.email:'');
    const [phone, setPhone] = useState('');

    const [isProgress, setIsProgress] = useState<boolean>(false)

    const handleNameInputChange = (e:any) => setName(e.target.value)
    const handleEmailInputChange = (e:any) => setEmail(e.target.value)
    const handlePhoneInputChange = (e:any) => setPhone(e.target.value)

    useEffect(() => {
        onOpen();
    }, [onOpen])

    const onCreateProfile = async() => {
        setIsProgress(true);

        const ok = await createProfile(name, email, phone)

        setIsProgress(false)

        if (ok) {
            onClose();
        } else {
            alert('Failed to create profile')
        }
    };

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='xl' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create profile</ModalHeader>

            <ModalBody>
                <Flex gap={5} flexDir='column'>
                    <FormControl isRequired isInvalid={!name}>
                        <FormLabel>Full name</FormLabel>
                        <Input placeholder='Full name' value={name} onChange={handleNameInputChange} />
                    </FormControl>

                    <FormControl isRequired isInvalid={!email}>
                        <FormLabel>Email (used in resume)</FormLabel>
                        <Input type='email' placeholder='Email' value={email} onChange={handleEmailInputChange} />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <Input type='tel' placeholder='Phone' value={phone} onChange={handlePhoneInputChange} />
                    </FormControl>
                </Flex>
            </ModalBody>
  
            <ModalFooter>
                <Button colorScheme='twitter' disabled={!name || !email || isProgress} onClick={onCreateProfile}>
                    <Flex gap={3} alignItems='center'>
                        {isProgress && <Spinner color='#60c0d1' />}
                        
                        <Text>{isProgress?'Creating':'Create'}</Text>
                    </Flex>
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }