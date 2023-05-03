import { ResponsiveContainer, ReferenceLine, LineChart, Line, Label, AreaChart,Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Box, Text } from '@chakra-ui/react';




export default function AreaChartX(props: {label: string, dataKey: string, data: any}) {

  
    return (
        <Box height={250} width='50%'>
            <Text textAlign='center' fontSize='16px' width='100%' fontWeight='bold'>{props.label}</Text>

            <ResponsiveContainer width='100%' height={250}>
                    <AreaChart data={props.data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name">
                </XAxis>
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                    labelFormatter={value => {
                        return `Date: ${value}`;
                    }} 
                    formatter={(value, name, props) => {
                        return `$${value}`;
                    }}
                    />
                <ReferenceLine x="Page C" stroke="green" />
                <ReferenceLine y={4000} label="Max" stroke="red" strokeDasharray="3 3" />
                <Area type="monotone" dataKey={props.dataKey} stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
            </ResponsiveContainer>
            
        </Box>
        
    )
}