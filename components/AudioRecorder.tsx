import { useState, useRef, useEffect } from "react";
import { Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios, { ResponseType } from 'axios'

const mimeType = "audio/webm";


function fileUpload(file: any) {
    const url = 'https://lesfm.cldfn.com/process/convert';
    const formData = new FormData();
    formData.append('audio', file)
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        },
        responseType: 'blob' as ResponseType,
    }
    return axios.post(url, formData, config)
}

function downloadLink(href: any) {
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'file.mp3'); //or any other extension
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
}

const AudioRecorder = () => {
    //ffmpeg 
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)


    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const toast = useToast()

    const mediaRecorder = useRef(null);
    const [recordingStatus, setRecordingStatus] = useState("inactive");
    const [audioChunks, setAudioChunks] = useState([]);
    const [audio, setAudio] = useState<string | null>(null);

    const [loadingPlayer, setLoadingPlayer] = useState(false)

    useEffect(()=>{
        setLoadingPlayer(true)
        axios.get('/api/voicemail/download').then(res=>{
            if (res.status === 200){
                setAudio('/api/voicemail/download')
            }
        }).catch(e=>{
            
        }).finally(()=>{
            setLoadingPlayer(false)
        })
    }, [])

    // const load = async () => {
    //     setIsLoading(true)
    //     const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
    //     const ffmpeg = ffmpegRef.current
    //     ffmpeg.on('log', ({ message }) => {
    //       console.log(message)
    //     })
    //     // toBlobURL is used to bypass CORS issue, urls with the same
    //     // domain can be used directly.
    //     await ffmpeg.load({
    //       coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    //       wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    //     })
    //     setLoaded(true)
    //     setIsLoading(false)
    // }

    useEffect(() => {
        // load()
    }, [])

    const startRecording = async () => {
        if (!stream) {
            return;

        }
        setRecordingStatus("recording");

        setAudio(null)
        

        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        //@ts-ignore
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        //@ts-ignore
        mediaRecorder.current.start();

        let localAudioChunks:any[] = [];

        //@ts-ignore
        mediaRecorder.current.ondataavailable = (event: any) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };

        //@ts-ignore
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        setRecordingStatus("inactive");
        setLoadingPlayer(true)
        //stops the recording instance
        //@ts-ignore
        mediaRecorder.current.stop();

        //@ts-ignore
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.

            setAudioChunks([]);

            fileUpload(audioBlob).then(res => {
                const formData = new FormData();
                formData.append("file", res.data);

                const config = {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                }

                axios.post('/api/voicemail/upload', formData, config).then(res => {
                    console.log(res)

                    if (res.status === 200) {
                        setAudio('/api/voicemail/download')
                    }
                }).finally(()=>{
                    setLoadingPlayer(false)
                })


                // const href = URL.createObjectURL(res.data);
                // downloadLink(href)
            })
        };
    };

    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err: any) {
                toast({
                    title: err.message,
                    status: 'error',
                    position: 'top',
                    duration: 3000,
                    isClosable: true,
                })
            }
        } else {
            toast({
                title: "The MediaRecorder API is not supported in your browser.",
                status: 'error',
                position: 'top',
                duration: 3000,
                isClosable: true,
            })
        }
    };

    if (isLoading) {
        return <Spinner />
    }

    return (
        <Flex flexDir='column' justifyContent='center' alignItems='center' gap='15px'>
            {!permission ? (
                <Button w='300px' colorScheme='blue' onClick={getMicrophonePermission} backgroundColor='black' color='white' _hover={{ backgroundColor: '#2e2e2e' }}>Enable microphone</Button>
            ) : null}

            {permission && recordingStatus === "inactive" ? (
                <Button w='300px' colorScheme='blue' onClick={startRecording} backgroundColor='black' color='white' _hover={{ backgroundColor: '#2e2e2e' }}>Start recording</Button>

            ) : null}
            {(recordingStatus === "recording") ? (<>
                <Button w='300px' colorScheme='blue' onClick={stopRecording} backgroundColor='black' color='white' _hover={{ backgroundColor: '#2e2e2e' }}>Stop recording</Button>
                <Flex gap='0px' alignItems='center'>
                    <svg height="40" width="40" className="blinking">
                        <circle cx="20" cy="20" r="10" fill="red" />
                        Sorry, your browser does not support inline SVG.
                    </svg>
                    <Text>Recording...</Text>
                </Flex>
            </>
            ) : null}

            {audio && !loadingPlayer ? (
                <audio src={audio} controls></audio>
            ) : null}

            {loadingPlayer && (<Spinner/>)}



        </Flex>
    );
};
export default AudioRecorder;