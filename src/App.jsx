import Navbar from './components/Navbar'
import Home from './sections/Home'
import About from './sections/About'
import Skills from './sections/Skills'
import Projects from './sections/Projects'
import Experienceprochat from './sections/Experienceprochat'
import Testimonials from './sections/Testimonials'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import ParticlesBackground from './components/ParticlesBackground'
import CustomCursor from './components/CustomCursor'
import IntroAnimation from './components/IntroAnimation'
import { useState, useEffect } from 'react'
import Experience from './sections/Experience'
import SkillsSpace from './sections/SkillsSpace'
import Projects1advance from './sections/Projects1advance'

// Mirrors the useIsMobile pattern already used in Projects.jsx, but
// checks for "large screen and up" (Tailwind's lg breakpoint, 1024px).
// SkillsSpace only mounts when this is true, so it never loads or runs
// on mobile/tablet — not just visually hidden.
const useIsLargeScreen = (query = "(min-width:1024px)") => {
  const [isLargeScreen, setIsLargeScreen] = useState(
    typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e) => setIsLargeScreen(e.matches);

    mql.addEventListener("change", handler);
    queueMicrotask(() => {
      setIsLargeScreen(mql.matches);
    });
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return isLargeScreen;
};

export default function App() {

  const [showIntro, setShowIntro] = useState(true);
  const isLargeScreen = useIsLargeScreen();

  return(
      <>

    {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
      {!showIntro &&(


    <div className='relative gradient text-white'>
      <CustomCursor />
      {/*<ParticlesBackground />*/}


      <Navbar/>
      <Home/>
      <About/>
      <Skills/>
      {isLargeScreen && <SkillsSpace/>}
      <Projects1advance/>
      {/* <Projects/> */}
      <Experienceprochat/>
      {/*<Testimonials/>*/}
      <Contact/>
      <Footer/>
    </div>
    
    )}
    </>
  )
}
