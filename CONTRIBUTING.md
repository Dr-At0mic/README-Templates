# Contributing to README Templates

Thanks for helping out! Bug reports, template ideas, fixes, docs and new templates are all welcome. You don't need to be an expert; if something is unclear, open an issue and ask.

- [Ways to contribute](#ways-to-contribute)
- [Set up the project](#set-up-the-project)
- [Project layout](#project-layout)
- [Add a new template](#add-a-new-template)
- [Working on the desktop app](#working-on-the-desktop-app)
- [Before you open a pull request](#before-you-open-a-pull-request)
- [Pull request process](#pull-request-process)
- [Reporting bugs](#reporting-bugs)
- [Security issues](#security-issues)
- [Be kind](#be-kind)

## Ways to contribute

- **Report a bug.** Something renders wrong on GitHub, publishing fails, or the desktop app misbehaves. See [Reporting bugs](#reporting-bugs).
- **Suggest an idea.** Open an issue describing the template or feature and who it's for. A rough sketch or screenshot helps a lot.
- **Fix something.** Issues labelled `good first issue` are a gentle start. Comment on the issue first so two people don't work on the same thing.
- **Add a template.** This is the most fun contribution. See [Add a new template](#add-a-new-template).
- **Improve the docs.** Typos, unclear steps and missing explanations are all worth a PR.

## Set up the project

You need **Node.js 20+** and **git**.

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/README-Templates.git
cd README-Templates

# 2. Install and configure
npm install
cp .env.example .env      # set VITE_VAULT_SECRET to any random string (the file explains how)

# 3. Run it
npm run dev               # http://localhost:5173
```

The app runs on **sample data** until you connect a GitHub token. You can build and test almost everything without one. To test live data or publishing, use a token on a test account, or on your own account if you don't mind it changing your profile README.

Keep your fork current:

```bash
git remote add upstream https://github.com/Dr-At0mic/README-Templates.git
git fetch upstream
git rebase upstream/main
```

## Project layout

```
src/
  App.jsx                state; decides sample vs live data
  components/            TopBar, EditorPanel, PreviewPanel, dialogs, TemplateGallery, UpdateButton
  lib/github.js          GraphQL profile fetch, repo inspection, single-commit publish
  lib/vault.js           encrypted token storage (AES-256-GCM)
  lib/preview.js         markdown → GitHub-like preview
  lib/download.js        save files (browser download or native Save dialog)
  lib/updater.js         desktop update check / install
  templates/             one folder per template + index.js registry
  data/sampleProfile.js  fictional sample profile used without a token
  index.css              app design tokens and styles
src-tauri/               desktop app (Tauri v2): window, security policy, permissions, updater
scripts/build-linux.sh   Linux desktop build (WSL or native)
.github/workflows/       release pipeline
```

The stack is **React 19 + Vite 6** in plain JavaScript (no TypeScript), with `marked` + `dompurify` for the preview and `lucide-react` for icons. There is no backend: the app talks to `api.github.com` directly.

## Add a new template

A template is a folder in `src/templates/` that turns a profile into a README plus SVG artwork.

### 1. Create the module

`src/templates/<your-template>/index.js` exports:

| Export | Required | What it is |
|---|---|---|
| `id` | yes | Unique, lowercase, e.g. `'aurora'` |
| `name` | yes | Display name, e.g. `'Aurora'` |
| `tagline` | yes | One short line for the gallery |
| `tags` | yes | e.g. `['Animated', 'Minimal']`, used by the gallery filter |
| `hero(profile, theme)` | yes | Returns the main SVG string for `'dark'` or `'light'`, used for gallery previews |
| `render(profile)` | yes | Returns `{ markdown, assets }`. `assets` maps file paths to SVG strings, e.g. `{ 'assets/hero-dark.svg': '<svg…>' }` |
| `fields` | no | Extra inputs for this template; values are stored in `profile.templateData[id]` |
| `animated` | no | `true` shows the preview's **Replay** button |
| `dedication` | no | `{ text, url }`, a small linked credit line on the template's gallery card |

Look at `src/templates/pulsar/` (static) and `src/templates/singularity/` (animated) for complete examples. Keeping the SVG generators in a separate `art.js` keeps `index.js` readable.

### 2. Register it

Add it to `src/templates/index.js`.

### 3. Follow the template rules

These rules keep the READMEs fast, accessible and safe to publish:

- **Original art only.** Generate the artwork from the user's data. No copyrighted characters, names, logos or quotes, and no images copied from elsewhere.
- **Dark and light.** Ship both variants and switch them with `<picture>` and `prefers-color-scheme`, like the existing templates do.
- **Plain text too.** The person's name, headline and projects must also appear as normal markdown text, not only inside images, so search engines and screen readers can read them.
- **Real alt text** on every image.
- **Fonts:** use system font stacks inside SVGs. GitHub serves SVGs as images, so web fonts won't load.
- **No scripts or external resources** in SVGs; GitHub strips them.
- **Animation rules** (for animated templates):
  - CSS `@keyframes` only.
  - Write keyframes as `from { … }` only, so the element's normal style is the **final frame**. Anyone who doesn't get the animation then still sees the finished picture.
  - Include `@media (prefers-reduced-motion: reduce)` that turns animation off.
  - At most **two** infinite loops per SVG; everything else plays once.
  - No blur filters on animated layers (they're slow to render).
- **Use the data honestly.** Handle empty and new accounts (no contributions, no pinned repos) without breaking the layout.

## Working on the desktop app

The desktop app wraps the same web code with [Tauri v2](https://tauri.app). You only need this if you're changing desktop behaviour. Install the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS, then:

```bash
npm run desktop:dev       # desktop window over the dev server (stop `npm run dev` first; both use port 5173)
npm run desktop:build     # installers for your OS, in src-tauri/target/release/bundle/
```

Desktop rules:

- **Desktop-only code** goes behind `isTauri()` with a dynamic `import()` (see `src/lib/download.js`), so the web build never loads Tauri plugins.
- **New network origins** must be added to the Content Security Policy in `src-tauri/tauri.conf.json`. Today the app may only talk to itself and `api.github.com`; please explain any addition in your PR.
- **Permissions stay minimal.** `src-tauri/capabilities/default.json` grants only what's needed. Don't add broad file system or shell access.
- **You don't need the signing key.** Local builds skip the signed update files; only the official release pipeline signs them.

## Before you open a pull request

- [ ] `npm run build` passes.
- [ ] You checked the change in the app, in **both** the dark and light preview themes.
- [ ] For templates: the final frame looks right with reduced motion turned on (in Chrome or Edge DevTools: *Rendering → Emulate CSS prefers-reduced-motion*).
- [ ] For templates: it works with the sample data **and** with an empty or new profile.
- [ ] For UI changes: keyboard focus is visible, text contrast is readable, and nothing breaks at narrow widths.
- [ ] No tokens, `.env` files, keys or personal data in the diff.
- [ ] Your code matches the style of the surrounding code: naming, comment density, plain JS.

There's no test suite or linter yet, so the build plus a careful visual check is the bar. Screenshots in the PR help reviewers a lot.

## Pull request process

1. Create a branch on your fork: `git checkout -b feat/aurora-template` or `fix/preview-light-theme`.
2. Keep each PR focused on one thing. Small PRs get reviewed faster.
3. Write clear commit messages: a short summary line, then a blank line and the *why* if it isn't obvious.
   ```
   Add Aurora template

   Animated northern-lights header drawn from monthly contributions.
   ```
4. Open the PR against `main`. Describe what changed and why, link the issue (`Closes #12`), and add screenshots or a short screen recording for anything visual.
5. A maintainer will review it. Expect questions or change requests; that's normal, not a rejection.
6. Once approved, it gets merged and ships in the next release.

Releases are cut by the maintainer by tagging a version. You don't need to bump version numbers in your PR.

## Reporting bugs

Search the [existing issues](https://github.com/Dr-At0mic/README-Templates/issues) first. If it's new, open an issue with:

- **What happened** and **what you expected**.
- **Steps to reproduce.**
- **Where:** the web version (which browser), or the desktop app (Windows or Linux distro, and which file you installed: `.exe`, `.msi`, `.deb`, `.rpm` or `.AppImage`).
- **App version**, shown in the update dialog in the desktop app.
- **Screenshots**, if it's visual.

**Never paste a GitHub token** into an issue, even a revoked one.

## Security issues

If you find a security problem, for example token leakage, the CSP being bypassable, or unsafe HTML in the preview, **please don't open a public issue**. Report it privately through the repo's **Security** tab → **Report a vulnerability**, or contact the maintainer directly through their [GitHub profile](https://github.com/Dr-At0mic). You'll get a reply as soon as possible, and credit for the fix if you'd like it.

## Be kind

Be respectful and constructive with everyone: in issues, in reviews and in discussions. Assume good intent, explain instead of dismissing, and remember that many contributors are doing this in their free time. Harassment or personal attacks aren't tolerated and lead to removal from the project.

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](LICENSE).
