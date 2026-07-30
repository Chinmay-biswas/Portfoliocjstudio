import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import ParticlesBackground from "../components/ParticlesBackground";
import {
  getPortfolioList,
  journeyDesktopAnimationOptions,
  journeyMobileAnimationOptions,
  portfolioDefaults,
} from "../data/portfolioDefaults";

const desktopLayouts = new Set(["rail", "spotlight"]);
const desktopAnimations = new Set(journeyDesktopAnimationOptions.map(({ value }) => value));
const mobileLayouts = new Set(["timeline", "stack"]);
const mobileAnimations = new Set(journeyMobileAnimationOptions.map(({ value }) => value));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function numberSetting(value, fallback, min, max) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return fallback;
  return clamp(numericValue, min, max);
}

function selectSetting(value, values, fallback) {
  return values.has(value) ? value : fallback;
}

function withAlpha(color, alpha) {
  const normalized = String(color || "").trim().replace("#", "");
  const hex = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return `rgba(176, 92, 224, ${alpha})`;

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function initialsForIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function metaForJourney(journey) {
  return journey.company || journey.duration || "";
}

function motionForMobile(animation, index) {
  const fromRight = index % 2 === 1;

  if (animation === "slide") {
    return {
      initial: { opacity: 0, x: fromRight ? 46 : -46, y: 0, scale: 0.98 },
      visible: { opacity: 1, x: 0, y: 0, scale: 1 },
    };
  }

  if (animation === "fade") {
    return {
      initial: { opacity: 0, x: 0, y: 12, scale: 0.97 },
      visible: { opacity: 1, x: 0, y: 0, scale: 1 },
    };
  }

  if (animation === "flip") {
    return {
      initial: { opacity: 0, rotateX: fromRight ? -58 : 58, y: 24, scale: 0.94 },
      visible: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
    };
  }

  if (animation === "swing") {
    return {
      initial: { opacity: 0, x: fromRight ? 62 : -62, rotate: fromRight ? 10 : -10, scale: 0.96 },
      visible: { opacity: 1, x: 0, rotate: 0, scale: 1 },
    };
  }

  if (animation === "pop") {
    return {
      initial: { opacity: 0, y: 22, rotate: fromRight ? 4 : -4, scale: 0.72 },
      visible: { opacity: 1, y: 0, rotate: 0, scale: 1 },
    };
  }

  if (animation === "curtain") {
    return {
      initial: {
        opacity: 0,
        x: fromRight ? 18 : -18,
        scale: 0.98,
        clipPath: fromRight ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
      },
      visible: { opacity: 1, x: 0, scale: 1, clipPath: "inset(0 0 0 0)" },
    };
  }

  return {
    initial: { opacity: 0, x: 0, y: 38, scale: 0.96 },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
  };
}

function mobileCardTransition(animation, index) {
  const delay = Math.min(index * 0.035, 0.18);

  if (animation === "swing" || animation === "pop") {
    return { type: "spring", stiffness: 250, damping: 21, mass: 0.72, delay };
  }

  if (animation === "curtain") {
    return { duration: 0.74, delay, ease: [0.16, 1, 0.3, 1] };
  }

  return { duration: animation === "flip" ? 0.7 : 0.62, delay, ease: [0.22, 1, 0.36, 1] };
}

function mobileTransformOrigin(animation, index) {
  if (animation === "swing" || animation === "curtain") {
    return index % 2 === 1 ? "right center" : "left center";
  }

  return "center center";
}

function cardWidthClass(visibleCards) {
  if (visibleCards >= 4) return "w-[min(22vw,17rem)]";
  if (visibleCards <= 2) return "w-[min(68vw,34rem)]";
  return "w-[min(30vw,25rem)]";
}

function desktopCardState({ animation, layout, cardGap, index, total, latest }) {
  const lane = index % 2 === 0 ? -1 : 1;
  const relative = index - latest * Math.max(total - 1, 0);
  const distance = Math.abs(relative);
  const layoutGap = layout === "spotlight" ? cardGap * 1.28 : cardGap;
  const baseState = {
    x: relative * layoutGap,
    y: lane * Math.min(distance * 28, 42),
    scale: Math.max(0.84, 1 - distance * 0.09),
    opacity: clamp(1 - distance * 0.5, 0, 1),
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    zIndex: Math.round(100 - Math.min(distance * 24, 96)),
  };

  if (animation === "cascade") {
    return {
      ...baseState,
      y: lane * Math.min(distance * 68, 104),
      scale: Math.max(0.79, 1 - distance * 0.11),
      opacity: clamp(1 - distance * 0.53, 0, 1),
      rotate: clamp(relative * lane * 3.5, -8, 8),
    };
  }

  if (animation === "focus") {
    return {
      ...baseState,
      x: relative * layoutGap * 1.16,
      y: lane * Math.min(distance * 16, 28),
      scale: Math.max(0.74, 1 - distance * 0.16),
      opacity: clamp(1 - distance * 0.72, 0, 1),
    };
  }

  if (animation === "orbit") {
    const orbitOffset = clamp(relative, -3, 3);

    return {
      ...baseState,
      x: orbitOffset * layoutGap * 0.68,
      y: Math.sin(orbitOffset * 1.12) * 118,
      scale: Math.max(0.64, 1 - distance * 0.14),
      opacity: clamp(1 - distance * 0.46, 0, 1),
      rotate: clamp(orbitOffset * 14, -26, 26),
      rotateY: clamp(orbitOffset * -22, -42, 42),
    };
  }

  if (animation === "deck") {
    const deckOffset = clamp(relative, -3.5, 3.5);
    const deckDistance = Math.abs(deckOffset);

    return {
      ...baseState,
      x: deckOffset * 32,
      y: deckOffset * 44,
      scale: Math.max(0.7, 1 - deckDistance * 0.09),
      opacity: clamp(1 - Math.max(distance - 2.7, 0) * 0.7, 0, 1),
      rotate: deckOffset * 4,
      rotateY: deckOffset * -3,
      zIndex: Math.round(110 - Math.min(distance * 18, 104)),
    };
  }

  if (animation === "split") {
    return {
      ...baseState,
      x: relative * layoutGap * 0.82,
      y: lane * (70 + Math.min(distance * 34, 86)),
      scale: Math.max(0.76, 1 - distance * 0.12),
      opacity: clamp(1 - distance * 0.46, 0, 1),
      rotate: lane * clamp(relative * 7, -12, 12),
      rotateY: lane * clamp(relative * 14, -20, 20),
    };
  }

  if (animation === "flip") {
    return {
      ...baseState,
      x: relative * layoutGap * 0.58,
      y: lane * Math.min(distance * 10, 16),
      scale: Math.max(0.68, 1 - distance * 0.15),
      opacity: clamp(1 - distance * 0.52, 0, 1),
      rotateX: lane * clamp(distance * 4, 0, 8),
      rotateY: clamp(relative * -48, -76, 76),
    };
  }

  return baseState;
}

function useDesktopCardMotion({ index, total, progress, settings, cardGap }) {
  const stateFor = (latest) => desktopCardState({
    animation: settings.desktopAnimation,
    layout: settings.desktopLayout,
    cardGap,
    index,
    total,
    latest,
  });
  const x = useTransform(progress, (latest) => stateFor(latest).x);
  const y = useTransform(progress, (latest) => stateFor(latest).y);
  const scale = useTransform(progress, (latest) => stateFor(latest).scale);
  const opacity = useTransform(progress, (latest) => stateFor(latest).opacity);
  const rotate = useTransform(progress, (latest) => stateFor(latest).rotate);
  const rotateX = useTransform(progress, (latest) => stateFor(latest).rotateX);
  const rotateY = useTransform(progress, (latest) => stateFor(latest).rotateY);
  const zIndex = useTransform(progress, (latest) => stateFor(latest).zIndex);

  return { x, y, scale, opacity, rotate, rotateX, rotateY, zIndex };
}

function DesktopJourneyCard({ journey, index, total, progress, settings }) {
  const cardGap = settings.desktopVisibleCards >= 4
    ? 250
    : settings.desktopVisibleCards <= 2
      ? 500
      : 350;
  const cardMotion = useDesktopCardMotion({ index, total, progress, settings, cardGap });

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ perspective: "1500px", zIndex: cardMotion.zIndex }}
    >
      <motion.article
        className={`${cardWidthClass(settings.desktopVisibleCards)} relative overflow-hidden rounded-lg border p-6 shadow-2xl backdrop-blur sm:p-7`}
        style={{
          backgroundColor: withAlpha(settings.cardColor, 0.9),
          borderColor: withAlpha(settings.accentColor, 0.38),
          boxShadow: `0 18px 65px ${withAlpha(settings.accentColor, 0.13)}`,
          opacity: cardMotion.opacity,
          rotate: cardMotion.rotate,
          rotateX: cardMotion.rotateX,
          rotateY: cardMotion.rotateY,
          scale: cardMotion.scale,
          transformStyle: "preserve-3d",
          x: cardMotion.x,
          y: cardMotion.y,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundColor: withAlpha(settings.accentColor, 0.8) }} />
        <div className="flex items-start justify-between gap-4">
          {settings.showCardNumber && (
            <span className="text-xs font-bold tracking-[0.2em]" style={{ color: settings.accentColor }}>
              {initialsForIndex(index)}
            </span>
          )}
          <span className="ml-auto max-w-[58%] text-right text-xs font-medium leading-relaxed text-white/45">
            {journey.duration}
          </span>
        </div>
        <h3 className="mt-6 break-words text-xl font-semibold leading-tight text-white sm:text-2xl">
          {journey.role}
        </h3>
        {journey.company && <p className="mt-3 break-words text-sm font-medium text-white/60">{journey.company}</p>}
        <p className="mt-4 break-words text-sm leading-relaxed text-white/68 sm:text-base">
          {journey.description}
        </p>
      </motion.article>
    </motion.div>
  );
}

