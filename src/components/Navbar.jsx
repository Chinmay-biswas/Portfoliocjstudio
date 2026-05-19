import { CgMenuBoxed } from "react-icons/cg";
import OverlayMenu from "./OverlayMenu";
import { useEffect, useRef , useState } from "react";
import Logo from "../assets/Logo.png";

export default function Navbar(){

    const [menuOpen, setMenuOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const[forcevisible, setForceVisible] = useState(false);


    const lastScrollY = useRef(0);
    const timerId = useRef(null);

    useEffect(() => {
        const homeSection = document.querySelector('#home');
        const observer = new IntersectionObserver(([entry]) => {
            if(entry.isIntersecting){
                setVisible(true);
                setForceVisible(true);
            }
            else{
                
                setForceVisible(false);
            }
        },{threshold:0.1}
        )
        if(homeSection){
            observer.observe(homeSection);
            return () => {
                if(homeSection){
                    observer.unobserve(homeSection);
                }
            }
        }
    },[])




    useEffect(() => {
        const handleScroll = () => {
  // Always visible on Home
  if (forcevisible) {
    setVisible(true);
    return;
  }

  const currentScrollY = window.scrollY;

  // Scrolling DOWN
  if (currentScrollY > lastScrollY.current) {
    setVisible(false);
  }

  // Scrolling UP
  else {
    setVisible(true);

    // Reset timer
    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    // Auto hide after 2 sec
    timerId.current = setTimeout(() => {
      setVisible(false);
    }, 2000);
  }

  lastScrollY.current = currentScrollY;
};
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (timerId.current) {
                clearTimeout(timerId.current);
            }
        }
    },[forcevisible])



    return(
        <>
        <nav  className={`fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-40 transition-transform duration-300 ${visible ? 'translate-y-0' : '-translate-y-full'}`}>

            <div className="flex items-center space-x-2"
            >
            <img src={Logo} alt="Logo" className="w-12 h-8 inline-block mr-0" />
            <div className="text-2xl font-bold text-white hidden sm:block">Chinmay Biswas</div></div>

            <div className="block lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                <button onClick={()=>{ setMenuOpen(true) , setVisible(false)}  } className="flex h-11 w-11 items-center justify-center text-white text-3xl focus:outline-none" aria-label="Open Menu"><CgMenuBoxed /></button>

            </div>

            <div className="hidden lg:block">
                <a href="#contact" className="bg-linear-to-r from-pink-300 to-purple-900 text-black px-5 py-2 rounded-full font-medium shadow-lg hover:opacity-90 transition-opacity duration-300">
                    Reach Out
                </a>

            </div>


               


        </nav>
        
        
        
        
        
        
        <OverlayMenu
  isOpen={menuOpen}
  onClose={() => {
    setMenuOpen(false)
    setVisible(true)
  }}
/>

        
        
        
        
        </>
    )
}