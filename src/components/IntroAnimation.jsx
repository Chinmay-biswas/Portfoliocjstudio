import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getIntroAnimationColors, getIntroAnimationTiming, introAnimationStyleOptions, portfolioDefaults } from "../data/portfolioDefaults";

const validStyles = new Set(introAnimationStyleOptions.map((option) => option.value));
const smoothEase = [0.22, 1, 0.36, 1];

function clampDuration(value, fallback, min, max) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(Math.max(numericValue, min), max);
}

function initialsFromName(firstName, lastName) {
  return `${firstName?.trim().charAt(0) || "C"}${lastName?.trim().charAt(0) || "J"}`.toUpperCase();
}

function transitionStyle(style) {
  if (style === "kinetic") {
    return {
      firstExit: { opacity: 0, x: -112, y: -42, rotate: -7, scale: 0.76 },
      lastExit: { opacity: 0, x: 112, y: 42, rotate: 7, scale: 0.76 },
      firstInitial: { opacity: 0, x: -78, y: 26, rotate: -14, scale: 0.45 },
      secondInitial: { opacity: 0, x: 78, y: -26, rotate: 14, scale: 0.45 },
    };
  }

  if (style === "fade") {
    return {
      firstExit: { opacity: 0, y: -14, scale: 0.94 },
      lastExit: { opacity: 0, y: 14, scale: 0.94 },
      firstInitial: { opacity: 0, y: 8, scale: 1.18 },
      secondInitial: { opacity: 0, y: -8, scale: 1.18 },
    };
  }

  return {
    firstExit: { opacity: 0, x: -74, y: -18, rotate: -2, scale: 0.8 },
    lastExit: { opacity: 0, x: 74, y: 18, rotate: 2, scale: 0.8 },
    firstInitial: { opacity: 0, x: -58, y: 12, scale: 0.56 },
    secondInitial: { opacity: 0, x: 58, y: -12, scale: 0.56 },
  };
}

