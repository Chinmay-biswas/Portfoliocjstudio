import { motion } from "framer-motion";
import p from "../assets/profile1.png"
import { getPortfolioList, portfolioDefaults } from "../data/portfolioDefaults";

export default function About({ content = portfolioDefaults, visibleSections = {} }) {

  const glows = [
    "-top-10 -left-10 w-[360px] h-[360px] opacity-20 blur-[120px]",
    "bottom-0 right-0 w-[420px] h-[420px] opacity-15 blur-[140px] delay-400",
    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] opacity-10 blur-[100px] delay-200",
  ]

  const stats = getPortfolioList(content, "aboutStats");
  const achievements = getPortfolioList(content, "achievements");
  const section = { ...portfolioDefaults.aboutSection, ...(content.aboutSection || {}) };
  const getText = (value, fallback) => (
    content.initialized === true ? (value || "") : (value || fallback)
  );

  return (
    <section id='about'
    className="min-h-screen w-full flex items-center justify-center relative bg-black text-white overflow-hidden"
    style={{ backgroundColor: "var(--site-background)" }}

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

          

              <motion.div className="relative w-[160px] h-[220px] md:w-[200px] md:h-[320px]
              rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1cd8d2]/20  to-[#302b63]/20
              border-[#1cd8d2]/25 "
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.2}}>
                <img src={content.media?.aboutProfileUrl || p} alt="profile" className="absolute inset-0 w-full h-full object-cover"/>
              </motion.div>

              <div className=" flex-1 flex flex-col justify-center text-center md:text-left">
                <motion.div initial={{ opacity:0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.4}}>
                  <h2 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent 
                  bg-gradient-to-r from-[#1cd8d2] to-[#b2e0d7] hover:scale-102 transition"
                 >
                  {content.name || portfolioDefaults.name}
                </h2>
                <p className="mt-2 text-lg sm:text-xl text-gray-300 font-semibold hover:scale-102 transition">
                   {content.headline || portfolioDefaults.headline}
                </p>
                <p className="mt-4 text-gray-400 max-w-2xl md:max-w-3xl leading-relaxed sm:text-lg">
                  {content.aboutShort || content.about || portfolioDefaults.aboutShort}
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

                {(visibleSections.projects !== false || visibleSections.contact !== false) && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                    {visibleSections.projects !== false && (
                      <a href="#projects" className="inline-flex items-center justify-center rounded-lg bg-white text-black font-semibold px-5 py-3 hover:bg-gray-200 transition hover:scale-95">{section.projectsButtonLabel}</a>
                    )}
                    {visibleSections.contact !== false && (
                      <a href="#contact" className="inline-flex items-center justify-center rounded-lg bg-transparent text-white font-semibold px-5 py-3 border-2 border-white hover:bg-white hover:text-black transition hover:scale-95">{section.contactButtonLabel}</a>
                    )}
                  </div>
                )}

              </div>


            </motion.div>

          
                  <motion.div className="text-center md:text-left"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{duration: 1}}
                  viewport={{ amount:0.3}} /* here can use once=ture  for one time animation  */
                  > 

                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      
                      {section.title} </h3>
                      <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                        {getText(content.aboutLong || content.about, portfolioDefaults.aboutLong)}
                      </p> 
                      <p className="mt-4 text-gray-400 text-base sm:text-lg">
                        {getText(content.aboutExtra, portfolioDefaults.aboutExtra)}

                      </p>
                      <p className="mt-4 text-gray-400 text-base sm:text-lg">
                        {getText(content.aboutFinal, portfolioDefaults.aboutFinal)}
                      </p>

                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {achievements.map((item, index) => (
                      <motion.div
                        key={`${item.label}-${index}`}
                        className="rounded-xl border-2 border-white/10 px-4 py-3 text-center transition hover:scale-105"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.35 }}
                        viewport={{ amount: 0.2 }}
                      >
                        <div className="text-lg font-semibold text-white">{item.label}</div>
                        <div className="mt-2 text-gray-400">{item.value}</div>
                      </motion.div>
                    ))}
                  </div>



      </div>

      
    </section>


  )


}
