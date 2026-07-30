import CodingProgressSnapshot from "../models/CodingProgressSnapshot.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;
const ACTIVITY_DAYS = 84;
const SNAPSHOT_VERSION = 3;
const activeRefreshes = new Map();

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readRefreshMinutes(value) {
  const minutes = Number(value);
  return Number.isFinite(minutes) ? clamp(minutes, 15, 1440) : 360;
}

function platformUrl(platform, username) {
  const encodedUsername = encodeURIComponent(username);

  if (platform === "github") return `https://github.com/${encodedUsername}`;
  if (platform === "codeforces") return `https://codeforces.com/profile/${encodedUsername}`;
  return `https://leetcode.com/u/${encodedUsername}`;
}

export function normaliseProfileHandle(value, platform) {
  const input = String(value || "").trim();
  if (!input) return "";

  let candidate = input;
  const looksLikeProfileUrl = /^https?:\/\//i.test(input)
    || /(?:github\.com|codeforces\.com|leetcode\.com)/i.test(input);

  if (looksLikeProfileUrl) {
    try {
      const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
      const pathParts = url.pathname.split("/").filter(Boolean);

      if (platform === "codeforces") {
        const profileIndex = pathParts.findIndex((part) => part.toLowerCase() === "profile");
        candidate = profileIndex >= 0 ? pathParts[profileIndex + 1] || "" : pathParts.at(-1) || "";
      } else if (platform === "leetcode") {
        const userIndex = pathParts.findIndex((part) => ["u", "profile"].includes(part.toLowerCase()));
        candidate = userIndex >= 0 ? pathParts[userIndex + 1] || "" : pathParts.at(-1) || "";
      } else {
        candidate = pathParts.at(-1) || "";
      }
    } catch {
      candidate = input;
    }
  }

  let decodedCandidate;

  try {
    decodedCandidate = decodeURIComponent(candidate);
  } catch {
    decodedCandidate = candidate;
  }

  return decodedCandidate
    .replace(/^@/, "")
    .replace(/[?#].*$/, "")
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 80);
}

function createActivityRange(entries = [], start, end) {
  const counts = new Map(entries.map(({ date, count }) => [date, count]));
  const startDate = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  ));
  const endDate = new Date(Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  ));
  const dayCount = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / DAY_MS) + 1);

  return Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(startDate.getTime() + index * DAY_MS);
    const date = day.toISOString().slice(0, 10);

    return { date, count: Number(counts.get(date) || 0) };
  });
}

function createActivity(entries = []) {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end.getTime() - (ACTIVITY_DAYS - 1) * DAY_MS);

  return createActivityRange(entries, start, end);
}

function createYearActivity(entries = [], year = new Date().getUTCFullYear()) {
  const calendarYear = Number.isInteger(Number(year)) ? Number(year) : new Date().getUTCFullYear();
  const start = new Date(Date.UTC(calendarYear, 0, 1));
  const end = new Date(Date.UTC(calendarYear, 11, 31));

  return createActivityRange(entries, start, end);
}

function countActivityByDate(items, getDate) {
  const totals = new Map();

  for (const item of items) {
    const date = getDate(item);
    if (!date) continue;
    totals.set(date, (totals.get(date) || 0) + 1);
  }

  return [...totals].map(([date, count]) => ({ date, count }));
}

