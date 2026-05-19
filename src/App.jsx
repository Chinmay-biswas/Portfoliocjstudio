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
import { useState } from 'react'
import Experience from './sections/Experience'



export default function App() {

  const [showIntro, setShowIntro] = useState(true);
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
      <Projects/>
      <Experienceprochat/>
      <Testimonials/>
      <Contact/>
      <Footer/>
    </div>
    
    )}
    </>
  )
}