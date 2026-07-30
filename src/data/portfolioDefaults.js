const baseSkillItems = [
  {
    name: "Java",
    category: "Languages",
    icon: "java",
    iconUrl: "",
    description: "Object-oriented programming for reliable application logic.",
    usage: "Used for data structures, algorithms, and core programming practice.",
  },
  {
    name: "React",
    category: "Frontend",
    icon: "react",
    iconUrl: "",
    description: "Component-driven interfaces with responsive, interactive states.",
    usage: "Used to build this portfolio and modern web application interfaces.",
  },
  {
    name: "Next.js",
    category: "Frontend",
    icon: "nextjs",
    iconUrl: "",
    description: "React framework for production-ready web experiences.",
    usage: "Used for full-stack React projects and server-rendered web pages.",
  },
  {
    name: "TypeScript",
    category: "Languages",
    icon: "typescript",
    iconUrl: "",
    description: "Typed JavaScript for safer, easier-to-maintain applications.",
    usage: "Used to make larger frontend and backend projects more reliable.",
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    icon: "tailwind",
    iconUrl: "",
    description: "Utility-first styling for polished responsive interfaces.",
    usage: "Used to create responsive layouts, animations, and visual systems.",
  },
  {
    name: "Node.js",
    category: "Backend & Data",
    icon: "nodejs",
    iconUrl: "",
    description: "JavaScript runtime for APIs, services, and application logic.",
    usage: "Used to create backend APIs and full-stack MERN applications.",
  },
  {
    name: "Python",
    category: "Languages",
    icon: "python",
    iconUrl: "",
    description: "Versatile programming for automation, data, and AI work.",
    usage: "Used for machine learning experiments, automation, and problem solving.",
  },
  {
    name: "AI & ML",
    category: "Backend & Data",
    icon: "brain",
    iconUrl: "",
    description: "Applied machine learning and intelligent product experiments.",
    usage: "Used for suggestion systems and data-driven application features.",
  },
  {
    name: "C#",
    category: "Languages",
    icon: "csharp",
    iconUrl: "",
    description: "Modern object-oriented language for software and games.",
    usage: "Used for Unity gameplay systems and application programming.",
  },
  {
    name: "MongoDB",
    category: "Backend & Data",
    icon: "mongodb",
    iconUrl: "",
    description: "Document database for flexible application data.",
    usage: "Used in MERN applications for user, content, and product data.",
  },
  {
    name: "C++",
    category: "Languages",
    icon: "cplusplus",
    iconUrl: "",
    description: "Performance-focused programming and algorithm practice.",
    usage: "Used for DSA, competitive programming, and core CS learning.",
  },
  {
    name: "Unity",
    category: "Creative Tech",
    icon: "unity",
    iconUrl: "",
    description: "Game engine for building interactive 2D and 3D experiences.",
    usage: "Used to create and lead development for Unity game projects.",
  },
  {
    name: "Canva",
    category: "Creative Tech",
    icon: "canva",
    iconUrl: "",
    description: "Fast visual design and presentation tooling.",
    usage: "Used for project visuals, presentation assets, and creative content.",
  },
  {
    name: "Data Science",
    category: "Backend & Data",
    icon: "pandas",
    iconUrl: "",
    description: "Data exploration, cleaning, and analysis workflows.",
    usage: "Used when exploring datasets and building ML-ready data pipelines.",
  },
];

const cloneSkillItems = (items = baseSkillItems) => items.map((item) => ({ ...item }));

function normaliseSkillItems(items, fallbackItems = baseSkillItems) {
  return items.map((item, index) => {
    const fallback = fallbackItems.find(
      (candidate) => candidate.name.toLowerCase() === String(item?.name || item).toLowerCase()
    ) || fallbackItems[index % fallbackItems.length] || baseSkillItems[0];

    if (typeof item === "string") {
      return { ...fallback, name: item };
    }

    return {
      ...fallback,
      ...item,
      name: item?.name?.trim() || fallback.name,
      category: item?.category?.trim() || fallback.category,
      icon: item?.icon?.trim() || fallback.icon,
      iconUrl: item?.iconUrl?.trim() || "",
      description: item?.description?.trim() || fallback.description,
      usage: item?.usage?.trim() || fallback.usage,
    };
  });
}