function emptyPlatform(provider, username = "", error = "") {
  return {
    provider,
    status: username ? "unavailable" : "unconfigured",
    username,
    profileUrl: username ? platformUrl(provider, username) : "",
    avatarUrl: "",
    description: "",
    metrics: [],
    activity: [],
    activityLabel: "",
    recentItems: [],
    details: {},
    error,
  };
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function activeDayCount(activity) {
  return activity.filter((day) => numberValue(day.count) > 0).length;
}

function rankedEntries(entries) {
  return [...entries.entries()]
    .map(([label, value]) => ({ label, value: numberValue(value) }))
    .filter((entry) => entry.label && entry.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
}

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const body = await response.text();
    let data = null;

    try {
      data = body ? JSON.parse(body) : null;
    } catch {
      throw new Error("The platform returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(`The platform returned ${response.status}.`);
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestText(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`The platform returned ${response.status}.`);
    }

    return body;
  } finally {
    clearTimeout(timeoutId);
  }
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseGitHubContributionCalendar(html) {
  const contributionDays = [];
  const dayPattern = /<td\b[^>]*\bdata-date="([^"]+)"[^>]*\bdata-level="([0-4])"[^>]*><\/td>\s*<tool-tip\b[^>]*>([\s\S]*?)<\/tool-tip>/g;
  let match;

  while ((match = dayPattern.exec(html)) !== null) {
    const date = match[1];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const tooltipText = match[3].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const countMatch = tooltipText.match(/([\d,]+)\s+contributions?/i);
    const count = countMatch
      ? Number.parseInt(countMatch[1].replace(/,/g, ""), 10)
      : 0;

    contributionDays.push({ date, count: Number.isFinite(count) ? count : 0 });
  }

  return contributionDays;
}

async function getGitHubPublicContributions(username) {
  const to = new Date();
  const from = new Date(to.getTime() - 364 * DAY_MS);
  const endpoint = new URL(`https://github.com/users/${encodeURIComponent(username)}/contributions`);
  endpoint.searchParams.set("from", toDateKey(from));
  endpoint.searchParams.set("to", toDateKey(to));

  const html = await requestText(endpoint, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "portfolio-coding-progress",
    },
  });
  const activity = parseGitHubContributionCalendar(html);

  if (activity.length < 28) {
    throw new Error("GitHub contributions could not be loaded.");
  }

  return {
    total: activity.reduce((sum, day) => sum + numberValue(day.count), 0),
    activity,
    source: "public-profile",
  };
}

