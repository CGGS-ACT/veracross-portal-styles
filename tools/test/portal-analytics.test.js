/* Tests for tools/portal-analytics.js: the entry-source rules (first match wins), ?src= stripping, and src on every
   event of a session. No browser needed: the script runs in a node vm with a fake portal page.
   Run: node --test tools/test/            (node 18+) */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const CODE = fs.readFileSync(path.join(__dirname, '..', 'portal-analytics.js'), 'utf8');
const PAGE = 'https://portals.veracross.au/cggs_act/parent';
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPHONE_WEBVIEW = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const IPAD_WEBVIEW = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)';
const ANDROID_WEBVIEW = 'Mozilla/5.0 (Linux; Android 14; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36';
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const SCHOOLBOX = IPHONE_SAFARI + ' Schoolbox/24.1';
const DIGISTORM = ANDROID_CHROME + ' DigistormApp/3.2';
const FACEBOOK = IPHONE_WEBVIEW + ' [FBAN/FBIOS;FBAV/450.0.0]';
const WIN_EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0';

const LOCAL = 'http://127.0.0.1:8099/api/portal/track';
const LIVE = /azurewebsites\.net/;

/* Run the script in a fake page. Returns {beacons, urls, window, location, history, storage}.
   Every run sets window.__cggsPAtest (a local collector) unless test is given: tests must never reach the live
   collector, and the network stubs below throw if anything tries. */
function run({ href = PAGE, referrer = '', ua = WIN_EDGE, touch = 0, storage = {}, test = { endpoint: LOCAL } } = {}) {
  const u = new URL(href);
  const beacons = [], urls = [];
  const location = { href: u.href, hostname: u.hostname, host: u.host, pathname: u.pathname, search: u.search };
  const history = {
    state: null, calls: [],
    replaceState(state, title, url) { this.calls.push(url); const n = new URL(url, location.href); Object.assign(location, { href: n.href, pathname: n.pathname, search: n.search }); },
  };
  const ss = {
    getItem: (k) => (k in storage ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
  };
  const noop = () => {};
  const document = {
    title: 'Parent home', referrer, visibilityState: 'visible', documentElement: { clientWidth: 1200 },
    addEventListener: noop, querySelectorAll: () => [], querySelector: () => null, body: {},
  };
  const window = {
    Portals: { config: { client: 'cggs_act', portal_name: 'parent', screen_name: 'home', user_id: 77, user_full_name: 'Pat Parent' } },
    innerWidth: 1200, screen: { width: 1920, height: 1080 }, addEventListener: noop,
  };
  if (test) window.__cggsPAtest = test;
  window.self = window; window.top = window;
  const ctx = {
    window, document, location, history, sessionStorage: ss, URL, Blob, Promise, JSON, String, Math, Date, Array,
    Object, Uint8Array, DOMParser: function () {}, screen: window.screen, MutationObserver: undefined,
    navigator: {
      userAgent: ua, maxTouchPoints: touch,
      sendBeacon: (url, blob) => {
        if (test && LIVE.test(url)) throw new Error('a test tried to reach the live collector: ' + url);
        urls.push(url); beacons.push(blob); return true;
      },
    },
    crypto: { getRandomValues: (a) => { for (let i = 0; i < a.length; i++) a[i] = (i * 37 + 11) & 255; return a; } },
    fetch: (url) => {
      if (LIVE.test(String(url))) throw new Error('a test tried to reach the live collector: ' + url);
      return Promise.resolve({ ok: false });
    },
    setTimeout: (f) => 0, setInterval: () => 0,
  };
  ctx.window.crypto = ctx.crypto;
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx);
  return { beacons, urls, window, location, history, storage };
}

async function events(r) {
  await new Promise((res) => setImmediate(res));
  return Promise.all(r.beacons.map((b) => b.text().then(JSON.parse)));
}

const SRC = run({ href: 'https://example.com/' }).window.__cggsPAsrc; // the pure functions (runs nothing else off-portal)
const detect = (o) => SRC.detect(o.href || PAGE, o.ref || '', o.ua || WIN_EDGE, o.touch || 0);

