// import { useState, useRef } from "react";
// import { Button } from "@chakra-ui/react";
// import { useToast } from "@chakra-ui/react";


// const mimeType = "audio/mp3";

 export default function AudioRecorder() {
    return <></>
 }

// const AudioRecorder = () => {
//     const [permission, setPermission] = useState(false);
//     const [stream, setStream] = useState<MediaStream | null>(null);
//     const toast = useToast()

//     const mediaRecorder = useRef(null);
//     const [recordingStatus, setRecordingStatus] = useState("inactive");
//     const [audioChunks, setAudioChunks] = useState([]);
//     const [audio, setAudio] = useState(null);


//     const startRecording = async () => {
      
//         if (!stream) {
//             return;

//         }
//         setRecordingStatus("recording");
//         //create new Media recorder instance using the stream
//         const media = new MediaRecorder(stream, { mimeType });
//         //set the MediaRecorder instance to the mediaRecorder ref
//         mediaRecorder.current = media;
//         //invokes the start method to start the recording process
//         mediaRecorder.current.start();

//         let localAudioChunks = [];

//         mediaRecorder.current.ondataavailable = (event: any) => {
//             if (typeof event.data === "undefined") return;
//             if (event.data.size === 0) return;
//             localAudioChunks.push(event.data);
//         };
//         setAudioChunks(localAudioChunks);
//     };

//     const stopRecording = () => {
//         setRecordingStatus("inactive");
//         //stops the recording instance
//         mediaRecorder.current.stop();
//         mediaRecorder.current.onstop = () => {
//             //creates a blob file from the audiochunks data
//             const audioBlob = new Blob(audioChunks, { type: mimeType });
//             //creates a playable URL from the blob file.
//             const audioUrl = URL.createObjectURL(audioBlob);
//             setAudio(audioUrl);
//             setAudioChunks([]);
//         };
//     };

//     const getMicrophonePermission = async () => {
//         if ("MediaRecorder" in window) {
//             try {
//                 const streamData = await navigator.mediaDevices.getUserMedia({
//                     audio: true,
//                     video: false,
//                 });
//                 setPermission(true);
//                 setStream(streamData);
//             } catch (err: any) {
//                 toast({
//                     title: err.message,
//                     status: 'error',
//                     position: 'top',
//                     duration: 3000,
//                     isClosable: true,
//                 })
//             }
//         } else {
//             toast({
//                 title: "The MediaRecorder API is not supported in your browser.",
//                 status: 'error',
//                 position: 'top',
//                 duration: 3000,
//                 isClosable: true,
//             })
//         }
//     };
//     return (
//         <div className="audio-controls">
//             {!permission ? (
//                 <Button w='220px' colorScheme='blue' onClick={getMicrophonePermission} backgroundColor='black' color='white' _hover={{ backgroundColor: '#2e2e2e' }}>Enable microphone</Button>
//             ) : null}

//             {permission && recordingStatus === "inactive" ? (
//                 <Button w='220px' colorScheme='blue' onClick={startRecording} backgroundColor='black' color='white' _hover={{ backgroundColor: '#2e2e2e' }}>Start recording</Button>

//             ) : null}
//             {recordingStatus === "recording" ? (
//                 <Button w='220px' colorScheme='blue' onClick={stopRecording} backgroundColor='black' color='white' _hover={{ backgroundColor: '#2e2e2e' }}>Stop recording</Button>

//             ) : null}

//             {audio ? (
//                 <div className="audio-container">
//                     <audio src={audio} controls></audio>
//                     <a download href={audio}>
//                         Download Recording
//                     </a>
//                 </div>
//             ) : null}
//         </div>
//     );
// };
// export default AudioRecorder;