function IntroBackdrop({ animationStyle, intro, isTransforming, isFinal }) {
  if (animationStyle === "terminal") {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(72vh,38rem)] w-[min(92vw,70rem)] -translate-x-1/2 -translate-y-1/2 border"
          style={{ borderColor: `${intro.primaryColor}55` }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 0.32, scale: isFinal ? 1 : 0.985 }}
          transition={{ duration: 0.8, ease: smoothEase }}
        />
        <motion.div
          className="pointer-events-none absolute left-0 top-[22%] h-px w-full"
          style={{ backgroundColor: intro.secondaryColor }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: isTransforming ? 0.45 : 0.12, scaleX: isTransforming ? 1 : 0.56 }}
          transition={{ duration: 0.72, ease: smoothEase }}
        />
      </>
    );
  }

  if (animationStyle === "orbit") {
    return (
      <>
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border sm:h-[25rem] sm:w-[25rem]"
          style={{ borderColor: `${intro.primaryColor}44` }}
          initial={{ opacity: 0, scale: 0.66, rotate: -70 }}
          animate={{ opacity: isTransforming ? 0.75 : 0.3, scale: isFinal ? 1.08 : 1, rotate: isFinal ? 120 : 0 }}
          transition={{ duration: 1.1, ease: smoothEase }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[12rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed sm:h-[19rem] sm:w-[19rem]"
          style={{ borderColor: `${intro.secondaryColor}66` }}
          initial={{ opacity: 0, scale: 0.5, rotate: 80 }}
          animate={{ opacity: isTransforming ? 0.8 : 0.22, scale: isFinal ? 0.78 : 1, rotate: isFinal ? -160 : 0 }}
          transition={{ duration: 1.25, ease: smoothEase }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: intro.primaryColor, boxShadow: `0 0 28px ${intro.primaryColor}` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isTransforming ? 1 : 0.2, scale: isFinal ? 2.2 : 1 }}
          transition={{ duration: 0.56, ease: smoothEase }}
        />
      </>
    );
  }

  if (animationStyle === "spotlight") {
    return (
      <>
        <motion.div
          className="pointer-events-none absolute left-1/2 top-0 h-[68vh] w-[min(70vw,38rem)] -translate-x-1/2"
          style={{
            backgroundColor: intro.primaryColor,
            clipPath: "polygon(46% 0, 54% 0, 86% 100%, 14% 100%)",
          }}
          initial={{ opacity: 0, scaleY: 0.4 }}
          animate={{ opacity: isTransforming ? 0.11 : 0.045, scaleY: isFinal ? 1.08 : 1 }}
          transition={{ duration: 0.8, ease: smoothEase }}
        />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[14rem] w-[min(84vw,52rem)] -translate-x-1/2 -translate-y-1/2 border-y"
          style={{ borderColor: `${intro.secondaryColor}66` }}
          initial={{ opacity: 0, scaleX: 0.26 }}
          animate={{ opacity: isTransforming ? 0.8 : 0.24, scaleX: isFinal ? 0.66 : 1 }}
          transition={{ duration: 0.75, ease: smoothEase }}
        />
      </>
    );
  }

  if (animationStyle === "prism") {
    return (
      <>
        {[-1, 0, 1].map((offset, index) => (
          <motion.div
            key={offset}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[20rem] w-[7rem] -translate-x-1/2 -translate-y-1/2 sm:h-[28rem] sm:w-[10rem]"
            style={{
              backgroundColor: index === 1 ? intro.secondaryColor : intro.primaryColor,
              clipPath: "polygon(18% 0, 100% 0, 82% 100%, 0 100%)",
            }}
            initial={{ opacity: 0, x: offset * 150, rotate: offset * 18, scaleY: 0.36 }}
            animate={{
              opacity: isTransforming ? 0.32 : 0.08,
              x: isFinal ? offset * 118 : offset * 68,
              rotate: isFinal ? offset * 12 : offset * 5,
              scaleY: isFinal ? 1.06 : 1,
            }}
            transition={{ duration: 0.88, delay: index * 0.07, ease: smoothEase }}
          />
        ))}
      </>
    );
  }

  if (animationStyle === "kinetic") {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[linear-gradient(90deg,#ffffff_1px,transparent_1px),linear-gradient(#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
        {[-26, -8, 10, 28].map((offset, index) => (
          <motion.div
            key={offset}
            className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[min(72vw,44rem)] -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: index % 2 === 0 ? intro.primaryColor : intro.secondaryColor }}
            initial={{ opacity: 0, rotate: offset - 22, scaleX: 0.1 }}
            animate={{
              opacity: isTransforming ? 0.48 : 0.13,
              rotate: isFinal ? offset + 10 : offset,
              scaleX: isTransforming ? 1 : 0.5,
            }}
            transition={{ duration: 0.72, delay: index * 0.05, ease: smoothEase }}
          />
        ))}
      </>
    );
  }

  if (animationStyle === "fade") {
    return (
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[min(70vw,34rem)] -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: intro.primaryColor }}
        initial={{ opacity: 0, scaleX: 0.2 }}
        animate={{ opacity: isTransforming ? 0.35 : 0.12, scaleX: isFinal ? 0.34 : 0.68 }}
        transition={{ duration: 0.72, ease: smoothEase }}
      />
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] bg-[linear-gradient(90deg,#ffffff_1px,transparent_1px),linear-gradient(#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[min(86vw,760px)] -translate-x-1/2 -translate-y-1/2"
        style={{ backgroundColor: intro.primaryColor }}
        initial={{ opacity: 0, scaleX: 0.1 }}
        animate={{ opacity: isTransforming ? 0.52 : 0.18, scaleX: isTransforming ? 1 : 0.52 }}
        transition={{ duration: isTransforming ? 0.8 : 0.55, ease: smoothEase }}
      />
    </>
  );
}

function GreetingScene({ animationStyle, currentGreeting, intro }) {
  if (animationStyle === "terminal") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGreeting}
          className="flex max-w-full items-center gap-2 border px-4 py-3 font-mono text-sm sm:px-6 sm:text-lg"
          style={{ borderColor: `${intro.primaryColor}88`, color: intro.primaryColor }}
          initial={{ opacity: 0, y: 12, width: 0 }}
          animate={{ opacity: 1, y: 0, width: "auto" }}
          exit={{ opacity: 0, y: -8, width: 0 }}
          transition={{ duration: 0.45, ease: smoothEase }}
        >
          <span style={{ color: intro.secondaryColor }}>&gt;</span>
          <span className="truncate">{currentGreeting}</span>
          <motion.span
            className="h-4 w-2"
            style={{ backgroundColor: intro.primaryColor }}
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  const spotlight = animationStyle === "spotlight";
  const prism = animationStyle === "prism";

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={currentGreeting}
        className={`max-w-full break-words font-semibold text-white ${
          spotlight ? "text-3xl uppercase sm:text-5xl md:text-6xl" : "text-4xl sm:text-6xl md:text-7xl"
        } ${prism ? "text-white/90" : ""}`}
        initial={{ opacity: 0, y: animationStyle === "orbit" ? 0 : 20, scale: animationStyle === "orbit" ? 0.7 : 1, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: animationStyle === "orbit" ? 0 : -18, scale: animationStyle === "orbit" ? 1.35 : 1, filter: "blur(8px)" }}
        transition={{ duration: 0.44, ease: smoothEase }}
      >
        {currentGreeting}
      </motion.p>
    </AnimatePresence>
  );
}

