import { profile, metrics, skills, experience, education, heroLog } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Render content ---------- */
$("#heroTags").innerHTML = ["C#", "ASP.NET Core", "Angular", "React", "Azure", "AWS", "Kubernetes", "Azure OpenAI"]
  .map((t) => `<li>${esc(t)}</li>`).join("");

$("#summary").innerHTML = esc(profile.summary)
  .replace("enterprise applications", "<strong>enterprise applications</strong>")
  .replace("event-driven microservices", "<strong>event-driven microservices</strong>")
  .replace("Azure OpenAI", "<strong>Azure OpenAI</strong>");
$("#aboutRole").textContent = profile.role;
$("#aboutYears").textContent = `${profile.years} years`;
$("#aboutDomains").textContent = profile.domains.join(" · ");
$("#aboutEdu").textContent = "M.S. Information Systems, Pace";

// Metrics
$("#metrics").innerHTML = metrics.map((m, i) => `
  <div class="metric reveal" style="--w:${Math.min(100, m.value)}%; transition-delay:${i * 70}ms">
    <span class="check">✓ test_${String(i + 1).padStart(2, "0")} passed</span>
    <div class="num"><span data-count="${m.value}">0</span><sup>${esc(m.suffix)}</sup></div>
    <p>${esc(m.label)}</p>
    <span class="bar"></span>
  </div>`).join("");

// Experience
$("#deployList").innerHTML = experience.map((e, i) => `
  <li class="deploy reveal ${e.end === "Present" ? "current" : ""}">
    <article class="deploy-card ${i === 0 ? "open" : ""}">
      <button class="deploy-top" aria-expanded="${i === 0}" aria-controls="dep-${e.id}">
        <div>
          <div class="deploy-meta">
            <span class="hash">${e.id}</span>
            <span class="env">${e.end === "Present" ? "● production · live" : "✓ released"}</span>
            <span>${esc(e.domain)}</span>
            ${e.place ? `<span>${esc(e.place)}</span>` : ""}
          </div>
          <h3 class="deploy-co">${esc(e.company)}</h3>
          <span class="deploy-role">${esc(e.role)}</span>
        </div>
        <span class="deploy-when">${esc(e.start)}<br/>→ ${esc(e.end)}</span>
        <p class="deploy-hl">${esc(e.highlight)}</p>
        <span class="deploy-toggle">${i === 0 ? "− collapse changelog" : "+ expand changelog"} (${e.bullets.length} changes)</span>
      </button>
      <div class="deploy-body" id="dep-${e.id}">
        <div>
          <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          <div class="deploy-stack">${e.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
        </div>
      </div>
    </article>
  </li>`).join("");

$("#deployList").addEventListener("click", (ev) => {
  const btn = ev.target.closest(".deploy-top");
  if (!btn) return;
  const card = btn.parentElement;
  const open = card.classList.toggle("open");
  btn.setAttribute("aria-expanded", open);
  const n = card.querySelectorAll("li").length;
  btn.querySelector(".deploy-toggle").textContent = `${open ? "− collapse" : "+ expand"} changelog (${n} changes)`;
});

$("#eduList").innerHTML = education.map((ed) => `
  <div class="edu-card reveal">
    <span class="tag">// education · ${esc(ed.year)}</span>
    <h3>${esc(ed.degree)}</h3>
    <p>${esc(ed.school)} — ${esc(ed.place)}</p>
  </div>`).join("");

// Contact links
$("#mailLink").href = `mailto:${profile.email}`;
$("#mailLink span").textContent = profile.email;
$("#liLink").href = profile.linkedin;
$("#ghLink").href = profile.github;
$("#year").textContent = new Date().getFullYear();

/* ---------- Stack tabs + grep ---------- */
const cats = Object.keys(skills);
const tabs = $("#stackTabs");
tabs.innerHTML = cats.map((c, i) =>
  `<button class="stack-tab" role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)} <small>${skills[c].length}</small></button>`).join("");

