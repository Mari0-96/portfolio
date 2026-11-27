/* Shared helpers: load CMS content + tiny markdown renderer. */
window.Site = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const inline = t => t
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  /** Minimal markdown: paragraphs, line breaks, bullet lists, **bold**, *italic*, [links](https://…) */
  const md = src => esc(src).split(/\n{2,}/).filter(b => b.trim()).map(b => {
    const lines = b.split('\n');
    if (lines.every(l => /^\s*[-*] /.test(l)))
      return '<ul>' + lines.map(l => '<li>' + inline(l.replace(/^\s*[-*] /, '')) + '</li>').join('') + '</ul>';
    return '<p>' + inline(lines.join('<br>')) + '</p>';
  }).join('');

  const hasCaseStudy = p => !!(p.case_study && p.case_study.headline);
  const caseUrl = p => 'project.html?slug=' + encodeURIComponent(p.slug);

  const load = () => fetch('content/projects.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error('projects.json ' + r.status); return r.json(); })
    .then(d => (d.projects || []).filter(p => p && p.title && p.published !== false));

  return { esc, md, hasCaseStudy, caseUrl, load };
})();

/* ---------- mobile menu (hamburger + full-screen overlay, phones only) ---------- */
(() => {
  const init = () => {
    const nav = document.getElementById('nav');
    if (!nav || nav.querySelector('.menu-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'menu-btn'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Open menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mobile-menu');
    btn.innerHTML = '<span></span><span></span>';
    nav.append(btn);

    const links = [...nav.querySelectorAll('.links a')];
    const mail = nav.querySelector('.contact a');
    const social = document.querySelector('.footer .social');
    const menu = document.createElement('div');
    menu.className = 'mobile-menu'; menu.id = 'mobile-menu'; menu.setAttribute('aria-hidden', 'true');
    menu.innerHTML =
      '<nav class="mm-links" aria-label="Mobile">' +
        links.map((a, i) => `<a href="${a.getAttribute('href')}" style="--i:${i}">${a.textContent.replace(/,\s*$/, '')}</a>`).join('') +
      '</nav>' +
      '<div class="mm-foot">' +
        '<p class="mm-label">Contact</p>' +
        (mail ? `<a class="mm-mail" href="${mail.getAttribute('href')}">${mail.textContent}</a>` : '') +
        `<div class="mm-social">${social ? social.innerHTML : ''}</div>` +
        '<p class="mm-time"><span class="mm-clock"></span>, Dubai</p>' +
      '</div>';
    document.body.append(menu);

    const set = open => {
      document.documentElement.classList.toggle('menu-open', open);
      nav.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      if (open) {
        const c = document.getElementById('clock'); if (c) menu.querySelector('.mm-clock').textContent = c.textContent;
        const first = menu.querySelector('.mm-links a'); if (first) first.focus({ preventScroll: true });
      }
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); } });
    matchMedia('(min-width:761px)').addEventListener('change', e => { if (e.matches) set(false); });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();