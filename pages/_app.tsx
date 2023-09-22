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
import Script from 'next/script'

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

          <Script
            id='fb-pix-custom'
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{

              __html: `!function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '831265711912074');
                fbq('track', 'PageView');`,
            }}
          />


          <noscript><img height="1" width="1" alt='tt' style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=831265711912074&ev=PageView&noscript=1"
          /></noscript>

          <Script
            id='google-pix-custom'
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{

              __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', 'G-D6869NDDFW');`,
            }}
          />

          <script async src="https://www.googletagmanager.com/gtag/js?id=G-D6869NDDFW"></script>

          <Component {...pageProps} />
        </AppProvider>
      </ChakraProvider>
    </SessionContextProvider>
  )
}
