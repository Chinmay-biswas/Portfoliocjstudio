import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export default function IntroAnimation({ onFinish }) {
  const greetings = useMemo(
    () => ["hello", "hi", "hey", "welcome", "greetings", "salutations", "howdy"],
    []
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("greeting");
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);

  const finishIntro = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    if (phase !== "greeting") return;

    if (index < greetings.length - 1) {
      const id = setTimeout(() => {
        setIndex((i) => i + 1);
      }, 390);

      return () => clearTimeout(id);
    }

    const id = setTimeout(() => setPhase("name"), 700);
    return () => clearTimeout(id);
  }, [greetings.length, index, phase]);

  useEffect(() => {
    if (phase !== "name") return;

    const id = setTimeout(() => setPhase("collapse"), 2100);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "collapse") return;

    const id = setTimeout(() => setPhase("approach"), 1900);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "approach") return;

    const id = setTimeout(() => setPhase("settle"), 1500);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "settle") return;

    const id = setTimeout(() => setPhase("final"), 1100);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "final") return;

    const id = setTimeout(() => setVisible(false), 1900);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (visible) return;

    const fallbackId = setTimeout(finishIntro, 1100);
    return () => clearTimeout(fallbackId);
  }, [visible]);

  const isCollapsing =
    phase === "collapse" || phase === "approach" || phase === "settle" || phase === "final";
  const showJ = phase === "approach" || phase === "settle" || phase === "final";
  const isSettled = phase === "settle" || phase === "final";
  const isFinal = phase === "final";

  return (
    <AnimatePresence onExitComplete={finishIntro}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black text-white"
          initial={{ y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {phase === "greeting" && (
            <motion.h1
              key={index}
              className="text-6xl font-bold lowercase md:text-8xl lg:text-9xl"
              initial={{ opacity: 0, y: 38 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -38 }}
              transition={{ duration: 0.18 }}
            >
              {greetings[index]}
            </motion.h1>
          )}

          {phase !== "greeting" && (
            <motion.div
              className="flex items-baseline text-5xl font-bold leading-none tracking-tight md:text-8xl lg:text-9xl"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.span
                className="inline-block"
                animate={{ color: isFinal ? "#1DCD9F" : "#ffffff" }}
                transition={{ duration: 0.35 }}
              >
                C
              </motion.span>

              <CollapsingText hide={isCollapsing}>hinmay</CollapsingText>

              <motion.span
                className="inline-block overflow-hidden"
                animate={{
                  width: isFinal
                    ? "0.08em"
                    : isSettled
                      ? "0.18em"
                      : phase === "approach"
                        ? "0.42em"
                        : isCollapsing
                          ? "0.62em"
                          : "0.32em",
                }}
                transition={{ duration: isCollapsing ? 1.25 : 1.15, ease: [0.4, 0, 0.2, 1] }}
              >
                &nbsp;
              </motion.span>

              <CollapsingText hide={isCollapsing}>B</CollapsingText>

              <motion.span
                className="inline-block overflow-visible align-baseline leading-none"
                animate={{
                  color: isFinal ? "#1DCD9F" : "#ffffff",
                  width: showJ ? "0.58em" : "0.28em",
                }}
                transition={{ duration: showJ ? 1.05 : 0.65, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.span
                  key={showJ ? "j" : "i"}
                  className="inline-block align-baseline leading-none"
                  initial={{ opacity: 0, y: showJ ? 18 : 0, rotateX: showJ ? -55 : 0 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -18, rotateX: 55 }}
                  transition={{ duration: showJ ? 1.05 : 0.65, ease: [0.4, 0, 0.2, 1] }}
                >
                  {showJ ? "J" : "i"}
                </motion.span>
              </motion.span>

              <CollapsingText hide={isCollapsing}>swas</CollapsingText>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CollapsingText({ children, hide }) {
  return (
    <motion.span
      className="inline-block overflow-hidden whitespace-nowrap leading-none"
      animate={{
        maxWidth: hide ? 0 : "9em",
        opacity: hide ? 0 : 1,
        y: hide ? -28 : 0,
      }}
      transition={{ duration: hide ? 1.35 : 1.15, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.span>
  );
}
