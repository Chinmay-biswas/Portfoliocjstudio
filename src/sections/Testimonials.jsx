import m1 from "../assets/m1.PNG"
import m2 from "../assets/m2.PNG"
import w1 from "../assets/w1.PNG"
import w2 from "../assets/w2.PNG"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Frontend Developer at TechNova",
    review:
      "Chinmay is an incredibly creative and dedicated developer. His attention to UI/UX detail and smooth animations made our project stand out beautifully.",
    image: m1,
  },

  {
    name: "Priya Verma",
    role: "UI/UX Designer at PixelCraft",
    review:
      "Working with Chinmay was an amazing experience. He combines technical skills with creativity and always delivers polished, modern interfaces.",
    image: w1,
  },

  {
    name: "Rohan Mehta",
    role: "Software Engineer at CodeSphere",
    review:
      "Chinmay handled both frontend development and animations flawlessly. His React and Framer Motion expertise brought our ideas to life.",
    image: m2,
  },

  {
    name: "Sneha Kapoor",
    role: "Project Lead at Innovate Labs",
    review:
      "His passion for development and problem-solving is unmatched. Chinmay consistently delivers high-quality work with excellent performance and design.",
    image: w2,
  },
];




export default function Testimonials(){
  return (
    <section id="testimonials" className="relative min-h-screen bg-black text-white flex flex-col items-center justify-between px-6 py-20">
      <motion.h2 className="text-4xl font-bold mb-16"
      initial={{opacity:0,y:-50}}
      whileInView={{opacity:1,y:0}}
      transition={{duration:1}}
      >
      what people say

      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-10 max-w-6xl w-full">

        {testimonials.map((t,i)=>(
          <motion.div
          key={t.name+1}
          initial={{opacity:0,y:50}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:.6,delay:i*0.2}}
        className="bg-white/10 backdrop-blur-lg border border-white rounded-2xl p-6 flex flex-col items-center text-center transform transition duration-500
        hover:scale-105 hover:-rotate-1"
          >
            <img src={t.image} alt="{t.name}" className="w-20 h-20 rounded-full border-2 border-whhite mb-4 object-cover " 
            loading="lazy" />
            <p className="text-gray-400 italic mb-4 ">
              {t.review}
            </p>
            <h3 className="text-lg font-semibold">
              {t.name}
            </h3>
            <p className="text-sm text-gray-400">
              {t.role}
            </p>


          </motion.div>
        ))}

      </div>

    </section>
  )
}