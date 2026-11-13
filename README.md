# CGGS Veracross portal styles

The styling for the designed pages on the CGGS Veracross Staff, Parent and Student portals
(portals.veracross.au/cggs_act). Pages load these files through jsDelivr, pinned to a release,
with an integrity check, so a page only changes when someone moves it to a new release.

**Styles, plus a few page scripts in `tools/`.** No secrets and no personal information in the repo. The repo is public so jsDelivr can serve it.

## Files

| File | Used by |
|---|---|
| `css/core.css` | Every designed page: equal-height cards, locked design blocks, breadcrumb, menu fix |
| `css/info.css` | Information and handbook pages, ELC and K-3 year pages |
| `css/elc.css` | Reception and Pre-Kindergarten (including the hero animation) |
| `css/k3.css` | Kindergarten and Years 1-3 (year colours set on each page) |
| `css/years-7-9.css` | Years 7-9 (year colours set on each page) |
| `css/years-10-12.css` | Years 10-12 (year colours set on each page) |
| `css/boarding.css` | Boarding House |
| `css/cygnus.css` | Cygnus pillar pages |
| `css/policies.css` | Policy hub and policy area pages |
| `css/staff.css` | Staff theme layer (staff section and policy pages) |
| `css/departments.css` | Staff section pages (Junior School/ELC, Senior School, Pastoral Care, Tours, PL, HR) |
| `css/pages/*.css` | One-off pages (staff home, parent home, info pages, policy hero photos) |

Scripts in `tools/` (loaded by small `img` tags in a page's design block, or run as bookmarklets):

| File | What it does |
|---|---|
| `tools/cggs-portal-tools.js` | CGGS Portal Tools for portal admins (sync pages, update styles, policy links) |
| `tools/boarding-house-scene.js` | The Boarding House day and night scene |
| `tools/portal-analytics.js` | Portal visit tracking: page views, time on page, clicks and card openings, sent to the Ask Emily bot (13 Nov 2026) |

Each page's design block in Veracross keeps only: the `<link>` tags to these files, a few
page-specific lines (year colours, hero photo), the breadcrumb and the title.

## Changing a style

1. Edit the file here (sign in with the ICT team account) and commit to `main`.
2. Create a release with the next version tag, e.g. `v1.1.0` (Releases > Draft a new release).
3. On any portal page, an admin clicks **Update styles** and picks the new version. It moves every page to
   that version and records each file's integrity code. To roll back, pick the previous version.

Pages never follow `main` directly, so a mistake on `main` doesn't reach the portals until it's released.

## Rules

- Scope every rule to its page type (e.g. `body:has(.vcd-jsr)`) so one page's styles can't leak into another.
- Keep the CGGS colours: teal `#0D5257`, charcoal `#414042`, stone `#e6e3e0`, pale green `#b6cbcd`, pink `#ecbcc5`.
- Plain CSS, one declaration per line, a comment at the top of each section.
- No JavaScript in the CSS files; scripts go in `tools/` and hold no secrets or personal information.
