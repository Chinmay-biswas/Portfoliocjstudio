import { LuSparkles } from "react-icons/lu";
import { motion } from "framer-motion";
import { portfolioDefaults } from "../data/portfolioDefaults";

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
  {
    title: "Languages",
    match: ["Java", "TypeScript", "Python", "C++", "C#"],
  },
  {
    title: "Frontend",
    match: ["React", "React.js", "Next.js", "Tailwind CSS", "Tailwind", "Canva"],
  },
  {
    title: "Backend & Data",
    match: ["NodeJS", "Node.js", "MongoDB", "Data Science", "AI", "AI & ML"],
  },
  {
    title: "Creative Tech",
    match: ["UNITY", "Unity"],
  },
];

function buildSkillCategories(skillNames) {
  const used = new Set();
  const categories = categoryRules
    .map((category) => {
      const skills = skillNames.filter((skill) => category.match.includes(skill));
      skills.forEach((skill) => used.add(skill));
      return { ...category, skills };
    })
    .filter((category) => category.skills.length > 0);

  const otherSkills = skillNames.filter((skill) => !used.has(skill));

  if (otherSkills.length > 0) {
    categories.push({ title: "More Tools", skills: otherSkills });
  }

  return categories;
}

export default function Skills({ content = portfolioDefaults }) {
  const skillNames = content.skills || portfolioDefaults.skills;
  const categories = buildSkillCategories(skillNames);

  return (
    <section
      id="skills"
      className="relative w-full overflow-hidden bg-[#09090e] px-5 py-20 text-white md:px-10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(107,39,176,0.2),transparent_32%),radial-gradient(circle_at_85%_60%,rgba(107,39,176,0.14),transparent_30%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(90deg,#6B27B0_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-gray-400">
          <span className="h-px w-10 bg-gray-700" />
          Skills
        </div>

        <motion.h2
          className="text-4xl font-extrabold text-white sm:text-5xl"
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.35 }}
        >
          My Skills
        </motion.h2>

        <motion.p
          className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          viewport={{ once: false, amount: 0.35 }}
        >
          Modern Application | Modern Technologies | Modern Solutions
        </motion.p>

        <div className="mt-12 flex flex-col gap-8">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              className="border-t border-white/10 pt-7"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: categoryIndex * 0.08 }}
              viewport={{ once: false, amount: 0.2 }}
            >
              <h3 className="mb-5 text-xl font-bold uppercase tracking-wide text-white">
                {category.title}
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {category.skills.map((skill) => (
                  <div
                    key={skill}
                    className="group flex items-center gap-4 rounded-lg border border-white/10 bg-[#0c0c13]/90 px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1DCD9F]/70 hover:bg-[#1DCD9F]/10"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-2xl text-[#1DCD9F] transition-all duration-300 group-hover:border-[#1DCD9F]/60 group-hover:shadow-[0_0_24px_rgba(29,205,159,0.35)]">
                      {deviconMap[skill] ? (
                        <img
                          src={deviconMap[skill]}
                          alt=""
                          className="h-7 w-7 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <LuSparkles />
                      )}
                    </span>
                    <span className="text-sm font-medium tracking-wide text-gray-100">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
