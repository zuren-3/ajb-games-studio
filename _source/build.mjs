// AJB Games Studio, static site generator.
// Run:  node build.mjs   ->  writes the finished site to ../ajb-site
// To change a game, edit the GAMES list below and run it again.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || path.join(HERE, '..', 'ajb-site');
const STEAM_CURATOR = 'https://store.steampowered.com/curator/45501369';
const SITE_DESC = "AJB GAMES STUDIO is an independent horror game studio from Morocco. Martha's Dolls, UNCURSED, BOKKIE, The Moroccan Castle 3 and Martha's Dolls 2.";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const rgb = hex => [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16)).join(',');

/* ---------- content ---------- */
const GAMES = [
  { id: 'martha-s-dolls-2', title: "Martha's Dolls 2", color: '#9b5cf0', status: 'released', year: '2026', when: 'Released · 2026', scene: 'doll', steam: 4469120, order: 5,
    imgs: { hero: 'martha-s-dolls-2-header.jpg' }, poster: 'martha-s-dolls-2-hero.jpg',
    tagline: 'The dolls have learned to hunt.',
    blurb: "An urban explorer enters the ruins of Martha's House to learn the truth behind the rumours. The porcelain dolls are hunting now.",
    tags: ['First-person horror', 'Psychological horror', 'Multiple endings', 'Puzzles'],
    facts: [['Release', 'September 1, 2026'], ['Price', '$4.99'], ['Steam reviews', '81% positive (22 reviews)'], ['Languages', '9']],
    lede: "The story picks up after Chapter 1. An urban explorer enters Martha's House to find out what is behind the local rumours, and discovers that the house is not empty. People who came before seem to have vanished.",
    body: 'The sequel opens the house up with new rooms and hidden crawlspaces. The dolls act with more intent than before, and a refined lighting engine and 3D audio carry the dread.',
    inside: ['Expanded rooms and hidden crawlspaces', 'Dolls with their own abilities that actively hunt you', 'Refined lighting engine and 3D audio', 'Inventory system and puzzles', 'Multiple endings'],
    links: [['View on Steam', 'https://store.steampowered.com/app/4469120/'], ['Play the demo on itch.io', 'https://ajbstudio.itch.io/marthas-dolls-2-demo']] },
  { id: 'uncursed', title: 'UNCURSED', color: '#d2335c', status: 'released', year: '2025', when: 'Released · 2025', scene: 'house', steam: 3316910, order: 4,
    tagline: 'Grandma’s house is not as quiet as it looks.',
    blurb: 'Alex returns to his grandmother’s house after months of unanswered calls. It looks calm. It is not, and the ending depends on you.',
    tags: ['Psychological horror', 'Atmospheric', 'Multiple endings', 'Short'],
    facts: [['Release', 'February 20, 2025'], ['Price', '$5.99'], ['Steam reviews', 'See Steam'], ['Length', 'Short']],
    lede: 'Alex has not heard from his grandmother in months. He goes back to her house and finds it calm at first. Then the house turns into a nightmare, and he has to survive its secrets.',
    body: 'UNCURSED is a short psychological horror with multiple endings. Its monsters and settings draw on Moroccan folklore. The demo passed 16,000 downloads on itch.io.',
    inside: ['Psychological horror in a family home', 'Multiple endings shaped by your choices', 'Monsters and places drawn from Moroccan folklore', 'A short, focused run', 'Free demo on itch.io'],
    links: [['View on Steam', 'https://store.steampowered.com/app/3316910/UNCURSED/'], ['Get it on itch.io', 'https://ajbstudio.itch.io/uncursed']] },
  { id: 'bokkie', title: 'BOKKIE', color: '#3fe34a', status: 'released', year: '2024', when: 'Released · 2024', scene: 'mascot', steam: 2880530, order: 3,
    tagline: 'The toys were friendly once.',
    blurb: 'A short mascot horror in a kindergarten and school. The toys built beneath it have turned hostile, and a detective has to find out why.',
    tags: ['Mascot horror', 'Atmospheric', 'Short', 'Singleplayer'],
    facts: [['Release', 'June 28, 2024'], ['Price', '$3.99'], ['Steam reviews', 'See Steam'], ['Platform', 'Windows']],
    lede: 'Beneath a kindergarten and school, the director runs a toy factory. The once-friendly BOKKIE toys have turned hostile and roam the building.',
    body: 'You play a detective. Explore the school, solve puzzles and face the haunted toys to uncover what is behind them.',
    inside: ['Mascot horror set in a school', 'Puzzles and detective work', 'Built in Unity for Windows', 'Pay what you want on itch.io'],
    links: [['Get it on itch.io', 'https://ajbstudio.itch.io/bokkie'], ['View on Steam', 'https://store.steampowered.com/app/2880530/BOKKIE/']] },
  { id: 'martha-s-dolls', title: "Martha's Dolls", color: '#b07cf5', status: 'released', year: '2024', when: 'Released · 2024', scene: 'doll', steam: 2614380, order: 2,
    tagline: 'Every doll in this village remembers Martha.',
    blurb: 'First-person survival in a cursed, abandoned village. Dolls wander and hunt, the streets are full of traps, and the curse needs solving.',
    tags: ['First-person horror', 'Survival', 'Atmospheric', 'Puzzles'],
    facts: [['Release', 'January 9, 2024'], ['Price', '$4.99'], ['Steam reviews', '66% positive (56 reviews)'], ['Languages', 'English']],
    lede: 'A first-person horror game in a cursed, abandoned village haunted by dolls tied to an old woman named Martha. Investigate the curse and find out what happened.',
    body: 'Some dolls wander and some hunt. The village is a maze of streets full of traps, with items to collect and puzzles to solve.',
    inside: ['Cursed village setting', 'Dolls with different behaviours', 'Inventory system and puzzles', 'Traps and a maze-like layout'],
    links: [['View on Steam', 'https://store.steampowered.com/app/2614380/Marthas_Dolls/'], ['Get it on itch.io', 'https://ajbstudio.itch.io/marthas-dolls']] },
  { id: 'the-moroccan-castle-3', title: 'The Moroccan Castle 3', color: '#e0a82a', status: 'released', year: '2023', when: 'Released · 2023', scene: 'castle', steam: 2339500, order: 1,
    tagline: 'Something in the castle is still awake.',
    blurb: 'A young archaeologist explores a decaying Moroccan castle of torture chambers, altars and cursed artefacts. Something there is still awake.',
    tags: ['First-person horror', 'Adventure', 'Creepy', 'Singleplayer'],
    facts: [['Release', 'March 20, 2023'], ['Price', '$4.99'], ['Steam reviews', 'See Steam'], ['Series', 'Part 3']],
    lede: 'You play a young archaeologist exploring the ruins of a decaying Moroccan castle. Torture chambers, sacrificial altars and cursed artefacts fill its halls, and something supernatural is still active inside.',
    body: 'Expect puzzles, traps, creature fights, jump scares and chase sequences. It is the third game in the Moroccan Castle series.',
    inside: ['Castle exploration in first person', 'Puzzles and traps', 'Creature encounters and chases', 'Part of the Moroccan Castle series'],
    links: [['View on Steam', 'https://store.steampowered.com/app/2339500/The_Moroccan_Castle_3__Behind_The_Secrets/'], ['Get it on itch.io', 'https://ajbstudio.itch.io/the-moroccan-castle-3']] },
];
const EXTRA = [
  { title: 'NEVER LEAVE', color: '#3f86ff', status: 'dev', when: 'In development', blurb: 'Not announced yet.', classified: true },
  { title: 'Assignment', color: '#f0479a', status: 'dev', when: 'In development', blurb: 'Not announced yet.', classified: true },
];
const STATS = [['2.8', 1, 'M+', 'downloads across all platforms, as reported in September 2024'], ['2.6', 1, 'M+', 'of those on itch.io'], ['16', 0, 'K', 'downloads of the UNCURSED demo'], ['9', 0, '', "languages in Martha's Dolls 2"]];
const TIMELINE = [['Mar 2023', 'The Moroccan Castle 3: Behind the Secrets', '#e0a82a'], ['Jan 2024', "Martha's Dolls", '#b07cf5'], ['Jun 2024', 'BOKKIE', '#3fe34a'], ['Sep 2024', '2.8 million downloads across platforms', '#e8a74a'], ['Feb 2025', 'UNCURSED', '#d2335c'], ['Sep 2026', "Martha's Dolls 2", '#9b5cf0']];
const PRESS = [['Games Industry Africa · Sep 2024', 'Reports the studio passing 2.8 million downloads across platforms.', 'https://gamesindustryafrica.com/2024/09/02/ajb-games-studios-celebrates-pc-milestone/'], ['LGaming · 2025', 'Covers the reveal of UNCURSED and its first demo.', 'https://lgaming.ma/ajb-studio-reveals-new-horror-game-uncursed/'], ["L'Economiste · 2025", 'Highlights UNCURSED as a game fully developed in Morocco.', 'https://weekly.leconomiste.com/gaming-a-video-game-fully-developed-in-morocco/']];
const SOCIALS = [['Steam', 'AJB GAMES COMMUNITY', STEAM_CURATOR], ['itch.io', 'ajbstudio.itch.io', 'https://ajbstudio.itch.io/'], ['YouTube', '@ajbgamesstudio', 'https://www.youtube.com/@ajbgamesstudio'], ['Instagram', '@ajb_studio', 'https://www.instagram.com/ajb_studio/'], ['Facebook', 'AJB GAMES', 'https://www.facebook.com/AJBGAMESTUDIO/'], ['X', '@ProgrammerUnity', 'https://x.com/ProgrammerUnity'], ['Ko-fi', 'Support the studio', 'https://ko-fi.com/ajbgamesstudio'], ['LinkedIn', 'Ayman Jbari', 'https://www.linkedin.com/in/ayman-jbari-139204204/']];

