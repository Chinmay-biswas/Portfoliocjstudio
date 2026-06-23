import {motion,useScroll,useMotionValueEvent, AnimatePresence} from "framer-motion";
import { useEffect, useRef, useState ,useMemo} from "react"
import photo1 from "../assets/photo1.JPG"
import photo2 from "../assets/photo2.PNG"
import photo3 from "../assets/photo3.png"
import img1 from "../assets/img1.JPG"
import img2 from "../assets/img2.JPG"
import img3 from "../assets/img3.JPG"
import photo5 from "../assets/photo5.png"
import photo4 from "../assets/photo4.jpeg"
import ParticleNetwork from "../components/ParticleNetwork";


const useIsMobile = (query="(max-width:639px)")=>{
  const [isMobile,setIsMobile]=useState(
    typeof window!=="undefined" && window.matchMedia(query).matches
  )
 

  useEffect(()=>{
    if(typeof window === "undefined")return;
    const mql = window.matchMedia(query);
    const handler= (e)=>setIsMobile(e.matches);


    mql.addEventListener("change",handler);
   queueMicrotask(() => {
  setIsMobile(mql.matches);
});
    return ()=> mql.removeEventListener("change",handler);

  },[query])
  return isMobile;
}

export default function Projects(){

  const isMobile = useIsMobile();
  const sceneRef = useRef(null);

  const projects = useMemo(() => [
    {
      title:"Echoes Of Regret" ,
      link : "https://chinmaybiswas475.itch.io/echoes-of-regret",
      gitlink : "https://github.com/Chinmay-biswas/Echoes-of-Regret",
      about: "A Unity game with immersive storytelling and atmospheric gameplay.",
      bgColor: "#000000",
      video:"https://www.youtube.com/embed/lFwUZPDMnK0",
      image:isMobile?photo1:img1
    },
    {
      title:"Hot-Corner" ,
      link : "https://hot-corner.vercel.app/",
      gitlink : "https://github.com/Chinmay-biswas/Hot-Corner",
      about: "A modern movie ticket booking web app built with React and Node.js.",
      bgColor: "#000000",
      image:isMobile?photo2:img2
    },
    {
  title: "WhatsApp Chat Analyzer",
  link: "https://whatsapp-chat-analyzer-iszd.onrender.com/",
  gitlink: "https://github.com/Chinmay-biswas/WhatsApp_Chat_Analyzer",
  about: "Analyze chats with statistics,activity trends,emoji analysis,visual insights.",
  bgColor: "#000000",
  image: isMobile ? photo4 : photo5
}
  ],
    [isMobile]
);

const {scrollYProgress} = useScroll({
  target:sceneRef,
  offset:["start start","end end"]


})
const thresholds = projects.map(
  (_, i) => (i + 1) / projects.length
);
const [activeIndex,setActiveIndex]=useState(0);

useMotionValueEvent(scrollYProgress, "change", (v) => {
  const idx = thresholds.findIndex((t) => v <= t);

  setActiveIndex(idx=== -1? thresholds.length -1 :idx)
});


const activeProject = projects[activeIndex];
const [isRailOpen,setIsRailOpen]=useState(true);

// Desktop only: clicking a card in the right-hand rail scrolls the
// section to that project's slice of scroll progress. activeIndex then
// updates on its own through the existing scroll listener above —
// this never sets activeIndex directly.
const jumpToProject = (idx) => {
  const node = sceneRef.current;
  if (!node) return;
  const rect = node.getBoundingClientRect();
  const sectionTop = window.scrollY + rect.top;
  const sectionHeight = node.offsetHeight;
  const viewportHeight = window.innerHeight;
  const scrollableHeight = sectionHeight - viewportHeight;

  // Target the middle of this project's slice of progress so it lands
  // solidly inside its threshold instead of right on the boundary.
  const sliceStart = idx / projects.length;
  const sliceMid = sliceStart + 1 / projects.length / 2;

  const targetY = sectionTop + scrollableHeight * sliceMid;
  window.scrollTo({ top: targetY, behavior: "smooth" });
};

return(
  
  <section id="projects"
  ref={sceneRef}
  className="relative text-white "
  style={{
    height :`${100*projects.length}vh`,
    backgroundColor:activeProject.bgColor,
    transition:"background-color 400ms ease"
  }}>

  <ParticleNetwork/>
    <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
      {isMobile && (
        <h2 className="text-3xl font-semibold z-10 bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-transparent mt-4 text-center w-full">
          MY PROJECTS
        </h2>
      )}

      {isMobile ? (
        <>
          <div className="relative w-full flex flex-1 items-center justify-center -mt-4">
            {projects.map((project,idx)=>(
              <div key={project.title}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                activeIndex ===idx?"opacity-100 z-20":"opacity-0 z-0"
              }`}
              style={{width:"85%",maxWidth:"1200px"}}>

                <AnimatePresence mode="wait">
                  {activeIndex === idx && (

                    <motion.h3 key={project.title}
                    initial={{opacity:0,y:-30}}
                    animate={{opacity:1,y:0}}
                    exit={{opacity:0,y:30}}
                    transition={{duration:.5,ease:"easeOut"}}
                    className="block text-center text-[clamp(2rem,6vw,5rem)] bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-transparent italic font-semibold -mt-24"
                    style={{zIndex:5,
                      textAlign:"center"
                    }}
                    >
                  {project.title}
                    </motion.h3>
                  )}



                </AnimatePresence>

                <div className="relative w-full overflow-hidden bg-black/20 shadow-2xl mb-6 rounded-lg h-[62vh]"
                  style={{zIndex:10, transition:"box-shadow 250ms ease"}}
                  >
                  {project.video ? (
      <iframe
      src={`${project.video}?playsinline=1&rel=0&vq=hd1080`}
      title={project.title}
      className="w-full h-full"
      style={{
        position: "relative",
        zIndex: 10,
        border: "none",
        borderRadius: "inherit",
      }}
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
    ) : (
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-full object-cover drop-shadow-xl"
        style={{
          position: "relative",
          zIndex: 10,
          filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.65))",
          transition: "filter 200ms ease",
        }}
        loading="lazy"
      />
    )}
                  <div className="pointer-events-none absolute inset-0"
                  style={{zIndex:11,
                    background:"linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 40%)"
                  }}>

                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="flex flex-row gap-3 justify-center absolute left-1/2 -translate-x-1/2 z-30 bottom-18">
            <a href={activeProject?.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg
             bg-white text-black font-semibold px-5 py-3 hover:bg-gray-200 transition hover:scale-95"
            >Live Demo</a>
            <a href={activeProject?.gitlink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-transparent
             text-white font-semibold px-5 py-3 border-2 border-white hover:bg-white hover:text-black transition hover:scale-95"
            >Git Link</a>
          </div>
          <motion.p
              key={activeProject?.about}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute z-30 text-center text-white/90 max-w-2xl px-6 leading-relaxed bottom-4 text-sm"
            >
              {activeProject?.about}
            </motion.p>
        </>
      ) : (
        <div className="relative w-full flex-1 flex flex-col items-center pt-6 px-8 lg:px-14 max-w-[1500px] mx-auto">

          {/* TOP ROW: project title (left) and MY PROJECTS (right), same baseline */}
          <div className="relative w-full flex items-baseline justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.h3 key={activeProject.title}
              initial={{opacity:0,y:-16}}
              animate={{opacity:1,y:0}}
              exit={{opacity:0,y:16}}
              transition={{duration:.5,ease:"easeOut"}}
              className="text-[clamp(1.5rem,5vw,2.6rem)] bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-transparent italic font-semibold mt-3"
              >
            {activeProject.title}
              </motion.h3>
            </AnimatePresence>

            <h2 className="text-3xl font-semibold bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-transparent whitespace-nowrap">
              MY PROJECTS
            </h2>
          </div>

          {/* MIDDLE ROW: photo panel + collapsible rail, fixed height like before */}
          <div className="relative w-full h-[68vh] flex items-stretch justify-center gap-6 lg:gap-8 mt-4">

            {/* LEFT: big media panel for the active project. Grows to fill
                the space when the rail is collapsed. */}
            <motion.div
              layout
              transition={{duration:.4,ease:"easeInOut"}}
              className="relative min-w-0"
              style={{flex: isRailOpen ? "1 1 70%" : "1 1 100%"}}
            >
              <div className="relative w-full h-full overflow-hidden bg-black/20 shadow-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)] rounded-xl"
                style={{zIndex:10, transition:"box-shadow 250ms ease"}}
                >
                {activeProject.video ? (
                  <iframe
                  key={activeProject.title}
                  src={`${activeProject.video}?playsinline=1&rel=0&vq=hd1080`}
                  title={activeProject.title}
                  className="w-full h-full"
                  style={{
                    position: "relative",
                    zIndex: 10,
                    border: "none",
                    borderRadius: "inherit",
                  }}
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                ) : (
                  <img
                    key={activeProject.title}
                    src={activeProject.image}
                    alt={activeProject.title}
                    className="w-full h-full object-cover"
                    style={{
                      position: "relative",
                      zIndex: 10,
                      filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.65))",
                    }}
                    loading="lazy"
                  />
                )}
                <div className="pointer-events-none absolute inset-0"
                style={{zIndex:11,
                  background:"linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)"
                }}>
                </div>

                {/* Buttons overlaid on the photo, centered, near the bottom — always inside panel bounds */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center gap-4 px-6 pb-5 sm:pb-6">
                  <a href={activeProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg
                   bg-white text-black font-semibold px-5 py-2.5 hover:bg-gray-200 transition hover:scale-95"
                  >Live Demo</a>
                  <a href={activeProject.gitlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-transparent
                   text-white font-semibold px-5 py-2.5 border-2 border-white hover:bg-white hover:text-black transition hover:scale-95"
                  >Git Link</a>
                </div>
              </div>

              {/* Floating toggle: hides/shows the card rail. Anchored to
                  this photo panel's own right edge, sitting in the gap
                  before the rail — never on top of the photo itself. */}
              <button
                onClick={()=>setIsRailOpen(v=>!v)}
                aria-label={isRailOpen ? "Hide project list" : "Show project list"}
                className="absolute top-[45%] -translate-y-1/2 -right- lg:-right-10 z-30 flex items-center justify-center
                  w-7 h-12 rounded-md bg-white/[0.06] border border-white/15
                  hover:bg-white/15 transition-colors"
              >
                <motion.span
                  animate={{rotate: isRailOpen ? 0 : 180}}
                  transition={{duration:.3}}
                  className="text-white/70 text-sm"
                >
                  ›
                </motion.span>
              </button>
            </motion.div>

            {/* RIGHT: narrow, collapsible list of project cards, click to jump */}
            <AnimatePresence>
              {isRailOpen && (
                <motion.div
                  key="rail"
                  initial={{width:0,opacity:0}}
                  animate={{width:"auto",opacity:1}}
                  exit={{width:0,opacity:0}}
                  transition={{duration:.35,ease:"easeInOut"}}
                  style={{flex:"0 0 30%"}}
                  className="relative min-w-0 max-w-[260px] lg:-right-6"
                >
                  <div className="relative h-full overflow-y-auto pr-1
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-white/15
                    [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="flex flex-col gap-3">
                      {projects.map((project,idx)=>{
                        const isActive = activeIndex === idx;
                        return(
                          <button
                          key={project.title}
                          onClick={()=>jumpToProject(idx)}
                          className={`group relative w-full text-left rounded-lg border transition-all duration-300 overflow-hidden
                            ${isActive
                              ? "border-[#9b4de0]/70 bg-[#6B27B0]/15 shadow-[0_0_0_1px_rgba(155,77,224,0.4)]"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                            }`}
                          >
                            <div className="relative w-full h-20 overflow-hidden bg-black/40">
                              <img
                                src={project.image}
                                alt=""
                                className={`w-full h-full object-cover transition-transform duration-300 ${
                                  isActive ? "scale-105" : "group-hover:scale-105"
                                }`}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              <p className={`absolute bottom-1.5 left-2 right-2 text-xs font-semibold italic truncate transition-colors ${
                                isActive ? "text-white" : "text-white/75 group-hover:text-white"
                              }`}>
                                {project.title}
                              </p>
                              {isActive && (
                                <motion.span
                                  layoutId="active-project-dot"
                                  className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[#9b4de0]"
                                />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM: description, below the photo, in normal flow so it's always visible */}
          <motion.p
              key={activeProject.about}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4 }}
              className="w-full text-white/90 text-sm sm:text-base text-center leading-relaxed max-w-xl mx-auto line-clamp-2 mt-4 mb-4"
            >
              {activeProject.about}
          </motion.p>
        </div>
      )}

    </div>
    




  </section>
)
}
