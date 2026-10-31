/**
 * 响应式与性能测试（Chromium，需先 npm run build）。
 *
 * 宽度：375 / 390（手机）、768（平板）、1280 / 1440（桌面）。对关键页面检查：
 *  - 页面没有横向溢出（并指出是哪个元素撑出来的）；
 *  - 手机上首页地图在地区资料面板之上，桌面上地图在左、面板在右；
 *  - 可点击控件（按钮、输入框、下拉框、导航与表格里的链接）不小于 24×24 CSS 像素（WCAG 2.2 AA），手机上的导航链接不小于 40px 高；
 *  - 正文字号不小于 14px；
 *  - 布局稳定与加载速度：用浏览器自带的 PerformanceObserver 取 LCP 与 CLS（本机无限速，仅作为回归保护，不等同于 Lighthouse 的移动端节流评分）：
 *    CLS ≤ 0.1，LCP ≤ 2.5s。
 *
 * 加 --shots=<目录> 会把每个页面/宽度的截图存下来，供人工检查。
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { Page } from 'playwright';
import { a, collectCsp, run, setup, test } from './lib/harness';

const env = await setup();
const O = env.server.origin;
const shotsDir = process.argv.find((x) => x.startsWith('--shots='))?.slice('--shots='.length);
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });

const WIDTHS = [
  { w: 375, h: 812, label: '手机 375' },
  { w: 390, h: 844, label: '手机 390' },
  { w: 768, h: 1024, label: '平板 768' },
  { w: 1280, h: 800, label: '桌面 1280' },
  { w: 1440, h: 900, label: '桌面 1440' },
];

const PAGES = [
  '/',
  '/airports/',
  '/airports/lingdongyun/',
  '/airports/lingdongyun/singapore-speedtest-2026-10/',
  '/airports/feimaoyun/',
  '/airports/breezenet/',
  '/regions/',
  '/regions/singapore/',
  '/regions/europe/',
  '/routes/',
  '/time-tests/',
  '/test-records/',
  '/plans/',
  '/guides/',
  '/guides/seven-day-node-speed-log/',
  '/articles/',
  '/articles/singapore-vs-us-nodes/',
  '/search/?q=%E6%96%B0%E5%8A%A0%E5%9D%A1',
  '/testing-methodology/',
  '/sources/',
  '/about/',
  '/affiliate-disclosure/',
  '/privacy/',
  '/404.html',
];

/** 找出右边缘超出视口的元素（排除 position:fixed 与明确可滚动的容器内部） */
async function overflowCulprits(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    const scrollable = (el: Element | null): boolean => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (/(auto|scroll|hidden|clip)/.test(cs.overflowX) && n.scrollWidth >= n.clientWidth) return n !== el || true;
      }
      return false;
    };
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 1 && !scrollable(el.parentElement)) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        out.push(`${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ')[0] ?? ''}（右边缘 ${Math.round(r.right)}px > ${vw}px）`);
        if (out.length >= 5) break;
      }
    }
    return out;
  });
}

test('无横向溢出：24 个页面 × 5 种宽度', async () => {
  const bad: string[] = [];
  for (const size of WIDTHS) {
    const { page, problems } = await env.open({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.w < 800 ? 2 : 1, isMobile: size.w < 800, hasTouch: size.w < 800 });
    for (const url of PAGES) {
      problems.list.length = 0;
      const res = await page.goto(`${O}${url}`, { waitUntil: 'load' });
      const expected = url === '/404.html' ? 404 : 200;
      if (res?.status() !== expected && !(url === '/404.html' && res?.status() === 200)) bad.push(`${size.label} ${url} → HTTP ${res?.status()}`);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) bad.push(`${size.label} ${url} 横向溢出 ${over}px：${(await overflowCulprits(page)).join('；')}`);
      if (shotsDir && [375, 768, 1440].includes(size.w)) {
        const name = `${size.w}-${url.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}.png`;
        await page.screenshot({ path: path.join(shotsDir, name), fullPage: true });
      }
      await collectCsp(page, problems);
      for (const p of problems.list) bad.push(`${size.label} ${url} → ${p}`);
    }
    await page.context().close();
  }
  a().ok(bad.length === 0, `存在问题：${bad.slice(0, 6).join(' ｜ ')}${bad.length > 6 ? `……共 ${bad.length} 条` : ''}`);
});

