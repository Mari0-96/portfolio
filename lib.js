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