export const sectionControlDefinitions = [
  { id: "intro", label: "Opening animation" },
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "skillSpace", label: "Catch a Skill" },
  { id: "projects", label: "Projects" },
  { id: "journey", label: "Journey" },
  { id: "github", label: "GitHub" },
  { id: "codeforces", label: "Codeforces" },
  { id: "leetcode", label: "LeetCode" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

export const introAnimationStyleOptions = [
  { value: "merge", label: "Monogram merge" },
  { value: "kinetic", label: "Kinetic split" },
  { value: "fade", label: "Minimal fade" },
  { value: "orbit", label: "Orbit signal" },
  { value: "spotlight", label: "Stage spotlight" },
  { value: "terminal", label: "Terminal boot" },
  { value: "prism", label: "Prism reveal" },
];

export const heroRoleAnimationOptions = [
  { value: "typewriter", label: "Typewriter" },
  { value: "fade", label: "Soft dissolve" },
  { value: "slide", label: "Vertical rollout" },
  { value: "cascade", label: "Character cascade" },
  { value: "flip", label: "3D flip" },
  { value: "scramble", label: "Signal decode" },
  { value: "sweep", label: "Light sweep" },
];

export const projectPresentationOptions = [
  { value: "cinematic", label: "Cinematic stage" },
  { value: "split", label: "Split reveal" },
  { value: "deck", label: "Stacked deck" },
  { value: "carousel", label: "Orbit carousel" },
  { value: "poster", label: "Full-bleed poster" },
  { value: "editorial", label: "Editorial chapter" },
];

const homeRoleTimingFallback = Object.freeze({ speed: 130, pause: 1500 });
const introTimingFallback = Object.freeze({
  greetingDuration: 760,
  nameDuration: 1500,
  mergeDuration: 1850,
  finalDuration: 1200,
});
const introColorFallback = Object.freeze({
  backgroundColor: "#05070a",
  primaryColor: "#b05ce0",
  secondaryColor: "#1DCD9F",
});
const introStyleColorFallbacks = Object.freeze({
  merge: introColorFallback,
  kinetic: { backgroundColor: "#070b12", primaryColor: "#ff5f6d", secondaryColor: "#4ad7ff" },
  fade: { backgroundColor: "#080a10", primaryColor: "#d7dcea", secondaryColor: "#8aa1ff" },
  orbit: { backgroundColor: "#030916", primaryColor: "#59d7ff", secondaryColor: "#a78bfa" },
  spotlight: { backgroundColor: "#100a04", primaryColor: "#ffd166", secondaryColor: "#ff6b6b" },
  terminal: { backgroundColor: "#020a07", primaryColor: "#39ff88", secondaryColor: "#7df9ff" },
  prism: { backgroundColor: "#0c0614", primaryColor: "#ff5db1", secondaryColor: "#7de8ff" },
});
const projectPresentationTimingFallback = Object.freeze({ duration: 550 });

function boundedTimingNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(Math.max(parsed, min), max);
}

function validOptionValue(value, options, fallback) {
  return options.some((option) => option.value === value) ? value : fallback;
}

function timingObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function createTimingProfiles(options, fallback) {
  return Object.fromEntries(options.map(({ value }) => [value, { ...fallback }]));
}

function createIntroColorProfiles() {
  return Object.fromEntries(introAnimationStyleOptions.map(({ value }) => [
    value,
    { ...(introStyleColorFallbacks[value] || introColorFallback) },
  ]));
}

function normaliseColorValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function normaliseRoleAnimationTimings(timings, activeEffect = "typewriter", legacyTiming = {}) {
  const selectedEffect = validOptionValue(activeEffect, heroRoleAnimationOptions, "typewriter");
  const savedTimings = timingObject(timings);

  return Object.fromEntries(heroRoleAnimationOptions.map(({ value }) => {
    const savedTiming = timingObject(savedTimings[value]);
    const fallback = value === selectedEffect ? timingObject(legacyTiming) : homeRoleTimingFallback;

    return [value, {
      speed: boundedTimingNumber(savedTiming.speed, boundedTimingNumber(fallback.speed, homeRoleTimingFallback.speed, 45, 360), 45, 360),
      pause: boundedTimingNumber(savedTiming.pause, boundedTimingNumber(fallback.pause, homeRoleTimingFallback.pause, 550, 6000), 550, 6000),
    }];
  }));
}

export function getRoleAnimationTiming(section = {}) {
  const effect = validOptionValue(section.roleAnimation, heroRoleAnimationOptions, "typewriter");
  return normaliseRoleAnimationTimings(section.roleAnimationTimings, effect, {
    speed: section.roleAnimationSpeed,
    pause: section.roleAnimationPause,
  })[effect];
}

