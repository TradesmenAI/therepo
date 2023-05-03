import { createContext, ReactNode, useContext, useState, useMemo, useEffect} from "react";
import { fetcher } from "../config";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import { uuidv4 } from "../utils";
export const sleep = (time:number) => new Promise(res => setTimeout(res, time, "done sleeping"));
import { CheckoutArgs } from "../pages/api/checkoutSession";
import { useRouter } from 'next/router'
import { useToast } from "@chakra-ui/react";

export interface AppContextType 
{
    profile: any|null,
    currentModal:string,
    setCurrentModal:any
    modalArgs:any, 
    setModalArgs:any,
    purchaseCredits:any,
    purchaseInProgress:boolean

}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {
    const session = useSession()
    const router = useRouter()

    const toast = useToast()


    const [profile, setProfile] = useState<any|null>(null);
    const [currentModal, setCurrentModal] = useState<string>('');
    const [modalArgs, setModalArgs] = useState<any>(null);
    const [purchaseInProgress, setPurchaseInProgress] = useState<boolean>(false);
  
    const fetchProfile = async() => {

        const res = await fetch('/api/getUserData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });
 
        if (res.status !== 200){
            toast({
                title: 'Failed to load profile',
                status: 'error',
                position: 'top',
                duration: 3000,
                isClosable: true,
            })
            return;
        }

        const data = await res.json();

        setProfile(data);
    };

    
    useEffect(() => {
        if (session){
            fetchProfile()
        }
    }, [session])

     

    const purchaseCredits = async () => {
        setPurchaseInProgress(true)

        const args:CheckoutArgs = {
            okUrl: window.location.href + '?purchaseResult=success&session_id={CHECKOUT_SESSION_ID}' ,
            errorUrl: window.location.href + '?purchaseResult=error'
        }

        const res = await fetch('/api/checkoutSession', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(args),
        })

        setPurchaseInProgress(false)

        if (res.status !== 200){
            toast({
                title: 'Failed to complete a purchase',
                status: 'error',
                position: 'top',
                duration: 3000,
                isClosable: true,
            })

            return;
        }

        const data = await res.json();

        console.log(data)

        window.location.href = data.url;
    }

    // todo use memo here
    const ctxVal:AppContextType = {
        profile,
        currentModal,
        setCurrentModal,
        modalArgs,
        setModalArgs,
        purchaseCredits,
        purchaseInProgress,
    } ;

    return (
        <AppContext.Provider value={ctxVal}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {

    const app = useContext(AppContext)

    if (!app) {
        console.error(
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in ` < AppProvider /> `",
        )
    }

    return app;
}