test('rule 1: ?src= or utm_source= in the link wins', () => {
  for (const s of ['email', 'news', 'app', 'sms']) {
    const d = detect({ href: `${PAGE}?src=${s}`, ref: 'https://mail.google.com/', ua: ANDROID_WEBVIEW });
    assert.equal(d.src, s); assert.equal(d.link, true); assert.match(d.why, new RegExp(`src=${s}`));
  }
  assert.equal(detect({ href: `${PAGE}?utm_source=Newsletter&utm_medium=email` }).src, 'newsletter');
  assert.equal(detect({ href: `${PAGE}?src=EMAIL` }).src, 'email');
  assert.equal(detect({ href: `${PAGE}?src=<script>` }).src, 'script'); // only a-z 0-9 _ - kept
  assert.equal(detect({ href: `${PAGE}?src=` }).src, 'direct'); // empty: falls through
});

test('rule 2: the school app in-app browser', () => {
  assert.deepEqual([detect({ ua: SCHOOLBOX }).src, detect({ ua: SCHOOLBOX }).why], ['app', 'school app in-app browser: Schoolbox']);
  assert.equal(detect({ ua: DIGISTORM }).src, 'app');
  assert.match(detect({ ua: ANDROID_WEBVIEW }).why, /Android WebView/);
  assert.match(detect({ ua: IPHONE_WEBVIEW }).why, /iOS WKWebView/);
  assert.equal(detect({ ua: IPAD_WEBVIEW, touch: 5 }).src, 'app');
  assert.equal(detect({ ua: IPAD_WEBVIEW, touch: 0 }).src, 'direct'); // a Mac app, not an iPad
  assert.equal(detect({ ua: IPHONE_SAFARI }).src, 'direct');
  assert.equal(detect({ ua: ANDROID_CHROME }).src, 'direct');
  assert.equal(detect({ ua: FACEBOOK }).src, 'direct'); // Facebook's in-app browser isn't the school app
  assert.equal(detect({ ua: ANDROID_WEBVIEW, ref: 'https://mail.google.com/' }).src, 'app'); // app beats referrer
});

test('rule 3: webmail referrers are email', () => {
  for (const h of ['outlook.office.com', 'outlook.office365.com', 'outlook.live.com', 'mail.google.com', 'mail.yahoo.com',
    'aus01.safelinks.protection.outlook.com']) {
    assert.equal(detect({ ref: `https://${h}/mail/inbox` }).src, 'email', h);
  }
});

test('rule 4: Agora is agora', () => {
  const d = detect({ ref: 'https://sboxprd.cggs.act.edu.au/homepage/123' });
  assert.equal(d.src, 'agora'); assert.match(d.why, /sboxprd/);
});

test('rule 5: another portal page is internal; a sign-in page is signin', () => {
  assert.equal(detect({ ref: 'https://portals.veracross.au/cggs_act/parent/calendar' }).src, 'internal');
  assert.equal(detect({ ref: 'https://portals.veracross.au/cggs_act/login' }).src, 'signin');
  assert.equal(detect({ ref: 'https://login.microsoftonline.com/common/oauth2' }).src, 'signin');
  assert.equal(detect({ ref: 'https://accounts.veracross.au/cggs_act/portals/login' }).src, 'signin');
});

test('rule 6: the CGGS website, search engines, other sites', () => {
  assert.equal(detect({ ref: 'https://www.cggs.act.edu.au/parents' }).src, 'website');
  assert.equal(detect({ ref: 'https://cggs.act.edu.au/' }).src, 'website');
  for (const h of ['www.google.com', 'www.google.com.au', 'www.bing.com', 'duckduckgo.com', 'search.yahoo.com', 'www.ecosia.org']) {
    assert.equal(detect({ ref: `https://${h}/` }).src, 'search', h);
  }
  const o = detect({ ref: 'https://www.facebook.com/' });
  assert.equal(o.src, 'other'); assert.match(o.why, /facebook/);
});

