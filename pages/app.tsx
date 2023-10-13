'use client'

import {
    Box,
    Flex,
    Image,
    Spacer,
    Text,
    Spinner,
    Divider,
    Button,
    useToast,
    Select,
    Skeleton,
    Grid,
    Textarea,
    FormControl,
    FormLabel
} from '@chakra-ui/react'
import { Show, Hide } from '@chakra-ui/react'
import { Toaster, toast } from 'sonner';
import Sidebar from '../components/sidebar'
import ContentHeader from '../components/contentHeader'
import TitleBlock from '../components/titleBlock'
import { useState, useEffect, useMemo } from 'react'
import { sleep, useAppContext } from '../state/appContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { BiCopy, BiPlusMedical } from "react-icons/bi";
import { Icon } from '@chakra-ui/react'
import { uuidv4, selectFile } from '../utils'
import {
    BiAddToQueue,
    BiLayer,
    BiX
} from "react-icons/bi";
import NoCreditsModal from '../components/modals/noCreditsModal'
import { useSession } from "@supabase/auth-helpers-react";
import { redirect } from 'next/navigation';
import { useRouter } from 'next/router'
import FieldWithRename from '../components/fieldWithRename';
import { Switch } from '@chakra-ui/react'
import Pricing from '../components/pricing';
import AudioRecorder from '../components/AudioRecorder';
import set from 'date-fns/set'
const zeroPad = (num: number, places: number) => String(num).padStart(places, '0')

export const applyTimezoneToHours = (hours:number, tz:number) => hours-tz>0?hours-tz:hours-tz+24;