function DesktopJourneyGuide({ progress, settings }) {
  const borderColor = withAlpha(settings.accentColor, 0.24);
  const glowColor = withAlpha(settings.accentColor, 0.72);

  if (settings.desktopAnimation === "orbit") {
    return (
      <>
        <div
          className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed"
          style={{ borderColor }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[12rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ borderColor: withAlpha(settings.accentColor, 0.14) }}
        />
      </>
    );
  }

  if (settings.desktopAnimation === "deck") {
    return (
      <>
        <div
          className="absolute left-1/2 top-1/2 h-[16rem] w-[min(54vw,31rem)] rounded-lg border"
          style={{ borderColor, transform: "translate(-50%, -50%) rotate(-7deg)" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[16rem] w-[min(54vw,31rem)] rounded-lg border"
          style={{ borderColor: withAlpha(settings.accentColor, 0.13), transform: "translate(-50%, -50%) rotate(7deg)" }}
        />
      </>
    );
  }

  if (settings.desktopAnimation === "split") {
    return (
      <>
        <div className="absolute left-0 right-0 h-px" style={{ backgroundColor: borderColor, top: "calc(50% - 4.5rem)" }} />
        <div className="absolute left-0 right-0 h-px" style={{ backgroundColor: borderColor, top: "calc(50% + 4.5rem)" }} />
        <motion.div
          className="absolute left-0 h-px origin-left"
          style={{
            backgroundColor: settings.accentColor,
            boxShadow: `0 0 22px ${glowColor}`,
            scaleX: progress,
            top: "calc(50% - 4.5rem)",
            width: "100%",
          }}
        />
        <motion.div
          className="absolute left-0 h-px origin-left"
          style={{
            backgroundColor: settings.accentColor,
            boxShadow: `0 0 22px ${glowColor}`,
            scaleX: progress,
            top: "calc(50% + 4.5rem)",
            width: "100%",
          }}
        />
      </>
    );
  }

  if (settings.desktopAnimation === "flip") {
    return (
      <>
        <div className="absolute bottom-12 left-1/2 top-8 w-px -translate-x-1/2" style={{ backgroundColor: borderColor }} />
        <motion.div
          className="absolute bottom-12 left-1/2 top-8 w-px origin-top -translate-x-1/2"
          style={{
            backgroundColor: settings.accentColor,
            boxShadow: `0 0 22px ${glowColor}`,
            scaleY: progress,
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2" style={{ backgroundColor: borderColor }} />
      <motion.div
        className="absolute left-0 top-1/2 h-px origin-left -translate-y-1/2"
        style={{
          backgroundColor: settings.accentColor,
          boxShadow: `0 0 24px ${glowColor}`,
          scaleX: progress,
          width: "100%",
        }}
      />
    </>
  );
}

function DesktopJourney({ journeys, progress, settings }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(progress, "change", (latest) => {
    const nextIndex = clamp(Math.round(latest * Math.max(journeys.length - 1, 1)), 0, Math.max(journeys.length - 1, 0));

    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  return (
    <div className="relative h-[min(35rem,64vh)] w-full max-w-7xl" aria-label="Journey timeline">
      <DesktopJourneyGuide progress={progress} settings={settings} />

      {journeys.map((journey, index) => (
        <DesktopJourneyCard
          key={`${journey.role}-${journey.company}-${index}`}
          journey={journey}
          index={index}
          progress={progress}
          settings={settings}
          total={journeys.length}
        />
      ))}

      <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/45">
        <span style={{ color: settings.accentColor }}>{initialsForIndex(activeIndex)}</span>
        <span>/</span>
        <span>{initialsForIndex(Math.max(journeys.length - 1, 0))}</span>
      </div>
    </div>
  );
}

function MobileJourney({ journeys, progress, settings }) {
  const isTimeline = settings.mobileLayout === "timeline";
  const cardGap = numberSetting(settings.mobileCardGap, 28, 16, 80);

  return (
    <div className="relative mx-auto mt-10 w-full max-w-lg">
      {isTimeline && (
        <div className="absolute bottom-1 left-[0.8rem] top-1 w-px" style={{ backgroundColor: withAlpha(settings.accentColor, 0.22) }}>
          {settings.showMobileProgress && (
            <motion.div
              className="absolute inset-x-0 top-0 origin-top"
              style={{
                backgroundColor: settings.accentColor,
                boxShadow: `0 0 18px ${withAlpha(settings.accentColor, 0.65)}`,
                height: "100%",
                scaleY: progress,
              }}
            />
          )}
        </div>
      )}

      <div className="grid" style={{ gap: `${cardGap}px`, perspective: "1000px" }}>
        {journeys.map((journey, index) => {
          const cardMotion = motionForMobile(settings.mobileAnimation, index);

          return (
            <motion.article
            key={`${journey.role}-${journey.company}-${index}`}
            className={`relative overflow-hidden rounded-lg border p-5 shadow-xl backdrop-blur ${isTimeline ? "ml-9" : ""}`}
            style={{
              backgroundColor: withAlpha(settings.cardColor, 0.9),
              borderColor: withAlpha(settings.accentColor, 0.35),
              boxShadow: `0 16px 48px ${withAlpha(settings.accentColor, 0.12)}`,
              transformOrigin: mobileTransformOrigin(settings.mobileAnimation, index),
              transformStyle: "preserve-3d",
            }}
            initial={cardMotion.initial}
            whileInView={cardMotion.visible}
            viewport={{ amount: 0.3, once: false }}
            transition={mobileCardTransition(settings.mobileAnimation, index)}
          >
            {isTimeline && (
              <motion.span
                className="absolute -left-[2.25rem] top-6 h-4 w-4 rounded-full border-4"
                style={{
                  backgroundColor: settings.cardColor,
                  borderColor: settings.accentColor,
                  boxShadow: `0 0 0 7px ${withAlpha(settings.accentColor, 0.12)}`,
                }}
                initial={{ scale: 0.7, opacity: 0.5 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ amount: 0.3, once: false }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundColor: withAlpha(settings.accentColor, 0.75) }} />
            <div className="flex items-start justify-between gap-3">
              {settings.showCardNumber && (
                <span className="text-xs font-bold tracking-[0.2em]" style={{ color: settings.accentColor }}>
                  {initialsForIndex(index)}
                </span>
              )}
              <span className="ml-auto text-right text-xs font-medium leading-relaxed text-white/45">
                {journey.duration}
              </span>
            </div>
            <h3 className="mt-5 break-words text-xl font-semibold leading-tight text-white">{journey.role}</h3>
            {metaForJourney(journey) && <p className="mt-2 break-words text-sm font-medium text-white/60">{metaForJourney(journey)}</p>}
            <p className="mt-4 break-words text-sm leading-relaxed text-white/68">{journey.description}</p>
          </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export default function Experienceprochat({ content = portfolioDefaults }) {
  const journeys = getPortfolioList(content, "journeys");
  const desktopSceneRef = useRef(null);
  const mobileSceneRef = useRef(null);
  const settings = useMemo(() => {
    const source = { ...portfolioDefaults.journeySection, ...(content.journeySection || {}) };

    return {
      ...source,
      desktopLayout: selectSetting(source.desktopLayout, desktopLayouts, "rail"),
      desktopAnimation: selectSetting(source.desktopAnimation, desktopAnimations, "glide"),
      desktopVisibleCards: numberSetting(source.desktopVisibleCards, 3, 2, 4),
      desktopScrollVh: numberSetting(source.desktopScrollVh, 38, 20, 100),
      mobileLayout: selectSetting(source.mobileLayout, mobileLayouts, "timeline"),
      mobileAnimation: selectSetting(source.mobileAnimation, mobileAnimations, "rise"),
      mobileCardGap: numberSetting(source.mobileCardGap, 28, 16, 80),
      showCardNumber: source.showCardNumber !== false,
      showMobileProgress: source.showMobileProgress !== false,
    };
  }, [content.journeySection]);
  const desktopSceneHeight = Math.max(settings.desktopScrollVh * Math.max(journeys.length - 1, 1), 115);
  const { scrollYProgress: desktopProgress } = useScroll({
    target: desktopSceneRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileSceneRef,
    offset: ["start end", "end start"],
  });

  return (
    <section id="exp" className="relative overflow-x-clip bg-[#05070a] text-white">
      <ParticlesBackground />

      <div ref={mobileSceneRef} className="relative z-10 px-5 py-20 sm:px-8 lg:hidden">
        <header className="mx-auto max-w-lg">
          {settings.eyebrow?.trim() && (
            <p className="text-sm font-semibold tracking-[0.18em]" style={{ color: settings.accentColor }}>
              {settings.eyebrow.trim()}
            </p>
          )}
          <h2 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">{settings.title}</h2>
        </header>
        <MobileJourney journeys={journeys} progress={mobileProgress} settings={settings} />
      </div>

      <div ref={desktopSceneRef} className="relative z-10 hidden lg:block" style={{ height: `${desktopSceneHeight}vh` }}>
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden px-8 py-12 xl:px-12">
          <header className="mx-auto w-full max-w-7xl">
            {settings.eyebrow?.trim() && (
              <p className="text-sm font-semibold tracking-[0.2em]" style={{ color: settings.accentColor }}>
                {settings.eyebrow.trim()}
              </p>
            )}
            <h2 className="mt-3 text-6xl font-semibold tracking-normal text-white xl:text-7xl">{settings.title}</h2>
          </header>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <DesktopJourney journeys={journeys} progress={desktopProgress} settings={settings} />
          </div>
        </div>
      </div>
    </section>
  );
}
