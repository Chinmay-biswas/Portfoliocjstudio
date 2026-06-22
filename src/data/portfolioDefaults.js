export const portfolioDefaults = {
  name: "Chinmay Biswas",
  headline: "MERN stack Developer",
  roles: ["MERN stack Developer", "C++ Programmer", "Game Developer", "AI & ML Engineer"],
  about:
    "I’m a passionate developer and technology enthusiast focused on building modern, intelligent, and interactive digital experiences. With skills in MERN stack development, C++ programming, game development, and AI & ML, I enjoy turning creative ideas into real-world applications that are both functional and impactful. I’m constantly learning, experimenting, and pushing my limits to create innovative solutions through code",
  aboutShort:
    "I'm a passionate web developer with a knack for crafting beautiful and functional websites. With expertise in React, Tailwind CSS, and JavaScript, I create seamless user experiences. I thrive on learning new technologies and contributing to open source projects. Let's build something amazing together!",
  aboutLong:
    "i am a software developer with a passion for creating innovative and efficient solutions. With a strong background in computer science and experience in various programming languages, I enjoy tackling complex problems and building applications that make a difference. I am always eager to learn new technologies and collaborate with like-minded individuals to bring ideas to life.",
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
  projects: [
    {
      title: "CJ studio",
      link: "http://www.nk.studio/",
      gitlink: "http://www.nk.studio/",
      about: "the game is devloped by me by the the help of unity game engine",
      bgColor: "#0d4d3d",
    },
    {
      title: "gamily",
      link: "http://www.nk.studio/",
      gitlink: "http://www.nk.studio/",
      about: "the game is devloped by me by the the help of unity game engine",
      bgColor: "#3884d3",
    },
    {
      title: "Hungry Tiger",
      link: "http://www.nk.studio/",
      gitlink: "http://www.nk.studio/",
      about: "the game is devloped by me by the the help of unity game engine",
      bgColor: "#dc9317",
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
};

export function mergePortfolioContent(content) {
  if (!content) return portfolioDefaults;

  return {
    ...portfolioDefaults,
    ...content,
    roles:
      Array.isArray(content.roles) && content.roles.length
        ? content.roles
        : portfolioDefaults.roles,
    skills:
      Array.isArray(content.skills) && content.skills.length
        ? content.skills
        : portfolioDefaults.skills,
    projects:
      Array.isArray(content.projects) && content.projects.length
        ? content.projects
        : portfolioDefaults.projects,
    socials:
      Array.isArray(content.socials) && content.socials.length
        ? content.socials
        : portfolioDefaults.socials,
    resumeLinks:
      Array.isArray(content.resumeLinks) && content.resumeLinks.length
        ? content.resumeLinks
        : portfolioDefaults.resumeLinks,
  };
}
