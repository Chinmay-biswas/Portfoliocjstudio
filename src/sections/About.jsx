import { delay, motion } from "framer-motion";
import p from "../assets/boy.jpg"

export default function About() {

  const glows = [
    "-top-10 -left-10 w-[360px] h-[360px] opacity-20 blur-[120px]",
    "bottom-0 right-0 w-[420px] h-[420px] opacity-15 blur-[140px] delay-400",
    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] opacity-10 blur-[100px] delay-200",
  ]

  const stats=[{ label: "Projects", value: "7+" }, 
    { label: "Strength", value: "Problem Solving by integrating multiple technologies" }, 
    { label: "Speciality", value: "Work in any fields" }];

  return (
    <section id='about'
    className="min-h-screen w-full flex items-center justify-center relative bg-black text-white overflow-hidden"

    >

      <div className="absolute inset-0 pointer-events-none">
        {glows.map((c,i)=>(
          <div key={i}
          className={`absolute rounded-full bg-gradient-to-r from-[#1cd8d2] via-[#00bf8f] to-[#302b63] animate-pulse ${c}`}/>
        ))}</div>

          <div className="relative z-10 max-w-6xl w-full mx-auto px-6 md:px-10 lg:px-12 py-20 flex flex-col  gap-12">

            <motion.div className="flex flex-col md:flex-row items-center md:items-stretch gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 1}} 
            viewport={{ amount:0.6}} /* here can use once=ture  for one time animation  */
            >

          

              <motion.div className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px]
              rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1cd8d2]/20  to-[#302b63]/20 
              border-[#1cd8d2]/25 "
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }} 
              initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.2}}>
                <img src={p} alt="profile " className=" absolute inset-0"/>
              </motion.div>

              <div className=" flex-1 flex flex-col justify-center text-center md:text-left">
                <motion.div initial={{ opacity:0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.4}}>
                  <h2 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent 
                  bg-gradient-to-r from-[#1cd8d2] to-[#b2e0d7] hover:scale-102 transition"
                 >
                  Chinmay Biswas
                </h2>
                <p className="mt-2 text-lg sm:text-xl text-gray-300 font-semibold hover:scale-102 transition">
                   web developer | open source enthusiast | lifelong learner
                </p>
                <p className="mt-4 text-gray-400 max-w-2xl md:max-w-3xl leading-relaxed sm:text-lg">
                  I'm a passionate web developer with a knack for crafting beautiful and functional websites. With expertise in React, Tailwind CSS, and JavaScript, I create seamless user experiences. I thrive on learning new technologies and contributing to open source projects. Let's build something amazing together!
                </p></motion.div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4  mx-w-xl">
                  {stats.map((item,i) => (

                    <motion.div key={i} className="border-2 border-white/10 px-4 py-3 
                    text-center rounded-xl inline-block hover:scale-105 transition"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{opacity:1,y:0}}
                    
                    transition={{delay:(i*0.3),duration:0.4}}
                    viewport={{amount:0.6}}>
                      <div className=" font-semibold text-white text-lg hover:scale-103 transition">
                        {item.label}</div>
                        <div className="text-mauve-400  mt-2 hover:scale-103 transition">
                          {item.value}
                        </div>
                      </motion.div>

                  ))}

                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                  <a href="#projects" className="inline-flex items-center justify-center rounded-lg bg-white text-black font-semibold px-5 py-3 hover:bg-gray-200 transition hover:scale-95">View Project</a>
                  <a href="#contact" className="inline-flex items-center justify-center rounded-lg bg-transparent text-white font-semibold px-5 py-3 border-2 border-white hover:bg-white hover:text-black transition hover:scale-95">Get In Touch</a>
                </div>

              </div>


            </motion.div>

          
                  <motion.div className="text-center md:text-left"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.5}} /* here can use once=ture  for one time animation  */
                  > 

                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      
                      About Me </h3>
                      <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                        i am a software developer with a passion for creating innovative and efficient solutions. With a strong background in computer science and experience in various programming languages, I enjoy tackling complex problems and building applications that make a difference. I am always eager to learn new technologies and collaborate with like-minded individuals to bring ideas to life.
                      </p> 
                      <p className="mt-4 text-gray-400 text-base sm:text-lg">
                        i love turning ideas into reality through code. Whether it's developing web applications, mobile apps, or software tools, I am dedicated to delivering high-quality and user-friendly solutions. I thrive in dynamic environments where I can continuously grow and contribute to meaningful projects.

                      </p>

                  </motion.div>



      </div>

      
    </section>


  )


}