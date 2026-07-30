import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    about: { type: String, default: "" },
    link: { type: String, default: "" },
    gitlink: { type: String, default: "" },
    bgColor: { type: String, default: "#0d4d3d" },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
  },
  { _id: false }
);

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const JourneySchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    company: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    review: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const SkillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "More Skills", trim: true },
    icon: { type: String, default: "code", trim: true },
    iconUrl: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    usage: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const SkillsSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Skills" },
    title: { type: String, default: "My Skills" },
    description: { type: String, default: "" },
    accentColor: { type: String, default: "#1DCD9F" },
    animation: {
      type: String,
      enum: ["stagger", "lift", "flip", "scale", "glow"],
      default: "stagger",
    },
  },
  { _id: false }
);

const SkillsSpaceSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Skills, in orbit" },
    title: { type: String, default: "Catch a skill" },
    description: { type: String, default: "" },
    interactionHint: { type: String, default: "" },
    accentColor: { type: String, default: "#1DCD9F" },
    secondaryColor: { type: String, default: "#8b7cf6" },
    ballAnimation: {
      type: String,
      enum: ["drift", "orbit", "pulse", "float"],
      default: "drift",
    },
    dialogAnimation: {
      type: String,
      enum: ["scale", "slide", "fade", "spring"],
      default: "spring",
    },
    ballSize: { type: Number, min: 48, max: 104, default: 76 },
    showStars: { type: Boolean, default: true },
    dialogEyebrow: { type: String, default: "Skill captured" },
    dialogDescriptionLabel: { type: String, default: "About this skill" },
    dialogUsageLabel: { type: String, default: "Where I use it" },
    emptyUsageText: { type: String, default: "" },
    releaseLabel: { type: String, default: "Release skill" },
  },
  { _id: false }
);

const ThemeSchema = new mongoose.Schema(
  {
    background: { type: String, default: "#05070a" },
    surface: { type: String, default: "#09090e" },
    accent: { type: String, default: "#1cd8d2" },
    secondary: { type: String, default: "#00bf8f" },
    deepAccent: { type: String, default: "#302b63" },
  },
  { _id: false }
);

const RoleAnimationTimingSchema = new mongoose.Schema(
  {
    speed: { type: Number, min: 45, max: 360, default: 130 },
    pause: { type: Number, min: 550, max: 6000, default: 1500 },
  },
  { _id: false }
);

const IntroStyleTimingSchema = new mongoose.Schema(
  {
    greetingDuration: { type: Number, min: 180, max: 1600, default: 760 },
    nameDuration: { type: Number, min: 600, max: 5000, default: 1500 },
    mergeDuration: { type: Number, min: 500, max: 5000, default: 1850 },
    finalDuration: { type: Number, min: 400, max: 4000, default: 1200 },
  },
  { _id: false }
);

const IntroStyleColorSchema = new mongoose.Schema(
  {
    backgroundColor: { type: String, default: "#05070a" },
    primaryColor: { type: String, default: "#b05ce0" },
    secondaryColor: { type: String, default: "#1DCD9F" },
  },
  { _id: false }
);

const ProjectPresentationTimingSchema = new mongoose.Schema(
  {
    duration: { type: Number, min: 250, max: 1600, default: 550 },
  },
  { _id: false }
);

const HomeSectionSchema = new mongoose.Schema(
  {
    accentStart: { type: String, default: "#b05ce0" },
    accentMiddle: { type: String, default: "#7b32c0" },
    accentEnd: { type: String, default: "#4e0480" },
    avatarStart: { type: String, default: "#6B27B0" },
    avatarMiddle: { type: String, default: "#3d1566" },
    avatarEnd: { type: String, default: "#9b4de0" },
    roleAnimation: {
      type: String,
      enum: ["typewriter", "fade", "slide", "cascade", "flip", "scramble", "sweep"],
      default: "typewriter",
    },
    roleAnimationSpeed: { type: Number, min: 45, max: 360, default: 130 },
    roleAnimationPause: { type: Number, min: 550, max: 6000, default: 1500 },
    roleAnimationTimings: {
      type: Map,
      of: RoleAnimationTimingSchema,
      default: () => new Map(),
    },
  },
  { _id: false }
);

const IntroAnimationSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    style: {
      type: String,
      enum: ["merge", "kinetic", "fade", "orbit", "spotlight", "terminal", "prism"],
      default: "merge",
    },
    showGreeting: { type: Boolean, default: true },
    greetings: { type: [String], default: ["Hello"] },
    firstName: { type: String, default: "Chinmay" },
    lastName: { type: String, default: "Biswas" },
    initials: { type: String, default: "CJ" },
    caption: { type: String, default: "PORTFOLIO" },
    backgroundColor: { type: String, default: "#05070a" },
    primaryColor: { type: String, default: "#b05ce0" },
    secondaryColor: { type: String, default: "#1DCD9F" },
    greetingDuration: { type: Number, min: 180, max: 1600, default: 760 },
    nameDuration: { type: Number, min: 600, max: 5000, default: 1500 },
    mergeDuration: { type: Number, min: 500, max: 5000, default: 1850 },
    finalDuration: { type: Number, min: 400, max: 4000, default: 1200 },
    styleTimings: {
      type: Map,
      of: IntroStyleTimingSchema,
      default: () => new Map(),
    },
    styleColors: {
      type: Map,
      of: IntroStyleColorSchema,
      default: () => new Map(),
    },
  },
  { _id: false }
);

const JourneySectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Timeline" },
    title: { type: String, default: "Journey" },
    accentColor: { type: String, default: "#b05ce0" },
    cardColor: { type: String, default: "#11131a" },
    desktopLayout: { type: String, enum: ["rail", "spotlight"], default: "rail" },
    desktopAnimation: {
      type: String,
      enum: ["glide", "cascade", "focus", "orbit", "deck", "split", "flip"],
      default: "glide",
    },
    desktopVisibleCards: { type: Number, min: 2, max: 4, default: 3 },
    desktopScrollVh: { type: Number, min: 20, max: 100, default: 38 },
    showCardNumber: { type: Boolean, default: true },
    mobileLayout: { type: String, enum: ["timeline", "stack"], default: "timeline" },
    mobileAnimation: {
      type: String,
      enum: ["rise", "slide", "fade", "flip", "swing", "pop", "curtain"],
      default: "rise",
    },
    mobileCardGap: { type: Number, min: 16, max: 80, default: 28 },
    showMobileProgress: { type: Boolean, default: true },
  },
  { _id: false }
);

const CodingProgressSectionSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, default: "Practice in public", trim: true },
    title: { type: String, default: "Coding Progress", trim: true },
    description: { type: String, default: "", trim: true },
    accentColor: { type: String, default: "#1cd8d2", trim: true },
    secondaryColor: { type: String, default: "#b05ce0", trim: true },
    githubProfile: { type: String, default: "", trim: true },
    codeforcesProfile: { type: String, default: "", trim: true },
    leetcodeProfile: { type: String, default: "", trim: true },
    refreshMinutes: { type: Number, min: 15, max: 1440, default: 360 },
  },
  { _id: false }
);

function createPlatformProgressSectionSchema(defaults) {
  return new mongoose.Schema(
    {
      eyebrow: { type: String, default: defaults.eyebrow, trim: true },
      title: { type: String, default: defaults.title, trim: true },
      description: { type: String, default: defaults.description, trim: true },
      accentColor: { type: String, default: defaults.accentColor, trim: true },
      secondaryColor: { type: String, default: defaults.secondaryColor, trim: true },
    },
    { _id: false }
  );
}

const GitHubProgressSectionSchema = createPlatformProgressSectionSchema({
  eyebrow: "Open-source work",
  title: "GitHub",
  description: "Repositories, public activity, languages, and the work I keep improving in the open.",
  accentColor: "#e5e7eb",
  secondaryColor: "#1cd8d2",
});

const CodeforcesProgressSectionSchema = createPlatformProgressSectionSchema({
  eyebrow: "Competitive programming",
  title: "Codeforces",
  description: "Rating history, accepted problems, contest performance, and the patterns I practice under pressure.",
  accentColor: "#5b8def",
  secondaryColor: "#ffcf5c",
});

const LeetCodeProgressSectionSchema = createPlatformProgressSectionSchema({
  eyebrow: "Problem-solving practice",
  title: "LeetCode",
  description: "Difficulty progress, topic strengths, language practice, and public problem-solving milestones.",
  accentColor: "#f5a623",
  secondaryColor: "#1cd8d2",
});

const MediaSchema = new mongoose.Schema(
  {
    logoUrl: { type: String, default: "" },
    homeAvatarUrl: { type: String, default: "" },
    aboutProfileUrl: { type: String, default: "" },
    contactImageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const SectionControlSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    source: { type: String, enum: ["admin", "builtIn"], default: "admin" },
  },
  { _id: false }
);