/* ---------- art: silhouettes drawn in code, used until a real picture loads ---------- */
const K = '#020304';
const SCENES = {
  house: `<rect x="100" y="112" width="120" height="88" fill="${K}"/><path d="M88 114 L160 62 L232 114Z" fill="${K}"/><rect class="lit" x="132" y="130" width="24" height="28"/><rect x="178" y="152" width="22" height="48" fill="#090b0e"/><path d="M52 200 V138 M52 160 l-14 -16 M52 150 l14 -14" stroke="${K}" stroke-width="4" fill="none"/>`,
  doll: `<circle cx="160" cy="62" r="9" fill="${K}"/><circle cx="160" cy="94" r="27" fill="${K}"/><path d="M118 200 L136 122 Q160 110 184 122 L202 200Z" fill="${K}"/><circle class="eye" cx="150" cy="94" r="3.4"/><circle class="eye" cx="170" cy="94" r="3.4"/><path d="M60 200 V150 M60 168 l-12 -14 M60 158 l12 -12" stroke="${K}" stroke-width="4" fill="none"/>`,
  mascot: `<g class="lit" opacity=".16"><rect x="30" y="56" width="30" height="24"/><rect x="72" y="56" width="30" height="24"/><rect x="218" y="56" width="30" height="24"/><rect x="260" y="56" width="30" height="24"/></g><circle cx="128" cy="76" r="15" fill="${K}"/><circle cx="192" cy="76" r="15" fill="${K}"/><circle cx="160" cy="108" r="38" fill="${K}"/><circle class="eye" cx="147" cy="102" r="4.4"/><circle class="eye" cx="173" cy="102" r="4.4"/><path class="lit-s" d="M144 122 l6 6 l6 -6 l6 6 l6 -6 l6 6" fill="none" stroke-width="2.5" stroke-linejoin="round"/>`,
  castle: `<rect x="50" y="92" width="45" height="108" fill="${K}"/><path d="M50 92 V78 h9 v10 h9 v-10 h9 v10 h9 v-10 h9 v14Z" fill="${K}"/><rect x="225" y="92" width="45" height="108" fill="${K}"/><path d="M225 92 V78 h9 v10 h9 v-10 h9 v10 h9 v-10 h9 v14Z" fill="${K}"/><rect x="95" y="122" width="130" height="78" fill="${K}"/><path class="lit" opacity=".85" d="M138 200 V152 a22 22 0 0 1 44 0 V200Z"/>`,
  city: `<g fill="${K}"><rect x="28" y="110" width="38" height="90"/><rect x="72" y="84" width="30" height="116"/><rect x="108" y="124" width="44" height="76"/><rect x="158" y="70" width="34" height="130"/><rect x="198" y="104" width="40" height="96"/><rect x="244" y="130" width="48" height="70"/></g><g class="lit" opacity=".9"><rect x="80" y="96" width="5" height="7"/><rect x="166" y="86" width="5" height="7"/><rect x="176" y="108" width="5" height="7"/><rect x="208" y="118" width="5" height="7"/></g><g class="lit" opacity=".55"><rect class="bar" x="112" y="150" width="4" height="22"/><rect class="bar b2" x="120" y="146" width="4" height="30"/><rect class="bar b3" x="128" y="152" width="4" height="18"/><rect class="bar" x="136" y="148" width="4" height="26"/></g>`,
};
const MIST = '<ellipse class="mist" cx="110" cy="158" rx="150" ry="13"/><ellipse class="mist m2" cx="230" cy="176" rx="130" ry="10"/>';
function steamFb(g, kind) {
  if (!g.steam) return '';
  const f = kind === 'hero' ? ['library_hero.jpg', 'header.jpg'] : ['header.jpg'];
  return f.flatMap(n => ['akamai', 'cloudflare'].map(h => `https://cdn.${h}.steamstatic.com/steam/apps/${g.steam}/${n}`)).join(' ');
}
function art(g, p, kind = 'header', alt = '') {
  // Coming-soon games get a special placeholder card instead of real art
  const pic = g.imgs && g.imgs[kind];
  if (g.status === 'announced' && !g.steam && !pic) {
    return `<div class="art coming-soon-art" style="--c:${g.color}"><span class="cs-mark">${esc(g.title)}</span><span class="cs-label">Coming Soon</span></div>`;
  }
  if (g.status === 'announced' && !g.steam && !pic && kind === 'hero') {
    return `<div class="art coming-soon-art" style="--c:${g.color};aspect-ratio:auto;height:100%"><span class="cs-mark">${esc(g.title)}</span><span class="cs-label">Coming Soon</span></div>`;
  }
  const file = pic || `${g.id}-${kind}.jpg`;
  const contain = g.containArt && g.containArt.includes(kind) ? ' art-contain' : '';
  const img = `<img src="${p}images/${file}" data-fb="${steamFb(g, kind)}" alt="${esc(alt)}" loading="lazy" decoding="async" onload="this.classList.add('ok')">`;
  return `<div class="art${contain}" style="--c:${g.color}"><svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${SCENES[g.scene]}${MIST}</svg>${img}</div>`;
}

