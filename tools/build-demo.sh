#!/bin/sh
# Builds site/demo.html: the real workstand.html running on the made-up demo garage.
set -e
cd "$(dirname "$0")/.."
{
  printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  printf '<style>html,body{margin:0;background:#0E1013}.demo-tag{position:sticky;top:0;z-index:50;text-align:center;font:600 11px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#0E1013;background:#8099FF;padding:7px 12px}</style>\n'
  printf '<script>\n'; cat tools/demo-shim.js; printf '</script>\n</head><body>\n'
  # Point the app at the demo store instead of the artifact runtime.
  python3 -c 'import sys; s=open("workstand.html").read(); old="(window.claude && window.claude.use) ? window.claude.use(n).catch(() => null) : Promise.resolve(null)"; assert old in s, "boot hook not found"; sys.stdout.write(s.replace(old, "window.__workstandDemo.use(n).catch(() => null)"))'
  printf '\n</body></html>\n'
} > site/demo.html
echo "wrote site/demo.html"
