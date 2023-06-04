import { EditablePreview, 
    Box, 
    useColorModeValue, 
    IconButton, 
    Input, 
    useDisclosure, 
    useEditableControls, 
    ButtonGroup, 
    SlideFade, 
    Editable, 
    Tooltip, 
    EditableInput ,
    EditableTextarea,
    Flex
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

interface Props {
    onSave: (val:string)=>void,
    value:string
}

export default function DataCell(props:Props) {
    const [val, setVal] = useState(props.value)

    function EditableControls() {
        const {
            isEditing,
            getSubmitButtonProps,
            getCancelButtonProps,
            getEditButtonProps,
          } = useEditableControls()

          
          return isEditing ? (
            <ButtonGroup justifyContent='center' size='sm'>
              <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} aria-label='Ok' />
              <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} aria-label='Cancel'/>
            </ButtonGroup>
          ) : 
           (
            <Flex justifyContent='center'>
              <IconButton size='sm' icon={<EditIcon />} {...getEditButtonProps()} aria-label='Edit'  position='absolute' top='5px' right='5px' />
            </Flex>
          )
    }
    
    return (
        <Editable
          defaultValue={val}
          value={val}
          onChange={(newVal:string)=>{setVal(newVal);}}
          onSubmit={()=>props.onSave(val)}
          isPreviewFocusable={true}
          position='relative' 
          display='flex'
          flexDir='column'
          gap='5px'
          backgroundColor='#ffffff'
          border='1px solid #ddd'
          width='100%'
          minH='60px'
          padding='10px'
          maxH='200px' 
          overflowY='scroll'
          sx={{
            "::-webkit-scrollbar": {
                width: '6px'
            },
            "::-webkit-scrollbar-track": {
                background: '#e2e2e2' 
            },
            "::-webkit-scrollbar-thumb": {
                background: '#c8c8c8' 
            },
              
              /* Handle on hover */
            "::-webkit-scrollbar-thumb:hover": {
                background: '#adacac'
            }
            
        }}
>
          <EditablePreview  whiteSpace='pre-line' width='100%' />
          {/* Here is the custom input */}
          <EditableTextarea minW='100%' minH='60px' />
          <EditableControls  />
        </Editable>
      ) 
}