/* ---------- shared page parts ---------- */
const list = GAMES;
// the corridor walks the games from the oldest release to the newest
const CORRIDOR = [...GAMES].sort((a, b) => (a.order || 99) - (b.order || 99));
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&family=JetBrains+Mono:wght@500&family=Manrope:wght@400;500;700&family=Newsreader:ital,wght@1,400&display=swap">';

function header(p, cur) {
  const a = (href, label, key) => `<a href="${p}${href}"${cur === key ? ' aria-current="page"' : ''}>${label}</a>`;
  const themeBtn = `<button class="btn sm theme-toggle" id="themeToggle" type="button" aria-label="Switch to light mode" title="Light mode"><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.9 1.9M17.1 17.1 19 19M19 5l-1.9 1.9M6.9 17.1 5 19"/></svg><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a8.5 8.5 0 1 0 10.6 10.6Z"/></svg></button>`;
  const menuBtn = `<button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="menuPanel"><span></span><span></span><span></span></button>`;
  const menuPanel = `<div class="menu" id="menuPanel">${a('games.html', 'Games', 'games')}${a('studio.html', 'Studio', 'studio')}${a('studio.html#follow', 'Follow', 'follow')}<a href="${STEAM_CURATOR}" target="_blank" rel="noopener">Steam</a></div>`;
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="bar">
<a class="brand" href="${p}index.html" aria-label="AJB Games Studio, home"><img class="logo bar-logo" src="${p}images/logo.png" alt="AJB Games Studio" onerror="this.style.display='none'"><span class="word"><b>AJB</b><span>Games Studio</span></span></a>
<nav class="nav" aria-label="Main">${a('games.html', 'Games', 'games')}${a('studio.html', 'Studio', 'studio')}${a('studio.html#follow', 'Follow', 'follow')}${themeBtn}<a class="btn lamp sm" href="${STEAM_CURATOR}" target="_blank" rel="noopener">Steam</a></nav>${menuBtn}
</div>${menuPanel}<div class="progress" id="progress" aria-hidden="true"></div></header>
<div class="grain" aria-hidden="true"></div><div class="cursor-light" aria-hidden="true"></div>`;
}
function footer(p) {
  return `<footer><div class="wrap foot">
<div><img class="foot-logo" src="${p}images/logo.png" alt="AJB Games Studio" onerror="this.style.display='none'"><p class="small">Independent horror games by AJB Games Studio.</p></div>
<div><h2>Games</h2><ul>${list.map(g => `<li><a href="${p}games/${g.id}.html">${esc(g.title)}</a></li>`).join('')}</ul></div>
<div><h2>Studio</h2><ul><li><a href="${p}games.html">All games</a></li><li><a href="${p}studio.html">About and press</a></li><li><a href="${p}studio.html#follow">Follow</a></li><li><a href="https://ko-fi.com/ajbgamesstudio" target="_blank" rel="noopener">Support on Ko-fi</a></li></ul></div>
<div><h2>&copy; 2026</h2><p class="small">AJB GAMES STUDIO. Made in Morocco.</p></div>
</div></footer>
<div class="curtain" aria-hidden="true"></div>`;
}
function page({ file, title, desc, cur = '', body, theme = '' }) {
  const p = file.includes('/') ? '../' : '';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website">
<meta name="theme-color" content="#04060a">
<link rel="icon" href="${p}favicon.svg" type="image/svg+xml">
${fonts}
<link rel="stylesheet" href="${p}assets/style.css">
<script>document.documentElement.className='js';try{document.documentElement.dataset.theme=localStorage.getItem('ajb-theme')||'dark'}catch(e){document.documentElement.dataset.theme='dark'}</script>
</head>
<body${theme ? ` class="${theme}"` : ''}>
${header(p, cur)}
${body(p)}
${footer(p)}
<script src="${p}assets/site.js" defer></script>
</body>
</html>
`;
  const f = path.join(OUT, file); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html);
}
const stats = () => `<div class="stats">${STATS.map(([n, d, s, t], i) => `<div class="stat" style="--d:${i * .1}s"><b data-to="${n}" data-dec="${d}" data-suffix="${s}">${Number(n).toLocaleString('en-US', { minimumFractionDigits: d })}${s}</b><span>${esc(t)}</span></div>`).join('')}</div>`;
const stage = (id, tint, extra = '') => `<canvas class="gl" data-tint="${tint}" aria-hidden="true"></canvas><canvas class="eyes" aria-hidden="true"></canvas><div class="vignette" aria-hidden="true"></div><div class="flash" aria-hidden="true"></div>${extra}`;
const status = g => `<span class="status"><i${g.status === 'released' ? '' : ' class="hollow"'}></i>${esc(g.when)}</span>`;