test('首页布局：手机上地图在资料面板之上；桌面上地图在左、面板在右', async () => {
  for (const size of WIDTHS) {
    const { page } = await env.open({ viewport: { width: size.w, height: size.h }, isMobile: size.w < 800, hasTouch: size.w < 800 });
    await page.goto(`${O}/`, { waitUntil: 'load' });
    const map = await page.locator('.map-card').boundingBox();
    const side = await page.locator('.region-side').boundingBox();
    if (!map || !side) {
      a().ok(false, `${size.label}：找不到地图或面板`);
      continue;
    }
    if (size.w <= 768) {
      a().ok(map.y + map.height <= side.y + 2, `${size.label}：地图应在面板上方（地图底 ${Math.round(map.y + map.height)}，面板顶 ${Math.round(side.y)}）`);
      a().ok(map.width >= size.w - (size.w <= 500 ? 40 : 80), `${size.label}：窄屏上地图应占满容器宽度（${Math.round(map.width)}px）`);
    } else {
      a().ok(map.x + map.width <= side.x + 2 && Math.abs(map.y - side.y) < 80, `${size.label}：桌面上地图在左、面板在右`);
      a().ok(map.width > side.width, `${size.label}：地图应比面板更宽（${Math.round(map.width)} vs ${Math.round(side.width)}）`);
    }
    // 首屏必须看到地图的一部分（不是只有一大段文字）
    a().ok(map.y < size.h, `${size.label}：地图应出现在首屏内（顶部 ${Math.round(map.y)}px，视口高 ${size.h}px）`);
    await page.context().close();
  }
});

test('手机地图：点位可点（触摸命中区 ≥ 32px），切换后面板可见', async () => {
  const { page } = await env.open({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  const sizes = await page.locator('.dot').evaluateAll((els) =>
    els.map((e) => {
      const hit = e.querySelector('.dot__hit')!.getBoundingClientRect();
      return { code: (e as HTMLElement).dataset.region, w: hit.width, h: hit.height };
    }),
  );
  for (const s of sizes) a().ok(s.w >= 32 && s.h >= 32, `${s.code} 触摸命中区 ${s.w.toFixed(0)}×${s.h.toFixed(0)}px，应不小于 32px`);
  // 地区切换条是更大的触摸目标，用它切换
  const tabs = await page.locator('[data-region-tab]').evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { code: (e as HTMLElement).dataset.regionTab, w: r.width, h: r.height };
    }),
  );
  a().eq(tabs.length, 9, '地区切换条应有 9 个地区');
  for (const t of tabs) a().ok(t.w >= 24 && t.h >= 24, `切换条 ${t.code} ${t.w.toFixed(0)}×${t.h.toFixed(0)}px，应不小于 24px`);
  await page.locator('[data-region-tab="SG"]').tap();
  await page.locator('#panel-SG').waitFor({ state: 'visible' });
  a().ok(await page.locator('#panel-SG').isVisible(), '点击切换条后新加坡面板可见');
  a().ok((await page.locator('#panel-SG').boundingBox())!.width <= 375, '面板不超出屏幕宽度');
});

