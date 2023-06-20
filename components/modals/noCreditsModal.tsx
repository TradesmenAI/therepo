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
import { Select } from '@chakra-ui/react'
import { Config } from '../../state/appContext';



export default function NoCreditsModal() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {currentModal, setCurrentModal, updateProfile, profile} = useAppContext();
    const [phone, setPhone] = useState('');
    const phoneValidation = usePhoneValidation(phone);
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [jobs, setJobs] = useState<any[]>([])
    const [otherValue, setOtherValue] = useState('')
    const [isOther, setIsOther] = useState(false)
    const [job, setJob] = useState('')


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

    useEffect(()=>{
      setLoading(true);

      (async()=>{
        const res = await fetch('/api/jobs', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
        });

        if (res.status === 200){
          const values = await res.json();
          setJobs(values)
  
          console.log(values)
  
          setLoading(false);
        }
      })()
    }, [])

    useEffect(()=>{
      console.log(job)
      setIsOther(job === Config.otherBusinessId.toString())
    }, [job])


    const savePhone = async()=>{
      setSaving(true)
      await updateProfile('business_number', phone)
      await updateProfile('business_id', parseInt(job))
      if (job === Config.otherBusinessId.toString()){
        await updateProfile('business_type', otherValue)
      }
      setSaving(false)
      onClose()
    }
    
    const onSelectChange = (e:any)=>{
      setJob(e.target.value)
    }

    let canSubmit = phoneValidation.isValid  && job;
    if (job === 'other' && !otherValue){
      canSubmit = false;
    }

    return (
      <>  
        <Modal isOpen={isOpen} onClose={() => {}} size='md' isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Details</ModalHeader>

            <ModalBody >
              {loading && (<Flex flexDir='row' alignItems='center' justifyContent='center' gap='15px'>
                <Spinner/> 
                <Text>Loading...</Text>
              </Flex>)}

              {!loading && (<>
                <Box justifyContent='center' alignItems='center' display='flex' flexDirection='column' gap='20px'>
                    <Text>Yout phone number:</Text>

                    <PhoneInput
                      defaultCountry="gb"
                      value={phone}
                      onChange={(phone) => setPhone(phone)}
                    />
                </Box>

                <Box mt='25px' justifyContent='center' alignItems='center' display='flex' flexDirection='column' gap='10px'>
                    <Text fontWeight='bold'>Business type:</Text>

                    <Select value={job} placeholder='Select option' w='208px' onChange={onSelectChange}>
                      {jobs.filter((x:any)=>x.id !== Config.otherBusinessId).map((job:any)=>{
                          return <option key={job.id} value={job.id}>{job.name}</option>
                      })}

                      <option value={Config.otherBusinessId}>Other</option>

                    </Select>

                    {isOther && (<>
                      <Input value={otherValue} onChange={(e)=>setOtherValue(e.target.value)} placeholder='Your business type' w='208px'/>
                    </>)}

               </Box>

              </>)}
              
            </ModalBody>
  
            <ModalFooter>
                <Button isLoading={saving} colorScheme='blue' isDisabled={!canSubmit} onClick={savePhone} marginLeft='10px'>
                      <Text>Save</Text>
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }