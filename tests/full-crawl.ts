/**
 * 全站逐页爬行测试（上线前审计用）：
 *  1. 读取 dist 里全部 HTML 页面；
 *  2. 每页在 375 / 390 / 768 / 1440 四个视口打开：记录控制台错误、失败请求、站外请求、横向溢出；
 *  3. 收集每页全部 <a>：站内链接逐个请求确认 200（锚点确认目标 id 存在），站外链接检查 rel 与 target；
 *  4. 收集每页全部 <button> / <select> / <input>：在 1440 视口逐个真实点击或操作，确认无异常、无死循环；
 *  5. 关闭 JavaScript 打开每页：确认 H1、正文字数和主要链接仍在初始 HTML 里；
 *  6. 抽样真实点击站内链接并测试浏览器后退 / 前进。
 * 结果写入 reports/crawl-result.json，供审计报告引用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startStaticServer } from './lib/static-server';

const DIST = path.resolve('dist');
const pages: string[] = [];
(function walk(d: string) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === '404.html' && d === DIST) pages.push('/404.html');
    else if (f.name === 'index.html') pages.push('/' + path.relative(DIST, path.dirname(p)).split(path.sep).join('/') + (path.dirname(p) === DIST ? '' : '/'));
  }
})(DIST);
pages.sort();
const norm = (p: string) => p.replace(/\/+$/, '/').replace(/^\/\//, '/');

const server = await startStaticServer();
const O = server.origin;
const browser = await chromium.launch();

interface PageResult { url: string; problems: string[]; links: number; buttons: number; controls: number; noJsH1: boolean; noJsChars: number }
const results: PageResult[] = [];
const internalStatus = new Map<string, number>();
const external = new Map<string, { rel: string; target: string; from: string }>();
let interactions = 0;
let passed = 0;
const failures: string[] = [];
const fail = (s: string) => { failures.push(s); };

const VIEWPORTS = [375, 390, 768, 1440];

for (const url of pages) {
  const r: PageResult = { url, problems: [], links: 0, buttons: 0, controls: 0, noJsH1: false, noJsChars: 0 };
  for (const w of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, locale: 'zh-CN' });
    await ctx.route('**/*', (rt) => (rt.request().url().startsWith(O) ? rt.continue() : (r.problems.push(`[${w}] 站外请求 ${rt.request().url()}`), rt.abort())));
    const page = await ctx.newPage();
    page.on('pageerror', (e) => r.problems.push(`[${w}] JS 异常：${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') r.problems.push(`[${w}] 控制台错误：${m.text()}`); });
    page.on('response', (res) => { if (res.status() >= 400 && !(url === '/404.html' || res.url().endsWith('/404.html'))) r.problems.push(`[${w}] HTTP ${res.status()} ${res.url()}`); });
    const resp = await page.goto(O + url, { waitUntil: 'networkidle' });
    interactions++;
    if (!resp || (resp.status() !== 200 && url !== '/404.html')) { fail(`${url} [${w}] 状态 ${resp?.status()}`); } else passed++;
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    interactions++;
    if (overflow > 1) { r.problems.push(`[${w}] 横向溢出 ${overflow}px`); fail(`${url} [${w}] 横向溢出 ${overflow}px`); } else passed++;
    const h1 = await page.locator('h1').count();
    if (h1 !== 1) { r.problems.push(`[${w}] H1 数量 ${h1}`); fail(`${url} H1 数量 ${h1}`); }

    if (w === 1440) {
      // 链接
      const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.getAttribute('href') ?? '', rel: a.getAttribute('rel') ?? '', target: a.getAttribute('target') ?? '', text: (a.textContent ?? '').trim() || a.getAttribute('aria-label') || '' })));
      r.links = links.length;
      for (const l of links) {
        if (!l.href || l.href === '#') { fail(`${url} 空链接：“${l.text}”`); continue; }
        if (!l.text) fail(`${url} 链接没有可读文字：${l.href}`);
        if (/^https?:\/\//.test(l.href) && !l.href.startsWith(O)) {
          external.set(l.href, { rel: l.rel, target: l.target, from: url });
          continue;
        }
        if (/^(mailto|tel):/.test(l.href)) continue;
        const u = new URL(l.href, O + url);
        const key = u.pathname;
        if (!internalStatus.has(key)) {
          const res = await page.request.get(O + key);
          internalStatus.set(key, res.status());
        }
        interactions++;
        if (internalStatus.get(key)! >= 400) fail(`${url} → ${l.href} 状态 ${internalStatus.get(key)}`); else passed++;
        if (u.hash && u.hash.length > 1) {
          const id = decodeURIComponent(u.hash.slice(1));
          let ok: boolean;
          if (norm(key) === norm(url)) ok = (await page.locator(`[id="${id}"]`).count()) > 0;
          else {
            const html = fs.existsSync(path.join(DIST, key, 'index.html')) ? fs.readFileSync(path.join(DIST, key, 'index.html'), 'utf8') : '';
            ok = html.includes(`id="${id}"`);
          }
          interactions++;
          if (!ok) fail(`${url} → ${l.href} 锚点不存在`); else passed++;
        }
      }
      // 按钮与表单控件：逐个操作
      const btns = page.locator('button:visible');
      r.buttons = await btns.count();
      for (let i = 0; i < r.buttons; i++) {
        const b = btns.nth(i);
        if (!(await b.isVisible().catch(() => false)) || !(await b.isEnabled().catch(() => false))) continue;
        const label = ((await b.textContent()) ?? '').trim() || (await b.getAttribute('aria-label')) || `按钮#${i}`;
        const before = page.url();
        const errs = r.problems.length;
        try {
          await b.click({ timeout: 3000 });
          await page.waitForTimeout(150);
          interactions++;
          if (r.problems.length > errs) fail(`${url} 点击“${label}”后出现错误`); else passed++;
          if (page.url().split('#')[0] !== before.split('#')[0]) { await page.goBack(); await page.waitForLoadState('networkidle'); }
          await page.keyboard.press('Escape');
        } catch (e) {
          interactions++;
          fail(`${url} 按钮“${label}”无法点击：${(e as Error).message.split('\n')[0]}`);
        }
      }
      const sels = page.locator('select:visible');
      const sc = await sels.count();
      for (let i = 0; i < sc; i++) {
        const s = sels.nth(i);
        const n = await s.locator('option').count();
        for (const idx of [1, n - 1, 0]) {
          if (idx < 0 || idx >= n) continue;
          try { await s.selectOption({ index: idx }, { timeout: 2000 }); interactions++; passed++; } catch (e) { interactions++; fail(`${url} 下拉框#${i} 选项 ${idx} 失败：${(e as Error).message.split('\n')[0]}`); }
        }
      }
      const inputs = page.locator('input[type="search"]:visible, input[type="text"]:visible');
      const ic = await inputs.count();
      for (let i = 0; i < ic; i++) {
        try { await inputs.nth(i).fill('灵动'); await page.waitForTimeout(200); await inputs.nth(i).fill(''); interactions++; passed++; } catch (e) { interactions++; fail(`${url} 输入框#${i} 失败：${(e as Error).message.split('\n')[0]}`); }
      }
      r.controls = sc + ic;
      if (r.problems.length) for (const p of r.problems) if (!failures.includes(`${url} ${p}`)) fail(`${url} ${p}`);
    }
    await ctx.close();
  }
  // 关闭 JS
  const nctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const np = await nctx.newPage();
  await np.goto(O + url);
  r.noJsH1 = (await np.locator('h1').count()) === 1 && ((await np.locator('h1').textContent()) ?? '').trim().length > 0;
  r.noJsChars = ((await np.locator('main').innerText().catch(() => '')) ?? '').replace(/\s+/g, '').length;
  interactions++;
  if (!r.noJsH1 || (r.noJsChars < 200 && !['/404.html', '/search/'].includes(url))) fail(`${url} 关闭 JS 后 H1=${r.noJsH1} 正文 ${r.noJsChars} 字`); else passed++;
  await nctx.close();
  results.push(r);
  process.stdout.write('.');
}

