import { motion } from "framer-motion";
import { portfolioDefaults } from "../data/portfolioDefaults";
import ParticleNetwork from "../components/ParticleNetwork";
import SkillIcon from "../components/SkillIcon";

function buildSkillCategories(items) {
  const categories = new Map();

  items.forEach((item) => {
    if (!item?.name?.trim()) return;
    const category = item.category?.trim() || "More Skills";

    if (!categories.has(category)) categories.set(category, []);
    categories.get(category).push(item);
  });

  return Array.from(categories, ([title, skills]) => ({ title, skills }));
}

function cardAnimation(animation, index) {
  const base = {
    opacity: 0,
    transition: { duration: 0.58, delay: Math.min(index * 0.055, 0.45), ease: "easeOut" },
  };

  if (animation === "flip") {
    return { initial: { ...base, rotateX: -18, y: 20 }, whileInView: { opacity: 1, rotateX: 0, y: 0 } };
  }

  if (animation === "scale") {
    return { initial: { ...base, scale: 0.86 }, whileInView: { opacity: 1, scale: 1 } };
  }

  if (animation === "glow") {
    return { initial: { ...base, y: 18, filter: "brightness(0.72)" }, whileInView: { opacity: 1, y: 0, filter: "brightness(1)" } };
  }

  if (animation === "lift") {
    return { initial: { ...base, y: 42 }, whileInView: { opacity: 1, y: 0 } };
  }

  return { initial: { ...base, y: 28 }, whileInView: { opacity: 1, y: 0 } };
}

export default function Skills({ content = portfolioDefaults }) {
  const section = { ...portfolioDefaults.skillsSection, ...(content.skillsSection || {}) };
  const skillItems =
    Array.isArray(content.skillCards)
      ? content.skillCards
      : portfolioDefaults.skillCards;
  const categories = buildSkillCategories(skillItems);
  const accentColor = section.accentColor || "#1DCD9F";

  return (
    <section
      id="skills"
      className="relative w-full overflow-x-clip px-5 py-20 text-white md:px-10"
      style={{ backgroundColor: "var(--site-surface)" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <ParticleNetwork color={accentColor} opacity={0.3} />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 20% 15%, ${accentColor}30, transparent 32%), radial-gradient(circle at 85% 60%, ${accentColor}20, transparent 30%)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_1px,transparent_1px),linear-gradient(#fff_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.06]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-10 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.22em] text-gray-400">
          <span className="h-px w-10 bg-gray-700" />
          {section.eyebrow}
        </div>

        <motion.h2
          className="text-4xl font-extrabold text-white sm:text-5xl"
          initial={{ opacity: 0, y: -24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.35 }}
        >
          {section.title}
        </motion.h2>

        <motion.p
          className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          viewport={{ once: false, amount: 0.35 }}
        >
          {section.description}
        </motion.p>

        {categories.length > 0 ? (
          <div className="mt-12 flex flex-col gap-8">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                className="border-t border-white/10 pt-7"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: categoryIndex * 0.08 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <h3 className="mb-5 text-xl font-bold uppercase tracking-wide text-white">
                  {category.title}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {category.skills.map((skill, index) => {
                    const animation = cardAnimation(section.animation, index);

                    return (
                      <motion.article
                        key={`${category.title}-${skill.name}-${index}`}
                        className="group min-w-0 rounded-lg border bg-black/20 px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
                        style={{
                          borderColor: `${accentColor}70`,
                          backgroundColor: `${accentColor}12`,
                        }}
                        initial={animation.initial}
                        whileInView={animation.whileInView}
                        transition={animation.initial.transition}
                        viewport={{ once: false, amount: 0.22 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-black/25 text-2xl transition-shadow duration-300 group-hover:shadow-[0_0_24px_rgba(29,205,159,0.35)]"
                            style={{ borderColor: `${accentColor}80`, color: accentColor }}
                          >
                            <SkillIcon
                              icon={skill.icon}
                              iconUrl={skill.iconUrl}
                              alt=""
                              className="h-7 w-7 object-contain"
                            />
                          </span>
                          <span className="min-w-0 break-words text-sm font-semibold tracking-wide text-gray-100">
                            {skill.name}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="mt-3 text-xs leading-relaxed text-gray-400">{skill.description}</p>
                        )}
                      </motion.article>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-sm text-gray-400">Skills will appear here when they are added from Admin.</p>
        )}
      </div>
    </section>
  );
}
