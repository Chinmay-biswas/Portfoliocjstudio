import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import ParticlesBackground from "../components/ParticlesBackground";

const exps = [
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
  {
    role:"college start",
    company:"first year",
    duration: "2023",
    description: "participtate in kriti(Game Dev Module)",
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function DesktopExpItem({
  exp,
  absoluteIdx,
  activeIndex,
  totalCards,
  visibleCount,
  scrollYProgress,
}) {
  const centerOffset = (visibleCount - 1) / 2;
  const width = visibleCount >= 4 ? 270 : 320;
  const gap = visibleCount >= 4 ? 285 : 345;
  const isTop = absoluteIdx % 2 !== 0;
  const x = useTransform(scrollYProgress, (latest) => {
    const scrollStep = latest * Math.max(totalCards - 1, 1);
    const slideStart = visibleCount - 1;

    if (scrollStep <= slideStart) {
      return (absoluteIdx - centerOffset) * gap;
    }

    const slideRaw = scrollStep - slideStart;
    const slideIndex = Math.floor(slideRaw);
    const slideProgress = slideRaw - slideIndex;
    const slot = absoluteIdx - slideIndex;

    return (slot - centerOffset - slideProgress) * gap;
  });
  const opacity = useTransform(scrollYProgress, (latest) => {
    const scrollStep = latest * Math.max(totalCards - 1, 1);
    const slideStart = visibleCount - 1;

    if (scrollStep <= slideStart) {
      if (absoluteIdx === 0) return 1;

      const revealProgress = clamp(scrollStep - (absoluteIdx - 1), 0, 1);

      return absoluteIdx < visibleCount ? revealProgress : 0;
    }

    const slideRaw = scrollStep - slideStart;
    const slideIndex = Math.floor(slideRaw);
    const slideProgress = slideRaw - slideIndex;
    const slot = absoluteIdx - slideIndex;

    if (slot === 0) return 1 - slideProgress;
    if (slot === visibleCount) return slideProgress;
    if (slot > 0 && slot < visibleCount) return 1;
    return 0;
  });
  const scale = useTransform(scrollYProgress, (latest) => {
    const scrollStep = latest * Math.max(totalCards - 1, 1);
    const slideStart = visibleCount - 1;

    if (scrollStep <= slideStart) {
      if (absoluteIdx === 0) return 1;

      const revealProgress = clamp(scrollStep - (absoluteIdx - 1), 0, 1);

      return absoluteIdx < visibleCount ? 0.94 + revealProgress * 0.06 : 0.94;
    }

    const slideRaw = scrollStep - slideStart;
    const slideIndex = Math.floor(slideRaw);
    const slideProgress = slideRaw - slideIndex;
    const slot = absoluteIdx - slideIndex;

    if (slot === visibleCount) return 0.94 + slideProgress * 0.06;
    if (slot === 0) return 1 - slideProgress * 0.06;
    return 1;
  });
  const y = useTransform(scrollYProgress, (latest) => {
    const scrollStep = latest * Math.max(totalCards - 1, 1);
    const slideStart = visibleCount - 1;
    const offset = isTop ? -30 : 30;

    if (scrollStep <= slideStart) {
      if (absoluteIdx === 0) return 0;

      const revealProgress = clamp(scrollStep - (absoluteIdx - 1), 0, 1);

      return absoluteIdx < visibleCount ? offset * (1 - revealProgress) : offset;
    }

    const slideRaw = scrollStep - slideStart;
    const slideIndex = Math.floor(slideRaw);
    const slideProgress = slideRaw - slideIndex;
    const slot = absoluteIdx - slideIndex;

    if (slot === visibleCount) return offset * (1 - slideProgress);
    if (slot === 0) return offset * slideProgress;
    return 0;
  });
  const pointerEvents = absoluteIdx >= activeIndex && absoluteIdx < activeIndex + visibleCount ? "auto" : "none";

  return (
    
    <motion.div
      className="absolute left-1/2 top-1/2 flex justify-center items-center"
      style={{ opacity, x, y: "-50%", scale, pointerEvents }}
      initial={false}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="z-10 w-7 h-7 rounded-full bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.13)]"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className={`absolute ${isTop ? "-bottom-8" : "-top-8"} w-[3px] bg-white/40`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 40 }}
          exit={{ opacity: 0, height: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      <motion.article
        className={`absolute ${
          isTop ? "top-12" : "bottom-12"
        } bg-gray-900/80 backdrop-blur border border-gray-700/70 rounded-xl p-7 shadow-lg`}
        style={{ width, maxWidth: "90vw" }}
        initial={false}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h3 className="text-xl font-semibold">{exp.role}</h3>
        <p className="text-md text-gray-400 mb-3">
          {exp.company} | {exp.duration}
        </p>
        <p className="text-md text-gray-400 break-words">{exp.description}</p>
      </motion.article>
    </motion.div>
  );
}

function DesktopTimeline({ exps, scrollYProgress, visibleCount }) {
  const maxIndex = Math.max(exps.length - visibleCount, 0);
  const [activeIndex, setActiveIndex] = useState(0);
  const lineSize = useTransform(scrollYProgress, (v) => `${v * 100}%`);
  const visibleCards = useMemo(
    () => {
      const cardLimit = Math.min(visibleCount + 1, exps.length - activeIndex);

      return exps.slice(activeIndex, activeIndex + cardLimit);
    },
    [activeIndex, exps, visibleCount]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const scrollStep = latest * Math.max(exps.length - 1, 1);
    const slideStart = visibleCount - 1;
    const nextIndex =
      scrollStep <= slideStart ? 0 : clamp(Math.floor(scrollStep - slideStart), 0, maxIndex);

    setActiveIndex((current) => {
      if (current === nextIndex) return current;
      return nextIndex;
    });
  });

  return (
    <div className="relative w-full max-w-7xl">
      <div className="absolute left-0 right-0 top-1/2 z-0 h-[6px] -translate-y-1/2 bg-white/15 rounded shadow-[0_0_28px_rgba(255,255,255,0.16)]">
        <motion.div
          className="absolute left-0 top-0 h-[6px] bg-white rounded origin-left shadow-[0_0_28px_rgba(255,255,255,0.75)]"
          style={{ width: lineSize }}
        />
      </div>

      <div className="relative z-10 h-[520px] mt-0 overflow-visible">
        <AnimatePresence initial={false}>
          {visibleCards.map((exp, slot) => (
            <DesktopExpItem
              key={`${activeIndex + slot}-${exp.company}-${exp.role}`}
              exp={exp}
              absoluteIdx={activeIndex + slot}
              activeIndex={activeIndex}
              totalCards={exps.length}
              visibleCount={visibleCount}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Experienceprochat() {
  const sceneRef = useRef(null);
  const mobileSceneRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const desktopVisibleCount = Math.min(visibleCount, exps.length);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;

      setVisibleCount(width >= 1280 ? 4 : 3);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const SCEN_HEIGHT_VH = 120 * Math.max(exps.length - 1, 1);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: mobileScrollYProgress } = useScroll({
    target: mobileSceneRef,
    offset: ["start end", "end start"],
  });

  const mobileLineSize = useTransform(mobileScrollYProgress, (v) => `${v * 100}%`);

  return (
    
    <section id="exp" className="relative bg-black text-white">
      <ParticlesBackground />

    <div className="relative z-10">
      
      <div ref={mobileSceneRef} className="relative min-h-screen px-6 pb-16 pt-8 md:hidden">
        
        <h2 className="text-4xl font-semibold text-center">Journey</h2>
          
        <div className="relative mx-auto mt-12 w-full max-w-md">
          <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded bg-white/15">
            <motion.div
              className="absolute left-0 top-0 w-[3px] rounded bg-white origin-top shadow-[0_0_28px_rgba(255,255,255,0.75)]"
              style={{ height: mobileLineSize }}
            />
          </div>

          <div className="flex flex-col gap-10">
            {exps.map((exp, idx) => (
              <motion.div
                key={`${exp.company}-${exp.role}-${idx}`}
                className="relative flex items-start"
                initial={{ opacity: 0.72, x: 24, y: 14, scale: 0.98 }}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.div
                  className="absolute -left-[14px] top-3 z-10 h-7 w-7 rounded-full bg-white shadow-[0_0_0_8px_rgba(255,255,255,0.13)]"
                  initial={{ opacity: 0.72, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.25 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />

                <article className="ml-6 w-[90%] max-w-sm rounded-xl border border-gray-700/70 bg-gray-900/80 p-5 shadow-lg backdrop-blur">
                  <h3 className="text-lg font-semibold break-words">{exp.role}</h3>
                  <p className="text-sm text-gray-400 mb-2 break-words">
                    {exp.company} | {exp.duration}
                  </p>
                  <p className="text-sm text-gray-400 mb-2 break-words">{exp.description}</p>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={sceneRef}
        style={{ height: `${SCEN_HEIGHT_VH}vh`, minHeight: "120vh" }}
        className="relative hidden md:block"
      >
        <div className="sticky top-0 h-screen flex flex-col">
          <h2 className="text-8xl sm:text-8xl font-bold mt-5 text-center">
            Journey
          </h2>
          <div className="flex flex-1 items-start justify-center px-6 pb-10 md:items-center">
            <DesktopTimeline
              exps={exps}
              scrollYProgress={scrollYProgress}
              visibleCount={desktopVisibleCount}
            />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
