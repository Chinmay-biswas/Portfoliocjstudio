import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { portfolioDefaults } from "../data/portfolioDefaults";
import ParticlesBackground from "../components/ParticlesBackground";
import SkillIcon from "../components/SkillIcon";

function seededRandom(seed) {
  let state = seed;

  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

const starRandom = seededRandom(7);
const stars = Array.from({ length: 70 }, () => ({
  x: starRandom() * 100,
  y: starRandom() * 100,
  radius: starRandom() * 1.4 + 0.3,
  opacity: starRandom() * 0.6 + 0.2,
}));

function dialogMotion(animation) {
  if (animation === "slide") {
    return { initial: { opacity: 0, y: 42 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 26 } };
  }

  if (animation === "fade") {
    return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  }

  if (animation === "spring") {
    return {
      initial: { opacity: 0, scale: 0.82, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.92, y: 12 },
      transition: { type: "spring", stiffness: 280, damping: 23 },
    };
  }

  return { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.94 } };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function launchBall(ball) {
  if (!ball) return;

  const angle = Math.random() * Math.PI * 2;
  ball.vx = Math.cos(angle) * 0.7;
  ball.vy = Math.sin(angle) * 0.7;
}

function findNearestSkillToUfo(balls, cursorX, cursorY) {
  const beamCenterY = cursorY + 72;

  return balls.reduce((closest, ball) => {
    const distance = Math.hypot(ball.x - cursorX, ball.y - beamCenterY);
    const captureRadius = Math.max(118, ball.size / 2 + 78);

    if (distance > captureRadius) return closest;

    // Give a slight preference to balls under the UFO beam instead of above it.
    const score = distance + (ball.y < cursorY ? 36 : 0);
    return !closest || score < closest.score ? { ball, score } : closest;
  }, null)?.ball || null;
}

export default function SkillsSpace({ content = portfolioDefaults }) {
  const section = {
    ...portfolioDefaults.skillsSpaceSection,
    ...(content.skillsSpaceSection || {}),
  };
  const skillItems =
    Array.isArray(content.spaceSkills)
      ? content.spaceSkills
      : portfolioDefaults.spaceSkills;
  const skillItemsSignature = JSON.stringify(skillItems);
  const stableSkillItems = useMemo(
    () => JSON.parse(skillItemsSignature),
    [skillItemsSignature]
  );
  const accentColor = section.accentColor || "#1DCD9F";
  const secondaryColor = section.secondaryColor || "#8b7cf6";
  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const ballsRef = useRef([]);
  const behaviorRef = useRef(section.ballAnimation);
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const [insideScene, setInsideScene] = useState(false);
  const [renderState, setRenderState] = useState({
    balls: [],
    cursorX: 0,
    cursorY: 0,
    caughtIndex: null,
  });
  const stateRef = useRef({
    cursorX: 0,
    cursorY: 0,
    caughtIndex: null,
  });

  useEffect(() => {
    behaviorRef.current = section.ballAnimation;
  }, [section.ballAnimation]);

  useEffect(() => {
    const element = sceneRef.current;
    if (!element) return undefined;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      setSceneSize({ width: rect.width, height: rect.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sceneSize.width || !sceneSize.height) return;
    const random = seededRandom(42);
    const placed = [];
    const baseSize = clamp(Number(section.ballSize) || 76, 48, 104);

    ballsRef.current = stableSkillItems
      .filter((skill) => skill?.name?.trim())
      .map((skill, index) => {
        const size = clamp(baseSize + Math.round((random() - 0.5) * 18), 48, 104);
        const padding = size / 2 + 14;
        const minX = padding;
        const maxX = Math.max(sceneSize.width - padding, padding + 1);
        const minY = Math.max(padding, 160);
        const maxY = Math.max(sceneSize.height - padding, minY + 1);
        let x = minX + random() * (maxX - minX);
        let y = minY + random() * (maxY - minY);

        for (let attempt = 0; attempt < 30; attempt += 1) {
          const overlaps = placed.some((ball) => {
            const minimumDistance = ball.size / 2 + size / 2 + 16;
            return Math.hypot(ball.x - x, ball.y - y) < minimumDistance;
          });
          if (!overlaps) break;
          x = minX + random() * (maxX - minX);
          y = minY + random() * (maxY - minY);
        }

        placed.push({ x, y, size });
        const angle = random() * Math.PI * 2;
        const speed = 0.3 + random() * 0.48;

        return {
          skill,
          index,
          x,
          y,
          size,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          phase: random() * Math.PI * 2,
          orbitCenterX: x,
          orbitCenterY: y,
        };
      });

    stateRef.current.caughtIndex = null;
    const resetFrame = requestAnimationFrame(() => {
      setRenderState((current) => ({
        ...current,
        balls: ballsRef.current.map((ball) => ({ ...ball })),
        caughtIndex: null,
      }));
    });

    return () => cancelAnimationFrame(resetFrame);
  }, [sceneSize.height, sceneSize.width, section.ballSize, stableSkillItems]);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const tick = (now) => {
      const delta = Math.min(now - lastTime, 32);
      lastTime = now;
      const state = stateRef.current;
      const balls = ballsRef.current;
      const width = sceneRef.current?.clientWidth || 1;
      const height = sceneRef.current?.clientHeight || 1;
      const mode = behaviorRef.current;
      const time = now / 1000;

      balls.forEach((ball, index) => {
        if (index === state.caughtIndex) return;

        const speedMultiplier = mode === "pulse" ? 0.58 : mode === "float" ? 0.7 : 1;
        ball.x += ball.vx * delta * speedMultiplier;
        ball.y += ball.vy * delta * speedMultiplier;

        if (mode === "orbit") {
          ball.x += Math.cos(time * 0.85 + ball.phase) * 0.3;
          ball.y += Math.sin(time * 0.95 + ball.phase) * 0.3;
        } else if (mode === "float") {
          ball.y += Math.sin(time * 1.2 + ball.phase) * 0.22;
        } else if (mode === "pulse") {
          ball.y += Math.sin(time * 1.5 + ball.phase) * 0.15;
        }

        const radius = ball.size / 2;
        if (ball.x - radius > width) ball.x = -radius;
        if (ball.x + radius < 0) ball.x = width + radius;
        if (ball.y - radius < 138) {
          ball.y = 138 + radius;
          ball.vy = Math.abs(ball.vy);
        }
        if (ball.y + radius > height - 14) {
          ball.y = height - 14 - radius;
          ball.vy = -Math.abs(ball.vy);
        }
      });

      for (let index = 0; index < balls.length; index += 1) {
        if (index === state.caughtIndex) continue;
        for (let otherIndex = index + 1; otherIndex < balls.length; otherIndex += 1) {
          if (otherIndex === state.caughtIndex) continue;
          const first = balls[index];
          const second = balls[otherIndex];
          const dx = second.x - first.x;
          const dy = second.y - first.y;
          const distance = Math.hypot(dx, dy) || 0.0001;
          const minimumDistance = first.size / 2 + second.size / 2 + 8;

          if (distance < minimumDistance) {
            const normalX = dx / distance;
            const normalY = dy / distance;
            const offset = (minimumDistance - distance) * 0.5;
            first.x -= normalX * offset;
            first.y -= normalY * offset;
            second.x += normalX * offset;
            second.y += normalY * offset;
            const firstProjection = first.vx * normalX + first.vy * normalY;
            const secondProjection = second.vx * normalX + second.vy * normalY;
            first.vx += (secondProjection - firstProjection) * normalX * 0.55;
            first.vy += (secondProjection - firstProjection) * normalY * 0.55;
            second.vx += (firstProjection - secondProjection) * normalX * 0.55;
            second.vy += (firstProjection - secondProjection) * normalY * 0.55;
          }
        }
      }

      if (state.caughtIndex !== null) {
        const caughtBall = balls[state.caughtIndex];
        if (caughtBall) {
          caughtBall.x = clamp(state.cursorX, caughtBall.size / 2, width - caughtBall.size / 2);
          caughtBall.y = clamp(state.cursorY + 72, 150, height - caughtBall.size / 2 - 14);
          caughtBall.vx = 0;
          caughtBall.vy = 0;
        }
      }

      frameCount += 1;
      if (frameCount >= 2) {
        frameCount = 0;
        setRenderState({
          balls: balls.map((ball) => ({ ...ball })),
          cursorX: state.cursorX,
          cursorY: state.cursorY,
          caughtIndex: state.caughtIndex,
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const releaseCaughtSkill = useCallback(() => {
    const caughtIndex = stateRef.current.caughtIndex;
    const caughtBall = caughtIndex === null ? null : ballsRef.current[caughtIndex];

    launchBall(caughtBall);

    stateRef.current.caughtIndex = null;
    setRenderState((current) => ({ ...current, caughtIndex: null }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      releaseCaughtSkill();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [releaseCaughtSkill]);

  const updatePointer = (event) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    stateRef.current.cursorX = event.clientX - rect.left;
    stateRef.current.cursorY = event.clientY - rect.top;
    if (!insideScene) setInsideScene(true);
  };

  const catchNearestSkill = (event) => {
    if (event.button !== 0) return;

    updatePointer(event);

    const nearestBall = findNearestSkillToUfo(
      ballsRef.current,
      stateRef.current.cursorX,
      stateRef.current.cursorY
    );

    if (!nearestBall) return;

    try {
      sceneRef.current?.setPointerCapture?.(event.pointerId);
    } catch {
      // The interaction still works in browsers that do not allow pointer capture here.
    }
    stateRef.current.caughtIndex = nearestBall.index;
    setRenderState((current) => ({ ...current, caughtIndex: nearestBall.index }));
  };

  const releasePointerCatch = (event) => {
    if (event?.type === "pointerup" && event.button !== 0) return;
    releaseCaughtSkill();

    if (event && sceneRef.current?.hasPointerCapture?.(event.pointerId)) {
      sceneRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const caughtBall =
    renderState.caughtIndex === null
      ? null
      : renderState.balls.find((ball) => ball.index === renderState.caughtIndex) || null;
  const detailBall = caughtBall;
  const selectedSkill = caughtBall?.skill || null;
  const dialogWidth = Math.min(352, Math.max(sceneSize.width - 32, 0));
  const detailDialogPosition = detailBall
    ? (() => {
        const gap = 18;
        const rightSide = detailBall.x + detailBall.size / 2 + gap;
        const leftSide = detailBall.x - detailBall.size / 2 - gap - dialogWidth;
        const shouldUseLeft = rightSide + dialogWidth > sceneSize.width - 16 && leftSide >= 16;

        return {
          left: shouldUseLeft
            ? leftSide
            : clamp(rightSide, 16, Math.max(16, sceneSize.width - dialogWidth - 16)),
          top: clamp(detailBall.y - 126, 16, Math.max(16, sceneSize.height - 332)),
        };
      })()
    : {};
  const modalAnimation = dialogMotion(section.dialogAnimation);

  return (
    <section
      id="skills-space"
      ref={sceneRef}
      className="relative isolate w-full min-h-[640px] overflow-hidden bg-[#070914] text-white"
      style={{ height: "100svh", cursor: "none" }}
      onPointerMove={updatePointer}
      onPointerEnter={() => setInsideScene(true)}
      onPointerLeave={() => {
        if (stateRef.current.caughtIndex === null) setInsideScene(false);
      }}
      onPointerDown={catchNearestSkill}
      onPointerUp={releasePointerCatch}
      onPointerCancel={releasePointerCatch}
      onLostPointerCapture={releasePointerCatch}
    >
      <ParticlesBackground color={secondaryColor} />
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 18% 20%, ${accentColor}26, transparent 35%), radial-gradient(circle at 82% 75%, ${secondaryColor}24, transparent 35%)`,
          }}
        />
        {section.showStars && <StarField />}
      </div>

      <header className="pointer-events-none absolute left-6 top-8 z-20 max-w-xl lg:left-10 lg:top-10">
        <div className="mb-3 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-gray-400">
          <span className="h-px w-10 bg-gray-700" />
          {section.eyebrow}
        </div>
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl">{section.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-400 sm:text-base">{section.description}</p>
        {section.interactionHint && (
          <p className="mt-3 text-xs font-medium uppercase tracking-wide" style={{ color: accentColor }}>
            {section.interactionHint}
          </p>
        )}
      </header>

      {renderState.balls.map((ball) => {
        const isCaught = ball.index === renderState.caughtIndex;
        const isPulsing = section.ballAnimation === "pulse" && !isCaught;

        return (
          <div
            key={`${ball.skill.name}-${ball.index}`}
            role="img"
            aria-label={ball.skill.name}
            className={`absolute z-10 grid place-items-center rounded-full border bg-black/30 p-2 backdrop-blur-sm transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isPulsing ? "animate-pulse" : ""
            }`}
            style={{
              left: ball.x,
              top: ball.y,
              width: ball.size,
              height: ball.size,
              transform: `translate(-50%, -50%) scale(${isCaught ? 1.1 : 1})`,
              borderColor: isCaught ? accentColor : `${secondaryColor}70`,
              boxShadow: isCaught
                ? `0 0 32px ${accentColor}80`
                : `0 0 22px ${secondaryColor}38`,
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <SkillIcon
              icon={ball.skill.icon}
              iconUrl={ball.skill.iconUrl}
              alt=""
              className="h-1/2 w-1/2 object-contain"
            />
          </div>
        );
      })}

      {insideScene && caughtBall && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: renderState.cursorX,
            top: renderState.cursorY + 14,
            width: 68,
            height: 108,
            transform: "translate(-50%, 0)",
            background: `linear-gradient(180deg, ${accentColor}78, transparent)`,
            clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
          }}
        />
      )}

      {insideScene && (
        <div
          className="pointer-events-none absolute z-30"
          style={{
            left: renderState.cursorX,
            top: renderState.cursorY,
            transform: "translate(-50%, -50%)",
          }}
        >
          <UfoIcon glowing={Boolean(caughtBall)} accentColor={accentColor} secondaryColor={secondaryColor} />
        </div>
      )}

      <AnimatePresence>
        {selectedSkill && detailBall && (
          <motion.aside
            role="dialog"
            aria-labelledby="skill-space-dialog-title"
            className="absolute z-40 w-80 max-w-[calc(100%-2rem)] cursor-auto overflow-y-auto rounded-lg border bg-[#0b0e1a] p-5 shadow-2xl sm:p-6"
            style={{ ...detailDialogPosition, borderColor: `${accentColor}7a`, maxHeight: "calc(100% - 2rem)" }}
            initial={modalAnimation.initial}
            animate={modalAnimation.animate}
            exit={modalAnimation.exit}
            transition={modalAnimation.transition || { duration: 0.25, ease: "easeOut" }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              {section.dialogEyebrow}
            </p>
            <div className="mt-4 flex min-w-0 items-center gap-4">
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border bg-black/25"
                style={{ borderColor: `${accentColor}75`, color: accentColor }}
              >
                <SkillIcon
                  icon={selectedSkill.icon}
                  iconUrl={selectedSkill.iconUrl}
                  alt={`${selectedSkill.name} icon`}
                  className="h-8 w-8 object-contain"
                />
              </span>
              <div className="min-w-0">
                <h3 id="skill-space-dialog-title" className="break-words text-2xl font-bold text-white">
                  {selectedSkill.name}
                </h3>
                {selectedSkill.category && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {selectedSkill.category}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-5 border-t border-white/10 pt-5">
              <div>
                <h4 className="text-sm font-semibold text-white">{section.dialogDescriptionLabel}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {selectedSkill.description || "Add a description for this skill from the Skill Space page in Admin."}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{section.dialogUsageLabel}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {selectedSkill.usage || section.emptyUsageText}
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}

function UfoIcon({ glowing, accentColor, secondaryColor }) {
  return (
    <svg
      width="84"
      height="48"
      viewBox="0 0 84 48"
      aria-hidden="true"
      style={{
        filter: glowing
          ? `drop-shadow(0 0 16px ${accentColor})`
          : `drop-shadow(0 0 8px ${secondaryColor})`,
      }}
    >
      <ellipse cx="42" cy="30" rx="40" ry="10" fill="#1a1f33" stroke={accentColor} strokeOpacity="0.5" />
      <ellipse cx="42" cy="30" rx="26" ry="5" fill="#0d101c" />
      <path d="M22 26 C22 10, 62 10, 62 26" fill="#2a3150" stroke={secondaryColor} strokeOpacity="0.6" />
      <circle cx="42" cy="16" r="9" fill="#0b0e1a" stroke={accentColor} strokeWidth="1.2" />
      <circle cx="20" cy="30" r="2.4" fill={accentColor} />
      <circle cx="42" cy="33" r="2.4" fill={secondaryColor} />
      <circle cx="64" cy="30" r="2.4" fill={accentColor} />
    </svg>
  );
}

function StarField() {
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      {stars.map((star, index) => (
        <circle
          key={index}
          cx={`${star.x}%`}
          cy={`${star.y}%`}
          r={star.radius}
          fill="#ffffff"
          opacity={star.opacity}
        />
      ))}
    </svg>
  );
}
