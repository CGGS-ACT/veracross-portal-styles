#!/usr/bin/env python3
"""Add ?src=<source> to every CGGS portal link in pasted text or HTML (a Composer email, a news item, app links), so
the portal visit tracking (tools/portal-analytics.js) knows how people arrived. Links that already have src= are left
alone; other query parts and #anchors are kept; &amp; in HTML stays &amp;.

One line (paste the email, then Ctrl-D, or Ctrl-Z Enter on Windows):
    python3 portal-links.py email < email.html > email-tracked.html
    pbpaste | python3 portal-links.py news | pbcopy                      (Mac clipboard)
    Get-Clipboard | python portal-links.py email | Set-Clipboard         (Windows PowerShell)

e.g. https://portals.veracross.au/cggs_act/parent           -> https://portals.veracross.au/cggs_act/parent?src=email
     https://portals.veracross.au/cggs_act/parent?tab=2#news -> https://portals.veracross.au/cggs_act/parent?tab=2&src=email#news
"""
import re
import sys

LINK = re.compile(r"https?://portals\.veracross\.(?:au|com)/cggs_act[^\s\"'<>()\]]*", re.I)


def add_src(text: str, src: str) -> str:
    src = re.sub(r"[^a-z0-9_-]", "", src.lower())[:24]
    if not src:
        raise SystemExit("usage: portal-links.py <email|news|app|sms> < text")

    def fix(m):
        url = m.group(0)
        tail = ""
        while url and url[-1] in ".,;:!?":  # sentence punctuation after a bare link
            url, tail = url[:-1], url[-1] + tail
        base, hash_, frag = url.partition("#")
        if re.search(r"[?&](amp;)?src=", base):
            return url + tail
        sep = ("&amp;" if "&amp;" in base else "&") if "?" in base else "?"
        return f"{base}{sep}src={src}{hash_}{frag}{tail}"

    return LINK.sub(fix, text)


if __name__ == "__main__":
    sys.stdout.write(add_src(sys.stdin.read(), sys.argv[1] if len(sys.argv) > 1 else ""))
