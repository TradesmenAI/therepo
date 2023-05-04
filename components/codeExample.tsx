import { useState, useRef, useEffect } from "react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import autosize from 'autosize';

export interface CodeExample {
    code: string,
    language: string
}

export default function CodeExample({code}: {code:CodeExample[]}){
    const [selected, setSelected] = useState(0)
    const textAreaRef = useRef(null);
    const [val, setVal] = useState('')
    const [ style, setStyle ] = useState({})
    const [isCopy, setIsCopy] = useState(false)

    const onCopy = ()=>{
        navigator.clipboard.writeText(data[selected].code);
        setIsCopy(true)
    }


    useEffect(() => {
        if (textAreaRef && textAreaRef.current){
            //@ts-ignore
            textAreaRef.current.style.height = "0px";
            //@ts-ignore
            const scrollHeight = textAreaRef.current.scrollHeight;
            //@ts-ignore
            textAreaRef.current.style.height = scrollHeight + "px";
        }
    }, [val, textAreaRef]);

    useEffect(() => {
        import('react-syntax-highlighter/dist/esm/styles/prism/material-dark')
        .then(mod => setStyle(mod.default));
      })
    

    const data:CodeExample[] = [
        {
            code: `url = "https://api.chatwithdocs.co/uploadDoc"
headers = {"Authorization": "Bearer {YOU_API_KEY}"}
            
requests.post(url, data=data, headers=headers)`,
            language: 'Python'
        },
        {
            code: `fetch('URL_GOES_HERE', { 
    method: 'post', 
    headers: new Headers({
        'Authorization': 'Basic '+('username:password'), 
        'Content-Type': 'application/x-www-form-urlencoded'
    }), 
    body: 'A=1&B=2'
});`,
            language: 'JS'
        }
    ]



    useEffect(()=>{
        setVal(data[selected].code)
    }, [selected])

    const codeVal = data[selected].code


    return <>
        <div className="code-examples flex flex-col code-w-big mt-10 ">
            <div className="code-header flex flex-row items-center justify-center">
                <div>Ask question</div>
                <div className="flex-grow" />
                {isCopy && <div className="mr-1 text-sm">Copied!</div>}
                <div onClick={onCopy} className="copy-icon flex items-center justify-center"><IconBxCopy/></div>
            </div>
            
            <div className="flex flex-row gap-2 p-2">
                {data.map((item:CodeExample, index:number)=>{
                    return (<div onClick={()=>setSelected(index)} className={`lang-button` + (selected === index?' selected':'')}>
                        {item.language}
                    </div>)
                })}
            </div>

            <div className="p-2 xx">
                {/* <SyntaxHighlighter language="javascript" style={style} showLineNumbers={true} customStyle={{
                    backgroundColor: 'rgb(26, 28, 37)',
                    padding: 0,
                    '&::WebkitScrollbar': { width: 0, height: 0 }
                }} 
                >
                {data[selected].code}
                </SyntaxHighlighter> */}

                <div className="editor w-full">
                    <div className="line-numbers">
                        {data[selected].code.split('\n').map((x)=><span></span>)}
                    </div>
                    <textarea ref={textAreaRef} disabled className="txt w-full" value={data[selected].code}></textarea>
                </div>
            </div>
        </div>
    </>
}

function IconBxCopy(props:any) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        height="18px"
        width="18px"
        {...props}
      >
        <path d="M20 2H10c-1.103 0-2 .897-2 2v4H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2v-4h4c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM4 20V10h10l.002 10H4zm16-6h-4v-4c0-1.103-.897-2-2-2h-4V4h10v10z" />
      </svg>
    );
  }