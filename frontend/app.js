const $ = (id) => document.getElementById(id);
const form = $("form"), fileInput = $("file"), drop = $("drop");

// Light / dark theme switch (choice is remembered in localStorage)
$("theme-toggle").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
});

function scoreColor(n) {
  return n >= 75 ? "var(--good)" : n >= 50 ? "var(--warn)" : "var(--bad)";
}

function setFile(file) {
  if (!file) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  fileInput.files = dt.files;
  $("drop-text").textContent = file.name;
  $("submit").disabled = false;
}

fileInput.addEventListener("change", () => setFile(fileInput.files[0]));
["dragenter", "dragover"].forEach((e) =>
  drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach((e) =>
  drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", (ev) => setFile(ev.dataTransfer.files[0]));

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  $("error").hidden = true;
  form.hidden = true;
  $("loading").hidden = false;

  try {
    const res = await fetch("/api/analyze", { method: "POST", body: new FormData(form) });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.detail || `Request failed (${res.status})`);
    render(body);
  } catch (err) {
    form.hidden = false;
    $("error").textContent = err.message;
    $("error").hidden = false;
  } finally {
    $("loading").hidden = true;
  }
});

$("again").addEventListener("click", () => {
  $("results").hidden = true;
  form.reset();
  $("drop-text").textContent = "Drop your resume here or click to browse";
  $("submit").disabled = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  Object.assign(node, attrs);
  if (text !== undefined) node.textContent = text;
  return node;
}

function ring(node, score, label) {
  node.style.setProperty("--pct", score);
  node.style.setProperty("--color", scoreColor(score));
  node.replaceChildren(el("span", {}, score));
  node.firstChild.append(el("small", {}, label));
}

function fillList(id, items) {
  $(id).replaceChildren(...items.map((t) => el("li", {}, t)));
}

function fillChips(id, items) {
  $(id).replaceChildren(...(items.length ? items.map((t) => el("span", {}, t)) : [el("em", { className: "muted" }, "None")]));
}

function render(d) {
  ring($("overall"), d.overall_score, "Overall");
  ring($("ats"), d.ats_score, "ATS");

  const c = d.candidate;
  const details = [c.current_title, c.location, c.years_experience ? `${c.years_experience} yrs experience` : "", c.email, c.phone]
    .filter(Boolean);
  $("candidate").replaceChildren(el("strong", {}, c.name || "Candidate"), el("div", { className: "muted" }, details.join(" · ")));

  $("summary").textContent = d.summary;
  fillList("strengths", d.strengths);
  fillList("weaknesses", d.weaknesses);

  const jm = d.job_match;
  $("match").hidden = $("job-card").hidden = !jm;
  if (jm) {
    ring($("match"), jm.match_score, "Job match");
    $("verdict").textContent = jm.verdict;
    const banner = $("shortlist");
    banner.className = `shortlist ${jm.shortlisted ? "pass" : "fail"}`;
    banner.replaceChildren(
      el("span", { className: "icon" }, jm.shortlisted ? "✓" : "✕"),
      el("div"),
    );
    banner.lastChild.append(
      el("strong", {}, jm.shortlisted
        ? `${jm.match_score}% match – Eligible for shortlisting`
        : `${jm.match_score}% match – Doesn't match the role well`),
      el("div", { className: "muted" }, jm.shortlisted
        ? `Meets the ${jm.threshold}% shortlisting threshold for this job description.`
        : `Below the ${jm.threshold}% shortlisting threshold. Close the missing-skill gaps below to improve the fit.`),
    );
    fillChips("matched", jm.matched_skills);
    fillChips("missing", jm.missing_skills);
  }

  $("sections").replaceChildren(...d.section_scores.map((s) => {
    const row = el("div", { className: "section-row" });
    const head = el("div", { className: "section-head" });
    head.append(el("span", {}, s.section), el("span", {}, `${s.score}/100`));
    const bar = el("div", { className: "bar" });
    const fill = el("div");
    fill.style.width = `${s.score}%`;
    fill.style.background = scoreColor(s.score);
    bar.append(fill);
    row.append(head, bar, el("div", { className: "muted" }, s.feedback));
    return row;
  }));

  const order = { high: 0, medium: 1, low: 2 };
  $("suggestions").replaceChildren(...[...d.suggestions]
    .sort((a, b) => order[a.priority] - order[b.priority])
    .map((s) => {
      const row = el("div", { className: "suggestion" });
      const text = el("div");
      text.append(el("strong", {}, s.area), el("div", {}, s.suggestion));
      row.append(el("span", { className: `badge ${s.priority}` }, s.priority), text);
      return row;
    }));

  fillChips("tech", d.skills.technical);
  fillChips("soft", d.skills.soft);

  $("results").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
