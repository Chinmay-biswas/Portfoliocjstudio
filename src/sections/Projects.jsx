import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import photo1 from "../assets/photo1.JPG";
import photo2 from "../assets/photo2.PNG";
import photo4 from "../assets/photo4.jpeg";
import photo5 from "../assets/photo5.png";
import img1 from "../assets/img1.JPG";
import img2 from "../assets/img2.JPG";
import ParticleNetwork from "../components/ParticleNetwork";
import { getPortfolioList, getProjectPresentationTiming, portfolioDefaults } from "../data/portfolioDefaults";

const desktopImages = [img1, img2, photo5];
const mobileImages = [photo1, photo2, photo4];
const projectPresentations = new Set(["cinematic", "split", "deck", "carousel", "poster", "editorial"]);
let youTubeApiPromise;

const useIsMobile = (query = "(max-width:639px)") => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return isMobile;
};

function getYouTubeVideoId(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") return pathParts[0] || "";

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (pathParts[0] === "watch") return parsedUrl.searchParams.get("v") || "";
      if (["embed", "shorts", "live"].includes(pathParts[0])) return pathParts[1] || "";
    }
  } catch {
    return "";
  }

  return "";
}

function videoSource(url) {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&vq=hd1080`;
  }

  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}playsinline=1&rel=0&vq=hd1080`;
}

function playerStateName(state) {
  switch (Number(state)) {
    case 0:
      return "ended";
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    default:
      return "unstarted";
  }
}

function fillYouTubePlayer(player) {
  const iframe = player?.getIframe?.();
  if (!iframe) return;

  iframe.style.display = "block";
  iframe.style.width = "100%";
  iframe.style.height = "100%";

  if (iframe.parentElement) {
    iframe.parentElement.style.width = "100%";
    iframe.parentElement.style.height = "100%";
  }
}

// Load YouTube's documented player API once so the visible and ambient players stay in step.
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("YouTube is only available in the browser"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youTubeApiPromise) return youTubeApiPromise;

  youTubeApiPromise = new Promise((resolve, reject) => {
    const scriptId = "portfolio-youtube-iframe-api";
    const existingScript = document.getElementById(scriptId);
    const previousReadyHandler = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      resolve(window.YT);
    };

    if (existingScript) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      youTubeApiPromise = undefined;
      reject(new Error("Could not load YouTube player"));
    };
    document.head.appendChild(script);
  });

  return youTubeApiPromise;
}

function YouTubeProjectMedia({ project, className = "", onPlaybackChange }) {
  const videoId = getYouTubeVideoId(project.video);
  const playerHostRef = useRef(null);
  const callbackRef = useRef(onPlaybackChange);

  useEffect(() => {
    callbackRef.current = onPlaybackChange;
  }, [onPlaybackChange]);

  useEffect(() => {
    const playerHost = playerHostRef.current;
    if (!videoId || !playerHost) return undefined;

    let isDisposed = false;
    let player;
    let playerState = "unstarted";
    let timePollId;
    const stopTimePolling = () => {
      if (timePollId) window.clearInterval(timePollId);
      timePollId = undefined;
    };
    const reportPlayback = (target) => {
      callbackRef.current?.({
        videoId,
        state: playerState,
        time: target.getCurrentTime(),
      });
    };
    const startTimePolling = (target) => {
      stopTimePolling();
      reportPlayback(target);
      timePollId = window.setInterval(() => reportPlayback(target), 800);
    };

    loadYouTubeApi()
      .then((YT) => {
        if (isDisposed || !playerHost.isConnected) return;

        // The YouTube API replaces this node with an iframe, so keep it outside React's tree.
        const playerMount = document.createElement("div");
        playerHost.replaceChildren(playerMount);

        player = new YT.Player(playerMount, {
          videoId,
          playerVars: {
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
            vq: "hd1080",
          },
          events: {
            onReady: (event) => {
              fillYouTubePlayer(event.target);
              reportPlayback(event.target);
            },
            onStateChange: (event) => {
              playerState = playerStateName(event.data);

              if (playerState === "playing" || playerState === "buffering") {
                startTimePolling(event.target);
              } else {
                stopTimePolling();
                reportPlayback(event.target);
              }
            },
            onError: stopTimePolling,
          },
        });
      })
      .catch(() => {});

    return () => {
      isDisposed = true;
      stopTimePolling();
      player?.destroy();
      playerHost.replaceChildren();
    };
  }, [videoId]);

  return (
    <div
      ref={playerHostRef}
      aria-label={project.title}
      className={`absolute inset-0 z-10 min-h-0 overflow-hidden [&>div]:h-full [&>div]:w-full [&_iframe]:!block [&_iframe]:!h-full [&_iframe]:!w-full ${className}`}
    />
  );
}

