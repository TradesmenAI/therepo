import { Box, Button, Flex, Text, IconButton, Spinner } from "@chakra-ui/react";
import { useState } from "react";


export default function SelectableSkillView(props:{name: string, onClick:(state:boolean)=>void, isDisabled:boolean}) {
    const [selected, setSelected] = useState<boolean>(false)

    const onBtnClick = () => {
        if (props.isDisabled){
            return;
        }
        const newState = !selected;
        setSelected(newState)

        props.onClick(newState);
    }

    const bgColor = selected?'#90cdff':'#7378921a'

    return (
        <Flex onClick={onBtnClick} cursor='pointer' flexDir='row' gap={1} alignItems='center' justifyContent='center' backgroundColor={bgColor}  borderRadius='5px'>
            <Box paddingY='5px' paddingX='10px'><Text unselectable="on" fontSize={14}>{props.name}</Text></Box>
        </Flex>
    )
}