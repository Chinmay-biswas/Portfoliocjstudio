import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { LuChevronLeft, LuChevronRight, LuExpand, LuExternalLink, LuMinimize } from "react-icons/lu";
import { SiCodeforces, SiLeetcode } from "react-icons/si";
import { portfolioDefaults } from "../data/portfolioDefaults";

const platformMeta = {
  github: { label: "GitHub", Icon: FaGithub, color: "#e5e7eb" },
  codeforces: { label: "Codeforces", Icon: SiCodeforces, color: "#5b8def" },
  leetcode: { label: "LeetCode", Icon: SiLeetcode, color: "#f5a623" },
};
const codingProgressRequests = new Map();
const weekDayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function withAlpha(color, alpha) {
  const normalized = String(color || "").trim().replace("#", "");
  const hex = normalized.length === 3
    ? normalized.split("").map((part) => `${part}${part}`).join("")
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return `rgba(28, 216, 210, ${alpha})`;

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function formatValue(value) {
  if (typeof value === "number") return new Intl.NumberFormat("en-IN").format(value);
  return String(value ?? "0");
}

function formatDate(value, options = { month: "short", year: "numeric" }) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  return new Intl.DateTimeFormat("en", options).format(new Date(timestamp));
}

function formatMonth(value) {
  const [year, month] = String(value || "").split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return "";

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function monthDays(value) {
  const [year, month] = String(value || "").split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return [];

  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return Array.from({ length: count }, (_, index) => {
    const day = index + 1;
    return {
      day,
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    };
  });
}

function relativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutes < 2) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Updated ${hours} hours ago`;

  return `Updated ${Math.round(hours / 24)} days ago`;
}

function getMetric(platform, label, fallback = 0) {
  const metric = platform?.metrics?.find((item) => item.label === label);
  return metric?.value ?? fallback;
}

function getPlatformSettings(content, provider) {
  const sectionKey = `${provider}Section`;
  const profileField = `${provider}Profile`;

  return {
    ...portfolioDefaults[sectionKey],
    ...(content?.[sectionKey] || {}),
    profile: String(content?.codingProgressSection?.[profileField] || "").trim(),
  };
}

function getCodingProfileKey(content) {
  return ["github", "codeforces", "leetcode"]
    .map((provider) => `${provider}:${String(content?.codingProgressSection?.[`${provider}Profile`] || "").trim()}`)
    .join("|");
}

function loadCodingProgress(profileKey) {
  const cached = codingProgressRequests.get(profileKey);
  if (cached?.data) return Promise.resolve(cached.data);
  if (cached?.promise) return cached.promise;

  const promise = fetch("/api/coding-progress")
    .then((response) => {
      if (!response.ok) throw new Error("Could not load coding progress");
      return response.json();
    })
    .then((data) => {
      codingProgressRequests.set(profileKey, { data });
      return data;
    })
    .catch((error) => {
      codingProgressRequests.delete(profileKey);
      throw error;
    });

  codingProgressRequests.set(profileKey, { promise });
  return promise;
}

function useCodingProgress(profileKey, shouldLoad) {
  const [state, setState] = useState({ status: "idle", data: null, profileKey: "" });

  useEffect(() => {
    if (!shouldLoad) return undefined;

    let isCurrent = true;

    loadCodingProgress(profileKey)
      .then((data) => {
        if (isCurrent) setState({ status: "ready", data, profileKey });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error", data: null, profileKey });
      });

    return () => {
      isCurrent = false;
    };
  }, [profileKey, shouldLoad]);

  return state;
}

function SectionLabel({ children, color }) {
  return <p className="text-xs font-semibold uppercase" style={{ color }}>{children}</p>;
}

function ExternalProfileLink({ href, label }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={`Open ${label} profile`}
      aria-label={`Open ${label} profile`}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/45 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65"
    >
      <LuExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function ProfileOverview({ platform, accentColor, metadata = [] }) {
  const meta = platformMeta[platform.provider] || platformMeta.github;
  const Icon = meta.Icon;
  const visibleMetadata = metadata.filter(Boolean);

  return (
    <div className="mt-10 flex flex-col gap-5 border-y border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-black/30 text-2xl"
          style={{ color: accentColor || meta.color }}
        >
          {platform.avatarUrl ? <img src={platform.avatarUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Icon aria-hidden="true" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-2xl font-semibold text-white">{platform.username || meta.label}</h3>
            <span className="text-sm text-white/45">{meta.label}</span>
          </div>
          {platform.description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">{platform.description}</p>}
          {visibleMetadata.length > 0 && <p className="mt-3 text-sm text-white/45">{visibleMetadata.join("  |  ")}</p>}
        </div>
      </div>
      <ExternalProfileLink href={platform.profileUrl} label={meta.label} />
    </div>
  );
}

function MetricGrid({ items, accentColor }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-4">
          <p className="truncate text-xs font-medium uppercase text-white/45">{item.label}</p>
          <p className="mt-2 truncate text-2xl font-semibold" style={{ color: item.color || accentColor }}>{formatValue(item.value)}</p>
          {item.note && <p className="mt-1 truncate text-xs text-white/42">{item.note}</p>}
        </div>
      ))}
    </div>
  );
}

function ActivityDay({ day, count, maximum, accentColor, countLabel, compact = false }) {
  const intensity = count ? 0.2 + (count / maximum) * 0.75 : 0;
  const title = `${day.date}: ${count} ${count === 1 ? countLabel.slice(0, -1) : countLabel}`;

  return (
    <span
      key={day.date}
      title={title}
      aria-label={title}
      className={compact
        ? "h-5 w-5 rounded-sm border border-white/[0.08] sm:h-6 sm:w-6"
        : "grid h-7 w-7 place-items-center rounded-sm border border-white/[0.08] text-[9px] font-medium text-white/72 sm:h-8 sm:w-8"}
      style={{ backgroundColor: count ? withAlpha(accentColor, intensity) : "rgba(255, 255, 255, 0.05)" }}
    >
      {!compact && day.day}
    </span>
  );
}

function YearActivityCalendar({ activityByDate, accentColor, countLabel, onMonthSelect, year }) {
  const months = Array.from(
    { length: 12 },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`
  );

  return (
    <div className="mt-5 grid max-w-4xl gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label={`Full ${year} activity calendar`}>
      {months.map((month) => {
        const days = monthDays(month);
        const firstWeekday = days.length
          ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
          : 0;
        const counts = days.map((day) => activityByDate.get(day.date) || 0);
        const maximum = Math.max(...counts, 1);
        const activeDays = counts.filter((count) => count > 0).length;
        const totalActivity = counts.reduce((total, count) => total + count, 0);

        return (
          <button
            key={month}
            type="button"
            onClick={() => onMonthSelect(month)}
            title={`Show ${formatMonth(month)}`}
            className="rounded-md border border-white/10 bg-white/[0.025] p-3 text-left transition hover:border-white/35 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-white/85">{formatMonth(month)}</span>
              <span className="shrink-0 text-[11px] text-white/42">{activeDays} days</span>
            </span>
            <span className="mt-3 grid grid-cols-7 gap-1 text-center text-[8px] font-medium text-white/35" aria-hidden="true">
              {weekDayLabels.map((day, index) => <span key={`${month}-${day}-${index}`} className="h-3 w-5 sm:w-6">{day}</span>)}
            </span>
            <span className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }, (_, index) => (
                <span key={`${month}-blank-${index}`} className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              ))}
              {days.map((day) => (
                <ActivityDay
                  key={day.date}
                  day={day}
                  count={activityByDate.get(day.date) || 0}
                  maximum={maximum}
                  accentColor={accentColor}
                  countLabel={countLabel}
                  compact
                />
              ))}
            </span>
            <span className="mt-3 block text-xs text-white/46">{formatValue(totalActivity)} {countLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

function ActivityHeatmap({ activity, accentColor, label }) {
  const [monthPreference, setMonthPreference] = useState("");
  const [isYearExpanded, setIsYearExpanded] = useState(false);
  const activityByDate = useMemo(() => {
    const entries = new Map();

    for (const day of Array.isArray(activity) ? activity : []) {
      const date = String(day?.date || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

      entries.set(date, Math.max(0, Number(day.count) || 0));
    }

    return entries;
  }, [activity]);
  const availableMonths = useMemo(
    () => [...new Set([...activityByDate.keys()].map((date) => date.slice(0, 7)))].sort(),
    [activityByDate]
  );
  const activeMonths = useMemo(
    () => availableMonths.filter((month) => [...activityByDate.entries()].some(([date, count]) => (
      date.startsWith(month) && count > 0
    ))),
    [activityByDate, availableMonths]
  );
  const selectedMonth = availableMonths.includes(monthPreference)
    ? monthPreference
    : activeMonths.at(-1) || availableMonths.at(-1) || "";
  const selectedIndex = availableMonths.indexOf(selectedMonth);
  const days = useMemo(() => monthDays(selectedMonth), [selectedMonth]);
  const firstWeekday = days.length
    ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
    : 0;
  const monthCounts = days.map((day) => activityByDate.get(day.date) || 0);
  const maximum = Math.max(...monthCounts, 1);
  const activeDays = monthCounts.filter((count) => count > 0).length;
  const totalActivity = monthCounts.reduce((total, count) => total + count, 0);
  const countLabel = /contribution/i.test(label) ? "contributions" : "submissions";

  if (!availableMonths.length || !days.length) return null;

  const selectedYear = Number(selectedMonth.slice(0, 4));
  const yearCounts = [...activityByDate.entries()]
    .filter(([date]) => date.startsWith(`${selectedYear}-`))
    .map(([, count]) => count);
  const yearActiveDays = yearCounts.filter((count) => count > 0).length;
  const yearTotalActivity = yearCounts.reduce((total, count) => total + count, 0);
  const displayedActiveDays = isYearExpanded ? yearActiveDays : activeDays;
  const displayedTotalActivity = isYearExpanded ? yearTotalActivity : totalActivity;

  const chooseRelativeMonth = (offset) => {
    const nextMonth = availableMonths[selectedIndex + offset];
    if (nextMonth) setMonthPreference(nextMonth);
  };

  return (
    <div className="border-t border-white/10 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionLabel color={accentColor}>{label}</SectionLabel>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => chooseRelativeMonth(-1)}
            disabled={selectedIndex <= 0}
            title="Previous month"
            aria-label="Previous month"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <LuChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <select
            value={selectedMonth}
            onChange={(event) => setMonthPreference(event.target.value)}
            aria-label="Choose activity month"
            className="h-9 min-w-36 rounded-md border border-white/15 bg-black/35 px-2 text-sm text-white outline-none focus:border-white/55"
            style={{ colorScheme: "dark" }}
          >
            {[...availableMonths].reverse().map((month) => (
              <option key={month} value={month} className="bg-[#10131b] text-white">{formatMonth(month)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => chooseRelativeMonth(1)}
            disabled={selectedIndex >= availableMonths.length - 1}
            title="Next month"
            aria-label="Next month"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <LuChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsYearExpanded((expanded) => !expanded)}
            title={isYearExpanded ? "Show selected month" : "Show full year"}
            aria-label={isYearExpanded ? "Show selected month" : "Show full year"}
            aria-pressed={isYearExpanded}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/65 ${isYearExpanded
              ? "border-white/45 bg-white/[0.1] text-white"
              : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"}`}
          >
            {isYearExpanded ? <LuMinimize className="h-4 w-4" aria-hidden="true" /> : <LuExpand className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {isYearExpanded ? (
        <YearActivityCalendar
          activityByDate={activityByDate}
          accentColor={accentColor}
          countLabel={countLabel}
          onMonthSelect={(month) => {
            setMonthPreference(month);
            setIsYearExpanded(false);
          }}
          year={selectedYear}
        />
      ) : (
        <div className="mt-4 w-fit max-w-full" aria-label={`${label} for ${formatMonth(selectedMonth)}`}>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-white/40" aria-hidden="true">
            {weekDayLabels.map((day, index) => <span key={`${day}-${index}`} className="h-4 w-7 sm:w-8">{day}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />)}
            {days.map((day) => (
              <ActivityDay
                key={day.date}
                day={day}
                count={activityByDate.get(day.date) || 0}
                maximum={maximum}
                accentColor={accentColor}
                countLabel={countLabel}
              />
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-sm text-white/52">{displayedActiveDays} active days  |  {formatValue(displayedTotalActivity)} {countLabel}</p>
    </div>
  );
}

function TagList({ title, entries, accentColor, showValue = true }) {
  if (!entries?.length) return null;

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>{title}</SectionLabel>
      <div className="mt-4 flex flex-wrap gap-2">
        {entries.map((entry) => (
          <span key={`${entry.label}-${entry.category || ""}`} className="inline-flex max-w-full items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/75">
            <span className="truncate">{entry.label}</span>
            {showValue && <span className="text-xs font-semibold" style={{ color: accentColor }}>{formatValue(entry.value)}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function HorizontalBars({ title, entries, accentColor, suffix = "" }) {
  if (!entries?.length) return null;

  const maximum = Math.max(...entries.map((entry) => Number(entry.value) || 0), 1);

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>{title}</SectionLabel>
      <div className="mt-4 grid gap-3">
        {entries.map((entry) => (
          <div key={entry.label} className="grid min-w-0 grid-cols-[minmax(5.5rem,0.8fr)_minmax(0,2fr)_auto] items-center gap-3 text-sm">
            <span className="truncate text-white/65">{entry.label}</span>
            <span className="h-2 overflow-hidden rounded-sm bg-white/[0.07]">
              <span className="block h-full rounded-sm" style={{ width: `${Math.max(5, (Number(entry.value) / maximum) * 100)}%`, backgroundColor: accentColor }} />
            </span>
            <span className="text-right font-medium text-white/85">{formatValue(entry.value)}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentProblemList({ title = "Recent accepted problems", items, accentColor }) {
  if (!items?.length) return null;

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>{title}</SectionLabel>
      <div className="mt-4 grid gap-2">
        {items.map((item) => {
          const content = (
            <>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white/88">{item.title}</span>
                {item.subtitle && <span className="mt-1 block truncate text-xs text-white/45">{item.subtitle}</span>}
              </span>
              {item.url && <LuExternalLink className="h-4 w-4 shrink-0 text-white/45" aria-hidden="true" />}
            </>
          );

          return item.url ? (
            <a
              key={`${item.title}-${item.url}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/[0.09] px-3 py-3 transition hover:border-white/30 hover:bg-white/[0.045]"
            >
              {content}
            </a>
          ) : (
            <div key={`${item.title}-${item.subtitle}`} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/[0.09] px-3 py-3">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RepositoryGrid({ repositories, accentColor }) {
  if (!repositories?.length) return null;

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>Repository spotlight</SectionLabel>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {repositories.map((repository) => (
          <article key={repository.url || repository.name} className="flex min-w-0 flex-col rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-start justify-between gap-3">
              <h4 className="min-w-0 truncate text-base font-semibold text-white">{repository.name}</h4>
              <ExternalProfileLink href={repository.url} label={`${repository.name} repository`} />
            </div>
            <p className="mt-3 min-h-10 text-sm leading-relaxed text-white/56">{repository.description}</p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/52">
              {repository.language && <span>{repository.language}</span>}
              <span>{formatValue(repository.stars)} stars</span>
              <span>{formatValue(repository.forks)} forks</span>
              {repository.updatedAt && <span>Updated {formatDate(repository.updatedAt)}</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ContestList({ contests, accentColor }) {
  if (!contests?.length) return null;

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>Recent rated contests</SectionLabel>
      <div className="mt-4 grid gap-2">
        {contests.map((contest) => {
          const ratingChange = contest.newRating - contest.oldRating;
          const changeLabel = ratingChange > 0 ? `+${ratingChange}` : String(ratingChange);

          return (
            <div key={`${contest.name}-${contest.date}`} className="grid min-w-0 gap-2 rounded-md border border-white/[0.09] px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center sm:gap-5">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white/88">{contest.name}</span>
                {contest.date && <span className="mt-1 block text-xs text-white/45">{formatDate(contest.date, { month: "short", day: "numeric", year: "numeric" })}</span>}
              </span>
              <span className="text-sm text-white/58">Rank {formatValue(contest.rank)}</span>
              <span className="text-sm text-white/58">{formatValue(contest.newRating)}</span>
              <span className="text-sm font-semibold" style={{ color: ratingChange >= 0 ? accentColor : "#fb7185" }}>{changeLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DifficultyBreakdown({ difficulties, accentColor }) {
  if (!difficulties?.length) return null;

  const maximum = Math.max(...difficulties.map((difficulty) => Number(difficulty.solved) || 0), 1);

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>Difficulty breakdown</SectionLabel>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {difficulties.map((difficulty) => (
          <div key={difficulty.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-white/72">{difficulty.label}</p>
              <p className="text-lg font-semibold" style={{ color: accentColor }}>{formatValue(difficulty.solved)}</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-sm bg-white/[0.07]">
              <span className="block h-full rounded-sm" style={{ width: `${Math.max(5, (Number(difficulty.solved) / maximum) * 100)}%`, backgroundColor: accentColor }} />
            </div>
            {difficulty.submissions > 0 && <p className="mt-3 text-xs text-white/45">{formatValue(difficulty.submissions)} public submissions</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgeGrid({ badges, accentColor }) {
  if (!badges?.length) return null;

  return (
    <div className="border-t border-white/10 pt-6">
      <SectionLabel color={accentColor}>Public badges</SectionLabel>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.id} className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
            {badge.icon ? <img src={badge.icon} alt="" className="h-10 w-10 shrink-0 object-contain" loading="lazy" /> : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 text-sm" style={{ color: accentColor }}>LC</span>}
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white/85">{badge.name}</span>
              {(badge.category || badge.createdAt) && <span className="mt-1 block truncate text-xs text-white/45">{[badge.category, formatDate(badge.createdAt)].filter(Boolean).join(" | ")}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformState({ status, provider, error }) {
  const meta = platformMeta[provider];

  if (status === "loading") {
    return (
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label={`Loading ${meta.label} progress`}>
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-lg border border-white/[0.08] bg-white/[0.035]" />)}
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-4 py-4 text-sm leading-relaxed text-amber-100/80">
      {error || `${meta.label} public data is temporarily unavailable. The next visit will retry automatically.`}
    </div>
  );
}

function ProgressSectionShell({ id, provider, settings, platform, state, children }) {
  const meta = platformMeta[provider];
  const Icon = meta.Icon;
  const ready = platform?.status === "ready";

  return (
    <section id={id} className="relative overflow-hidden border-t border-white/10 bg-[#05070a] px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
      <div className="relative mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.18, once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-black/25 text-lg" style={{ color: settings.accentColor || meta.color }}>
              <Icon aria-hidden="true" />
            </span>
            {settings.eyebrow?.trim() && <SectionLabel color={settings.accentColor || meta.color}>{settings.eyebrow.trim()}</SectionLabel>}
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">{settings.title || meta.label}</h2>
            {state.data?.fetchedAt && <p className="text-sm text-white/45">{relativeTime(state.data.fetchedAt)}</p>}
          </div>
          {settings.description?.trim() && <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/62 sm:text-lg">{settings.description.trim()}</p>}
          <div className="mt-6 h-px w-24" style={{ backgroundColor: settings.secondaryColor || meta.color }} aria-hidden="true" />
        </motion.header>

        {ready ? children : <PlatformState status={state.status} provider={provider} error={platform?.error} />}
        {ready && state.data?.stale && <p className="mt-6 text-sm text-white/42">Showing the last successful update while a fresh platform sync is retried.</p>}
      </div>
    </section>
  );
}

function GitHubProgress({ settings, platform, state }) {
  const details = platform?.details || {};
  const profile = details.profile || {};

  return (
    <ProgressSectionShell id="github-progress" provider="github" settings={settings} platform={platform} state={state}>
      <ProfileOverview
        platform={platform}
        accentColor={settings.accentColor}
        metadata={[
          profile.name,
          profile.location,
          profile.company,
          profile.createdAt ? `Member since ${formatDate(profile.createdAt)}` : "",
        ]}
      />
      <MetricGrid
        accentColor={settings.accentColor}
        items={[
          { label: "Repositories", value: getMetric(platform, "Public repos") },
          { label: "Followers", value: getMetric(platform, "Followers") },
          { label: "Following", value: getMetric(platform, "Following") },
          { label: "Stars", value: details.totalStars || 0, note: "Across synced repositories" },
        ]}
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.8fr)]">
        <ActivityHeatmap activity={platform.activity} accentColor={settings.accentColor} label={platform.activityLabel || "Public activity"} />
        <div className="border-t border-white/10 pt-6">
          <SectionLabel color={settings.accentColor}>Open-source summary</SectionLabel>
          <dl className="mt-4 grid gap-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Active days</dt><dd className="font-semibold text-white">{formatValue(details.activityDays || 0)}</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Repository forks</dt><dd className="font-semibold text-white">{formatValue(details.totalForks || 0)}</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Public gists</dt><dd className="font-semibold text-white">{formatValue(profile.publicGists || 0)}</dd></div>
            {profile.website && <div className="flex items-center justify-between gap-4"><dt className="text-white/50">Website</dt><dd className="max-w-[13rem] truncate text-right text-white/80">{profile.website}</dd></div>}
          </dl>
        </div>
      </div>
      <div className="mt-10">
        <TagList title="Most used repository languages" entries={details.languages} accentColor={settings.accentColor} />
      </div>
      <div className="mt-10">
        <RepositoryGrid repositories={details.repositories} accentColor={settings.accentColor} />
      </div>
    </ProgressSectionShell>
  );
}

function CodeforcesProgress({ settings, platform, state }) {
  const details = platform?.details || {};
  const profile = details.profile || {};

  return (
    <ProgressSectionShell id="codeforces-progress" provider="codeforces" settings={settings} platform={platform} state={state}>
      <ProfileOverview
        platform={platform}
        accentColor={settings.accentColor}
        metadata={[
          profile.rank ? `Current rank: ${profile.rank}` : "",
          profile.maxRank ? `Peak: ${profile.maxRank}` : "",
          [profile.city, profile.country].filter(Boolean).join(", "),
          profile.organization,
        ]}
      />
      <MetricGrid
        accentColor={settings.accentColor}
        items={[
          { label: "Current rating", value: getMetric(platform, "Rating") },
          { label: "Max rating", value: getMetric(platform, "Max rating") },
          { label: "Solved", value: getMetric(platform, "Solved") },
          { label: "Rated contests", value: getMetric(platform, "Contests") },
        ]}
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.8fr)]">
        <ActivityHeatmap activity={platform.activity} accentColor={settings.accentColor} label={platform.activityLabel || "Accepted submissions"} />
        <div className="border-t border-white/10 pt-6">
          <SectionLabel color={settings.accentColor}>Competitive profile</SectionLabel>
          <dl className="mt-4 grid gap-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Current rank</dt><dd className="font-semibold text-white">{profile.rank || "Unrated"}</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Peak rank</dt><dd className="font-semibold text-white">{profile.maxRank || "-"}</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Active days</dt><dd className="font-semibold text-white">{formatValue(details.activityDays || 0)}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-white/50">Contribution</dt><dd className="font-semibold text-white">{formatValue(profile.contribution || 0)}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <HorizontalBars title="Solved problem ratings" entries={details.solvedByRating} accentColor={settings.accentColor} />
        <TagList title="Strongest problem tags" entries={details.topTags} accentColor={settings.secondaryColor || settings.accentColor} />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ContestList contests={details.contests} accentColor={settings.accentColor} />
        <RecentProblemList items={platform.recentItems} accentColor={settings.secondaryColor || settings.accentColor} />
      </div>
    </ProgressSectionShell>
  );
}

function LeetCodeProgress({ settings, platform, state }) {
  const details = platform?.details || {};
  const profile = details.profile || {};

  return (
    <ProgressSectionShell id="leetcode-progress" provider="leetcode" settings={settings} platform={platform} state={state}>
      <ProfileOverview
        platform={platform}
        accentColor={settings.accentColor}
        metadata={[
          profile.realName,
          profile.ranking ? `Global rank #${formatValue(profile.ranking)}` : "",
          profile.reputation ? `${formatValue(profile.reputation)} reputation` : "",
        ]}
      />
      <MetricGrid
        accentColor={settings.accentColor}
        items={[
          { label: "Solved", value: getMetric(platform, "Solved") },
          { label: "Easy", value: getMetric(platform, "Easy"), color: "#4ade80" },
          { label: "Medium", value: getMetric(platform, "Medium"), color: "#facc15" },
          { label: "Hard", value: getMetric(platform, "Hard"), color: "#fb7185" },
        ]}
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.8fr)]">
        <ActivityHeatmap activity={platform.activity} accentColor={settings.accentColor} label={platform.activityLabel || "LeetCode submissions"} />
        <div className="border-t border-white/10 pt-6">
          <SectionLabel color={settings.accentColor}>Practice summary</SectionLabel>
          <dl className="mt-4 grid gap-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Active days</dt><dd className="font-semibold text-white">{formatValue(details.activityDays || 0)}</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Current streak</dt><dd className="font-semibold text-white">{formatValue(details.currentStreak || 0)} days</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3"><dt className="text-white/50">Public submissions</dt><dd className="font-semibold text-white">{formatValue(details.allSubmissions || 0)}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-white/50">Solutions posted</dt><dd className="font-semibold text-white">{formatValue(profile.solutionCount || 0)}</dd></div>
          </dl>
        </div>
      </div>
      <div className="mt-10">
        <DifficultyBreakdown difficulties={details.difficulties} accentColor={settings.accentColor} />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <HorizontalBars title="Languages used for solved problems" entries={details.languages} accentColor={settings.secondaryColor || settings.accentColor} />
        <TagList title="Top problem topics" entries={details.topics} accentColor={settings.accentColor} />
      </div>
      <div className="mt-10">
        <BadgeGrid badges={details.badges} accentColor={settings.accentColor} />
      </div>
      <div className="mt-10">
        <RecentProblemList items={platform.recentItems} accentColor={settings.secondaryColor || settings.accentColor} />
      </div>
    </ProgressSectionShell>
  );
}

export function CodingProgressSection({ provider, content = portfolioDefaults }) {
  const settings = useMemo(
    () => getPlatformSettings(content, provider),
    [content, provider]
  );
  const profileKey = useMemo(() => getCodingProfileKey(content), [content]);
  const requestState = useCodingProgress(profileKey, Boolean(settings.profile));
  const state = requestState.profileKey === profileKey
    ? requestState
    : { status: "loading", data: null, profileKey };
  const snapshot = state.data;
  const platform = snapshot?.platforms?.[provider] || {
    provider,
    status: state.status === "error" ? "unavailable" : "loading",
    metrics: [],
    activity: [],
    recentItems: [],
    details: {},
    error: "",
  };

  if (!settings.profile) return null;

  if (provider === "github") {
    return <GitHubProgress settings={settings} platform={platform} state={state} />;
  }

  if (provider === "codeforces") {
    return <CodeforcesProgress settings={settings} platform={platform} state={state} />;
  }

  if (provider === "leetcode") {
    return <LeetCodeProgress settings={settings} platform={platform} state={state} />;
  }

  return null;
}

export function CodingProgressSections({ githubContent, codeforcesContent, leetcodeContent }) {
  return (
    <>
      {githubContent && <CodingProgressSection provider="github" content={githubContent} />}
      {codeforcesContent && <CodingProgressSection provider="codeforces" content={codeforcesContent} />}
      {leetcodeContent && <CodingProgressSection provider="leetcode" content={leetcodeContent} />}
    </>
  );
}