function YouTubeAmbientVideo({ videoId, playback, isPlaying }) {
  const playerHostRef = useRef(null);
  const playerRef = useRef(null);
  const playbackRef = useRef(playback);
  const lastSyncedTimeRef = useRef({ videoId: "", time: -1 });

  const syncPlayer = useCallback((player) => {
    const currentPlayback = playbackRef.current;
    const isPlaying = currentPlayback.videoId === videoId
      && (currentPlayback.state === "playing" || currentPlayback.state === "buffering");

    player.mute();

    if (!isPlaying) {
      player.pauseVideo();
      return;
    }

    if (
      lastSyncedTimeRef.current.videoId !== videoId
      || Math.abs(lastSyncedTimeRef.current.time - currentPlayback.time) >= 2
    ) {
      player.seekTo(currentPlayback.time, true);
      lastSyncedTimeRef.current = { videoId, time: currentPlayback.time };
    }

    player.playVideo();
  }, [videoId]);

  useEffect(() => {
    playbackRef.current = playback;
    if (playerRef.current) syncPlayer(playerRef.current);
  }, [playback, syncPlayer]);

  useEffect(() => {
    const playerHost = playerHostRef.current;
    if (!playerHost) return undefined;

    let isDisposed = false;
    let player;

    loadYouTubeApi()
      .then((YT) => {
        if (isDisposed || !playerHost.isConnected) return;

        // The YouTube API owns this inner mount and can safely replace it with its iframe.
        const playerMount = document.createElement("div");
        playerHost.replaceChildren(playerMount);

        player = new YT.Player(playerMount, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            loop: 1,
            modestbranding: 1,
            mute: 1,
            origin: window.location.origin,
            playlist: videoId,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              fillYouTubePlayer(event.target);
              playerRef.current = event.target;
              syncPlayer(event.target);
            },
          },
        });
      })
      .catch(() => {});

    return () => {
      isDisposed = true;
      playerRef.current = null;
      player?.destroy();
      playerHost.replaceChildren();
    };
  }, [syncPlayer, videoId]);

  return (
    <div
      ref={playerHostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-[18%] h-[136%] w-[136%] max-w-none overflow-hidden blur-3xl saturate-150 transition-opacity duration-700 [&>div]:h-full [&>div]:w-full [&_iframe]:!block [&_iframe]:!h-full [&_iframe]:!w-full ${
        isPlaying ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

function ProjectAmbientBackdrop({ project, playback }) {
  const videoId = getYouTubeVideoId(project.video);
  const isPlaying = playback.videoId === videoId
    && (playback.state === "playing" || playback.state === "buffering");
  const source = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : project.image || "";

  return (
    <AnimatePresence initial={false} mode="sync">
      {source && (
        <motion.div
          key={source}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`absolute -inset-12 scale-110 bg-cover bg-center blur-3xl saturate-150 transition-opacity duration-700 ${
              isPlaying ? "opacity-25" : "opacity-85"
            }`}
            style={{ backgroundImage: `url(${source})` }}
          />
          {videoId && (
            <YouTubeAmbientVideo
              videoId={videoId}
              playback={playback}
              isPlaying={isPlaying}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectMedia({ project, className = "", eager = false, onVideoPlaybackChange }) {
  if (project.video && getYouTubeVideoId(project.video)) {
    return (
      <YouTubeProjectMedia
        key={project.title}
        project={project}
        className={className}
        onPlaybackChange={onVideoPlaybackChange}
      />
    );
  }

  if (project.video) {
    return (
      <iframe
        key={project.title}
        src={videoSource(project.video)}
        title={project.title}
        className={`absolute inset-0 z-10 h-full w-full ${className}`}
        style={{ border: "none", borderRadius: "inherit" }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <img
      key={project.title}
      src={project.image}
      alt={project.title}
      className={`relative z-10 h-full w-full object-cover ${className}`}
      style={{ filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.65))" }}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

function ProjectActions({ project, section, compact = false }) {
  const spacing = compact ? "gap-3 px-5 py-3" : "gap-4 px-5 py-2.5";

  return (
    <div className={`flex justify-center ${spacing}`}>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-white px-5 py-2.5 font-semibold text-black transition hover:scale-95 hover:bg-gray-200"
      >
        {section.projectButtonLabel}
      </a>
      <a
        href={project.gitlink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg border-2 border-white bg-transparent px-5 py-2.5 font-semibold text-white transition hover:scale-95 hover:bg-white hover:text-black"
      >
        {section.contactButtonLabel}
      </a>
    </div>
  );
}

function projectTransitionSeconds(value) {
  const duration = Number(value);
  const safeDuration = Number.isFinite(duration) ? duration : 550;
  return Math.min(Math.max(safeDuration, 250), 1600) / 1000;
}

function projectIndexLabel(index, count) {
  return `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
}

function circularProjectDistance(index, activeIndex, count) {
  let distance = index - activeIndex;

  if (count > 2) {
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
  }

  return distance;
}

const showcaseMediaMotion = {
  split: {
    initial: { opacity: 0, x: 72, clipPath: "inset(0 0 0 100%)" },
    animate: { opacity: 1, x: 0, clipPath: "inset(0 0 0 0)" },
    exit: { opacity: 0, x: -36, clipPath: "inset(0 100% 0 0)" },
  },
  deck: {
    initial: { opacity: 0, y: 88, rotate: -5, scale: 0.9 },
    animate: { opacity: 1, y: 0, rotate: 0, scale: 1 },
    exit: { opacity: 0, y: -42, rotate: 4, scale: 1.03 },
  },
  carousel: {
    initial: { opacity: 0, scale: 0.84, rotateY: 28 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.92, rotateY: -26 },
  },
  poster: {
    initial: { opacity: 0, scale: 1.12 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  editorial: {
    initial: { opacity: 0, y: 36, rotate: 2.5, clipPath: "inset(100% 0 0 0)" },
    animate: { opacity: 1, y: 0, rotate: 0, clipPath: "inset(0 0 0 0)" },
    exit: { opacity: 0, y: -24, rotate: -2, clipPath: "inset(0 0 100% 0)" },
  },
};

function ProjectNavigator({ projects, activeIndex, onSelect, className = "" }) {
  if (projects.length < 2) return null;

  return (
    <nav aria-label="Choose a project" className={`flex flex-wrap items-center gap-2 ${className}`}>
      {projects.map((project, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={`${project.title}-navigator-${index}`}
            type="button"
            title={project.title}
            aria-label={`Show ${project.title}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelect(index)}
            className={`grid h-8 min-w-8 place-items-center rounded-md border px-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
              isActive
                ? "border-[#9b4de0] bg-[#9b4de0] text-white"
                : "border-white/15 bg-black/25 text-white/60 hover:border-white/45 hover:text-white"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        );
      })}
    </nav>
  );
}

function ShowcaseProjectMedia({ project, presentation, duration, onVideoPlaybackChange, className = "" }) {
  const motionState = showcaseMediaMotion[presentation] || showcaseMediaMotion.split;
  const hasPositioningClass = /(^|\s)(absolute|fixed|relative|sticky)(\s|$)/.test(className);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${presentation}-${project.title}`}
        initial={motionState.initial}
        animate={motionState.animate}
        exit={motionState.exit}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        className={`${hasPositioningClass ? "" : "relative"} overflow-hidden bg-black/25 shadow-2xl shadow-black/50 ${className}`}
      >
        <ProjectMedia project={project} eager onVideoPlaybackChange={onVideoPlaybackChange} />
        <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),transparent_42%,rgba(0,0,0,0.32))]" />
      </motion.div>
    </AnimatePresence>
  );
}

function SplitProjectShowcase({ projects, activeProject, activeProjectIndex, section, duration, onSelect, onVideoPlaybackChange }) {
  return (
    <div className="flex h-full w-full items-center px-5 py-6 sm:px-8 lg:px-14">
      <div className="grid h-full w-full max-w-[1500px] items-center gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
        <div className="order-2 flex min-w-0 flex-col justify-center lg:order-1">
          <p className="text-xs font-semibold uppercase text-[#c89aee]">Project {projectIndexLabel(activeProjectIndex, projects.length)}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={activeProject.title}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 text-3xl font-semibold text-white sm:text-5xl lg:text-6xl"
            >
              {activeProject.title}
            </motion.h3>
          </AnimatePresence>
          <motion.p
            key={activeProject.about}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay: Math.min(duration * 0.22, 0.16) }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-white/78 sm:text-base"
          >
            {activeProject.about}
          </motion.p>
          <div className="mt-4 self-start"><ProjectActions project={activeProject} section={section} compact /></div>
          <ProjectNavigator projects={projects} activeIndex={activeProjectIndex} onSelect={onSelect} className="mt-4" />
        </div>

        <div className="relative order-1 h-[46vh] min-h-[17rem] lg:order-2 lg:h-[68vh]">
          <p className="absolute right-0 top-0 z-30 text-sm font-semibold text-white/78 sm:text-lg">{section.title}</p>
          <ShowcaseProjectMedia
            project={activeProject}
            presentation="split"
            duration={duration}
            onVideoPlaybackChange={onVideoPlaybackChange}
            className="absolute inset-x-0 bottom-0 top-8 rounded-xl border border-white/15"
          />
        </div>
      </div>
    </div>
  );
}

function DeckProjectShowcase({ projects, activeProject, activeProjectIndex, section, duration, onSelect, onVideoPlaybackChange }) {
  const [visibleProjectIndex, setVisibleProjectIndex] = useState(activeProjectIndex);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const targetProjectIndexRef = useRef(activeProjectIndex);

  useEffect(() => {
    targetProjectIndexRef.current = activeProjectIndex;
  }, [activeProjectIndex]);

  const isExiting = transitionPhase === "idle" && activeProjectIndex !== visibleProjectIndex;
  const visibleProject = projects[visibleProjectIndex] || activeProject;
  const stackProjects = Array.from(
    { length: Math.min(2, Math.max(projects.length - 1, 0)) },
    (_, index) => projects[(visibleProjectIndex - index - 1 + projects.length) % projects.length]
  );

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-5 py-6 sm:px-8">
      <div className="relative h-[56vh] min-h-[20rem] w-full max-w-4xl sm:h-[64vh]">
        {stackProjects.map((project, index) => {
          const depth = stackProjects.length - index;

          return (
            <div
              key={`${project.title}-stack-${depth}`}
              className="absolute inset-x-4 top-0 h-full overflow-hidden rounded-xl border border-white/10 bg-black/50"
              style={{ transform: `translateY(${-14 * depth}px) scale(${1 - depth * 0.045})`, opacity: 0.35 + depth * 0.12 }}
            >
              <img src={project.image} alt="" className="h-full w-full object-cover opacity-55" loading="lazy" />
            </div>
          );
        })}
        <AnimatePresence
          initial={false}
          mode="wait"
          onExitComplete={() => {
            if (!isExiting) return;

            setVisibleProjectIndex(targetProjectIndexRef.current);
            setTransitionPhase("entering");
          }}
        >
          {!isExiting && (
            <motion.div
              key={`deck-${visibleProject.title}`}
              initial={showcaseMediaMotion.deck.initial}
              animate={showcaseMediaMotion.deck.animate}
              exit={showcaseMediaMotion.deck.exit}
              onAnimationComplete={() => {
                if (transitionPhase === "entering") setTransitionPhase("idle");
              }}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-10 overflow-hidden rounded-xl border border-white/20 bg-black/25 shadow-2xl shadow-black/50"
            >
              <ProjectMedia project={visibleProject} eager onVideoPlaybackChange={onVideoPlaybackChange} />
              <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),transparent_42%,rgba(0,0,0,0.32))]" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="pointer-events-none absolute left-5 top-5 z-30 text-xs font-semibold uppercase text-white/75">{projectIndexLabel(visibleProjectIndex, projects.length)}</span>
      </div>
      <div className="mt-5 flex w-full max-w-4xl flex-col items-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={visibleProject.title}
            initial={{ opacity: 0, y: 20, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -16, rotate: -1.5 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl font-semibold text-white sm:text-4xl"
          >
            {visibleProject.title}
          </motion.h3>
        </AnimatePresence>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/72">{visibleProject.about}</p>
        <ProjectActions project={visibleProject} section={section} compact />
        <ProjectNavigator projects={projects} activeIndex={visibleProjectIndex} onSelect={onSelect} className="mt-2" />
      </div>
    </div>
  );
}

function CarouselProjectShowcase({ projects, activeProject, activeProjectIndex, section, duration, isMobile, onSelect, onVideoPlaybackChange }) {
  const cardOffset = isMobile ? 112 : 270;

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-8">
      <p className="absolute top-6 z-30 text-xs font-semibold uppercase text-[#d3a9f3] sm:top-8">{section.title}</p>
      <div className="relative h-[50vh] min-h-[18rem] w-full max-w-6xl [perspective:1400px] sm:h-[58vh]">
        {projects.map((project, index) => {
          const distance = circularProjectDistance(index, activeProjectIndex, projects.length);
          const isActive = distance === 0;
          const isVisible = Math.abs(distance) <= 2;

          if (!isVisible) return null;

          return (
            <div
              key={`${project.title}-carousel-${index}`}
              className="absolute left-1/2 top-1/2 h-full w-[78vw] max-w-[760px] -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 30 - Math.abs(distance) }}
            >
              <motion.div
                className="h-full w-full overflow-hidden rounded-xl border border-white/15 bg-black/35 shadow-2xl shadow-black/60"
                initial={false}
                animate={{
                  x: distance * cardOffset,
                  scale: isActive ? 1 : 0.78,
                  rotateY: -distance * 16,
                  opacity: isActive ? 1 : 0.58,
                }}
                transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              >
                {isActive ? (
                  <ShowcaseProjectMedia
                    project={project}
                    presentation="carousel"
                    duration={duration}
                    onVideoPlaybackChange={onVideoPlaybackChange}
                    className="h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-label={`Show ${project.title}`}
                    className="relative h-full w-full text-left"
                  >
                    <img src={project.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute inset-0 bg-black/45" />
                    <span className="absolute bottom-4 left-4 right-4 truncate text-sm font-semibold text-white/90">{project.title}</span>
                  </button>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="relative z-30 mt-5 flex max-w-3xl flex-col items-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.h3
            key={activeProject.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="text-2xl font-semibold text-white sm:text-4xl"
          >
            {activeProject.title}
          </motion.h3>
        </AnimatePresence>
        <p className="mt-2 text-sm leading-relaxed text-white/72">{activeProject.about}</p>
        <ProjectActions project={activeProject} section={section} compact />
        <ProjectNavigator projects={projects} activeIndex={activeProjectIndex} onSelect={onSelect} className="mt-2" />
      </div>
    </div>
  );
}

function PosterProjectShowcase({ projects, activeProject, activeProjectIndex, section, duration, onSelect, onVideoPlaybackChange }) {
  return (
    <div className="relative h-full w-full overflow-hidden px-4 py-4 sm:px-7 sm:py-7">
      <ShowcaseProjectMedia
        project={activeProject}
        presentation="poster"
        duration={duration}
        onVideoPlaybackChange={onVideoPlaybackChange}
        className="absolute inset-4 rounded-xl border border-white/15 sm:inset-7"
      />
      <div className="pointer-events-none absolute inset-4 z-20 rounded-xl bg-[linear-gradient(90deg,rgba(0,0,0,0.82),rgba(0,0,0,0.28)_58%,rgba(0,0,0,0.18)),linear-gradient(0deg,rgba(0,0,0,0.8),transparent_48%)] sm:inset-7" />
      <div className="pointer-events-none relative z-30 flex h-full flex-col justify-between px-5 py-5 sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase text-[#e2c6ff]">{section.title}</p>
          <div className="pointer-events-auto">
            <ProjectNavigator projects={projects} activeIndex={activeProjectIndex} onSelect={onSelect} />
          </div>
        </div>
        <div className="max-w-2xl pb-4">
          <p className="text-sm font-semibold text-[#e2c6ff]">{projectIndexLabel(activeProjectIndex, projects.length)}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={activeProject.title}
              initial={{ opacity: 0, y: 34, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 1.03 }}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 text-4xl font-semibold text-white sm:text-6xl lg:text-7xl"
            >
              {activeProject.title}
            </motion.h3>
          </AnimatePresence>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/78 sm:text-base">{activeProject.about}</p>
          <div className="pointer-events-auto mt-3 self-start"><ProjectActions project={activeProject} section={section} compact /></div>
        </div>
      </div>
    </div>
  );
}

function EditorialProjectShowcase({ projects, activeProject, activeProjectIndex, section, duration, onSelect, onVideoPlaybackChange }) {
  return (
    <div className="flex h-full w-full items-center px-5 py-6 sm:px-8 lg:px-14">
      <div className="grid h-full w-full max-w-[1500px] items-center gap-7 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div className="order-2 relative flex min-w-0 flex-col justify-center lg:order-1">
          <span className="pointer-events-none absolute -left-2 -top-20 text-[7rem] font-semibold leading-none text-white/[0.055] sm:text-[10rem]" aria-hidden="true">
            {String(activeProjectIndex + 1).padStart(2, "0")}
          </span>
          <p className="relative text-xs font-semibold uppercase text-[#d6afea]">Selected work</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={activeProject.title}
              initial={{ opacity: 0, y: 26, clipPath: "inset(100% 0 0 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" }}
              exit={{ opacity: 0, y: -18, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-4 text-4xl font-semibold leading-tight text-white sm:text-6xl"
            >
              {activeProject.title}
            </motion.h3>
          </AnimatePresence>
          <p className="relative mt-5 max-w-xl border-l-2 border-[#a95adf] pl-4 text-sm leading-relaxed text-white/75 sm:text-base">{activeProject.about}</p>
          <div className="relative mt-4 self-start"><ProjectActions project={activeProject} section={section} compact /></div>
          <ProjectNavigator projects={projects} activeIndex={activeProjectIndex} onSelect={onSelect} className="relative mt-4" />
        </div>
        <div className="relative order-1 h-[46vh] min-h-[18rem] lg:order-2 lg:h-[68vh]">
          <p className="absolute left-0 top-0 z-30 text-sm font-semibold text-white/75">{section.title}</p>
          <ShowcaseProjectMedia
            project={activeProject}
            presentation="editorial"
            duration={duration}
            onVideoPlaybackChange={onVideoPlaybackChange}
            className="absolute inset-x-0 bottom-0 top-8 rounded-lg border border-white/20"
          />
        </div>
      </div>
    </div>
  );
}

function ProjectShowcase({ presentation, ...props }) {
  if (presentation === "split") return <SplitProjectShowcase {...props} />;
  if (presentation === "deck") return <DeckProjectShowcase {...props} />;
  if (presentation === "carousel") return <CarouselProjectShowcase {...props} />;
  if (presentation === "poster") return <PosterProjectShowcase {...props} />;
  if (presentation === "editorial") return <EditorialProjectShowcase {...props} />;

  return null;
}

export default function Projects({ content = portfolioDefaults }) {
  const isMobile = useIsMobile();
  const sceneRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRailOpen, setIsRailOpen] = useState(true);
  const [videoPlayback, setVideoPlayback] = useState({ videoId: "", state: "paused", time: 0 });
  const sourceProjects = getPortfolioList(content, "projects");
  const section = { ...portfolioDefaults.projectsSection, ...(content.projectsSection || {}) };
  const presentation = projectPresentations.has(section.presentation)
    ? section.presentation
    : "cinematic";
  const presentationTiming = getProjectPresentationTiming(section);
  const transitionDuration = projectTransitionSeconds(presentationTiming.duration);

  const projects = useMemo(
    () => sourceProjects.map((project, index) => ({
      ...portfolioDefaults.projects[index % portfolioDefaults.projects.length],
      ...project,
      image: project.image || (isMobile
        ? mobileImages[index % mobileImages.length]
        : desktopImages[index % desktopImages.length]),
    })),
    [sourceProjects, isMobile]
  );

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextIndex = Math.min(
      Math.floor(value * projects.length),
      Math.max(projects.length - 1, 0)
    );

    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const activeProjectIndex = Math.min(activeIndex, Math.max(projects.length - 1, 0));
  const activeProject = projects[activeProjectIndex] || projects[0];
  const activeVideoId = getYouTubeVideoId(activeProject?.video);
  const activeVideoPlayback = videoPlayback.videoId === activeVideoId
    ? videoPlayback
    : { videoId: activeVideoId, state: "paused", time: 0 };

  const handleVideoPlaybackChange = useCallback((nextPlayback) => {
    setVideoPlayback((current) => {
      if (nextPlayback.videoId !== activeVideoId) return current;

      const hasMeaningfulTimeChange = Math.abs(current.time - nextPlayback.time) >= 2;
      if (current.state === nextPlayback.state && !hasMeaningfulTimeChange) return current;

      return nextPlayback;
    });
  }, [activeVideoId]);

  const jumpToProject = (index) => {
    const node = sceneRef.current;
    if (!node || projects.length === 0) return;

    const rect = node.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableHeight = Math.max(node.offsetHeight - window.innerHeight, 0);
    const targetProgress = (index + 0.5) / projects.length;

    window.scrollTo({
      top: sectionTop + scrollableHeight * targetProgress,
      behavior: "smooth",
    });
  };

  if (!activeProject) return null;

  return (
    <section
      id="projects"
      ref={sceneRef}
      className="relative text-white"
      style={{
        height: `${100 * projects.length}vh`,
        backgroundColor: activeProject.bgColor || "#000000",
        transition: "background-color 400ms ease",
      }}
    >
      <div className="sticky top-0 z-10 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-0">
          <ProjectAmbientBackdrop project={activeProject} playback={activeVideoPlayback} />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] opacity-55">
          <ParticleNetwork color="#000000" opacity={0.5} />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_30%,rgba(29,205,159,0.18),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.78))]" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center">
          {presentation === "cinematic" ? (
            isMobile ? (
          <>
            <h2 className="z-10 mt-4 w-full bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-center text-3xl font-semibold text-transparent">
              {section.title}
            </h2>

            <div className="relative -mt-4 flex w-full flex-1 items-center justify-center">
              {projects.map((project, index) => (
                <div
                  key={`${project.title}-${index}`}
                  className={`absolute left-1/2 top-1/2 w-[85%] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                    activeProjectIndex === index ? "z-20 opacity-100" : "z-0 opacity-0"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {activeProjectIndex === index && (
                      <motion.h3
                        key={project.title}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        transition={{ duration: transitionDuration, ease: "easeOut" }}
                        className="-mt-24 block bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-center text-[clamp(2rem,6vw,5rem)] font-semibold italic text-transparent"
                      >
                        {project.title}
                      </motion.h3>
                    )}
                  </AnimatePresence>

                  <div className="relative mb-6 h-[62vh] w-full overflow-hidden rounded-lg bg-black/20 shadow-2xl">
                    <ProjectMedia
                      project={project}
                      eager
                      onVideoPlaybackChange={activeProjectIndex === index ? handleVideoPlaybackChange : undefined}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 z-20"
                      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 40%)" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-[4.5rem] left-1/2 z-30 -translate-x-1/2">
              <ProjectActions project={activeProject} section={section} compact />
            </div>
            <motion.p
              key={activeProject.about}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: transitionDuration }}
              className="absolute bottom-3 z-30 max-w-2xl px-6 text-center text-sm leading-relaxed text-white/90"
            >
              {activeProject.about}
            </motion.p>
          </>
        ) : (
          <div className="relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center px-8 pt-6 lg:px-14">
            <div className="relative flex w-full items-baseline justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={activeProject.title}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: transitionDuration, ease: "easeOut" }}
                  className="mt-3 bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-[clamp(1.5rem,5vw,2.6rem)] font-semibold italic text-transparent"
                >
                  {activeProject.title}
                </motion.h3>
              </AnimatePresence>

              <h2 className="whitespace-nowrap bg-gradient-to-r from-[#6B27B0] via-[#9b4de0] to-[#6B27B0] bg-clip-text text-3xl font-semibold text-transparent">
                {section.title}
              </h2>
            </div>

            <div className="relative mt-4 flex h-[62vh] w-full items-stretch justify-center gap-6 lg:gap-8">
              <motion.div
                layout
                transition={{ duration: Math.min(transitionDuration, 0.65), ease: "easeInOut" }}
                className="relative min-w-0"
                style={{ flex: isRailOpen ? "1 1 70%" : "1 1 100%" }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-black/20 shadow-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.7)]">
                  <ProjectMedia project={activeProject} eager onVideoPlaybackChange={handleVideoPlaybackChange} />
                  <div
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.28) 100%)" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsRailOpen((isOpen) => !isOpen)}
                  aria-label={isRailOpen ? "Hide project list" : "Show project list"}
                  className="absolute -right-4 top-[45%] z-40 flex h-12 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] transition-colors hover:bg-white/15"
                >
                  <motion.span
                    animate={{ rotate: isRailOpen ? 0 : 180 }}
                    transition={{ duration: Math.min(transitionDuration, 0.45) }}
                    className="text-white/70"
                  >
                    <LuChevronRight className="h-4 w-4" aria-hidden="true" />
                  </motion.span>
                </button>
              </motion.div>

              <AnimatePresence initial={false}>
                {isRailOpen && (
                  <motion.div
                    key="project-rail"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: Math.min(transitionDuration, 0.55), ease: "easeInOut" }}
                    style={{ flex: "0 0 30%" }}
                    className="relative min-w-0 max-w-[260px]"
                  >
                    <div className="relative h-full overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
                      <div className="flex flex-col gap-3">
                        {projects.map((project, index) => {
                          const isActive = activeProjectIndex === index;

                          return (
                            <button
                              key={`${project.title}-${index}`}
                              type="button"
                              onClick={() => jumpToProject(index)}
                              className={`group relative w-full overflow-hidden rounded-lg border text-left transition-all duration-300 ${
                                isActive
                                  ? "border-[#9b4de0]/70 bg-[#6B27B0]/15 shadow-[0_0_0_1px_rgba(155,77,224,0.4)]"
                                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                              }`}
                            >
                              <div className="relative h-20 w-full overflow-hidden bg-black/40">
                                <img
                                  src={project.image}
                                  alt=""
                                  className={`h-full w-full object-cover transition-transform duration-300 ${
                                    isActive ? "scale-105" : "group-hover:scale-105"
                                  }`}
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                <p className={`absolute bottom-1.5 left-2 right-2 truncate text-xs font-semibold italic transition-colors ${
                                  isActive ? "text-white" : "text-white/75 group-hover:text-white"
                                }`}>
                                  {project.title}
                                </p>
                                {isActive && (
                                  <motion.span
                                    layoutId="active-project-dot"
                                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#9b4de0]"
                                  />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative z-30 mt-2">
              <ProjectActions project={activeProject} section={section} />
            </div>

            <motion.p
              key={activeProject.about}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: transitionDuration }}
              className="mx-auto mb-4 mt-2 w-full max-w-xl text-center text-sm leading-relaxed text-white/90 sm:text-base"
            >
              {activeProject.about}
            </motion.p>
          </div>
            )
          ) : (
            <ProjectShowcase
              presentation={presentation}
              projects={projects}
              activeProject={activeProject}
              activeProjectIndex={activeProjectIndex}
              section={section}
              duration={transitionDuration}
              isMobile={isMobile}
              onSelect={jumpToProject}
              onVideoPlaybackChange={handleVideoPlaybackChange}
            />
          )}
        </div>
      </div>
    </section>
  );
}