/* ---------- home ---------- */
page({
  file: 'index.html', title: 'AJB Games Studio', desc: SITE_DESC, cur: 'home', body: p => {
    const SPOTS = [[54, 8, -5], [26, 56, 4], [66, 46, -3], [3, 62, 3], [74, 6, 4]];
    const posters = ['uncursed', 'martha-s-dolls-2', 'bokkie', 'the-moroccan-castle-3', 'martha-s-dolls'].map((id, i) => {
      const g = GAMES.find(x => x.id === id);
      return `<div class="poster" style="--c:${g.color};left:${SPOTS[i][0]}%;top:${SPOTS[i][1]}%;--rot:${SPOTS[i][2]}deg">${art(g, p)}<b>${esc(g.title)}</b></div>`;
    }).join('');
    const tick = [...GAMES.map(g => [g.title, g.color]), ...EXTRA.filter(g => !g.classified).map(g => [g.title, g.color])].map(([t, c]) => `<span>${esc(t)}</span><i style="--c:${c}"></i>`).join('');
    const frames = CORRIDOR.map(g => `<a class="frame" href="${p}games/${g.id}.html" style="--c:${g.color}" data-title="${esc(g.title)}" data-tag="${esc(g.tagline)}" data-when="${esc(g.when)}" aria-label="${esc(g.title)}, ${esc(g.when)}">${art(g, p)}<span class="dim"></span><span class="fcap"><b>${esc(g.title)}</b><small>${esc(g.when)}</small></span></a>`).join('');
    const M = GAMES[0];
    const C0 = CORRIDOR[0];
    return `<main id="main">
<section class="stage hero" data-stage="hero" data-eye="255,226,170" aria-label="AJB Games Studio">
<div class="reveal" aria-hidden="true">${posters}</div>
${stage('hero', '255,60,45')}
<div class="hud" aria-hidden="true"><span class="tl">CAM 01 · AJB GAMES STUDIO</span><span class="tr"><i class="dot"></i>REC <time class="tc">00:00:00:00</time></span><span class="bl">ENTITIES <b data-ent>0</b> · CAUGHT <b data-caught>0</b></span><span class="br">BAT 87%</span></div>
<div class="hero-body wrap">
<h1 class="title flicker-bulb" id="title" aria-label="AJB Games Studio">AJB</h1>
<p class="subtitle" aria-hidden="true">GAMES STUDIO</p>
<div class="row"><a class="btn lamp" href="${p}games.html">Explore the games</a><a class="btn" href="${p}games/martha-s-dolls-2.html">Martha's Dolls 2</a></div>
<p class="hint"><span class="fine">Move the light. Click to take a photo.</span><span class="coarse">Drag to move the light.</span> Something is watching.</p>
</div>
<a class="scroll-cue" href="#corridor" aria-label="Scroll to the corridor"><span></span></a>
</section>
<div class="ticker" aria-hidden="true"><div class="ticker-track"><div class="ticker-set">${tick}</div><div class="ticker-set">${tick}</div></div></div>

<section class="corridor" id="corridor" style="--n:${CORRIDOR.length}" aria-labelledby="corT">
<div class="cor-track" id="corTrack"><div class="cor-pin stage" id="corPin" data-stage="corridor" data-eye="255,226,170">
<canvas class="gl" data-tint="255,60,45" aria-hidden="true"></canvas>
<div class="cor-view" id="corView" aria-hidden="false"><div class="cor-scene" id="corScene">${frames}</div></div>
<canvas class="eyes" aria-hidden="true"></canvas><div class="vignette" aria-hidden="true"></div>
<div class="cor-head"><h2 id="corT">Walk the corridor</h2><p class="small">Scroll to move forward. Every frame is a game.</p></div>
<div class="cor-info" id="corInfo" aria-live="polite"><span class="num"><b id="corNum">01</b> / ${String(CORRIDOR.length).padStart(2, '0')}</span><strong id="corName">${esc(C0.title)}</strong><p id="corTag">${esc(C0.tagline)}</p><a class="btn lamp sm" id="corGo" href="${p}games/${C0.id}.html">Open the case file</a></div>
<div class="cor-rail" aria-hidden="true"><i id="corRail"></i></div>
</div></div>
</section>

<section class="wrap latest" aria-labelledby="latestT">
<h2 id="latestT" class="big-h" data-scramble>Martha's House is open again</h2>
<article class="feature rv" style="--c:${M.color}">${art(M, p, 'hero')}<div class="feature-body">${status(M)}
<h3>${esc(M.title)}</h3><p>${esc(M.blurb.replace('The porcelain dolls are hunting now.', 'The porcelain dolls are hunting now. Expanded rooms and hidden crawlspaces, dolls that act with more intent, a refined lighting engine and 3D audio.'))}</p>
<ul class="facts"><li><b>81%</b><span>positive on Steam, 22 reviews</span></li><li><b>9</b><span>languages</span></li><li><b>$4.99</b><span>on Steam</span></li></ul>
<div class="row"><a class="btn lamp" href="https://store.steampowered.com/app/4469120/" target="_blank" rel="noopener">View on Steam</a><a class="btn" href="${p}games/${M.id}.html">Open the case file</a></div></div></article>
</section>

<section class="wrap" aria-labelledby="numT"><h2 id="numT" class="big-h" data-scramble>Played worldwide</h2>${stats()}</section>

<section class="wrap"><div class="band rv"><h2>An independent studio with its own voice.</h2><div class="row"><a class="btn lamp" href="${p}studio.html">Meet the studio</a><a class="btn" href="${p}studio.html#follow">Follow along</a></div></div></section>
</main>`;
  },
});

