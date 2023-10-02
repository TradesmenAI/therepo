import { useRouter } from "next/router"
import { redirect } from 'next/navigation'
import { useEffect } from "react";

export default function R(){
    const router = useRouter()
    const via = router.query.via as string;

     useEffect(()=>{
        if (!via){
            return;
        }

        //@ts-ignore
        window.rewardful('ready', function() {
            //@ts-ignore
            if(window.Rewardful.referral) {
                //@ts-ignore
              console.log('Current referral ID: ', window.Rewardful.referral);
            } else {
              console.log('No referral present.');
            }

            window.location.href=`https://tradesmenai.com?via=${via}`
          });
        
    }, [via])


    return <></>
}