"""Prints workstand.html wired to the demo store and demo art instead of the artifact runtime."""
import sys
s = open("workstand.html").read()
swaps = [
    ("(window.claude && window.claude.use) ? window.claude.use(n).catch(() => null) : Promise.resolve(null)",
     "window.__workstandDemo.use(n).catch(() => null)"),
    ("'/_blob/' + a.asset", "window.__workstandDemo.blob(a.asset)"),
]
for old, new in swaps:
    assert old in s, "hook not found: " + old
    s = s.replace(old, new)
sys.stdout.write(s)
