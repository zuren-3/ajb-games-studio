/* AJB Games Studio: found-footage engine. No dependencies. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const now = () => performance.now();

  /* ---------- light / dark mode ---------- */
  const tgl = $('#themeToggle'), rootEl = document.documentElement, themeMeta = $('meta[name="theme-color"]');
  function setTheme(t) {
    rootEl.dataset.theme = t;
    try { localStorage.setItem('ajb-theme', t); } catch (e) {}
    if (themeMeta) themeMeta.setAttribute('content', t === 'light' ? '#f4f1ec' : '#04060a');
    if (tgl) tgl.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
  if (tgl) tgl.addEventListener('click', () => setTheme(rootEl.dataset.theme === 'light' ? 'dark' : 'light'));
  setTheme(rootEl.dataset.theme || 'dark');

  /* ---------- mobile pop-out menu ---------- */
  const menuBtn = $('#menuBtn'), menuPanel = $('#menuPanel');
  if (menuBtn && menuPanel) {
    const setMenu = open => {
      menuPanel.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(!menuPanel.classList.contains('open')); });
    document.addEventListener('click', e => { if (!e.target.closest('.site-header')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); } });
    menuPanel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 760) setMenu(false); });
  }


  /* ---------- nav: mark the current page / section ---------- */
  (function () {
    const links = $$('.nav a:not(.btn), .menu a:not([href*="steampowered"])');
    if (!links.length) return;
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const inGames = page === 'games.html' || /\/games\//.test(location.pathname);
    const follow = document.getElementById('follow');
    const hrefOf = a => (a.getAttribute('href') || '');
    const mark = key => links.forEach(a => {
      const h = hrefOf(a);
      const k = h.endsWith('#follow') ? 'follow' : h.endsWith('studio.html') ? 'studio' : h.endsWith('games.html') ? 'games' : '';
      if (k && k === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (inGames) return mark('games');
    if (page !== 'studio.html') return mark('');
    const update = () => {
      let key = 'studio';
      if (location.hash === '#follow') key = 'follow';
      if (follow) {
        const r = follow.getBoundingClientRect();
        if (r.top < innerHeight * 0.55) key = 'follow';
        else if (location.hash === '#follow' && r.top > innerHeight) key = 'studio';
      }
      mark(key);
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('hashchange', update);
    links.forEach(a => a.addEventListener('click', () => { if (hrefOf(a).endsWith('#follow')) mark('follow'); }));
    update();
  })();

  /* ---------- pictures: local file, then Steam mirrors, then the drawn scene ---------- */
  $$('img[data-fb]').forEach(img => {
    const fb = img.dataset.fb.split(' ').filter(Boolean);
    const next = () => { const n = fb.shift(); if (n) img.src = n; else img.remove(); };
    img.addEventListener('error', next);
    if (img.complete) { if (img.naturalWidth) img.classList.add('ok'); else next(); }
  });

  /* ---------- scroll: progress bar, parallax, timeline line ---------- */
  const bar = $('#progress'), layers = $$('[data-parallax]'), tl = $('#tl');
  let ticking = false;
  const header = $('.site-header');
  function onScroll() {
    ticking = false;
    if (header) header.classList.toggle('is-scrolled', scrollY > 48);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
    if (!reduce) layers.forEach(l => { if (scrollY < innerHeight * 1.4) l.style.transform = `translate3d(0,${scrollY * .28}px,0)`; });
    if (tl) { const r = tl.getBoundingClientRect(); tl.style.setProperty('--p', clamp((innerHeight * .75 - r.top) / r.height, 0, 1).toFixed(3)); }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- pointer glow over the whole page ---------- */
  const glow = $('.cursor-light');
  if (glow && !coarse) {
    addEventListener('pointermove', e => {
      glow.style.setProperty('--mx', e.clientX + 'px'); glow.style.setProperty('--my', e.clientY + 'px'); glow.classList.add('on');
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
  }

  /* ---------- focus-pull reveals, text decode, number counters ---------- */
  const GL = '▓▒░█<>/|#%&01';
  function scramble(el) {
    if (reduce || el._s) return; el._s = 1;
    const txt = el.textContent, n = txt.length, t0 = now(), D = 650 + n * 16;
    el.setAttribute('aria-label', txt); el.style.minHeight = el.offsetHeight + 'px';
    (function step(t) {
      const k = clamp((t - t0) / D, 0, 1); let out = '';
      for (let i = 0; i < n; i++) { const c = txt[i]; out += (c === ' ' || i < k * n * 1.12) ? c : GL[Math.random() * GL.length | 0]; }
      el.textContent = out;
      if (k < 1) requestAnimationFrame(step); else { el.textContent = txt; el.style.minHeight = ''; }
    })(t0);
  }
  function count(el) {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || '';
    if (reduce || isNaN(to)) return; const t0 = now(), D = 1500;
    (function step(t) {
      const k = clamp((t - t0) / D, 0, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (k < 1 ? '' : suf);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const t = e.target;
    if (t.classList.contains('rv')) t.classList.add('in');
    if (t.hasAttribute('data-scramble')) scramble(t);
    if (t.matches('[data-to]')) count(t);
  }), { threshold: .3 });
  $$('.rv,[data-scramble],[data-to]').forEach(el => io.observe(el));
  $$('.stat').forEach(el => el.classList.add('rv') || io.observe(el));
  setTimeout(() => $$('.rv').forEach(el => el.classList.add('in')), 4500); // never leave anything hidden

  /* ---------- game filters and card light ---------- */
  const filters = $('#filters');
  if (filters) filters.addEventListener('click', e => {
    const b = e.target.closest('button[data-f]'); if (!b) return;
    $$('button', filters).forEach(x => x.setAttribute('aria-pressed', x === b));
    $$('#grid .card').forEach((c, i) => {
      const show = b.dataset.f === 'all' || c.dataset.status === b.dataset.f;
      c.classList.toggle('gone', !show);
      if (show && !reduce) c.animate([{ opacity: 0, transform: 'scale(.96)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'none' }], { duration: 450, delay: i * 35, fill: 'backwards', easing: 'ease-out' });
    });
  });
  if (!coarse && !reduce) $$('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      c.style.setProperty('--sx', x * 100 + '%'); c.style.setProperty('--sy', y * 100 + '%');
      c.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-4px)`;
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });

  /* ---------- page transition: the tape cuts to black, then the next page fades in ---------- */
  const curtain = $('.curtain');
  addEventListener('pageshow', () => curtain && curtain.classList.remove('out'));
  if (curtain) setTimeout(() => { curtain.style.animation = 'none'; }, 1200); // the fade-in can never leave the page black
  document.addEventListener('click', e => {
    if (reduce || !curtain || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.protocol !== location.protocol || u.host !== location.host || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault(); curtain.classList.add('out');
    document.querySelectorAll('.glitch').forEach(g => g.classList.add('zap'));
    setTimeout(() => { location.href = u.href; }, 290);
    setTimeout(() => curtain.classList.remove('out'), 2500); // safety: never stay black
  });

  /* ---------- broken-bulb: one letter at a time flickers on the AJB title ---------- */
  const titleEl = $('.flicker-bulb');
  if (titleEl && !reduce) {
    // wrap each letter in a span so we can target it individually
    const letters = titleEl.textContent.trim().split('');
    titleEl.innerHTML = letters.map(ch => `<span class="bl">${ch}</span>`).join('');
    function bulbFlicker() {
      const spans = $$('.bl', titleEl);
      if (!spans.length) return;
      const sp = spans[Math.random() * spans.length | 0];
      // a dying bulb: rapid stutters between dark and half-lit
      const seq = [];
      const n = 3 + (Math.random() * 4 | 0);
      for (let i = 0; i < n; i++) { seq.push({ op: Math.random() < .55 ? .05 : .5, d: 25 + Math.random() * 75 }); }
      // ...then it catches: a bright, glowing pop
      seq.push({ op: 1, glow: 1, d: 70 + Math.random() * 90 });
      // sometimes it dies again right after
      if (Math.random() < .35) seq.push({ op: .05, d: 40 + Math.random() * 50 });
      let delay = 0;
      seq.forEach(({ op, d, glow }) => {
        setTimeout(() => {
          sp.style.opacity = op;
          sp.style.textShadow = glow ? '0 0 24px rgba(255,72,48,.95),0 0 80px rgba(255,40,25,.6)' : '';
        }, delay);
        delay += d;
      });
      setTimeout(() => { sp.style.opacity = ''; sp.style.textShadow = ''; }, delay);
      // schedule next flicker — random gap between 1.5s and 5.3s
      setTimeout(bulbFlicker, 1500 + Math.random() * 3800);
    }
    setTimeout(bulbFlicker, 900 + Math.random() * 1800);
  }

  /* ---------- mobile tape archive: native swipe deck (runs regardless of animation settings) ---------- */
  const deck = $('#tapeDeck');
  if (deck) {
    const tapes = $$('.tape', deck), tag = $('#tapeTag'), num = $('#tapeNum'), cue = $('.scroll-cue');
    let ticking = false, activeTape = -1;
    const upd = () => {
      ticking = false;
      const mid = deck.clientWidth / 2;
      let best = 0, bd = 1e9;
      tapes.forEach((t, i) => { const r = t.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      if (best === activeTape) return; // touch the DOM only when the centered tape changes
      activeTape = best;
      tapes.forEach((t, i) => t.classList.toggle('on', i === best));
      if (tag) tag.textContent = tapes[best].dataset.tag || '';
      if (num) num.textContent = String(best + 1).padStart(2, '0');
    };
    deck.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    const mq = matchMedia('(max-width:760px)');
    const setTarget = () => { if (cue) cue.setAttribute('href', mq.matches ? '#tapeArch' : '#corridor'); };
    mq.addEventListener('change', setTarget); setTarget();
    upd();
  }

  if (reduce) { $$('.corridor').forEach(c => c.classList.remove('live')); return; }

  /* ---------- WebGL fog lit by a torch ---------- */
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;
uniform vec2 uR;uniform float uT;uniform vec2 uM;uniform vec3 uTint;uniform float uF;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  float asp=uR.x/uR.y;vec2 sc=asp>1.?vec2(asp,1.):vec2(1.,1./asp);
  vec2 P=gl_FragCoord.xy/uR*sc;float t=uT*.07;vec2 p=P*2.4;
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  float f=fbm(p+2.2*q+vec2(t*.6,0.));
  float d=distance(P,uM*sc);
  float beam=smoothstep(.62,.0,d);
  float dens=smoothstep(.25,.85,f);
  float a=dens*(.18+beam*.85)+beam*beam*.12*(1.+uF*3.);
  vec3 col=mix(uTint*.55,vec3(.78,.92,1.),clamp(beam*1.2,0.,1.));
  gl_FragColor=vec4(col*a,a);
}`;
  function makeGL(cv) {
    let gl; try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' }); } catch (e) { return null; }
    if (!gl) return null;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS); if (!v || !f) return null;
    const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uR', 'uT', 'uM', 'uTint', 'uF'].forEach(k => U[k] = gl.getUniformLocation(pr, k));
    return { gl, U };
  }

  /* ---------- stages: torch, fog, creeping eyes, HUD ---------- */
  const stages = [];
  const tc = f => { const s = f / 24 | 0; return [s / 3600 | 0, s / 60 % 60 | 0, s % 60, f % 24].map(x => String(x).padStart(2, '0')).join(':'); };
  const t0 = now();

  function initStage(el) {
    const S = { el, x: .62, y: .4, tx: .62, ty: .4, last: now(), vis: false, w: 1, h: 1, eyes: [], caught: 0, nextEye: now() + 1400, tr: 260, flashAt: 0, F: 0, title: $('.title', el), mode: el.dataset.stage };
    const eyeRGB = (el.dataset.eye || '255,226,170');
    S.cv = $('canvas.gl', el); S.ec = $('canvas.eyes', el); S.flash = $('.flash', el);
    S.tcs = $$('.tc', el); S.entEl = $('[data-ent]', el); S.cauEl = $('[data-caught]', el);
    S.tint = (S.cv && S.cv.dataset.tint || '90,170,255').split(',').map(x => x / 255);
    S.g = S.cv ? makeGL(S.cv) : null; if (S.cv && !S.g) S.cv.hidden = true;
    S.ctx = S.ec ? S.ec.getContext('2d') : null;
    S.maxEyes = coarse ? 3 : 5;

    function size() {
      const r = el.getBoundingClientRect(); S.w = Math.max(1, r.width); S.h = Math.max(1, r.height);
      if (S.cv && S.g) { const k = Math.min(.4, 700 / S.w) * (S.q || 1); S.cv.width = Math.max(2, S.w * k | 0); S.cv.height = Math.max(2, S.h * k | 0); S.g.gl.viewport(0, 0, S.cv.width, S.cv.height); }
      if (S.ec) { const d = Math.min(devicePixelRatio || 1, 1); S.ec.width = S.w * d | 0; S.ec.height = S.h * d | 0; S.d = d; }
      if (S.title) { const tr = S.title.getBoundingClientRect(); S.tox = tr.left - r.left; S.toy = tr.top - r.top; }
      S.sc = clamp(S.h / 800, .7, 1.25);
    }
    S.size = size; size(); new ResizeObserver(size).observe(el); addEventListener('load', size);

    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(); S.tx = (e.clientX - r.left) / r.width; S.ty = (e.clientY - r.top) / r.height; S.last = now();
    }, { passive: true });
    el.addEventListener('pointerdown', e => {
      if (e.target.closest('a,button')) return;
      const r = el.getBoundingClientRect(); S.tx = (e.clientX - r.left) / r.width; S.ty = (e.clientY - r.top) / r.height; S.last = now();
      photo(S);
    });
    new IntersectionObserver(es => { S.vis = es[0].isIntersecting; if (S.vis) loop(); }, { rootMargin: '80px' }).observe(el);
    stages.push(S);
  }

  function photo(S) { // one soft, rate-limited camera flash
    const t = now(); if (t - S.flashAt < 1600) return; S.flashAt = t; S.F = 1;
    if (S.flash) { S.flash.classList.remove('pop'); void S.flash.offsetWidth; S.flash.classList.add('pop'); }
    S.trBoost = t;
    const R = 430 * S.sc;
    S.eyes.forEach(e => { if (!e.hid && Math.hypot(e.x - S.x * S.w, e.y - S.y * S.h) < R) { e.hid = t; S.caught++; } });
    if (S.title) { S.title.classList.add('zap'); setTimeout(() => S.title.classList.remove('zap'), 260); }
  }

  function drawEyes(S, t) {
    const c = S.ctx; if (!c) return; const d = S.d; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, S.ec.width, S.ec.height); c.scale(d, d);
    c.globalCompositeOperation = 'lighter';
    const rgb = (S.el.dataset.eye || '255,226,170'), tx = S.x * S.w, ty = S.y * S.h;
    if (t > S.nextEye && S.eyes.length < S.maxEyes) {
      for (let k = 0; k < 8; k++) {
        const x = (.06 + Math.random() * .88) * S.w, y = (.16 + Math.random() * .74) * S.h;
        if (Math.hypot(x - tx, y - ty) > 260 * S.sc) { S.eyes.push({ x, y, s: (.8 + Math.random() * .9) * S.sc, born: t, life: 3600 + Math.random() * 4200, ang: (Math.random() - .5) * .35, bp: Math.random() * 2500 }); break; }
      }
      S.nextEye = t + 1100 + Math.random() * 2400;
    }
    let alive = 0;
    S.eyes = S.eyes.filter(e => {
      const age = t - e.born; let a = clamp(age / 900, 0, 1) * clamp((e.life - age) / 900, 0, 1);
      if (age > e.life) return false;
      let open = 1; const bt = (age + e.bp) % 2600; if (bt < 170) open = Math.abs(bt - 85) / 85 * .92 + .08;
      if (!e.hid && a > .3 && Math.hypot(e.x - tx, e.y - ty) < 150 * S.sc) { e.hid = t; S.caught++; }
      if (e.hid) { const k = (t - e.hid) / 280; if (k >= 1) return false; a *= 1 - k; open *= 1 - k * .9; } else alive++;
      const gap = 17 * e.s, ry = Math.max(.7, 3.8 * e.s * open), rx = 7.5 * e.s;
      const g = c.createRadialGradient(e.x, e.y, 0, e.x, e.y, 46 * e.s); g.addColorStop(0, `rgba(${rgb},${.22 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g; c.fillRect(e.x - 50 * e.s, e.y - 50 * e.s, 100 * e.s, 100 * e.s);
      c.fillStyle = `rgba(${rgb},${.95 * a})`;
      c.beginPath(); c.ellipse(e.x - gap, e.y, rx, ry, e.ang, 0, 7); c.ellipse(e.x + gap, e.y + e.ang * 6, rx, ry, -e.ang, 0, 7); c.fill();
      return true;
    });
    if (S.entEl && S._ent !== alive) { S._ent = alive; S.entEl.textContent = alive; }
    if (S.cauEl && S._cau !== S.caught) { S._cau = S.caught; S.cauEl.textContent = S.caught; }
  }

  function frame(S, t) {
    // torch: follow the pointer, wander when nobody is moving it
    if (t - S.last > 3200) { S.tx = .5 + .34 * Math.sin(t * .00031); S.ty = .42 + .2 * Math.sin(t * .00047 + 1); }
    const dt = Math.min(250, t - (S._t || t)) / 1000; S._t = t; const kk = 1 - Math.exp(-dt * 7);
    S.x += (S.tx - S.x) * kk; S.y += (S.ty - S.y) * kk;
    const boost = S.trBoost ? clamp(1 - (t - S.trBoost) / 700, 0, 1) : 0, rad = 260 + boost * 300;
    const px = S.x * S.w, py = S.y * S.h, st = S.el.style;
    // skip the style writes when the torch has not moved (cheap frames cost nothing)
    if (Math.abs(px - (S._px || 0)) > .4 || Math.abs(py - (S._py || 0)) > .4 || Math.abs(rad - (S._rad || 0)) > 2) {
      S._px = px; S._py = py; S._rad = rad;
      st.setProperty('--tx', px.toFixed(1) + 'px'); st.setProperty('--ty', py.toFixed(1) + 'px'); st.setProperty('--tr', (rad * S.sc).toFixed(0) + 'px');
      if (S.title) { S.title.style.setProperty('--lx', (px - S.tox).toFixed(1) + 'px'); S.title.style.setProperty('--ly', (py - S.toy).toFixed(1) + 'px'); }
    }
    S.F *= Math.exp(-dt * 4);
    // weak device? lower the fog resolution, then switch it off
    S._slow = dt > .06 ? (S._slow || 0) + 1 : Math.max(0, (S._slow || 0) - 1);
    if (S._slow > 24 && S.g) { S._slow = 0; S.q = (S.q || 1) * .6; if (S.q < .3) { S.g = null; S.cv.hidden = true; } else S.size(); }
    if (S.g) {
      const { gl, U } = S.g; gl.uniform2f(U.uR, S.cv.width, S.cv.height); gl.uniform1f(U.uT, (t - t0) / 1000);
      gl.uniform2f(U.uM, S.x, 1 - S.y); gl.uniform3f(U.uTint, S.tint[0], S.tint[1], S.tint[2]); gl.uniform1f(U.uF, S.F);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    drawEyes(S, t);
    if (S.tcs.length) { const f = ((t - t0) / 1000 * 24) | 0; if (S._f !== f) { S._f = f; const s = tc(f); S.tcs.forEach(x => x.textContent = s); } }
  }

  let running = false;
  function loop() {
    if (running) return; running = true;
    (function go(t) {
      if (document.hidden || !(stages.some(s => s.vis) || corActive)) { running = false; return; }
      stages.forEach(S => { if (S.vis) frame(S, t); });
      cor.tick && cor.tick();
      requestAnimationFrame(go);
    })(now());
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loop(); });

  /* ---------- the corridor: scroll walks the camera forward through 3D space ----------
     Performance: scroll geometry is cached at layout time (no layout reads while
     scrolling), DOM writes are skipped unless a value actually moved, and the
     corridor runs no canvases of its own — the fog and eyes stay on the hero. */
  const cor = {};
  let corActive = false;
  (function corridor() {
    const root = $('#corridor'); if (!root) return;
    const track = $('#corTrack'), pin = $('#corPin'), scene = $('#corScene'), frames = $$('.frame', scene), n = frames.length;
    root.classList.add('live');
    const info = $('#corInfo'), num = $('#corNum'), nm = $('#corName'), tag = $('#corTag'), go = $('#corGo'), rail = $('#corRail'), when = $('#corWhen');
    let Z = 720, W = 1, H = 1, cam = 0, camT = 0, rx = 0, ry = 0, rxT = 0, ryT = 0, active = -1;
    let docTop = 0, span = 1; // cached scroll geometry

    function layout() {
      W = pin.clientWidth; H = pin.clientHeight; Z = W < 760 ? 520 : 720;
      const off = W < 760 ? W * .06 : W * .19, L = (n + 1) * Z + 400, zc = -((n + 1) * Z) / 2 + 200;
      frames.forEach((f, i) => { f.style.transform = `translate(-50%,-50%) translate3d(${(i % 2 ? 1 : -1) * off}px,${(i % 3 - 1) * H * .035}px,${-i * Z}px)`; f._side = i % 2 ? 'left' : 'right'; });
      // cache the scroll geometry once — progress is pure math afterwards
      const r = track.getBoundingClientRect();
      docTop = r.top + scrollY;
      span = Math.max(1, track.offsetHeight - H);
      measure();
    }
    function measure() { camT = clamp((scrollY - docTop) / span, 0, 1) * (n - 1) * Z; }
    function render() {
      scene.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(${cam.toFixed(1)}px)`;
      let a = 0;
      frames.forEach((f, i) => {
        const dz = i * Z - cam;
        // cards stay opaque across the walking band: 3D depth sorting occludes them
        // properly, distance is conveyed by the darkening overlay, and passed
        // frames fade out quickly so nothing shows through the active card
        let op;
        if (dz < 0) op = clamp(1 + dz / (Z * .15), 0, 1);
        else if (dz < Z * 2.2) op = 1;
        else op = clamp(1 - (dz - Z * 2.2) / (Z * .5), 0, 1);
        const dim = dz >= 0 ? clamp(dz / (Z * 1.5), 0, .72) : 0;
        if (Math.abs((f._op ?? -1) - op) > .004 || Math.abs((f._dim ?? -1) - dim) > .004) { // write only when a frame visibly moved
          f._op = op; f._dim = dim;
          f.style.opacity = op.toFixed(3);
          f.style.setProperty('--dim', dim.toFixed(2));
          f.style.pointerEvents = op > .6 ? 'auto' : 'none';
          const vis = op >= .02;
          if (f._vis !== vis) { f._vis = vis; f.style.visibility = vis ? 'visible' : 'hidden'; }
        }
        if (Math.abs(dz) < Math.abs(a * Z - cam)) a = i;
      });
      if (a !== active) {
        active = a; const f = frames[a]; pin.style.setProperty('--c', getComputedStyle(f).getPropertyValue('--c'));
        info.dataset.side = f._side; num.textContent = String(a + 1).padStart(2, '0'); nm.textContent = f.dataset.title; tag.textContent = f.dataset.tag; go.href = f.getAttribute('href'); if (when) when.textContent = f.dataset.when || '';
        info.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'ease-out' });
      }
      const rp = (cam / ((n - 1) * Z)).toFixed(3);
      if (rail._p !== rp) { rail._p = rp; rail.style.setProperty('--p', rp); }
    }
    cor.tick = () => {
      if (!pin._v) return;
      const t = now(), dt = Math.min(250, t - (cor._t || t)) / 1000; cor._t = t;
      measure();
      const k = 1 - Math.exp(-dt * 6), k2 = 1 - Math.exp(-dt * 3);
      cam += (camT - cam) * k; rx += (rxT - rx) * k2; ry += (ryT - ry) * k2;
      // skip the DOM work entirely when nothing has moved
      if (Math.abs(cam - (cor._c || 0)) < .4 && Math.abs(rx - (cor._rx || 0)) < .04 && Math.abs(ry - (cor._ry || 0)) < .04) return;
      cor._c = cam; cor._rx = rx; cor._ry = ry;
      render();
    };
    pin.addEventListener('pointermove', e => { const r = pin.getBoundingClientRect(); ryT = ((e.clientX - r.left) / r.width - .5) * 7; rxT = -((e.clientY - r.top) / r.height - .5) * 4; }, { passive: true });
    new IntersectionObserver(es => { pin._v = corActive = es[0].isIntersecting; if (pin._v) { measure(); loop(); } }, { rootMargin: '200px' }).observe(track);
    addEventListener('resize', layout); layout(); cam = camT; render();
  })();

  $$('[data-stage]').forEach(initStage);

})();
