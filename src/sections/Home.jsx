
import { FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import { useMemo, useState } from "react";
import ParticlesBackground from "../components/ParticlesBackground";
import avator from "../assets/avator.png"
import { motion, AnimatePresence } from "framer-motion";
import { getPortfolioList, getRoleAnimationTiming, portfolioDefaults } from "../data/portfolioDefaults";
import BottomWaves from "../components/BottomWaves";
import HeroRoleAnimation from "../components/HeroRoleAnimation";



const socialIcons = {
  Instagram: FaInstagram,
  LinkedIn: FaLinkedinIn,
  GitHub: FaGithub,
};

const glowvariants={
  initial:{scale:1,y:0,filter:"drop-shadow(0 0 0 rgba(255,255,255,0.6))"},
  hover:{
    scale:1.2,y:-3,
    filter:"drop-shadow(0 0 8px rgba(13,88,204,0.9)) drop-shadow(0 0 18px rgba(16,185,129,0.8))",
    transition:{type:"spring", stiffness:300, damping:15}
  },
  tap:{scale:0.95,y:0, transition:{duration:0.08}}
}

export default function Home({ content = portfolioDefaults, visibleSections = {} }) {

const roles = useMemo(() => {
  const configuredRoles = Array.isArray(content.roles)
    ? content.roles.map((role) => String(role || "").trim()).filter(Boolean)
    : [];

  return configuredRoles.length > 0
    ? configuredRoles
    : [content.headline || portfolioDefaults.headline];
}, [content.roles, content.headline]);
const resumeLinks = getPortfolioList(content, "resumeLinks");
const socials = getPortfolioList(content, "socials");
const homeButtons = { ...portfolioDefaults.homeButtons, ...(content.homeButtons || {}) };
const homeSection = { ...portfolioDefaults.homeSection, ...(content.homeSection || {}) };
const roleAnimationTiming = getRoleAnimationTiming(homeSection);
const homeGradient = `linear-gradient(90deg, ${homeSection.accentStart}, ${homeSection.accentMiddle}, ${homeSection.accentEnd})`;
const avatarGradient = `conic-gradient(from 0deg, ${homeSection.avatarStart}, ${homeSection.avatarMiddle}, ${homeSection.avatarEnd}, ${homeSection.avatarStart})`;
const [showResume, setShowResume] = useState(false);


  return (
    <section id="home" className="w-full h-screen relative bg-black overflow-hidden" style={{ backgroundColor: "var(--site-background)" }}>
      <ParticlesBackground color={homeSection.avatarStart} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

              {/* <div
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
            </div> */}
      </div>

      <BottomWaves color={homeSection.accentMiddle} />

      <div className="relative z-10 h-full w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 ">
        <div className="flex flex-col justify-center h-full text-center lg:text-left relative">
          <div className="w-full lg:pr-24 mx-auto max-w-[48rem]">


            

            <motion.h1 className=" mt-13 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: homeGradient }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 2}} 
            >
              {homeButtons.greeting} <br/>
              <span className=" text-white font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl lg:whitespace-nowrap">
              {content.name || portfolioDefaults.name}
              </span>

            </motion.h1>
            <HeroRoleAnimation
              key={`${homeSection.roleAnimation}-${roleAnimationTiming.speed}-${roleAnimationTiming.pause}-${roles.join("|")}`}
              roles={roles}
              effect={homeSection.roleAnimation}
              speed={roleAnimationTiming.speed}
              pause={roleAnimationTiming.pause}
              accentColor={homeSection.accentMiddle}
            />
            <motion.p className="mt-1 text-sm sm:text-sm md:text-md text-gray-300 max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{delay:0.5,duration: 1.5}} 
            >
              {content.initialized === true ? content.about : (content.about || portfolioDefaults.about)}
            </motion.p>

            

            <motion.div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 z-60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{delay:.7,duration: 1.3}} 
            >
              {visibleSections.projects !== false && (
                <a href="#projects" className="text-white px-5 py-3 rounded-full font-medium shadow-lg hover:scale-105 transition-all" style={{ background: homeGradient }}>
                  {homeButtons.projectsLabel}
                </a>
              )}
                  <div className="relative group">

  {/* Resume Button */}
  <button
  onClick={() => {
  if (window.innerWidth < 768) {
    setShowResume(true);
  }
}}
  className="text-white px-5 py-3 rounded-full 
  border border-gray-500 hover:bg-gray-700 
  transition-all duration-300"
>
  {homeButtons.resumeLabel} ▸
</button>

  {/* Side Resume Cards */}
{/* Desktop Resume Dropdown */}
<div
  className="
hidden md:grid
absolute
md:left-[150%] md:top-1/2 md:-translate-y-1/2
opacity-0 invisible
md:group-hover:opacity-100
md:group-hover:visible
transition-all duration-300 delay-200
z-[40]
grid-cols-2 gap-3 w-[420px]
"
>

  {resumeLinks.map((resume) => (
    <a
      key={resume.label}
      href={resume.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-[#111] border border-gray-700 text-white
      px-5 py-4 rounded-2xl text-center
      hover:text-xl hover:scale-105
      transition-all duration-300"
    >
      {resume.label}
    </a>
  ))}

</div>

</div>
             </motion.div>

                <div className="mt-3 flex gap-5 text-2xl md:text-3xl justify-center lg:justify-start">
                  {socials.map(({ label, url }) => {
                    const Icon = socialIcons[label] || FaGithub;
                    return (
                      <motion.a
                        href={url}
                        target="_blank"
                        key={label}
                        aria-label={label}
                        rel="noopener noreferrer"
                        variants={glowvariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        className="text-gray-300"
                      >
                        <Icon />
                      </motion.a>
                    );
                  })}
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
                          background: avatarGradient
                        
                        }}
                      />



                      <motion.img
                      src={content.media?.homeAvatarUrl || avator}
                      alt="Home Cartoon"
                      className="absolute top-1/2 -translate-y-1/2 object-contain select-none pointer-events-none"
                      style={{right: "60px" ,width:"min(25vw , 780px)", maxHeight:"90vh"}}
                      initial={{ opacity: 0, y: 40 ,scale:0.7}}
                      animate={{ opacity: 1, y: 0, scale :1 }}
                      transition={{duration: 1, delay:0}} 
                      />
                    </div>



      </div>

      {/* Mobile Resume Popup */}
      <AnimatePresence>
        {showResume && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResume(false)}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setShowResume(false);
              }}
              className="absolute left-5 top-5 z-[10000] flex h-11 w-11 items-center justify-center text-white text-4xl"
              aria-label="Close Resume Options"
            >
              x
            </button>

            <div
              className="grid grid-cols-1 gap-4 w-[85%] max-w-sm"
              onClick={(event) => event.stopPropagation()}
            >
              {resumeLinks.map((resume) => (
                <a
                  key={resume.label}
                  href={resume.url}
                  className="bg-[#111] border border-gray-700 text-white py-4 rounded-2xl text-center"
                >
                  {resume.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>

  )
}