/* ---------- games ---------- */
page({
  file: 'games.html', title: 'Games | AJB Games Studio', desc: 'Every game from AJB GAMES STUDIO.', cur: 'games', body: p => {
    const cards = GAMES.map(g => `<li class="card" data-status="${g.status}" style="--c:${g.color}"><a class="card-link" href="${p}games/${g.id}.html" aria-label="${esc(g.title)}, open the case file"></a>${art(g, p)}<div class="card-body">${status(g)}<h3>${esc(g.title)}</h3><p>${esc(g.blurb)}</p><ul class="tags">${g.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul><span class="more">Open the case file</span></div></li>`).join('')
      + EXTRA.map(g => `<li class="card${g.classified ? ' classified' : ''}" data-status="${g.status}" style="--c:${g.color}"><div class="art noise" style="--c:${g.color}"><span class="glyph" aria-hidden="true">${g.classified ? '?' : '♪'}</span></div><div class="card-body">${status(g)}<h3>${esc(g.title)}</h3><p>${esc(g.blurb)}</p>${g.tags ? `<ul class="tags">${g.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div></li>`).join('');
    const n = s => (s === 'all' ? GAMES.length + EXTRA.length : [...GAMES, ...EXTRA].filter(g => g.status === s).length);
    return `<main id="main" class="wrap page">
<header class="page-title"><h1 class="big-h" data-scramble>Games</h1><p>Every game from AJB Games Studio. Open a case file for the story, the facts and where to play.</p></header>
<div class="filters" id="filters" role="group" aria-label="Filter games by status">${[['all', 'All'], ['released', 'Released'], ['announced', 'Announced'], ['dev', 'In development']].filter(([k]) => n(k) > 0).map(([k, l], i) => `<button class="btn sm" type="button" data-f="${k}" aria-pressed="${i === 0}">${l} ${n(k)}</button>`).join('')}</div>
<ul class="grid" id="grid">${cards}</ul>
</main>`;
  },
});

/* ---------- studio ---------- */
page({
  file: 'studio.html', title: 'Studio | AJB Games Studio', desc: 'AJB GAMES STUDIO was founded by Ayman Jbari. Independent horror games, built in Unity.', cur: 'studio', body: p => `<main id="main" class="wrap page">
<header class="page-title"><h1 class="big-h" data-scramble>The Studio</h1><p>Independent horror games by Ayman Jbari and AJB Games Studio.</p></header>
<section class="studio"><div class="rv"><p class="quote">Cursed castles, haunted dolls, and family homes where something is deeply wrong.</p>
<p>AJB GAMES STUDIO was founded by Ayman Jbari, based in Morocco. The studio makes horror games — from first-person castle crawls to haunted mascot toys — and is now working on its next project.</p><p>Winner of the Coup de Coeur award at the LGaming Awards 2023.</p></div>
<div><h2>Timeline</h2><ol class="tl" id="tl" aria-label="Studio timeline">${TIMELINE.map(([t, s, c]) => `<li style="--c:${c}"><time>${t}</time><strong>${esc(s)}</strong></li>`).join('')}</ol></div></section>
<section>${stats()}</section>
<section id="press" aria-labelledby="pressT"><h2 id="pressT" class="big-h sm" data-scramble>Heard beyond the dark</h2><ul class="press">${PRESS.map(([s, t, u], i) => `<li class="rv" style="--d:${i * .08}s"><a href="${u}" target="_blank" rel="noopener"><small>${esc(s)}</small><span>${esc(t)}</span></a></li>`).join('')}</ul></section>
<section id="follow" aria-labelledby="followT"><h2 id="followT" class="big-h sm" data-scramble>Follow the studio</h2><ul class="socials">${SOCIALS.map(([n, h, u], i) => `<li class="rv" style="--d:${i * .05}s"><a href="${u}" target="_blank" rel="noopener"><div><strong>${esc(n)}</strong><span>${esc(h)}</span></div><em aria-hidden="true">↗</em></a></li>`).join('')}</ul></section>
</main>`,
});

/* ---------- each game ---------- */
GAMES.forEach((g, i) => {
  const prev = GAMES[(i + GAMES.length - 1) % GAMES.length], next = GAMES[(i + 1) % GAMES.length];
  const btns = g.links.length ? g.links.map(([l, u], k) => `<a class="btn ${k ? '' : 'glow'}" href="${u}" target="_blank" rel="noopener">${l}</a>`).join('') : '<span class="muted">Store pages are coming soon.</span>';
  page({
    file: `games/${g.id}.html`, title: `${g.title} | AJB Games Studio`, desc: `${g.tagline} ${g.lede}`, cur: 'games', body: p => `<main id="main" style="--c:${g.color}">
<section class="stage ghero" data-stage="game" data-eye="${rgb(g.color)}">
<div class="layer" data-parallax>${art(g, p, 'hero')}</div>
${stage('game', rgb(g.color))}
<div class="hud" aria-hidden="true"><span class="tl">CASE FILE · ${esc(g.title.toUpperCase())}</span><span class="tr"><i class="dot"></i>REC <time class="tc">00:00:00:00</time></span></div>
<div class="ghero-body wrap"><a class="back" href="${p}games.html">← All games</a>${status(g)}<h1 class="glitch" data-text="${esc(g.title)}">${esc(g.title)}</h1><p class="tagline">${esc(g.tagline)}</p><div class="row">${btns}</div></div>
</section>
<div class="wrap">
<dl class="gfacts rv">${g.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<section class="about"><div class="rv"><h2>The story</h2><p class="lede">${esc(g.lede)}</p><p>${esc(g.body)}</p><ul class="tags">${g.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div class="rv" style="--d:.12s"><h2>What is inside</h2><ul class="inside">${g.inside.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></section>
${g.poster ? `<div class="poster-wrap rv"><img class="story-poster" src="${p}images/${g.poster}" alt="${esc(g.title)} key art" loading="lazy"></div>` : ''}
<section class="play rv">${art(g, p)}<div class="play-body"><h2>Where to play</h2><p>${g.links.length ? 'Screenshots, the trailer and reviews are on the store pages.' : 'Store pages will appear here when they go live.'}</p><div class="row">${btns}</div></div></section>
<nav class="pager" aria-label="More games"><a href="${p}games/${prev.id}.html" style="--c:${prev.color}"><small>← Previous case</small><strong>${esc(prev.title)}</strong></a><a class="next" href="${p}games/${next.id}.html" style="--c:${next.color}"><small>Next case →</small><strong>${esc(next.title)}</strong></a></nav>
</div></main>`,
  });
});

/* ---------- 404 ---------- */
page({
  file: '404.html', title: 'Page not found | AJB Games Studio', desc: 'This page could not be found.', body: p => `<main id="main"><section class="stage nf" data-stage="nf" data-eye="255,226,170">
${stage('nf', '90,170,255')}
<div class="hud" aria-hidden="true"><span class="tl">NO SIGNAL</span><span class="tr"><i class="dot"></i>REC <time class="tc">00:00:00:00</time></span></div>
<div class="hero-body wrap"><h1 class="title glitch" data-text="404">404</h1><p class="lead">The lights went out and this page is gone.</p><div class="row"><a class="btn lamp" href="${p}index.html">Back to the studio</a><a class="btn" href="${p}games.html">Browse games</a></div></div></section></main>`,
});

/* ---------- shared files ---------- */
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(HERE, 'src/style.css'), path.join(OUT, 'assets/style.css'));
fs.copyFileSync(path.join(HERE, 'src/site.js'), path.join(OUT, 'assets/site.js'));
fs.copyFileSync(path.join(HERE, 'src/favicon.svg'), path.join(OUT, 'favicon.svg'));
fs.mkdirSync(path.join(OUT, 'images'), { recursive: true });
const rd = path.join(HERE, 'src/images-README.txt');
if (fs.existsSync(rd)) fs.copyFileSync(rd, path.join(OUT, 'images/README.txt'));
// Copy any images from src/images/ to output
const imgSrc = path.join(HERE, 'src/images');
if (fs.existsSync(imgSrc)) {
  fs.readdirSync(imgSrc).forEach(f => {
    if (!f.endsWith('.txt')) fs.copyFileSync(path.join(imgSrc, f), path.join(OUT, 'images', f));
  });
}
console.log('built', OUT);
