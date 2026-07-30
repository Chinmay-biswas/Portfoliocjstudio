import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const supportedEffects = new Set([
  "typewriter",
  "fade",
  "slide",
  "cascade",
  "flip",
  "scramble",
  "sweep",
]);

const signalCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function boundedNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function nextRoleIndex(currentIndex, count) {
  if (count < 2) return 0;
  return (currentIndex + 1) % count;
}

function randomSignalCharacter() {
  return signalCharacters[Math.floor(Math.random() * signalCharacters.length)];
}

function SignalDecode({ value, durationMs, reduceMotion }) {
  const [displayValue, setDisplayValue] = useState(value);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    if (reduceMotion) {
      const timeout = window.setTimeout(() => setDisplayValue(value), 0);
      return () => window.clearTimeout(timeout);
    }

    const characters = Array.from(value);
    const frameCount = Math.max(9, Math.round(durationMs / 42));
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 1;
      const resolvedCharacters = Math.floor((frame / frameCount) * characters.length);
      const nextValue = characters
        .map((character, index) => {
          if (character === " " || index < resolvedCharacters || frame >= frameCount) {
            return character;
          }

          return randomSignalCharacter();
        })
        .join("");

      setDisplayValue(nextValue);

      if (frame >= frameCount) {
        window.clearInterval(timer);
      }
    }, 42);

    return () => window.clearInterval(timer);
  }, [durationMs, reduceMotion, value]);

  return <span>{displayValue}</span>;
}

