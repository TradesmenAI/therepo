import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import { AppProvider } from '../state/appContext'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { extendTheme } from "@chakra-ui/react"
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head'
import { useEffect } from 'react'


const theme = extendTheme({
  components: {
    Modal: {
      baseStyle: {
        dialogContainer: {
          padding: '10px'
        }
      }
    }
  }
})

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function App({ Component, pageProps }: AppProps<{ initialSession: Session, }>) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())


  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ChakraProvider theme={theme}>
        <AppProvider>
          <Head>
            <link rel="shortcut icon" href="/image/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/image/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/image/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/image/favicon-16x16.png" />
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`,
              }}
            />
            <script async src='https://r.wdfl.co/rw.js' data-domains='tradesmenai.com, tradesmenaiportal.com' data-rewardful='f53841'></script>
          </Head>
          <Component {...pageProps} />
        </AppProvider>
      </ChakraProvider>
    </SessionContextProvider>
  )
}