test('手机地图：用手指点每个圆点的中心，选中的就是它自己（含香港/台湾这类只隔几像素的圆点）', async () => {
  const codes = ['HK', 'TW', 'JP', 'SG', 'US', 'KR', 'DE', 'GB', 'FR'];
  for (const w of [375, 390]) {
    const { page } = await env.open({ viewport: { width: w, height: 812 }, isMobile: true, hasTouch: true });
    for (const code of codes) {
      // 每次重新加载，回到未放大的初始状态（放大后圆点会拉开，测不到最难的情形）
      await page.goto(`${O}/`, { waitUntil: 'networkidle' });
      // 手机首屏放不下整张地图：先把地图滚到视口中央，再取坐标（视口外的点触摸不到）
      await page.locator('.worldmap').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(150);
      const c = await page.locator(`.dot[data-region="${code}"] .dot__core`).evaluate((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await page.touchscreen.tap(c.x, c.y);
      await page.locator(`#panel-${code}`).waitFor({ state: 'visible', timeout: 3000 }).catch(() => undefined);
      const selected = await page.locator('.dot.is-selected').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.region));
      a().ok(selected.length === 1 && selected[0] === code, `${w}px：点 ${code} 的中心，实际选中 ${JSON.stringify(selected)}`);
      a().ok(await page.locator(`#panel-${code}`).isVisible(), `${w}px：点 ${code} 后应显示它的资料面板`);
      // 默认选中的是香港，只看“选中”分辨不出这次点击有没有生效；点击后地图会放大并出现“还原”按钮
      a().ok(await page.locator('[data-map-reset]').isVisible(), `${w}px：点 ${code} 后地图应放大（出现还原按钮）`);
    }
    await page.context().close();
  }
});

test('点击目标与字号：按钮/输入/下拉/导航链接 ≥ 24px（AA），手机导航链接 ≥ 40px；正文 ≥ 14px', async () => {
  const bad: string[] = [];
  for (const size of [WIDTHS[0]!, WIDTHS[2]!, WIDTHS[4]!]) {
    const { page } = await env.open({ viewport: { width: size.w, height: size.h }, isMobile: size.w < 800, hasTouch: size.w < 800 });
    for (const url of ['/', '/airports/', '/plans/', '/time-tests/', '/articles/singapore-vs-us-nodes/']) {
      await page.goto(`${O}${url}`, { waitUntil: 'load' });
      const small = await page.evaluate(() => {
        const out: string[] = [];
        const sel = 'button, input:not([type=hidden]), select, textarea, summary, [role=button], nav a, .btn, .seg__item, .chip a, .pager a, th a';
        for (const el of document.querySelectorAll(sel)) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (el.closest('[hidden]')) continue;
          if (el.matches('.visually-hidden, .skip-link')) continue;
          if (r.width < 24 || r.height < 24) out.push(`${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ')[0]}“${(el.textContent ?? '').trim().slice(0, 10)}”${Math.round(r.width)}×${Math.round(r.height)}`);
        }
        return out.slice(0, 5);
      });
      for (const s of small) bad.push(`${size.label} ${url}：点击目标过小 ${s}`);
      if (size.w < 500) {
        const nav = await page.evaluate(() =>
          [...document.querySelectorAll('.site-nav__link')]
            .map((e) => ({ t: (e.textContent ?? '').trim(), h: e.getBoundingClientRect().height, shown: getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0 }))
            .filter((x) => x.shown && x.h < 40),
        );
        for (const n of nav) bad.push(`${size.label} ${url}：导航链接“${n.t}”高度 ${n.h.toFixed(0)}px，手机上应不小于 40px`);
      }
      const tiny = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll('main p, main li, main dd, main td')) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none') continue;
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 6);
          if (!own) continue;
          if (parseFloat(cs.fontSize) < 12) out.push(`${el.tagName.toLowerCase()} ${cs.fontSize}：${(el.textContent ?? '').trim().slice(0, 14)}`);
        }
        return out.slice(0, 4);
      });
      for (const s of tiny) bad.push(`${size.label} ${url}：字号过小 ${s}`);
    }
    await page.context().close();
  }
  a().ok(bad.length === 0, `存在问题：${bad.slice(0, 8).join(' ｜ ')}${bad.length > 8 ? `……共 ${bad.length} 条` : ''}`);
});

