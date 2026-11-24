/* Case-study page: renders one project from content/projects.json (?slug=burq). */
(async () => {
  const { esc, md } = Site;
  const root = document.getElementById('case');
  const num = n => String(n).padStart(2, '0');
  const img = (src, alt = '') => src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : '';
  const slugify = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------- load + pick project ---------- */
  let projects = [];
  try { projects = await Site.load(); } catch (e) { console.error(e); }
  const slug = new URLSearchParams(location.search).get('slug');
  const withCase = projects.filter(Site.hasCaseStudy);
  const p = withCase.find(x => x.slug === slug);

  if (!p) {
    root.innerHTML = `<section class="cs-wrap cs-missing"><p class="label"><span>/</span><span>404.</span> Case study</p>
      <h1>This case study isn’t available yet.</h1>
      <p class="lead">It may have moved, or it’s still being written.</p>
      <a class="btn" href="index.html#work">← Back to projects</a></section>`;
    document.title = 'Case study not found — Maria';
    init([]);
    return;
  }
  const c = p.case_study;
  document.title = `${p.title} — Maria`;
  if (p.unlisted) { const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'; document.head.append(m); }
  const meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = c.lead || '';

  /* ---------- build sections ---------- */
  const nav = [];             // [{id,label}] for the floating pill
  let n = 0;
  const label = (text) => `<p class="label"><span>/</span><span>${num(++n)}.</span> ${esc(text)}</p>`;

  const head = `
  <header class="cs-hero">
    <div class="cs-wrap">
      ${c.eyebrow ? `<p class="eyebrow reveal">${esc(c.eyebrow)}</p>` : ''}
      <h1 class="reveal">${esc(c.headline)}</h1>
      ${c.lead ? `<p class="lead reveal">${esc(c.lead)}</p>` : ''}
    </div>
    ${c.hero_image ? `<figure class="hero-img reveal">${img(c.hero_image, p.title)}</figure>` : ''}
  </header>`;

  const metaItems = [['Client', c.client], ['My role', c.role], ['Category', c.categories]].filter(m => m[1]);
  const metaRow = (metaItems.length || c.live_url) ? `
  <section class="cs-meta cs-wrap reveal">
    <dl>${metaItems.map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    ${c.live_url ? `<a class="btn outline" href="${esc(c.live_url)}" target="_blank" rel="noopener">Live Preview ↗</a>` : ''}
  </section>` : '';

  let tldr = '';
  if (c.tldr && (c.tldr.title || c.tldr.body)) {
    nav.push({ id: 'tldr', label: 'TL;DR' });
    const imgs = (c.tldr.images || []).filter(Boolean);
    tldr = `
  <section class="cs-sec cs-wrap" id="tldr">
    ${label('TL;DR')}
    ${c.tldr.title ? `<h2 class="reveal">${esc(c.tldr.title)}</h2>` : ''}
    <div class="prose reveal">${md(c.tldr.body)}</div>
    ${imgs.length ? `<div class="pair">${imgs.map(s => `<figure class="reveal">${img(s)}</figure>`).join('')}</div>` : ''}
  </section>`;
  }

  let impact = '';
  const stats = ((c.impact || {}).stats || []).filter(s => s && s.value);
  if (stats.length) {
    impact = `
  <section class="cs-sec cs-wrap impact" id="impact">
    <h3 class="reveal">${esc(c.impact.title || 'The Impact')}</h3>
    ${c.impact.intro ? `<p class="reveal">${esc(c.impact.intro)}</p>` : ''}
    <div class="stats" style="--n:${Math.min(stats.length, 3)}">${stats.map((s, i) => `<div class="stat s${i % 3} reveal"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div>
  </section>`;
  }

  const sections = (c.sections || []).filter(s => s && (s.title || s.label)).map(s => {
    const id = slugify(s.label || s.title);
    nav.push({ id, label: s.label || s.title });
    const items = (s.items || []).map(it => `
      <div class="item reveal">
        ${it.heading ? `<h3>${esc(it.heading)}</h3>` : ''}
        ${it.body ? `<div class="prose">${md(it.body)}</div>` : ''}
        ${it.image ? `<figure>${img(it.image, it.caption || it.heading || '')}${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ''}</figure>` : ''}
      </div>`).join('');
    return `
  <section class="cs-sec cs-wrap" id="${id}">
    ${label(s.label || s.title)}
    ${s.title ? `<h2 class="reveal">${esc(s.title)}</h2>` : ''}
    ${s.intro ? `<div class="prose reveal">${md(s.intro)}</div>` : ''}
    ${items}
  </section>`;
  }).join('');

  const q = c.quote && c.quote.text ? `
  <section class="cs-wrap quote reveal">
    <blockquote>“${esc(c.quote.text)}”</blockquote>
    <p><b>${esc(c.quote.author || '')}</b>${c.quote.role ? `<span>${esc(c.quote.role)}</span>` : ''}</p>
  </section>` : '';

  const listed = withCase.filter(x => !x.unlisted);
  const idx = listed.indexOf(p);
  const next = !listed.length ? null : idx < 0 ? listed[0] : listed.length > 1 ? listed[(idx + 1) % listed.length] : null;
  const cta = `
  <section class="cs-wrap cta reveal">
    <h2>Let’s talk about your project.</h2>
    <p>Got a project in mind? Let’s create something great. We can transform that idea into a real product.</p>
    <div class="cta-row">
      <a class="btn" href="mailto:mariajalal56@gmail.com">Get in Touch</a>
      ${next ? `<a class="btn outline" href="${Site.caseUrl(next)}">Next project: ${esc(next.title)} →</a>` : ''}
    </div>
  </section>`;

  const pill = nav.length ? `
  <nav class="pill" aria-label="Case study sections">
    <a href="index.html#work" class="back">← Projects</a>
    ${nav.map(x => `<a href="#${x.id}" data-sec="${x.id}">${esc(x.label)}</a>`).join('')}
  </nav>` : '';

  const draftNote = p.unlisted ? '<div class=\"draft-note\">Draft preview — this page is hidden from the homepage and search engines.</div>' : '';
  root.innerHTML = draftNote + head + metaRow + tldr + impact + sections + q + cta + pill;
  // low-resolution hero (e.g. a card thumbnail): don't stretch it across the full width
  const heroImg = root.querySelector('.hero-img img');
  if (heroImg) {
    const fit = () => heroImg.parentElement.classList.toggle('compact', heroImg.naturalWidth && heroImg.naturalWidth < 1100);
    heroImg.complete ? fit() : heroImg.addEventListener('load', fit);
  }
  init(nav);

  /* ---------- behaviour ---------- */
  function init(navItems) {
    // clock + progress bar + hide-on-scroll nav
    const clock = document.getElementById('clock');
    const tick = () => clock.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Dubai' }).format(new Date());
    tick(); setInterval(tick, 15000);

    const bar = document.querySelector('.progress'), top = document.getElementById('nav');
    let last = 0;
    const onScroll = () => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      top.classList.toggle('hide', y > last && y > 200); last = y;
      spy();
    };

    // reveal on scroll
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // scroll-spy for the floating pill
    const links = [...document.querySelectorAll('.pill [data-sec]')];
    const secs = links.map(a => document.getElementById(a.dataset.sec));
    function spy() {
      let cur = -1;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
      links.forEach((a, i) => a.classList.toggle('on', i === cur));
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    document.querySelectorAll('.pill a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); scrollTo({ top: t.getBoundingClientRect().top + scrollY - 90, behavior: 'smooth' });
    }));
  }
})();
