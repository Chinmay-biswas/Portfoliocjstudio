
import { FiX } from "react-icons/fi";
import { motion,AnimatePresence } from 'framer-motion';

const sectionMenuItems = {
    home: { label: 'Home', href: '#home', section: 'home' },
    about: { label: 'About', href: '#about', section: 'about' },
    skills: { label: 'Skills', href: '#skills', section: 'skills' },
    skillSpace: { label: 'Skill Space', href: '#skills-space', section: 'skillSpace' },
    projects: { label: 'Projects', href: '#projects', section: 'projects' },
    journey: { label: 'Journey', href: '#exp', section: 'journey' },
    github: { label: 'GitHub', href: '#github-progress', section: 'github' },
    codeforces: { label: 'Codeforces', href: '#codeforces-progress', section: 'codeforces' },
    leetcode: { label: 'LeetCode', href: '#leetcode-progress', section: 'leetcode' },
    testimonials: { label: 'Testimonials', href: '#testimonials', section: 'testimonials' },
    contact: { label: 'Contact', href: '#contact', section: 'contact' },
};

export default function OverlayMenu({ isOpen, onClose, visibleSections = {}, sectionOrder = [] }) {

                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
                        const origin = isMobile ? "95% 8%" : "50% 8%";
                        const menuItems = [
                          ...sectionOrder
                            .map((section) => sectionMenuItems[section])
                            .filter((item) => item && visibleSections[item.section] !== false),
                          { label: 'Admin', href: '/admin' },
                        ];
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
                            {menuItems.map((item,index) => (
                            <motion.li key ={item.label}
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.3+index * 0.1 }} 
                            >
                                <a
                                    href={item.href}
                                    onClick={onClose}
                                    className="text-3xl font-bold text-white hover:text-pink-500 transition-colors duration-300"
                                >
                                {item.label}
                                </a>
                            </motion.li>))}
                        </ul>
                            
                            
                    </motion.div>
                    
            )
            }




        </AnimatePresence>
        );
    }
