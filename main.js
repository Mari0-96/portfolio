(async () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- build the project grid from content/projects.json (edited via /admin) ---------- */
  try {
    const projects = await Site.load();
    const grid = $('#grid');
    const cols = [0, 1, 2].map(() => { const c = document.createElement('div'); c.className = 'col'; grid.append(c); return c; });
    projects.forEach((p, i) => {
      const { esc } = Site, open = Site.hasCaseStudy(p);
      const el = document.createElement(open ? 'a' : 'div');
      el.className = 'project' + (p.card_size === 'big' ? ' big' : '');
      if (open) el.href = Site.caseUrl(p);
      el.innerHTML = `<div class="thumb"><img src="${esc(p.card_image)}" alt="${esc(p.title)}" loading="lazy"></div>` +
        `<h3>${esc(p.title)}</h3><p>${esc(p.category)}, ${esc(p.year)}</p>`;
      cols[i % 3].append(el); // fills the 3 columns in order: 1,2,3,1,2,3…
    });
  } catch (e) { console.error('Could not load projects', e); }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover)').matches;

  /* ---------- smooth (inertial) scroll ---------- */
  let target = scrollY, current = scrollY, smooth = !reduce && fine;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  if (smooth) {
    addEventListener('wheel', e => {
      e.preventDefault();
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
    }, { passive: false });
    addEventListener('keydown', e => {
      const k = { ArrowDown: 80, ArrowUp: -80, PageDown: innerHeight * .9, PageUp: -innerHeight * .9, ' ': innerHeight * .9 }[e.key];
      if (k) { e.preventDefault(); target = Math.max(0, Math.min(maxScroll(), target + k)); }
    });
    addEventListener('scroll', () => { if (Math.abs(scrollY - current) > 2) { target = current = scrollY; } });
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = $(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + scrollY - 60;
    if (smooth) target = Math.min(y, maxScroll()); else scrollTo({ top: y, behavior: 'smooth' });
  }));

  /* ---------- word split for scroll reveal ---------- */
  $$('.words').forEach(root => {
    const walk = n => {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) frag.append(t);
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); }
          });
          c.replaceWith(frag);
        } else walk(c);
      });
    };
    walk(root);
  });
  const words = $$('.w');

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));
  $$('.col').forEach(col => $$('.project', col).forEach((p, i) => { p.style.transitionDelay = (i * 0.08) + 's'; io.observe(p); }));
  setTimeout(() => $('.sub').classList.add('in'), 100);

  /* ---------- nav hide/show + progress ---------- */
  const nav = $('#nav'), bar = $('.progress');
  let lastY = 0;

  /* ---------- mouse parallax on blobs ---------- */
  const cols = $$('.col');
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('mousemove', e => {
    mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5;
    cursor.style.opacity = 1; cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  });
  const cursor = $('#cursor');
  $$('a, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
  const blobs = $$('.blobs .blob');

  /* ---------- dark-background detection for nav text ---------- */
  const thumbs = $$('.thumb');
  const darkThumbs = new Set();
  thumbs.forEach(t => {
    const img = $('img', t);
    const measure = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 24;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0, 24, 24);
        const d = x.getImageData(0, 0, 24, 24).data; let s = 0;
        for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
        if (s / (d.length / 4) < 0.5) darkThumbs.add(t);
      } catch (e) { darkThumbs.add(t); }
    };
    img.complete ? measure() : img.addEventListener('load', measure);
  });
  const navItems = $$('.nav .links a, .nav .clock, .nav .contact small, .nav .contact a');
  const updateNav = () => {
    const rects = [...darkThumbs].map(t => t.getBoundingClientRect()).filter(r => r.bottom > 0 && r.top < 80);
    navItems.forEach(el => {
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      el.classList.toggle('inv', rects.some(b => cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom));
    });
  };

  /* ---------- clock ---------- */
  const clock = $('#clock');
  const tick = () => clock.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Dubai' }).format(new Date());
  tick(); setInterval(tick, 15000);

  /* ---------- main loop ---------- */
  function frame() {
    if (smooth) { current += (target - current) * .085; if (Math.abs(target - current) < .1) current = target; scrollTo(0, current); }
    const y = smooth ? current : scrollY;

    bar.style.transform = `scaleX(${maxScroll() > 0 ? y / maxScroll() : 0})`;
    nav.classList.toggle('hide', y > lastY && y > 200);
    lastY = y;

    updateNav();

    // mouse parallax on blobs
    mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
    blobs.forEach(b => {
      const d = +b.dataset.depth || 20;
      b.style.transform = `translate3d(${mouse.x * d * 2}px,${mouse.y * d * 2 - y * .08}px,0)`;
    });

    // word-by-word reveal tied to scroll position
    const lo = innerHeight * .88, hi = innerHeight * .45;
    words.forEach(w => {
      const t = w.getBoundingClientRect().top;
      w.classList.toggle('on', t < lo - (lo - hi) * 0 && t < innerHeight * .8);
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
