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


export default function AddSkillModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {updateProfile, currentModal, setCurrentModal, profile} = useAppContext();
    const [skills, setSkills] = useState<string[]>([]);
    const [isProgress, setIsProgress] = useState<boolean>(false)
    const [skillName, setSkillName] = useState('');
    const toast = useToast()

    const handleInputChange = (e:any) => setSkillName(e.target.value)

    useEffect(() => {
        if (currentModal === 'addSkillModal') {
            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])

    const onSave = async() => {
        if (skills.length == 0) {
            return
        }

        setIsProgress(true);

        let oldSkills:string[] = []

        if (profile){
            oldSkills = [...profile.skills]
        }

        oldSkills.push(...skills)

        const isOk = await updateProfile('skills', JSON.stringify(oldSkills));

        setIsProgress(false);

        if (isOk) {
            setSkills([])
            setSkillName('')
            onClose()
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

    const onAddSkill = () => {
        if (!skillName|| !skillName.trim()){
            return;
        }

        setSkills(oldSkills => [...oldSkills, skillName])
        setSkillName('');
    }

    const onRemoveSkill = (val:string) => {
        const newSkills = skills.filter(x => x !== val);
        setSkills(newSkills);
    }

    let skillViews:any[] = []

    skills.map((val, index) => {
        skillViews.push(<SkillView name={val} isDisabled={false} key={index} onClick={() => onRemoveSkill(val)} />)
    })

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
            <ModalHeader>Add skills</ModalHeader>

            <ModalBody>
                <Flex gap={5} flexDir='column'>
                    
                        <FormControl>
                            <FormLabel>Enter skill name</FormLabel>
                            <Flex flexDir='row' gap={2}>
                                <Input placeholder='Skill name' value={skillName} onChange={handleInputChange} onKeyPress={e=> {
                                    if (e.key === 'Enter') {
                                    onAddSkill()
                                    }
                                }}/>
                                <Button colorScheme='twitter' onClick={onAddSkill}>Add⏎</Button>
                            </Flex>

                        </FormControl>

                       
                    <Divider/>

                    <Text>Skills to add:</Text>
                    
                    <Flex flexDir='row' gap={2} flexWrap='wrap'>
                        {skillViews}
                    </Flex>
                
                </Flex>
            </ModalBody>
  
            <ModalFooter>
                <Button colorScheme='twitter' disabled={isProgress} onClick={onSave}>
                    <Flex gap={3} alignItems='center'>
                        {isProgress && <Spinner color='#60c0d1' />}
                        
                        <Text>{isProgress?'Saving':'Save'}</Text>
                    </Flex>
                </Button>

                {!isProgress && (
                    <Button colorScheme='gray' disabled={isProgress} onClick={closeDialog} marginLeft='10px'>
                        <Text>Close</Text>
                    </Button>
                )}

                
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }