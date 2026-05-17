import { AnimatePresence,motion } from "framer-motion";
import { useEffect, useMemo,useState } from "react"


export default function IntroAnimation({onFinish}) {
  const greetings = useMemo(() => [
    "hello", "hi", "hey", "welcome", "greetings", "salutations", "howdy"
  ], [])

  const[index,setIndex] = useState(0);
  const[visible,setVisible] = useState(true);


  useEffect(() => {
    if(index<greetings.length-1){
      const id = setInterval(() => {
        setIndex(i => i + 1);
      }, 200);
      return () => clearInterval(id);
    }
    else{
      const timeout = setTimeout(() => {
  setVisible(false)
}, 500)

return () => clearTimeout(timeout)
      
    }
  },[index,greetings.length])

return (


  <AnimatePresence onExitComplete={onFinish}>
    {visible && (
      <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white overflow-hidden"
      initial={{y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{duration: 1.05 , ease:[0.22, 1, 0.36, 1],

        }}
      >
        <motion.h1
        key={index}
        className="text-6xl md:text-8xl lg:text-9xl font-bold "

        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{duration: .1}}
        >
        {greetings[index]}

        </motion.h1>

      </motion.div>
    )}

  </AnimatePresence>



)


}
