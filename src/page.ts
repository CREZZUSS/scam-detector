/**
 * Page servie par le serveur. Design clair et simple, une colonne. Autonome : styles et script
 * inline, logos servis par /logos/. Animations (scan, bande de logos) coupees si
 * prefers-reduced-motion.
 */
export const PAGE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Détecteur d'arnaques en ligne | CREZZUSS</title>
<meta name="description" content="Collez le lien d'un site qui promet des gains : l'outil lit ses signaux publics (agrément BCEAO, âge du domaine, parrainage, bonus) et rend un avis. Gratuit, sans inscription." />
<meta name="theme-color" content="#f7f8fb" />
<style>
  :root {
    color-scheme: light;
    --bg:#f7f8fb; --card:#ffffff; --line:#e3e7ef; --ink:#0f172a; --mut:#5b6478;
    --blue:#2f5bff; --blue-soft:#eaf0ff; --ok:#14945f; --ok-soft:#e5f6ee;
    --warn:#b7791f; --warn-soft:#fdf3e1; --bad:#d6334a; --bad-soft:#fdebee;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  a { color:var(--blue); }
  .wrap { max-width:720px; margin:0 auto; padding:0 16px; }

  header { padding:18px 0; }
  header .wrap { display:flex; align-items:center; justify-content:space-between; }
  .brand { font-weight:700; color:var(--ink); text-decoration:none; }
  .brand span { color:var(--mut); font-weight:500; }

  .hero { text-align:center; padding:40px 0 8px; }
  .hero h1 { font-size:clamp(1.9rem,6vw,2.7rem); line-height:1.15; margin:0 0 12px; letter-spacing:-.02em; }
  .hero p { color:var(--mut); margin:0 auto 26px; max-width:520px; }

  form { display:flex; gap:8px; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:6px;
    box-shadow:0 6px 24px rgba(15,23,42,.06); }
  form input { flex:1; min-width:0; border:0; outline:0; padding:12px; font-size:1rem; background:transparent; color:var(--ink); }
  form button { border:0; border-radius:10px; background:var(--blue); color:#fff; font-weight:700; font-size:1rem; padding:12px 22px; cursor:pointer; }
  form button:disabled { opacity:.6; cursor:wait; }
  form:focus-within { border-color:var(--blue); }
  .hint { color:var(--mut); font-size:.85rem; margin-top:10px; text-align:center; }

  /* Animation de scan */
  #out { margin-top:24px; }
  .panel { background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
  .bar { display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid var(--line); background:#fbfcfe; }
  .dots i { display:inline-block; width:9px; height:9px; border-radius:50%; background:#d9dee8; margin-right:5px; }
  .addr { flex:1; background:#f1f4f9; border-radius:8px; padding:5px 10px; font-size:.85rem; color:var(--mut); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .page { position:relative; padding:18px; height:150px; overflow:hidden; }
  .sk { height:10px; border-radius:6px; background:#eef1f6; margin-bottom:12px; }
  .laser { position:absolute; left:0; right:0; top:0; height:42px;
    background:linear-gradient(to bottom, rgba(47,91,255,0), rgba(47,91,255,.18)); border-bottom:2px solid var(--blue);
    animation:sweep 1.6s ease-in-out infinite alternate; }
  @keyframes sweep { from { transform:translateY(-42px) } to { transform:translateY(150px) } }
  ul.steps { list-style:none; margin:0; padding:14px 18px 18px; border-top:1px solid var(--line); }
  ul.steps li { display:flex; align-items:center; gap:10px; padding:5px 0; color:var(--mut); font-size:.95rem; }
  ul.steps li.done { color:var(--ink); }
  .st { width:18px; height:18px; flex:none; border-radius:50%; border:2px solid #cfd6e3; border-top-color:var(--blue); animation:spin .8s linear infinite; }
  li.wait .st { animation:none; border-color:#e3e7ef; }
  li.done .st { animation:none; border:0; background:var(--ok); position:relative; }
  li.done .st::after { content:""; position:absolute; left:6px; top:3px; width:4px; height:8px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg); }
  @keyframes spin { to { transform:rotate(360deg) } }

  /* Resultat */
  .result { padding:0; }
  .banner { display:flex; align-items:center; gap:16px; padding:20px; border-top:5px solid; }
  .r-danger .banner { background:var(--bad-soft); border-color:var(--bad); }
  .r-suspect .banner { background:var(--warn-soft); border-color:var(--warn); }
  .r-prudence .banner { background:var(--warn-soft); border-color:var(--warn); }
  .r-ok .banner { background:var(--ok-soft); border-color:var(--ok); }
  .score { width:68px; height:68px; flex:none; border-radius:50%; display:grid; place-items:center; font-weight:800; font-size:1.45rem; background:#fff; }
  .score small { display:block; font-size:.5rem; font-weight:700; letter-spacing:.06em; color:var(--mut); margin-top:-3px; }
  .r-danger .score { color:var(--bad); } .r-suspect .score, .r-prudence .score { color:var(--warn); } .r-ok .score { color:var(--ok); }
  .verdict { font-size:1.25rem; font-weight:800; line-height:1.2; }
  .r-danger .verdict { color:var(--bad); } .r-suspect .verdict, .r-prudence .verdict { color:var(--warn); } .r-ok .verdict { color:var(--ok); }
  .domain { color:var(--mut); font-size:.9rem; margin-top:3px; }
  .flags-h { padding:16px 20px 2px; font-size:.78rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--mut); }
  ul.flags { list-style:none; margin:0; padding:0 20px; }
  ul.flags li { display:flex; gap:12px; padding:14px 0; border-top:1px solid var(--line); animation:fade .3s ease both; }
  ul.flags li:first-child { border-top:0; }
  .dot { flex:none; width:10px; height:10px; border-radius:50%; margin-top:7px; }
  .sev-critical .dot, .sev-high .dot { background:var(--bad); }
  .sev-medium .dot { background:var(--warn); }
  .sev-low .dot, .sev-info .dot { background:#c3cad8; }
  .ftitle { font-weight:700; }
  .fsev { font-size:.72rem; font-weight:700; color:var(--mut); margin-left:8px; }
  .fdetail { color:var(--mut); font-size:.92rem; margin-top:2px; }
  .note { color:var(--mut); font-size:.8rem; padding:12px 20px 20px; border-top:1px solid var(--line); margin:10px 0 0; }
  .err { padding:16px 20px; color:var(--bad); }
  @keyframes fade { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }

  /* Bande de logos */
  .logos { margin:56px 0 0; text-align:center; }
  .logos h2 { font-size:.8rem; letter-spacing:.14em; text-transform:uppercase; color:var(--mut); margin:0 0 18px; font-weight:700; }
  .track-wrap { overflow:hidden; position:relative;
    -webkit-mask-image:linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
            mask-image:linear-gradient(to right, transparent, #000 12%, #000 88%, transparent); }
  .track { display:flex; align-items:center; gap:64px; width:max-content; animation:marquee 26s linear infinite; }
  .track-wrap:hover .track { animation-play-state:paused; }
  .track img { height:38px; width:auto; display:block; opacity:.9; }
  @keyframes marquee { to { transform:translateX(-50%) } }

  .cta { margin:48px 0 0; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px;
    display:flex; gap:14px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
  .cta p { margin:0; color:var(--mut); }
  .cta strong { color:var(--ink); }
  .cta a { background:var(--ink); color:#fff; text-decoration:none; font-weight:700; padding:11px 18px; border-radius:10px; }

  footer { padding:36px 0 44px; color:var(--mut); font-size:.83rem; text-align:center; }
  footer p { margin:4px 0; }

  @media (prefers-reduced-motion: reduce) {
    .laser, .st, .track, ul.flags li { animation:none !important; }
    .track { flex-wrap:wrap; justify-content:center; width:auto; gap:32px; }
    .track .dup { display:none; }
  }
  @media (max-width:520px) {
    form { flex-direction:column; }
    form button { width:100%; }
    .track { gap:44px; }
    .track img { height:32px; }
  }
</style>
</head>
<body>

<header>
  <div class="wrap"><a class="brand" href="/">Détecteur d'arnaques <span>par CREZZUSS</span></a></div>
</header>

<main class="wrap">
  <div class="hero">
    <h1>Ce site est-il une arnaque&nbsp;?</h1>
    <p>Collez le lien d'un site qui promet de l'argent. On lit ses signaux publics et on vous donne un avis en quelques secondes.</p>
  </div>

  <form id="f">
    <label for="u" style="position:absolute;left:-9999px">Lien du site à vérifier</label>
    <input id="u" type="text" inputmode="url" placeholder="Collez un lien, ex. gains-rapides.top" autocomplete="off" required />
    <button id="b" type="submit">Analyser</button>
  </form>
  <p class="hint">Gratuit, sans inscription. Aucun lien n'est conservé.</p>

  <div id="out" aria-live="polite"></div>

  <section class="logos" aria-label="Nos produits et partenaires">
    <h2>Nos produits et partenaires</h2>
    <div class="track-wrap">
      <div class="track">
        <img src="/logos/ecard.png" alt="e_Card" />
        <img src="/logos/crezzuss.png" alt="CREZZUSS" />
        <img src="/logos/wintg.png" alt="Wintg" />
        <img src="/logos/tchin.png" alt="Tchin" />
        <img class="dup" src="/logos/ecard.png" alt="" aria-hidden="true" />
        <img class="dup" src="/logos/crezzuss.png" alt="" aria-hidden="true" />
        <img class="dup" src="/logos/wintg.png" alt="" aria-hidden="true" />
        <img class="dup" src="/logos/tchin.png" alt="" aria-hidden="true" />
      </div>
    </div>
  </section>


  <div class="cta">
    <p><strong>Besoin de sécuriser votre site ou vos paiements&nbsp;?</strong><br>CREZZUSS, agence numérique à Lomé.</p>
    <a href="https://crezzuss.com" target="_blank" rel="noopener">Nous contacter</a>
  </div>
</main>

<footer>
  <div class="wrap">
    <p>Un outil gratuit de <a href="https://crezzuss.com" target="_blank" rel="noopener">CREZZUSS</a>, Lomé, Togo. Code ouvert sur <a href="https://github.com/CREZZUSS/scam-detector" target="_blank" rel="noopener">GitHub</a>.</p>
    <p>Un verdict n'est pas une preuve et ne remplace pas votre jugement.</p>
  </div>
</footer>

<script>
  var VERDICT = {
    danger:["Danger","r-danger","Plusieurs signaux d'arnaque. Ne versez pas d'argent."],
    suspect:["Suspect","r-suspect","Des signaux inquiétants. Vérifiez avant tout versement."],
    prudence:["Prudence","r-prudence","Quelques signaux à surveiller."],
    aucun_signal_fort:["Aucun signal fort","r-ok","Rien d'alarmant détecté, restez prudent."]
  };
  var SEV = { critical:"Critique", high:"Fort", medium:"Moyen", low:"Faible", info:"Info" };
  var STEPS = ["Lecture de la page", "Âge du domaine", "Agrément BCEAO", "Promesses de gains et parrainage", "Mentions légales"];
  var MIN_SCAN_MS = 3200;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var f = document.getElementById("f"), u = document.getElementById("u"), b = document.getElementById("b"), out = document.getElementById("out");
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function host(v){ try { return new URL(/^https?:\\/\\//i.test(v) ? v : "https://" + v).hostname; } catch(e) { return v; } }

  function scanPanel(domain){
    var sk = "";
    for (var i = 0; i < 6; i++) sk += '<div class="sk" style="width:' + [92,70,84,55,78,64][i] + '%"></div>';
    var steps = STEPS.map(function(s, i){ return '<li class="' + (i === 0 ? "run" : "wait") + '"><span class="st"></span>' + s + '</li>'; }).join("");
    return '<div class="panel" id="scan"><div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="addr">' + esc(domain) + '</span></div>' +
      '<div class="page">' + sk + (reduce ? "" : '<div class="laser"></div>') + '</div><ul class="steps">' + steps + '</ul></div>';
  }

  function advance(n){
    var lis = out.querySelectorAll("ul.steps li");
    for (var i = 0; i < lis.length; i++) lis[i].className = i < n ? "done" : (i === n ? "run" : "wait");
  }

  function render(j){
    var v = VERDICT[j.verdict] || VERDICT.aucun_signal_fort;
    var items = j.flags.map(function(fl, i){
      return '<li class="sev-' + fl.severity + '" style="animation-delay:' + (i * 0.07) + 's"><span class="dot"></span>' +
        '<div><div class="ftitle">' + esc(fl.title) + '<span class="fsev">' + (SEV[fl.severity] || "") + '</span></div>' +
        '<div class="fdetail">' + esc(fl.detail) + '</div></div></li>';
    }).join("");
    out.innerHTML = '<div class="panel result ' + v[1] + '">' +
      '<div class="banner"><div class="score">' + j.score + '<small>/100</small></div>' +
      '<div><div class="verdict">' + v[0] + '</div><div class="domain">' + esc(j.registrableDomain) + ' · ' + v[2] + '</div></div></div>' +
      (items ? '<div class="flags-h">Ce que l\\'on a relevé</div><ul class="flags">' + items + '</ul>' : '<p class="note">Aucun signal relevé.</p>') +
      '<p class="note">' + esc(j.note) + '</p></div>';
  }

  f.addEventListener("submit", function(e){
    e.preventDefault();
    var url = u.value.trim();
    if (!url) return;
    b.disabled = true;
    out.innerHTML = scanPanel(host(url));
    var started = Date.now(), step = 0;
    var timer = setInterval(function(){ if (step < STEPS.length - 1) advance(++step); }, MIN_SCAN_MS / STEPS.length);

    var request = fetch("/api/scan?url=" + encodeURIComponent(url))
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); });
    var wait = new Promise(function(res){ setTimeout(res, reduce ? 0 : Math.max(0, MIN_SCAN_MS - (Date.now() - started))); });

    Promise.all([request, wait]).then(function(all){
      var res = all[0];
      clearInterval(timer);
      advance(STEPS.length);
      setTimeout(function(){
        if (!res.ok) { out.innerHTML = '<div class="panel err">' + esc(res.j.error || "Erreur inconnue.") + '</div>'; return; }
        render(res.j);
      }, reduce ? 0 : 350);
    }).catch(function(){
      clearInterval(timer);
      out.innerHTML = '<div class="panel err">Impossible de joindre le service. Réessayez dans un instant.</div>';
    }).finally(function(){ b.disabled = false; });
  });
</script>
</body>
</html>`;
