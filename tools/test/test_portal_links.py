"""Tests for tools/portal-links.py. Run: python3 tools/test/test_portal_links.py"""
import importlib.util
import pathlib

spec = importlib.util.spec_from_file_location("portal_links", pathlib.Path(__file__).parents[1] / "portal-links.py")
pl = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pl)
P = "https://portals.veracross.au/cggs_act/parent"

assert pl.add_src(f"See {P}.", "email") == f"See {P}?src=email."
assert pl.add_src(f'<a href="{P}?tab=2#news">x</a>', "news") == f'<a href="{P}?tab=2&src=news#news">x</a>'
assert pl.add_src(f'<a href="{P}?a=1&amp;b=2">', "email") == f'<a href="{P}?a=1&amp;b=2&amp;src=email">'
assert pl.add_src(f"{P}?src=sms and {P}/calendar", "email") == f"{P}?src=sms and {P}/calendar?src=email"
assert pl.add_src("https://www.cggs.act.edu.au/ and https://portals.veracross.au/other_school/parent", "email") == \
    "https://www.cggs.act.edu.au/ and https://portals.veracross.au/other_school/parent"
assert pl.add_src(f"({P})", "App") == f"({P}?src=app)"
print("portal-links OK")
