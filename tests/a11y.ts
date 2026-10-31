/**
 * 无障碍自动检查（axe-core + Chromium，需先 npm run build）。
 *
 * 范围：dist/ 里的每一个页面（含 404）在桌面宽度下各扫一遍；关键页面再在手机宽度下扫一遍；
 * 首页另外扫三种“操作之后”的状态：选中新加坡（橙色选中态）、搜索下拉打开、移动端地区切换。
 *
 * 规则：WCAG 2.0 / 2.1 / 2.2 的 A、AA 规则全部必须通过（颜色对比度也在其中，在真实渲染下计算）；
 * axe 的 best-practice 规则只作为提示列出，不让测试失败。
 *
 * 说明：自动检查只能发现一部分无障碍问题（官方估计约三成），不等于完整的人工审查；
 * 键盘操作、读屏朗读顺序等见 tests/e2e.ts 与 docs/ACCEPTANCE_REPORT.md 的“人工检查项”。
 */
import { createRequire } from 'node:module';
import type { Page } from 'playwright';
import { pages, requireDist } from '../scripts/lib/dist';
import { a, run, setup, test } from './lib/harness';

requireDist();
const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core/axe.min.js');

const env = await setup();
const O = env.server.origin;

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface Hit {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: unknown[]; html: string; summary: string }[];
}

/** 在页面里运行 axe，返回违规规则（A/AA）与 best-practice 提示 */
async function scan(page: Page): Promise<{ violations: Hit[]; hints: Hit[] }> {
  const res = await page.evaluate(async (tags) => {
    const axe = (window as unknown as { axe: { run: (ctx: unknown, opts: unknown) => Promise<{ violations: Hit[] }> } }).axe;
    const wcag = await axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
    const best = await axe.run(document, { runOnly: { type: 'tag', values: ['best-practice'] }, resultTypes: ['violations'] });
    const slim = (v: Hit) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 4).map((n) => ({ target: n.target, html: n.html.slice(0, 140), summary: String((n as unknown as { failureSummary?: string }).failureSummary ?? '').slice(0, 220) })),
    });
    return { violations: wcag.violations.map(slim), hints: best.violations.map(slim) };
  }, WCAG_TAGS);
  return res as { violations: Hit[]; hints: Hit[] };
}

const describe = (where: string, v: Hit): string => {
  const n = v.nodes[0];
  return `${where}：${v.id}（${v.impact}）${v.help}｜${n ? `${JSON.stringify(n.target)} ${n.html}｜${n.summary.replace(/\s+/g, ' ')}` : ''}`;
};

const allHints = new Map<string, { help: string; where: Set<string> }>();
const noteHints = (where: string, hints: Hit[]): void => {
  for (const h of hints) {
    const cur = allHints.get(h.id) ?? { help: h.help, where: new Set<string>() };
    cur.where.add(where);
    allHints.set(h.id, cur);
  }
};

async function openPage(width: number, height: number) {
  const o = await env.open({ viewport: { width, height }, isMobile: width < 800, hasTouch: width < 800 });
  await o.context.addInitScript({ path: AXE });
  return o;
}

test('桌面 1280：每个页面都通过 axe 的 WCAG A/AA 规则', async () => {
  const { page, context } = await openPage(1280, 900);
  const bad: string[] = [];
  const list = pages().map((p) => p.urlPath);
  for (const url of list) {
    await page.goto(`${O}${url}`, { waitUntil: 'load' });
    const { violations, hints } = await scan(page);
    a().ok(true, url);
    noteHints(url, hints);
    for (const v of violations) bad.push(describe(url, v));
  }
  a().ok(bad.length === 0, `共 ${bad.length} 处违规：\n        ${bad.slice(0, 10).join('\n        ')}`);
  console.log(`      · 扫描 ${list.length} 个页面`);
  await context.close();
});

test('手机 375：关键页面通过 axe 的 WCAG A/AA 规则', async () => {
  const { page, context } = await openPage(375, 812);
  const bad: string[] = [];
  const list = ['/', '/airports/', '/airports/lingdongyun/', '/airports/lingdongyun/singapore-speedtest-2026-10/', '/airports/feimaoyun/', '/regions/', '/regions/singapore/', '/routes/', '/time-tests/', '/test-records/', '/plans/', '/guides/', '/articles/', '/articles/singapore-vs-us-nodes/', '/testing-methodology/', '/sources/', '/about/', '/search/?q=新加坡', '/404.html'];
  for (const url of list) {
    await page.goto(`${O}${url}`, { waitUntil: 'load' });
    const { violations, hints } = await scan(page);
    a().ok(true, url);
    noteHints(`375 ${url}`, hints);
    for (const v of violations) bad.push(describe(`375 ${url}`, v));
  }
  a().ok(bad.length === 0, `共 ${bad.length} 处违规：\n        ${bad.slice(0, 10).join('\n        ')}`);
  await context.close();
});

test('首页的操作状态：选中新加坡、展开筛选、搜索下拉打开，仍通过 A/AA 规则', async () => {
  const { page, context } = await openPage(1280, 900);
  const bad: string[] = [];
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });

  await page.locator('[data-region-tab="SG"]').click();
  await page.locator('#panel-SG').waitFor({ state: 'visible' });
  await page.waitForTimeout(900); // 等放大动画结束
  let r = await scan(page);
  for (const v of r.violations) bad.push(describe('首页·选中新加坡', v));

  await page.locator('[data-filter="route"]').selectOption({ index: 1 });
  await page.waitForTimeout(100);
  r = await scan(page);
  for (const v of r.violations) bad.push(describe('首页·路线筛选', v));

  const input = page.locator('header input[type="search"], header input[name="q"]').first();
  await input.click();
  await input.fill('新加坡');
  await page.locator('[role="listbox"], [data-search-results]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
  r = await scan(page);
  for (const v of r.violations) bad.push(describe('首页·搜索下拉', v));

  a().ok(bad.length === 0, `共 ${bad.length} 处违规：\n        ${bad.slice(0, 10).join('\n        ')}`);
  await context.close();

  // 手机上选中状态（地图放大、面板在地图下方）
  const m = await openPage(375, 812);
  await m.page.goto(`${O}/`, { waitUntil: 'networkidle' });
  await m.page.locator('[data-region-tab="US"]').tap();
  await m.page.waitForTimeout(900);
  r = await scan(m.page);
  const bad2 = r.violations.map((v) => describe('手机首页·选中美国', v));
  a().ok(bad2.length === 0, `共 ${bad2.length} 处违规：\n        ${bad2.slice(0, 6).join('\n        ')}`);
  await m.context.close();
});

await run('无障碍自动检查（axe-core）', async () => {
  if (allHints.size > 0) {
    console.log('\n  axe best-practice 提示（不影响通过与否）：');
    for (const [id, h] of allHints) console.log(`   · ${id}：${h.help}（${h.where.size} 个页面，如 ${[...h.where].slice(0, 2).join('、')}）`);
  } else {
    console.log('\n  axe best-practice：无提示');
  }
  await env.close();
});