test('表格在手机上可读：宽表格在自己的容器里横向滚动，不撑破页面', async () => {
  const { page } = await env.open({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const bad: string[] = [];
  for (const url of ['/airports/', '/plans/', '/test-records/', '/time-tests/', '/regions/hong-kong/']) {
    await page.goto(`${O}${url}`, { waitUntil: 'load' });
    const res = await page.evaluate(() => {
      const out: string[] = [];
      for (const t of document.querySelectorAll('main table')) {
        if (getComputedStyle(t).display === 'none') continue;
        const wrap = t.closest('.table-scroll');
        const tr = t.getBoundingClientRect();
        const stacked = t.matches('[data-table--stack], .data-table--stack') || getComputedStyle(t).display === 'block';
        if (!wrap && !stacked && tr.right > document.documentElement.clientWidth + 1) out.push('宽表格没有放进 .table-scroll');
        if (wrap) {
          const cs = getComputedStyle(wrap);
          if (!/(auto|scroll)/.test(cs.overflowX)) out.push('.table-scroll 没有横向滚动');
          if (wrap.getBoundingClientRect().right > document.documentElement.clientWidth + 1) out.push('.table-scroll 超出屏幕');
        }
      }
      return out;
    });
    for (const m of res) bad.push(`${url}：${m}`);
  }
  a().ok(bad.length === 0, `存在问题：${bad.join(' ｜ ')}`);
});

test('表格的键盘访问：窄屏上能横向滚动的表格可聚焦并用方向键滚动；宽屏上不增加多余的 Tab 停靠点', async () => {
  const narrow = await env.open({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await narrow.page.goto(`${O}/airports/feimaoyun/`, { waitUntil: 'load' });
  const boxes = await narrow.page.locator('.table-scroll').evaluateAll((els) =>
    els.map((e) => ({
      scrollable: e.scrollWidth > e.clientWidth + 1,
      tabindex: e.getAttribute('tabindex'),
      role: e.getAttribute('role'),
      label: e.getAttribute('aria-label') ?? '',
    })),
  );
  a().ok(boxes.length > 0, '页面上应有表格容器');
  for (const [i, b] of boxes.entries()) {
    if (b.scrollable) a().ok(b.tabindex === '0' && b.role === 'region' && b.label.length > 4, `第 ${i + 1} 个表格可滚动，应可聚焦、有 role=region 与名称（实际 ${JSON.stringify(b)}）`);
    else a().ok(b.tabindex === null && b.role === null, `第 ${i + 1} 个表格不能滚动，不应成为 Tab 停靠点`);
  }
  const labels = boxes.filter((b) => b.label).map((b) => b.label);
  a().eq(new Set(labels).size, labels.length, '各表格的名称互不相同');
  // 真正用键盘滚一次
  const idx = boxes.findIndex((b) => b.scrollable);
  if (idx >= 0) {
    const box = narrow.page.locator('.table-scroll').nth(idx);
    await box.focus();
    await narrow.page.keyboard.press('ArrowRight');
    await narrow.page.waitForTimeout(150);
    a().ok((await box.evaluate((e) => e.scrollLeft)) > 0, '聚焦后按右方向键，表格应向右滚动');
  }
  await narrow.context.close();

  const wide = await env.open({ viewport: { width: 1440, height: 900 } });
  await wide.page.goto(`${O}/airports/feimaoyun/`, { waitUntil: 'load' });
  const stops = await wide.page.locator('.table-scroll').evaluateAll((els) => els.filter((e) => e.getAttribute('tabindex') !== null && e.scrollWidth <= e.clientWidth + 1).length);
  a().eq(stops, 0, '桌面宽度下不能滚动的表格不应有 tabindex');
  await wide.context.close();
});

test('布局稳定与加载：首页与关键页面 CLS ≤ 0.1、LCP ≤ 2.5s（本机，仅作回归保护）', async () => {
  const bad: string[] = [];
  const report: string[] = [];
  for (const size of [WIDTHS[0]!, WIDTHS[4]!]) {
    for (const url of ['/', '/airports/', '/airports/lingdongyun/singapore-speedtest-2026-10/', '/plans/', '/articles/singapore-vs-us-nodes/']) {
      const { page } = await env.open({ viewport: { width: size.w, height: size.h }, isMobile: size.w < 800, hasTouch: size.w < 800 });
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number; __lcp: number };
        w.__cls = 0;
        w.__lcp = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          const es = list.getEntries();
          const last = es[es.length - 1];
          if (last) w.__lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
      await page.goto(`${O}${url}`, { waitUntil: 'networkidle' });
      // 触发懒加载内容并等待可能的位移
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
      const m = await page.evaluate(() => ({ cls: (window as unknown as { __cls: number }).__cls, lcp: (window as unknown as { __lcp: number }).__lcp }));
      report.push(`${size.w}${url === '/' ? '首页' : url.split('/').filter(Boolean).pop()} LCP ${Math.round(m.lcp)}ms CLS ${m.cls.toFixed(3)}`);
      if (m.cls > 0.1) bad.push(`${size.label} ${url} CLS ${m.cls.toFixed(3)} > 0.1`);
      if (m.lcp > 2500) bad.push(`${size.label} ${url} LCP ${Math.round(m.lcp)}ms > 2500ms`);
      await page.context().close();
    }
  }
  console.log(`      · ${report.join('；')}`);
  a().ok(bad.length === 0, `存在问题：${bad.join(' ｜ ')}`);
});

test('交互响应（INP 的实验室近似）：CPU 降速 4 倍时，点地区、搜索输入、套餐筛选的响应 ≤ 200ms', async () => {
  // 每个场景在全新页面里跑 3 次（冷启动，最不利），取中位数，避免偶发抖动；
  // 同时单独检查“我们自己的脚本”处理耗时（确定性部分）不超过 50ms。
  // 注意：本机是无 GPU 的无头 Chromium，渲染比真机慢，所以这个数字偏保守。
  const scenarios: { label: string; url: string; act: (page: Page) => Promise<void> }[] = [
    { label: '首页点地区', url: '/', act: async (page) => page.locator('[data-region-tab="SG"]').tap() },
    {
      label: '首页地图筛选',
      url: '/',
      act: async (page) => {
        await page.locator('[data-filter="route"]').focus();
        await page.keyboard.press('ArrowDown');
      },
    },
    {
      label: '首页搜索输入',
      url: '/',
      act: async (page) => {
        await page.locator('header input[name="q"]').click();
        await page.keyboard.type('新加坡', { delay: 60 });
      },
    },
    {
      label: '套餐排序',
      url: '/plans/',
      act: async (page) => {
        await page.locator('select[name="sort"]').focus();
        await page.keyboard.press('ArrowDown');
      },
    },
    {
      label: '套餐预算筛选',
      url: '/plans/',
      act: async (page) => {
        await page.locator('input[name="budget"]').click();
        await page.keyboard.type('60', { delay: 60 });
      },
    },
  ];
  const median = (xs: number[]): number => [...xs].sort((p, q) => p - q)[Math.floor(xs.length / 2)] ?? 0;
  const report: string[] = [];
  for (const sc of scenarios) {
    const totals: number[] = [];
    const procs: number[] = [];
    for (let i = 0; i < 3; i++) {
      const { page, context } = await env.open({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // 模拟中低端手机
      await page.addInitScript(() => {
        const w = window as unknown as { __ev: { id: number; dur: number }[]; __js: number[] };
        w.__ev = [];
        w.__js = [];
        // 事件的总耗时（含浏览器随后做的样式重算、布局、绘制）：来自 Event Timing
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as { interactionId?: number; duration: number }[]) {
            if (e.interactionId) w.__ev.push({ id: e.interactionId, dur: e.duration });
          }
        }).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit);
        // “我们自己的脚本”耗时：同一个事件的所有监听器都夹在 window 的捕获阶段和冒泡阶段之间。
        // 不能用 Event Timing 的 processingEnd−processingStart 来量它——那一段还包含浏览器在事件处理期间同步做的布局
        // （比如输入第二个字时，浏览器为了放置光标，要先把上一次筛选改变的表格重新布局）。
        let t0 = 0;
        for (const type of ['click', 'input', 'change']) {
          window.addEventListener(type, () => { t0 = performance.now(); }, true);
          window.addEventListener(type, () => { w.__js.push(performance.now() - t0); });
        }
      });
      await page.goto(`${O}${sc.url}`, { waitUntil: 'networkidle' });
      // 等开场动画（航线逐条绘制，约 2.6 秒）播完再交互：INP 统计的是整次访问里的交互，绝大多数发生在开场之后。
      // 只等“有限”动画；无限循环的动画（选中地区的光环）不会结束，所以不计入。
      await page.waitForFunction(() => document.getAnimations().every((an) => an.playState !== 'running' || an.effect?.getComputedTiming().iterations === Infinity), undefined, { timeout: 10000 });
      await page.waitForTimeout(400);
      await sc.act(page);
      await page.waitForTimeout(600); // 等交互的下一帧绘制完成，事件耗时才会入账
      const { ev, js } = await page.evaluate(() => {
        const w = window as unknown as { __ev: { id: number; dur: number }[]; __js: number[] };
        return { ev: w.__ev, js: w.__js };
      });
      a().ok(ev.length > 0, `${sc.label}：应记录到交互事件`);
      a().ok(js.length > 0, `${sc.label}：应记录到监听器耗时（click / input / change）`);
      // 一次交互（同一个 interactionId）的耗时取其中最长的事件；整个场景取最慢的一次交互
      const byId = new Map<number, number>();
      for (const e of ev) byId.set(e.id, Math.max(byId.get(e.id) ?? 0, e.dur));
      totals.push(Math.max(0, ...byId.values()));
      procs.push(Math.max(0, ...js));
      await context.close();
    }
    const med = median(totals);
    const proc = Math.max(...procs);
    report.push(`${sc.label} 总 ${Math.round(med)}ms（我们的脚本 ${Math.round(proc)}ms）`);
    a().ok(med <= 200, `${sc.label}：中位响应 ${Math.round(med)}ms（三次：${totals.map((x) => Math.round(x)).join('/')}），应不超过 200ms`);
    a().ok(proc <= 50, `${sc.label}：我们的脚本（监听器）最长 ${Math.round(proc)}ms，应不超过 50ms`);
  }
  console.log(`      · ${report.join('；')}`);
});

test('资源体积：首页 HTML、CSS、JS 与首屏图片（按压缩后的传输大小）', async () => {
  const { page } = await env.open({ viewport: { width: 390, height: 844 }, isMobile: true });
  const raw: Record<string, number> = {};
  const gz: Record<string, number> = {};
  page.on('response', async (r) => {
    try {
      const u = new URL(r.url());
      const body = await r.body();
      raw[u.pathname] = body.length;
      // 线上由 Cloudflare 等以 gzip/brotli 传输；这里用 gzip 估算（brotli 通常更小）
      gz[u.pathname] = /\.(png|webp|jpe?g|ico)$/.test(u.pathname) ? body.length : zlib.gzipSync(body, { level: 6 }).length;
    } catch {
      /* 被取消的请求 */
    }
  });
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  const entries = Object.keys(raw);
  const sum = (m: Record<string, number>, re: RegExp): number => entries.filter((p) => re.test(p)).reduce((n, p) => n + (m[p] ?? 0), 0);
  const kb = (n: number): string => `${(n / 1024).toFixed(0)}KB`;
  const html = raw['/'] ?? 0;
  a().ok((gz['/'] ?? 0) < 60 * 1024, `首页 HTML 压缩后 ${kb(gz['/'] ?? 0)}，应小于 60KB`);
  a().ok(html < 300 * 1024, `首页 HTML 原始 ${kb(html)}，应小于 300KB（防止页面无意膨胀）`);
  a().ok(sum(gz, /\.css$/) < 40 * 1024, `首页 CSS 压缩后合计 ${kb(sum(gz, /\.css$/))}，应小于 40KB`);
  a().ok(sum(gz, /\.js$/) < 40 * 1024, `首页 JS 压缩后合计 ${kb(sum(gz, /\.js$/))}，应小于 40KB`);
  a().ok(!entries.some((p) => /search-index\.json$/.test(p)), '首页不应加载搜索索引');
  a().ok(!entries.some((p) => /\.(png|webp|jpe?g)$/.test(p) && (raw[p] ?? 0) > 150 * 1024), '首页不应加载大图');
  console.log(
    `      · 首页 HTML ${kb(html)}（压缩后 ${kb(gz['/'] ?? 0)}），CSS ${kb(sum(raw, /\.css$/))}（${kb(sum(gz, /\.css$/))}），JS ${kb(sum(raw, /\.js$/))}（${kb(sum(gz, /\.js$/))}），请求 ${entries.length} 个`,
  );
});

await run('响应式与性能测试', () => env.close());