export function normaliseIntroAnimationTimings(timings, activeStyle = "merge", legacyTiming = {}) {
  const selectedStyle = validOptionValue(activeStyle, introAnimationStyleOptions, "merge");
  const savedTimings = timingObject(timings);

  return Object.fromEntries(introAnimationStyleOptions.map(({ value }) => {
    const savedTiming = timingObject(savedTimings[value]);
    const fallback = value === selectedStyle ? timingObject(legacyTiming) : introTimingFallback;

    return [value, {
      greetingDuration: boundedTimingNumber(savedTiming.greetingDuration, boundedTimingNumber(fallback.greetingDuration, introTimingFallback.greetingDuration, 180, 1600), 180, 1600),
      nameDuration: boundedTimingNumber(savedTiming.nameDuration, boundedTimingNumber(fallback.nameDuration, introTimingFallback.nameDuration, 600, 5000), 600, 5000),
      mergeDuration: boundedTimingNumber(savedTiming.mergeDuration, boundedTimingNumber(fallback.mergeDuration, introTimingFallback.mergeDuration, 500, 5000), 500, 5000),
      finalDuration: boundedTimingNumber(savedTiming.finalDuration, boundedTimingNumber(fallback.finalDuration, introTimingFallback.finalDuration, 400, 4000), 400, 4000),
    }];
  }));
}

export function getIntroAnimationTiming(intro = {}) {
  const style = validOptionValue(intro.style, introAnimationStyleOptions, "merge");
  return normaliseIntroAnimationTimings(intro.styleTimings, style, intro)[style];
}

export function normaliseIntroAnimationColors(colors, activeStyle = "merge", legacyColors = {}) {
  const selectedStyle = validOptionValue(activeStyle, introAnimationStyleOptions, "merge");
  const savedColors = timingObject(colors);

  return Object.fromEntries(introAnimationStyleOptions.map(({ value }) => {
    const defaults = introStyleColorFallbacks[value] || introColorFallback;
    const fallback = value === selectedStyle ? { ...defaults, ...timingObject(legacyColors) } : defaults;
    const savedColor = timingObject(savedColors[value]);

    return [value, {
      backgroundColor: normaliseColorValue(
        savedColor.backgroundColor,
        normaliseColorValue(fallback.backgroundColor, defaults.backgroundColor)
      ),
      primaryColor: normaliseColorValue(
        savedColor.primaryColor,
        normaliseColorValue(fallback.primaryColor, defaults.primaryColor)
      ),
      secondaryColor: normaliseColorValue(
        savedColor.secondaryColor,
        normaliseColorValue(fallback.secondaryColor, defaults.secondaryColor)
      ),
    }];
  }));
}

export function getIntroAnimationColors(intro = {}) {
  const style = validOptionValue(intro.style, introAnimationStyleOptions, "merge");
  return normaliseIntroAnimationColors(intro.styleColors, style, intro)[style];
}

export function normaliseProjectPresentationTimings(timings, activePresentation = "cinematic", legacyTiming = {}) {
  const selectedPresentation = validOptionValue(activePresentation, projectPresentationOptions, "cinematic");
  const savedTimings = timingObject(timings);

  return Object.fromEntries(projectPresentationOptions.map(({ value }) => {
    const savedTiming = timingObject(savedTimings[value]);
    const fallback = value === selectedPresentation ? timingObject(legacyTiming) : projectPresentationTimingFallback;

    return [value, {
      duration: boundedTimingNumber(savedTiming.duration, boundedTimingNumber(fallback.duration, projectPresentationTimingFallback.duration, 250, 1600), 250, 1600),
    }];
  }));
}

export function getProjectPresentationTiming(section = {}) {
  const presentation = validOptionValue(section.presentation, projectPresentationOptions, "cinematic");
  return normaliseProjectPresentationTimings(section.presentationTimings, presentation, {
    duration: section.transitionDuration,
  })[presentation];
}

export const journeyDesktopAnimationOptions = [
  { value: "glide", label: "Smooth glide" },
  { value: "cascade", label: "Cascading cards" },
  { value: "focus", label: "Depth focus" },
  { value: "orbit", label: "Orbit carousel" },
  { value: "deck", label: "Layered deck" },
  { value: "split", label: "Split stream" },
  { value: "flip", label: "3D flip gallery" },
];

export const journeyMobileAnimationOptions = [
  { value: "rise", label: "Rise in" },
  { value: "slide", label: "Side slide" },
  { value: "fade", label: "Soft fade" },
  { value: "flip", label: "3D flip reveal" },
  { value: "swing", label: "Pendulum swing" },
  { value: "pop", label: "Zoom pop" },
  { value: "curtain", label: "Curtain reveal" },
];

export const sectionSettingsDefaults = Object.freeze(
  Object.fromEntries(
    sectionControlDefinitions.map(({ id }) => [id, { enabled: true, source: "admin" }])
  )
);

export const sectionOrderDefaults = Object.freeze([
  "home",
  "about",
  "skills",
  "skillSpace",
  "projects",
  "journey",
  "github",
  "codeforces",
  "leetcode",
  "testimonials",
  "contact",
  "footer",
]);

export const adminPageOrderDefaults = Object.freeze([
  "identity",
  "intro",
  "theme",
  "display",
  "about",
  "skills",
  "skillSpace",
  "projects",
  "journey",
  "github",
  "codeforces",
  "leetcode",
  "testimonials",
  "contact",
]);