function LegacyNameScene({
  firstName,
  lastName,
  firstInitial,
  secondInitial,
  intro,
  isTransforming,
  isFinal,
  transforms,
  wordDuration,
  initialsDuration,
}) {
  const wordTransition = { duration: wordDuration, ease: smoothEase };
  const initialsTransition = { duration: initialsDuration, ease: [0.16, 1, 0.3, 1] };

  return (
    <div className="relative flex min-h-[12rem] w-full items-center justify-center sm:min-h-[16rem]">
      <motion.div
        className="flex max-w-full flex-col items-center justify-center gap-1 text-5xl font-bold leading-none tracking-normal sm:flex-row sm:gap-4 sm:text-7xl md:text-8xl lg:text-9xl"
        initial={{ opacity: 0, y: 34, scale: 0.97 }}
        animate={{ opacity: 1, y: isTransforming ? -8 : 0, scale: isTransforming ? 0.94 : 1 }}
        transition={{ duration: wordDuration, ease: smoothEase }}
      >
        <motion.span
          className="max-w-full break-words"
          animate={isTransforming ? transforms.firstExit : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          transition={wordTransition}
        >
          {firstName}
        </motion.span>
        <motion.span
          className="max-w-full break-words"
          animate={isTransforming ? transforms.lastExit : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          transition={wordTransition}
        >
          {lastName}
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {isTransforming && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-7xl font-bold leading-none tracking-normal sm:text-8xl md:text-9xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1, scale: isFinal ? 1.07 : 1 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="inline-block"
              style={{ color: intro.primaryColor }}
              initial={transforms.firstInitial}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              transition={{ ...initialsTransition, delay: Math.min(wordDuration * 0.2, 0.3) }}
            >
              {firstInitial}
            </motion.span>
            <motion.span
              className="inline-block"
              style={{ color: intro.secondaryColor }}
              initial={transforms.secondInitial}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
              transition={{ ...initialsTransition, delay: Math.min(wordDuration * 0.38, 0.5) }}
            >
              {secondInitial}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrbitNameScene({ firstName, lastName, firstInitial, secondInitial, intro, isTransforming, isFinal }) {
  return (
    <div className="relative flex min-h-[16rem] w-full items-center justify-center sm:min-h-[21rem]">
      <motion.div
        className="absolute h-[14rem] w-[14rem] rounded-full border sm:h-[20rem] sm:w-[20rem]"
        style={{ borderColor: `${intro.primaryColor}88` }}
        initial={{ opacity: 0, rotate: -90, scale: 0.72 }}
        animate={{ opacity: isTransforming ? 0.9 : 0.34, rotate: isFinal ? 210 : 0, scale: isFinal ? 0.88 : 1 }}
        transition={{ duration: 1.1, ease: smoothEase }}
      />
      <motion.div
        className="absolute h-[10rem] w-[10rem] rounded-full border border-dashed sm:h-[15rem] sm:w-[15rem]"
        style={{ borderColor: `${intro.secondaryColor}99` }}
        initial={{ opacity: 0, rotate: 90, scale: 0.55 }}
        animate={{ opacity: isTransforming ? 0.78 : 0.18, rotate: isFinal ? -240 : 0, scale: isFinal ? 1.12 : 1 }}
        transition={{ duration: 1.2, ease: smoothEase }}
      />
      <motion.div
        className="relative z-10 flex max-w-full flex-col items-center gap-2 text-center text-5xl font-bold leading-none text-white sm:text-7xl md:text-8xl"
        initial={{ opacity: 0, scale: 0.8, y: 22 }}
        animate={{ opacity: isTransforming ? 0 : 1, scale: isTransforming ? 0.46 : 1, y: isTransforming ? -16 : 0 }}
        transition={{ duration: 0.68, ease: smoothEase }}
      >
        <span className="max-w-full break-words">{firstName}</span>
        <span className="max-w-full break-words" style={{ color: intro.secondaryColor }}>{lastName}</span>
      </motion.div>
      <motion.div
        className="absolute z-20 flex items-center text-8xl font-bold leading-none sm:text-9xl md:text-[11rem]"
        initial={{ opacity: 0, scale: 0.3, rotate: -70 }}
        animate={{ opacity: isTransforming ? 1 : 0, scale: isFinal ? 1.12 : 1, rotate: 0 }}
        transition={{ duration: 0.72, ease: smoothEase }}
      >
        <span style={{ color: intro.primaryColor }}>{firstInitial}</span>
        <span style={{ color: intro.secondaryColor }}>{secondInitial}</span>
      </motion.div>
    </div>
  );
}

function SpotlightNameScene({ firstName, lastName, firstInitial, secondInitial, intro, isTransforming, isFinal }) {
  return (
    <div className="relative flex min-h-[15rem] w-full items-center justify-center overflow-hidden sm:min-h-[19rem]">
      <motion.div
        className="pointer-events-none absolute inset-y-6 left-[12%] right-[12%] border-x"
        style={{ borderColor: `${intro.primaryColor}66` }}
        initial={{ opacity: 0, scaleX: 0.26 }}
        animate={{ opacity: isTransforming ? 0.7 : 0.18, scaleX: isFinal ? 0.58 : 1 }}
        transition={{ duration: 0.72, ease: smoothEase }}
      />
      <motion.div
        className="relative z-10 flex max-w-full flex-col items-center gap-1 text-center text-5xl font-bold uppercase leading-none text-white sm:text-7xl md:text-8xl"
        initial={{ opacity: 0, y: 38, scale: 0.9 }}
        animate={{ opacity: isTransforming ? 0 : 1, y: isTransforming ? -30 : 0, scale: 1 }}
        transition={{ duration: 0.68, ease: smoothEase }}
      >
        <span className="max-w-full break-words">{firstName}</span>
        <span className="max-w-full break-words">{lastName}</span>
      </motion.div>
      <motion.div
        className="absolute z-20 flex items-center border-y px-4 py-2 text-8xl font-bold leading-none sm:px-7 sm:py-4 sm:text-9xl md:text-[11rem]"
        style={{ borderColor: intro.secondaryColor }}
        initial={{ opacity: 0, scaleX: 0.3, y: 24 }}
        animate={{ opacity: isTransforming ? 1 : 0, scaleX: isFinal ? 1.1 : 1, y: 0 }}
        transition={{ duration: 0.64, ease: smoothEase }}
      >
        <span style={{ color: intro.primaryColor }}>{firstInitial}</span>
        <span style={{ color: intro.secondaryColor }}>{secondInitial}</span>
      </motion.div>
    </div>
  );
}

function TerminalNameScene({ firstName, lastName, initials, intro, isTransforming, isFinal }) {
  const fullName = `${firstName} ${lastName}`.trim();
  const output = isFinal ? `identity ready: ${initials}` : isTransforming ? "building monogram..." : `identity: ${fullName}`;

  return (
    <div className="relative flex min-h-[15rem] w-full items-center justify-center sm:min-h-[19rem]">
      <motion.div
        className="relative z-10 w-full max-w-3xl border bg-black/45 font-mono"
        style={{ borderColor: `${intro.primaryColor}99` }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: isFinal ? 0.94 : 1 }}
        transition={{ duration: 0.62, ease: smoothEase }}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3 text-xs sm:text-sm" style={{ borderColor: `${intro.primaryColor}55`, color: intro.secondaryColor }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: intro.primaryColor }} />
          <span>portfolio / identity</span>
        </div>
        <div className="grid gap-4 px-4 py-6 sm:px-7 sm:py-9">
          <motion.p
            className="break-words text-lg font-semibold sm:text-2xl"
            style={{ color: intro.primaryColor }}
            animate={{ opacity: isTransforming ? 0.45 : 1, x: isTransforming ? 8 : 0 }}
            transition={{ duration: 0.38, ease: smoothEase }}
          >
            &gt; {output}
          </motion.p>
          <motion.div
            className="h-px w-full"
            style={{ backgroundColor: intro.secondaryColor }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: isTransforming ? 1 : 0.3 }}
            transition={{ duration: 0.65, ease: smoothEase }}
          />
          <p className="text-xs text-white/45 sm:text-sm">status: {isFinal ? "online" : "initializing"}</p>
        </div>
      </motion.div>
      <motion.div
        className="absolute z-20 bg-black px-3 font-mono text-7xl font-bold leading-none sm:px-5 sm:text-9xl md:text-[11rem]"
        style={{ color: intro.secondaryColor }}
        initial={{ opacity: 0, scale: 0.72, y: 8 }}
        animate={{ opacity: isTransforming ? 1 : 0, scale: isFinal ? 1.12 : 1, y: 0 }}
        transition={{ duration: 0.6, ease: smoothEase }}
      >
        {initials}_
      </motion.div>
    </div>
  );
}

function PrismNameScene({ firstName, lastName, firstInitial, secondInitial, intro, isTransforming, isFinal }) {
  return (
    <div className="relative flex min-h-[15rem] w-full items-center justify-center overflow-hidden sm:min-h-[20rem]">
      <motion.div
        className="relative z-10 flex max-w-full flex-col items-center gap-1 text-center text-5xl font-bold leading-none text-white sm:text-7xl md:text-8xl"
        initial={{ opacity: 0, scale: 0.78, y: 28 }}
        animate={{ opacity: isTransforming ? 0 : 1, scale: isTransforming ? 0.66 : 1, y: isTransforming ? -18 : 0 }}
        transition={{ duration: 0.62, ease: smoothEase }}
      >
        <span className="max-w-full break-words">{firstName}</span>
        <span className="max-w-full break-words">{lastName}</span>
      </motion.div>
      {[-1, 0, 1].map((offset, index) => (
        <motion.div
          key={offset}
          className="pointer-events-none absolute z-[11] h-[14rem] w-[5.5rem] sm:h-[18rem] sm:w-[7.5rem]"
          style={{
            backgroundColor: index === 1 ? intro.secondaryColor : intro.primaryColor,
            clipPath: "polygon(16% 0, 100% 0, 84% 100%, 0 100%)",
          }}
          initial={{ opacity: 0, x: offset * 170, rotate: offset * 16, scaleY: 0.3 }}
          animate={{
            opacity: isTransforming ? 0.36 : 0.08,
            x: isFinal ? offset * 102 : offset * 58,
            rotate: isFinal ? offset * 8 : offset * 4,
            scaleY: isFinal ? 1.08 : 1,
          }}
          transition={{ duration: 0.84, delay: index * 0.08, ease: smoothEase }}
        />
      ))}
      <motion.div
        className="absolute z-20 flex items-center text-8xl font-bold leading-none sm:text-9xl md:text-[11rem]"
        initial={{ opacity: 0, scale: 0.36, rotate: -18 }}
        animate={{ opacity: isTransforming ? 1 : 0, scale: isFinal ? 1.1 : 1, rotate: 0 }}
        transition={{ duration: 0.66, ease: smoothEase }}
      >
        <span className="[text-shadow:0_0_28px_currentColor]" style={{ color: intro.primaryColor }}>{firstInitial}</span>
        <span className="[text-shadow:0_0_28px_currentColor]" style={{ color: intro.secondaryColor }}>{secondInitial}</span>
      </motion.div>
    </div>
  );
}

function NameScene({ animationStyle, ...props }) {
  if (animationStyle === "orbit") return <OrbitNameScene {...props} />;
  if (animationStyle === "spotlight") return <SpotlightNameScene {...props} />;
  if (animationStyle === "terminal") return <TerminalNameScene {...props} />;
  if (animationStyle === "prism") return <PrismNameScene {...props} />;

  return <LegacyNameScene {...props} />;
}

export default function IntroAnimation({ content = portfolioDefaults, onFinish, preview = false }) {
  const prefersReducedMotion = useReducedMotion();
  const savedIntro = {
    ...portfolioDefaults.introAnimation,
    ...(content.introAnimation || {}),
  };
  const intro = {
    ...savedIntro,
    ...getIntroAnimationColors(savedIntro),
  };
  const greetings = useMemo(
    () => (Array.isArray(intro.greetings) ? intro.greetings : [])
      .map((greeting) => String(greeting).trim())
      .filter(Boolean),
    [intro.greetings]
  );
  const enabled = preview || intro.enabled;
  const animationStyle = validStyles.has(intro.style) ? intro.style : "merge";
  const styleTiming = getIntroAnimationTiming(intro);
  const transforms = transitionStyle(animationStyle);
  const durations = {
    greeting: clampDuration(styleTiming.greetingDuration, 760, 180, 1600),
    name: clampDuration(styleTiming.nameDuration, 1500, 600, 5000),
    merge: clampDuration(styleTiming.mergeDuration, 1850, 500, 5000),
    final: clampDuration(styleTiming.finalDuration, 1200, 400, 4000),
  };
  const firstName = intro.firstName?.trim() || "Chinmay";
  const lastName = intro.lastName?.trim() || "Biswas";
  const initials = (intro.initials?.trim() || initialsFromName(firstName, lastName)).toUpperCase();
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [phase, setPhase] = useState("greeting");
  const [visible, setVisible] = useState(true);
  const finishedRef = useRef(false);
  const hasGreeting = enabled && intro.showGreeting && greetings.length > 0;
  const currentPhase = phase === "greeting" && !hasGreeting ? "name" : phase;
  const currentGreeting = greetings[Math.min(greetingIndex, Math.max(greetings.length - 1, 0))] || "";
  const isTransforming = currentPhase === "transform" || currentPhase === "final";
  const isFinal = currentPhase === "final";
  const firstInitial = initials.charAt(0) || "C";
  const secondInitial = initials.slice(1) || "J";
  const screenExit = animationStyle === "terminal"
    ? { opacity: 0, y: -10 }
    : animationStyle === "prism"
      ? { opacity: 0, scale: 1.04, rotate: 1 }
      : { opacity: 0, scale: 1.015 };

  const finishIntro = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (enabled && !prefersReducedMotion) return undefined;

    const timer = window.setTimeout(finishIntro, 60);
    return () => window.clearTimeout(timer);
  }, [enabled, finishIntro, prefersReducedMotion]);

  useEffect(() => {
    if (!visible || !enabled || prefersReducedMotion) return undefined;

    let delay = durations.final;
    let next = () => setVisible(false);

    if (currentPhase === "greeting") {
      delay = durations.greeting;
      next = greetingIndex < greetings.length - 1
        ? () => setGreetingIndex((index) => index + 1)
        : () => setPhase("name");
    } else if (currentPhase === "name") {
      delay = durations.name;
      next = () => setPhase("transform");
    } else if (currentPhase === "transform") {
      delay = durations.merge;
      next = () => setPhase("final");
    }

    const timer = window.setTimeout(next, delay);
    return () => window.clearTimeout(timer);
  }, [currentPhase, durations.final, durations.greeting, durations.merge, durations.name, enabled, greetingIndex, greetings.length, prefersReducedMotion, visible]);

  useEffect(() => {
    if (visible) return undefined;

    const timer = window.setTimeout(finishIntro, 900);
    return () => window.clearTimeout(timer);
  }, [finishIntro, visible]);

  const wordDuration = Math.min(durations.merge / 1000 * 0.66, 1.3);
  const initialsDuration = Math.min(durations.merge / 1000 * 0.7, 1.35);

  return (
    <AnimatePresence onExitComplete={finishIntro}>
      {visible && enabled && !prefersReducedMotion && (
        <motion.main
          className="fixed inset-0 z-[9999] flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-8 text-white sm:px-8"
          style={{ backgroundColor: intro.backgroundColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={screenExit}
          transition={{ duration: 0.55, ease: smoothEase }}
          aria-live="polite"
          aria-label="Portfolio introduction"
        >
          <IntroBackdrop
            animationStyle={animationStyle}
            intro={intro}
            isTransforming={isTransforming}
            isFinal={isFinal}
          />

          <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
            {currentPhase === "greeting" ? (
              <GreetingScene
                animationStyle={animationStyle}
                currentGreeting={currentGreeting}
                intro={intro}
              />
            ) : (
              <>
                <NameScene
                  animationStyle={animationStyle}
                  firstName={firstName}
                  lastName={lastName}
                  initials={initials}
                  firstInitial={firstInitial}
                  secondInitial={secondInitial}
                  intro={intro}
                  isTransforming={isTransforming}
                  isFinal={isFinal}
                  transforms={transforms}
                  wordDuration={wordDuration}
                  initialsDuration={initialsDuration}
                />
                {intro.caption?.trim() && (
                  <motion.p
                    className={`mt-4 max-w-[90vw] text-sm font-medium tracking-normal text-white/60 sm:text-base ${
                      animationStyle === "terminal" ? "font-mono" : ""
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isFinal ? 0.9 : 0.65, y: 0 }}
                    transition={{ duration: 0.45, delay: currentPhase === "name" ? 0.18 : 0 }}
                  >
                    {intro.caption.trim()}
                  </motion.p>
                )}
              </>
            )}
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