export default function App() {
    const { openBillingPortal, profile, updateProfile } = useAppContext();
    const session = useSession()
    const { push } = useRouter()
    const [businessPhone, setBusinessPhone] = useState('-')
    const [redirect, setRedirect] = useState(false)
    const [introMsg, setIntroMsg] = useState('')
    const [upd1, setUpd1] = useState(false)
    const [upd2, setUpd2] = useState(false)
    const [upd, setUpd] = useState('')
    const [outOfHoursMsg, setOutOfHoursMsg] = useState('')


    useEffect(() => {
        if (profile) {
            setBusinessPhone(profile.business_number)
            setIntroMsg(profile.bot_intro_message)
            setOutOfHoursMsg(profile.out_of_hours_message)
        }
    }, [profile])

    const onUpdatePhone = async (val: string) => {
        await updateProfile('business_number', val)
        return true
    }

    const onUpdateMessage = async (val: string) => {
        await updateProfile('bot_intro_message', val)
        return true
    }

    const onUpdateOutOfHoursMessage = async (val: string) => {
        await updateProfile('out_of_hours_message', val)
        return true
    }

    const onValidatePhone = (val: string) => {
        return true
    }

    useEffect(() => {
        if (!session) {
            push('/');
        }
    }, [session])




    const onUpgrage = async () => {
        if (profile.total_messages === 0) {
            push('/billing');
        } else {
            setRedirect(true)
            await openBillingPortal()
        }
    }

    const onEnableChange = async (val: boolean) => {
        if (upd1) {
            return
        }

        setUpd1(true)
        await updateProfile('voicemail_enabled', val)
        setUpd1(false)
    }

    const onOutHoursModeChange = async (val: boolean) => {
        if (upd2) {
            return
        }

        setUpd2(true)
        await updateProfile('outofhours_enabled', val)
        setUpd2(false)
    }

    const hours = useMemo(() => {
        let res = []

        for (let i = 0; i < 24; ++i) {
            const xx = i + 1
            res.push(<option value={xx}>{xx}</option>)
        }

        return res;
    }, [])

    const minutes = useMemo(() => {
        let res = []

        for (let i = 0; i < 60; ++i) {
            res.push(<option value={i}>{i}</option>)
        }

        return res;
    }, [])

    const timezone = useMemo(() => {
        let res = []

        for (let i = -8; i < 15; ++i) {
            res.push(<option value={i}>{i < 0 ? `${i}` : `+${i}`}</option>)
        }

        return res;
    }, [])



    useEffect(() => {
        // const date = new Date("2020-01-01T22:00:00.000+03:00");
        // updateProfile('out_from_time', date).then(res=>{
        //     console.log('>>>++ UPDATED')
        // })
    }, [])

    const onChangeTimezone = async (val: string) => {
        const newTimeZone = parseInt(val)
        setUpd('tz')
        await updateProfile('timezone', newTimeZone)
        setUpd('')
    }

    const onChangeFromHours = async (val: string) => {
        setUpd('out_from_time_h')
        await updateProfile('out_from_time', `${zeroPad(parseInt(val), 2)}:${profile.out_from_time.split(':')[1]}`)
        setUpd('')
    }

    const onChangeFromMinutes = async (val: string) => {
        setUpd('out_from_time_m')
        await updateProfile('out_from_time', `${profile.out_from_time.split(':')[0]}:${zeroPad(parseInt(val), 2)}`)
        setUpd('')
    }

    const onChangeToHours = async (val: string) => {
        setUpd('out_to_time_h')
        await updateProfile('to_from_time', `${zeroPad(parseInt(val), 2)}:${profile.to_from_time.split(':')[1]}`)
        setUpd('')
    }

    const onChangeToMinutes = async (val: string) => {
        setUpd('out_to_time_m')
        await updateProfile('to_from_time', `${profile.to_from_time.split(':')[0]}:${zeroPad(parseInt(val), 2)}`)
        setUpd('')
    }

    let fromHours = 0;
    let fromMinutes = 0

    let toHours = 0;
    let toMinutes = 0

    if (profile) {
        let fromParts = profile.out_from_time.split(':')
        fromHours = parseInt(fromParts[0])
        fromMinutes = parseInt(fromParts[1])

        let toParts = profile.to_from_time.split(':')
        toHours = parseInt(toParts[0])
        toMinutes = parseInt(toParts[1])

        const tz = profile.timezone;

        const now = new Date();
        let hours = now.getUTCHours();
        let minutes = now.getUTCMinutes();

        let tzFromHours = applyTimezoneToHours(fromHours, tz);
        let tzToHours = applyTimezoneToHours(toHours, tz);
        let offset = 0

        if (tzToHours < tzFromHours){
            offset = 24 - tzFromHours

            tzFromHours = (offset + tzFromHours)%24
            tzToHours += offset
            hours += offset
        }

        tzFromHours += (fromMinutes/60)
        tzToHours += toMinutes/60;
        hours += minutes/60;

        let canCall = true
        
        if (hours >= tzFromHours && hours <= tzToHours){
            canCall = false;
        }

        console.log(`Can call? ${canCall}`)
    }



    return (

        <Flex dir='row'>
            <Sidebar />

            <Toaster />

            <NoCreditsModal />

            <Flex padding='20px' flexDir='column' flexGrow={1} gap={5} alignItems='center' height='100vh' overflowY='scroll' overflowX='hidden'>

                <Show below='700px'><Box height='40px' width='100%'></Box></Show>

                <ContentHeader title='Dashboard' />

                {/* <Flex flexDir='column' gap={2} maxW='100%' minW='250px' width='100%' alignItems={'center'}>
                    
                </Flex> */}

                <Flex flexDir='column' gap={2} maxW='450px' minW='250px' width='100%' alignItems={'center'}>


                    {profile === null && <Flex gap={3} marginTop={20}>
                        <Spinner color='blue.500' />
                        <Text fontWeight='bold'>Loading profile...</Text>
                    </Flex>}

                    {profile !== null && (<>


                        <Flex width='100%' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} bgColor={'white'} border='1px solid black' padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>Virtual phone number</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='normal' color={'black'}>
                                {profile.twilio_number}
                            </Text>
                            <Icon as={BiCopy} w={5} h={5} color='black' cursor='pointer' marginLeft='10px' onClick={() => {
                                navigator.clipboard.writeText(profile.twilio_number)
                                toast.success('Phone Copied')
                            }} />

                        </Flex>

                        <Flex width='100%' border='1px solid black' bgColor={'white'} gap='10px' flexDir='row' alignItems='center' justifyContent='center' marginTop={1} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>Messages/month</Text>
                            <Spacer />
                            <Button isDisabled={redirect} isLoading={redirect} size='xs' colorScheme='green' backgroundColor='#B0F127' _hover={{ backgroundColor: '#94d10f' }} color='black' onClick={onUpgrage}>Upgrade ⚡️</Button>
                            <Text fontSize='15px' fontWeight='bold' color={'black'}>
                                {profile.total_messages}
                            </Text>
                        </Flex>

                        <Flex width='100%' bgColor={'white'} border='1px solid black' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>Messages left</Text>
                            <Spacer />
                            <Text fontSize='15px' fontWeight='bold' color={'black'}>
                                {profile.messages_left}
                            </Text>
                        </Flex>


                        <Flex width='100%' bgColor={'white'} border='1px solid black' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>Your phone</Text>
                            <Spacer />
                            <FieldWithRename value={businessPhone} onUpdate={onUpdatePhone} onValidate={onValidatePhone} />
                        </Flex>

                        <Flex width='100%' border='1px solid black' bgColor={'white'} gap='10px' flexDir='row' alignItems='center' justifyContent='center' marginTop={1} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>Timezone (GMT)</Text>
                            <Spacer />
                            {upd === 'tz' && <Spinner size='sm' color='black' mr='4px' />}
                                    <Select value={profile.timezone} onChange={(e) => onChangeTimezone(e.target.value)} w='80px'>
                                        {timezone}
                                    </Select>
                        </Flex>

                        <Flex width='100%' bgColor={'white'} border='1px solid black' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>* Bot intro message</Text>
                            <Spacer />
                            <FieldWithRename value={introMsg} onUpdate={onUpdateMessage} onValidate={onValidatePhone} />
                        </Flex>
                        <Text fontSize='14px' mt='-5px' fontWeight='bold' fontStyle='italic'>* We recommend leaving this as default</Text>

                        <Flex width='100%' bgColor={'white'} border='1px solid black' flexDir='column' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Flex width='100%' alignItems='center' mb='10px'>
                                <Text fontSize='15px' fontWeight='semibold' color={'black'}>Voicemail enabled</Text>
                                <Spacer />
                                {upd1 && (<Spinner size='sm' color='black' mr='4px' />)}
                                <Switch id='email-alerts' colorScheme='green' isChecked={profile.voicemail_enabled} onChange={(e) => onEnableChange(e.target.checked)} />
                            </Flex>
                            {profile.voicemail_enabled && (<AudioRecorder />)}
                        </Flex>

                        <Flex width='100%' bgColor={'white'} border='1px solid black' flexDir='column' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Flex width='100%' alignItems='center' mb='10px'>
                                <Text fontSize='15px' fontWeight='semibold' color={'black'}>Out of hours mode</Text>
                                <Spacer />
                                {upd2 && (<Spinner size='sm' color='black' mr='4px' />)}
                                <Switch id='email-alerts' colorScheme='green' isChecked={profile.outofhours_enabled} onChange={(e) => onOutHoursModeChange(e.target.checked)} />
                            </Flex>

                            {profile.outofhours_enabled && (<>
                                <Flex alignItems='center' w='100%' borderRadius='8px' p='5px' gap='5px'>
                                    <Text w='50px'>From:</Text>
                                    {upd === 'out_from_time_h' && <Spinner size='sm' color='black' mr='4px' />}
                                    <Select onChange={(e) => onChangeFromHours(e.target.value)} value={fromHours} w='80px'>
                                        {hours}
                                    </Select>
                                    <Text w='55px' mr='5px'>Hours</Text>

                                    {upd === 'out_from_time_m' && <Spinner size='sm' color='black' mr='4px' />}

                                    <Select onChange={(e) => onChangeFromMinutes(e.target.value)} value={fromMinutes} w='80px'>
                                        {minutes}
                                    </Select>
                                    <Text w='65px'>Minutes</Text>


                                </Flex>

                                <Flex alignItems='center' w='100%' borderRadius='8px' p='5px' gap='5px'>
                                    <Text w='50px'>To:</Text>
                                    {upd === 'out_to_time_h' && <Spinner size='sm' color='black' mr='4px' />}
                                    <Select onChange={(e) => onChangeToHours(e.target.value)} value={toHours} w='80px'>
                                        {hours}
                                    </Select>
                                    <Text w='55px' mr='5px'>Hours</Text>

                                    {upd === 'out_to_time_m' && <Spinner size='sm' color='black' mr='4px' />}

                                    <Select onChange={(e) => onChangeToMinutes(e.target.value)} value={toMinutes} w='80px'>
                                        {minutes}
                                    </Select>
                                    <Text w='65px'>Minutes</Text>


                                </Flex>

                            </>)}
                        </Flex>

                        {profile.outofhours_enabled && <Flex width='100%' bgColor={'white'} border='1px solid black' flexDir='row' alignItems='center' justifyContent='center' marginTop={2} padding={2} borderRadius='8px'>
                            <Text fontSize='15px' fontWeight='semibold' color={'black'}>Out of hours message</Text>
                            <Spacer />
                            <FieldWithRename value={outOfHoursMsg} onUpdate={onUpdateOutOfHoursMessage} onValidate={onValidatePhone} />
                        </Flex>}


                    </>)}

                </Flex>
            </Flex>
        </Flex>
    )
}