function normaliseOrder(order, defaults) {
  const allowed = new Set(defaults);
  const seen = new Set();
  const normalized = [];

  for (const value of Array.isArray(order) ? order : []) {
    if (!allowed.has(value) || seen.has(value)) continue;
    seen.add(value);
    normalized.push(value);
  }

  return [...normalized, ...defaults.filter((value) => !seen.has(value))];
}

export function normaliseSectionOrder(order) {
  return normaliseOrder(order, sectionOrderDefaults);
}

export function normaliseAdminPageOrder(order) {
  return normaliseOrder(order, adminPageOrderDefaults);
}

export function normaliseSectionSettings(settings) {
  return Object.fromEntries(
    sectionControlDefinitions.map(({ id }) => {
      // Older saved content had one shared Coding Progress setting. Keep that
      // preference until the new per-platform settings are saved from Admin.
      const legacyCodingSetting = ["github", "codeforces", "leetcode"].includes(id)
        ? settings?.coding
        : undefined;
      const current = settings?.[id] || legacyCodingSetting || {};

      return [id, {
        enabled: current.enabled !== false,
        source: current.source === "builtIn" ? "builtIn" : "admin",
      }];
    })
  );
}

export function getPortfolioList(content, field) {
  if (content?.initialized === true) {
    return Array.isArray(content[field]) ? content[field] : [];
  }

  const value = content?.[field];
  if (Array.isArray(value) && value.length > 0) return value;

  return Array.isArray(portfolioDefaults[field]) ? portfolioDefaults[field] : [];
}

