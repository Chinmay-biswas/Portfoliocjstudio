import { useEffect, useRef, useState } from "react";
import { LuSparkles } from "react-icons/lu";
import { portfolioDefaults } from "../data/portfolioDefaults";
import ParticlesBackground from "../components/ParticlesBackground";

const deviconMap = {
  Java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  React: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "React.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  TypeScript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  Tailwind: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  NodeJS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  Python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  "C#": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  MongoDB: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  UNITY: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg",
  Unity: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg",
  Canva: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg",
};

const categoryRules = [
  { title: "Languages", match: ["Java", "TypeScript", "Python", "C++", "C#"] },
  { title: "Frontend", match: ["React", "React.js", "Next.js", "Tailwind CSS", "Tailwind", "Canva"] },
  { title: "Backend & Data", match: ["NodeJS", "Node.js", "MongoDB", "Data Science", "AI", "AI & ML"] },
  { title: "Creative Tech", match: ["UNITY", "Unity"] },
];

function getCategory(skill) {
  const found = categoryRules.find((c) => c.match.includes(skill));
  return found ? found.title : "More Tools";
}

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const CATCH_RADIUS = 90;

export default function SkillsSpace({ content = portfolioDefaults }) {
  const skillNames = content.skills || portfolioDefaults.skills;

  const sceneRef = useRef(null);
  const rafRef = useRef(null);
  const ballsRef = useRef([]);

  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const [, forceTick] = useState(0);
  const [insideScene, setInsideScene] = useState(false);

  const stateRef = useRef({
    cursorX: 0,
    cursorY: 0,
    caughtIndex: null,
    insideScene: false,
  });

  // Place balls with velocity for free movement
  useEffect(() => {
    if (!sceneSize.width || !sceneSize.height) return;
    const rand = seededRandom(42);
    const placed = [];

    ballsRef.current = skillNames.map((name) => {
      const size = 64 + Math.floor(rand() * 18);
      const pad = size / 2 + 10;
      const minX = pad;
      const maxX = Math.max(sceneSize.width - pad, pad + 1);
      const minY = pad;
      const maxY = Math.max(sceneSize.height - pad, pad + 1);

      let x = minX + rand() * (maxX - minX);
      let y = minY + rand() * (maxY - minY);

      for (let attempt = 0; attempt < 24; attempt += 1) {
        const tooClose = placed.some((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          const minDist = p.size / 2 + size / 2 + 14;
          return Math.hypot(dx, dy) < minDist;
        });
        if (!tooClose) break;
        x = minX + rand() * (maxX - minX);
        y = minY + rand() * (maxY - minY);
      }

      placed.push({ x, y, size });

      // Give each ball a random velocity
      const speed = 0.4 + rand() * 0.7;
      const angle = rand() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      return {
        name,
        category: getCategory(name),
        x,
        y,
        vx,
        vy,
        size,
      };
    });
  }, [sceneSize, skillNames]);

  // Measure scene size, react to resize.
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSceneSize({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animation loop: move balls, wrap horizontally, bounce vertically
  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - lastTime, 32); // cap delta to avoid big jumps
      lastTime = now;

      const s = stateRef.current;
      const balls = ballsRef.current;
      const W = sceneRef.current?.clientWidth || 800;
      const H = sceneRef.current?.clientHeight || 560;

      balls.forEach((b, i) => {
        if (i === s.caughtIndex) return;

        // Move
        b.x += b.vx * dt * 0.5;
        b.y += b.vy * dt * 0.5;

        const r = b.size / 2;

        // Horizontal wrap: exit right → enter left, exit left → enter right
        if (b.x - r > W) {
          b.x = -r;
        } else if (b.x + r < 0) {
          b.x = W + r;
        }

        // Vertical bounce: reflect velocity at top/bottom
        if (b.y - r < 0) {
          b.y = r;
          b.vy = Math.abs(b.vy);
        } else if (b.y + r > H) {
          b.y = H - r;
          b.vy = -Math.abs(b.vy);
        }
      });

      // Soft collision so balls bounce apart instead of overlapping.
      const PADDING = 6;
      for (let i = 0; i < balls.length; i += 1) {
        if (i === s.caughtIndex) continue;
        for (let j = i + 1; j < balls.length; j += 1) {
          if (j === s.caughtIndex) continue;
          const a = balls[i];
          const b = balls[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const minDist = a.size / 2 + b.size / 2 + PADDING;
          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            const push = overlap * 0.5;
            a.x -= nx * push;
            a.y -= ny * push;
            b.x += nx * push;
            b.y += ny * push;

            // Exchange velocity components along normal (elastic-ish)
            const aDot = a.vx * nx + a.vy * ny;
            const bDot = b.vx * nx + b.vy * ny;
            a.vx += (bDot - aDot) * nx * 0.6;
            a.vy += (bDot - aDot) * ny * 0.6;
            b.vx += (aDot - bDot) * nx * 0.6;
            b.vy += (aDot - bDot) * ny * 0.6;
          }
        }
      }

      // Caught ball stays pinned right under the cursor.
      if (s.caughtIndex !== null) {
        const b = balls[s.caughtIndex];
        if (b) {
          b.x = s.cursorX;
          b.y = s.cursorY + 70;
          b.vx = 0;
          b.vy = 0;
        }
      }

      frame += 1;
      if (frame >= 2) {
        frame = 0;
        forceTick((n) => (n + 1) % 1000000);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const toLocal = (e) => {
      const rect = scene.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMove = (e) => {
      const { x, y } = toLocal(e);
      stateRef.current.cursorX = x;
      stateRef.current.cursorY = y;
      if (!stateRef.current.insideScene) {
        stateRef.current.insideScene = true;
        setInsideScene(true);
      }
    };

    const onEnter = () => {
      stateRef.current.insideScene = true;
      setInsideScene(true);
    };

    const onLeave = () => {
      stateRef.current.insideScene = false;
      setInsideScene(false);
      const s = stateRef.current;
      if (s.caughtIndex !== null) {
        const b = ballsRef.current[s.caughtIndex];
        if (b) {
          // Give a gentle random velocity when released
          const angle = Math.random() * Math.PI * 2;
          b.vx = Math.cos(angle) * 0.6;
          b.vy = Math.sin(angle) * 0.6;
        }
        s.caughtIndex = null;
      }
    };

    // Left-click to catch: find the nearest ball to the cursor
    const onMouseDown = (e) => {
      if (e.button !== 0) return; // left mouse button only
      e.preventDefault();
      const { x, y } = toLocal(e);
      const s = stateRef.current;

      let best = null;
      let bestDist = Infinity;
      ballsRef.current.forEach((b, i) => {
        const d = Math.hypot(b.x - x, b.y - y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });

      if (best !== null && bestDist <= CATCH_RADIUS) {
        s.caughtIndex = best;
      }
    };

    const onMouseUp = (e) => {
      if (e.button !== 0) return;
      const s = stateRef.current;
      if (s.caughtIndex !== null) {
        const b = ballsRef.current[s.caughtIndex];
        if (b) {
          // Give a gentle random velocity on release
          const angle = Math.random() * Math.PI * 2;
          b.vx = Math.cos(angle) * 0.6;
          b.vy = Math.sin(angle) * 0.6;
        }
        s.caughtIndex = null;
      }
    };

    scene.addEventListener("mousemove", onMove);
    scene.addEventListener("mouseenter", onEnter);
    scene.addEventListener("mouseleave", onLeave);
    scene.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      scene.removeEventListener("mousemove", onMove);
      scene.removeEventListener("mouseenter", onEnter);
      scene.removeEventListener("mouseleave", onLeave);
      scene.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const { caughtIndex, cursorX, cursorY } = stateRef.current;
  const caughtBall = caughtIndex !== null ? ballsRef.current[caughtIndex] : null;

  return (
    
    <section
    
    
      id="skills-space"
      ref={sceneRef}
      className="relative w-screen bg-[linear-gradient(180deg,#070914_0%,#0a0d1c_55%,#05060c_100%)] text-white select-none"
      style={{ height: "100vh", cursor: "none" }}
    >
      {/* Background gradients + stars */}
      <ParticlesBackground />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(29,205,159,0.12),transparent_35%),radial-gradient(circle_at_82%_75%,rgba(139,124,246,0.1),transparent_35%)]" />
        <StarField />
      </div>

      {/* Header overlay — sits top-left, pointer-events-none so it doesn't block ball clicks */}
      <div className="pointer-events-none absolute top-10 left-8 z-30 max-w-xl">
        <div className="mb-3 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-gray-400">
          <span className="h-px w-10 bg-gray-700" />
          Catch the Skill and check where i use that skill.
        </div>
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
          CHINMAY BISWAS
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-400 sm:text-base">
          Use Right click to catch.
        </p>
      </div>

      {/* Balls */}
      {ballsRef.current.map((b, i) => {
        const isCaught = i === caughtIndex;
        return (
          <div
            key={b.name}
            className="pointer-events-none absolute"
            style={{
              left: b.x,
              top: b.y,
              width: b.size,
              height: b.size,
              transform: `translate(-50%, -50%) scale(${isCaught ? 1.08 : 1})`,
              zIndex: isCaught ? 5 : 2,
            }}
          >
            <div
              className={`flex h-full w-full items-center justify-center rounded-full border backdrop-blur-sm ${
                isCaught
                  ? "border-[#1DCD9F]/80 bg-[#1DCD9F]/15 shadow-[0_0_30px_rgba(29,205,159,0.45)]"
                  : "border-white/15 bg-white/[0.06] shadow-[0_0_18px_rgba(139,124,246,0.12)]"
              }`}
            >
              {deviconMap[b.name] ? (
                <img
                  src={deviconMap[b.name]}
                  alt=""
                  className="h-1/2 w-1/2 object-contain"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <LuSparkles className="h-1/2 w-1/2 text-[#1DCD9F]" />
              )}
            </div>
          </div>
        );
      })}

      {/* Tractor beam, visible while holding a ball */}
      {insideScene && caughtIndex !== null && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: cursorX,
            top: cursorY + 16,
            width: 64,
            height: 100,
            transform: "translate(-50%, 0)",
            background: "linear-gradient(180deg, rgba(29,205,159,0.4), rgba(29,205,159,0))",
            clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
            zIndex: 4,
          }}
        />
      )}

      {/* Custom UFO cursor */}
      {insideScene && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: cursorX,
            top: cursorY,
            transform: "translate(-50%, -50%)",
          }}
        >
          <UfoIcon glowing={caughtIndex !== null} />
        </div>
      )}

      {/* Details card beside the cursor */}
      {caughtBall && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-xl border border-[#1DCD9F]/40 bg-[#0b0e1a]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur"
          style={{
            left: Math.min(cursorX + 90, sceneSize.width - 230),
            top: Math.max(cursorY - 40, 12),
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/30">
              {deviconMap[caughtBall.name] ? (
                <img
                  src={deviconMap[caughtBall.name]}
                  alt=""
                  className="h-6 w-6 object-contain"
                />
              ) : (
                <LuSparkles className="h-5 w-5 text-[#1DCD9F]" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{caughtBall.name}</p>
              <p className="text-[11px] uppercase tracking-wide text-[#1DCD9F]">
                {caughtBall.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function UfoIcon({ glowing }) {
  return (
    <svg
      width="84"
      height="48"
      viewBox="0 0 84 48"
      style={{
        filter: glowing
          ? "drop-shadow(0 0 16px rgba(29,205,159,0.65))"
          : "drop-shadow(0 0 8px rgba(139,124,246,0.35))",
      }}
    >
      <ellipse cx="42" cy="30" rx="40" ry="10" fill="#1a1f33" stroke="#1DCD9F" strokeOpacity="0.5" />
      <ellipse cx="42" cy="30" rx="26" ry="5" fill="#0d101c" />
      <path d="M22 26 C22 10, 62 10, 62 26" fill="#2a3150" stroke="#8b7cf6" strokeOpacity="0.6" />
      <circle cx="42" cy="16" r="9" fill="#0b0e1a" stroke="#1DCD9F" strokeWidth="1.2" />
      <circle cx="20" cy="30" r="2.4" fill="#1DCD9F" />
      <circle cx="42" cy="33" r="2.4" fill="#8b7cf6" />
      <circle cx="64" cy="30" r="2.4" fill="#1DCD9F" />
    </svg>
  );
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 70 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.4 + 0.3,
      o: Math.random() * 0.6 + 0.2,
    })),
  ).current;

  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="#ffffff"
          opacity={s.o}
        />
      ))}
    </svg>
  );
}