function showCat(cat) {
  $$(".stack-tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.cat === cat));
  const slug = cat.toLowerCase().replace(/[^a-z]+/g, "-");
  $("#stackPanel").innerHTML =
    `<div class="manifest">&lt;ItemGroup Label="${esc(cat)}"&gt; — ${skills[cat].length} packages</div>` +
    skills[cat].map((s, i) => `<span class="pkg" style="animation-delay:${i * 35}ms">${esc(s)}</span>`).join("") +
    `<div class="manifest" style="margin:8px 0 0">&lt;/ItemGroup&gt; <span class="dim"># ${slug}.props</span></div>`;
}
tabs.addEventListener("click", (e) => { const b = e.target.closest(".stack-tab"); if (b) showCat(b.dataset.cat); });
tabs.addEventListener("keydown", (e) => {
  if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault();
  const i = cats.indexOf(document.activeElement.dataset.cat);
  const n = cats[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + cats.length) % cats.length];
  showCat(n); $(`.stack-tab[data-cat="${n}"]`).focus();
});
showCat(cats[0]);

$("#skillSearch").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const out = $("#searchOut");
  if (!q) { out.textContent = ""; return; }
  const hits = [];
  for (const c of cats) for (const s of skills[c]) if (s.toLowerCase().includes(q)) hits.push([c, s]);
  const used = experience.filter((x) => (x.stack.join(" ") + x.bullets.join(" ")).toLowerCase().includes(q)).map((x) => x.company);
  if (!hits.length && !used.length) { out.innerHTML = `0 matches for "<mark>${esc(q)}</mark>" — try asking the AI agent.`; return; }
  out.innerHTML = (hits.length ? `${hits.length} match${hits.length > 1 ? "es" : ""}: ${hits.map(([c, s]) => `<mark>${esc(s)}</mark> <span class="dim">(${esc(c)})</span>`).join(", ")}` : "")
    + (used.length ? `<br/>↳ used in production at ${used.map(esc).join(", ")}` : "");
  if (hits.length) showCat(hits[0][0]);
});

/* ---------- Hero terminal ---------- */
(async function typeLog() {
  const body = $("#termBody");
  const badge = $("#termBadge");
  const t0 = Date.now();
  const stamp = () => { const s = ((Date.now() - t0) / 1000).toFixed(1).padStart(4, " "); return `<span class="t-time">[${s}s]</span> `; };
  let html = "";
  for (const [kind, text] of heroLog) {
    const prefix = kind === "ok" ? "✓ " : kind === "live" ? "◆ " : "› ";
    let line = "";
    for (const ch of prefix + text) {
      line += ch;
      body.innerHTML = html + stamp() + `<span class="t-${kind}">${esc(line)}</span><span class="cur"></span>`;
      if (!reduced) await new Promise((r) => setTimeout(r, 14 + Math.random() * 18));
    }
    html += stamp() + `<span class="t-${kind}">${esc(line)}</span>\n`;
    if (!reduced) await new Promise((r) => setTimeout(r, kind === "info" ? 380 : 160));
  }
  body.innerHTML = html + `<span class="cur"></span>`;
  badge.textContent = "passed"; badge.classList.add("ok");
})();

/* ---------- Reveal + counters ---------- */
function countUp(el) {
  const target = +el.dataset.count;
  if (reduced) { el.textContent = target; return; }
  const start = performance.now(), dur = 1400;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
$$(".stage-head, .about-grid, .stack-wrap, .release-grid").forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    en.target.classList.add("in");
    en.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(en.target);
  }
}, { threshold: 0.15 });
$$(".reveal").forEach((el) => io.observe(el));

/* ---------- Pipeline rail ---------- */
const stages = $$("[data-section]");
const railLinks = $$(".rail a");
function updateRail() {
  const y = scrollY + innerHeight * 0.4;
  let idx = 0;
  stages.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
  if (innerHeight + scrollY >= document.body.scrollHeight - 4) idx = stages.length - 1;
  railLinks.forEach((a, i) => {
    a.classList.toggle("done", i < idx);
    a.classList.toggle("active", i === idx);
  });
  const max = document.body.scrollHeight - innerHeight;
  $("#railFill").style.height = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
}
addEventListener("scroll", updateRail, { passive: true });
addEventListener("resize", updateRail);
updateRail();

