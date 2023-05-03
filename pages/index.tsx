import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { 
  Flex, Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,ModalCloseButton,
  Button,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { Auth, ThemeSupa, ThemeMinimal } from '@supabase/auth-ui-react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Theme } from '@supabase/auth-ui-react/dist/esm/src/types'


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
  const { isOpen, onOpen, onClose } = useDisclosure()

  if (session){
    router.push('/app');
    return;
  } else {
    console.log(session)
  }



  return (
    <div className={styles.container}>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeCustom }}
              theme="default"
              providers={['google', 'github']}
            />
          </ModalBody>
        </ModalContent>
      </Modal>



      <Head>
        <title>Chat with Docs</title>
        <meta name="description" content="Resumes that convert" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <Link href="/">Chat with docs!</Link>
        </h1>

        <button onClick={onOpen} className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white w-20" >
          Login
        </button>

        
      </main>

      
    </div>
  )
}
