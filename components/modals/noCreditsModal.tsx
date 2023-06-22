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
          let values = await res.json();
          
          values.map((v:any)=>v['checked'] = false)

          setJobs(values)
          setIsOther(false)
  
          setLoading(false);
        }
      })()
    }, [])



    const savePhone = async()=>{
      setSaving(true)
      await updateProfile('business_number', phone)

      let val = ''
      const selectedJobs = jobs.filter(x=>x.checked)
      selectedJobs.map(j=>val+=j.name + ', ')

      if (isOther){
        val += otherValue
      } else {
        val = val.substring(0, val.length-2)
      }

      await updateProfile('business_type', val)

      setSaving(false)
      onClose()
    }

    const onChecked = (jobId:number, val:boolean)=>{
      setJobs((prev)=>{
        const newJobs = [...prev]

        newJobs.map(j=>{
          if (j.id === jobId){
            j.checked = val
          }
        })

        return newJobs
      })
    }

    const selectedJobs = jobs.filter(x=>x.checked)

    let canSubmit = phoneValidation.isValid  && (selectedJobs.length > 0 || isOther);
    if (isOther && !otherValue){
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
                    <Text mt='-10px'>(Tick all that apply)</Text>

                    <Flex flexDir='column' maxH='100px' gap={1} overflowY='scroll' w='270px'>
                        {jobs.filter((x:any)=>x.id !== Config.otherBusinessId).map((job:any)=>{
                          return <Checkbox key={job.id} checked={job.checked} onChange={(e)=>onChecked(job.id, e.target.checked)} >{job.name}</Checkbox>
                        })}

                        <Checkbox key='other_key' checked={isOther} onChange={(e:any)=>setIsOther(e.target.checked)}>Other</Checkbox>
                    </Flex>

                    {isOther && (<>
                      <Input value={otherValue} onChange={(e)=>setOtherValue(e.target.value)} placeholder='Your business type' w='270px' mt='10px'/>
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