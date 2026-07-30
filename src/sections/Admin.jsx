import { useEffect, useMemo, useRef, useState } from "react";
import { LuChevronDown, LuExternalLink, LuGripVertical, LuRefreshCw, LuUpload } from "react-icons/lu";
import IntroAnimation from "../components/IntroAnimation";
import SkillIcon from "../components/SkillIcon";
import {
  getIntroAnimationColors,
  getIntroAnimationTiming,
  mergePortfolioContent,
  getProjectPresentationTiming,
  getRoleAnimationTiming,
  portfolioDefaults,
  heroRoleAnimationOptions,
  projectPresentationOptions,
  introAnimationStyleOptions,
  journeyDesktopAnimationOptions,
  journeyMobileAnimationOptions,
  normaliseAdminPageOrder,
  normaliseSectionOrder,
  sectionControlDefinitions,
} from "../data/portfolioDefaults";
import { skillIconGroups, skillIconOptions } from "../data/skillIcons";

const ADMIN_CODE_KEY = "portfolio_admin_code";
const emptyLink = { label: "", url: "" };
const emptyProject = {
  title: "",
  about: "",
  link: "",
  gitlink: "",
  bgColor: "#0d4d3d",
  image: "",
  video: "",
};
const emptyStat = { label: "", value: "" };
const emptyJourney = { role: "", company: "", duration: "", description: "" };
const emptyTestimonial = { name: "", role: "", review: "", image: "" };
const emptySkill = {
  name: "New skill",
  category: "More Skills",
  icon: "code",
  iconUrl: "",
  description: "Describe what this skill represents.",
  usage: "Describe where this skill is used.",
};
const codingPlatformPages = [
  {
    id: "github",
    label: "GitHub",
    sectionKey: "githubSection",
    profileField: "githubProfile",
    profileLabel: "GitHub username or public profile URL",
    profilePlaceholder: "github.com/your-name",
    description: "Control the standalone GitHub page with repositories, public activity, languages, and project details.",
  },
  {
    id: "codeforces",
    label: "Codeforces",
    sectionKey: "codeforcesSection",
    profileField: "codeforcesProfile",
    profileLabel: "Codeforces handle or public profile URL",
    profilePlaceholder: "codeforces.com/profile/your-handle",
    description: "Control the standalone Codeforces page with rating history, contests, solved problems, tags, and activity.",
  },
  {
    id: "leetcode",
    label: "LeetCode",
    sectionKey: "leetcodeSection",
    profileField: "leetcodeProfile",
    profileLabel: "LeetCode username or public profile URL",
    profilePlaceholder: "leetcode.com/u/your-name",
    description: "Control the standalone LeetCode page with difficulty progress, languages, topic strengths, badges, and recent solutions.",
  },
];
const adminPages = [
  { id: "identity", label: "Identity", sectionId: "home" },
  { id: "intro", label: "Opening" },
  { id: "theme", label: "Theme" },
  { id: "display", label: "Display" },
  { id: "about", label: "About", sectionId: "about" },
  { id: "skills", label: "Skills", sectionId: "skills" },
  { id: "skillSpace", label: "Skill Space", sectionId: "skillSpace" },
  { id: "projects", label: "Projects", sectionId: "projects" },
  { id: "journey", label: "Journey", sectionId: "journey" },
  { id: "github", label: "GitHub", sectionId: "github" },
  { id: "codeforces", label: "Codeforces", sectionId: "codeforces" },
  { id: "leetcode", label: "LeetCode", sectionId: "leetcode" },
  { id: "testimonials", label: "Testimonials", sectionId: "testimonials" },
  { id: "contact", label: "Contact & Links", sectionId: "contact" },
];
const adminPageById = Object.fromEntries(adminPages.map((page) => [page.id, page]));

