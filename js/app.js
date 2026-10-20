/* Golden Frame — site logic. Settings live in config.js, texts in i18n.js */
let lang = "en";
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const t = k => (I18N[lang][k] ?? k);
const attr = s => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");

/* ---------- placeholder art (used when an item has no `src`) ---------- */
function art(hue, label){
  const a = `hsl(${hue} 55% 22%)`, b = `hsl(${(hue+40)%360} 60% 10%)`, c = `hsl(${hue} 70% 62%)`;
  const id = Math.random().toString(36).slice(2,8);
  return `<svg class="art" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${attr(label)}">
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <radialGradient id="r${id}" cx=".7" cy=".3" r=".6"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>
    <rect width="320" height="200" fill="url(#g${id})"/><rect width="320" height="200" fill="url(#r${id})"/>
    <path d="M0 200 L0 150 L50 120 L95 150 L150 100 L210 148 L260 118 L320 152 L320 200Z" fill="#000" opacity=".35"/>
    <path d="M0 200 L0 175 L70 155 L130 178 L200 150 L270 176 L320 160 L320 200Z" fill="#000" opacity=".5"/>
    <rect x="12" y="12" width="296" height="176" fill="none" stroke="#d4a843" stroke-opacity=".35"/>
    <rect x="148" y="38" width="24" height="24" fill="none" stroke="#f1d588" stroke-opacity=".7" transform="rotate(45 160 50)"/>
  </svg>`;
}
const media = (item, label) => item.src
  ? `<img src="${attr(item.src)}" alt="${attr(label)}" loading="lazy">`
  : art(item.hue, label);

/* ---------- render ---------- */
function renderProjects(){
  $("#projectList").innerHTML = CONFIG.projects.map(p => `
    <article class="card">
      <div class="thumb">${media(p, p.name)}</div>
      <div class="body">
        <h3>${attr(p.name)}</h3>
        <div class="tags">${p.tags.map(x=>`<span class="tag">${attr(x)}</span>`).join("")}</div>
        <p>${attr(p[lang])}</p>
        <div class="links">
          <a href="${attr(p.live)}" target="_blank" rel="noopener">${t("proj.live")}</a>
          ${p.repo ? `<a href="${attr(p.repo)}" target="_blank" rel="noopener">${t("proj.repo")}</a>` : ""}
        </div>
      </div>
    </article>`).join("");
}
function renderGallery(){
  $("#galleryGrid").innerHTML = CONFIG.gallery.map((g,i)=>`
    <button class="g-item" type="button" data-i="${i}" aria-label="${attr(g[lang])}">
      ${media(g, g[lang])}<div class="cap">${attr(g[lang])}</div>
    </button>`).join("");
}
function renderProjectOptions(){
  const opts = CONFIG.projects.map(p => p.name);
  opts.push(t("form.custom"));
  $("#projectOptions").innerHTML = opts.map(o => `<option value="${attr(o)}"></option>`).join("");
}
function renderFooterLinks(){
  const links = [];
  if(CONFIG.github) links.push(["GitHub", CONFIG.github]);
  if(CONFIG.telegram) links.push(["Telegram", CONFIG.telegram]);
  CONFIG.projects.forEach(p => links.push([p.name, p.live]));
  $("#footLinks").innerHTML = links.map(([n,u]) => `<a href="${attr(u)}" target="_blank" rel="noopener">${attr(n)}</a>`).join("");
}

/* ---------- language ---------- */
function applyLang(l){
  lang = l; document.documentElement.lang = l;
  try{ localStorage.setItem("gf_lang", l); }catch(e){}
  $$("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  $$("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  $$(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
  document.title = META[l].title;
  $('meta[name="description"]').setAttribute("content", META[l].desc);
  renderProjects(); renderGallery(); renderProjectOptions();
  if(lbOpen) showLb(lbIndex);
}
$$(".lang button").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));

/* ---------- contacts ---------- */
$("#cEmail").innerHTML = `<a href="mailto:${attr(CONFIG.email)}">${attr(CONFIG.email)}</a>`;
$("#cTg").innerHTML = `<a href="${attr(CONFIG.telegram)}" target="_blank" rel="noopener">${attr(CONFIG.telegram.replace(/^https?:\/\//,""))}</a>`;
$("#year").textContent = new Date().getFullYear();
renderFooterLinks();

