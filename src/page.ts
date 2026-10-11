/**
 * Page servie par le serveur. Bilingue FR/EN (bouton dans l'en-tete, choix memorise). Design clair
 * une colonne, bande de logos, animation de scan. Autonome, sans CDN. Animations coupees si
 * prefers-reduced-motion.
 */
export const PAGE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title data-i18n="title">Détecteur d'arnaques en ligne | CREZZUSS</title>
<meta name="description" content="Collez le lien d'un site qui promet des gains : l'outil lit ses signaux publics et rend un avis. Gratuit, sans inscription." />
<meta name="theme-color" content="#f7f8fb" />
<link rel="icon" type="image/svg+xml" href="/logos/logo.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/logos/favicon-32.png" />
<link rel="apple-touch-icon" href="/logos/favicon-180.png" />
<link rel="canonical" href="https://scan.crezzuss.com/" />
<meta name="keywords" content="détecteur d'arnaques, scam detector, phishing, hameçonnage, arnaque en ligne, vérifier un lien, BCEAO, Mobile Money, Togo, UEMOA, cybersécurité" />
<meta name="robots" content="index, follow" />
<meta name="author" content="CREZZUSS" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="CREZZUSS" />
<meta property="og:title" content="Détecteur d'arnaques en ligne, gratuit" />
<meta property="og:description" content="Collez un lien : l'outil détecte en quelques secondes les signes d'arnaque, de phishing ou de virus. Gratuit, sans inscription." />
<meta property="og:url" content="https://scan.crezzuss.com/" />
<meta property="og:image" content="https://scan.crezzuss.com/logos/og.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:locale:alternate" content="en_US" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Détecteur d'arnaques en ligne, gratuit" />
<meta name="twitter:description" content="Collez un lien : arnaque, phishing ou virus ? Réponse en quelques secondes. Gratuit, sans inscription." />
<meta name="twitter:image" content="https://scan.crezzuss.com/logos/og.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebApplication","name":"Détecteur d'arnaques","url":"https://scan.crezzuss.com/","applicationCategory":"SecurityApplication","operatingSystem":"Web","inLanguage":["fr","en"],"isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"XOF"},"description":"Outil gratuit qui analyse un lien et détecte les signes d'arnaque, de phishing ou de virus.","publisher":{"@type":"Organization","name":"CREZZUSS","url":"https://crezzuss.com"}}
</script>
<style>
  :root {
    color-scheme: light;
    --bg:#f7f8fb; --card:#ffffff; --line:#e3e7ef; --ink:#0f172a; --mut:#5b6478;
    --blue:#2f5bff; --ok:#14945f; --ok-soft:#e5f6ee;
    --warn:#b7791f; --warn-soft:#fdf3e1; --bad:#d6334a; --bad-soft:#fdebee;
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  a { color:var(--blue); }
  .wrap { max-width:720px; margin:0 auto; padding:0 16px; }

  header { padding:16px 0; }
  header .wrap { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .brand { font-weight:700; color:var(--ink); text-decoration:none; }
  .brand span { color:var(--mut); font-weight:500; }
  .lang { display:inline-flex; border:1px solid var(--line); border-radius:999px; overflow:hidden; background:#fff; }
  .lang button { border:0; background:transparent; padding:5px 12px; font-size:.82rem; font-weight:700; color:var(--mut); cursor:pointer; }
  .lang button.on { background:var(--blue); color:#fff; }

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

  .result { padding:0; }
  .banner { display:flex; align-items:center; gap:16px; padding:20px; border-top:5px solid; }
  .r-danger .banner { background:var(--bad-soft); border-color:var(--bad); }
  .r-suspect .banner, .r-prudence .banner { background:var(--warn-soft); border-color:var(--warn); }
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
  <div class="wrap">
    <a class="brand" href="/"><img src="/logos/logo.svg" alt="" width="26" height="26" style="vertical-align:-6px;margin-right:8px" /><span data-i18n="brandName">Détecteur d'arnaques</span> <span data-i18n="by">par CREZZUSS</span></a>
    <div class="lang" role="group" aria-label="Langue / Language">
      <button type="button" data-lang="fr">FR</button>
      <button type="button" data-lang="en">EN</button>
    </div>
  </div>
</header>

<main class="wrap">
  <div class="hero">
    <h1 data-i18n="h1">Ne vous faites pas arnaquer en ligne</h1>
    <p data-i18n="sub">Un site vous promet de l'argent facile&nbsp;? Collez son lien&nbsp;: en quelques secondes, on repère pour vous les signes d'une arnaque.</p>
  </div>

  <form id="f">
    <label for="u" style="position:absolute;left:-9999px" data-i18n="label">Lien du site à vérifier</label>
    <input id="u" type="text" inputmode="url" autocomplete="off" required />
    <button id="b" type="submit" data-i18n="analyze">Analyser</button>
  </form>
  <p class="hint" data-i18n="hint">100&nbsp;% gratuit, sans inscription. On ne garde aucun lien.</p>

  <div id="out" aria-live="polite"></div>

  <section class="logos" aria-label="Partenaires">
    <h2 data-i18n="partners">Nos produits et partenaires</h2>
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
    <p><strong data-i18n="ctaTitle">Besoin de sécuriser votre site ou vos paiements&nbsp;?</strong><br><span data-i18n="ctaSub">CREZZUSS, agence numérique à Lomé.</span></p>
    <a href="https://crezzuss.com" target="_blank" rel="noopener" data-i18n="contact">Nous contacter</a>
  </div>
</main>

<footer>
  <div class="wrap">
    <p><span data-i18n="footTool">Un outil gratuit de</span> <a href="https://crezzuss.com" target="_blank" rel="noopener">CREZZUSS</a>, Lomé, Togo. <span data-i18n="footOpen">Code ouvert sur</span> <a href="https://github.com/CREZZUSS/scam-detector" target="_blank" rel="noopener">GitHub</a>.</p>
    <p data-i18n="footDisc">Un verdict n'est pas une preuve et ne remplace pas votre jugement.</p>
  </div>
</footer>

<script>
  var I18N = {
    title:   { fr:"Détecteur d'arnaques en ligne | CREZZUSS", en:"Online Scam Detector | CREZZUSS" },
    brandName:{ fr:"Détecteur d'arnaques", en:"Scam Detector" },
    by:      { fr:"par CREZZUSS", en:"by CREZZUSS" },
    h1:      { fr:"Ne vous faites pas arnaquer en ligne", en:"Don't get scammed online" },
    sub:     { fr:"Un site vous promet de l'argent facile\\u00a0? Collez son lien\\u00a0: en quelques secondes, on repère pour vous les signes d'une arnaque.", en:"A site promises you easy money? Paste its link: in seconds, we spot the signs of a scam for you." },
    label:   { fr:"Lien du site à vérifier", en:"Link of the site to check" },
    place:   { fr:"Collez un lien, ex. gains-rapides.top", en:"Paste a link, e.g. quick-cash.top" },
    analyze: { fr:"Analyser", en:"Analyze" },
    analyzing:{ fr:"Analyse…", en:"Analyzing…" },
    hint:    { fr:"100\\u00a0% gratuit, sans inscription. On ne garde aucun lien.", en:"100% free, no sign-up. We keep no link." },
    partners:{ fr:"Nos produits et partenaires", en:"Our products and partners" },
    ctaTitle:{ fr:"Besoin de sécuriser votre site ou vos paiements\\u00a0?", en:"Need to secure your website or payments?" },
    ctaSub:  { fr:"CREZZUSS, agence numérique à Lomé.", en:"CREZZUSS, digital agency in Lomé." },
    contact: { fr:"Nous contacter", en:"Contact us" },
    footTool:{ fr:"Un outil gratuit de", en:"A free tool by" },
    footOpen:{ fr:"Code ouvert sur", en:"Open source on" },
    footDisc:{ fr:"Un verdict n'est pas une preuve et ne remplace pas votre jugement.", en:"A verdict is not proof and does not replace your judgment." },
    found:   { fr:"Ce que l'on a relevé", en:"What we found" },
    none:    { fr:"Aucun signal relevé.", en:"No signal found." },
    note:    { fr:"Analyse automatique de signaux publics. Un verdict n'est pas une preuve : confronter à la liste officielle BCEAO et au bon sens.",
               en:"Automated analysis of public signals. A verdict is not proof: cross-check with the official BCEAO list and common sense." },
    fail:    { fr:"Impossible de joindre le service. Réessayez dans un instant.", en:"Could not reach the service. Please try again shortly." }
  };
  var VERDICT = {
    danger:   { fr:["Danger","r-danger","Ce site montre plusieurs signes d'arnaque. N'envoyez pas d'argent."], en:["Danger","r-danger","This site shows several scam signs. Do not send any money."] },
    suspect:  { fr:["Suspect","r-suspect","Ce site montre des signes inquiétants. Vérifiez avant de payer."], en:["Suspicious","r-suspect","This site shows worrying signs. Check before you pay."] },
    prudence: { fr:["Prudence","r-prudence","Quelques signes à surveiller sur ce site."], en:["Caution","r-prudence","A few signs to watch on this site."] },
    aucun_signal_fort:{ fr:["Aucun signe fort","r-ok","Aucun signe d'arnaque évident. Restez tout de même prudent."], en:["No strong sign","r-ok","No obvious scam sign. Stay careful anyway."] }
  };
  var SEV = { critical:{fr:"Critique",en:"Critical"}, high:{fr:"Fort",en:"High"}, medium:{fr:"Moyen",en:"Medium"}, low:{fr:"Faible",en:"Low"}, info:{fr:"Info",en:"Info"} };
  var STEPS = {
    fr:["Lecture de la page","Âge du domaine","Agrément BCEAO","Promesses de gains et parrainage","Mentions légales"],
    en:["Reading the page","Domain age","BCEAO license","Earnings and referral claims","Legal notice"]
  };
  // Traductions des drapeaux, par code. Le texte FR reste celui du serveur.
  var FLAG_EN = {
    risky_tld:{t:"Risky domain extension",d:"Often free or very cheap, common on sites built fast then abandoned."},
    no_https:{t:"No secure connection (HTTPS)",d:"A site asking for money or credentials without HTTPS offers no privacy guarantee."},
    very_new_domain:{t:"Very new domain",d:"A site under a month old that promises money often vanishes before the first withdrawal."},
    new_domain:{t:"Recent domain",d:"Less than six months old: be careful, especially if the site asks for money."},
    earn_and_withdraw:{t:"Promise of earnings to withdraw",d:"The site talks about earning money and withdrawing it."},
    referral_rewards:{t:"Earnings from referrals",d:"Rewarding you for inviting friends is the core of pyramid schemes: the newest members pay the oldest."},
    signup_bonus:{t:"Sign-up bonus",d:"Money 'given' at sign-up: a classic bait to push you to deposit or refer."},
    deposit_to_earn:{t:"You must deposit to earn",d:"Tiers or deposits to unlock earnings: a typical investment-scam structure."},
    guaranteed_return:{t:"Guaranteed or risk-free return",d:"No legitimate investment guarantees a gain. This promise is a major red flag."},
    fast_easy_money:{t:"Fast and easy money",d:"Get-rich-quick wording."},
    not_in_licensed_seed:{t:"No recognised licensed institution",d:"The site asks for money but is not tied to any institution known to the BCEAO list. Cross-check on bceao.int."},
    no_legal_mentions:{t:"No legal notice or company identity",d:"No identifiable company, address or policy: nobody is accountable."},
    foreign_template_cjk:{t:"Template with Chinese characters",d:"Interface or back office in Chinese on a French-language site: a sign of a resold scam template."},
    foreign_template_cyrillic:{t:"Template with Cyrillic characters",d:"Cyrillic text on a French-language site: a possibly imported, hastily rebranded template."},
    known_scam_kit:{t:"Known earnings-platform template",d:"Template name already seen on watch-ads-and-earn platforms, often fraudulent."},
    admin_interface_present:{t:"Admin interface detected",d:"The admin template is served here. To check in the code: the API must refuse data without authentication, not just hide the screen."},
    js_rendered_page:{t:"JavaScript-built page, limited analysis",d:"The content loads via JavaScript; without full rendering, the tool sees only part of the page. The result is mostly about the domain."},
    unreachable:{t:"Site unreachable",d:"The page did not respond."}
  };

  var MAL_EN = {
    malicious_social_engineering:{ t:"Phishing · flagged by Google", d:"Fake page imitating a real site (bank, Mobile Money, social network) to steal your passwords, codes or money. Do not enter anything." },
    malicious_malware:{ t:"Malware (virus) · flagged by Google", d:"This site may install a virus or spyware on your phone or computer. Do not download anything and leave the page." },
    malicious_unwanted_software:{ t:"Unwanted software · flagged by Google", d:"This site pushes unwanted programs that can disrupt your device or track you." },
    malicious_potentially_harmful_application:{ t:"Harmful application · flagged by Google", d:"This site offers a potentially harmful app for your device." }
  };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = "fr";
  try { var saved = localStorage.getItem("sd.lang"); if (saved === "fr" || saved === "en") lang = saved;
        else if ((navigator.language||"").toLowerCase().indexOf("en") === 0) lang = "en"; } catch(e) {}

  var f = document.getElementById("f"), u = document.getElementById("u"), b = document.getElementById("b"), out = document.getElementById("out");
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function host(v){ try { return new URL(/^https?:\\/\\//i.test(v) ? v : "https://" + v).hostname; } catch(e) { return v; } }
  var lastReport = null;

  function applyLang(){
    document.documentElement.lang = lang;
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (I18N[key]) nodes[i].innerHTML = I18N[key][lang];
    }
    u.placeholder = I18N.place[lang];
    var btns = document.querySelectorAll(".lang button");
    for (var j = 0; j < btns.length; j++) btns[j].className = btns[j].getAttribute("data-lang") === lang ? "on" : "";
    if (lastReport) render(lastReport);
    try { localStorage.setItem("sd.lang", lang); } catch(e) {}
  }

  function scanPanel(domain){
    var sk = "";
    for (var i = 0; i < 6; i++) sk += '<div class="sk" style="width:' + [92,70,84,55,78,64][i] + '%"></div>';
    var steps = STEPS[lang].map(function(s, i){ return '<li class="' + (i === 0 ? "run" : "wait") + '"><span class="st"></span>' + s + '</li>'; }).join("");
    return '<div class="panel" id="scan"><div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="addr">' + esc(domain) + '</span></div>' +
      '<div class="page">' + sk + (reduce ? "" : '<div class="laser"></div>') + '</div><ul class="steps">' + steps + '</ul></div>';
  }
  function advance(n){
    var lis = out.querySelectorAll("ul.steps li");
    for (var i = 0; i < lis.length; i++) lis[i].className = i < n ? "done" : (i === n ? "run" : "wait");
  }

  function render(j){
    lastReport = j;
    var v = (VERDICT[j.verdict] || VERDICT.aucun_signal_fort)[lang];
    var items = j.flags.map(function(fl, i){
      var tr = lang === "en" && FLAG_EN[fl.code] ? FLAG_EN[fl.code] : null;
      if (lang === "en" && !tr && fl.code.indexOf("malicious_") === 0) tr = MAL_EN[fl.code] || { t:"Dangerous link · flagged by Google", d:"Google flagged this site as dangerous. Do not enter anything or download anything." };
      var title = tr ? tr.t : fl.title;
      var detail = tr ? tr.d : fl.detail;
      return '<li class="sev-' + fl.severity + '" style="animation-delay:' + (i * 0.07) + 's"><span class="dot"></span>' +
        '<div><div class="ftitle">' + esc(title) + '<span class="fsev">' + (SEV[fl.severity] ? SEV[fl.severity][lang] : "") + '</span></div>' +
        '<div class="fdetail">' + esc(detail) + '</div></div></li>';
    }).join("");
    out.innerHTML = '<div class="panel result ' + v[1] + '">' +
      '<div class="banner"><div class="score">' + j.score + '<small>/100</small></div>' +
      '<div><div class="verdict">' + v[0] + '</div><div class="domain">' + esc(j.registrableDomain) + ' · ' + v[2] + '</div></div></div>' +
      (items ? '<div class="flags-h">' + I18N.found[lang] + '</div><ul class="flags">' + items + '</ul>' : '<p class="note">' + I18N.none[lang] + '</p>') +
      '<p class="note">' + I18N.note[lang] + '</p></div>';
  }

  var btns = document.querySelectorAll(".lang button");
  for (var k = 0; k < btns.length; k++) btns[k].addEventListener("click", function(){ lang = this.getAttribute("data-lang"); applyLang(); });
  applyLang();

  var MIN_SCAN_MS = 3200;
  f.addEventListener("submit", function(e){
    e.preventDefault();
    var url = u.value.trim();
    if (!url) return;
    b.disabled = true; b.textContent = I18N.analyzing[lang];
    lastReport = null;
    out.innerHTML = scanPanel(host(url));
    var started = Date.now(), step = 0;
    var timer = setInterval(function(){ if (step < STEPS[lang].length - 1) advance(++step); }, MIN_SCAN_MS / STEPS[lang].length);
    var request = fetch("/api/scan?url=" + encodeURIComponent(url)).then(function(r){ return r.json().then(function(j){ return { ok:r.ok, j:j }; }); });
    var wait = new Promise(function(res){ setTimeout(res, reduce ? 0 : Math.max(0, MIN_SCAN_MS - (Date.now() - started))); });
    Promise.all([request, wait]).then(function(all){
      var res = all[0];
      clearInterval(timer); advance(STEPS[lang].length);
      setTimeout(function(){
        if (!res.ok) { out.innerHTML = '<div class="panel err">' + esc(res.j.error || "Error") + '</div>'; return; }
        render(res.j);
      }, reduce ? 0 : 350);
    }).catch(function(){
      clearInterval(timer);
      out.innerHTML = '<div class="panel err">' + I18N.fail[lang] + '</div>';
    }).finally(function(){ b.disabled = false; b.textContent = I18N.analyze[lang]; });
  });
</script>
</body>
</html>`;
