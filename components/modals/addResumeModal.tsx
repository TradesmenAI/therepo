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
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import SelectableSkillView from '../selectableSkillView';

export default function AddResumeModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, addResumeRequest, profile, updateProfile} = useAppContext();
    const [isProgress, setIsProgress] = useState<boolean>(false)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [jobUrl, setJobUrl] = useState('')
    const toast = useToast()

    const [stepTwo, setStepTwo] = useState<boolean>(true)
    const [selectedSkillIndices, setSelectedSkillIndices] = useState<boolean[]>([])
    const [skills, setSkills] = useState<string[]>([]);

    useEffect(() => {
        if (currentModal === 'addResumeModal') {
            setStepTwo(false)
            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])

    useEffect(() => {
        if (!skills) {
            return;
        }

        let skillState:boolean[] = []

        for(let skill of skills){
            skillState.push(false)
        }

        setSelectedSkillIndices(skillState)
    }, [skills])

    let skillViews = []

    for(let i = 0; i < skills.length; ++i){
        skillViews.push(<SelectableSkillView name={skills[i]} key={i} onClick={(state) => {
            let newState = [...selectedSkillIndices]
            newState[i] = state
            setSelectedSkillIndices(newState) 
        }} isDisabled={isProgress}/>)
    }


    const onSave = async() => {
        setIsProgress(true);

        let url = jobUrl?jobUrl:undefined;
        let desc = description?description:undefined;
        
        const skills = await addResumeRequest(title, desc, url);

        setIsProgress(false);

        if (skills == null) {
            toast({
                title: 'Error, please try again',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top'
            })
            return
        }

        setStepTwo(true)

        setTitle('')
        setDescription('')
        setJobUrl('')

        let newSkills = []

        for(let skill of skills){
            if (!profile?.skills.includes(skill)){
                newSkills.push(skill)
            }
        }

        setSkills(newSkills)
    }

    const onFinalSave = async() => {
        setIsProgress(true);

        let oldSkills:string[] = []

        if (profile){
            oldSkills = [...profile.skills]
        }

        let addSkills = []
        for(let i = 0; i < skills.length; ++i){
            if (selectedSkillIndices[i]){
                addSkills.push(skills[i])
            }
        }

        if (addSkills.length === 0) {
            setSkills([])
            setSelectedSkillIndices([])
            onClose()
            return
        }

        oldSkills.push(...addSkills)

        const isOk = await updateProfile('skills', JSON.stringify(oldSkills));

        setIsProgress(false);

        if (isOk) {
            setSkills([])
            setSelectedSkillIndices([])
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

    const closeDialog = () => {
        if (isProgress || stepTwo) {
            return;
        }

        onClose();
    }

    return (
      <>  
        <Modal isOpen={isOpen} onClose={closeDialog} size='xl' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Generate new resume</ModalHeader>

            <ModalBody minH='300px!important'>
                <Flex gap={5} flexDir='column'>

                        {!stepTwo && <>
                            <FormControl isRequired>
                                <FormLabel>Resume name</FormLabel>
                                <Input resize='none' value={title} onChange={(e:any)=>setTitle(e.target.value)}/>
                            </FormControl>

                            <Tabs isFitted variant='solid-rounded' >
                                <TabList mb='1em' backgroundColor='#eeeeee' borderRadius='20px'>
                                    <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Job description</Tab>
                                    <Tab _selected={{ color: 'white', bg: 'blue.500' }}>Link to the job</Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        <Textarea placeholder='Enter job description' resize='none' value={description} onChange={(e:any)=>setDescription(e.target.value)} height='100px'/>
                                    </TabPanel>
                                    <TabPanel>
                                        <Input placeholder='Enter job url' resize='none' value={jobUrl} onChange={(e:any)=>setJobUrl(e.target.value)}/>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </>}

                        {stepTwo && <>
                            <Text>These skills are not in your resume. Select those you wish to add:</Text>
                            <Flex flexDir='row' gap={2} flexWrap='wrap'>
                                {skillViews}
                            </Flex>
                        </>}
                </Flex>
            </ModalBody>
  
            <ModalFooter>
               {!stepTwo && (
                <Button colorScheme='twitter' disabled={isProgress || !title || (!description && !jobUrl )} onClick={onSave}>
                    <Flex gap={3} alignItems='center'>
                        {isProgress && <Spinner color='#60c0d1' />}
                        
                        <Text>{isProgress?'Creating request':'Generate'}</Text>
                    </Flex>
                </Button>
               )}

               {stepTwo && (
                <Button colorScheme='twitter' disabled={isProgress} onClick={onFinalSave}>
                    <Flex gap={3} alignItems='center'>
                        {isProgress && <Spinner color='#60c0d1' />}
                        
                        <Text>{isProgress?'Saving...':'Save'}</Text>
                    </Flex>
                </Button>
               )}

                {!isProgress && !stepTwo && (
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