/* ---------- Theme ---------- */
$("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
});

/* ---------- Mesh background (microservice graph) ---------- */
(function mesh() {
  const c = $("#mesh");
  const ctx = c.getContext("2d");
  let w, h, nodes = [], dpr = Math.min(devicePixelRatio || 1, 2);
  const mouse = { x: -999, y: -999 };
  function resize() {
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    const count = Math.round(Math.min(70, (innerWidth * innerHeight) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.6 + 0.8) * dpr, pulse: Math.random() * Math.PI * 2,
    }));
  }
  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  resize();
  const link = 150 * dpr;
  function frame() {
    const rgb = getComputedStyle(document.documentElement).getPropertyValue("--mesh").trim();
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      if (!reduced) { n.x += n.vx; n.y += n.vy; n.pulse += 0.02; }
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dm = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      if (dm < 180 * dpr) { n.x += (n.x - mouse.x) * 0.006; n.y += (n.y - mouse.y) * 0.006; }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / link) * 0.16})`;
          ctx.lineWidth = dpr * 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${rgb},${0.35 + Math.sin(n.pulse) * 0.2})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();

/* ---------- Command palette ---------- */
const cmds = [
  { label: "Go to › About", hint: "restore", run: () => go("#about") },
  { label: "Go to › Tech stack", hint: "build", run: () => go("#stack") },
  { label: "Go to › Impact", hint: "test", run: () => go("#impact") },
  { label: "Go to › Experience", hint: "deploy", run: () => go("#deploys") },
  { label: "Go to › Contact", hint: "release", run: () => go("#release") },
  { label: "Ask the AI agent", hint: "chat", run: () => window.dispatchEvent(new CustomEvent("open-chat")) },
  { label: "Toggle theme", hint: "light/dark", run: () => $("#themeToggle").click() },
  { label: "Copy email address", hint: profile.email, run: () => navigator.clipboard?.writeText(profile.email) },
  { label: "Open LinkedIn", hint: "↗", run: () => open(profile.linkedin, "_blank", "noopener") },
];
const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
let filtered = cmds, sel = 0, lastFocus = null;
function go(h) { $(h).scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
function renderPal() {
  const q = pin.value.toLowerCase();
  filtered = cmds.filter((c) => (c.label + c.hint).toLowerCase().includes(q));
  sel = Math.min(sel, Math.max(0, filtered.length - 1));
  plist.innerHTML = filtered.map((c, i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}">${esc(c.label)} <small>${esc(c.hint)}</small></li>`).join("")
    || `<li>No command. Press Enter to ask the agent “${esc(pin.value)}”.</li>`;
}
function openPal() { lastFocus = document.activeElement; pal.hidden = false; pin.value = ""; sel = 0; renderPal(); pin.focus(); }
function closePal() { pal.hidden = true; lastFocus?.focus?.(); }
function runSel() {
  const c = filtered[sel];
  const q = pin.value.trim();
  closePal();
  if (c) c.run();
  else if (q) window.dispatchEvent(new CustomEvent("open-chat", { detail: { ask: q } }));
}
$("#openPalette").addEventListener("click", openPal);
addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
  else if (e.key === "/" && pal.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openPal(); }
});
pin.addEventListener("input", () => { sel = 0; renderPal(); });
pin.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, filtered.length); renderPal(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(1, filtered.length); renderPal(); }
  else if (e.key === "Enter") { e.preventDefault(); runSel(); }
  else if (e.key === "Escape") closePal();
});
plist.addEventListener("click", (e) => { const li = e.target.closest("li[data-i]"); if (li) { sel = +li.dataset.i; runSel(); } });
pal.addEventListener("click", (e) => { if (e.target === pal) closePal(); });
