import { 
    Flex,
    Text,
    Icon,
    Input,
    useToast,
    Spinner,
    Tooltip
} from "@chakra-ui/react"
import { useState } from "react";
import 
{ 
    BiPencil,
    BiCheck,
    BiX,
} from "react-icons/bi";
import { useAppContext } from "../state/appContext";




// export type Props = {
//     rarity:number,
//     imageUid:string,
//     layerUid:string
// }

// export default function RarityView(props:Props){
//     const [isEdit, setIsEdit] = useState<boolean>(false)
//     const [value, setValue] = useState(props.rarity.toString())
//     const [hasError, setHasError] = useState<boolean>(false)
//     const toast = useToast()
//     const [isUpading, setIsUpating] = useState<boolean>(false)
//     const {updateLayerImage, layerData} = useAppContext()


//     const handleChange = (event:any) => {
//         const rawVal = event.target.value
//         const val = parseFloat(rawVal)

//         if (isNaN(val) || val < 0 ){
//             setHasError(true)
//         } else {
//             setHasError(false)
//         }

//         const layerIndex = layerData.findIndex(x => x.uid === props.layerUid);
//         const layer = layerData[layerIndex]

//         // let layerRarityTotal = 0;
//         // for(let i=0; i < layer.images.length; ++i){
//         //     const img = layer.images[i]

//         //     if (img.fileUid === props.imageUid) {
//         //         layerRarityTotal += val
//         //     } else {
//         //         layerRarityTotal += img.rarity  
//         //     }
//         // }

//         // if (layerRarityTotal > 100) {
//         //     setHasError(true)
//         // }

//         setValue(rawVal)
//     }

//     const onEdit = async () => {
//         setHasError(false)
//         setValue(props.rarity.toString())
//         setIsEdit(true)
//     }

//     const onSave = async () => {
//         if (hasError) {
//             toast({
//                 title: 'Wrong value',
//                 status: 'error',
//                 position: 'bottom',
//                 duration: 2200,
//                 isClosable: true,
//               })
//             return
//         }

//         if (props.rarity === parseFloat(value)){
//             setIsEdit(false)
//             return
//         }

//         setIsUpating(true)

//         if (!await updateLayerImage(props.imageUid, parseFloat(value))){
//             toast({
//                 title: 'Failed to update rarity',
//                 status: 'error',
//                 position: 'bottom',
//                 duration: 2200,
//                 isClosable: true,
//               })
//         }

//         setIsUpating(false)
//         setIsEdit(false)
//     }

//     const onCancel = async () => {
//         setIsEdit(false)
//     }

//     return (
//         <>
//             <Flex  flexDir='row' gap={2} backgroundColor='#f1f1f1' padding='5px' paddingLeft='8px' paddingRight='8px' borderRadius='5px' alignItems='center'>
//                 <Tooltip label='Rarity weight'>
//                     <Text fontSize='15px'>Weight:</Text>
//                 </Tooltip>
                

//                 {!isEdit && (
//                     <>
//                          <Text width='30px'>{props.rarity}</Text>
//                          <Flex onClick={onEdit} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' _hover={{backgroundColor: '#cccccc'}}>
//                             <Icon as={BiPencil} w={4} h={4} color='black' />
//                         </Flex>
                        
//                     </>
//                 )}

//                 {isEdit && (
//                     <>
//                         <Input isDisabled={isUpading} placeholder='...' isInvalid={hasError} type="number"  height='30px' value={value} onChange={handleChange} width='70px'  focusBorderColor={hasError?'#d42e22':'#49b9de'} />

//                         {!isUpading && (
//                             <>
//                                 <Flex onClick={onSave} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' _hover={{backgroundColor: '#cccccc'}}>
//                                         <Icon as={BiCheck} w={4} h={4} color='green' />
//                                 </Flex>

//                                 <Flex onClick={onCancel} alignItems='center' justifyContent='center' backgroundColor='#ffffff' padding='5px' borderRadius='5px' cursor='pointer' _hover={{backgroundColor: '#cccccc'}}>
//                                     <Icon as={BiX} w={4} h={4} color='red' />
//                                 </Flex>
//                             </>
//                         )}

//                         {isUpading && (<Spinner size='sm' color='blue.500' />)}
//                     </>
//                 )}
               
//             </Flex>
//         </>
//     )
// }