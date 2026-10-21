# README Templates

Design a GitHub profile README, preview it exactly as GitHub renders it (light and dark), and publish it to your `username/username` repo in one click. Runs in the browser or as a desktop app for Windows and Linux. No backend, no account, no tracking.

[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e)](LICENSE)
[![Latest release](https://img.shields.io/github/v/release/Dr-At0mic/README-Templates?label=download)](https://github.com/Dr-At0mic/README-Templates/releases/latest)
![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux%20%7C%20Web-30363d)

- **Original animated artwork:** generated as SVG from your own GitHub data (contribution calendar, languages, stars), not stock images or third-party widgets.
- **Accurate preview:** dark and light themes, with the same `<picture>` switching GitHub uses.
- **Publish safely:** shows exactly what will change, then commits the README and its artwork in a single commit.
- **Private by design:** your token is only ever sent to `api.github.com`. It is stored encrypted, or not at all.

---

## Download

Grab the latest build from **[Releases](https://github.com/Dr-At0mic/README-Templates/releases/latest)**:

| System | File | Install |
|---|---|---|
| Windows 10 / 11 | `README.Templates_x.y.z_x64-setup.exe` | Run it. Installs for your user only, no admin needed. |
| Windows (managed) | `README.Templates_x.y.z_x64_en-US.msi` | For company / Intune deployment |
| Debian, Ubuntu, Mint | `README.Templates_x.y.z_amd64.deb` | `sudo apt install ./README.Templates_*_amd64.deb` |
| Fedora, RHEL, openSUSE | `README.Templates-x.y.z-1.x86_64.rpm` | `sudo dnf install ./README.Templates-*.x86_64.rpm` |
| Any Linux distro | `README.Templates_x.y.z_amd64.AppImage` | `chmod +x README.Templates_*.AppImage`, then run it |

- **Windows SmartScreen:** the builds aren't code-signed yet, so Windows may say *"Windows protected your PC"*. Click **More info → Run anyway**.
- **Linux requirements:** a 64-bit distro with glibc 2.35 or newer, such as Ubuntu 22.04+, Debian 12+, Fedora 36+ or Mint 21+. The `.deb` and `.rpm` add **README Templates** to your app menu and a `readme-templates` command.
- **Linux blank or white window** (common in VMs): start the app with `WEBKIT_DISABLE_DMABUF_RENDERER=1 readme-templates`.

### Updates

The desktop app has a **Check for updates** button in the top bar.
- It checks GitHub Releases quietly at launch, and the button changes to **Update available** when there's a new version.
- One click shows the release notes, downloads the update, checks it against the project's signing key, installs it and restarts the app.
- Your saved accounts and edits are kept.
- On Linux, updating a `.deb` or `.rpm` install asks for your password. The AppImage updates itself in place.

## Templates

| Template | Style |
|---|---|
| **Singularity** | Animated sci-fi mission briefing: a black hole whose accretion disk is one particle per day of your contributions, HUD telemetry, and a "negative plate" light theme. |
| **Shōnen** | Animated anime opening: a title card with speed lines and an impact burst, plus an RPG character sheet built from your real stats (and a power level). |
| **Pulsar** | Static and minimal: a ridgeline plot of your year, one ridge per month, in the manner of the PSR B1919+21 pulsar plot. |

All three templates follow the same rules:
- The animation is pure CSS inside the SVG, so GitHub renders it with no scripts or GIFs.
- With `prefers-reduced-motion`, it stops on the finished frame.
- Every image ships in dark and light variants, with real alt text.
- Your name, bio and projects also appear as plain text, for search engines and screen readers.

Browse them all on the **Templates** page in the app, with live previews.

## How it works

1. **Start with sample data,** or connect a GitHub token to draw the artwork from your real profile. The app makes one GraphQL query and reads only public, non-fork repos.
2. **Edit** the fields; the preview updates as you type.
3. **Publish:** the app checks `username/username`, tells you whether it will create the repo, add a README or replace one, then writes `README.md` plus the SVGs in one commit. You can also just copy the markdown or download the files.

**Token:** a classic token with `public_repo` + `read:user`, or a fine-grained token with *Contents* and *Administration* write access to your profile repo.

**Multiple accounts:** add as many as you like and switch in one click. For each one you choose: *save on this device* (encrypted), *this session only*, or remove it.

<details>
<summary>How tokens are stored</summary>

- Tokens are encrypted with **AES-256-GCM**.
- The key is derived (HKDF-SHA-256) from a random per-device key, which IndexedDB holds as a **non-extractable** WebCrypto key, together with `VITE_VAULT_SECRET`.
- Each record is bound to its login. Decrypted tokens only ever live in memory.
- Copying `localStorage` alone yields nothing usable.
- `VITE_VAULT_SECRET` is compiled into the bundle, so it isn't confidential. It works as a rotation lever: change it, and every saved token becomes unreadable.
- As with any client-side app, this can't protect against script injected into the page itself.

</details>

## Run it from source

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/Dr-At0mic/README-Templates.git   # or your fork
cd README-Templates
npm install
cp .env.example .env    # then set VITE_VAULT_SECRET (the file explains how to generate one)
npm run dev             # http://localhost:5173
```

`npm run build` writes a static site to `dist/`. You can host it anywhere: GitHub Pages, Netlify, or any static server.

### Build the desktop app

The desktop app uses [Tauri v2](https://tauri.app), which runs on the system's own web engine (WebView2 on Windows, WebKitGTK on Linux), so installers are only a few MB. Install the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS first: Rust, plus the Visual Studio C++ build tools on Windows or the WebKitGTK dev packages on Linux.

```bash
npm run desktop:dev           # desktop window over the dev server (stop `npm run dev` first: both use port 5173)
npm run desktop:build         # installers for the OS you're on, in src-tauri/target/release/bundle/
npm run desktop:build:linux   # on Windows: build the Linux packages inside WSL Ubuntu
```

<details>
<summary>Linux packages from Windows (WSL)</summary>

`npm run desktop:build:linux` runs [scripts/build-linux.sh](scripts/build-linux.sh) inside WSL Ubuntu:
1. It mirrors the source to `~/.cache/readme-templates-linux`.
2. It builds there.
3. It copies the `.deb`, `.rpm` and `.AppImage` to `src-tauri/target/linux/`.

One-time setup inside WSL:

```bash
# as root (from Windows: wsl -d Ubuntu -u root)
apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev \
  libayatana-appindicator3-dev librsvg2-dev xdg-utils rsync
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs
# as your user
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

A local Linux build only runs on distros with the same glibc as the machine that built it, or newer. Official releases are built on Ubuntu 22.04.

</details>

<details>
<summary>How the desktop app differs from the web version</summary>

- **Links** open in your default browser, so the studio window never navigates away.
- **Downloads** use the native Save dialog.
- **Accounts** are stored separately from your browser's: in `%LOCALAPPDATA%\com.readmetemplates.studio` on Windows and `~/.local/share/com.readmetemplates.studio` on Linux.
- **Locked down:**
  - The Content Security Policy allows only the app itself and `api.github.com`.
  - The app can't read files at all. It can only write to a file you just picked in the Save dialog.

</details>

## Releasing

Releases are built by GitHub Actions ([.github/workflows/release.yml](.github/workflows/release.yml)). The workflow builds the Windows and Linux packages, signs the update files, and publishes a GitHub release with the `latest.json` the update button reads.

```bash
# 1. bump "version" in package.json (the desktop app reads it from there)
# 2. commit, then tag and push:
git tag v2.1.0
git push origin v2.1.0
```

The workflow needs these repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | Contents of the updater private key |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Its password |
| `VITE_VAULT_SECRET` | Any random string. Keep it the same across releases, or saved accounts stop decrypting after an update. |

**Publishing your own builds from a fork?** Generate your own key pair with `npx tauri signer generate -w ~/.tauri/readme-templates.key`. Then, in [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json), replace `plugins.updater.pubkey` with your public key, and point `endpoints` at your repo's releases. Otherwise your builds will look for updates from this repo. Never commit the private key; `*.key` is gitignored.

## Contributing

Contributions are welcome: bug reports, ideas, fixes, docs, and especially new templates. Read **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup, the project layout, how to add a template, the template rules, and the pull request checklist.

Found a security problem? Please report it privately (see [Security issues](CONTRIBUTING.md#security-issues)) instead of opening a public issue.

## License

[MIT](LICENSE) © 2026 Anandhu Suresh. You're free to use, fork, modify and redistribute it. The artwork the app generates from your profile is yours.