test('rule 7: no referrer is direct (or desktop Outlook)', () => {
  const d = detect({});
  assert.equal(d.src, 'direct'); assert.match(d.why, /desktop Outlook sends no referrer/);
});

test('strip: src and utm_* go, everything else stays', () => {
  assert.equal(SRC.strip(`${PAGE}?src=email`), '/cggs_act/parent');
  assert.equal(SRC.strip(`${PAGE}?a=1&src=news&b=2#top`), '/cggs_act/parent?a=1&b=2#top');
  assert.equal(SRC.strip(`${PAGE}?utm_source=x&utm_medium=email&utm_campaign=t3`), '/cggs_act/parent');
  assert.equal(SRC.strip(`${PAGE}?a=1`), null);
  assert.equal(SRC.strip(PAGE), null);
});

test('on a portal page: ?src=email is sent, stripped from the address bar, and kept for the session', async () => {
  const storage = {};
  const r = run({ href: `${PAGE}?src=email&tab=2`, referrer: '', storage });
  assert.deepEqual(r.history.calls, ['/cggs_act/parent?tab=2']);
  assert.equal(r.location.href, `${PAGE}?tab=2`);
  const evs = await events(r);
  assert.equal(evs[0].e, 'view'); assert.equal(evs[0].src, 'email'); assert.equal(evs[0].src_why, 'src=email in the link');
  assert.equal(r.window.__cggsPA.info().source, 'email');
  // The next page of the session (referrer: a portal page) keeps email, and doesn't touch the address bar
  const r2 = run({ href: `${PAGE}/calendar`, referrer: `${PAGE}?tab=2`, storage });
  assert.deepEqual(r2.history.calls, []);
  assert.equal((await events(r2))[0].src, 'email');
  // A new ?src= link in the same session starts a new entry
  const r3 = run({ href: `${PAGE}?src=news`, referrer: `${PAGE}/calendar`, storage });
  assert.equal((await events(r3))[0].src, 'news');
});

test('on a portal page: a new session from another portal page is internal; no referrer is direct', async () => {
  assert.equal((await events(run({ referrer: `${PAGE}/calendar` })))[0].src, 'internal');
  const d = (await events(run({})))[0];
  assert.equal(d.src, 'direct'); assert.match(d.src_why, /desktop Outlook/);
  const app = run({ ua: ANDROID_WEBVIEW });
  assert.equal((await events(app))[0].src, 'app');
  assert.match(app.window.__cggsPA.info().app_marker, /Android WebView/);
});

test('test mode: events carry test:1 and go only to the local collector, never the live one', async () => {
  const r = run({ href: `${PAGE}?src=email` });
  const evs = await events(r);
  assert.ok(evs.length > 0);
  assert.ok(evs.every((e) => e.test === 1));
  assert.ok(r.urls.every((u) => u === LOCAL), r.urls.join(' '));
  assert.equal(r.window.__cggsPA.test, true);
  assert.equal(r.window.__cggsPA.sent.length, evs.length);
});

test('test mode without a local endpoint (or with a non-local one): nothing is sent, events kept in memory', async () => {
  for (const t of [true, {}, { endpoint: 'https://ask-emily-cggs-fyg9cubjd2dnc2bz.australiaeast-01.azurewebsites.net/api/portal/track' },
    { endpoint: 'https://evil.example/collect' }, { endpoint: 'http://127.0.0.1.evil.example/x' }]) {
    const r = run({ test: t });
    await events(r);
    assert.equal(r.urls.length, 0, JSON.stringify(t));
    assert.equal(r.window.__cggsPA.sent[0].e, 'view');
    assert.equal(r.window.__cggsPA.sent[0].test, 1);
  }
});

test('without the flag (a real visitor) events go to the live collector with no test field (stubbed here)', async () => {
  const r = run({ test: null });
  const evs = await events(r);
  assert.ok(r.urls.length > 0 && r.urls.every((u) => LIVE.test(u)));
  assert.ok(evs.every((e) => !('test' in e)));
  assert.equal(r.window.__cggsPA.test, false);
});
