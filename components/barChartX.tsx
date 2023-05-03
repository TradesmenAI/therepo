import { ResponsiveContainer, BarChart, Bar, Label, LabelList,Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
const data = [{name: 'Page A', uv: 400, pv: 2400, amt: 2400},{name: 'Page A', uv: 500, pv: 2000, amt: 200}];
import { Box } from '@chakra-ui/react';

export default function BarChartX() {
    return (
        <Box height={250} width='50%'>
            <ResponsiveContainer width='100%' height={250}>
                <BarChart 
                    width={730} 
                    height={250} 
                    data={data} 
                    margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name">
                        <Label value="Pages of my website" offset={0} position="insideBottom" />
                    </XAxis>
                    <YAxis label={{ value: 'pv of page', angle: -90, position: 'insideLeft' }} />
                    <Bar dataKey="pv" fill="#8884d8">
                        <LabelList dataKey="name" position="top" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
        
    )
}