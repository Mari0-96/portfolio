// Sanity-checks content/projects.json so a bad CMS edit is caught on GitHub before (or right after) it deploys.
// Run locally with:  node .github/scripts/validate.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const errors = [];
const warn = [];

let data;
try {
  data = JSON.parse(readFileSync(join(root, 'content', 'projects.json'), 'utf8'));
} catch (e) {
  console.error('::error file=content/projects.json::Invalid JSON — ' + e.message);
  process.exit(1);
}

if (!Array.isArray(data.projects)) {
  console.error('::error file=content/projects.json::Expected a top-level "projects" array');
  process.exit(1);
}

const imageExists = (p) => existsSync(join(root, String(p).replace(/^\/+/, '')));
const checkImage = (where, p) => {
  if (!p) return;
  if (/^https?:\/\//.test(p)) return; // external images are allowed
  if (!imageExists(p)) errors.push(`${where}: image not found → ${p}`);
};

const slugs = new Set();
data.projects.forEach((p, i) => {
  const name = `projects[${i}] "${p.title || '(no title)'}"`;
  ['title', 'slug', 'category', 'year', 'card_image'].forEach((k) => {
    if (!p[k]) errors.push(`${name}: missing "${k}"`);
  });
  if (p.slug) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) errors.push(`${name}: slug "${p.slug}" must be lowercase letters, numbers and hyphens`);
    if (slugs.has(p.slug)) errors.push(`${name}: duplicate slug "${p.slug}"`);
    slugs.add(p.slug);
  }
  if (p.card_size && !['small', 'big'].includes(p.card_size)) errors.push(`${name}: card_size must be "small" or "big"`);
  checkImage(`${name} card_image`, p.card_image);

  const c = p.case_study;
  if (c && Object.keys(c).length) {
    if (!c.headline) warn.push(`${name}: has case-study content but no headline, so the card will not link to a page`);
    checkImage(`${name} hero_image`, c.hero_image);
    ((c.tldr || {}).images || []).forEach((img) => checkImage(`${name} tldr image`, img));
    (c.sections || []).forEach((s, si) =>
      (s.items || []).forEach((it, ii) => checkImage(`${name} sections[${si}].items[${ii}] image`, it.image))
    );
  }
});

warn.forEach((w) => console.log('::warning file=content/projects.json::' + w));
if (errors.length) {
  errors.forEach((e) => console.error('::error file=content/projects.json::' + e));
  process.exit(1);
}
console.log(`OK — ${data.projects.length} projects, ${data.projects.filter((p) => p.case_study && p.case_study.headline).length} with case studies.`);