async function getGitHubApiContributions(username, token) {

  const to = new Date();
  const from = new Date(to.getTime() - 364 * DAY_MS);
  const query = `
    query PortfolioContributions($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;
  const response = await requestJson("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-coding-progress",
    },
    body: JSON.stringify({
      query,
      variables: {
        login: username,
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }),
  });

  if (response.errors?.length || !response.data?.user?.contributionsCollection) {
    throw new Error("GitHub contributions could not be loaded.");
  }

  const calendar = response.data.user.contributionsCollection.contributionCalendar;
  const activity = calendar.weeks.flatMap((week) => week.contributionDays).map((day) => ({
    date: day.date,
    count: day.contributionCount,
  }));

  return { total: calendar.totalContributions, activity, source: "api" };
}

async function getGitHubContributions(username, token) {
  if (token) {
    try {
      return await getGitHubApiContributions(username, token);
    } catch {
      // Public profiles can still expose their daily contribution calendar without a token.
    }
  }

  return getGitHubPublicContributions(username);
}

async function fetchGitHub(username) {
  const token = process.env.GITHUB_TOKEN || "";
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "portfolio-coding-progress",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const profile = await requestJson(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
  const [reposResult, eventsResult, contributionResult] = await Promise.allSettled([
    requestJson(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=100`, { headers }),
    requestJson(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=100`, { headers }),
    getGitHubContributions(profile.login || username, token),
  ]);
  const repos = reposResult.status === "fulfilled" && Array.isArray(reposResult.value) ? reposResult.value : [];
  const events = eventsResult.status === "fulfilled" && Array.isArray(eventsResult.value) ? eventsResult.value : [];
  const contributions = contributionResult.status === "fulfilled" ? contributionResult.value : null;
  const eventActivity = countActivityByDate(events, (event) => event.created_at?.slice(0, 10));
  const activity = contributions?.activity?.length ? contributions.activity : createActivity(eventActivity);
  const ownRepositories = repos.filter((repo) => !repo.fork);
  const repositorySource = ownRepositories.length ? ownRepositories : repos;
  const languages = new Map();

  for (const repository of repositorySource) {
    if (repository.language) {
      languages.set(repository.language, (languages.get(repository.language) || 0) + 1);
    }
  }

  const totalStars = repositorySource.reduce((total, repository) => total + numberValue(repository.stargazers_count), 0);
  const totalForks = repositorySource.reduce((total, repository) => total + numberValue(repository.forks_count), 0);
  const repositories = repositorySource.slice(0, 6).map((repository) => ({
    name: repository.name || "Untitled repository",
    description: repository.description || "No public description provided.",
    language: repository.language || "",
    stars: numberValue(repository.stargazers_count),
    forks: numberValue(repository.forks_count),
    updatedAt: repository.updated_at || "",
    url: repository.html_url || "",
    homepage: repository.homepage || "",
  }));
  const website = String(profile.blog || "").trim();

  return {
    provider: "github",
    status: "ready",
    username: profile.login || username,
    profileUrl: profile.html_url || platformUrl("github", username),
    avatarUrl: profile.avatar_url || "",
    description: profile.bio || "Public GitHub activity and recently updated repositories.",
    metrics: [
      { label: "Public repos", value: profile.public_repos || 0 },
      { label: "Followers", value: profile.followers || 0 },
      { label: "Following", value: profile.following || 0 },
      {
        label: contributions ? "Year contributions" : "Recent events",
        value: contributions?.total ?? events.length,
      },
    ],
    activity,
    activityLabel: contributions ? "GitHub contributions" : "Public GitHub events",
    recentItems: repositories.map((repository) => ({
      title: repository.name,
      subtitle: [repository.language, repository.stars ? `${repository.stars} stars` : ""].filter(Boolean).join(" | "),
      url: repository.url,
    })),
    details: {
      profile: {
        name: profile.name || "",
        location: profile.location || "",
        company: profile.company || "",
        website,
        createdAt: profile.created_at || "",
        publicGists: numberValue(profile.public_gists),
      },
      activityDays: activeDayCount(activity),
      totalStars,
      totalForks,
      languages: rankedEntries(languages).slice(0, 8),
      repositories,
    },
    error: "",
  };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestCodeforces(method, parameters) {
  const search = new URLSearchParams(parameters);
  const data = await requestJson(`https://codeforces.com/api/${method}?${search.toString()}`, {
    headers: { "User-Agent": "portfolio-coding-progress" },
  });

  if (data.status !== "OK") {
    throw new Error(data.comment || "Codeforces could not return public data.");
  }

  return data.result;
}