function moveOrderItem(order, sourceId, targetId) {
  const sourceIndex = order.indexOf(sourceId);
  const targetIndex = order.indexOf(targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return order;

  const nextOrder = [...order];
  nextOrder.splice(sourceIndex, 1);
  nextOrder.splice(sourceIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, sourceId);
  return nextOrder;
}

function publicOrderFromAdminPages(adminPageOrder, currentSectionOrder) {
  const orderedSections = adminPageOrder
    .map((pageId) => adminPageById[pageId]?.sectionId)
    .filter(Boolean);
  const remainingSections = normaliseSectionOrder(currentSectionOrder)
    .filter((sectionId) => !orderedSections.includes(sectionId));

  return normaliseSectionOrder([...orderedSections, ...remainingSections]);
}

function asForm(data) {
  return mergePortfolioContent(data);
}

function commaList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Admin() {
  const [code, setCode] = useState("");
  const [adminCode, setAdminCode] = useState(
    () => sessionStorage.getItem(ADMIN_CODE_KEY) || ""
  );
  const [form, setForm] = useState(portfolioDefaults);
  const [roleText, setRoleText] = useState("");
  const [introGreetingText, setIntroGreetingText] = useState("");
  const [activePage, setActivePage] = useState("identity");
  const [previewIntro, setPreviewIntro] = useState(false);
  const [journeyEditorView, setJourneyEditorView] = useState("desktop");
  const [refreshingCodingProgress, setRefreshingCodingProgress] = useState(false);
  const [draggedPageId, setDraggedPageId] = useState("");
  const [dropTargetPageId, setDropTargetPageId] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const adminPageRailRef = useRef(null);

  const isAllowed = Boolean(adminCode);
  const orderedAdminPages = useMemo(
    () => normaliseAdminPageOrder(form.adminPageOrder)
      .map((pageId) => adminPageById[pageId])
      .filter(Boolean),
    [form.adminPageOrder]
  );
  const roleAnimationTiming = getRoleAnimationTiming(form.homeSection);
  const introAnimationTiming = getIntroAnimationTiming(form.introAnimation);
  const introAnimationColors = getIntroAnimationColors(form.introAnimation);
  const projectPresentationTiming = getProjectPresentationTiming(form.projectsSection);

  useEffect(() => {
    if (!isAllowed) return;

    const loadContent = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/portfolio");
        if (!response.ok) {
          const responseBody = await response.json().catch(() => null);
          throw new Error(responseBody?.message || "Could not load portfolio content");
        }

        const nextForm = asForm(await response.json());
        setForm(nextForm);
        setRoleText(nextForm.roles.join(", "));
        setIntroGreetingText(nextForm.introAnimation.greetings.join(", "));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isAllowed]);

  useEffect(() => {
    const pageRail = adminPageRailRef.current;
    if (!pageRail) return undefined;

    const handleWheel = (event) => {
      if (event.ctrlKey || pageRail.scrollWidth <= pageRail.clientWidth) return;

      const scrollDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

      if (!scrollDelta) return;

      event.preventDefault();
      pageRail.scrollLeft += scrollDelta;
    };

    pageRail.addEventListener("wheel", handleWheel, { passive: false });
    return () => pageRail.removeEventListener("wheel", handleWheel);
  }, [isAllowed]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "x-admin-code": code },
      });

      if (!response.ok) throw new Error("Wrong admin code");

      sessionStorage.setItem(ADMIN_CODE_KEY, code);
      setAdminCode(code);
      setCode("");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_CODE_KEY);
    setAdminCode("");
    setCode("");
    setStatus("");
    setError("");
    setPreviewIntro(false);
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateGroup = (group, field, value) => {
    setForm((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }));
  };

  const updateRoleAnimation = (roleAnimation) => {
    setForm((current) => {
      const homeSection = current.homeSection || {};
      const timing = getRoleAnimationTiming({ ...homeSection, roleAnimation });

      return {
        ...current,
        homeSection: {
          ...homeSection,
          roleAnimation,
          roleAnimationSpeed: timing.speed,
          roleAnimationPause: timing.pause,
          roleAnimationTimings: {
            ...(homeSection.roleAnimationTimings || {}),
            [roleAnimation]: timing,
          },
        },
      };
    });
  };

  const updateRoleAnimationTiming = (field, value) => {
    setForm((current) => {
      const homeSection = current.homeSection || {};
      const timing = {
        ...getRoleAnimationTiming(homeSection),
        [field]: value,
      };

      return {
        ...current,
        homeSection: {
          ...homeSection,
          roleAnimationSpeed: timing.speed,
          roleAnimationPause: timing.pause,
          roleAnimationTimings: {
            ...(homeSection.roleAnimationTimings || {}),
            [homeSection.roleAnimation]: timing,
          },
        },
      };
    });
  };

  const updateIntroStyle = (style) => {
    setForm((current) => {
      const introAnimation = current.introAnimation || {};
      const timing = getIntroAnimationTiming({ ...introAnimation, style });
      const colors = getIntroAnimationColors({ ...introAnimation, style });

      return {
        ...current,
        introAnimation: {
          ...introAnimation,
          style,
          ...timing,
          ...colors,
          styleTimings: {
            ...(introAnimation.styleTimings || {}),
            [style]: timing,
          },
          styleColors: {
            ...(introAnimation.styleColors || {}),
            [style]: colors,
          },
        },
      };
    });
  };

  const updateIntroStyleTiming = (field, value) => {
    setForm((current) => {
      const introAnimation = current.introAnimation || {};
      const timing = {
        ...getIntroAnimationTiming(introAnimation),
        [field]: value,
      };

      return {
        ...current,
        introAnimation: {
          ...introAnimation,
          ...timing,
          styleTimings: {
            ...(introAnimation.styleTimings || {}),
            [introAnimation.style]: timing,
          },
        },
      };
    });
  };

  const updateIntroStyleColor = (field, value) => {
    setForm((current) => {
      const introAnimation = current.introAnimation || {};
      const colors = {
        ...getIntroAnimationColors(introAnimation),
        [field]: value,
      };

      return {
        ...current,
        introAnimation: {
          ...introAnimation,
          ...colors,
          styleColors: {
            ...(introAnimation.styleColors || {}),
            [introAnimation.style]: colors,
          },
        },
      };
    });
  };

  const updateProjectPresentation = (presentation) => {
    setForm((current) => {
      const projectsSection = current.projectsSection || {};
      const timing = getProjectPresentationTiming({ ...projectsSection, presentation });

      return {
        ...current,
        projectsSection: {
          ...projectsSection,
          presentation,
          transitionDuration: timing.duration,
          presentationTimings: {
            ...(projectsSection.presentationTimings || {}),
            [presentation]: timing,
          },
        },
      };
    });
  };

  const updateProjectPresentationTiming = (duration) => {
    setForm((current) => {
      const projectsSection = current.projectsSection || {};
      const timing = {
        ...getProjectPresentationTiming(projectsSection),
        duration,
      };

      return {
        ...current,
        projectsSection: {
          ...projectsSection,
          transitionDuration: timing.duration,
          presentationTimings: {
            ...(projectsSection.presentationTimings || {}),
            [projectsSection.presentation]: timing,
          },
        },
      };
    });
  };

  const updateSectionSetting = (section, field, value) => {
    setForm((current) => ({
      ...current,
      sectionSettings: {
        ...current.sectionSettings,
        [section]: {
          ...current.sectionSettings?.[section],
          [field]: value,
        },
      },
    }));
  };

  const reorderAdminPages = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setForm((current) => {
      const nextAdminPageOrder = moveOrderItem(
        normaliseAdminPageOrder(current.adminPageOrder),
        sourceId,
        targetId
      );

      return {
        ...current,
        adminPageOrder: nextAdminPageOrder,
        sectionOrder: publicOrderFromAdminPages(nextAdminPageOrder, current.sectionOrder),
      };
    });
    setError("");
    setStatus("Section order changed. Save All Changes to publish it on the website.");
  };

  const handleTabDragStart = (event, pageId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", pageId);
    setDraggedPageId(pageId);
  };

  const handleTabDrop = (event, targetPageId) => {
    event.preventDefault();
    const sourcePageId = event.dataTransfer.getData("text/plain") || draggedPageId;
    reorderAdminPages(sourcePageId, targetPageId);
    setDraggedPageId("");
    setDropTargetPageId("");
  };

  const handleTabKeyDown = (event, pageId) => {
    if (!event.altKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

    const currentIndex = orderedAdminPages.findIndex((page) => page.id === pageId);
    const targetIndex = event.key === "ArrowLeft" ? currentIndex - 1 : currentIndex + 1;
    const targetPage = orderedAdminPages[targetIndex];
    if (!targetPage) return;

    event.preventDefault();
    setForm((current) => {
      const nextAdminPageOrder = normaliseAdminPageOrder(current.adminPageOrder);
      const sourceIndex = nextAdminPageOrder.indexOf(pageId);
      const destinationIndex = nextAdminPageOrder.indexOf(targetPage.id);
      [nextAdminPageOrder[sourceIndex], nextAdminPageOrder[destinationIndex]] = [
        nextAdminPageOrder[destinationIndex],
        nextAdminPageOrder[sourceIndex],
      ];

      return {
        ...current,
        adminPageOrder: nextAdminPageOrder,
        sectionOrder: publicOrderFromAdminPages(nextAdminPageOrder, current.sectionOrder),
      };
    });
    setError("");
    setStatus("Section order changed. Save All Changes to publish it on the website.");
  };

  const updateArrayItem = (field, index, key, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addArrayItem = (field, item) => {
    setForm((current) => ({ ...current, [field]: [...current[field], item] }));
  };

  const removeArrayItem = (field, index) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const payload = {
        ...form,
        roles: commaList(roleText),
        introAnimation: {
          ...form.introAnimation,
          greetings: commaList(introGreetingText),
        },
      };
      const response = await fetch("/api/portfolio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-code": adminCode,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save. Check the server connection and admin code.");
      }

      const nextForm = asForm(await response.json());
      setForm(nextForm);
      setRoleText(nextForm.roles.join(", "));
      setIntroGreetingText(nextForm.introAnimation.greetings.join(", "));
      setStatus("Saved to MongoDB. Portfolio content updates automatically; opening-animation changes apply on the next page load.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodingProgressRefresh = async () => {
    setRefreshingCodingProgress(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/admin/coding-progress/refresh", {
        method: "POST",
        headers: { "x-admin-code": adminCode },
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.message || "Could not refresh coding progress");

      const readyPlatforms = Object.values(result.platforms || {})
        .filter((platform) => platform?.status === "ready")
        .map((platform) => platform.provider);

      if (!result.hasConfiguredProfiles) {
        setStatus("Add at least one public username or profile URL, save it, then refresh the live data.");
      } else if (readyPlatforms.length > 0) {
        setStatus(`Coding Progress refreshed: ${readyPlatforms.join(", ")}.`);
      } else {
        setStatus("The saved profiles could not return public data yet. Check the handles and try again later.");
      }
    } catch (refreshError) {
      setError(refreshError.message || "Could not refresh coding progress");
    } finally {
      setRefreshingCodingProgress(false);
    }
  };

  const previewContent = {
    ...form,
    introAnimation: {
      ...form.introAnimation,
      enabled: true,
      greetings: commaList(introGreetingText),
    },
  };

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-[#080b10] px-6 py-10 text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#1cd8d2]">Portfolio control</p>
          <h1 className="mt-3 text-3xl font-bold">Admin</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Enter the admin code configured on the server to edit the portfolio.
          </p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#1cd8d2]"
              placeholder="Admin code"
              aria-label="Admin code"
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:opacity-60"
            >
              {loading ? "Checking..." : "Open Admin"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-7 text-white sm:px-6 sm:py-10">
      <form onSubmit={handleSave} className="mx-auto max-w-6xl">
        <div className="sticky top-3 z-20 flex flex-col gap-4 border-b border-white/10 bg-[#080b10]/95 pb-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#1cd8d2]">MongoDB content manager</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white hover:text-black">
              View Site
            </a>
            <button type="button" onClick={handleLogout} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white hover:text-black">
              Logout
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-[#1cd8d2] px-5 py-2 text-sm font-semibold text-black transition hover:bg-white disabled:opacity-60">
              {loading ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {error && <p className="mt-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        {status && <p className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{status}</p>}

        <nav ref={adminPageRailRef} aria-label="Admin pages" role="tablist" className="mt-6 flex max-w-full gap-2 overflow-x-auto border-b border-white/10 pb-4 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5">
          {orderedAdminPages.map((page) => {
            const isActive = activePage === page.id;
            const isDropTarget = dropTargetPageId === page.id && draggedPageId !== page.id;

            return (
              <button
                key={page.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-grabbed={draggedPageId === page.id}
                aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                draggable
                title={page.sectionId ? "Drag to reorder this page and its public website section" : "Drag to reorder this Admin page"}
                onClick={() => setActivePage(page.id)}
                onKeyDown={(event) => handleTabKeyDown(event, page.id)}
                onDragStart={(event) => handleTabDragStart(event, page.id)}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDragEnter={() => setDropTargetPageId(page.id)}
                onDrop={(event) => handleTabDrop(event, page.id)}
                onDragEnd={() => {
                  setDraggedPageId("");
                  setDropTargetPageId("");
                }}
                className={`flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-center text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#1cd8d2] text-black"
                    : "border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                } ${isDropTarget ? "ring-2 ring-[#1cd8d2] ring-offset-2 ring-offset-[#080b10]" : ""}`}
              >
                <LuGripVertical className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                {page.label}
              </button>
            );
          })}
        </nav>

        <div role="tabpanel" aria-label={`${adminPages.find((page) => page.id === activePage)?.label || "Admin"} settings`} className="mt-6 min-w-0">
            {activePage === "display" && (
              <Panel title="Section Display" description="Choose which sections appear on the public site and whether each uses saved Admin content or the built-in portfolio content.">
                <div className="grid gap-3">
                  {sectionControlDefinitions.map((section) => (
                    <SectionDisplayControls
                      key={section.id}
                      sectionId={section.id}
                      sectionSettings={form.sectionSettings}
                      onChange={updateSectionSetting}
                    />
                  ))}
                </div>
              </Panel>
            )}

            {activePage === "identity" && (
              <Panel title="Identity and Navigation" description="Controls the public name, hero labels, navigation call-to-action, and home buttons.">
            <SectionDisplayControls sectionId="home" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Name" value={form.name} onChange={(value) => updateField("name", value)} />
              <TextInput label="Headline" value={form.headline} onChange={(value) => updateField("headline", value)} />
              <TextInput label="Navigation button label" value={form.navigation.contactLabel} onChange={(value) => updateGroup("navigation", "contactLabel", value)} />
              <TextInput label="Navigation button link" value={form.navigation.contactHref} onChange={(value) => updateGroup("navigation", "contactHref", value)} />
              <TextInput label="Home greeting" value={form.homeButtons.greeting} onChange={(value) => updateGroup("homeButtons", "greeting", value)} />
              <TextInput label="Home project button" value={form.homeButtons.projectsLabel} onChange={(value) => updateGroup("homeButtons", "projectsLabel", value)} />
              <TextInput label="Home resume button" value={form.homeButtons.resumeLabel} onChange={(value) => updateGroup("homeButtons", "resumeLabel", value)} />
            </div>
            <TextArea label="Rotating roles, separated by commas" value={roleText} onChange={setRoleText} rows={2} />
            <div className="grid gap-4 md:grid-cols-3">
              <SelectInput
                label="Role text effect"
                value={form.homeSection.roleAnimation}
                onChange={updateRoleAnimation}
                options={heroRoleAnimationOptions}
              />
              <NumberInput
                label="Effect speed (ms)"
                value={roleAnimationTiming.speed}
                min={45}
                max={360}
                step={5}
                onChange={(value) => updateRoleAnimationTiming("speed", value)}
              />
              <NumberInput
                label="Role pause (ms)"
                value={roleAnimationTiming.pause}
                min={550}
                max={6000}
                step={50}
                onChange={(value) => updateRoleAnimationTiming("pause", value)}
              />
            </div>
            <TextArea label="Home introduction paragraph" value={form.about} onChange={(value) => updateField("about", value)} />
              </Panel>
            )}

            {activePage === "intro" && (
              <Panel title="Opening Animation" description="Control the first screen visitors see: its text, initials, colour treatment, timing, and transition style.">
            <SectionDisplayControls sectionId="intro" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
            <div className="grid gap-4 md:grid-cols-3">
              <ToggleInput label="Show opening animation" checked={form.introAnimation.enabled} onChange={(value) => updateGroup("introAnimation", "enabled", value)} />
              <SelectInput
                label="Transition style"
                value={form.introAnimation.style}
                onChange={updateIntroStyle}
                options={introAnimationStyleOptions}
              />
              <ToggleInput label="Show greeting words" checked={form.introAnimation.showGreeting} onChange={(value) => updateGroup("introAnimation", "showGreeting", value)} />
            </div>
            <TextArea label="Greeting words, separated by commas" value={introGreetingText} onChange={setIntroGreetingText} rows={2} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <TextInput label="First name" value={form.introAnimation.firstName} onChange={(value) => updateGroup("introAnimation", "firstName", value)} />
              <TextInput label="Last name" value={form.introAnimation.lastName} onChange={(value) => updateGroup("introAnimation", "lastName", value)} />
              <TextInput label="Final initials" value={form.introAnimation.initials} onChange={(value) => updateGroup("introAnimation", "initials", value.toUpperCase())} />
              <TextInput label="Caption below the name" value={form.introAnimation.caption} onChange={(value) => updateGroup("introAnimation", "caption", value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorInput label="Intro background (selected style)" value={introAnimationColors.backgroundColor} onChange={(value) => updateIntroStyleColor("backgroundColor", value)} />
              <ColorInput label="First initial colour (selected style)" value={introAnimationColors.primaryColor} onChange={(value) => updateIntroStyleColor("primaryColor", value)} />
              <ColorInput label="Second initial colour (selected style)" value={introAnimationColors.secondaryColor} onChange={(value) => updateIntroStyleColor("secondaryColor", value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NumberInput label="Greeting duration (ms)" value={introAnimationTiming.greetingDuration} min={180} max={1600} step={20} onChange={(value) => updateIntroStyleTiming("greetingDuration", value)} />
              <NumberInput label="Name hold (ms)" value={introAnimationTiming.nameDuration} min={600} max={5000} step={50} onChange={(value) => updateIntroStyleTiming("nameDuration", value)} />
              <NumberInput label="Transformation duration (ms)" value={introAnimationTiming.mergeDuration} min={500} max={5000} step={50} onChange={(value) => updateIntroStyleTiming("mergeDuration", value)} />
              <NumberInput label="Initials hold (ms)" value={introAnimationTiming.finalDuration} min={400} max={4000} step={50} onChange={(value) => updateIntroStyleTiming("finalDuration", value)} />
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={() => setPreviewIntro(true)} className="rounded-lg border border-[#1cd8d2]/50 px-4 py-2.5 text-sm font-semibold text-[#9cf5ee] transition hover:bg-[#1cd8d2] hover:text-black">
                Preview animation
              </button>
              <p className="text-sm text-gray-400">Preview uses these current settings before you save them.</p>
            </div>
              </Panel>
            )}

            {activePage === "theme" && (
              <Panel title="Theme and Images" description="Set the main site colours and choose an image from your device or use a public image URL.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ColorInput label="Page background" value={form.theme.background} onChange={(value) => updateGroup("theme", "background", value)} />
              <ColorInput label="Section surface" value={form.theme.surface} onChange={(value) => updateGroup("theme", "surface", value)} />
              <ColorInput label="Primary accent" value={form.theme.accent} onChange={(value) => updateGroup("theme", "accent", value)} />
              <ColorInput label="Secondary accent" value={form.theme.secondary} onChange={(value) => updateGroup("theme", "secondary", value)} />
              <ColorInput label="Deep accent" value={form.theme.deepAccent} onChange={(value) => updateGroup("theme", "deepAccent", value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorInput label="Home gradient start" value={form.homeSection.accentStart} onChange={(value) => updateGroup("homeSection", "accentStart", value)} />
              <ColorInput label="Home gradient middle" value={form.homeSection.accentMiddle} onChange={(value) => updateGroup("homeSection", "accentMiddle", value)} />
              <ColorInput label="Home gradient end" value={form.homeSection.accentEnd} onChange={(value) => updateGroup("homeSection", "accentEnd", value)} />
              <ColorInput label="Avatar glow start" value={form.homeSection.avatarStart} onChange={(value) => updateGroup("homeSection", "avatarStart", value)} />
              <ColorInput label="Avatar glow middle" value={form.homeSection.avatarMiddle} onChange={(value) => updateGroup("homeSection", "avatarMiddle", value)} />
              <ColorInput label="Avatar glow end" value={form.homeSection.avatarEnd} onChange={(value) => updateGroup("homeSection", "avatarEnd", value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <UploadUrlInput label="Logo image" value={form.media.logoUrl} onChange={(value) => updateGroup("media", "logoUrl", value)} adminCode={adminCode} kind="image" />
              <UploadUrlInput label="Home avatar" value={form.media.homeAvatarUrl} onChange={(value) => updateGroup("media", "homeAvatarUrl", value)} adminCode={adminCode} kind="image" />
              <UploadUrlInput label="About profile image" value={form.media.aboutProfileUrl} onChange={(value) => updateGroup("media", "aboutProfileUrl", value)} adminCode={adminCode} kind="image" />
              <UploadUrlInput label="Contact illustration" value={form.media.contactImageUrl} onChange={(value) => updateGroup("media", "contactImageUrl", value)} adminCode={adminCode} kind="image" />
            </div>
              </Panel>
            )}

            {activePage === "about" && (
              <Panel title="About" description="Edit the About paragraphs, stats, and achievements shown under the profile.">
            <SectionDisplayControls sectionId="about" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
            <TextArea label="Short about text" value={form.aboutShort} onChange={(value) => updateField("aboutShort", value)} />
            <TextArea label="Long about text" value={form.aboutLong} onChange={(value) => updateField("aboutLong", value)} />
            <TextArea label="Second about paragraph" value={form.aboutExtra} onChange={(value) => updateField("aboutExtra", value)} />
            <TextArea label="Third about paragraph" value={form.aboutFinal} onChange={(value) => updateField("aboutFinal", value)} />
            <div className="grid gap-4 md:grid-cols-3">
              <TextInput label="About heading" value={form.aboutSection.title} onChange={(value) => updateGroup("aboutSection", "title", value)} />
              <TextInput label="About project button" value={form.aboutSection.projectsButtonLabel} onChange={(value) => updateGroup("aboutSection", "projectsButtonLabel", value)} />
              <TextInput label="About contact button" value={form.aboutSection.contactButtonLabel} onChange={(value) => updateGroup("aboutSection", "contactButtonLabel", value)} />
            </div>
            <Repeater title="About stats">
              {form.aboutStats.map((stat, index) => (
                <div key={`stat-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_2fr_auto]">
                  <TextInput label="Label" value={stat.label} onChange={(value) => updateArrayItem("aboutStats", index, "label", value)} />
                  <TextInput label="Value" value={stat.value} onChange={(value) => updateArrayItem("aboutStats", index, "value", value)} />
                  <RemoveButton onClick={() => removeArrayItem("aboutStats", index)} />
                </div>
              ))}
              <AddButton onClick={() => addArrayItem("aboutStats", emptyStat)}>Add Stat</AddButton>
            </Repeater>
            <Repeater title="Achievements">
              {form.achievements.map((achievement, index) => (
                <div key={`achievement-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_2fr_auto]">
                  <TextInput label="Label" value={achievement.label} onChange={(value) => updateArrayItem("achievements", index, "label", value)} />
                  <TextInput label="Value" value={achievement.value} onChange={(value) => updateArrayItem("achievements", index, "value", value)} />
                  <RemoveButton onClick={() => removeArrayItem("achievements", index)} />
                </div>
              ))}
              <AddButton onClick={() => addArrayItem("achievements", emptyStat)}>Add Achievement</AddButton>
            </Repeater>
              </Panel>
            )}

            {activePage === "skills" && (
              <Panel title="Skills Grid" description="This page controls only the regular Skills section. Every card can have its own category, icon, description, and custom icon image URL.">
                <SectionDisplayControls sectionId="skills" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <TextInput label="Skills eyebrow" value={form.skillsSection.eyebrow} onChange={(value) => updateGroup("skillsSection", "eyebrow", value)} />
                  <TextInput label="Skills title" value={form.skillsSection.title} onChange={(value) => updateGroup("skillsSection", "title", value)} />
                  <ColorInput label="Skills accent colour" value={form.skillsSection.accentColor} onChange={(value) => updateGroup("skillsSection", "accentColor", value)} />
                  <SelectInput
                    label="Card entrance animation"
                    value={form.skillsSection.animation}
                    onChange={(value) => updateGroup("skillsSection", "animation", value)}
                    options={[
                      { value: "stagger", label: "Staggered rise" },
                      { value: "lift", label: "Lift in" },
                      { value: "flip", label: "Soft flip" },
                      { value: "scale", label: "Scale in" },
                      { value: "glow", label: "Glow in" },
                    ]}
                  />
                </div>
                <TextArea label="Skills description" value={form.skillsSection.description} onChange={(value) => updateGroup("skillsSection", "description", value)} rows={2} />
                <Repeater title="Skills grid cards">
                  {form.skillCards.map((skill, index) => (
                    <SkillItemEditor
                      key={`skill-card-${index}`}
                      item={skill}
                      index={index}
                      field="skillCards"
                      updateArrayItem={updateArrayItem}
                      removeArrayItem={removeArrayItem}
                      adminCode={adminCode}
                    />
                  ))}
                  <AddButton onClick={() => addArrayItem("skillCards", { ...emptySkill })}>Add Skill Card</AddButton>
                </Repeater>
              </Panel>
            )}

            {activePage === "skillSpace" && (
              <Panel title="Skill Space" description="This page is independent from the Skills grid. It controls the desktop UFO hold-to-catch interaction, the floating skill balls, and the detail card shown while a visitor is holding a captured skill.">
                <SectionDisplayControls sectionId="skillSpace" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <TextInput label="Skill Space eyebrow" value={form.skillsSpaceSection.eyebrow} onChange={(value) => updateGroup("skillsSpaceSection", "eyebrow", value)} />
                  <TextInput label="Skill Space title" value={form.skillsSpaceSection.title} onChange={(value) => updateGroup("skillsSpaceSection", "title", value)} />
                  <ColorInput label="Beam accent colour" value={form.skillsSpaceSection.accentColor} onChange={(value) => updateGroup("skillsSpaceSection", "accentColor", value)} />
                  <ColorInput label="Orbit accent colour" value={form.skillsSpaceSection.secondaryColor} onChange={(value) => updateGroup("skillsSpaceSection", "secondaryColor", value)} />
                </div>
                <TextArea label="Skill Space description" value={form.skillsSpaceSection.description} onChange={(value) => updateGroup("skillsSpaceSection", "description", value)} rows={2} />
                <TextInput label="Interaction hint" value={form.skillsSpaceSection.interactionHint} onChange={(value) => updateGroup("skillsSpaceSection", "interactionHint", value)} />

                <div className="grid gap-4 border-y border-white/10 py-5 md:grid-cols-2 lg:grid-cols-4">
                  <SelectInput
                    label="Floating-ball animation"
                    value={form.skillsSpaceSection.ballAnimation}
                    onChange={(value) => updateGroup("skillsSpaceSection", "ballAnimation", value)}
                    options={[
                      { value: "drift", label: "Free drift" },
                      { value: "orbit", label: "Gentle orbit" },
                      { value: "pulse", label: "Pulsing field" },
                      { value: "float", label: "Slow float" },
                    ]}
                  />
                  <SelectInput
                    label="Skill dialog animation"
                    value={form.skillsSpaceSection.dialogAnimation}
                    onChange={(value) => updateGroup("skillsSpaceSection", "dialogAnimation", value)}
                    options={[
                      { value: "spring", label: "Spring open" },
                      { value: "scale", label: "Scale open" },
                      { value: "slide", label: "Slide up" },
                      { value: "fade", label: "Soft fade" },
                    ]}
                  />
                  <NumberInput label="Ball size (px)" value={form.skillsSpaceSection.ballSize} min={48} max={104} onChange={(value) => updateGroup("skillsSpaceSection", "ballSize", value)} />
                  <ToggleInput label="Show stars" checked={form.skillsSpaceSection.showStars} onChange={(value) => updateGroup("skillsSpaceSection", "showStars", value)} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <TextInput label="Dialog eyebrow" value={form.skillsSpaceSection.dialogEyebrow} onChange={(value) => updateGroup("skillsSpaceSection", "dialogEyebrow", value)} />
                  <TextInput label="Description label" value={form.skillsSpaceSection.dialogDescriptionLabel} onChange={(value) => updateGroup("skillsSpaceSection", "dialogDescriptionLabel", value)} />
                  <TextInput label="Usage label" value={form.skillsSpaceSection.dialogUsageLabel} onChange={(value) => updateGroup("skillsSpaceSection", "dialogUsageLabel", value)} />
                  <div className="md:col-span-2"><TextArea label="Fallback text when a skill has no usage" value={form.skillsSpaceSection.emptyUsageText} onChange={(value) => updateGroup("skillsSpaceSection", "emptyUsageText", value)} rows={2} /></div>
                </div>

                <Repeater title="Floating skill balls and dialog content">
                  {form.spaceSkills.map((skill, index) => (
                    <SkillItemEditor
                      key={`space-skill-${index}`}
                      item={skill}
                      index={index}
                      field="spaceSkills"
                      updateArrayItem={updateArrayItem}
                      removeArrayItem={removeArrayItem}
                      adminCode={adminCode}
                    />
                  ))}
                  <AddButton onClick={() => addArrayItem("spaceSkills", { ...emptySkill })}>Add Floating Skill</AddButton>
                </Repeater>
              </Panel>
            )}

            {activePage === "projects" && (
              <Panel title="Projects" description="Add as many projects as you want. Choose an image from your device or use an image URL to override the built-in desktop and mobile image.">
            <SectionDisplayControls sectionId="projects" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <TextInput label="Projects heading" value={form.projectsSection.title} onChange={(value) => updateGroup("projectsSection", "title", value)} />
              <TextInput label="Project button label" value={form.projectsSection.projectButtonLabel} onChange={(value) => updateGroup("projectsSection", "projectButtonLabel", value)} />
              <TextInput label="Second button label" value={form.projectsSection.contactButtonLabel} onChange={(value) => updateGroup("projectsSection", "contactButtonLabel", value)} />
              <SelectInput
                label="Project presentation"
                value={form.projectsSection.presentation}
                onChange={updateProjectPresentation}
                options={projectPresentationOptions}
              />
              <NumberInput
                label="Transition duration (ms)"
                value={projectPresentationTiming.duration}
                min={250}
                max={1600}
                step={50}
                onChange={updateProjectPresentationTiming}
              />
            </div>
            <Repeater title="Project list">
              {form.projects.map((project, index) => (
                <div key={`project-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-2">
                  <TextInput label="Title" value={project.title} onChange={(value) => updateArrayItem("projects", index, "title", value)} />
                  <ColorInput label="Project background colour" value={project.bgColor} onChange={(value) => updateArrayItem("projects", index, "bgColor", value)} />
                  <TextInput label="Project URL" value={project.link} onChange={(value) => updateArrayItem("projects", index, "link", value)} placeholder="https://..." />
                  <TextInput label="Second button URL" value={project.gitlink} onChange={(value) => updateArrayItem("projects", index, "gitlink", value)} placeholder="https://..." />
                  <UploadUrlInput label="Project image" value={project.image || ""} onChange={(value) => updateArrayItem("projects", index, "image", value)} adminCode={adminCode} kind="image" />
                  <TextInput label="Video embed URL" value={project.video || ""} onChange={(value) => updateArrayItem("projects", index, "video", value)} placeholder="https://www.youtube.com/embed/..." />
                  <div className="md:col-span-2"><TextArea label="Project description" value={project.about} onChange={(value) => updateArrayItem("projects", index, "about", value)} rows={3} /></div>
                  <RemoveButton onClick={() => removeArrayItem("projects", index)} />
                </div>
              ))}
              <AddButton onClick={() => addArrayItem("projects", emptyProject)}>Add Project</AddButton>
            </Repeater>
              </Panel>
            )}

            {activePage === "journey" && (
              <Panel title="Journey" description="Configure the public timeline independently for laptop and mobile, then edit the milestones below.">
                <SectionDisplayControls sectionId="journey" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <TextInput label="Journey eyebrow" value={form.journeySection.eyebrow} onChange={(value) => updateGroup("journeySection", "eyebrow", value)} />
                  <TextInput label="Journey heading" value={form.journeySection.title} onChange={(value) => updateGroup("journeySection", "title", value)} />
                  <ColorInput label="Journey accent colour" value={form.journeySection.accentColor} onChange={(value) => updateGroup("journeySection", "accentColor", value)} />
                  <ColorInput label="Journey card colour" value={form.journeySection.cardColor} onChange={(value) => updateGroup("journeySection", "cardColor", value)} />
                </div>

                <ToggleInput label="Show journey card numbers" checked={form.journeySection.showCardNumber} onChange={(value) => updateGroup("journeySection", "showCardNumber", value)} />

                <div className="flex flex-wrap items-center gap-3 border-y border-white/10 py-4">
                  <span className="text-sm font-semibold text-gray-200">Edit view</span>
                  <button
                    type="button"
                    aria-pressed={journeyEditorView === "desktop"}
                    onClick={() => setJourneyEditorView("desktop")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition ${journeyEditorView === "desktop" ? "bg-[#1cd8d2] text-black" : "border border-white/15 text-gray-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    Laptop view
                  </button>
                  <button
                    type="button"
                    aria-pressed={journeyEditorView === "mobile"}
                    onClick={() => setJourneyEditorView("mobile")}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition ${journeyEditorView === "mobile" ? "bg-[#1cd8d2] text-black" : "border border-white/15 text-gray-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    Mobile view
                  </button>
                </div>

                {journeyEditorView === "desktop" ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <SelectInput
                      label="Desktop layout"
                      value={form.journeySection.desktopLayout}
                      onChange={(value) => updateGroup("journeySection", "desktopLayout", value)}
                      options={[
                        { value: "rail", label: "Flowing rail" },
                        { value: "spotlight", label: "Center spotlight" },
                      ]}
                    />
                    <SelectInput
                      label="Desktop scroll animation"
                      value={form.journeySection.desktopAnimation}
                      onChange={(value) => updateGroup("journeySection", "desktopAnimation", value)}
                      options={journeyDesktopAnimationOptions}
                    />
                    <NumberInput label="Visible desktop cards" value={form.journeySection.desktopVisibleCards} min={2} max={4} onChange={(value) => updateGroup("journeySection", "desktopVisibleCards", value)} />
                    <NumberInput label="Desktop scroll per card (vh)" value={form.journeySection.desktopScrollVh} min={20} max={100} onChange={(value) => updateGroup("journeySection", "desktopScrollVh", value)} />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <SelectInput
                      label="Mobile layout"
                      value={form.journeySection.mobileLayout}
                      onChange={(value) => updateGroup("journeySection", "mobileLayout", value)}
                      options={[
                        { value: "timeline", label: "Guided timeline" },
                        { value: "stack", label: "Card stack" },
                      ]}
                    />
                    <SelectInput
                      label="Mobile card animation"
                      value={form.journeySection.mobileAnimation}
                      onChange={(value) => updateGroup("journeySection", "mobileAnimation", value)}
                      options={journeyMobileAnimationOptions}
                    />
                    <NumberInput label="Mobile card gap (px)" value={form.journeySection.mobileCardGap} min={16} max={80} onChange={(value) => updateGroup("journeySection", "mobileCardGap", value)} />
                    <ToggleInput label="Show mobile progress line" checked={form.journeySection.showMobileProgress} onChange={(value) => updateGroup("journeySection", "showMobileProgress", value)} />
                  </div>
                )}

                <Repeater title="Journey cards">
                  {form.journeys.map((journey, index) => (
                    <div key={`journey-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-3">
                      <TextInput label="Role / milestone" value={journey.role} onChange={(value) => updateArrayItem("journeys", index, "role", value)} />
                      <TextInput label="Company / place" value={journey.company} onChange={(value) => updateArrayItem("journeys", index, "company", value)} />
                      <TextInput label="Date / duration" value={journey.duration} onChange={(value) => updateArrayItem("journeys", index, "duration", value)} />
                      <div className="md:col-span-3"><TextArea label="Description" value={journey.description} onChange={(value) => updateArrayItem("journeys", index, "description", value)} rows={3} /></div>
                      <RemoveButton onClick={() => removeArrayItem("journeys", index)} />
                    </div>
                  ))}
                  <AddButton onClick={() => addArrayItem("journeys", emptyJourney)}>Add Journey Card</AddButton>
                </Repeater>
              </Panel>
            )}

            {codingPlatformPages.some((platform) => platform.id === activePage) && (
              <CodingPlatformPanel
                platform={codingPlatformPages.find((platform) => platform.id === activePage)}
                form={form}
                updateGroup={updateGroup}
                updateSectionSetting={updateSectionSetting}
                handleRefresh={handleCodingProgressRefresh}
                refreshing={refreshingCodingProgress}
              />
            )}

            {activePage === "testimonials" && (
              <Panel title="Testimonials" description="Edit the section heading, quote text, role, and optional avatar image from your device or URL.">
            <SectionDisplayControls sectionId="testimonials" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
            <TextInput label="Testimonials heading" value={form.testimonialsSection.title} onChange={(value) => updateGroup("testimonialsSection", "title", value)} />
            <Repeater title="Testimonials">
              {form.testimonials.map((testimonial, index) => (
                <div key={`testimonial-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-2">
                  <TextInput label="Name" value={testimonial.name} onChange={(value) => updateArrayItem("testimonials", index, "name", value)} />
                  <TextInput label="Role" value={testimonial.role} onChange={(value) => updateArrayItem("testimonials", index, "role", value)} />
                  <UploadUrlInput label="Avatar image" value={testimonial.image || ""} onChange={(value) => updateArrayItem("testimonials", index, "image", value)} adminCode={adminCode} kind="image" />
                  <div className="md:col-span-2"><TextArea label="Review" value={testimonial.review} onChange={(value) => updateArrayItem("testimonials", index, "review", value)} rows={3} /></div>
                  <RemoveButton onClick={() => removeArrayItem("testimonials", index)} />
                </div>
              ))}
              <AddButton onClick={() => addArrayItem("testimonials", emptyTestimonial)}>Add Testimonial</AddButton>
            </Repeater>
              </Panel>
            )}

            {activePage === "contact" && (
              <Panel title="Contact, Footer, and Links" description="Manage the remaining public calls to action and social/resume links.">
            <div className="grid gap-3 lg:grid-cols-2">
              <SectionDisplayControls sectionId="contact" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
              <SectionDisplayControls sectionId="footer" sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Contact heading" value={form.contactSection.title} onChange={(value) => updateGroup("contactSection", "title", value)} />
              <TextInput label="Contact submit button" value={form.contactSection.submitLabel} onChange={(value) => updateGroup("contactSection", "submitLabel", value)} />
            </div>
            <TextArea label="Footer quote" value={form.footer.quote} onChange={(value) => updateGroup("footer", "quote", value)} rows={2} />
            <LinksPanel title="Social links" field="socials" links={form.socials} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} />
            <LinksPanel title="Resume links" field="resumeLinks" links={form.resumeLinks} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} adminCode={adminCode} allowPdfUpload />
              </Panel>
            )}
        </div>
      </form>
      {previewIntro && <IntroAnimation content={previewContent} preview onFinish={() => setPreviewIntro(false)} />}
    </main>
  );
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-400">{description}</p>}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

function CodingPlatformPanel({ platform, form, updateGroup, updateSectionSetting, handleRefresh, refreshing }) {
  const section = form[platform.sectionKey] || {};
  const isGitHub = platform.id === "github";

  return (
    <Panel title={`${platform.label} Progress`} description={platform.description}>
      <SectionDisplayControls sectionId={platform.id} sectionSettings={form.sectionSettings} onChange={updateSectionSetting} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TextInput label="Section eyebrow" value={section.eyebrow} onChange={(value) => updateGroup(platform.sectionKey, "eyebrow", value)} />
        <TextInput label="Section heading" value={section.title} onChange={(value) => updateGroup(platform.sectionKey, "title", value)} />
        <ColorInput label="Primary accent colour" value={section.accentColor} onChange={(value) => updateGroup(platform.sectionKey, "accentColor", value)} />
        <ColorInput label="Secondary accent colour" value={section.secondaryColor} onChange={(value) => updateGroup(platform.sectionKey, "secondaryColor", value)} />
      </div>
      <TextArea label="Section description" value={section.description} onChange={(value) => updateGroup(platform.sectionKey, "description", value)} rows={2} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput
          label={platform.profileLabel}
          value={form.codingProgressSection?.[platform.profileField]}
          onChange={(value) => updateGroup("codingProgressSection", platform.profileField, value)}
          placeholder={platform.profilePlaceholder}
        />
        <NumberInput
          label="Shared cache refresh interval (minutes)"
          value={form.codingProgressSection?.refreshMinutes}
          min={15}
          max={1440}
          step={15}
          onChange={(value) => updateGroup("codingProgressSection", "refreshMinutes", value)}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
        <p className="max-w-2xl text-sm leading-relaxed text-gray-400">
          Save this profile first. It only controls the {platform.label} section. The cache interval is shared by GitHub, Codeforces, and LeetCode.
          {isGitHub && <> Add <code className="text-[#9cf5ee]">GITHUB_TOKEN</code> to the server environment to include the full GitHub contribution calendar.</>}
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#1cd8d2]/45 px-4 py-2 text-sm font-semibold text-[#9cf5ee] transition hover:bg-[#1cd8d2] hover:text-black disabled:cursor-wait disabled:opacity-60"
        >
          <LuRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          {refreshing ? "Refreshing..." : "Refresh all live data"}
        </button>
      </div>
    </Panel>
  );
}

function SectionDisplayControls({ sectionId, sectionSettings, onChange }) {
  const definition = sectionControlDefinitions.find((section) => section.id === sectionId);
  const setting = sectionSettings?.[sectionId] || {};
  const enabled = setting.enabled !== false;
  const source = setting.source === "builtIn" ? "builtIn" : "admin";

  return (
    <div className="grid gap-4 rounded-lg border border-[#1cd8d2]/25 bg-[#1cd8d2]/[0.035] p-4 md:grid-cols-[minmax(9rem,1fr)_minmax(12rem,14rem)_minmax(12rem,14rem)] md:items-end">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7ceae0]">Public section</p>
        <h3 className="mt-1 text-base font-semibold text-white">{definition?.label || sectionId}</h3>
      </div>
      <ToggleInput
        label="Show on website"
        checked={enabled}
        onChange={(value) => onChange(sectionId, "enabled", value)}
      />
      <SelectInput
        label="Content source"
        value={source}
        onChange={(value) => onChange(sectionId, "source", value)}
        options={[
          { value: "admin", label: "Admin data" },
          { value: "builtIn", label: "Built-in data" },
        ]}
      />
    </div>
  );
}

function Repeater({ title, children }) {
  return (
    <div className="grid gap-3 border-t border-white/10 pt-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">{title}</h3>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 rounded-lg border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none placeholder:text-gray-600 focus:border-[#1cd8d2]" />
    </label>
  );
}

function UploadUrlInput({ label, value, onChange, adminCode, kind }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const isPdf = kind === "pdf";
  const fileLabel = isPdf ? "PDF" : "image";

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const payload = new FormData();
      payload.append("file", file);

      const response = await fetch(`/api/admin/upload?kind=${encodeURIComponent(kind)}`, {
        method: "POST",
        headers: { "x-admin-code": adminCode },
        body: payload,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.url) {
        throw new Error(result.message || `Could not upload ${fileLabel}`);
      }

      onChange(result.url);
    } catch (error) {
      setUploadError(error.message || `Could not upload ${fileLabel}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <TextInput label={`${label} URL`} value={value} onChange={onChange} placeholder="https://..." />
      <div className="flex min-h-10 flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={isPdf ? "application/pdf,.pdf" : "image/*,.heic,.heif"}
          onChange={handleFileChange}
          className="sr-only"
          aria-label={`Choose ${fileLabel} for ${label}`}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#1cd8d2]/45 px-3 py-2 text-sm font-semibold text-[#9cf5ee] transition hover:bg-[#1cd8d2] hover:text-black disabled:cursor-wait disabled:opacity-60"
        >
          <LuUpload className="h-4 w-4" aria-hidden="true" />
          {uploading ? "Uploading..." : `Upload ${fileLabel}`}
        </button>
        {value && isPdf && (
          <a href={value} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-white/35 hover:text-white">
            <LuExternalLink className="h-4 w-4" aria-hidden="true" />
            Open PDF
          </a>
        )}
        {value && !isPdf && (
          <img src={value} alt="" className="h-10 w-10 rounded-md border border-white/15 object-cover" />
        )}
      </div>
      {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={rows} className="min-w-0 resize-y rounded-lg border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none placeholder:text-gray-600 focus:border-[#1cd8d2]" />
    </label>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <span className="flex min-w-0 items-center gap-3 rounded-lg border border-white/15 bg-black/35 px-3 py-2">
        <input type="color" value={value || "#000000"} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 shrink-0 cursor-pointer border-0 bg-transparent p-0" aria-label={label} />
        <input value={value || ""} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" />
      </span>
    </label>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(Number(value)) ? value : ""}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          if (!Number.isNaN(nextValue)) onChange(nextValue);
        }}
        className="min-w-0 rounded-lg border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none focus:border-[#1cd8d2]"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 rounded-lg border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none focus:border-[#1cd8d2]"
        style={{ colorScheme: "dark" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#10131b] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleInput({ label, checked, onChange }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>{label}</span>
      <span className="flex items-center gap-3 rounded-lg border border-white/15 bg-black/35 px-3 py-2.5">
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition peer-checked:bg-[#1cd8d2]">
          <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
        </span>
        <span className="text-xs font-medium text-gray-400">{checked ? "On" : "Off"}</span>
      </span>
    </label>
  );
}

function SkillItemEditor({ item, index, field, updateArrayItem, removeArrayItem, adminCode }) {
  const prefix = field === "spaceSkills" ? "Floating skill" : "Skill card";

  return (
    <div className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-2">
      <TextInput label="Skill name" value={item.name} onChange={(value) => updateArrayItem(field, index, "name", value)} />
      <TextInput label="Category" value={item.category} onChange={(value) => updateArrayItem(field, index, "category", value)} />
      <SkillPresetPicker
        onSelect={(preset) => {
          updateArrayItem(field, index, "name", preset.label);
          updateArrayItem(field, index, "category", preset.group);
          updateArrayItem(field, index, "icon", preset.value);
          updateArrayItem(field, index, "iconUrl", "");
        }}
      />
      <SkillIconPicker
        value={item.icon}
        iconUrl={item.iconUrl}
        onIconChange={(value) => updateArrayItem(field, index, "icon", value)}
      />
      <UploadUrlInput label="Custom icon image" value={item.iconUrl} onChange={(value) => updateArrayItem(field, index, "iconUrl", value)} adminCode={adminCode} kind="image" />
      <TextArea label="Skill description" value={item.description} onChange={(value) => updateArrayItem(field, index, "description", value)} rows={3} />
      <TextArea label="Where I use this skill" value={item.usage} onChange={(value) => updateArrayItem(field, index, "usage", value)} rows={3} />
      <RemoveButton onClick={() => removeArrayItem(field, index)}>Remove {prefix}</RemoveButton>
    </div>
  );
}

function SkillPresetPicker({ onSelect }) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      <span>Quick skill preset</span>
      <select
        value=""
        onChange={(event) => {
          const preset = skillIconOptions.find((option) => option.value === event.target.value);
          if (preset) onSelect(preset);
        }}
        className="min-w-0 rounded-lg border border-white/15 bg-black/35 px-3 py-2.5 text-white outline-none focus:border-[#1cd8d2]"
        style={{ colorScheme: "dark" }}
      >
        <option value="" className="bg-[#10131b] text-white">Choose a skill</option>
        {skillIconGroups.map((group) => (
          <optgroup key={group.label} label={group.label} className="bg-[#10131b] text-white">
            {group.options.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#10131b] text-white">
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function SkillIconPicker({ value, iconUrl, onIconChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);
  const currentIcon = skillIconGroups
    .flatMap((group) => group.options)
    .find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsidePointer = (event) => {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const currentLabel = currentIcon?.label || `${value || "code"} (saved icon key)`;

  return (
    <div ref={pickerRef} className="relative grid gap-2 text-sm text-gray-300">
      <span>Icon library</span>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Choose a skill icon"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-w-0 items-center gap-3 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-left outline-none transition hover:border-white/30 focus:border-[#1cd8d2] focus-visible:ring-2 focus-visible:ring-[#1cd8d2]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-black/30 text-lg text-[#1cd8d2]">
          <SkillIcon icon={value} iconUrl={iconUrl} alt="" className="h-5 w-5 object-contain" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-white">{currentLabel}</span>
        <LuChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Skill icon library"
          className="absolute left-0 top-full z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-white/15 bg-[#10131b] p-2 shadow-2xl"
        >
          {skillIconGroups.map((group) => (
            <div key={group.label} className="mb-3 last:mb-0">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9cf5ee]">
                {group.label}
              </p>
              {group.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onIconChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1cd8d2] ${
                    option.value === value
                      ? "bg-[#1cd8d2] text-black"
                      : "text-gray-100 hover:bg-white/10"
                  }`}
                >
                  <SkillIcon icon={option.value} alt="" className="h-5 w-5 shrink-0" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddButton({ children, onClick }) {
  return <button type="button" onClick={onClick} className="justify-self-start rounded-lg border border-[#1cd8d2]/40 px-4 py-2.5 text-sm font-semibold text-[#9cf5ee] transition hover:bg-[#1cd8d2] hover:text-black">{children}</button>;
}

function RemoveButton({ onClick, children = "Remove" }) {
  return <button type="button" onClick={onClick} className="justify-self-start self-end rounded-lg border border-red-300/40 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-300 hover:text-black">{children}</button>;
}

function LinksPanel({ title, field, links, updateArrayItem, removeArrayItem, addArrayItem, adminCode, allowPdfUpload = false }) {
  return (
    <Repeater title={title}>
      {links.map((link, index) => (
        <div key={`${field}-${index}`} className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_2fr_auto]">
          <TextInput label="Label" value={link.label} onChange={(value) => updateArrayItem(field, index, "label", value)} />
          {allowPdfUpload ? (
            <UploadUrlInput label="Resume PDF" value={link.url} onChange={(value) => updateArrayItem(field, index, "url", value)} adminCode={adminCode} kind="pdf" />
          ) : (
            <TextInput label="URL" value={link.url} onChange={(value) => updateArrayItem(field, index, "url", value)} placeholder="https://..." />
          )}
          <RemoveButton onClick={() => removeArrayItem(field, index)} />
        </div>
      ))}
      <AddButton onClick={() => addArrayItem(field, emptyLink)}>Add Link</AddButton>
    </Repeater>
  );
}
