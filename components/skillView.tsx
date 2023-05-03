import { Box, Button, Flex, Text, IconButton, Spinner } from "@chakra-ui/react";


export default function SkillView(props:{name: string, onClick:()=>void, isDisabled:boolean}) {

    let hoverStyle = {}

    if (!props.isDisabled){
        hoverStyle = {backgroundColor: '#f26157', color: 'white'}
    }

    const onBtnClick = () => {
        if (props.isDisabled){
            return;
        }

        props.onClick();
    }

    return (
        <Flex flexDir='row' gap={1} alignItems='center' justifyContent='center' backgroundColor='#7378921a'  borderRadius='5px'>
            <Box paddingY='5px' paddingX='10px'><Text fontSize={14}>{props.name}</Text></Box>
            <Flex onClick={onBtnClick} height='100%' alignItems='center' justifyContent='center' backgroundColor='#1b1f341a' width='28px' borderRadius='0 5px 5px 0' cursor='pointer' _hover={hoverStyle}>
                {!props.isDisabled && <Text>X</Text>}
                {props.isDisabled && <Spinner size='sm'/>}
            </Flex>
        </Flex>
    )
}