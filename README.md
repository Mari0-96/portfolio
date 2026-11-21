# Maria — Portfolio

Static portfolio site (HTML, CSS, vanilla JS) with a Git-based CMS. No build step, no dependencies.

- **Live site:** deployed on Vercel from the `main` branch
- **Design:** Figma "Portfolio 2.0" (homepage) + Burq case-study layout

## Structure

```
index.html            homepage (project grid is built from content/projects.json)
project.html          case-study template  →  project.html?slug=burq
style.css             homepage + shared styles (matches the Figma frame at 1440px)
project.css           case-study page styles
main.js               homepage: smooth scroll, reveals, nav colour switch, cursor, clock
project.js            case-study renderer + floating section menu
lib.js                shared helpers (content loader, markdown)
content/projects.json all project + case-study data (edited by the CMS)
admin/                CMS (Sveltia) — index.html + config.yml
assets/               images and SVGs
vercel.json           Vercel config
.github/              validation workflow + script
```

## Run locally

The pages load `content/projects.json` with `fetch`, so opening `index.html` straight from disk won't work. Serve the folder with any static server, e.g.:

```bash
npx serve .
```

## Add / edit projects

Use the built-in CMS at `/admin` — see [CMS.md](CMS.md).
Or edit `content/projects.json` directly (the GitHub "Validate content" check will tell you if something is wrong).

## Customise

- Social links: the `.social` links in `index.html` and `project.html` (currently `#`).
- Colours and spacing: top of `style.css`.
- Case-study layout: `project.js` (markup) and `project.css` (styles).

## Deploy

Step-by-step GitHub + Vercel guide: [DEPLOY.md](DEPLOY.md).