/* ---------- mobile menu ---------- */
$("#burger").addEventListener("click", () => $("#menu").classList.toggle("open"));
$$("#menu a").forEach(a => a.addEventListener("click", () => $("#menu").classList.remove("open")));

/* ---------- lightbox ---------- */
let lbOpen=false, lbIndex=0;
function showLb(i){
  lbIndex = (i + CONFIG.gallery.length) % CONFIG.gallery.length;
  const g = CONFIG.gallery[lbIndex];
  $("#lbStage").innerHTML = media(g, g[lang]) + `<div class="cap">${attr(g[lang])}</div>`;
}
function openLb(i){ lbOpen=true; $("#lightbox").classList.add("open"); showLb(i); document.body.style.overflow="hidden"; }
function closeLb(){ lbOpen=false; $("#lightbox").classList.remove("open"); document.body.style.overflow=""; }
$("#galleryGrid").addEventListener("click", e => { const b = e.target.closest(".g-item"); if(b) openLb(+b.dataset.i); });
$("#lbClose").onclick = closeLb;
$("#lbPrev").onclick = () => showLb(lbIndex-1);
$("#lbNext").onclick = () => showLb(lbIndex+1);
$("#lightbox").addEventListener("click", e => { if(e.target.id==="lightbox") closeLb(); });
document.addEventListener("keydown", e => {
  if(!lbOpen) return;
  if(e.key==="Escape") closeLb();
  if(e.key==="ArrowLeft") showLb(lbIndex-1);
  if(e.key==="ArrowRight") showLb(lbIndex+1);
});

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if(!en.isIntersecting) return;
  en.target.classList.add("in"); io.unobserve(en.target);
}), {threshold:.12});
$$(".reveal").forEach(el => io.observe(el));

/* ---------- consultation form -> Telegram ---------- */
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const form = $("#consultForm"), statusEl = $("#formStatus"), btn = $("#submitBtn");
form.addEventListener("submit", async e => {
  e.preventDefault();
  const setStatus = (k, cls) => { statusEl.className = "status " + (cls||""); statusEl.textContent = t(k); };
  const d = Object.fromEntries(new FormData(form));
  if(d.website) return;                                            // honeypot (bots)
  const digits = (d.phone||"").replace(/\D/g,"");
  if(!d.name.trim() || digits.length < 7 || digits.length > 15 || !d.project.trim()) return setStatus("form.invalid","err");
  let last = 0; try{ last = +localStorage.getItem("gf_last")||0; }catch(e){}
  if(Date.now()-last < 60000) return setStatus("form.wait","err");
  if(!CONFIG.endpoint && !(CONFIG.botToken && CONFIG.chatId)) return setStatus("form.noconf","err");

  const text =
    `🟡 <b>New consultation request — Golden Frame</b>\n\n` +
    `<b>Name:</b> ${esc(d.name.trim())}\n` +
    `<b>Phone:</b> ${esc(d.phone.trim())}\n` +
    `<b>Project:</b> ${esc(d.project.trim())}\n` +
    `<b>Site language:</b> ${lang.toUpperCase()}`;

  btn.disabled = true; setStatus("form.sending");
  try{
    const res = CONFIG.endpoint
      ? await fetch(CONFIG.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})})
      : await fetch(`https://api.telegram.org/bot${CONFIG.botToken}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({chat_id:CONFIG.chatId,text,parse_mode:"HTML",disable_web_page_preview:true})});
    if(!res.ok) throw new Error(res.status);
    try{ localStorage.setItem("gf_last", Date.now()); }catch(e){}
    form.reset(); setStatus("form.ok","ok");
  }catch(err){ setStatus("form.err","err"); }
  finally{ btn.disabled = false; }
});

/* ---------- init ---------- */
(function(){
  let saved = null; try{ saved = localStorage.getItem("gf_lang"); }catch(e){}
  const guess = (navigator.language||"en").toLowerCase().startsWith("ru") ? "ru" : "en";
  applyLang(saved==="ru"||saved==="en" ? saved : guess);
})();
