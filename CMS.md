# Adding projects with the CMS

The site has a built-in CMS at **`/admin`** (powered by [Sveltia CMS](https://github.com/sveltia/sveltia-cms)).
You fill in a form → it commits to your GitHub repo → Vercel redeploys → the project is live in ~30 seconds.
No server, no database, no monthly fee.

## How it works

| File | What it does |
|---|---|
| `content/projects.json` | **All project data.** Every card on the homepage and every case study comes from here. The CMS edits this file. |
| `admin/index.html` + `admin/config.yml` | The CMS itself (the form fields are defined in `config.yml`). |
| `project.html` + `project.js` + `project.css` | The case-study page template (layout based on the Burq case study). One template renders every project: `project.html?slug=burq`. |
| `assets/uploads/` | Images you upload in the CMS land here. |

A project with **no case study** shows as a non-clickable card. Fill in the **Case study page → Headline** and the card automatically becomes a link to its own page.

## One-time setup

### 1. Point the CMS at your repo
Open `admin/config.yml` and change this line to your GitHub username and repo name:

```yaml
repo: YOUR-USERNAME/portfolio
```

Commit and push (see [DEPLOY.md](DEPLOY.md)).

### 2. Create a GitHub token (this is your CMS password)
1. GitHub → your profile picture → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `portfolio-cms`. **Expiration:** pick a date (e.g. 1 year).
3. **Repository access:** *Only select repositories* → choose your portfolio repo.
4. **Permissions → Repository permissions:** set **Contents** to **Read and write** (Metadata read-only is added automatically).
5. **Generate token** and copy it. You can't view it again — save it in a password manager.

### 3. Log in
1. Go to `https://YOUR-SITE.vercel.app/admin`.
2. Choose **Sign in with token** (GitHub), paste the token, done. The browser remembers it.

> Only people who have a token for your repo can change anything. The `/admin` page itself is public but useless without one.

## Add a new project

1. In `/admin` open **Portfolio → Projects & case studies**.
2. Click **Add Project** and fill in:
   - **Title, URL slug, Category, Year, Card image, Card size** — these make the homepage card.
   - **Published** — untick to hide it without deleting.
3. *(Optional)* open **Case study page** to build the full page — in this order on the page:
   1. Eyebrow, **Headline**, Intro, **Hero image**, Live preview URL
   2. Client / My role / Categories (the 3-column info row)
   3. **TL;DR** (title, text, two side-by-side images)
   4. **The Impact** (intro + big-number stats)
   5. **Sections** — add one per chapter (Problem, Research, Ideation, Designs, Lessons…). Each section has a title, intro, and any number of **Content blocks** (heading + text + image + caption, in any combination). Every section also appears in the floating menu at the bottom of the page.
   6. Testimonial quote
4. Click **Save**. The CMS commits to GitHub and Vercel redeploys.

### Ordering
The order of the list = the order on the homepage. Cards fill the three columns left → right (1st card column 1, 2nd column 2, 3rd column 3, 4th column 1 …). Drag items in the list to reorder.

### Tips
- **Compress images before uploading** (squoosh.app → WebP, ≤ 500 KB). Large PNGs make the page slow.
- Card images look best at **720 × 720** (small) or **720 × 820** (big) pixels.
- Text fields support **bold**, *italic*, links and bullet lists.

## Editing without the CMS
You can also edit `content/projects.json` directly on github.com (pencil icon → commit). The format is the same one the CMS writes.

## Troubleshooting
- **Login fails / "repository not found":** check `repo:` in `admin/config.yml` and that the token has access to that repo with *Contents: Read and write*.
- **Saved but nothing changed:** wait for the Vercel deploy to finish (Vercel dashboard → Deployments), then hard-refresh (`Ctrl + Shift + R`).
- **Card isn't clickable:** that project has no case-study **Headline** yet.
- **"This case study isn't available yet":** the slug in the URL doesn't match a project that has a case study.
- **CMS script version:** `admin/index.html` loads the latest Sveltia CMS from unpkg. To lock a version, change the URL to `@sveltia/cms@x.y.z`.
