# Deploy to GitHub + Vercel — step by step

End result: your portfolio live on a Vercel URL, updating automatically whenever you push to GitHub, with a CMS at `/admin` for adding projects.

**Time needed:** about 20 minutes.

## What's in the repo

```
index.html, project.html          the two pages (homepage + case-study template)
style.css, project.css            styles
main.js, project.js, lib.js       scripts
content/projects.json             all project + case-study data (the CMS edits this)
admin/                            the CMS (index.html + config.yml)
assets/                           images and SVGs (about 11 MB total)
vercel.json                       Vercel settings (caching, noindex for /admin)
.github/workflows/validate.yml    GitHub check that projects.json is valid on every push
.github/scripts/validate.mjs      the checker script
.gitignore  .gitattributes  .editorconfig   standard repo housekeeping
README.md  CMS.md  DEPLOY.md      docs
```

## Before you start

1. A free [GitHub account](https://github.com/signup).
2. A free [Vercel account](https://vercel.com/signup) — choose **Continue with GitHub**.
3. [Git for Windows](https://git-scm.com/download/win). Check it's installed:

   ```powershell
   git --version
   ```

   *(Prefer no command line? Install [GitHub Desktop](https://desktop.github.com) instead and use **File → Add local repository → Publish repository**. Skip Part 1 steps 3–4.)*

4. **Set your repo name in the CMS config** (do this now so you only push once). Open `admin/config.yml` and change:

   ```yaml
   repo: YOUR-USERNAME/portfolio
   site_url: https://YOUR-SITE.vercel.app   # update after Part 2 if the URL differs
   ```

   Use your real GitHub username. If you'll name the repo something other than `portfolio`, use that name here too.

5. **Optional but recommended:** replace the big images in `assets/` with WebP/optimised versions ([squoosh.app](https://squoosh.app), quality ~80). If you rename a file, update its path in `content/projects.json`.

## Part 1 — Put the code on GitHub

### 1. Create an empty repository
1. Go to <https://github.com/new>.
2. **Repository name:** `portfolio` (must match `config.yml`).
3. Choose **Public** or **Private** (Vercel and the CMS work with both).
4. **Do not** tick "Add a README", ".gitignore" or a licence — the project already has them.
5. Click **Create repository** and keep the page open.

### 2. Push the project
Open PowerShell **inside the project folder** and run each command, one at a time:

```powershell
git init
```
```powershell
git add .
```
```powershell
git commit -m "Initial portfolio"
```
```powershell
git branch -M main
```
```powershell
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
```
```powershell
git push -u origin main
```

Replace `YOUR-USERNAME`. If a browser window asks you to sign in to GitHub, approve it.

Refresh your GitHub repo page. You should see all the files above, and under the **Actions** tab a green "Validate content" run.

> `git commit` says "Please tell me who you are"? Run these once, then repeat the commit:
> ```powershell
> git config --global user.name "Your Name"
> ```
> ```powershell
> git config --global user.email "you@example.com"
> ```

## Part 2 — Deploy on Vercel

### 3. Import the repo
1. Go to <https://vercel.com/new>.
2. Under **Import Git Repository**, click **Install** next to GitHub if asked, and allow access to your `portfolio` repo.
3. Click **Import** next to `portfolio`.

### 4. Settings (leave the defaults)
| Setting | Value |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `./` |
| Build Command | *(empty)* |
| Output Directory | *(empty)* |
| Environment Variables | none |

### 5. Deploy
Click **Deploy**. After ~30 seconds you get a URL like `https://portfolio-xyz.vercel.app`.

Check it:
- the homepage loads with all ten project cards;
- clicking **Burq**, **Propertico**, **Buna**, **ADGPG** or **Achelois BioPharma** opens its case-study page;
- `/admin` shows the CMS login screen.

If your URL differs from `site_url` in `admin/config.yml`, update it and push (see Part 4).

## Part 3 — Turn on the CMS

Full details are in [CMS.md](CMS.md). The short version:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name `portfolio-cms`, expiry 1 year, **Only select repositories → portfolio**, **Repository permissions → Contents: Read and write**.
3. Copy the token (you can't view it again — store it in a password manager).
4. Open `https://YOUR-SITE.vercel.app/admin` → **Sign in with token** → paste it.
5. **Portfolio → Projects & case studies → Add Project**, fill the form, **Save**.

Each save becomes a commit on GitHub; Vercel redeploys in ~30 seconds.

## Part 4 — Updating the site yourself

Edit files locally, then:

```powershell
git add .
```
```powershell
git commit -m "Describe your change"
```
```powershell
git push
```

> **Using both the CMS and local edits?** The CMS commits straight to `main`. Before you edit locally, pull the latest first:
> ```powershell
> git pull
> ```
> Otherwise `git push` may be rejected (see Troubleshooting).

Branches and pull requests get their own Vercel preview URL automatically.

## Part 5 — Custom domain (optional)

1. Vercel dashboard → your project → **Settings → Domains**.
2. Enter your domain (e.g. `mariajalal.com`) → **Add**.
3. At your domain registrar add the DNS records Vercel shows:
   - Apex domain: `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`
4. Wait a few minutes; Vercel issues HTTPS automatically.
5. Update `site_url` in `admin/config.yml` to the new domain.

## What the GitHub "Validate content" check does

Every push (including CMS saves) runs `.github/scripts/validate.mjs`. It fails with a red ✗ if:
- `content/projects.json` isn't valid JSON;
- a project is missing a title, slug, category, year or card image;
- two projects share a slug;
- an image path in the data points to a file that doesn't exist.

It never blocks Vercel — it's an early warning. Click the failed run under the **Actions** tab to see exactly which project/image is wrong, fix it (in the CMS or on github.com), and the next run will go green.

## Troubleshooting

| Problem | Fix |
|---|---|
| `git push` rejected ("fetch first") | The CMS added a commit. Run `git pull --rebase`, then `git push`. |
| Images/CSS missing on the live site | File names are **case-sensitive** on Vercel. Make sure paths match exactly (`Hero.png` ≠ `hero.png`). |
| Homepage cards don't show | `content/projects.json` has a syntax error. Check the Actions tab, or paste it into a JSON validator. |
| Card isn't clickable | That project has no case-study **Headline** yet. |
| `/admin` login: "repository not found" | `repo:` in `admin/config.yml` is wrong, or the token doesn't have access to that repo with **Contents: Read and write**. |
| Saved in the CMS but the site is unchanged | Wait for the Vercel deployment to finish (Vercel → Deployments), then hard-refresh with `Ctrl + Shift + R`. |
| 404 on the whole site | The repo root must contain `index.html` (not inside a sub-folder). |
| Site works on Vercel but not when opening `index.html` from disk | Expected — the pages load JSON with `fetch`. Use a local server (`npx serve .`) or just test on Vercel. |
