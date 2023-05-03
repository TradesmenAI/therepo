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
    Switch
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAppContext } from '../../state/appContext';
import SkillView from '../skillView';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import updateProfile from '../../pages/api/updateProfile';

export default function AddCompanyModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, addCompany} = useAppContext();
    const [isProgress, setIsProgress] = useState<boolean>(false)
    const toast = useToast()
    const [isCurrentlyWorking, setIsCurrentlyWorking] = useState<boolean>(false)
    const [companyName, setCompanyName] = useState<string>('')
    const [companyLocation, setCompanyLocation] = useState<string>('')
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [jobTitle, setJobTitle] = useState<string>('');

    useEffect(() => {
        if (currentModal === 'addCompanyModal') {
            onOpen();

            setCurrentModal('');
        }
    }, [currentModal, onOpen, setCurrentModal])


   const onSave = async() => {
        setIsProgress(true)

        const date_to = isCurrentlyWorking ? undefined : endDate;
        const isOk = await addCompany(companyName, jobTitle, startDate, companyLocation, date_to);

        setIsProgress(false)

        if (isOk) {
            onClose();

            setCompanyName('');
            setCompanyLocation('');
            setStartDate(new Date())
            setEndDate(new Date())
            setJobTitle('')
            setIsCurrentlyWorking(false)
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

   let canSave:boolean = false;
   if (companyName && jobTitle && startDate){
        canSave = true;
   }

    return (
      <>  
        <Modal isOpen={isOpen} size='lg' onClose={closeDialog} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add company</ModalHeader>

            <ModalBody>
                <Flex gap={5} flexDir='column'>
                    
                        <FormControl isRequired>
                            <FormLabel>Company name</FormLabel>
                            <Flex flexDir='row' gap={2}>
                                <Input placeholder='Company name' value={companyName} onChange={(e)=>setCompanyName(e.target.value)} />
                            </Flex>

                        </FormControl>

                        <FormControl>
                            <FormLabel>Company location</FormLabel>
                            <Input placeholder='Company location' value={companyLocation} onChange={(e)=>setCompanyLocation(e.target.value)} />
                        </FormControl>


                        <FormControl isRequired>
                            <FormLabel>Job title</FormLabel>
                            <Input placeholder='Job title' value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} />


                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Start date</FormLabel>
                            <SingleDatepicker
                            name="date-input"
                            date={startDate}
                            onDateChange={setStartDate}
                            />

                        </FormControl>

                        <FormControl display='flex' alignItems='center' gap={2}>
                            <Switch id='email-alerts' isChecked={isCurrentlyWorking} onChange={(e)=> setIsCurrentlyWorking(e.target.checked)} />

                            <Text fontWeight='medium'>Currently work here</Text>

                        </FormControl>

                        {!isCurrentlyWorking && (
                            <FormControl >
                                <FormLabel>End date</FormLabel>
                                <SingleDatepicker
                                name="date-input"
                                date={endDate}
                                onDateChange={setEndDate}
                                />
                            </FormControl>
                        )}
                        
                        
                      
                        
                </Flex>
            </ModalBody>
  
            <ModalFooter>
                <Flex flexDir='row' gap={3}>
                    <Button colorScheme='twitter' disabled={isProgress || !canSave} onClick={onSave}>
                        <Flex gap={3} alignItems='center'>
                            {isProgress && <Spinner color='#60c0d1' />}
                            
                            <Text>{isProgress?'Saving':'Save'}</Text>
                        </Flex>
                    </Button>

                    {!isProgress && (
                        <Button colorScheme='gray' disabled={isProgress} onClick={closeDialog}>
                            <Text>Close</Text>
                        </Button>
                    )}
                </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }