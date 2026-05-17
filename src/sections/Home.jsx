
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import React, { useMemo , useState } from "react";
import ParticlesBackground from "../components/ParticlesBackground";
import { hover, motion } from "framer-motion";
import avator from "../assets/avator.png"



const socials= [ 
  {Icon: FaInstagram,label:"Instagram", href: "https://instagram.com/chinmaybiswas475"},
  {Icon: FaLinkedinIn,label:"LinkedIn", href: "https://www.linkedin.com/in/chinmay-biswas-a8098b298/"},
  {Icon: FaGithub,label:"GitHub", href: "https://github.com/ChinmayBiswas"}
]

const glowvariants={
  initial:{scale:1,y:0,filter:"drop-shadow(0 0 0 rgba(255,255,255,0.6))"},
  hover:{
    scale:1.2,y:-3,
    filter:"drop-shadow(0 0 8px rgba(13,88,204,0.9)) drop-shadow(0 0 18px rgba(16,185,129,0.8))",
    transition:{type:"spring", stiffness:300, damping:15}
  },
  tap:{scale:0.95,y:0, transition:{duration:0.08}}
}



export default function Home() {

const roles= useMemo(() => ["MERN stack Developer", "C++ Programmer", "Game Developer","AI & ML Engineer"],[])
const [index, setIndex] = useState(0);
const [subIndex, setSubIndex] = useState(0);
const [deleting, setDeleting] = useState(false);

React.useEffect(() => {

  const current = roles[index];
  const timeout = setTimeout(() => {
    if (!deleting && subIndex < current.length) {
  setSubIndex((v) => v + 1);
}

else if (!deleting && subIndex === current.length) {
  setDeleting(true);
}

else if (deleting && subIndex > 0) {
  setSubIndex((v) => v - 1);
}

else if (deleting && subIndex === 0) {
  setDeleting(false);
  setIndex((p) => (p + 1) % roles.length);
}
 }, 
  !deleting && subIndex === current.length
    ? 1500   // wait after full word
    : deleting
    ? 70     // deleting speed
    : 140    // typing speed
);
  return () => clearTimeout(timeout);

},[subIndex, deleting, index, roles])


  return (
    <section id="home" className="w-full h-screen relative bg-black overflow-visible">
      <ParticlesBackground/>

      <div className="absolute inset-0">

              <div
              className="absolute -top-32 -left-32 
              w-[70vw] sm:w-[50vw] md:w-[40vw] 
              h-[70vw] sm:h-[50vw] md:h-[40vw]
              max-w-[500px] max-h-[500px] 
              rounded-full 
              bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2]
              opacity-30 sm:opacity-20 md:opacity-10
              blur-[100px] sm:blur-[130px] md:blur-[150px]
              animate-pulse"
            >
            </div>
        <div
              className="absolute top-[58%] left-[70%]
              w-[70vw] sm:w-[50vw] md:w-[40vw] 
              h-[70vw] sm:h-[50vw] md:h-[40vw]
              max-w-[500px] max-h-[500px] 
              rounded-full 
              bg-gradient-to-r from-[#302b63] via-[#00bf8f] to-[#1cd8d2]
              opacity-30 sm:opacity-20 md:opacity-10
              blur-[100px] sm:blur-[130px] md:blur-[150px]
              animate-pulse delay-1000"
            >
            </div>
      </div>

      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 ">
        <div className="flex flex-col justify-center h-full text-center lg:text-left relative">
          <div className="w-full lg:pr-24 mx-auto max-w-[48rem]">


            

            <motion.h1 className=" mt-13 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text
            bg-gradient-to-r from-[#1cd8d2] via-[#00bf8f] to-[#302b63] text-transparent"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 2}} 
            >
              Hello I'm <br/>
              <span className=" text-white font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl lg:whitespace-nowrap">
              Chinmay Biswas
              </span>

              <motion.div
            className="mb-1 mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white tracking-wide min-h-[60px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 0.6 }}
            >

              <span>
                {roles[index].substring(0, subIndex)}

              </span>
              <span className="ml-1 inline-block w-[2px] align-middle bg-white animate-pulse" style={{height:"1em"}}></span>

            </motion.div>

            </motion.h1>
            <motion.p className="mt-1 text-sm sm:text-sm md:text-md text-gray-300 max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{delay:0.5,duration: 1.5}} 
            >
              I’m a passionate developer and technology enthusiast focused on building modern, 
              intelligent, and interactive digital experiences. With skills in MERN stack development, 
              C++ programming, game development, and AI & ML, I enjoy turning creative ideas into real-world
               applications that are both functional and impactful. I’m constantly learning, experimenting, and pushing 
               my limits to create innovative solutions through code
            </motion.p>

            

            <motion.div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 z-60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{delay:.7,duration: 1.3}} 
            >
              <a href="#projects" className="bg-linear-to-r from-[#1cd8d2] via-[#00bf8f] to-[#302b63] text-white px-5 py-3 rounded-full font-medium shadow-lg hover:scale-105 transition-all">
                View My Work
              </a>
                  <div className="relative group">

  {/* Resume Button */}
  <button
    className="text-white px-5 py-3 rounded-full font-medium 
    border border-gray-500 hover:bg-gray-700 
    transition-all duration-300"
  >
    Resume ▸
  </button>

  {/* Side Resume Cards */}
  <div
    className="
absolute

md:left-[280%] md:top-1/2 md:-translate-y-1/2

top-full left-1/2 -translate-x-1/2 mt-4

opacity-0 invisible
group-hover:opacity-100 group-hover:visible

transition-all duration-300 delay-200
z-[10]
"
  >

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-[300px] md:w-[420px]">

      {/* AI/ML */}
      <a
        href="https://drive.google.com/uc?export=download&id=1gNBCk-O8Ni1ShAP6OJ5WJz0YC6YVUtab"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#111] border border-gray-700 text-white
        px-5 py-4 rounded-2xl text-center
        hover:text-xl hover:scale-105
        transition-all duration-300"
      >
        AI / ML
      </a>

      {/* Full Stack */}
      <a
        href="https://drive.google.com/uc?export=download&id=1rME9-eQFsywtZMUrjUdYy25pdKwLQh2F"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#111] border border-gray-700 text-white
        px-5 py-4 rounded-2xl text-center
        hover:text-xl hover:scale-105
        transition-all duration-300"
      >
        Full Stack
      </a>

      {/* Game Dev */}
      <a
        href="https://drive.google.com/uc?export=download&id=1Yj3sF9q0Xt6fJ7hm5Z2b0nkOl1L1j_ut"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#111] border border-gray-700 text-white
        px-5 py-4 rounded-2xl text-center
        hover:text-xl hover:scale-105
        transition-all duration-300"
      >
        Game Dev
      </a>

      {/* C++ / SDE */}
      <a
        href="https://drive.google.com/uc?export=download&id=1P0YD8YlBVQtQeQ7UBjIAPb0H-6xLLwrQ"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#111] border border-gray-700 text-white
        px-5 py-4 rounded-2xl text-center
        hover:text-xl hover:scale-105
        transition-all duration-300"
      >
        C++ / SDE
      </a>

    </div>

  </div>

</div>
             </motion.div>

                <div className="mt-3 flex gap-5 text-2xl md:text-3xl justify-center lg:justify-start">
                  {socials.map(({ Icon,label,href }) => (
                    <motion.a 
                    href={href}
                    target="_blank"
                    key={label}
                    aria-label={label}
                    rel="noopener norefrence"
                    variants={glowvariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="text-gray-300"
                    
                    
                    >
                      <Icon/>



                    </motion.a>
                      
                      
                    
                  ))}
                </div>


          </div>
        </div>


                  
                    


                    <div className="hidden lg:block relative">

                      <div
                      className="absolute top-1/2 -translate-y-1/2 pointer-events-none"

                        style={{
                          right: "10px",width:"min(30vw , 900px)", minHeight:"min(30vw , 750px)", borderRadius:"50%",
                          filter: "blur(38px)",
                          opacity: 0.32,
                          background:"conic-gradient(from 0deg, #1cd8d2,  #00bf8f,#302b63,#1cd8d2)"
                        
                        }}
                      />



                      <motion.img
                      src={avator}
                      alt="Home Cartoon"
                      className="absolute top-1/2 -translate-y-1/2 object-contain select-none pointer-events-none"
                      style={{right: "60px" ,width:"min(25vw , 780px)", maxHeight:"90vh"}}
                      initial={{ opacity: 0, y: 40 ,scale:0.7}}
                      animate={{ opacity: 1, y: 0, scale :1 }}
                      transition={{duration: 1, delay:0}} 
                      />
                    </div>



      </div>

    </section>

  )
}