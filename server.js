// Small zero-dependency server: serves the UI and proxies GitHub's user search API.
// Only emails that users have made public on their GitHub profile are returned.

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const TOKEN = process.env.GITHUB_TOKEN || "";
const PUBLIC_DIR = path.join(__dirname, "public");
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map();

async function gh(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.time < CACHE_TTL_MS) return hit.data;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "github-user-search",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `GitHub API error ${res.status}`);
    err.status = res.status;
    err.rateLimitReset = res.headers.get("x-ratelimit-reset");
    throw err;
  }
  cache.set(url, { time: Date.now(), data });
  return data;
}

function buildQuery({ country, keyword, language, minFollowers, minRepos }) {
  const parts = [];
  if (keyword) parts.push(keyword);
  if (country) parts.push(`location:"${country.replace(/"/g, "")}"`);
  if (language) parts.push(`language:"${language.replace(/"/g, "")}"`);
  if (minFollowers) parts.push(`followers:>=${Number(minFollowers)}`);
  if (minRepos) parts.push(`repos:>=${Number(minRepos)}`);
  parts.push("type:user");
  return parts.join(" ");
}

async function searchUsers(params) {
  const page = Math.max(1, Math.min(50, Number(params.page) || 1));
  const perPage = Math.max(1, Math.min(30, Number(params.per_page) || 20));
  const sort = ["followers", "repositories", "joined"].includes(params.sort) ? params.sort : "";
  const order = params.order === "asc" ? "asc" : "desc";

  const q = buildQuery(params);
  const url =
    `https://api.github.com/search/users?q=${encodeURIComponent(q)}` +
    `&page=${page}&per_page=${perPage}` +
    (sort ? `&sort=${sort}&order=${order}` : "");

  const search = await gh(url);

  // Search results are minimal; fetch each profile for name, bio, location, public email.
  const users = await Promise.all(
    search.items.map(async (item) => {
      try {
        const u = await gh(`https://api.github.com/users/${encodeURIComponent(item.login)}`);
        return {
          login: u.login,
          name: u.name,
          avatar_url: u.avatar_url,
          html_url: u.html_url,
          bio: u.bio,
          company: u.company,
          location: u.location,
          email: u.email, // null unless the user made it public
          blog: u.blog,
          twitter_username: u.twitter_username,
          followers: u.followers,
          public_repos: u.public_repos,
          created_at: u.created_at,
        };
      } catch {
        return { login: item.login, avatar_url: item.avatar_url, html_url: item.html_url };
      }
    })
  );

  return {
    query: q,
    total_count: search.total_count,
    incomplete_results: search.incomplete_results,
    page,
    per_page: perPage,
    users,
  };
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": MIME[".json"] });
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/search") {
    const params = Object.fromEntries(url.searchParams);
    if (!params.country && !params.keyword) {
      return sendJson(res, 400, { error: "Enter a country or a keyword." });
    }
    try {
      sendJson(res, 200, await searchUsers(params));
    } catch (err) {
      sendJson(res, err.status || 500, { error: err.message, rateLimitReset: err.rateLimitReset });
    }
    return;
  }

  // Static files
  const rel = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
  if (!TOKEN) console.log("Tip: set GITHUB_TOKEN for higher API rate limits.");
});