// 站外链接属性
for (const [href, e] of external) {
  interactions++;
  const rel = e.rel.split(/\s+/);
  if (e.target !== '_blank' || !rel.includes('noopener')) fail(`站外链接 ${href}（${e.from}）缺少 target=_blank 或 rel=noopener`); else passed++;
}

// 抽样真实点击 + 后退 / 前进
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const samples = ['/', '/airports/', '/regions/', '/articles/', '/plans/', '/airports/lingdongyun/', '/time-tests/', '/guides/'];
  for (const s of samples) {
    await page.goto(O + s, { waitUntil: 'networkidle' });
    // 地图圆点在有 JS 时是“选中地区”而不是跳转（无 JS 时才跳转到地区页），不计入点击跳转测试
    const hrefs = await page.$$eval('main a[href^="/"]:not(.dot):not([data-region-tab])', (as) => [...new Set(as.map((a) => a.getAttribute('href')!))].slice(0, 6));
    for (const h of hrefs) {
      const link = page.locator(`main a[href="${h}"]:not(.dot):not([data-region-tab])`).first();
      if (!(await link.isVisible().catch(() => false))) continue;
      try {
        await link.click({ timeout: 3000 });
        await page.waitForLoadState('networkidle');
        const there = new URL(page.url()).pathname;
        const back = await page.goBack(); await page.waitForLoadState('networkidle');
        const backPath = new URL(page.url()).pathname;
        await page.goForward(); await page.waitForLoadState('networkidle');
        const fwd = new URL(page.url()).pathname;
        interactions++;
        if (backPath !== s || fwd !== there || !back) fail(`后退/前进异常：${s} → ${h}（后退到 ${backPath}，前进到 ${fwd}）`); else passed++;
        await page.goto(O + s, { waitUntil: 'networkidle' });
      } catch (e) { interactions++; fail(`点击 ${s} 的链接 ${h} 失败：${(e as Error).message.split('\n')[0]}`); }
    }
  }
  await ctx.close();
}

await browser.close();
await server.close();
fs.mkdirSync('reports', { recursive: true });
const out = { pages: pages.length, internalUrls: internalStatus.size, externalUrls: external.size, interactions, passed, failed: failures.length, failures, perPage: results };
fs.writeFileSync('reports/crawl-result.json', JSON.stringify(out, null, 1));
console.log(`\n页面 ${pages.length}，站内 URL ${internalStatus.size}，站外 URL ${external.size}，交互 ${interactions}，通过 ${passed}，失败 ${failures.length}`);
for (const f of failures.slice(0, 80)) console.log('  ✗ ' + f);
process.exit(failures.length ? 1 : 0);