export default function HeroRoleAnimation({
  roles,
  effect = "typewriter",
  speed = 130,
  pause = 1500,
  accentColor = "#1cd8d2",
}) {
  const reduceMotion = useReducedMotion();
  const cleanRoles = useMemo(() => {
    const values = Array.isArray(roles) ? roles : [];
    const normalized = values
      .map((role) => String(role || "").trim())
      .filter(Boolean);

    return normalized.length > 0 ? normalized : ["Developer"];
  }, [roles]);
  const activeEffect = supportedEffects.has(effect) ? effect : "typewriter";
  const characterSpeed = boundedNumber(speed, 130, 45, 360);
  const rolePause = boundedNumber(pause, 1500, 550, 6000);
  const transitionDuration = boundedNumber(characterSpeed * 4.2, 520, 320, 1100) / 1000;
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const activeRole = cleanRoles[activeIndex % cleanRoles.length] || cleanRoles[0];
  const activeRoleCharacters = Array.from(activeRole);

  useEffect(() => {
    if (reduceMotion || activeEffect !== "typewriter") return undefined;

    if (!isDeleting && typedLength === activeRoleCharacters.length && cleanRoles.length < 2) {
      return undefined;
    }

    const delay = !isDeleting && typedLength === activeRoleCharacters.length
      ? rolePause
      : isDeleting
        ? Math.max(35, Math.round(characterSpeed * 0.48))
        : characterSpeed;

    const timer = window.setTimeout(() => {
      if (!isDeleting && typedLength < activeRoleCharacters.length) {
        setTypedLength((currentLength) => currentLength + 1);
        return;
      }

      if (!isDeleting) {
        setIsDeleting(true);
        return;
      }

      if (typedLength > 0) {
        setTypedLength((currentLength) => currentLength - 1);
        return;
      }

      setIsDeleting(false);
      setActiveIndex((currentIndex) => nextRoleIndex(currentIndex, cleanRoles.length));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    activeEffect,
    activeRoleCharacters.length,
    characterSpeed,
    cleanRoles.length,
    isDeleting,
    reduceMotion,
    rolePause,
    typedLength,
  ]);

  useEffect(() => {
    if (reduceMotion || activeEffect === "typewriter" || cleanRoles.length < 2) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setActiveIndex((currentIndex) => nextRoleIndex(currentIndex, cleanRoles.length));
    }, rolePause);

    return () => window.clearTimeout(timer);
  }, [activeEffect, activeIndex, cleanRoles.length, reduceMotion, rolePause]);

  const visualRole = reduceMotion ? cleanRoles[0] : activeRole;
  const transition = { duration: transitionDuration, ease: [0.22, 1, 0.36, 1] };

  const renderAnimatedRole = () => {
    if (reduceMotion) {
      return <span className="inline-block max-w-full break-words">{visualRole}</span>;
    }

    if (activeEffect === "typewriter") {
      return (
        <span className="inline-flex max-w-full items-baseline break-words">
          <span>{activeRoleCharacters.slice(0, typedLength).join("")}</span>
          <motion.span
            className="ml-1 inline-block h-[0.9em] w-[2px] shrink-0 bg-current align-middle"
            animate={{ opacity: [1, 0.18, 1] }}
            transition={{ duration: 0.8, ease: "easeInOut", repeat: Infinity }}
          />
        </span>
      );
    }

    if (activeEffect === "fade") {
      return (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeRole}
            className="inline-block max-w-full break-words"
            initial={{ opacity: 0, y: 9, filter: "blur(7px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -9, filter: "blur(7px)" }}
            transition={transition}
          >
            {activeRole}
          </motion.span>
        </AnimatePresence>
      );
    }

    if (activeEffect === "slide") {
      return (
        <span className="inline-flex min-h-[1.35em] max-w-full items-center overflow-hidden align-bottom">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeRole}
              className="inline-block max-w-full break-words"
              initial={{ opacity: 0, y: "110%" }}
              animate={{ opacity: 1, y: "0%" }}
              exit={{ opacity: 0, y: "-110%" }}
              transition={transition}
            >
              {activeRole}
            </motion.span>
          </AnimatePresence>
        </span>
      );
    }

    if (activeEffect === "cascade") {
      return (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeRole}
            className="inline-block max-w-full break-words"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: transitionDuration * 0.62, ease: transition.ease }}
          >
            {activeRoleCharacters.map((character, index) => (
              <motion.span
                key={`${character}-${index}`}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: 18, rotate: -5 },
                  visible: { opacity: 1, y: 0, rotate: 0 },
                }}
                transition={{
                  duration: Math.max(0.18, transitionDuration * 0.72),
                  delay: Math.min(index * 0.035, 0.52),
                  ease: transition.ease,
                }}
              >
                {character === " " ? "\u00a0" : character}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      );
    }

    if (activeEffect === "flip") {
      return (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeRole}
            className="inline-block max-w-full break-words [transform-style:preserve-3d]"
            initial={{ opacity: 0, rotateX: -82, y: 14 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, rotateX: 82, y: -14 }}
            transition={transition}
            style={{ perspective: 900 }}
          >
            {activeRole}
          </motion.span>
        </AnimatePresence>
      );
    }

    if (activeEffect === "scramble") {
      return (
        <motion.span
          className="inline-block max-w-full break-words"
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: Math.min(0.28, transitionDuration), ease: transition.ease }}
        >
          <SignalDecode value={activeRole} durationMs={Math.round(transitionDuration * 1000)} reduceMotion={reduceMotion} />
        </motion.span>
      );
    }

    return (
      <span className="relative inline-block max-w-full break-words pb-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeRole}
            className="inline-block max-w-full break-words"
            initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.45 }}
            animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
            exit={{ clipPath: "inset(0 0 0 100%)", opacity: 0.45 }}
            transition={transition}
          >
            {activeRole}
          </motion.span>
        </AnimatePresence>
        <motion.span
          key={`line-${activeRole}`}
          className="absolute bottom-0 left-0 h-0.5 rounded-full"
          style={{ backgroundColor: accentColor }}
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: 1 }}
          transition={{ duration: transitionDuration, ease: transition.ease }}
        />
      </span>
    );
  };

  return (
    <motion.div
      className="mb-1 mt-2 min-h-[2.75rem] text-xl font-semibold leading-tight text-white sm:min-h-[3.15rem] sm:text-2xl md:min-h-[3.65rem] md:text-3xl lg:min-h-[4.2rem] lg:text-4xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <span className="sr-only">{visualRole}</span>
      <span aria-hidden="true" className="inline-block max-w-full">
        {renderAnimatedRole()}
      </span>
    </motion.div>
  );
}
