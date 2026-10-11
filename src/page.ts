/** Page servie par le serveur local. Autonome, sans CDN : tout est inline. */
export const PAGE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Detecteur d'arnaques, CREZZUSS</title>
<style>
  :root { color-scheme: dark; --bg:#0b1020; --card:#141b31; --line:#26304d; --ink:#eef1f7; --mut:#9aa6c4;
    --ok:#36c08a; --warn:#e7b24a; --bad:#ec5f6a; --crit:#ff4d57; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui,Segoe UI,Roboto,sans-serif; }
  .wrap { max-width:760px; margin:0 auto; padding:32px 16px 64px; }
  h1 { font-size:1.6rem; margin:0 0 4px; }
  p.sub { color:var(--mut); margin:0 0 24px; }
  form { display:flex; gap:8px; flex-wrap:wrap; }
  input { flex:1 1 320px; min-width:0; padding:12px 14px; border-radius:10px; border:1px solid var(--line);
    background:#0e1526; color:var(--ink); font-size:1rem; }
  button { padding:12px 20px; border:0; border-radius:10px; background:#3a6dff; color:#fff; font-weight:600; cursor:pointer; }
  button:disabled { opacity:.5; cursor:wait; }
  .card { margin-top:24px; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:20px; }
  .verdict { font-size:1.3rem; font-weight:700; }
  .score { color:var(--mut); font-size:.95rem; }
  .badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:.8rem; font-weight:700; margin-left:8px; }
  .danger { background:rgba(255,77,87,.15); color:var(--crit); }
  .suspect { background:rgba(231,178,74,.15); color:var(--warn); }
  .prudence { background:rgba(231,178,74,.1); color:var(--warn); }
  .ok { background:rgba(54,192,138,.15); color:var(--ok); }
  ul { list-style:none; padding:0; margin:16px 0 0; }
  li { border-top:1px solid var(--line); padding:12px 0; }
  .flagtitle { font-weight:600; }
  .sev { font-family:ui-monospace,monospace; font-size:.75rem; margin-right:8px; }
  .s-critical{color:var(--crit);} .s-high{color:var(--bad);} .s-medium{color:var(--warn);} .s-low{color:var(--mut);} .s-info{color:var(--mut);}
  .detail { color:var(--mut); font-size:.92rem; }
  .note { color:var(--mut); font-size:.82rem; margin-top:16px; }
  .err { color:var(--bad); }
</style>
</head>
<body>
<div class="wrap">
  <h1>Detecteur d'arnaques</h1>
  <p class="sub">Collez le lien d'un site qui promet des gains. L'outil regarde ses signaux publics et rend un avis. Ce n'est pas une preuve, c'est une alerte.</p>
  <form id="f">
    <input id="u" type="text" inputmode="url" placeholder="exemple.com" autocomplete="off" required />
    <button id="b" type="submit">Analyser</button>
  </form>
  <div id="out"></div>
  <p class="note">Analyse non intrusive : une seule lecture de la page, aucune connexion, aucune donnee envoyee. Un verdict « danger » invite a la prudence et a verifier sur bceao.int ; il ne remplace pas votre jugement.</p>
</div>
<script>
  var VLABEL = { danger:["DANGER","danger"], suspect:["SUSPECT","suspect"], prudence:["PRUDENCE","prudence"], aucun_signal_fort:["AUCUN SIGNAL FORT","ok"] };
  var f = document.getElementById('f'), u = document.getElementById('u'), b = document.getElementById('b'), out = document.getElementById('out');
  function esc(s){ return String(s).replace(/[&<>]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; }); }
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var url = u.value.trim();
    if(!url) return;
    b.disabled = true; out.innerHTML = '<div class="card">Analyse en cours...</div>';
    fetch('/api/scan?url=' + encodeURIComponent(url)).then(function(r){ return r.json().then(function(j){ return {ok:r.ok, j:j}; }); })
    .then(function(res){
      if(!res.ok){ out.innerHTML = '<div class="card err">Erreur : ' + esc(res.j.error || 'inconnue') + '</div>'; return; }
      var j = res.j, v = VLABEL[j.verdict] || [j.verdict,'ok'];
      var items = j.flags.map(function(fl){
        return '<li><span class="sev s-' + fl.severity + '">' + fl.severity.toUpperCase() + '</span>' +
          '<span class="flagtitle">' + esc(fl.title) + '</span><div class="detail">' + esc(fl.detail) + '</div></li>';
      }).join('');
      out.innerHTML = '<div class="card"><div class="verdict">' + esc(j.registrableDomain) +
        '<span class="badge ' + v[1] + '">' + v[0] + '</span></div>' +
        '<div class="score">Score de risque : ' + j.score + '/100</div>' +
        (items ? '<ul>' + items + '</ul>' : '<p class="detail">Aucun signal releve.</p>') +
        '<p class="note">' + esc(j.note) + '</p></div>';
    }).catch(function(){ out.innerHTML = '<div class="card err">Impossible de contacter le service local.</div>'; })
    .finally(function(){ b.disabled = false; });
  });
</script>
</body>
</html>`;
