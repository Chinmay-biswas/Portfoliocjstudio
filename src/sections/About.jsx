import { delay, motion } from "framer-motion";
import p from "../assets/profile1.png"

export default function About() {

  const glows = [
    "-top-10 -left-10 w-[360px] h-[360px] opacity-20 blur-[120px]",
    "bottom-0 right-0 w-[420px] h-[420px] opacity-15 blur-[140px] delay-400",
    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] opacity-10 blur-[100px] delay-200",
  ]

  const achievements = [
  {
    label: "🏆 IITG GameJam",
    value: "Runner-Up for developing a complete Unity-based game"
  },

  {
    label: "🎮 IGDC Competition",
    value: "Built and led the development of Pheneon Quest"
  },

  {
    label: "💻 DSA & Competitive Coding",
    value: "Active problem solving on LeetCode & Codeforces"
  },

  {
    label: "🚀 AI-Powered Systems",
    value: "Currently integrating suggestion systems using AI/ML"
  },

  {
    label: "⚡ Leadership",
    value: "Led teams and managed end-to-end game development projects"
  },

  {
    label: "🧠 Fast Learner",
    value: "Adapted across game development, web development, and AI/ML"
  }
];

const stats = [
  {
    label: "Frontend",
    value: "React.js • Tailwind CSS • JavaScript • HTML/CSS"
  },

  {
    label: "Backend",
    value: "Node.js • Express.js • MongoDB • REST APIs"
  },

  {
    label: "Game Development",
    value: "Unity • C# • Gameplay Systems • Level Design"
  },

  {
    label: "AI/ML",
    value: "Python • Machine Learning • Suggestion Systems"
  },

  {
    label: "Programming",
    value: "C++ • DSA • LeetCode • Codeforces"
  },

  {
    label: "Tools",
    value: "Git • GitHub • Canva • Kaggle • Postman"
  },

  {
    label: "Platforms",
    value: "Google Colab • Jupyter Notebook • Anaconda • Vercel • Clerk"
  },

  {
    label: "Deployment",
    value: "Vercel • Render • Netlify • GitHub Pages"
  },

  {
  label: "Creative & Design",
  value: "Canva • UI Design • Video Editing • HiPaint • Creative Workflows"
}
];

  return (
    <section id='about'
    className="min-h-screen w-full flex items-center justify-center relative bg-black text-white overflow-hidden"

    >

      <div className="absolute inset-0 pointer-events-none">
        {glows.map((c,i)=>(
          <div key={i}
          className={`absolute rounded-full bg-gradient-to-r  from-[#b05ce0] via-[#7b32c0] to-[#4e0480] animate-pulse ${c}`}/>
        ))}</div>

          <div className="relative z-10 max-w-6xl w-full mx-auto px-6 md:px-10 lg:px-12 py-20 flex flex-col  gap-12">

            <motion.div className="flex flex-col md:flex-row items-center md:items-stretch gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 1}} 
            viewport={{ amount:0.6}} /* here can use once=ture  for one time animation  */
            >

          

              <motion.div className="relative w-[160px] h-[220px] md:w-[200px] md:h-[320px]
              rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#b05ce0] via-[#7b32c0] to-[#4e0480]
              border-[#1cd8d2]/25 "
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.2}}>
                <img src={p} alt="profile " className="absolute inset-0 w-full h-full object-cover"/>
              </motion.div>

              <div className=" flex-1 flex flex-col justify-center text-center md:text-left">
                <motion.div initial={{ opacity:0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.4}}>
                  <h2 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent 
                  bg-gradient-to-r  from-[#b05ce0] via-[#7b32c0] to-[#4e0480] hover:scale-102 transition"
                 >
                  Chinmay Biswas
                </h2>
                <p className="mt-2 text-lg sm:text-xl text-gray-300 font-semibold hover:scale-102 transition">
                  Unity Game Developer | MERN Stack Developer | AI/ML Explorer | DSA Enthusiast
                </p>
                <p className="mt-4 text-gray-400 max-w-2xl md:max-w-3xl leading-relaxed sm:text-lg">
                  I'm a passionate web developer with a knack for crafting beautiful and functional websites. With expertise in React, Tailwind CSS, and JavaScript, I create seamless user experiences. I thrive on learning new technologies and contributing to open source projects. Let's build something amazing together!
                </p></motion.div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4  mx-w-xl">
                  {stats.map((item,i) => (

                    <motion.div key={i} className="border-2 border-white/10 px-4 py-3 
                    text-center rounded-xl inline-block hover:scale-105 hover:border-white transition"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{opacity:1,y:0}}
                    
                    transition={{delay:(i*0.2),duration:0.1}}
                    viewport={{amount:0.2}}>
                      <div className=" font-semibold text-white text-lg hover:scale-103 transition">
                        {item.label}</div>
                        <div className="text-mauve-400  mt-2 hover:scale-103 transition">
                          {item.value}
                        </div>
                      </motion.div>

                  ))}

                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                  <a href="#projects" className="inline-flex items-center justify-center rounded-lg bg-white
                   text-black font-semibold px-5 py-3 hover:bg-gray-200 transition hover:scale-95"
                   >See My Work</a>


                  <a href="#contact" className="inline-flex items-center justify-center rounded-lg bg-transparent
                   text-white font-semibold px-5 py-3 border-2 border-white hover:bg-white
                    hover:text-black transition hover:scale-95"
                    >Let’s Connect</a>
                </div>

              </div>


            </motion.div>

          
                  <motion.div className="text-center md:text-left"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.3}} /* here can use once=ture  for one time animation  */
                  > 

                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      
                      About Me </h3>
                      <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                        I’m Chinmay Biswas, a 3rd-year B.Tech student at IIT Guwahati who enjoys building creative and impactful digital experiences through development, design, 
                        and problem-solving. My journey started with game development in Unity,where I explored storytelling, gameplay mechanics, and interactive system design, 
                        eventually leading teams and developing projects like Echoes of Regret.
                      </p> 
                      <p className="mt-4 text-gray-400 text-base sm:text-lg">
                        Over time, my interests expanded into MERN stack development, 
                        where I started building scalable and responsive web applications such as Hot Corner, 
                        a full-stack movie ticket booking platform. Currently, 
                        I’m also exploring AI/ML technologies and working on integrating intelligent 
                        suggestion systems into my projects to create smarter user experiences.

                      </p>
                      <p className="mt-4 text-gray-400 text-base sm:text-lg">
                        I enjoy learning new technologies, adapting across different domains, and building complete products from idea to deployment. 
                        Whether it’s game development, web applications, DSA problem solving on platforms like LeetCode and Codeforces, 
                        or experimenting with AI-driven systems, I love pushing myself to continuously learn, create, and improve.

                      </p>

                  </motion.div>
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4  mx-w-xl">
                  {achievements.map((item,i) => (

                    <motion.div key={i} className="border-2 border-white/10 px-4 py-3 
                    text-center rounded-xl inline-block hover:scale-105 hover:border-white transition"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{opacity:1,y:0}}
                    
                    transition={{delay:(i*0.2),duration:0.1}}
                    viewport={{amount:0.2}}>
                      <div className=" font-semibold text-white text-lg hover:scale-103 transition">
                        {item.label}</div>
                        <div className="text-mauve-400  mt-2 hover:scale-103 transition">
                          {item.value}
                        </div>
                      </motion.div>

                  ))}

                </div>



      </div>

      
    </section>


  )


}