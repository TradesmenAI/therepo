import { useEffect, useState } from "react";
import { Flex, Text, Spacer, Input, Icon, Image, Spinner, Badge, Progress } from "@chakra-ui/react";
import 
{ 
    BiPencil,
    BiTrashAlt,
    BiLockOpenAlt,
    BiChevronUp,
    BiChevronDown,
} from "react-icons/bi";
import { ToastContainer, toast } from 'react-toastify';
// import RarityView from "./rarityView";
import FieldWithRename from '../components/fieldWithRename'
import {useAppContext} from '../state/appContext'

// type ImageProps = {
//     item: ILayerImage, 
//     layerIndex: number, 
//     imageIndex:number, 
//     onRemoveLayerImage?: (layerId:string, imageId:string) => void,
//     isUploading: boolean,
//     uploadError: boolean,
//     uploadProgress?: number,
//     layerUid:string
// }

// export default function LayerImage(props: ImageProps) {
//     const img = props.item;
//     const [isRemoving, setIsRemoving] = useState(false);
//     const [isHover, setHover] = useState(false);
//     const {updateLayerImageName} = useAppContext()

//     const onRemove = async () => {
//         if (props.onRemoveLayerImage) {
//             setIsRemoving(true)
//             await props.onRemoveLayerImage(props.layerUid, props.item.fileUid)
//         }
//     }

//     const onUpdateName = async(newName:string):Promise<boolean> => {
//         return await updateLayerImageName(props.item.fileUid, newName)
//     }

//     const validateName = (newName:string):boolean => {
//         if (!newName.trim()){
//             return false
//         }
        
//         return true
//     }

//     return (
//         <Flex onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}  backgroundColor='#21212105' marginTop='5px' marginBottom='7px'  width='100%' flexDir='row' alignItems='center'  gap='10px' border='1px solid #f0f0f0' padding='7px' borderRadius='5px' >
//              {isHover && !isRemoving && !props.isUploading && (
//                 <>
//                     <Flex cursor='pointer' onClick={(e) => {onRemove(); e.preventDefault();}} backgroundColor='#f03426' width='35px' height='35px' marginLeft='10px' borderRadius='5px' alignItems='center' justifyContent='center'>
//                         <Icon as={BiTrashAlt} w={4} h={4} color='#ffffff' />
//                     </Flex>
//                 </>
//             )}

//             <Image src={img.url} height='40px' borderRadius='4px'/>

//             <FieldWithRename fieldValue={img.imageName} onUpdate={onUpdateName} validateValue={validateName} />

//             <Spacer/>

//             {!props.isUploading && !isRemoving && !props.uploadError && (
//                  <RarityView rarity={img.rarity} imageUid={img.fileUid} layerUid={props.layerUid} />
//             )}

//             {props.isUploading && !props.uploadError && (
//                 <>
//                     <Spinner color='#60c0d1' />
//                 </>
//             )}

//             {props.uploadError && (
//                 <Badge colorScheme='red' fontSize='0.8em' padding={1}>Upload failed</Badge>
//             )}

//             {isRemoving && <Spinner color='red' />}

            
//         </Flex>
//     )
// }