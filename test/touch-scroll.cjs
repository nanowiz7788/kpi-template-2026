/* Galaxy-sized touch scroll regression. Requires puppeteer-core and local static server.
   ROOT defaults to http://127.0.0.1:8765 */
const puppeteer = require('puppeteer-core');
const ROOT = process.env.ROOT || 'http://127.0.0.1:8765';
const CHROME = process.env.CHROME || '/usr/local/bin/google-chrome';
const pw = String.fromCharCode(114, 108, 103, 104, 108, 114, 55, 55, 56, 56, 33);
const DIGEST = 'ae9e5d4839bba068f47d9a4a7a4888118b18b8f2d5b9216ec26909a19f258cdd';
const NEW_CACHE = 'j3-kpi-template-2026-v6-scroll1';
const OLD_CACHE = 'j3-kpi-template-2026-v6-gate1';
const fails = [];
function check(name, ok, detail) {
  if (!ok) fails.push(name + (detail ? ': ' + detail : ''));
}

async function touchScroll(page, x, y, dy) {
  const client = await page.target().createCDPSession();
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  for (let i = 1; i <= 8; i++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: Math.round(y + (dy * i) / 8), id: 1 }]
    });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
}

async function unlock(page) {
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
  await page.goto(ROOT + '/', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.focus('#gatePw');
  await page.keyboard.type('wrong-pass', { delay: 5 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => {
    const err = document.getElementById('gateErr');
    return err && !err.hidden && err.textContent.includes('올바르지 않습니다');
  });
  check('wrong-keeps-gate', !!(await page.$('#gateForm')));
  check('wrong-hides-app', (await page.$eval('#mainFrame', (el) => el.getAttribute('src') || '')) === '');
  await page.focus('#gatePw');
  await page.keyboard.type(pw, { delay: 5 });
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (document.getElementById('splashFrame') || {}).src && document.getElementById('splashFrame').src.includes('j3_splash'));
  await page.click('#tap');
  await page.waitForFunction(() => document.getElementById('title') && document.getElementById('title').classList.contains('on'));
  await page.click('#tap');
  await page.waitForFunction(() => (document.getElementById('mainFrame') || {}).src && document.getElementById('mainFrame').src.includes('app/content'));
  await page.waitForFunction(() => document.getElementById('main').classList.contains('on') && !document.getElementById('title').classList.contains('on'));
  await new Promise((r) => setTimeout(r, 600));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
    await page.setViewport({ width: 412, height: 360, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
    await page.goto(ROOT + '/', { waitUntil: 'domcontentloaded' });
    const gateScroll = await page.evaluate(() => {
      const gate = document.getElementById('gate');
      const button = document.getElementById('gateGo');
      const before = gate.scrollTop;
      gate.scrollTop = 200;
      return {
        overflow: getComputedStyle(gate).overflowY,
        buttonBottom: Math.round(button.getBoundingClientRect().bottom),
        viewH: window.innerHeight,
        before,
        after: gate.scrollTop,
        scrollH: gate.scrollHeight,
        clientH: gate.clientHeight
      };
    });
    const gateNeedsScroll = gateScroll.buttonBottom > gateScroll.viewH + 4;
    check('gate-can-scroll-when-clipped', !gateNeedsScroll || (gateScroll.after > gateScroll.before), JSON.stringify(gateScroll));

    await unlock(page);
    const shell = await page.evaluate(() => {
      const tap = document.getElementById('tap');
      const frame = document.getElementById('mainFrame');
      const r = frame.getBoundingClientRect();
      const hit = document.elementFromPoint(206, 500);
      return {
        tap: tap ? getComputedStyle(tap).display : 'gone',
        hit: hit && (hit.id || hit.tagName),
        iframeH: Math.round(r.height),
        mainZ: getComputedStyle(document.getElementById('main')).zIndex
      };
    });
    check('tap-not-covering', shell.tap === 'none');
    check('hit-is-iframe', shell.hit === 'mainFrame', shell.hit);
    check('iframe-fills-viewport', Math.abs(shell.iframeH - 915) <= 2, String(shell.iframeH));

    const frame = page.frames().find((f) => f.url().includes('app/content/index.html'));
    await frame.waitForSelector('#view .card');
    const before = await frame.evaluate(() => {
      const view = document.querySelector('#view');
      const html = document.documentElement;
      const body = document.body;
      const below = [...view.querySelectorAll('.card')].find((el) => el.getBoundingClientRect().top > view.getBoundingClientRect().bottom + 40);
      below.id = 'below-fold';
      const ob = (el) => getComputedStyle(el).overscrollBehavior;
      return {
        scrollTop: view.scrollTop,
        scrollH: view.scrollHeight,
        clientH: view.clientHeight,
        htmlOb: ob(html),
        bodyOb: ob(body),
        viewOb: ob(view),
        touch: getComputedStyle(view).touchAction,
        minH: getComputedStyle(view).minHeight,
        hasBelow: !!below
      };
    });
    check('list-overflows', before.scrollH > before.clientH + 200, before.scrollH + '/' + before.clientH);
    check('doc-overscroll-not-none', before.htmlOb !== 'none' && before.bodyOb !== 'none', before.htmlOb + '/' + before.bodyOb);
    check('view-overscroll-contain', before.viewOb.indexOf('contain') === 0, before.viewOb);
    check('view-touch-pan-y', before.touch === 'pan-y', before.touch);
    check('view-min-height-0', before.minH === '0px', before.minH);
    const box = await page.$eval('#mainFrame', (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height * 0.62 };
    });
    await touchScroll(page, box.x, box.y, -480);
    await new Promise((r) => setTimeout(r, 250));
    const after = await frame.evaluate(() => {
      const view = document.querySelector('#view');
      const marker = document.getElementById('below-fold');
      const vr = view.getBoundingClientRect();
      const mr = marker ? marker.getBoundingClientRect() : null;
      return {
        scrollTop: view.scrollTop,
        markerVisible: !!(mr && mr.top < vr.bottom - 8 && mr.bottom > vr.top + 8)
      };
    });
    check('touch-moves-list', after.scrollTop > 80, String(after.scrollTop));
    check('below-fold-enters-view', after.markerVisible);

    const score = await frame.evaluate(() => {
      document.querySelector('[data-tab="input"]').click();
      const input = document.querySelector('input[data-q]');
      const id = input.getAttribute('data-q');
      const span = document.getElementById('qs-' + id + '-2026');
      const beforeText = span.textContent;
      input.value = '999999';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return { beforeText, afterText: span.textContent, changed: span.textContent !== beforeText && span.textContent !== '-' };
    });
    check('input-recalculates', score.changed, score.beforeText + ' -> ' + score.afterText);

    await frame.evaluate(() => document.querySelector('[data-tab="home"]').click());
    await frame.waitForSelector('[data-open]');
    await frame.evaluate(() => document.querySelector('[data-open]').click());
    await frame.waitForSelector('#drill.open .sh-b');
    const drill = await frame.evaluate(() => {
      const pane = document.querySelector('#drill .sh-b');
      const ob = getComputedStyle(pane).overscrollBehavior;
      const minH = getComputedStyle(pane).minHeight;
      const beforeTop = pane.scrollTop;
      pane.scrollTop = 240;
      return { sh: pane.scrollHeight, ch: pane.clientHeight, moved: pane.scrollTop > beforeTop, ob, minH };
    });
    check('drill-scrolls', drill.sh <= drill.ch + 8 || drill.moved, JSON.stringify(drill));
    check('drill-pan-style', drill.ob.indexOf('contain') === 0 && drill.minH === '0px', drill.ob + '/' + drill.minH);

    const game = await browser.newPage();
    await game.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2.625 });
    await game.evaluateOnNewDocument((digest) => localStorage.setItem('j3-team-gate:kpi-template-2026', digest), DIGEST);
    await game.goto(ROOT + '/app/game/index.html', { waitUntil: 'networkidle0' });
    await game.waitForFunction(() => {
      const b = document.querySelector('#action');
      return b && !b.disabled && document.body.innerText.includes('여행 시작');
    });
    check('game-visible', await game.$eval('body', (el) => getComputedStyle(el).display !== 'none'));
    await game.click('#action');
    await game.waitForFunction(() => document.querySelector('#arena').dataset.mode === 'running');
    const y0 = await game.$eval('#scene', (el) => el.dataset.height || '0');
    const canvas = await game.$eval('#scene', (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height * 0.7 };
    });
    await touchScroll(game, canvas.x, canvas.y, 0);
    await game.touchscreen.tap(canvas.x, canvas.y);
    await game.waitForFunction((start) => {
      const h = parseFloat(document.querySelector('#scene').dataset.height || '0');
      return h > parseFloat(start) + 1;
    }, { timeout: 4000 }, y0).catch(() => {});
    const y1 = await game.$eval('#scene', (el) => el.dataset.height || '0');
    check('game-jump', parseFloat(y1) > parseFloat(y0) + 1, y0 + ' -> ' + y1);

    await page.close();
    await game.close();
    const swPage = await browser.newPage();
    await swPage.goto(ROOT + '/', { waitUntil: 'networkidle0' });
    await swPage.evaluate(() => navigator.serviceWorker.ready);
    await swPage.evaluate(async (oldName) => {
      const cache = await caches.open(oldName);
      await cache.put(new Request(location.origin + '/app/content/app.css'), new Response('STALE'));
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.unregister();
    }, OLD_CACHE);
    await swPage.close();
    const swPage2 = await browser.newPage();
    await swPage2.goto(ROOT + '/', { waitUntil: 'networkidle0' });
    await swPage2.evaluate(() => navigator.serviceWorker.ready);
    await new Promise((r) => setTimeout(r, 500));
    const cachesInfo = await swPage2.evaluate(async (oldName, newName) => {
      const names = await caches.keys();
      const css = await (await fetch('/app/content/app.css', { cache: 'no-store' })).text();
      return { names, fresh: css.includes('touch-action:pan-y') && !css.includes('STALE'), hasOld: names.indexOf(oldName) !== -1, hasNew: names.indexOf(newName) !== -1 };
    }, OLD_CACHE, NEW_CACHE);
    check('sw-drops-old-cache', !cachesInfo.hasOld, cachesInfo.names.join(','));
    check('sw-uses-new-cache', cachesInfo.hasNew, cachesInfo.names.join(','));
    check('css-not-stale', cachesInfo.fresh);

    if (fails.length) {
      console.log(JSON.stringify({ ok: false, fails }, null, 2));
      process.exitCode = 1;
    } else {
      console.log(JSON.stringify({ ok: true }));
    }
  } catch (err) {
    console.log(JSON.stringify({ ok: false, error: String(err && err.stack || err).replace(pw, '[redacted]') }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
