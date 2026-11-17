/* Real-browser check of tools/portal-analytics.js, safe by construction: it can never reach the live collector.
   - window.__cggsPAtest is set before the script, so every event is marked test:1 and goes to
     https://localhost/api/portal/track, which this check answers itself (a local collector), never to the Ask Emily
     web app;
   - every other request is aborted, and the check fails if one was for the live collector;
   - the live collector drops test:1 events anyway.
   Run: node tools/test/portal-analytics.browser.js      (needs Playwright with Chromium)
   Use this (or copy its set-up) for any browser check of the script: never load it on a fake portal page without
   window.__cggsPAtest, or its beacons go to the live dashboard (17 Nov 2026: a test visit as "Pat Parent" did). */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const CODE = fs.readFileSync(path.join(__dirname, '..', 'portal-analytics.js'), 'utf8');

(async () => {
  const got = [];
  const local = 'https://localhost/api/portal/track';
  const blocked = [];
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext();
    await ctx.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.hostname === 'portals.veracross.au') {
        return route.fulfill({ contentType: 'text/html', body:
          '<html><head><title>Test page</title><script>' +
          `window.__cggsPAtest={endpoint:${JSON.stringify(local)}};` +
          "window.Portals={config:{client:'cggs_act',portal_name:'parent',screen_name:'home',user_id:'test',user_full_name:'Test Visitor'}}" +
          `</script></head><body><a href="#">x</a><script>${CODE}</script></body></html>` });
      }
      if (u.href === local) {
        try { got.push(JSON.parse(route.request().postData())); } catch (e) { /* ignore */ }
        return route.fulfill({ status: 204 });
      }
      blocked.push(u.href);
      return route.abort();
    });
    const p = await ctx.newPage();
    await p.goto('https://portals.veracross.au/cggs_act/parent?src=email&tab=2');
    await p.waitForTimeout(500);
    assert.equal(p.url(), 'https://portals.veracross.au/cggs_act/parent?tab=2'); // ?src= stripped
    await p.click('a');
    await p.waitForTimeout(500);
    const info = await p.evaluate(() => ({ test: window.__cggsPA.test, sent: window.__cggsPA.sent.length }));
    assert.equal(info.test, true);
    assert.ok(got.length >= 2 && got.length === info.sent, `local collector got ${got.length}, page sent ${info.sent}`);
    assert.ok(got.every((e) => e.test === 1 && e.src === 'email'));
    assert.deepEqual(blocked.filter((u) => /azurewebsites\.net/.test(u)), []);
    console.log(`browser check OK: ${got.map((e) => e.e).join(', ')} to the local collector; nothing to the live one` +
      (blocked.length ? ` (${blocked.length} other request(s) blocked)` : ''));
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
