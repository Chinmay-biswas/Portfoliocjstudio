import { motion } from "framer-motion"
import { getPortfolioList } from "../data/portfolioDefaults";

function initialsFor(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials || "?";
}

export default function Testimonials({ content }) {
  const testimonials = getPortfolioList(content, "testimonials");
  const title = content?.testimonialsSection?.title?.trim();

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="relative min-h-screen bg-black text-white flex flex-col items-center justify-between px-6 py-20">
      {title && (
        <motion.h2 className="text-4xl font-bold mb-16"
        initial={{opacity:0,y:-50}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:1}}
        >
        {title}

        </motion.h2>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-10 max-w-6xl w-full">

        {testimonials.map((t,i)=>(
          <motion.div
          key={`${t.name}-${i}`}
          initial={{opacity:0,y:50}}
        whileInView={{opacity:1,y:0}}
        transition={{duration:.6,delay:i*0.2}}
        viewport={{ amount:0.3}}
        className="bg-white/10 backdrop-blur-lg border border-white rounded-2xl p-6 flex flex-col items-center text-center transform transition duration-500
        hover:scale-105 hover:-rotate-1"
          >
            {t.image ? (
              <img src={t.image} alt={t.name} className="w-20 h-20 rounded-full border-2 border-white mb-4 object-cover"
              loading="lazy" />
            ) : (
              <div aria-hidden="true" className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-white/10 text-xl font-semibold">
                {initialsFor(t.name)}
              </div>
            )}
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
