import { 
    Box,
    Flex
} from '@chakra-ui/react'
import Sidebar from '../components/sidebar'
import AreaChartX from '../components/areaChart';
import ContentHeader from '../components/contentHeader';
import BarChartX from '../components/barChartX';



function getRandomInt(max:number) {
    return Math.floor(Math.random() * max);
}



export default function Analytics() {
    let totalSalesData: any = [];
    let total = 0;
    let lastSales: any = [];
    let uniqueHolders: any = [];

    let listedPercent: any = [];
    let stakedPercent: any = [];


    for(let i = 0; i < 15; ++i){
        const delta = getRandomInt(300);
        total += delta;
        totalSalesData.push({name: `Oct ${i+1}`, Revenue: total});
        lastSales.push({name: `Oct ${i+1}`, Revenue: delta});

        uniqueHolders.push({name: `Oct ${i+1}`, Holders: 300 + getRandomInt(300)});

        listedPercent.push({name: `Oct ${i+1}`, Listed: getRandomInt(100)});
        stakedPercent.push({name: `Oct ${i+1}`, Staked: getRandomInt(100)});
    }


    return (
        <Flex dir='row' height='100%'> 
           <Sidebar/>

           <Flex padding='20px' flexDir='column' flexGrow={1} gap={10} height='100vh'  overflowY='scroll' overflowX='hidden'>
                <ContentHeader title='Analytics'/>
                <Flex flexDirection='row'>
                    <AreaChartX label='Total sales' data={totalSalesData} dataKey="Revenue" />
                    <AreaChartX label='Last sales' data={lastSales} dataKey="Revenue" />
                </Flex>

                <Flex flexDirection='row'>
                    <AreaChartX label='Listed %' data={listedPercent} dataKey="Listed" />
                    <AreaChartX label='Staked %' data={stakedPercent} dataKey="Staked" />

                </Flex>

                <Flex flexDirection='row'>
                    <AreaChartX label='Unique holders' data={uniqueHolders} dataKey="Holders" />
                </Flex>
           </Flex>
        </Flex>
    );
}