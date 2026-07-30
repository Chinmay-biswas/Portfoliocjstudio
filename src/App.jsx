import Navbar from './components/Navbar'
import Home from './sections/Home'
import About from './sections/About'
import Skills from './sections/Skills'
import SkillsSpace from './sections/SkillsSpace'
import Projects from './sections/Projects'
import Experienceprochat from './sections/Experienceprochat'
import { CodingProgressSection } from './sections/CodingProgress'
import Testimonials from './sections/Testimonials'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import ParticlesBackground from './components/ParticlesBackground'
import CustomCursor from './components/CustomCursor'
import IntroAnimation from './components/IntroAnimation'
import { Fragment, useEffect, useRef, useState } from 'react'
import Experience from './sections/Experience'
import Admin from './sections/Admin'
import {
  getPortfolioList,
  mergePortfolioContent,
  portfolioDefaults,
  sectionOrderDefaults,
  sectionSettingsDefaults,
} from './data/portfolioDefaults'

const useIsLargeScreen = (query = "(min-width:1024px)") => {
  const [isLargeScreen, setIsLargeScreen] = useState(
    typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setIsLargeScreen(event.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return isLargeScreen;
};

export default function App() {

  const [showIntro, setShowIntro] = useState(true);
  const [portfolioContent, setPortfolioContent] = useState(portfolioDefaults);
  const [isContentResolved, setIsContentResolved] = useState(false);
  const lastContentSignatureRef = useRef(null);
  const isLargeScreen = useIsLargeScreen();
  const isAdminPage = window.location.pathname === '/admin';
  const theme = portfolioContent.theme || portfolioDefaults.theme;
  const sectionSettings = portfolioContent.sectionSettings || sectionSettingsDefaults;
  const sectionOrder = portfolioContent.sectionOrder || sectionOrderDefaults;
  const sectionItemFields = {
    skills: "skillCards",
    skillSpace: "spaceSkills",
    projects: "projects",
    journey: "journeys",
    testimonials: "testimonials",
  };
  const sectionProfileFields = {
    github: "githubProfile",
    codeforces: "codeforcesProfile",
    leetcode: "leetcodeProfile",
  };
  const getSectionSetting = (section) => (
    sectionSettings[section] || sectionSettingsDefaults[section]
  );
  const getSectionContent = (section) => (
    getSectionSetting(section)?.source === "builtIn" ? portfolioDefaults : portfolioContent
  );
  const isSectionVisible = (section) => {
    if (getSectionSetting(section)?.enabled === false) return false;

    const profileField = sectionProfileFields[section];
    if (profileField) {
      return Boolean(String(getSectionContent(section).codingProgressSection?.[profileField] || "").trim());
    }

    const itemField = sectionItemFields[section];
    return !itemField || getPortfolioList(getSectionContent(section), itemField).length > 0;
  };
  const visibleSections = Object.fromEntries(
    Object.keys(sectionSettingsDefaults).map((section) => [section, isSectionVisible(section)])
  );
  const visibleNavigationSections = {
    ...visibleSections,
    skillSpace: visibleSections.skillSpace && isLargeScreen,
  };
  const introContent = getSectionContent("intro");
  const isIntroActive = showIntro
    && visibleSections.intro
    && introContent.introAnimation?.enabled !== false;
  const renderPublicSection = (section) => {
    if (!visibleSections[section]) return null;

    const content = getSectionContent(section);

    switch (section) {
      case "home":
        return <Home content={content} visibleSections={visibleSections} />;
      case "about":
        return <About content={content} visibleSections={visibleSections} />;
      case "skills":
        return <Skills content={content} />;
      case "skillSpace":
        return isLargeScreen ? <SkillsSpace content={content} /> : null;
      case "projects":
        return <Projects content={content} />;
      case "journey":
        return <Experienceprochat content={content} />;
      case "github":
      case "codeforces":
      case "leetcode":
        return <CodingProgressSection provider={section} content={content} />;
      case "testimonials":
        return <Testimonials content={content} />;
      case "contact":
        return <Contact content={content} />;
      case "footer":
        return <Footer content={content} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (isAdminPage) return;

    let isCurrent = true;
    const loadContent = () => {
      fetch('/api/portfolio')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Could not load portfolio content');
          }
          return response.json();
        })
        .then((data) => {
          if (!isCurrent) return;

          const signature = JSON.stringify(data);
          if (signature !== lastContentSignatureRef.current) {
            lastContentSignatureRef.current = signature;
            setPortfolioContent(mergePortfolioContent(data));
          }

          setIsContentResolved(true);
        })
        .catch(() => {
          if (!isCurrent) return;

          if (lastContentSignatureRef.current !== "fallback") {
            lastContentSignatureRef.current = "fallback";
            setPortfolioContent(portfolioDefaults);
          }

          setIsContentResolved(true);
        });
    };

    loadContent();
    const refreshId = window.setInterval(loadContent, 15000);

    return () => {
      isCurrent = false;
      window.clearInterval(refreshId);
    };
  }, [isAdminPage]);

  if (isAdminPage) {
    return <Admin />;
  }

  if (!isContentResolved) {
    return <main className="min-h-screen bg-[#05070a]" aria-busy="true" />;
  }

  return(
      <>

    {isIntroActive && <IntroAnimation content={introContent} onFinish={() => setShowIntro(false)} />}
      {!isIntroActive &&(


    <div
      className='relative gradient text-white'
      style={{
        "--site-background": theme.background,
        "--site-surface": theme.surface,
        "--site-accent": theme.accent,
        "--site-secondary": theme.secondary,
        "--site-deep-accent": theme.deepAccent,
      }}
    >
      <CustomCursor />
      {/*<ParticlesBackground />*/}


      <Navbar content={getSectionContent("home")} visibleSections={visibleNavigationSections} sectionOrder={sectionOrder}/>
      {sectionOrder.map((section) => (
        <Fragment key={section}>{renderPublicSection(section)}</Fragment>
      ))}
    </div>
    
    )}
    </>
  )
}
