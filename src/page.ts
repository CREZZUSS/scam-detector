/**
 * Page servie par le serveur. Autonome, sans CDN : styles, script et animations SVG sont inline,
 * pour charger vite sur une connexion mobile. Toutes les animations respectent
 * prefers-reduced-motion.
 */
export const PAGE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Détecteur d'arnaques en ligne | CREZZUSS</title>
<meta name="description" content="Collez le lien d'un site qui promet des gains : l'outil lit ses signaux publics (agrément BCEAO, âge du domaine, parrainage, bonus) et rend un avis. Gratuit, sans inscription." />
<meta name="theme-color" content="#0a0f1e" />
<style>
  :root {
    color-scheme: dark;
    --bg:#0a0f1e; --bg2:#0f1629; --card:#131b31; --line:#243052; --ink:#eef1f7; --mut:#9aa6c4;
    --blue:#3a6dff; --blue2:#5b86ff; --ok:#36c08a; --warn:#e7b24a; --bad:#ef5d68; --crit:#ff4d57;
    --radius:16px;
  }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; background:var(--bg); color:var(--ink);
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  a { color:var(--blue2); }
  .wrap { max-width:960px; margin:0 auto; padding:0 16px; }
  section { padding:56px 0; }
  h1,h2,h3 { line-height:1.15; margin:0; letter-spacing:-.01em; }
  h2 { font-size:clamp(1.5rem,3.5vw,2rem); margin-bottom:10px; }
  .lead { color:var(--mut); max-width:640px; margin:0 0 28px; }
  .eyebrow { display:inline-block; font-size:.78rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--blue2); margin-bottom:12px; }

  /* En-tete */
  header.top { border-bottom:1px solid var(--line); }
  header.top .wrap { display:flex; align-items:center; justify-content:space-between; height:60px; }
  .brand { display:flex; align-items:center; gap:10px; font-weight:700; color:var(--ink); text-decoration:none; }
  .brand small { color:var(--mut); font-weight:500; }
  header.top nav a { color:var(--mut); text-decoration:none; font-size:.92rem; margin-left:18px; }
  header.top nav a:hover { color:var(--ink); }

  /* Haut de page */
  .hero { padding:56px 0 40px; display:grid; grid-template-columns:1.2fr .8fr; gap:32px; align-items:center; }
  .hero h1 { font-size:clamp(2rem,5.2vw,3.1rem); margin-bottom:16px; }
  .hero h1 em { font-style:normal; color:var(--blue2); }
  .hero p { color:var(--mut); font-size:1.08rem; margin:0 0 26px; max-width:520px; }
  .shield-art { width:100%; max-width:300px; justify-self:center; }

  form.scan { display:flex; gap:8px; flex-wrap:wrap; }
  form.scan input { flex:1 1 280px; min-width:0; padding:15px 16px; border-radius:12px; border:1px solid var(--line);
    background:var(--bg2); color:var(--ink); font-size:1rem; }
  form.scan input:focus { outline:2px solid var(--blue); outline-offset:1px; }
  button.go { padding:15px 22px; border:0; border-radius:12px; background:var(--blue); color:#fff; font-weight:700; font-size:1rem; cursor:pointer; }
  button.go:hover { background:var(--blue2); }
  button.go:disabled { opacity:.6; cursor:wait; }
  .trust { display:flex; gap:18px; flex-wrap:wrap; margin-top:16px; color:var(--mut); font-size:.88rem; }
  .trust span::before { content:"\\2713"; color:var(--ok); margin-right:6px; font-weight:700; }

  /* Resultat */
  #out:empty { display:none; }
  .result { margin-top:28px; background:var(--card); border:1px solid var(--line); border-radius:var(--radius); padding:22px; }
  .result-head { display:flex; gap:22px; align-items:center; flex-wrap:wrap; }
  .gauge { width:150px; flex:none; }
  .gauge text { font:700 30px system-ui,sans-serif; fill:var(--ink); }
  .gauge .lbl { font:600 11px system-ui,sans-serif; fill:var(--mut); letter-spacing:.08em; }
  .verdict-title { font-size:1.35rem; font-weight:800; }
  .verdict-sub { color:var(--mut); margin-top:4px; }
  .pill { display:inline-block; padding:3px 12px; border-radius:999px; font-size:.78rem; font-weight:800; letter-spacing:.06em; margin-left:8px; vertical-align:middle; }
  .v-danger { background:rgba(255,77,87,.16); color:var(--crit); }
  .v-suspect { background:rgba(231,178,74,.16); color:var(--warn); }
  .v-prudence { background:rgba(231,178,74,.10); color:var(--warn); }
  .v-ok { background:rgba(54,192,138,.16); color:var(--ok); }
  ul.flags { list-style:none; padding:0; margin:20px 0 0; }
  ul.flags li { display:flex; gap:12px; padding:14px 0; border-top:1px solid var(--line); opacity:0; transform:translateY(6px); animation:rise .35s ease forwards; }
  .ico { flex:none; width:28px; height:28px; border-radius:8px; display:grid; place-items:center; font-weight:800; font-size:.9rem; }
  .s-critical .ico, .s-high .ico { background:rgba(239,93,104,.16); color:var(--bad); }
  .s-medium .ico { background:rgba(231,178,74,.16); color:var(--warn); }
  .s-low .ico, .s-info .ico { background:rgba(154,166,196,.14); color:var(--mut); }
  .ftitle { font-weight:700; }
  .fdetail { color:var(--mut); font-size:.93rem; }
  .note { color:var(--mut); font-size:.84rem; margin-top:16px; }
  .err { color:var(--bad); }

  /* Chargement : radar */
  .loading { display:flex; align-items:center; gap:16px; }
  .radar { width:54px; height:54px; flex:none; }
  .radar .sweep { transform-origin:27px 27px; animation:spin 1.4s linear infinite; }

  /* Cartes d'information */
  .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .grid2 { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:var(--radius); padding:22px; }
  .card h3 { font-size:1.08rem; margin:12px 0 6px; }
  .card p { color:var(--mut); margin:0; font-size:.95rem; }
  .step-n { width:34px; height:34px; border-radius:10px; background:rgba(58,109,255,.16); color:var(--blue2); display:grid; place-items:center; font-weight:800; }
  .sign { display:flex; gap:14px; align-items:flex-start; }
  .sign .ico { width:34px; height:34px; border-radius:10px; background:rgba(239,93,104,.14); color:var(--bad); }
  .alt { background:var(--bg2); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
  ol.todo { margin:0; padding-left:20px; }
  ol.todo li { margin:0 0 12px; color:var(--mut); }
  ol.todo li strong { color:var(--ink); }

  /* FAQ */
  details { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px 18px; margin-bottom:10px; }
  summary { cursor:pointer; font-weight:700; list-style:none; }
  summary::-webkit-details-marker { display:none; }
  summary::after { content:"+"; float:right; color:var(--blue2); font-weight:800; }
  details[open] summary::after { content:"\\2212"; }
  details p { color:var(--mut); margin:10px 0 0; }

  /* Appel CREZZUSS */
  .cta { background:linear-gradient(135deg,#16224a,#131b31); border:1px solid var(--line); border-radius:var(--radius);
    padding:26px; display:flex; gap:18px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
  .cta h3 { font-size:1.25rem; margin-bottom:4px; }
  .cta p { color:var(--mut); margin:0; }
  .cta a { background:var(--blue); color:#fff; text-decoration:none; font-weight:700; padding:13px 20px; border-radius:12px; white-space:nowrap; }
  .cta a:hover { background:var(--blue2); }

  footer { border-top:1px solid var(--line); padding:28px 0 40px; color:var(--mut); font-size:.85rem; }
  footer p { margin:4px 0; }

  /* Animations */
  .scanline { animation:scan 2.6s ease-in-out infinite; }
  .pulse { transform-origin:150px 150px; animation:pulse 2.6s ease-in-out infinite; }
  .gauge-arc { transition:stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1); }
  @keyframes scan { 0%,100% { transform:translateY(-62px); opacity:0 } 15%,85% { opacity:1 } 50% { transform:translateY(62px) } }
  @keyframes pulse { 0%,100% { opacity:.25; transform:scale(1) } 50% { opacity:.55; transform:scale(1.06) } }
  @keyframes spin { to { transform:rotate(360deg) } }
  @keyframes rise { to { opacity:1; transform:none } }
  @media (prefers-reduced-motion: reduce) {
    .scanline,.pulse,.radar .sweep { animation:none; }
    ul.flags li { animation:none; opacity:1; transform:none; }
    .gauge-arc { transition:none; }
    html { scroll-behavior:auto; }
  }

  @media (max-width:760px) {
    .hero { grid-template-columns:1fr; padding-top:32px; }
    .shield-art { max-width:170px; order:-1; }
    .grid3,.grid2 { grid-template-columns:1fr; }
    header.top nav { display:none; }
    section { padding:40px 0; }
  }
</style>
</head>
<body>

<header class="top">
  <div class="wrap">
    <a class="brand" href="/">Détecteur d'arnaques <small>par CREZZUSS</small></a>
    <nav>
      <a href="#comment">Comment ça marche</a>
      <a href="#signes">Les 7 signes</a>
      <a href="#victime">Déjà payé ?</a>
      <a href="#faq">FAQ</a>
    </nav>
  </div>
</header>

<main class="wrap">
  <div class="hero">
    <div>
      <span class="eyebrow">Gratuit, sans inscription</span>
      <h1>Ce site qui promet de l'argent, <em>est-il une arnaque&nbsp;?</em></h1>
      <p>Collez son lien. L'outil lit ses signaux publics, comme l'agrément BCEAO, l'âge du site, le parrainage ou les bonus, et vous rend un avis en quelques secondes.</p>
      <form class="scan" id="f">
        <label for="u" class="sr" style="position:absolute;left:-9999px">Lien du site à vérifier</label>
        <input id="u" type="text" inputmode="url" placeholder="Collez un lien, ex. gains-rapides.top" autocomplete="off" required />
        <button class="go" id="b" type="submit">Analyser</button>
      </form>
      <div class="trust"><span>Aucune donnée gardée</span><span>Aucune connexion au site</span><span>Résultat en 10 s</span></div>
    </div>
    <svg class="shield-art" viewBox="0 0 300 300" role="img" aria-label="Bouclier qui analyse un site">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b86ff"/><stop offset="1" stop-color="#2a4fd0"/></linearGradient>
        <clipPath id="sc"><path d="M150 40 L236 72 V146 C236 202 198 240 150 258 C102 240 64 202 64 146 V72 Z"/></clipPath>
      </defs>
      <circle class="pulse" cx="150" cy="150" r="128" fill="none" stroke="#3a6dff" stroke-width="2"/>
      <path d="M150 40 L236 72 V146 C236 202 198 240 150 258 C102 240 64 202 64 146 V72 Z" fill="url(#sg)" opacity=".18" stroke="#5b86ff" stroke-width="3"/>
      <g clip-path="url(#sc)">
        <rect class="scanline" x="60" y="146" width="180" height="4" fill="#9fb6ff"/>
      </g>
      <circle cx="140" cy="140" r="34" fill="none" stroke="#eef1f7" stroke-width="8"/>
      <line x1="165" y1="165" x2="196" y2="196" stroke="#eef1f7" stroke-width="10" stroke-linecap="round"/>
    </svg>
  </div>

  <div id="out" aria-live="polite"></div>
</main>

<section id="comment">
  <div class="wrap">
    <span class="eyebrow">Comment ça marche</span>
    <h2>Trois étapes, aucune intrusion</h2>
    <p class="lead">L'outil regarde le site de l'extérieur, comme un visiteur prudent. Il ne s'y connecte pas et ne vous demande rien.</p>
    <div class="grid3">
      <div class="card"><div class="step-n">1</div><h3>Vous collez le lien</h3><p>Celui qu'on vous a envoyé sur WhatsApp, Facebook ou par SMS.</p></div>
      <div class="card"><div class="step-n">2</div><h3>Il lit les signaux</h3><p>Agrément BCEAO, âge du domaine, promesses de gains, parrainage, mentions légales, gabarit revendu.</p></div>
      <div class="card"><div class="step-n">3</div><h3>Vous recevez un avis</h3><p>Un score sur 100, un verdict et la raison de chaque alerte, pour décider en connaissance de cause.</p></div>
    </div>
  </div>
</section>

<section id="signes" class="alt">
  <div class="wrap">
    <span class="eyebrow">À reconnaître</span>
    <h2>Les 7 signes d'une arnaque aux gains</h2>
    <p class="lead">Un seul signe ne prouve rien. Plusieurs ensemble, c'est presque toujours le même scénario : les premiers sont payés avec l'argent des derniers, puis le site disparaît.</p>
    <div class="grid2">
      <div class="sign"><div class="ico">1</div><div><strong>Un bonus à l'inscription</strong><p class="fdetail">« 800 FCFA offerts » : un appât pour vous faire déposer ou inviter.</p></div></div>
      <div class="sign"><div class="ico">2</div><div><strong>Des gains par le parrainage</strong><p class="fdetail">Si on gagne surtout en invitant ses proches, ce sont eux qui paieront.</p></div></div>
      <div class="sign"><div class="ico">3</div><div><strong>Déposer pour débloquer</strong><p class="fdetail">Paliers « VIP », recharges obligatoires avant de pouvoir retirer.</p></div></div>
      <div class="sign"><div class="ico">4</div><div><strong>Un rendement garanti</strong><p class="fdetail">Aucun placement honnête ne garantit un gain, encore moins chaque jour.</p></div></div>
      <div class="sign"><div class="ico">5</div><div><strong>Un site tout neuf</strong><p class="fdetail">Créé il y a quelques semaines, souvent avec une extension comme .top ou .xyz.</p></div></div>
      <div class="sign"><div class="ico">6</div><div><strong>Personne de responsable</strong><p class="fdetail">Pas de société, pas d'adresse, pas de RCCM, pas de mentions légales.</p></div></div>
      <div class="sign"><div class="ico">7</div><div><strong>Aucun agrément BCEAO</strong><p class="fdetail">Collecter de l'argent dans l'UEMOA exige un agrément. Vérifiez sur bceao.int.</p></div></div>
    </div>
  </div>
</section>

<section id="victime">
  <div class="wrap">
    <span class="eyebrow">Vous avez déjà payé&nbsp;?</span>
    <h2>Que faire maintenant</h2>
    <p class="lead">Agissez vite et ne versez plus rien, même si le site promet de débloquer votre argent contre des « frais ».</p>
    <ol class="todo">
      <li><strong>Arrêtez tout versement.</strong> Les « frais de retrait » ou « taxes » demandés pour récupérer vos gains sont la dernière étape de l'arnaque.</li>
      <li><strong>Gardez les preuves.</strong> Captures du site, reçus Mobile Money, numéros de transaction, échanges WhatsApp.</li>
      <li><strong>Prévenez votre opérateur Mobile Money</strong> au plus tôt, avec la référence de la transaction.</li>
      <li><strong>Portez plainte</strong> auprès de la police ou de la gendarmerie, avec vos preuves.</li>
      <li><strong>Signalez le site</strong> à la BCEAO et prévenez vos proches, surtout ceux que vous avez invités.</li>
    </ol>
  </div>
</section>

<section id="faq" class="alt">
  <div class="wrap">
    <span class="eyebrow">Questions fréquentes</span>
    <h2>FAQ</h2>
    <details><summary>Le verdict est-il fiable à 100 %&nbsp;?</summary><p>Non. Ce sont des signaux, pas une preuve. Un « danger » invite à la prudence et à vérifier, un « aucun signal fort » ne garantit pas qu'un site est honnête.</p></details>
    <details><summary>Est-ce que vous gardez les liens que je colle&nbsp;?</summary><p>Non. L'analyse se fait à la volée et rien n'est enregistré. Aucun cookie, aucun traceur publicitaire.</p></details>
    <details><summary>L'outil se connecte-t-il au site analysé&nbsp;?</summary><p>Il lit seulement la page publique, une fois, comme un navigateur. Il ne crée pas de compte, n'envoie aucune donnée et ne teste aucune faille.</p></details>
    <details><summary>D'où vient la liste des établissements agréés&nbsp;?</summary><p>D'une liste indicative de banques, d'établissements de monnaie électronique et de microfinances agréés dans l'UEMOA. La liste officielle publiée par la BCEAO fait seule foi.</p></details>
    <details><summary>Pourquoi le nombre d'analyses est-il limité&nbsp;?</summary><p>Pour que l'outil reste rapide pour tout le monde et ne serve pas à surcharger d'autres sites : 20 analyses par visiteur toutes les 10 minutes.</p></details>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="cta">
      <div><h3>Besoin de sécuriser votre site ou vos paiements&nbsp;?</h3><p>CREZZUSS, agence numérique à Lomé : développement, paiements Mobile Money et sécurité.</p></div>
      <a href="https://crezzuss.com" target="_blank" rel="noopener">Nous contacter</a>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <p>Détecteur d'arnaques, un outil gratuit de <a href="https://crezzuss.com" target="_blank" rel="noopener">CREZZUSS</a>, Lomé, Togo. Code source ouvert sur <a href="https://github.com/CREZZUSS/scam-detector" target="_blank" rel="noopener">GitHub</a>.</p>
    <p>Analyse automatique de signaux publics. Un verdict n'est pas une preuve et ne remplace pas votre jugement.</p>
    <p id="credits"></p>
  </div>
</footer>

<script>
  var VERDICT = {
    danger:["DANGER","v-danger","#ff4d57","Plusieurs signaux d'arnaque. Ne versez pas d'argent."],
    suspect:["SUSPECT","v-suspect","#e7b24a","Des signaux inquiétants. Vérifiez avant tout versement."],
    prudence:["PRUDENCE","v-prudence","#e7b24a","Quelques signaux à surveiller."],
    aucun_signal_fort:["AUCUN SIGNAL FORT","v-ok","#36c08a","Rien d'alarmant détecté, restez prudent."]
  };
  var ICON = { critical:"!", high:"!", medium:"?", low:"i", info:"i" };
  var f = document.getElementById("f"), u = document.getElementById("u"), b = document.getElementById("b"), out = document.getElementById("out");
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c]; }); }

  function gauge(score, color){
    var len = 251.3; // demi-cercle de rayon 80
    return '<svg class="gauge" viewBox="0 0 200 120" role="img" aria-label="Score de risque ' + score + ' sur 100">' +
      '<path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#243052" stroke-width="16" stroke-linecap="round"/>' +
      '<path class="gauge-arc" d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="' + color + '" stroke-width="16" stroke-linecap="round"' +
      ' stroke-dasharray="' + len + '" stroke-dashoffset="' + len + '" data-target="' + (len - len * score / 100) + '"/>' +
      '<text x="100" y="92" text-anchor="middle">' + score + '</text>' +
      '<text class="lbl" x="100" y="112" text-anchor="middle">SUR 100</text></svg>';
  }

  f.addEventListener("submit", function(e){
    e.preventDefault();
    var url = u.value.trim();
    if (!url) return;
    b.disabled = true;
    out.innerHTML = '<div class="result loading">' +
      '<svg class="radar" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="27" r="24" fill="none" stroke="#243052" stroke-width="2"/>' +
      '<circle cx="27" cy="27" r="13" fill="none" stroke="#243052" stroke-width="2"/>' +
      '<path class="sweep" d="M27 27 L27 3 A24 24 0 0 1 49 18 Z" fill="#3a6dff" opacity=".55"/></svg>' +
      '<div><strong>Analyse en cours…</strong><div class="verdict-sub">Lecture des signaux publics du site.</div></div></div>';
    fetch("/api/scan?url=" + encodeURIComponent(url))
      .then(function(r){ return r.json().then(function(j){ return { ok:r.ok, status:r.status, j:j }; }); })
      .then(function(res){
        if (!res.ok) { out.innerHTML = '<div class="result err">' + esc(res.j.error || "Erreur inconnue.") + '</div>'; return; }
        var j = res.j, v = VERDICT[j.verdict] || VERDICT.aucun_signal_fort;
        var items = j.flags.map(function(fl, i){
          return '<li class="s-' + fl.severity + '" style="animation-delay:' + (i * 0.08) + 's"><div class="ico">' + ICON[fl.severity] + '</div>' +
            '<div><div class="ftitle">' + esc(fl.title) + '</div><div class="fdetail">' + esc(fl.detail) + '</div></div></li>';
        }).join("");
        out.innerHTML = '<div class="result"><div class="result-head">' + gauge(j.score, v[2]) +
          '<div><div class="verdict-title">' + esc(j.registrableDomain) + '<span class="pill ' + v[1] + '">' + v[0] + '</span></div>' +
          '<div class="verdict-sub">' + v[3] + '</div></div></div>' +
          (items ? '<ul class="flags">' + items + '</ul>' : '<p class="fdetail">Aucun signal relevé.</p>') +
          '<p class="note">' + esc(j.note) + '</p></div>';
        var arc = out.querySelector(".gauge-arc");
        if (arc) requestAnimationFrame(function(){ requestAnimationFrame(function(){ arc.style.strokeDashoffset = arc.getAttribute("data-target"); }); });
        out.scrollIntoView({ behavior:"smooth", block:"nearest" });
      })
      .catch(function(){ out.innerHTML = '<div class="result err">Impossible de joindre le service. Réessayez dans un instant.</div>'; })
      .finally(function(){ b.disabled = false; });
  });
</script>
</body>
</html>`;
