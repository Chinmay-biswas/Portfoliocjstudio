import { FaJava, FaReact, FaNodeJs } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiPython, SiMongodb, SiCanva } from "react-icons/si";
import { LuSparkles } from "react-icons/lu";
import { TbBrandCSharp, TbBrandCpp } from "react-icons/tb";
import { BsUnity, BsClipboard2Data } from "react-icons/bs";
import { motion, useMotionValue } from "framer-motion";
import { useState ,useRef, useEffect } from "react";



export default function Skille(){


const skills = [
  { icon: <FaJava />, name: "Java" },
  { icon: <FaReact />, name: "React" },
  { icon: <SiNextdotjs />, name: "Next.js" },
  { icon: <SiTypescript />, name: "TypeScript" },
  { icon: <SiTailwindcss />, name: "Tailwind CSS" },
  { icon: <FaNodeJs />, name: "NodeJS" },
  { icon: <SiPython />, name: "Python" },
  { icon: <LuSparkles />, name: "AI" },
  { icon: <TbBrandCSharp />, name: "C#" },
  { icon: <SiMongodb />, name: "MongoDB" },
  { icon: <TbBrandCpp />, name: "C++" },
  { icon: <BsUnity />, name: "UNITY" },
  { icon: <SiCanva />, name: "Canva" },
  { icon: <BsClipboard2Data />, name: "Data Science" },
];


const repeated =[...skills,...skills]



const [dir, setDir] = useState(-1);
const [active ,setActive]= useState(false);
const sectionRef = useRef(null);
const trackRef = useRef(null);
const touchY = useRef(null);
const x=useMotionValue(0);


useEffect(()=>{
const el = sectionRef.current;
if(!el) return;
const io = new IntersectionObserver((
  [entry]) =>{setActive(entry.isIntersecting && entry.intersectionRatio>0.1);

  },{threshold : [0.1]}

)
io.observe(el);
return()=>io.disconnect();

},[])
 

useEffect(()=>{
  if(!active)return;
  const onWheel = (e)=> setDir(e.deltaY>0?-1:1); 
  const onTouchStart=(e)=>(touchY.current=e.touches[0].clientY);
  const onTouchMove = (e) =>{
    if(touchY.current==null)return;
    const delta = e.touches[0].clientY-touchY.current;
    setDir(delta>0?1:-1);
    touchY.current=e.touches[0].clientY;
  
};

window.addEventListener('wheel', onWheel,{passive:true});
window.addEventListener('touchstart', onTouchStart,{passive:true});
window.addEventListener('touchmove', onTouchMove,{passive:true});

return()=>{

  window.removeEventListener('wheel', onWheel);
window.removeEventListener('touchstart', onTouchStart);
window.removeEventListener('touchmove', onTouchMove);

}},[active]
);


useEffect(()=>{
  let id;
  let last=performance.now();
  const SPEED =80;

  const tick =(now)=>{
    const dt = (now-last)/1000;
    last=now;
    let next=x.get()+SPEED*dir*dt;
    const loop = trackRef.current?.scrollWidth/2||0;

    if(loop){
      if(next<=-loop )next +=loop;
      if(next>=0)next -=loop;
    }
    x.set(next)
     id = requestAnimationFrame(tick)

  }
  id = requestAnimationFrame(tick)
  return()=>cancelAnimationFrame(id);
 
},[dir,x]);



  return(
    <section id="skills" 
    ref={sectionRef}
    className="h-1/2 w-full pb-8 flex flex-col items-center 
    justify-center relative bg-black text-white overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div
              className="absolute top-1/4 left-0 
              w-[300px] 
              h-[300px] 
              max-w-[500px] max-h-[500px] 
              rounded-full 
              bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2]
              opacity-20
              blur-[120px] 
              animate-pulse"
            >
            </div>
            <div
               className="absolute bottom-1/4 right-0 
              w-[300px] 
              h-[300px] 
              max-w-[500px] max-h-[500px] 
              rounded-full 
              bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2]
              opacity-20
              blur-[120px] 
              animate-pulse
              delay-600"
            >
            </div>
      </div>
      <motion.h2 className=" mt-8 text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent 
      bg-gradient-to-r from-[#1cd8d2] via-[#00bf8f] to-[#302b63] z=10 hover:scale-110 transition"
      initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{duration: .4}} 
            /* here can use once=ture  for one time animation  */>
        My Skills
      </motion.h2>

      <motion.p className="mt-3 mb-8 text-white text-base sm:text-lg z-10 hover:scale-102 transition"
      initial={{ opacity:0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{duration: .4}}>
        Modern Application | Modern Technologies | Modern Solutions

      </motion.p>





      <div className="relative w-full overflow-hidden py-10">
        <motion.div 
        ref={trackRef}
          style={{ x,whiteSpace:"nowrap",willChange:"transform" }}
        className="flex gap-10 text-6xl text-[#1cd8d2]">
          {repeated.map((s,i)=>(
            <div key={i} className="flex flex-col items-center gap-2 min-w-[120px]"
            aria-label={s.name}
            title = {s.name}
            >
              <span className="hover:scale-125 transition-transform duration-300">
                {s.icon}
              </span>
              <p className="text-sm hover:scale-125 transition duration-300">
                {s.name}
              </p>

            </div>
          ))}

        </motion.div>

      </div>

    
    </section>
  )
}