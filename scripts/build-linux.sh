#!/usr/bin/env bash
# Builds the Linux desktop app (.deb, .rpm, .AppImage).
#
#   From Windows:  npm run desktop:build:linux   (runs this inside WSL Ubuntu)
#   On Linux:      npm run desktop:build         (or this script)
#
# Under WSL the repo sits on the Windows drive (/mnt/...), where builds are slow and node_modules
# holds Windows binaries. So the source is mirrored to ~/.cache/readme-templates-linux, built there
# (node_modules and the Rust cache stay between runs), and the bundles are copied back to
# src-tauri/target/linux/.
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"

for tool in node npm cargo rsync; do
  command -v "$tool" >/dev/null || { echo "Missing $tool. See README → Desktop app (Linux) for the one-time setup." >&2; exit 1; }
done
case "$(command -v npm)" in
  /mnt/*) echo "npm resolves to the Windows install ($(command -v npm)). Install Node inside Linux." >&2; exit 1 ;;
esac
pkg-config --exists webkit2gtk-4.1 || { echo "Missing libwebkit2gtk-4.1-dev. See README → Desktop app (Linux)." >&2; exit 1; }

if [[ "$repo" == /mnt/* ]]; then
  work="$HOME/.cache/readme-templates-linux"
  mkdir -p "$work"
  # Excluded paths are also kept on the mirror side, so installs and compiles are reused.
  rsync -a --delete \
    --exclude /node_modules --exclude /dist --exclude /src-tauri/target --exclude /src-tauri/gen \
    --exclude /graphify-out --exclude /.claude --exclude /.git \
    "$repo/" "$work/"
else
  work="$repo"
fi
cd "$work"

# Reinstall only when the lockfile changed.
if ! cmp -s package-lock.json node_modules/.lock-stamp; then
  npm ci --no-audit --no-fund
  cp package-lock.json node_modules/.lock-stamp
fi

# linuxdeploy (used for the AppImage) is itself an AppImage; this lets it run without FUSE.
export APPIMAGE_EXTRACT_AND_RUN=1
npm run desktop:build

bundle="$work/src-tauri/target/release/bundle"
if [ "$work" != "$repo" ]; then
  out="$repo/src-tauri/target/linux"
  rm -rf "$out"
  mkdir -p "$out"
  cp "$bundle"/deb/*.deb "$bundle"/rpm/*.rpm "$bundle"/appimage/*.AppImage "$out"/
  echo "Linux bundles copied to $out:"
  ls -lh "$out"
else
  ls -lh "$bundle"/deb/*.deb "$bundle"/rpm/*.rpm "$bundle"/appimage/*.AppImage
fi