async function fetchCodeforces(username) {
  const [user] = await requestCodeforces("user.info", { handles: username });
  let submissions = [];
  let ratingHistory = [];

  try {
    // Codeforces permits one anonymous API call every two seconds.
    await wait(2100);
    submissions = await requestCodeforces("user.status", { handle: username, from: "1", count: "10000" });
  } catch {
    // Rating history remains useful even when the public submissions feed fails.
  }

  try {
    // Keep anonymous API calls spaced so the rating request does not trip its rate limit.
    await wait(2100);
    ratingHistory = await requestCodeforces("user.rating", { handle: username });
  } catch {
    // A profile without rated contests can still return a complete solved-problem view.
  }

  const acceptedSubmissions = Array.isArray(submissions)
    ? submissions.filter((submission) => submission.verdict === "OK")
    : [];
  const solvedProblems = new Map();

  for (const submission of acceptedSubmissions) {
    const problem = submission.problem || {};
    const identity = `${problem.contestId || problem.problemsetName || "practice"}-${problem.index || problem.name || ""}`;
    if (!solvedProblems.has(identity)) solvedProblems.set(identity, problem);
  }

  const solved = [...solvedProblems.values()];
  const activity = createActivity(
    countActivityByDate(acceptedSubmissions, (submission) => {
      if (!submission.creationTimeSeconds) return "";
      return new Date(submission.creationTimeSeconds * 1000).toISOString().slice(0, 10);
    })
  );
  const tags = new Map();
  const ratings = new Map();

  for (const problem of solved) {
    for (const tag of problem.tags || []) {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    }

    const rating = numberValue(problem.rating);
    if (rating > 0) {
      const lowerBound = Math.floor(rating / 200) * 200;
      const label = `${lowerBound}-${lowerBound + 199}`;
      ratings.set(label, (ratings.get(label) || 0) + 1);
    }
  }

  const solvedByRating = rankedEntries(ratings)
    .sort((left, right) => numberValue(left.label.split("-")[0]) - numberValue(right.label.split("-")[0]))
    .slice(-10);
  const recentItems = acceptedSubmissions.slice(0, 6).map((submission) => ({
    title: submission.problem?.name || "Accepted problem",
    subtitle: [submission.problem?.rating ? `${submission.problem.rating}` : "", submission.problem?.tags?.[0] || ""].filter(Boolean).join(" | "),
    url: submission.contestId && submission.problem?.index
      ? `https://codeforces.com/contest/${submission.contestId}/problem/${submission.problem.index}`
      : "",
  }));
  const contests = Array.isArray(ratingHistory)
    ? ratingHistory.slice(-8).reverse().map((contest) => ({
      name: contest.contestName || "Rated contest",
      rank: numberValue(contest.rank),
      oldRating: numberValue(contest.oldRating),
      newRating: numberValue(contest.newRating),
      date: contest.ratingUpdateTimeSeconds
        ? new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString()
        : "",
    }))
    : [];
  const contestCount = Array.isArray(ratingHistory) ? ratingHistory.length : 0;

  return {
    provider: "codeforces",
    status: "ready",
    username: user.handle || username,
    profileUrl: platformUrl("codeforces", user.handle || username),
    avatarUrl: user.titlePhoto || "",
    description: user.rank ? `${user.rank}${user.rating ? ` | rating ${user.rating}` : ""}` : "Public Codeforces rating and accepted problems.",
    metrics: [
      { label: "Rating", value: user.rating || 0 },
      { label: "Max rating", value: user.maxRating || 0 },
      { label: "Solved", value: solved.length },
      { label: "Contests", value: contestCount },
    ],
    activity,
    activityLabel: "Accepted submissions",
    recentItems,
    details: {
      profile: {
        rank: user.rank || "Unrated",
        maxRank: user.maxRank || "",
        organization: user.organization || "",
        country: user.country || "",
        city: user.city || "",
        contribution: numberValue(user.contribution),
      },
      activityDays: activeDayCount(activity),
      topTags: rankedEntries(tags).slice(0, 10),
      solvedByRating,
      contests,
    },
    error: "",
  };
}

async function requestLeetCode(query, variables) {
  const data = await requestJson("https://leetcode.com/graphql/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "portfolio-coding-progress",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (data.errors?.length) {
    throw new Error("LeetCode could not return public profile data.");
  }

  return data.data;
}

