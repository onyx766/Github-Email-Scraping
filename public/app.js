const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Bulgaria", "Canada",
  "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Estonia", "Finland",
  "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia", "Iran", "Ireland",
  "Israel", "Italy", "Japan", "Kenya", "Malaysia", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "South Africa", "South Korea",
  "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
];

const PER_PAGE = 20;
const MAX_RESULTS = 1000; // GitHub search API caps results at 1000

const $ = (id) => document.getElementById(id);
const state = { page: 1 };

$("countries").innerHTML = COUNTRIES.map((c) => `<option value="${c}">`).join("");

const icons = {
  location: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"/></svg>',
  mail: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z"/></svg>',
  people: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"/></svg>',
  repo: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>',
  org: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"/></svg>',
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n ?? 0));

function renderUser(u) {
  const meta = [];
  if (u.location) meta.push(`<span>${icons.location}${esc(u.location)}</span>`);
  if (u.company) meta.push(`<span>${icons.org}${esc(u.company)}</span>`);
  if (u.email) meta.push(`<span class="email">${icons.mail}<a href="mailto:${esc(u.email)}">${esc(u.email)}</a><button type="button" class="copy" data-copy="${esc(u.email)}" title="Copy email">Copy</button></span>`);
  if (u.followers != null) meta.push(`<span>${icons.people}${fmt(u.followers)} followers</span>`);
  if (u.public_repos != null) meta.push(`<span>${icons.repo}${fmt(u.public_repos)} repositories</span>`);

  return `
    <li class="user">
      <img src="${esc(u.avatar_url)}&s=80" alt="" loading="lazy" />
      <div class="body">
        <div class="title">
          <a class="name" href="${esc(u.html_url)}" target="_blank" rel="noopener">${esc(u.name || u.login)}</a>
          ${u.name ? `<a class="login" href="${esc(u.html_url)}" target="_blank" rel="noopener">${esc(u.login)}</a>` : ""}
        </div>
        ${u.bio ? `<p class="bio">${esc(u.bio)}</p>` : ""}
        <div class="meta">${meta.join("")}</div>
      </div>
    </li>`;
}

function renderPager(total) {
  const pages = Math.ceil(Math.min(total, MAX_RESULTS) / PER_PAGE);
  if (pages <= 1) return ($("pager").innerHTML = "");
  const p = state.page;
  const nums = new Set([1, pages, p - 2, p - 1, p, p + 1, p + 2].filter((n) => n >= 1 && n <= pages));
  const sorted = [...nums].sort((a, b) => a - b);

  let html = `<button data-page="${p - 1}" ${p === 1 ? "disabled" : ""}>‹ Previous</button>`;
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) html += `<button disabled>…</button>`;
    html += `<button data-page="${n}" class="${n === p ? "current" : ""}">${n}</button>`;
  });
  html += `<button data-page="${p + 1}" ${p === pages ? "disabled" : ""}>Next ›</button>`;
  $("pager").innerHTML = html;
}

async function search() {
  const country = $("country").value.trim();
  const keyword = $("keyword").value.trim();
  if (!country && !keyword) {
    $("status").textContent = "Enter a country to search.";
    return;
  }
  const [sort, order] = ($("sort").value || "|").split("|");
  const params = new URLSearchParams({
    country, keyword, sort, order,
    language: $("language").value.trim(),
    minFollowers: $("minFollowers").value,
    minRepos: $("minRepos").value,
    page: state.page,
    per_page: PER_PAGE,
  });

  $("status").className = "status";
  $("status").textContent = "Searching…";
  $("list").innerHTML = "";
  $("pager").innerHTML = "";
  $("copyAll").hidden = true;

  try {
    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    if (!res.ok) {
      let msg = data.error || "Search failed.";
      if (data.rateLimitReset) {
        msg += ` Rate limit resets at ${new Date(data.rateLimitReset * 1000).toLocaleTimeString()}.`;
      }
      throw new Error(msg);
    }

    let users = data.users;
    if ($("emailOnly").checked) users = users.filter((u) => u.email);

    $("count").textContent = `${data.total_count.toLocaleString()} users`;
    $("status").textContent = $("emailOnly").checked
      ? `Showing ${users.length} of ${data.users.length} users on this page with a public email.`
      : "";
    $("list").innerHTML = users.map(renderUser).join("");
    state.emails = users.map((u) => u.email).filter(Boolean);
    $("copyAll").hidden = !state.emails.length;
    $("copyAll").textContent = `Copy ${state.emails.length} emails`;
    if (!users.length) $("status").textContent ||= "No users matched.";
    renderPager(data.total_count);
  } catch (err) {
    $("status").className = "status error";
    $("status").textContent = err.message;
  }
}

function newSearch(e) {
  e?.preventDefault();
  state.page = 1;
  search();
}

$("filters").addEventListener("submit", newSearch);
$("topSearch").addEventListener("submit", newSearch);
$("sort").addEventListener("change", newSearch);
$("emailOnly").addEventListener("change", () => search());
async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const label = button.textContent;
  button.textContent = "Copied!";
  setTimeout(() => (button.textContent = label), 1200);
}

$("list").addEventListener("click", (e) => {
  const btn = e.target.closest("button.copy");
  if (btn) copyText(btn.dataset.copy, btn);
});
$("copyAll").addEventListener("click", (e) => copyText(state.emails.join("\n"), e.currentTarget));

$("pager").addEventListener("click", (e) => {
  const page = Number(e.target.dataset.page);
  if (!page || e.target.disabled) return;
  state.page = page;
  search();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
