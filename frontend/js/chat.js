import { profile, skills, experience, education, metrics } from "./data.js";

const $ = (s) => document.querySelector(s);
const panel = $("#agent"), log = $("#agentLog"), form = $("#agentForm"), input = $("#agentText");
const fab = $("#agentFab"), chips = $("#agentChips"), sub = $("#agentSub");
const KEY = "agent-history-v1";
const MAX_TURNS = 12;

let history = [];
try { history = JSON.parse(sessionStorage.getItem(KEY)) || []; } catch {}
let busy = false;

const suggestions = [
  "What's his strongest stack?",
  "Tell me about State Farm",
  "Has he used Azure OpenAI?",
  "Microservices experience?",
  "Why should we hire him?",
  "How do I contact him?",
];

/* ---------- Safe mini-markdown ---------- */
function esc(s) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function md(text) {
  const lines = esc(text).split(/\n/);
  let html = "", inList = false;
  for (let line of lines) {
    line = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    const li = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)/);
    if (li) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${li[1]}</li>`; continue; }
    if (inList) { html += "</ul>"; inList = false; }
    if (line.trim()) html += `<p>${line}</p>`;
  }
  return html + (inList ? "</ul>" : "");
}

/* ---------- UI ---------- */
function addMsg(role, text, note) {
  const el = document.createElement("div");
  el.className = `msg ${role === "user" ? "user" : "bot"}`;
  el.innerHTML = role === "user" ? esc(text) : md(text) + (note ? `<span class="src">${esc(note)}</span>` : "");
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}
function greet() {
  addMsg("assistant",
    `Hi! I'm **Abhinav's AI agent**. I've read his résumé end-to-end — ask me about his ${profile.years} years in .NET, Angular/React, Azure & AWS, the systems he's shipped, or whether he fits your role.`);
}
function renderChips() {
  chips.innerHTML = suggestions.map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join("");
}
function restore() {
  log.innerHTML = "";
  greet();
  for (const m of history) addMsg(m.role, m.content);
}
function openChat(ask) {
  panel.hidden = false;
  fab.classList.add("hide");
  if (!log.children.length) restore();
  input.focus();
  if (ask) send(ask);
}
function closeChat() { panel.hidden = true; fab.classList.remove("hide"); fab.focus(); }

document.addEventListener("click", (e) => { if (e.target.closest("[data-open-chat]")) openChat(); });
addEventListener("open-chat", (e) => openChat(e.detail?.ask));
$("#agentClose").addEventListener("click", closeChat);
$("#agentReset").addEventListener("click", () => { history = []; sessionStorage.removeItem(KEY); restore(); });
panel.addEventListener("keydown", (e) => { if (e.key === "Escape") closeChat(); });
chips.addEventListener("click", (e) => { const c = e.target.closest(".chip"); if (c) send(c.textContent); });
input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; });
input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
renderChips();

/* ---------- Send ---------- */
async function send(raw) {
  const text = (raw || "").trim().slice(0, 1000);
  if (!text || busy) return;
  busy = true;
  form.querySelector(".send").disabled = true;
  input.value = ""; input.style.height = "auto";
  addMsg("user", text);
  history.push({ role: "user", content: text });
  const pending = document.createElement("div");
  pending.className = "msg bot";
  pending.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  log.appendChild(pending); log.scrollTop = log.scrollHeight;
  panel.classList.add("thinking");

  let reply, note;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-MAX_TURNS) }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.reply) throw new Error("empty");
    reply = data.reply;
    sub.textContent = "powered by Ollama · answers from Abhinav's résumé";
  } catch {
    reply = localAnswer(text);
    note = "offline mode · instant answer from résumé index";
  }
  pending.remove();
  panel.classList.remove("thinking");
  await typeOut(reply, note);
  history.push({ role: "assistant", content: reply });
  history = history.slice(-MAX_TURNS * 2);
  try { sessionStorage.setItem(KEY, JSON.stringify(history)); } catch {}
  busy = false;
  form.querySelector(".send").disabled = false;
}

async function typeOut(text, note) {
  const el = addMsg("assistant", "", null);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { el.innerHTML = md(text) + (note ? `<span class="src">${esc(note)}</span>` : ""); return; }
  const words = text.split(/(\s+)/);
  let acc = "";
  for (let i = 0; i < words.length; i++) {
    acc += words[i];
    if (i % 3 === 0 || i === words.length - 1) {
      el.innerHTML = md(acc);
      log.scrollTop = log.scrollHeight;
      await new Promise((r) => setTimeout(r, 18));
    }
  }
  el.innerHTML = md(text) + (note ? `<span class="src">${esc(note)}</span>` : "");
  log.scrollTop = log.scrollHeight;
}

/* ---------- Offline résumé index (fallback when /api/chat is unavailable) ---------- */
const allSkills = Object.entries(skills).flatMap(([c, list]) => list.map((s) => ({ c, s })));
function localAnswer(q) {
  const t = q.toLowerCase();
  const has = (...w) => w.some((x) => t.includes(x));

  const job = experience.find((e) => t.includes(e.company.toLowerCase().split(" ")[0]) || (e.company === "HCL Technologies" && has("hcl")));
  if (job) {
    return `**${job.role} @ ${job.company}** (${job.start} – ${job.end}${job.place ? `, ${job.place}` : ""})\n\n${job.highlight}\n\n${job.bullets.slice(0, 5).map((b) => `- ${b}`).join("\n")}\n\nStack: ${job.stack.map((s) => `\`${s}\``).join(" ")}`;
  }
  if (has("contact", "email", "reach", "hire him", "linkedin", "phone", "call")) {
    return `You can reach Abhinav at [${profile.email}](mailto:${profile.email}) or on [LinkedIn](${profile.linkedin}).`;
  }
  if (has("why", "fit", "hire", "strength", "best", "stand out")) {
    return `A few reasons teams hire Abhinav:\n- **${profile.years} years** of full-stack .NET across insurance, banking and travel at State Farm, Regions Bank and HCL.\n- **Owns the whole path to prod** — APIs, Angular/React UIs, and the CI/CD that ships them (deployments 50% faster).\n- **Performance-minded** — Redis caching −45% latency, microservices +35% throughput.\n- **Quality** — 85%+ coverage with xUnit/Moq, −18% production defects.\n- **AI-ready** — has integrated Azure OpenAI and AI-driven recommendations in production.`;
  }
  if (/\bai\b/.test(t) || has("openai", "llm", "genai", "rag", "copilot", "claude", "machine learning")) {
    return `Yes. Abhinav integrates AI in production with **Azure OpenAI**, Azure AI Search, OpenAI API, prompt engineering and RAG patterns. At Regions Bank he built AI-driven loan recommendations into the SalesPro mobile app (−25% processing time), and he uses GitHub Copilot and Claude Code daily to ship faster.`;
  }
  if (has("microservice", "kafka", "event", "rabbit", "cqrs", "ddd", "architecture", "service bus")) {
    return `Architecture is a core strength:\n- Led the split of State Farm's policy monolith into **.NET Core microservices** (+35% transaction performance), running on AWS EKS.\n- Event-driven systems: **Kafka** between policy and claims services at State Farm (idempotent consumers, dead-letter handling), **Azure Service Bus** at Regions Bank (−30% failed transactions at peak), and **RabbitMQ** with CQRS at HCL.\n- Clean Architecture & SOLID; REST, GraphQL and gRPC between services.`;
  }
  if (has("cloud", "azure", "aws", "devops", "ci/cd", "pipeline", "kubernetes", "docker", "deploy")) {
    return `Cloud & DevOps: **Azure** (App Service, Functions, AKS, Service Bus, Cosmos DB, Key Vault, APIM, Azure AD) and **AWS** (EKS, ECS Fargate, EC2, Cognito, CloudWatch). He builds CI/CD in Azure DevOps and GitHub Actions — cutting deployment time by 50% and enabling zero-downtime releases at Regions Bank.`;
  }
  if (has("front", "angular", "react", "ui", "ux", "typescript")) {
    return `Frontend: **Angular** with NgRx/RxJS (State Farm, Regions Bank), **React** with Redux (HCL), TypeScript and Tailwind. He translates Figma into accessible components and improved WCAG scores at Regions Bank; he also shipped an Angular + Capacitor hybrid app for iOS/Android.`;
  }
  if (has("observab", "monitor", "logging", "tracing", "dynatrace", "splunk", "serilog", "grafana", "new relic", "app insights")) {
    return `Observability: **Dynatrace** (APM, distributed tracing) and **Application Insights** at Regions Bank cut incident resolution time **35%**; **New Relic, CloudWatch and Grafana** at State Farm protect SLAs; and at HCL he centralized **Splunk** logging with **Serilog** structured logs tagged by correlation ID.`;
  }
  if (has("test", "quality", "coverage", "xunit")) {
    return `Testing is part of his definition of done: xUnit, NUnit, MSTest and Moq on the backend; Playwright, Cypress and Jasmine/Karma on the frontend. At State Farm his unit, integration and end-to-end suites (xUnit + Moq, Jasmine/Karma, Cypress) raised coverage above **85%** (−18% production defects) and from 40% to 75% at HCL.`;
  }
  if (has("database", "sql", "postgres", "redis", "cache", "performance")) {
    return `Data & performance: SQL Server, Azure SQL, PostgreSQL, Oracle, MongoDB and Redis. Highlights — Redis caching cut API latency **45%** at Regions Bank and **30%** at HCL; query and index tuning for large transactional workloads at State Farm.`;
  }
  if (has("security", "oauth", "jwt", "hipaa", "pci", "auth")) {
    return `Security: OAuth 2.0, JWT, Azure AD, .NET Identity, RBAC and Cognito; he has delivered **PCI-DSS** compliance in banking, HIPAA-aligned controls in healthcare, and GDPR compliance for passenger data at HCL.`;
  }
  if (has("educat", "degree", "master", "university", "college")) {
    return education.map((e) => `- **${e.degree}** — ${e.school}, ${e.place} (${e.year})`).join("\n");
  }
  if (has("experience", "years", "background", "about", "who", "summary", "stack")) {
    return `Abhinav is a **${profile.role}** with **${profile.years} years** of experience. ${profile.summary}\n\nRecent roles:\n${experience.map((e) => `- ${e.role} @ **${e.company}** (${e.start} – ${e.end})`).join("\n")}`;
  }
  const skillHits = allSkills.filter(({ s }) => s.toLowerCase().split(/[\s/]+/).some((w) => w.length > 2 && t.includes(w.toLowerCase())));
  if (skillHits.length) {
    return `Yes — ${skillHits.slice(0, 6).map(({ s, c }) => `**${s}** (${c})`).join(", ")} ${skillHits.length > 1 ? "are" : "is"} part of Abhinav's toolkit. Ask about a specific role to see where he used it.`;
  }
  if (has("metric", "impact", "result", "achiev")) {
    return metrics.map((m) => `- **${m.value}${m.suffix}** ${m.label}`).join("\n");
  }
  return `I'm not certain about that one from his résumé. I can tell you about his **experience** (State Farm, Regions Bank, HCL), **tech stack**, **AI work**, **impact metrics**, or how to **contact** him. For anything else, email [${profile.email}](mailto:${profile.email}).`;
}