const SectionSettingsSchema = new mongoose.Schema(
  {
    intro: { type: SectionControlSchema, default: () => ({}) },
    home: { type: SectionControlSchema, default: () => ({}) },
    about: { type: SectionControlSchema, default: () => ({}) },
    skills: { type: SectionControlSchema, default: () => ({}) },
    skillSpace: { type: SectionControlSchema, default: () => ({}) },
    projects: { type: SectionControlSchema, default: () => ({}) },
    journey: { type: SectionControlSchema, default: () => ({}) },
    // Retained only so existing single Coding Progress display settings can migrate cleanly.
    coding: { type: SectionControlSchema },
    github: { type: SectionControlSchema },
    codeforces: { type: SectionControlSchema },
    leetcode: { type: SectionControlSchema },
    testimonials: { type: SectionControlSchema, default: () => ({}) },
    contact: { type: SectionControlSchema, default: () => ({}) },
    footer: { type: SectionControlSchema, default: () => ({}) },
  },
  { _id: false }
);

const publicSectionIds = [
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
];

const adminPageIds = [
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
];

function uniqueOrder(order) {
  return Array.isArray(order) && new Set(order).size === order.length;
}

const PortfolioContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    initialized: { type: Boolean, default: false },
    name: { type: String, default: "Chinmay Biswas" },
    headline: { type: String, default: "MERN stack Developer" },
    roles: { type: [String], default: [] },
    about: { type: String, default: "" },
    aboutShort: { type: String, default: "" },
    aboutLong: { type: String, default: "" },
    aboutExtra: { type: String, default: "" },
    aboutFinal: { type: String, default: "" },
    aboutStats: { type: [StatSchema], default: [] },
    achievements: { type: [StatSchema], default: [] },
    theme: { type: ThemeSchema, default: () => ({}) },
    media: { type: MediaSchema, default: () => ({}) },
    navigation: {
      contactLabel: { type: String, default: "Reach Out" },
      contactHref: { type: String, default: "#contact" },
    },
    homeButtons: {
      greeting: { type: String, default: "Hello I'm" },
      projectsLabel: { type: String, default: "View My Work" },
      resumeLabel: { type: String, default: "Resume" },
    },
    homeSection: { type: HomeSectionSchema, default: () => ({}) },
    introAnimation: { type: IntroAnimationSchema, default: () => ({}) },
    sectionSettings: { type: SectionSettingsSchema, default: () => ({}) },
    sectionOrder: {
      type: [{ type: String, enum: publicSectionIds }],
      default: () => [...publicSectionIds],
      validate: { validator: uniqueOrder, message: "Section order cannot contain duplicate sections" },
    },
    adminPageOrder: {
      type: [{ type: String, enum: adminPageIds }],
      default: () => [...adminPageIds],
      validate: { validator: uniqueOrder, message: "Admin page order cannot contain duplicate pages" },
    },
    aboutSection: {
      title: { type: String, default: "About Me" },
      projectsButtonLabel: { type: String, default: "View Project" },
      contactButtonLabel: { type: String, default: "Get In Touch" },
    },
    skillsSection: { type: SkillsSectionSchema, default: () => ({}) },
    skillsSpaceSection: { type: SkillsSpaceSectionSchema, default: () => ({}) },
    projectsSection: {
      title: { type: String, default: "MY WORK" },
      projectButtonLabel: { type: String, default: "View Project" },
      contactButtonLabel: { type: String, default: "Get In Touch" },
      presentation: {
        type: String,
        enum: ["cinematic", "split", "deck", "carousel", "poster", "editorial"],
        default: "cinematic",
      },
      transitionDuration: { type: Number, min: 250, max: 1600, default: 550 },
      presentationTimings: {
        type: Map,
        of: ProjectPresentationTimingSchema,
        default: () => new Map(),
      },
    },
    journeySection: { type: JourneySectionSchema, default: () => ({}) },
    codingProgressSection: { type: CodingProgressSectionSchema, default: () => ({}) },
    githubSection: { type: GitHubProgressSectionSchema, default: () => ({}) },
    codeforcesSection: { type: CodeforcesProgressSectionSchema, default: () => ({}) },
    leetcodeSection: { type: LeetCodeProgressSectionSchema, default: () => ({}) },
    skills: { type: [String], default: [] },
    skillCards: { type: [SkillItemSchema], default: [] },
    spaceSkills: { type: [SkillItemSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    journeys: { type: [JourneySchema], default: [] },
    testimonialsSection: {
      title: { type: String, default: "What people say" },
    },
    testimonials: { type: [TestimonialSchema], default: [] },
    contactSection: {
      title: { type: String, default: "Let's Work Together" },
      submitLabel: { type: String, default: "Send Message" },
    },
    footer: {
      quote: { type: String, default: "" },
    },
    socials: { type: [LinkSchema], default: [] },
    resumeLinks: { type: [LinkSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("PortfolioContent", PortfolioContentSchema);
