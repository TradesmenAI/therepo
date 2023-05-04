import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
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
import WriterIcon from '../components/icons/writer'
import CodeExample from '../components/codeExample'

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
    <div className="min-h-screen">
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
        <meta name="description" content="Ask your documents any question" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-full">
        
        {/* Header */}
        <div className="flex flex-row header p-3 justify-center items-center px-5">
          <div className="text-xl font-bold justify-center cursor-default">Chat with <span className="text-blue-500">Docs</span></div>
          <div className="flex-grow" />
          {/* <div className="flex flrex-row gap-4">
            <div className="cursor-pointer hover:underline">Features</div>
            <div className="cursor-pointer hover:underline">Blog</div>

          </div> */}
          <div className="flex-grow" />

          <div onClick={onOpen} className="bg-gray-800 h-10 w-20 text-center rounded-md cursor-pointer hover:bg-gray-600 text-white font-semibold justify-center items-center flex">
            Login
          </div>
        </div>

        <div className="w-full h-full flex flex-col  items-center p-2">
          <div className=" mt-5 flex flex-col lg:flex-row gap-5 top-block items-center">

            <div className="main-title-block flex items-center px-10 lg:px-0 flex-col lg:items-start gap-8  ">
              <div className="font-bold head-text text-center lg:text-left"><span className="text-sky-500">Chat with any document</span> in 2 lines of code using our API.</div>
            
              <div onClick={onOpen} className="hover:bg-blue-950 bg-blue-900 h-14 w-28 text-lg text-center rounded-md cursor-pointer  text-white font-semibold justify-center items-center flex">
                Try it!
              </div>
            </div>
          

            <CodeExample code={[]}/>
          </div>
        </div>

      

        
      </main>

      
    </div>
  )
}