function parseLeetCodeSubmissionCalendar(value) {
  let calendar = value;

  if (typeof value === "string") {
    try {
      calendar = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!calendar || typeof calendar !== "object" || Array.isArray(calendar)) {
    return [];
  }

  return Object.entries(calendar)
    .map(([timestamp, count]) => {
      const seconds = Number(timestamp);
      const date = new Date(seconds * 1000);

      if (!Number.isFinite(seconds) || Number.isNaN(date.getTime())) return null;

      return {
        date: toDateKey(date),
        count: numberValue(count),
      };
    })
    .filter(Boolean);
}

async function fetchLeetCode(username) {
  const calendarYear = new Date().getUTCFullYear();
  const query = `
    query PublicProfile($username: String!, $calendarYear: Int) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          userAvatar
          reputation
          solutionCount
          postViewCount
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
          totalSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        tagProblemCounts {
          advanced {
            tagName
            problemsSolved
          }
          intermediate {
            tagName
            problemsSolved
          }
          fundamental {
            tagName
            problemsSolved
          }
        }
        badges {
          id
          displayName
          icon
          creationDate
          category
        }
        userCalendar(year: $calendarYear) {
          activeYears
          streak
          totalActiveDays
          submissionCalendar
        }
      }
      recentAcSubmissionList(username: $username, limit: 10) {
        title
        titleSlug
        timestamp
      }
    }
  `;
  const data = await requestLeetCode(query, { username, calendarYear });
  const user = data?.matchedUser;

  if (!user) {
    throw new Error("LeetCode profile was not found.");
  }

  const acceptedByDifficulty = Object.fromEntries(
    (user.submitStatsGlobal?.acSubmissionNum || []).map((entry) => [entry.difficulty, entry])
  );
  const submittedByDifficulty = Object.fromEntries(
    (user.submitStatsGlobal?.totalSubmissionNum || []).map((entry) => [entry.difficulty, entry])
  );
  const solvedByDifficulty = Object.fromEntries(
    Object.entries(acceptedByDifficulty).map(([difficulty, entry]) => [difficulty, numberValue(entry?.count)])
  );
  const difficulties = ["Easy", "Medium", "Hard"].map((label) => ({
    label,
    solved: numberValue(acceptedByDifficulty[label]?.count),
    submissions: numberValue(
      submittedByDifficulty[label]?.submissions
      || submittedByDifficulty[label]?.count
    ),
  }));
  const languages = (user.languageProblemCount || [])
    .map((language) => ({ label: language.languageName, value: numberValue(language.problemsSolved) }))
    .filter((language) => language.label && language.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 10);
  const topics = ["fundamental", "intermediate", "advanced"]
    .flatMap((category) => (user.tagProblemCounts?.[category] || []).map((tag) => ({
      label: tag.tagName,
      value: numberValue(tag.problemsSolved),
      category,
    })))
    .filter((tag) => tag.label && tag.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
    .slice(0, 14);
  const badges = (user.badges || []).slice(0, 8).map((badge) => ({
    id: badge.id || badge.displayName,
    name: badge.displayName || "LeetCode badge",
    icon: badge.icon || "",
    category: badge.category || "",
    createdAt: badge.creationDate ? new Date(badge.creationDate * 1000).toISOString() : "",
  }));
  const recentItems = (data.recentAcSubmissionList || []).slice(0, 6).map((submission) => ({
    title: submission.title || "Accepted problem",
    subtitle: submission.timestamp ? new Date(numberValue(submission.timestamp) * 1000).toLocaleDateString("en-CA") : "",
    url: submission.titleSlug ? `https://leetcode.com/problems/${encodeURIComponent(submission.titleSlug)}/` : "",
  }));
  const allSubmissions = numberValue(
    submittedByDifficulty.All?.submissions
    || submittedByDifficulty.All?.count
  );
  const calendar = user.userCalendar || {};
  const activity = createYearActivity(
    parseLeetCodeSubmissionCalendar(calendar.submissionCalendar),
    calendarYear
  );

  return {
    provider: "leetcode",
    status: "ready",
    username: user.username || username,
    profileUrl: platformUrl("leetcode", user.username || username),
    avatarUrl: user.profile?.userAvatar || "",
    description: user.profile?.ranking ? `Global ranking #${user.profile.ranking}` : "Public LeetCode problem-solving totals.",
    metrics: [
      { label: "Solved", value: solvedByDifficulty.All || 0 },
      { label: "Easy", value: solvedByDifficulty.Easy || 0 },
      { label: "Medium", value: solvedByDifficulty.Medium || 0 },
      { label: "Hard", value: solvedByDifficulty.Hard || 0 },
    ],
    activity,
    activityLabel: "LeetCode submissions",
    recentItems,
    details: {
      profile: {
        realName: user.profile?.realName || "",
        ranking: numberValue(user.profile?.ranking),
        reputation: numberValue(user.profile?.reputation),
        solutionCount: numberValue(user.profile?.solutionCount),
        postViewCount: numberValue(user.profile?.postViewCount),
      },
      difficulties,
      languages,
      topics,
      badges,
      allSubmissions,
      activityDays: numberValue(calendar.totalActiveDays) || activeDayCount(activity),
      currentStreak: numberValue(calendar.streak),
      calendarYear,
      activeYears: Array.isArray(calendar.activeYears) ? calendar.activeYears : [],
    },
    error: "",
  };
}

async function safelyFetch(fetcher, provider, username) {
  if (!username) return emptyPlatform(provider);

  try {
    return await fetcher(username);
  } catch {
    return emptyPlatform(provider, username, "Public data is temporarily unavailable.");
  }
}

function buildConfiguration(content) {
  const section = content?.codingProgressSection || {};
  const profiles = {
    github: normaliseProfileHandle(section.githubProfile, "github"),
    codeforces: normaliseProfileHandle(section.codeforcesProfile, "codeforces"),
    leetcode: normaliseProfileHandle(section.leetcodeProfile, "leetcode"),
  };
  const refreshMinutes = readRefreshMinutes(section.refreshMinutes);

  return {
    profiles,
    refreshMinutes,
    fingerprint: JSON.stringify({ version: SNAPSHOT_VERSION, profiles, refreshMinutes }),
  };
}

function emptyProgress(configuration) {
  return {
    fetchedAt: null,
    refreshMinutes: configuration.refreshMinutes,
    hasConfiguredProfiles: false,
    platforms: {
      github: emptyPlatform("github"),
      codeforces: emptyPlatform("codeforces"),
      leetcode: emptyPlatform("leetcode"),
    },
  };
}

async function refreshSnapshot(configuration, existingSnapshot) {
  const platforms = await Promise.all([
    safelyFetch(fetchGitHub, "github", configuration.profiles.github),
    safelyFetch(fetchCodeforces, "codeforces", configuration.profiles.codeforces),
    safelyFetch(fetchLeetCode, "leetcode", configuration.profiles.leetcode),
  ]);
  const data = {
    fetchedAt: new Date().toISOString(),
    refreshMinutes: configuration.refreshMinutes,
    hasConfiguredProfiles: true,
    platforms: Object.fromEntries(platforms.map((platform) => [platform.provider, platform])),
  };
  const hasFreshData = platforms.some((platform) => platform.status === "ready");

  if (!hasFreshData && existingSnapshot?.fingerprint === configuration.fingerprint && existingSnapshot?.data?.platforms) {
    return { ...existingSnapshot.data, stale: true };
  }

  if (hasFreshData) {
    await CodingProgressSnapshot.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          fingerprint: configuration.fingerprint,
          fetchedAt: new Date(),
          data,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  return data;
}

export async function getCodingProgress(content, { force = false } = {}) {
  const configuration = buildConfiguration(content);

  if (!Object.values(configuration.profiles).some(Boolean)) {
    return emptyProgress(configuration);
  }

  const snapshot = await CodingProgressSnapshot.findOne({ key: "main" }).lean();
  const fetchedAt = snapshot?.fetchedAt ? new Date(snapshot.fetchedAt).getTime() : 0;
  const isFresh = snapshot?.fingerprint === configuration.fingerprint
    && Boolean(snapshot?.data?.platforms)
    && Date.now() - fetchedAt < configuration.refreshMinutes * 60 * 1000;

  if (!force && isFresh) return snapshot.data;

  if (!activeRefreshes.has(configuration.fingerprint)) {
    const refresh = refreshSnapshot(configuration, snapshot).finally(() => {
      activeRefreshes.delete(configuration.fingerprint);
    });

    activeRefreshes.set(configuration.fingerprint, refresh);
  }

  return activeRefreshes.get(configuration.fingerprint);
}

export async function refreshCodingProgress(content) {
  return getCodingProgress(content, { force: true });
}
