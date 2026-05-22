
import { FiX } from "react-icons/fi";
import { motion,AnimatePresence } from 'framer-motion';


export default function OverlayMenu({ isOpen, onClose }) {

                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
                        const origin = isMobile ? "95% 8%" : "50% 8%";
    return (
        <AnimatePresence>
            {
                isOpen && (
                    <motion.div
                        className="fixed inset-0 z-[9000] flex items-center justify-center"
                        
                        initial={{ clipPath: `circle(0% at ${origin})` }}
                        animate={{ clipPath: `circle(150% at ${origin})` }}
                        exit={{ clipPath: `circle(0% at ${origin})` }}
                        transition={{duration:0.7,ease:[0.4,0,0.2,1]}}
                        style={{backgroundColor:"rgba(0,0,0,0.90)"}}
                        >


                        <button onClick={onClose}
                            className="absolute right-5 top-5 z-[9010] flex h-11 w-11 items-center justify-center text-white text-3xl focus:outline-none"
                            aria-label="Close Menu">
                            <FiX/>  
                        </button>
                        
                        <ul className="text-center space-y-6 ">
                            {['Home', 'About', 'Skills', 'Projects', 'Experience', /*'Testimonials',*/ 'Contact'   
                            ].map((item,index) => (
                            <motion.li key ={item} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.3+index * 0.1 }} 
                            >
                                <a
                                    href={`#${item.toLowerCase()}`}
                                    onClick={onClose}
                                    className="text-3xl font-bold text-white hover:text-pink-500 transition-colors duration-300"
                                >
                                {item}
                                </a>
                            </motion.li>))}
                        </ul>
                            
                            
                    </motion.div>
                    
            )
            }




        </AnimatePresence>
        );
    }