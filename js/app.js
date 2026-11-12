/* Kusanagi — application */
'use strict';
(() => {
  const app = document.getElementById('app');
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const borne = (v, a, b) => Math.min(b, Math.max(a, v));
  const melanger = (t) => { const a = t.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const ICONES = {
    retour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    reglages: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg>',
    fermer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    coche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    gauche: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    droite: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  };
  const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><use href="#logo"/></svg>';

  /* ================= Stockage ================= */
  const CLE = 'kusanagi.v1';
  const TAILLES = [5, 10, 20, 30];
  function charger() {
    try {
      const s = JSON.parse(localStorage.getItem(CLE));
      if (s && s.decks) return { decks: s.decks, reglages: { taille: 10, ...(s.reglages || {}) } };
    } catch (e) { /* stockage indisponible */ }
    return { decks: {}, reglages: { taille: 10 } };
  }
  let store = charger();
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(store)); } catch (e) { /* ignoré */ } }

  const deck = (id) => DECKS.find((d) => d.id === id);
  const tousItems = (d) => d.niveaux.flatMap((n) => n.items);
  function etat(id) {
    if (!store.decks[id]) {
      store.decks[id] = { session: 0, cartes: {}, niveaux: [deck(id).niveaux[0].id], mode: 'cartes', sens: 'avant', choix: 4 };
    }
    const e = store.decks[id];
    e.niveaux = e.niveaux.filter((n) => deck(id).niveaux.some((x) => x.id === n));
    return e;
  }
  const itemsChoisis = (id) => { const e = etat(id); return deck(id).niveaux.filter((n) => e.niveaux.includes(n.id)).flatMap((n) => n.items); };

  /* ================= Répétition espacée =================
     Chaque carte a une « boîte » (0 à 5) et la session où elle doit revenir.
     Échec → boîte 0, revient à la session suivante. Réussite → boîte +1, revient
     après 2, 4, 8, 16 puis 32 sessions. Maîtrisée à partir de la boîte 3. */
  const ECARTS = [1, 2, 4, 8, 16, 32];
  const MAITRISE = 3;
  function noter(id, c, ok) {
    const e = etat(id);
    const s = e.cartes[c] || { b: 0, n: 0, vu: 0, ok: 0 };
    s.vu += 1;
    if (ok) { s.ok += 1; s.b = Math.min(s.b + 1, 5); } else { s.b = 0; }
    s.n = e.session + ECARTS[s.b];
    e.cartes[c] = s;
    sauver();
  }
  function stats(id, items) {
    const e = etat(id);
    const prochaine = e.session + 1;
    const r = { total: items.length, maitrises: 0, aRevoir: 0, nouveaux: 0, vus: 0 };
    for (const it of items) {
      const s = e.cartes[it.c];
      if (!s) { r.nouveaux += 1; continue; }
      r.vus += 1;
      if (s.b >= MAITRISE) r.maitrises += 1;
      if (s.n <= prochaine) r.aRevoir += 1;
    }
    return r;
  }
  function composer(id) {
    const e = etat(id);
    const num = e.session + 1;
    const taille = store.reglages.taille;
    const pool = itemsChoisis(id);
    const fiche = (it) => e.cartes[it.c];
    const vus = pool.filter(fiche);
    const dus = vus.filter((it) => fiche(it).n <= num).sort((a, b) => fiche(a).b - fiche(b).b || fiche(a).n - fiche(b).n);
    let lot = dus.slice(0, taille);
    if (lot.length < taille) lot = lot.concat(pool.filter((it) => !fiche(it)).slice(0, taille - lot.length));
    if (lot.length < taille) {
      const reste = vus.filter((it) => !lot.includes(it)).sort((a, b) => fiche(a).n - fiche(b).n || fiche(a).b - fiche(b).b);
      lot = lot.concat(reste.slice(0, taille - lot.length));
    }
    e.session = num;
    sauver();
    return melanger(lot);
  }

  /* ================= Pièges du QCM ================= */
  const VOISINS = new Map();
  RESSEMBLANCES.forEach((g) => {
    const t = [...g];
    t.forEach((c) => { if (!VOISINS.has(c)) VOISINS.set(c, new Set()); t.forEach((d) => { if (d !== c) VOISINS.get(c).add(d); }); });
  });
  function proches(a, b) {
    if (a === b) return false;
    if (VOISINS.has(a) && VOISINS.get(a).has(b)) return true;
    return (BASES_ACCENTS[a] || a) === (BASES_ACCENTS[b] || b);
  }
  function ressemblance(x, y) {
    const a = [...x.c], b = [...y.c];
    if (a.length === 1 && b.length === 1) return proches(a[0], b[0]) ? 3 : 0;
    if (a.length !== b.length) return a[0] === b[0] || proches(a[0], b[0]) ? 1 : 0;
    let egaux = 0, voisins = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] === b[i]) egaux += 1; else if (proches(a[i], b[i])) voisins += 1; }
    if (egaux + voisins === a.length && voisins) return 3;
    if (egaux === a.length - 1) return 2;
    return voisins ? 1 : 0;
  }
  const cleReponse = (d, it) => (d.type === 'kanji' ? it.fr : it.r);
  function leurres(d, item, pool, n) {
    const rep = cleReponse(d, item);
    const prendre = (source, deja) => source
      .filter((x) => x.c !== item.c && cleReponse(d, x) !== rep && !deja.has(cleReponse(d, x)))
      .map((x) => ({ x, s: ressemblance(item, x) + Math.random() * 0.9 }))
      .sort((p, q) => q.s - p.s);
    const vu = new Set([rep]);
    const out = [];
    for (const source of [pool, tousItems(d)]) {
      for (const { x } of prendre(source, vu)) {
        if (out.length >= n) break;
        const cle = cleReponse(d, x);
        if (vu.has(cle)) continue;
        vu.add(cle); out.push(x);
      }
      if (out.length >= n) break;
    }
    return out;
  }

  /* ================= Affichage ================= */
  const lecture = (r) => { const [a, b] = r.split('.'); return esc(a) + (b ? `<span class="oku">${esc(b)}</span>` : ''); };
  const lectures = (t) => (t.length ? t.map(lecture).join(', ') : '—');
  const classeGlyphe = (d, it) => (d.type === 'kanji' ? 'kanji' : ([...it.c].length > 1 ? 'long' : ''));
  const reponseTexte = (d, it) => (d.type === 'kanji' ? it.fr : it.r);

  let clavier = null;
  document.addEventListener('keydown', (e) => { if (clavier && !e.metaKey && !e.ctrlKey && !e.altKey) clavier(e); });

  function afficher(html, anim = 'entree') {
    clavier = null;
    app.innerHTML = html;
    const el = app.firstElementChild;
    if (anim) el.classList.add(anim);
    window.scrollTo(0, 0);
    return el;
  }

  /* ---------- Accueil ---------- */
  function accueil(anim = 'fondu') {
    const tuiles = DECKS.map((d) => {
      const s = stats(d.id, tousItems(d));
      const pct = s.total ? Math.round((s.maitrises / s.total) * 100) : 0;
      return `<button class="tuile" data-deck="${d.id}">
        <span class="tuile-glyphe jp">${d.glyphe}</span>
        <span class="tuile-texte">
          <span class="tuile-titre">${d.nom}<span class="jp">${d.jp}</span></span>
          <span class="tuile-desc">${d.description}</span>
          <span class="barre"><span style="width:${pct}%"></span></span>
          <span class="tuile-stats">${s.maitrises} / ${s.total} maîtrisés${s.aRevoir ? ` · <span class="a-revoir">${s.aRevoir} à revoir</span>` : ''}</span>
        </span>
        <span class="chevron">${ICONES.chevron}</span>
      </button>`;
    }).join('');
    const el = afficher(`<main class="ecran accueil">
      <header class="entete">
        <div class="marque">${LOGO}<div><h1>Kusanagi</h1><p><span class="jp">草薙</span> · l’écriture japonaise</p></div></div>
        <button class="icone-btn" data-action="reglages" aria-label="Réglages">${ICONES.reglages}</button>
      </header>
      <section class="decks">${tuiles}</section>
    </main>`, anim);
    el.addEventListener('click', (e) => {
      const t = e.target.closest('[data-deck], [data-action]');
      if (!t) return;
      if (t.dataset.deck) ecranDeck(t.dataset.deck);
      else if (t.dataset.action === 'reglages') reglages();
    });
  }

  /* ---------- Écran d'un jeu ---------- */
  function ecranDeck(id, anim = 'entree') {
    const d = deck(id);
    const e = etat(id);
    const g = d.glyphe;
    const pool = itemsChoisis(id);
    const s = stats(id, pool);
    const duelsDispo = pairesDuel(id).length;
    const enDuel = e.mode === 'duels';
    const n = Math.min(store.reglages.taille, enDuel ? duelsDispo : pool.length);
    const peutCommencer = enDuel ? duelsDispo > 0 : pool.length > 0;
    const presse = (v) => `aria-pressed="${v}"`;
    const sens = d.type === 'kanji'
      ? [['avant', `<span class="jp">${g}</span> → français`], ['inverse', `français → <span class="jp">${g}</span>`]]
      : [['avant', `<span class="jp">${g}</span> → romaji`], ['inverse', `romaji → <span class="jp">${g}</span>`]];
    const niveaux = d.niveaux.map((nv) => {
      const sel = e.niveaux.includes(nv.id);
      const sn = stats(id, nv.items);
      return `<button class="ligne-niveau" data-niveau="${nv.id}" ${presse(sel)}>
        <span class="coche">${ICONES.coche}</span>
        <span class="ligne-texte"><span class="ligne-titre">${nv.nom}</span><span class="ligne-detail">${nv.detail}</span></span>
        <span class="ligne-compte">${sn.maitrises}/${nv.items.length}</span>
      </button>`;
    }).join('');
    const morceaux = [];
    if (s.aRevoir) morceaux.push(`<span class="a-revoir">${s.aRevoir} à revoir</span>`);
    if (s.nouveaux) morceaux.push(`${s.nouveaux} nouvelle${s.nouveaux > 1 ? 's' : ''}`);
    morceaux.push(`${s.maitrises} maîtrisée${s.maitrises > 1 ? 's' : ''}`);
    const el = afficher(`<main class="ecran deck">
      <header class="barre-haut">
        <button class="icone-btn" data-action="accueil" aria-label="Retour">${ICONES.retour}</button>
        <h2>${d.nom}<span class="jp">${d.jp}</span></h2>
      </header>
      <section class="bloc">
        <h3 class="bloc-titre">Niveaux</h3>
        <div class="liste">${niveaux}</div>
      </section>
      <section class="bloc">
        <h3 class="bloc-titre">Mode</h3>
        <div class="segment" data-groupe="mode">
          <button data-val="cartes" ${presse(e.mode === 'cartes')}>Cartes</button>
          <button data-val="qcm" ${presse(e.mode === 'qcm')}>QCM</button>
          <button data-val="duels" ${presse(e.mode === 'duels')}>Duels</button>
        </div>
        <p class="aide-mode">${e.mode === 'cartes'
          ? 'Touche la carte pour voir la réponse, puis glisse-la : à droite si tu savais, à gauche sinon.'
          : e.mode === 'qcm' ? 'Trouve la bonne réponse parmi les choix. Les pièges sont des caractères qui se ressemblent.'
            : `Deux ${d.type === 'kanji' ? 'kanji' : 'caractères'} presque identiques : choisis celui qui correspond ${d.type === 'kanji' ? 'au sens' : 'au son'}, puis compare-les.`}</p>
        ${e.mode === 'qcm' ? `<div class="options-qcm">
          <div class="option-ligne"><span>Sens</span><div class="segment" data-groupe="sens">${sens.map(([v, t]) => `<button data-val="${v}" ${presse(e.sens === v)}>${t}</button>`).join('')}</div></div>
          <div class="option-ligne"><span>Choix</span><div class="segment" data-groupe="choix">${[2, 3, 4].map((v) => `<button data-val="${v}" ${presse(e.choix === v)}>${v}</button>`).join('')}</div></div>
        </div>` : ''}
      </section>
      <div class="pied">
        <p class="resume">${!pool.length ? 'Choisis au moins un niveau.'
          : enDuel ? (duelsDispo ? `${duelsDispo} paire${duelsDispo > 1 ? 's' : ''} de sosies dans ces niveaux` : 'Pas de sosies dans ces niveaux : choisis « De base » ou « Avec accents ».')
            : morceaux.join(' · ')}</p>
        <button class="btn-primaire" data-action="commencer" ${peutCommencer ? '' : 'disabled'}>Commencer · ${n} ${enDuel ? 'duel' : 'carte'}${n > 1 ? 's' : ''}</button>
      </div>
    </main>`, anim);
    el.addEventListener('click', (ev) => {
      const t = ev.target.closest('button');
      if (!t || t.disabled) return;
      if (t.dataset.action === 'accueil') return accueil('entree-retour');
      if (t.dataset.action === 'commencer') return lancer(id);
      if (t.dataset.niveau) {
        const nv = t.dataset.niveau;
        e.niveaux = e.niveaux.includes(nv) ? e.niveaux.filter((x) => x !== nv) : e.niveaux.concat(nv);
        sauver();
        return ecranDeck(id, null);
      }
      const groupe = t.parentElement.dataset.groupe;
      if (groupe) {
        const v = t.dataset.val;
        if (groupe === 'mode') e.mode = v;
        if (groupe === 'sens') e.sens = v;
        if (groupe === 'choix') e.choix = Number(v);
        sauver();
        ecranDeck(id, null);
      }
    });
  }

  /* ---------- Session ---------- */
  let session = null;
  function lancer(id) {
    const e = etat(id);
    const items = e.mode === 'duels' ? composerDuels(id) : composer(id);
    session = { id, d: deck(id), mode: e.mode, sens: e.sens, choix: e.choix, items, i: 0, resultats: [] };
    if (session.mode === 'qcm') qcm(); else if (session.mode === 'duels') duels(); else cartes();
  }
  const enteteSession = () => `<header class="barre-session">
      <button class="icone-btn" data-action="quitter" aria-label="Quitter la session">${ICONES.fermer}</button>
      <div class="progression"><span style="width:0%"></span></div>
      <span class="compteur"></span>
    </header>`;
  function majProgression(el) {
    const { i, items } = session;
    el.querySelector('.progression > span').style.width = `${(i / items.length) * 100}%`;
    el.querySelector('.compteur').textContent = `${Math.min(i + 1, items.length)} / ${items.length}`;
  }
  function quitter() { const id = session ? session.id : 'hiragana'; session = null; ecranDeck(id, 'entree-retour'); }

  /* ----- Mode cartes ----- */
  function faceAvant(d, it) {
    return `<div class="face avant">
      <span class="glyphe jp ${classeGlyphe(d, it)}">${it.c}</span>
      <span class="face-legende">${d.type === 'kanji' ? 'Que veut-il dire ?' : 'Quel son ?'}<small>Touche la carte pour la retourner</small></span>
    </div>`;
  }
  function faceArriere(d, it) {
    if (d.type === 'kanji') {
      const oku = [...it.kun, ...it.on].some((r) => r.includes('.'));
      return `<div class="face arriere">
        <span class="glyphe-petit jp">${it.c}</span>
        <span class="sens">${esc(it.fr)}</span>
        <dl class="lectures">
          <div><dt>Lecture japonaise <small>(kun)</small></dt><dd>${lectures(it.kun)}</dd></div>
          <div><dt>Lecture chinoise <small>(on)</small></dt><dd>${lectures(it.on)}</dd></div>
        </dl>
        ${oku ? '<p class="legende-oku">En plus clair : la partie écrite en hiragana.</p>' : ''}
      </div>`;
    }
    return `<div class="face arriere">
      <span class="glyphe-petit jp">${it.c}</span>
      <span class="romaji">${esc(it.r)}</span>
      ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
    </div>`;
  }

  function cartes() {
    const { d } = session;
    const el = afficher(`<main class="ecran session">
      ${enteteSession()}
      <div class="zone-cartes"><div class="pile"></div></div>
      <footer class="indices">
        <span class="indice gauche">${ICONES.gauche}Je ne sais pas</span>
        <span class="indice droite">Je sais${ICONES.droite}</span>
      </footer>
    </main>`, 'fondu');
    el.querySelector('[data-action="quitter"]').addEventListener('click', quitter);
    const pile = el.querySelector('.pile');
    let controle = null;

    function poserCarte(premiere) {
      majProgression(el);
      const it = session.items[session.i];
      const suiv = session.items[session.i + 1];
      pile.innerHTML = `${suiv ? `<div class="carte carte-suivante" aria-hidden="true"><div class="carte-inner">${faceAvant(d, suiv)}</div></div>` : ''}
        <div class="carte ${premiere ? '' : 'carte-nouvelle'}" tabindex="0" role="button" aria-label="Carte ${esc(it.c)}. Touche pour retourner.">
          <div class="carte-inner">${faceAvant(d, it)}${faceArriere(d, it)}</div>
          <span class="tampon sais">Je sais</span>
          <span class="tampon revoir">Je ne sais pas</span>
        </div>`;
      const carte = pile.querySelector('.carte:not(.carte-suivante)');
      const suivante = pile.querySelector('.carte-suivante');
      const tS = carte.querySelector('.tampon.sais');
      const tR = carte.querySelector('.tampon.revoir');
      const retourner = () => {
        carte.classList.toggle('retournee');
        carte.setAttribute('aria-label', carte.classList.contains('retournee') ? `Réponse : ${reponseTexte(d, it)}` : `Carte ${it.c}. Touche pour retourner.`);
      };
      controle = glisser(carte, {
        tap: retourner,
        deplacement: (r) => {
          tS.style.opacity = borne(r / 0.3, 0, 1);
          tR.style.opacity = borne(-r / 0.3, 0, 1);
          if (suivante) {
            const p = borne(Math.abs(r) / 0.6, 0, 1);
            suivante.style.transform = `translateY(${12 - 12 * p}px) scale(${0.94 + 0.06 * p})`;
          }
        },
        valider: (ok) => {
          noter(session.id, it.c, ok);
          session.resultats.push({ item: it, ok });
          session.i += 1;
          if (session.i >= session.items.length) resultats();
          else poserCarte(false);
        },
      });
      clavier = (ev) => {
        if (ev.key === 'ArrowRight') { ev.preventDefault(); controle.forcer(1); }
        else if (ev.key === 'ArrowLeft') { ev.preventDefault(); controle.forcer(-1); }
        else if ((ev.key === ' ' || ev.key === 'Enter') && document.activeElement !== el.querySelector('[data-action="quitter"]')) { ev.preventDefault(); retourner(); }
        else if (ev.key === 'Escape') quitter();
      };
    }
    if (!session.items.length) return resultats();
    poserCarte(true);
  }

  /* ----- Glisser une carte (ressorts, élan, interruptible) ----- */
  function ressort(depart, cible, vitesse, { reponse = 0.4, amortissement = 1, maj, fini, arret }) {
    const w = (2 * Math.PI) / reponse;
    let x = depart.x - cible.x, y = depart.y - cible.y, vx = vitesse.x, vy = vitesse.y;
    let t = performance.now(), raf = 0, actif = true;
    const pas = (now) => {
      if (!actif) return;
      const dt = Math.min((now - t) / 1000, 1 / 30); t = now;
      const n = 8, h = dt / n;
      for (let i = 0; i < n; i++) {
        vx += (-w * w * x - 2 * amortissement * w * vx) * h; x += vx * h;
        vy += (-w * w * y - 2 * amortissement * w * vy) * h; y += vy * h;
      }
      const px = cible.x + x, py = cible.y + y;
      if (arret && arret(px, py)) { maj(px, py); actif = false; if (fini) fini(); return; }
      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && Math.abs(vx) < 10 && Math.abs(vy) < 10) { maj(cible.x, cible.y); actif = false; if (fini) fini(); return; }
      maj(px, py);
      raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return { stop() { actif = false; cancelAnimationFrame(raf); } };
  }
  const projeter = (v, decel = 0.99) => (v / 1000) * decel / (1 - decel);

  function glisser(carte, { tap, deplacement, valider }) {
    let pid = null, debut = null, prise = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, bouge = false, hist = [], anim = null, parti = false;
    const largeur = () => carte.offsetWidth || 320;
    const poser = (x, y) => {
      pos = { x, y };
      carte.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(x / largeur()) * 12}deg)`;
      deplacement(x / largeur());
    };
    const revenir = (v) => { anim = ressort(pos, { x: 0, y: 0 }, v, { reponse: 0.42, amortissement: 0.78, maj: poser }); };
    const partir = (dir, v) => {
      parti = true;
      if (anim) anim.stop();
      if (reduit.matches) {
        carte.style.transition = 'opacity .15s';
        carte.style.opacity = '0';
        deplacement(dir);
        setTimeout(() => valider(dir > 0), 150);
        return;
      }
      const loin = window.innerWidth / 2 + largeur() * 1.2;
      anim = ressort(pos, { x: dir * (loin + 400), y: pos.y + v.y * 0.2 }, { x: dir * Math.max(Math.abs(v.x), 1100), y: v.y }, {
        reponse: 0.55, amortissement: 1, maj: poser,
        arret: (x) => Math.abs(x) >= loin,
        fini: () => valider(dir > 0),
      });
    };
    carte.addEventListener('pointerdown', (e) => {
      if (parti || pid !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
      pid = e.pointerId;
      try { carte.setPointerCapture(pid); } catch (err) { /* ignoré */ }
      if (anim) { anim.stop(); anim = null; }
      debut = { x: e.clientX, y: e.clientY };
      prise = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      bouge = pos.x !== 0 || pos.y !== 0;
      hist = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
      carte.classList.add('tenue');
    });
    carte.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pid) return;
      const t = performance.now();
      hist.push({ x: e.clientX, y: e.clientY, t });
      while (hist.length > 2 && t - hist[0].t > 100) hist.shift();
      if (!bouge && Math.hypot(e.clientX - debut.x, e.clientY - debut.y) > 8) bouge = true;
      if (bouge) poser(e.clientX - prise.x, e.clientY - prise.y);
    });
    const relacher = (e, annule) => {
      if (e.pointerId !== pid) return;
      pid = null;
      carte.classList.remove('tenue');
      const a = hist[0], b = hist[hist.length - 1];
      const dt = Math.max((b.t - a.t) / 1000, 0.016);
      let v = hist.length > 1 ? { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt } : { x: 0, y: 0 };
      if (performance.now() - b.t > 90) v = { x: 0, y: 0 };
      if (!bouge) { if (!annule) tap(); return; }
      const fin = pos.x + projeter(v.x);
      const seuil = largeur() * 0.42;
      if (!annule && fin > seuil && v.x > -150) partir(1, v);
      else if (!annule && fin < -seuil && v.x < 150) partir(-1, v);
      else revenir(v);
    };
    carte.addEventListener('pointerup', (e) => relacher(e, false));
    carte.addEventListener('pointercancel', (e) => relacher(e, true));
    return { forcer: (dir) => { if (!parti && pid === null) partir(dir, { x: 0, y: 0 }); } };
  }

  /* ----- Mode QCM ----- */
  function qcm() {
    const { d } = session;
    const el = afficher(`<main class="ecran session qcm">
      ${enteteSession()}
      <div class="question"></div>
      <div class="choix"></div>
      <div class="apres" hidden><p class="explication"></p><button class="btn-primaire" data-action="suivant">Suivant</button></div>
    </main>`, 'fondu');
    el.querySelector('[data-action="quitter"]').addEventListener('click', quitter);
    const zQ = el.querySelector('.question');
    const zC = el.querySelector('.choix');
    const zA = el.querySelector('.apres');
    const zE = el.querySelector('.explication');
    const btnSuivant = zA.querySelector('button');
    const kanji = d.type === 'kanji';
    const inverse = session.sens === 'inverse';
    let repondu = false;

    // Ce qui s'affiche sur un choix : caractère (sens inverse) ou réponse (sens normal)
    const optionHtml = (it) => (inverse
      ? `<span class="option-texte jp">${it.c}</span><span class="option-sous">${esc(reponseTexte(d, it))}</span>`
      : `<span class="option-texte ${kanji ? 'fr-o' : ''}">${esc(reponseTexte(d, it))}</span><span class="option-sous jp">${it.c}</span>`);
    const nom = (it) => `<span class="jp">${it.c}</span> (${esc(reponseTexte(d, it))})`;

    function poser() {
      if (session.i >= session.items.length) return resultats();
      repondu = false;
      majProgression(el);
      const it = session.items[session.i];
      const pool = itemsChoisis(session.id);
      const options = melanger([it, ...leurres(d, it, pool, session.choix - 1)]);
      const consigne = kanji ? (inverse ? 'Quel kanji ?' : 'Que veut-il dire ?') : (inverse ? 'Quel caractère ?' : 'Quel son ?');
      const question = inverse
        ? `<span class="question-texte ${kanji ? 'fr-q' : 'romaji-q'}">${esc(reponseTexte(d, it))}</span>`
        : `<span class="question-texte jp ${[...it.c].length > 1 ? 'long' : ''}">${it.c}</span>`;
      zQ.innerHTML = `<span class="question-consigne">${consigne}</span>${question}`;
      const longs = kanji && !inverse;
      const cols = options.length === 3 ? (longs ? 'c1' : 'c3') : 'c2';
      zC.className = `choix ${cols}`;
      zC.innerHTML = options.map((o, k) => `<button class="option" data-k="${k}">${optionHtml(o)}</button>`).join('');
      zA.hidden = true;
      zQ.classList.remove('fondu'); void zQ.offsetWidth; zQ.classList.add('fondu');

      const repondre = (k) => {
        if (repondu) return;
        repondu = true;
        const choisi = options[k];
        const ok = choisi === it;
        noter(session.id, it.c, ok);
        session.resultats.push({ item: it, ok });
        zC.classList.add('repondu');
        [...zC.children].forEach((b, j) => {
          b.disabled = true;
          if (options[j] === it) b.classList.add('juste');
          else if (j === k) b.classList.add('faux');
        });
        const details = kanji ? `<span class="lect">Japonaise : ${lectures(it.kun)} · chinoise : ${lectures(it.on)}</span>` : '';
        zE.innerHTML = ok
          ? `<b class="verdict-ok">Juste.</b> ${nom(it)}.${details}`
          : `<b class="verdict-ko">Pas tout à fait.</b> Tu as choisi ${nom(choisi)}. La bonne réponse : ${nom(it)}.${details}`;
        zA.hidden = false;
        btnSuivant.focus({ preventScroll: true });
      };
      zC.onclick = (ev) => { const b = ev.target.closest('.option'); if (b && !b.disabled) repondre(Number(b.dataset.k)); };
      clavier = (ev) => {
        const n = Number(ev.key);
        if (!repondu && n >= 1 && n <= options.length) { ev.preventDefault(); repondre(n - 1); }
        else if (repondu && (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight')) { ev.preventDefault(); suivant(); }
        else if (ev.key === 'Escape') quitter();
      };
    }
    function suivant() { session.i += 1; poser(); }
    btnSuivant.addEventListener('click', suivant);
    if (!session.items.length) return resultats();
    poser();
  }

  /* ----- Mode duels ----- */
  // Paires de sosies dont les deux caractères sont dans les niveaux choisis
  function pairesDuel(id) {
    const choisis = new Map(itemsChoisis(id).map((it) => [it.c, it]));
    return (DUELS[id] || '').split(' ').map((p) => [...p]).filter(([a, b]) => choisis.has(a) && choisis.has(b))
      .map(([a, b]) => ({ cle: a + b, a: choisis.get(a), b: choisis.get(b) }));
  }
  // Même logique de répétition espacée que les cartes, mais par paire
  function composerDuels(id) {
    const e = etat(id);
    e.duels = e.duels || {};
    const num = (e.sessionDuels || 0) + 1;
    const taille = store.reglages.taille;
    const paires = melanger(pairesDuel(id));
    const f = (p) => e.duels[p.cle];
    const vues = paires.filter(f);
    let lot = vues.filter((p) => f(p).n <= num).sort((x, y) => f(x).b - f(y).b || f(x).n - f(y).n).slice(0, taille);
    if (lot.length < taille) lot = lot.concat(paires.filter((p) => !f(p)).slice(0, taille - lot.length));
    if (lot.length < taille) lot = lot.concat(vues.filter((p) => !lot.includes(p)).sort((x, y) => f(x).n - f(y).n).slice(0, taille - lot.length));
    e.sessionDuels = num;
    sauver();
    return melanger(lot).map((p) => ({ ...p, rep: Math.random() < 0.5 ? p.a : p.b }));
  }
  function noterDuel(id, cle, ok) {
    const e = etat(id);
    const s = e.duels[cle] || { b: 0, n: 0 };
    s.b = ok ? Math.min(s.b + 1, 5) : 0;
    s.n = e.sessionDuels + ECARTS[s.b];
    e.duels[cle] = s;
    sauver();
  }

  function duels() {
    const { d } = session;
    const kanji = d.type === 'kanji';
    const el = afficher(`<main class="ecran session qcm duel">
      ${enteteSession()}
      <div class="question"></div>
      <div class="choix c2"></div>
      <div class="apres" hidden><p class="explication"></p><button class="btn-primaire" data-action="suivant">Suivant</button></div>
    </main>`, 'fondu');
    el.querySelector('[data-action="quitter"]').addEventListener('click', quitter);
    const zQ = el.querySelector('.question');
    const zC = el.querySelector('.choix');
    const zA = el.querySelector('.apres');
    const zE = el.querySelector('.explication');
    const btnSuivant = zA.querySelector('button');
    let repondu = false;

    function poser() {
      if (session.i >= session.items.length) return resultats();
      repondu = false;
      majProgression(el);
      const duel = session.items[session.i];
      const it = duel.rep;
      const options = Math.random() < 0.5 ? [duel.a, duel.b] : [duel.b, duel.a];
      zQ.innerHTML = `<span class="question-consigne">${kanji ? 'Lequel veut dire' : 'Lequel se lit'}</span>
        <span class="question-texte ${kanji ? 'fr-q' : 'romaji-q'}">${esc(reponseTexte(d, it))}</span>`;
      zC.classList.remove('repondu');
      zC.innerHTML = options.map((o, k) => `<button class="option option-duel" data-k="${k}"><span class="option-texte jp">${o.c}</span><span class="option-sous">${esc(reponseTexte(d, o))}</span></button>`).join('');
      zA.hidden = true;
      zQ.classList.remove('fondu'); void zQ.offsetWidth; zQ.classList.add('fondu');

      const repondre = (k) => {
        if (repondu) return;
        repondu = true;
        const choisi = options[k];
        const ok = choisi === it;
        noterDuel(session.id, duel.cle, ok);
        session.resultats.push({ item: it, ok });
        zC.classList.add('repondu');
        [...zC.children].forEach((b, j) => {
          b.disabled = true;
          b.classList.add(options[j] === it ? 'juste' : (j === k ? 'faux' : 'autre'));
        });
        const autre = options.find((o) => o !== it);
        zE.innerHTML = `${ok ? '<b class="verdict-ok">Juste.</b>' : '<b class="verdict-ko">Pas tout à fait.</b>'} <span class="jp">${it.c}</span> = ${esc(reponseTexte(d, it))}, <span class="jp">${autre.c}</span> = ${esc(reponseTexte(d, autre))}.`;
        zA.hidden = false;
        btnSuivant.focus({ preventScroll: true });
      };
      zC.onclick = (ev) => { const b = ev.target.closest('.option'); if (b && !b.disabled) repondre(Number(b.dataset.k)); };
      clavier = (ev) => {
        if (!repondu && (ev.key === '1' || ev.key === 'ArrowLeft')) { ev.preventDefault(); repondre(0); }
        else if (!repondu && (ev.key === '2' || ev.key === 'ArrowRight')) { ev.preventDefault(); repondre(1); }
        else if (repondu && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); suivant(); }
        else if (ev.key === 'Escape') quitter();
      };
    }
    function suivant() { session.i += 1; poser(); }
    btnSuivant.addEventListener('click', suivant);
    if (!session.items.length) return resultats();
    poser();
  }

  /* ---------- Résultats ---------- */
  function resultats() {
    const { d, resultats: r, id } = session;
    const sus = r.filter((x) => x.ok).length;
    const rates = r.filter((x) => !x.ok);
    const message = !r.length ? 'Aucune carte dans cette session.'
      : rates.length ? 'Les cartes ratées reviendront à la prochaine session.'
        : 'Tout est su. Ces cartes reviendront plus tard pour vérifier que c’est bien ancré.';
    const el = afficher(`<main class="ecran resultats">
      <div class="resultat-tete">
        <div class="resultat-chiffre">${sus}<span> / ${r.length}</span></div>
        <h2>Session terminée</h2>
        <p>${message}</p>
      </div>
      ${rates.length ? `<section class="bloc"><h3 class="bloc-titre">À revoir</h3><div class="puces">${rates.map(({ item }) => `<span class="puce"><span class="jp">${item.c}</span><span>${esc(reponseTexte(d, item))}</span></span>`).join('')}</div></section>` : ''}
      <div class="pied">
        <button class="btn-primaire" data-action="encore">Nouvelle session</button>
        <button class="btn-secondaire" data-action="deck">Retour</button>
      </div>
    </main>`, 'fondu');
    el.querySelector('[data-action="encore"]').addEventListener('click', () => lancer(id));
    el.querySelector('[data-action="deck"]').addEventListener('click', () => { session = null; ecranDeck(id, 'entree-retour'); });
    clavier = (ev) => { if (ev.key === 'Escape') { session = null; ecranDeck(id, 'entree-retour'); } };
  }

  /* ---------- Réglages ---------- */
  function reglages(anim = 'entree') {
    const lignes = DECKS.map((d) => {
      const s = stats(d.id, tousItems(d));
      return `<div class="ligne-reset" data-deck="${d.id}">
        <span>${d.nom}<small>${s.vus} carte${s.vus > 1 ? 's' : ''} vue${s.vus > 1 ? 's' : ''} · ${s.maitrises} maîtrisée${s.maitrises > 1 ? 's' : ''}</small></span>
        <span class="actions"><button class="btn-petit" data-reset="${d.id}" ${s.vus ? '' : 'disabled'}>Réinitialiser</button></span>
      </div>`;
    }).join('');
    const el = afficher(`<main class="ecran reglages">
      <header class="barre-haut">
        <button class="icone-btn" data-action="accueil" aria-label="Retour">${ICONES.retour}</button>
        <h2>Réglages</h2>
      </header>
      <section class="bloc">
        <h3 class="bloc-titre">Taille des sessions</h3>
        <div class="segment" data-groupe="taille">${TAILLES.map((t) => `<button data-val="${t}" aria-pressed="${store.reglages.taille === t}">${t}</button>`).join('')}</div>
        <p class="aide-mode">Nombre de cartes par session, en mode Cartes comme en QCM.</p>
      </section>
      <section class="bloc">
        <h3 class="bloc-titre">Progression</h3>
        <div class="liste">${lignes}</div>
      </section>
      <section class="bloc a-propos">
        <h3 class="bloc-titre">À propos</h3>
        <p>Kusanagi <span class="jp">草薙</span> · version 1.0. Application personnelle, sans publicité ni pistage : ta progression reste sur ton téléphone.</p>
        <p>Caractères affichés avec la police Klee One (Fontworks), sous licence SIL Open Font License 1.1.</p>
      </section>
    </main>`, anim);
    el.addEventListener('click', (ev) => {
      const t = ev.target.closest('button');
      if (!t || t.disabled) return;
      if (t.dataset.action === 'accueil') return accueil('entree-retour');
      if (t.parentElement.dataset.groupe === 'taille') { store.reglages.taille = Number(t.dataset.val); sauver(); return reglages(null); }
      if (t.dataset.reset) {
        const actions = t.parentElement;
        actions.innerHTML = `<button class="btn-petit" data-annuler>Annuler</button><button class="btn-petit attention" data-confirmer="${t.dataset.reset}">Tout effacer</button>`;
        actions.querySelector('[data-confirmer]').focus();
        return;
      }
      if (t.hasAttribute('data-annuler')) return reglages(null);
      if (t.dataset.confirmer) { delete store.decks[t.dataset.confirmer]; sauver(); reglages(null); }
    });
    clavier = (ev) => { if (ev.key === 'Escape') accueil('entree-retour'); };
  }

  /* ---------- Démarrage ---------- */
  accueil(null);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  // Petite porte d'entrée pour les tests automatiques
  window.__kusanagi = { store: () => store, session: () => session };
})();