export const portfolioDefaults = {
  sectionOrder: [...sectionOrderDefaults],
  adminPageOrder: [...adminPageOrderDefaults],
  theme: {
    background: "#05070a",
    surface: "#09090e",
    accent: "#1cd8d2",
    secondary: "#00bf8f",
    deepAccent: "#302b63",
  },
  media: {
    logoUrl: "",
    homeAvatarUrl: "",
    aboutProfileUrl: "",
    contactImageUrl: "",
  },
  navigation: {
    contactLabel: "Reach Out",
    contactHref: "#contact",
  },
  name: "Chinmay Biswas",
  headline: "MERN stack Developer",
  roles: ["MERN stack Developer", "C++ Programmer", "Game Developer", "AI & ML Engineer"],
  about:
    "I’m a 3rd-year B.Tech student at IIT Guwahati and a passionate developer interested in MERN stack development, game design, and emerging AI/ML technologies. From building interactive Unity games to developing responsive web applications, I enjoy turning ideas into creative and practical digital experiences while continuously exploring new technologies and improving my skills.",
  aboutShort:
    "I'm a passionate web developer with a knack for crafting beautiful and functional websites. With expertise in React, Tailwind CSS, and JavaScript, I create seamless user experiences. I thrive on learning new technologies and contributing to open source projects. Let's build something amazing together!",
  aboutLong:
    "I’m Chinmay Biswas, a 3rd-year B.Tech student at IIT Guwahati who enjoys building creative and impactful digital experiences through development, design, and problem-solving. My journey started with game development in Unity, where I explored storytelling, gameplay mechanics, and interactive system design, eventually leading teams and developing projects like Echoes of Regret.",
  aboutExtra:
    "Over time, my interests expanded into MERN stack development, where I started building scalable and responsive web applications such as Hot Corner, a full-stack movie ticket booking platform. Currently, I’m also exploring AI/ML technologies and working on intelligent suggestion systems to create smarter user experiences.",
  aboutFinal:
    "I enjoy learning new technologies, adapting across different domains, and building complete products from idea to deployment. Whether it’s game development, web applications, DSA problem solving on platforms like LeetCode and Codeforces, or experimenting with AI-driven systems, I love pushing myself to continuously learn, create, and improve.",
  aboutStats: [
    { label: "Frontend", value: "React.js, Tailwind CSS, JavaScript, HTML/CSS" },
    { label: "Backend", value: "Node.js, Express.js, MongoDB, REST APIs" },
    { label: "Game Development", value: "Unity, C#, Gameplay Systems, Level Design" },
    { label: "AI/ML", value: "Python, Machine Learning, Suggestion Systems" },
    { label: "Programming", value: "C++, DSA, LeetCode, Codeforces" },
    { label: "Tools", value: "Git, GitHub, Canva, Kaggle, Postman" },
    { label: "Platforms", value: "Google Colab, Jupyter Notebook, Anaconda, Vercel, Clerk" },
    { label: "Deployment", value: "Vercel, Render, Netlify, GitHub Pages" },
    { label: "Creative & Design", value: "Canva, UI Design, Video Editing, HiPaint, Creative Workflows" },
  ],
  achievements: [
    { label: "IITG GameJam", value: "Runner-Up for developing a complete Unity-based game" },
    { label: "IGDC Competition", value: "Built and led the development of Pheneon Quest" },
    { label: "DSA & Competitive Coding", value: "Active problem solving on LeetCode and Codeforces" },
    { label: "AI-Powered Systems", value: "Building intelligent suggestion systems with AI/ML" },
    { label: "Leadership", value: "Led teams and managed end-to-end game development projects" },
    { label: "Fast Learner", value: "Adapted across game development, web development, and AI/ML" },
  ],
  homeButtons: {
    greeting: "Hello I'm",
    projectsLabel: "Explore Projects",
    resumeLabel: "Get Resume",
  },
  homeSection: {
    accentStart: "#b05ce0",
    accentMiddle: "#7b32c0",
    accentEnd: "#4e0480",
    avatarStart: "#6B27B0",
    avatarMiddle: "#3d1566",
    avatarEnd: "#9b4de0",
    roleAnimation: "typewriter",
    roleAnimationSpeed: 130,
    roleAnimationPause: 1500,
    roleAnimationTimings: createTimingProfiles(heroRoleAnimationOptions, homeRoleTimingFallback),
  },
  introAnimation: {
    enabled: true,
    style: "merge",
    showGreeting: true,
    greetings: ["Hello"],
    firstName: "Chinmay",
    lastName: "Biswas",
    initials: "CJ",
    caption: "PORTFOLIO",
    backgroundColor: "#05070a",
    primaryColor: "#b05ce0",
    secondaryColor: "#1DCD9F",
    greetingDuration: 760,
    nameDuration: 1500,
    mergeDuration: 1850,
    finalDuration: 1200,
    styleTimings: createTimingProfiles(introAnimationStyleOptions, introTimingFallback),
    styleColors: createIntroColorProfiles(),
  },
  sectionSettings: normaliseSectionSettings(),
  aboutSection: {
    title: "About Me",
    projectsButtonLabel: "See My Work",
    contactButtonLabel: "Let's Connect",
  },
  skillsSection: {
    eyebrow: "Skills",
    title: "My Skills",
    description: "Modern Application | Modern Technologies | Modern Solutions",
    accentColor: "#1DCD9F",
    animation: "stagger",
  },
  skillsSpaceSection: {
    eyebrow: "Skills, in orbit",
    title: "Catch a skill",
    description: "Hold the cursor near a floating skill to capture it in the UFO beam and view its details.",
    interactionHint: "Hold the mouse button near a skill sphere to pull it into the beam.",
    accentColor: "#1DCD9F",
    secondaryColor: "#8b7cf6",
    ballAnimation: "drift",
    dialogAnimation: "spring",
    ballSize: 76,
    showStars: true,
    dialogEyebrow: "Skill captured",
    dialogDescriptionLabel: "About this skill",
    dialogUsageLabel: "Where I use it",
    emptyUsageText: "Add the practical use of this skill from the Skill Space page in Admin.",
  },
  projectsSection: {
    title: "MY PROJECTS",
    projectButtonLabel: "Live Demo",
    contactButtonLabel: "Git Link",
    presentation: "cinematic",
    transitionDuration: 550,
    presentationTimings: createTimingProfiles(projectPresentationOptions, projectPresentationTimingFallback),
  },
  journeySection: {
    eyebrow: "Timeline",
    title: "Journey",
    accentColor: "#b05ce0",
    cardColor: "#11131a",
    desktopLayout: "rail",
    desktopAnimation: "glide",
    desktopVisibleCards: 3,
    desktopScrollVh: 38,
    showCardNumber: true,
    mobileLayout: "timeline",
    mobileAnimation: "rise",
    mobileCardGap: 28,
    showMobileProgress: true,
  },
  codingProgressSection: {
    eyebrow: "Practice in public",
    title: "Coding Progress",
    description: "Live public progress from the platforms where I learn, compete, and build.",
    accentColor: "#1cd8d2",
    secondaryColor: "#b05ce0",
    githubProfile: "",
    codeforcesProfile: "",
    leetcodeProfile: "",
    refreshMinutes: 360,
  },
  githubSection: {
    eyebrow: "Open-source work",
    title: "GitHub",
    description: "Repositories, public activity, languages, and the work I keep improving in the open.",
    accentColor: "#e5e7eb",
    secondaryColor: "#1cd8d2",
  },
  codeforcesSection: {
    eyebrow: "Competitive programming",
    title: "Codeforces",
    description: "Rating history, accepted problems, contest performance, and the patterns I practice under pressure.",
    accentColor: "#5b8def",
    secondaryColor: "#ffcf5c",
  },
  leetcodeSection: {
    eyebrow: "Problem-solving practice",
    title: "LeetCode",
    description: "Difficulty progress, topic strengths, language practice, and public problem-solving milestones.",
    accentColor: "#f5a623",
    secondaryColor: "#1cd8d2",
  },
  skills: [
    "Java",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "NodeJS",
    "Python",
    "AI",
    "C#",
    "MongoDB",
    "C++",
    "UNITY",
    "Canva",
    "Data Science",
  ],
  skillCards: cloneSkillItems(),
  spaceSkills: cloneSkillItems(),
  projects: [
    {
      title: "Echoes Of Regret",
      link: "https://chinmaybiswas475.itch.io/echoes-of-regret",
      gitlink: "https://github.com/Chinmay-biswas/Echoes-of-Regret",
      about: "A Unity game with immersive storytelling and atmospheric gameplay.",
      bgColor: "#000000",
      image: "",
      video: "https://www.youtube.com/embed/lFwUZPDMnK0",
    },
    {
      title: "Hot-Corner",
      link: "https://hot-corner.vercel.app/",
      gitlink: "https://github.com/Chinmay-biswas/Hot-Corner",
      about: "A modern movie ticket booking web app built with React and Node.js.",
      bgColor: "#000000",
      image: "",
      video: "",
    },
    {
      title: "WhatsApp Chat Analyzer",
      link: "https://whatsapp-chat-analyzer-iszd.onrender.com/",
      gitlink: "https://github.com/Chinmay-biswas/WhatsApp_Chat_Analyzer",
      about: "Analyze chats with statistics, activity trends, emoji analysis, and visual insights.",
      bgColor: "#000000",
      image: "",
      video: "",
    },
  ],
  socials: [
    { label: "Instagram", url: "https://instagram.com/chinmaybiswas475" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/chinmay-biswas-a8098b298/" },
    { label: "GitHub", url: "https://github.com/Chinmay-biswas" },
  ],
  resumeLinks: [
    {
      label: "AI / ML",
      url: "https://drive.google.com/uc?export=download&id=1gNBCk-O8Ni1ShAP6OJ5WJz0YC6YVUtab",
    },
    {
      label: "Full Stack",
      url: "https://drive.google.com/uc?export=download&id=1rME9-eQFsywtZMUrjUdYy25pdKwLQh2F",
    },
    {
      label: "Game Dev",
      url: "https://drive.google.com/uc?export=download&id=1Yj3sF9q0Xt6fJ7hm5Z2b0nkOl1L1j_ut",
    },
    {
      label: "C++ / SDE",
      url: "https://drive.google.com/uc?export=download&id=1P0YD8YlBVQtQeQ7UBjIAPb0H-6xLLwrQ",
    },
  ],
  journeys: [
    {
      role: "Technology Curiosity",
      company: "Early Learning",
      duration: "Before 2018",
      description: "Developed curiosity about technology and started learning basic HTML, CSS, and Python while exploring how websites and digital systems work.",
    },
    {
      role: "Creative Editing Journey",
      company: "Design & Editing",
      duration: "2020",
      description: "Learned photo and video editing using tools like KineMaster, Canva, and PicsArt, which helped develop creativity and design sense.",
    },
    {
      role: "School Education",
      company: "Jawahar Navodaya Vidyalaya",
      duration: "2018 - 2022",
      description: "Completed 10th and 12th education while strengthening analytical thinking, discipline, and academic foundations.",
    },
    {
      role: "JEE Advanced Preparation",
      company: "GAIL Super 100",
      duration: "2022 - 23",
      description: "Selected for the GAIL Super 100 coaching program and prepared intensively for JEE Advanced.",
    },
    {
      role: "IIT Guwahati Journey",
      company: "B.Tech in ECE",
      duration: "2023",
      description: "Started B.Tech at IIT Guwahati and began actively exploring multiple technology domains and development fields.",
    },
    {
      role: "Game Development Introduction",
      company: "Kriti Game Development Module",
      duration: "2023",
      description: "Participated in Kriti's Game Development Module and discovered a strong interest in Unity and interactive game systems.",
    },
    {
      role: "Game Development Club",
      company: "IIT Guwahati",
      duration: "2023 - 24",
      description: "Joined the Game Development Club and worked on multiple game projects while improving gameplay design and development skills.",
    },
    {
      role: "Cybersecurity Club",
      company: "IIT Guwahati",
      duration: "2023 - 24",
      description: "Participated in cybersecurity activities, worked on Capture The Flag projects, and helped conduct technical workshops.",
    },
    {
      role: "Programming Foundations",
      company: "C++ & DSA",
      duration: "2023",
      description: "Started learning C++, problem solving, and core programming concepts to build strong technical foundations.",
    },
    {
      role: "First Unity Projects",
      company: "Game Development",
      duration: "2023",
      description: "Built Unity prototypes and experimented with gameplay mechanics, animations, interactions, and level systems.",
    },
    {
      role: "Pheneon Quest",
      company: "IGDC Submission",
      duration: "2024",
      description: "Developed gameplay systems, combat mechanics, storyline integration, and overall technical implementation for a 2.5D action-adventure game.",
    },
    {
      role: "Frontend Development",
      company: "Web Development",
      duration: "2024",
      description: "Started learning React.js, Tailwind CSS, and responsive web development for creating modern user interfaces.",
    },
    {
      role: "MERN Stack Journey",
      company: "Full-Stack Development",
      duration: "2024",
      description: "Expanded into backend technologies including Node.js, Express.js, MongoDB, and REST APIs.",
    },
    {
      role: "Echoes of Regret",
      company: "Unity Game Project",
      duration: "2025",
      description: "Led the development team while also handling major gameplay coding, mechanics, systems integration, and project execution.",
    },
    {
      role: "Kriti GameJam Achievement",
      company: "IIT Guwahati",
      duration: "2025",
      description: "Secured runner-up position in Kriti GameJam by developing and submitting Echoes of Regret, a complete Unity-based game.",
    },
    {
      role: "Hot Corner",
      company: "MERN Stack Project",
      duration: "2025",
      description: "Built a full-stack movie ticket booking platform with authentication, seat booking, admin dashboard, and responsive UI.",
    },
    {
      role: "AI/ML Exploration",
      company: "Machine Learning",
      duration: "2025",
      description: "Started learning AI/ML concepts and integrating recommendation systems into projects for smarter user experiences.",
    },
    {
      role: "Competitive Coding",
      company: "LeetCode & Codeforces",
      duration: "Present",
      description: "Regularly practice DSA and competitive programming to improve logical thinking and problem-solving abilities.",
    },
    {
      role: "ML Completed",
      company: "Machine Learning",
      duration: "2025",
      description: "Completed two small projects and started learning AI through the CampusX YouTube channel.",
    },
    {
      role: "SoundVerse Internship",
      company: "SoundVerse.ai",
      duration: "Currently doing",
      description: "First internship experience at SoundVerse.ai.",
    },
  ],
  testimonialsSection: {
    title: "What people say",
  },
  testimonials: [
    {
      name: "Aarav Sharma",
      role: "Frontend Developer at TechNova",
      review: "Chinmay is an incredibly creative and dedicated developer. His attention to UI/UX detail and smooth animations made our project stand out beautifully.",
      image: "",
    },
    {
      name: "Priya Verma",
      role: "UI/UX Designer at PixelCraft",
      review: "Working with Chinmay was an amazing experience. He combines technical skills with creativity and always delivers polished, modern interfaces.",
      image: "",
    },
  ],
  contactSection: {
    title: "Let's Work Together",
    submitLabel: "Send Message",
  },
  footer: {
    quote: "Success is when preparation meets opportunity.",
  },
};

export function mergePortfolioContent(content) {
  if (!content) return portfolioDefaults;
  const keepEmptyLists = content.initialized === true;
  const pickList = (value, fallback) =>
    Array.isArray(value) && (value.length > 0 || keepEmptyLists) ? value : fallback;
  const pickSkillItems = (value, legacySkills, fallback) => {
    if (Array.isArray(value) && (value.length > 0 || keepEmptyLists)) {
      return normaliseSkillItems(value, fallback);
    }

    if (Array.isArray(legacySkills) && legacySkills.length > 0) {
      return normaliseSkillItems(legacySkills, fallback);
    }

    return cloneSkillItems(fallback);
  };
  const savedHomeSection = timingObject(content.homeSection);
  const activeRoleAnimation = validOptionValue(
    savedHomeSection.roleAnimation,
    heroRoleAnimationOptions,
    portfolioDefaults.homeSection.roleAnimation
  );
  const roleAnimationTimings = normaliseRoleAnimationTimings(
    savedHomeSection.roleAnimationTimings,
    activeRoleAnimation,
    {
      speed: savedHomeSection.roleAnimationSpeed,
      pause: savedHomeSection.roleAnimationPause,
    }
  );
  const activeRoleTiming = roleAnimationTimings[activeRoleAnimation];
  const savedIntroAnimation = timingObject(content.introAnimation);
  const activeIntroStyle = validOptionValue(
    savedIntroAnimation.style,
    introAnimationStyleOptions,
    portfolioDefaults.introAnimation.style
  );
  const styleTimings = normaliseIntroAnimationTimings(
    savedIntroAnimation.styleTimings,
    activeIntroStyle,
    savedIntroAnimation
  );
  const activeIntroTiming = styleTimings[activeIntroStyle];
  const styleColors = normaliseIntroAnimationColors(
    savedIntroAnimation.styleColors,
    activeIntroStyle,
    savedIntroAnimation
  );
  const activeIntroColors = styleColors[activeIntroStyle];
  const savedProjectsSection = timingObject(content.projectsSection);
  const activeProjectPresentation = validOptionValue(
    savedProjectsSection.presentation,
    projectPresentationOptions,
    portfolioDefaults.projectsSection.presentation
  );
  const presentationTimings = normaliseProjectPresentationTimings(
    savedProjectsSection.presentationTimings,
    activeProjectPresentation,
    { duration: savedProjectsSection.transitionDuration }
  );
  const activeProjectTiming = presentationTimings[activeProjectPresentation];

  return {
    ...portfolioDefaults,
    ...content,
    roles: pickList(content.roles, portfolioDefaults.roles),
    skills: pickList(content.skills, portfolioDefaults.skills),
    skillCards: pickSkillItems(
      content.skillCards,
      content.skills,
      portfolioDefaults.skillCards
    ),
    spaceSkills: pickSkillItems(
      content.spaceSkills,
      content.skills,
      portfolioDefaults.spaceSkills
    ),
    projects: pickList(content.projects, portfolioDefaults.projects),
    socials: pickList(content.socials, portfolioDefaults.socials),
    resumeLinks: pickList(content.resumeLinks, portfolioDefaults.resumeLinks),
    aboutStats: pickList(content.aboutStats, portfolioDefaults.aboutStats),
    achievements: pickList(content.achievements, portfolioDefaults.achievements),
    journeys: pickList(content.journeys, portfolioDefaults.journeys),
    testimonials: pickList(content.testimonials, portfolioDefaults.testimonials),
    theme: { ...portfolioDefaults.theme, ...(content.theme || {}) },
    media: { ...portfolioDefaults.media, ...(content.media || {}) },
    navigation: { ...portfolioDefaults.navigation, ...(content.navigation || {}) },
    homeButtons: { ...portfolioDefaults.homeButtons, ...(content.homeButtons || {}) },
    homeSection: {
      ...portfolioDefaults.homeSection,
      ...savedHomeSection,
      roleAnimation: activeRoleAnimation,
      roleAnimationSpeed: activeRoleTiming.speed,
      roleAnimationPause: activeRoleTiming.pause,
      roleAnimationTimings,
    },
    introAnimation: {
      ...portfolioDefaults.introAnimation,
      ...savedIntroAnimation,
      style: activeIntroStyle,
      greetingDuration: activeIntroTiming.greetingDuration,
      nameDuration: activeIntroTiming.nameDuration,
      mergeDuration: activeIntroTiming.mergeDuration,
      finalDuration: activeIntroTiming.finalDuration,
      styleTimings,
      backgroundColor: activeIntroColors.backgroundColor,
      primaryColor: activeIntroColors.primaryColor,
      secondaryColor: activeIntroColors.secondaryColor,
      styleColors,
      greetings: pickList(
        content.introAnimation?.greetings,
        portfolioDefaults.introAnimation.greetings
      ),
    },
    sectionSettings: normaliseSectionSettings(content.sectionSettings),
    sectionOrder: normaliseSectionOrder(content.sectionOrder),
    adminPageOrder: normaliseAdminPageOrder(content.adminPageOrder),
    aboutSection: { ...portfolioDefaults.aboutSection, ...(content.aboutSection || {}) },
    skillsSection: { ...portfolioDefaults.skillsSection, ...(content.skillsSection || {}) },
    skillsSpaceSection: {
      ...portfolioDefaults.skillsSpaceSection,
      ...(content.skillsSpaceSection || {}),
    },
    projectsSection: {
      ...portfolioDefaults.projectsSection,
      ...savedProjectsSection,
      presentation: activeProjectPresentation,
      transitionDuration: activeProjectTiming.duration,
      presentationTimings,
    },
    journeySection: { ...portfolioDefaults.journeySection, ...(content.journeySection || {}) },
    codingProgressSection: {
      ...portfolioDefaults.codingProgressSection,
      ...(content.codingProgressSection || {}),
    },
    githubSection: { ...portfolioDefaults.githubSection, ...(content.githubSection || {}) },
    codeforcesSection: { ...portfolioDefaults.codeforcesSection, ...(content.codeforcesSection || {}) },
    leetcodeSection: { ...portfolioDefaults.leetcodeSection, ...(content.leetcodeSection || {}) },
    testimonialsSection: {
      ...portfolioDefaults.testimonialsSection,
      ...(content.testimonialsSection || {}),
    },
    contactSection: { ...portfolioDefaults.contactSection, ...(content.contactSection || {}) },
    footer: { ...portfolioDefaults.footer, ...(content.footer || {}) },
  };
}
