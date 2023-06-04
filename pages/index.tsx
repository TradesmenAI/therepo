'use client'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { Auth} from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  Theme
} from '@supabase/auth-ui-shared'
import { useEffect } from 'react'
import useLocalStorage from "use-local-storage";
import HeaderBlock from '../components/headerBlock'


const ThemeCustom: Theme = {
  default: {
    colors: {
      brand: "black",
      brandAccent: "#292929",
      brandButtonText: "white",
      defaultButtonBackground: "white",
      defaultButtonBackgroundHover: "#eeeeee",
      defaultButtonBorder: "lightgray",
      defaultButtonText: "black",
      dividerBackground: "#eaeaea",
      inputBackground: "transparent",
      inputBorder: "lightgray",
      inputBorderHover: "gray",
      inputBorderFocus: "gray",
      inputText: "black",
      inputLabelText: "gray",
      inputPlaceholder: "darkgray",
      messageText: "gray",
      messageTextDanger: "red",
      anchorTextColor: "gray",
      anchorTextHoverColor: "darkgray",
    },
    space: {
      spaceSmall: "4px",
      spaceMedium: "8px",
      spaceLarge: "16px",
      labelBottomMargin: "8px",
      anchorBottomMargin: "4px",
      emailInputSpacing: "4px",
      socialAuthSpacing: "4px",
      buttonPadding: "10px 15px",
      inputPadding: "10px 15px",
    },
    fontSizes: {
      baseBodySize: "13px",
      baseInputSize: "14px",
      baseLabelSize: "14px",
      baseButtonSize: "15px",
    },
    fonts: {
      bodyFontFamily: `ui-sans-serif, sans-serif`,
      buttonFontFamily: `ui-sans-serif, sans-serif`,
      inputFontFamily: `ui-sans-serif, sans-serif`,
      labelFontFamily: `ui-sans-serif, sans-serif`,
    },
    // fontWeights: {},
    // lineHeights: {},
    // letterSpacings: {},
    // sizes: {},
    borderWidths: {
      buttonBorderWidth: "1px",
      inputBorderWidth: "1px",
    },
    // borderStyles: {},
    radii: {
      borderRadiusButton: "4px",
      buttonBorderRadius: "4px",
      inputBorderRadius: "4px",
    },
    // shadows: {},
    // zIndices: {},
    // transitions: {},
  },
  dark: {
    colors: {
      brandButtonText: "white",
      defaultButtonBackground: "#2e2e2e",
      defaultButtonBackgroundHover: "#3e3e3e",
      defaultButtonBorder: "#3e3e3e",
      defaultButtonText: "white",
      dividerBackground: "#2e2e2e",
      inputBackground: "#1e1e1e",
      inputBorder: "#3e3e3e",
      inputBorderHover: "gray",
      inputBorderFocus: "gray",
      inputText: "white",
      inputPlaceholder: "darkgray",
    },
  },
};

export default function Home() {
  const session = useSession()
  const supabase = useSupabaseClient()
  let router = useRouter()
  const { buyPlan } = router.query;
  const [plan, setPlan] = useLocalStorage("buyPlan", "");

  useEffect(()=>{
    if (buyPlan){
      //@ts-ignore
      setPlan(buyPlan)
    }
  }, [buyPlan])

  useEffect(()=>{
    if (session){
      router.push('/app');
    } 
  }, [session])


  return (
    <div className="min-h-screen bg-gray-100">
  
      <Head>
        <title>Login</title>
        <meta name="description" content="Login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
 
      <div className="h-screen flex flex-col justify-center items-center">
      
        <div className="flex m-auto flex-col main-col p-5 price-block items-center justify-center">
          <HeaderBlock/>
          <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeCustom }}
              theme="default"
              providers={['google']}
              magicLink
              // onlyThirdPartyProviders
          />
        </div>
      </div>

    </div>
  )
}
