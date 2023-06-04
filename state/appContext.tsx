import { createContext, ReactNode, useContext, useState, useMemo, useEffect} from "react";
import { fetcher } from "../config";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import { uuidv4 } from "../utils";
export const sleep = (time:number) => new Promise(res => setTimeout(res, time, "done sleeping"));
import { CheckoutArgs } from "../pages/api/checkoutSession";
import { useRouter } from 'next/router'
import { useToast } from "@chakra-ui/react";
import { UserData } from "../pages/api/listUsers";


export interface AppContextType 
{
    profile: any|null,
    currentModal:string,
    setCurrentModal:any
    modalArgs:any, 
    setModalArgs:any,
    subscribe:any,
    purchaseInProgress:boolean,
    updateProfile:(field_name:string, value:any)=>Promise<void>,
    updateUser:(user_uid:string, field_name:string, value:any)=>Promise<void>,

    openBillingPortal: any,
    getUsersList:()=>Promise<UserData[]>
}

export const Config = {
    plans: [
        {
            price: 14.99,
            color: '#5999ff',
            tierName: 'Basic',
            replies: 25,
            price_id: 'price_1NEYIGHNdYkf8k35cYzGdQYl'
        },
        {
            price: 24.99,
            color: '#e3d024',
            tierName: 'Essential',
            replies: 75,
            price_id: 'price_1NEYIZHNdYkf8k35OHtI78Tm'
        },
        {
            price: 34.99,
            color: '#ed8447',
            tierName: 'Advanced',
            replies: 250,
            price_id: 'price_1NEYJ6HNdYkf8k35sTJvikNi'
        },
        {
            price: 99.99,
            color: '#d43f87',
            tierName: 'Ultimate',
            replies: 1000,
            price_id: 'price_1NEYJJHNdYkf8k35GsHsv5eu'
        }
    ]
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
    const [isFetching, setIsFetching] = useState(false)
  
    const fetchProfile = async() => {
        const res = await fetch('/api/getUserData', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });

        setIsFetching(false)
 
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


    const updateProfile = async(field_name:string, value:any) => {
        const res = await fetch('/api/updateProfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({field_name, value})
        });
 
        if (res.status !== 200){
            toast({
                title: 'Failed to update profile',
                status: 'error',
                position: 'top',
                duration: 3000,
                isClosable: true,
            })
            return;
        }

        await fetchProfile()
    };

    const updateUser = async(user_uid:string, field_name:string, value:any) => {
        const res = await fetch('/api/updateUser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_uid, field_name, value})
        });
 
        if (res.status !== 200){
            toast({
                title: 'Failed to update user',
                status: 'error',
                position: 'top',
                duration: 3000,
                isClosable: true,
            })
            return;
        }
    };

    const getUsersList = async()=>{
        const res = await fetch('/api/listUsers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });

        if (res.status !== 200){
            return [];
        }

        const data = await res.json()

        return (data as UserData[])
    }

    const openBillingPortal = async() => {
        const res = await fetch('/api/manageSubscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });
 
        if (res.status !== 200){
            toast({
                title: 'Failed to open billing portal',
                status: 'error',
                position: 'top',
                duration: 3000,
                isClosable: true,
            })
            return;
        }

        const data = await res.json();
        window.location.href = data.portal_url;
    };

    
    useEffect(() => {
        if (session && !isFetching){
            setIsFetching(true)
            fetchProfile()
        }
    }, [session])

     

    const subscribe = async (price_id:string) => {
        setPurchaseInProgress(true)

        const args:CheckoutArgs = {
            okUrl: window.location.href + '?purchaseResult=success&session_id={CHECKOUT_SESSION_ID}' ,
            errorUrl: window.location.href + '?purchaseResult=error',
            price_id
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
        subscribe,
        purchaseInProgress,
        updateProfile,
        openBillingPortal,
        getUsersList,
        updateUser
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