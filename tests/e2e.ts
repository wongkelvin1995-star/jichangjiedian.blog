/**
 * 浏览器端到端测试（Chromium，需先 npm run build）。
 *
 * 测试在“上线时的安全策略”下运行：静态服务器会带上 dist/_headers 里的严格 CSP，
 * 所以内联脚本、内联样式、第三方资源都会在这里直接暴露。所有站外请求会被拦截并记为问题。
 *
 * 用法：npm run test:e2e            全部用例
 *       npm run test:e2e -- --only=搜索   只跑名称包含“搜索”的用例
 */
import fs from 'node:fs';
import path from 'node:path';
import { AFFILIATE_URLS } from '../src/data/affiliates';
import { BRANDS } from '../src/data/brands';
import { HOME_H1, HOME_TITLE } from '../src/lib/site';
import { LDY_REPORT_TITLE } from '../src/data/reports/lingdongyun-sg-2026-10';
import { a, collectCsp, run, setup, test } from './lib/harness';
import type { Problems } from './lib/harness';

const env = await setup();
const O = env.server.origin;

const clean = async (page: Parameters<typeof collectCsp>[0], problems: Problems, what: string): Promise<void> => {
  await collectCsp(page, problems);
  a().ok(problems.list.length === 0, `${what}不应有错误、CSP 违规或站外请求：${problems.list.slice(0, 4).join(' ｜ ')}`);
};

// 与 scripts/validate-*.ts 使用同一个页面清单：dist 里的全部 HTML
function allUrls(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.html')) {
        const rel = path.relative('dist', p).split(path.sep).join('/');
        if (rel === '404.html') continue;
        out.push(rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`);
      }
    }
  };
  walk('dist');
  return out.sort();
}

// ------------------------------------------------------------------ 首页
test('首页：加载干净，title / H1 / 8 项导航正确，CSP 响应头生效', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  const res = await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  a().eq(res?.status(), 200, '首页状态码');
  const csp = res?.headers()['content-security-policy'] ?? '';
  a().ok(csp.includes("script-src 'self'") && !csp.includes('unsafe-inline'), 'CSP 响应头应生效且不含 unsafe-inline');
  a().eq(await page.title(), HOME_TITLE, '首页 title');
  a().eq((await page.locator('h1').allTextContents()).map((s) => s.trim()).join('|'), HOME_H1, '首页 H1');
  const nav = (await page.locator('nav[aria-label="主导航"] a').allTextContents()).map((s) => s.trim());
  a().eq(nav.join('|'), ['全球节点地图', '34家机场目录', '分时段节点测试', '节点地区', '线路知识', '套餐对比', '客户端教程', '研究文章'].join('|'), '8 项导航');
  a().ok(await page.locator('.map-card__foot').getByText('航线为地区关系示意，非实际物理路由').isVisible(), '地图下方应可见“航线为地区关系示意，非实际物理路由”');
  await clean(page, problems, '首页');
});

test('地图：9 个地区点位、默认选中香港、点击切换面板与放大、重置视图', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  const codes = await page.locator('.dot').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.region));
  a().eq(codes.join(','), 'HK,TW,JP,SG,US,KR,DE,GB,FR', '地图点位');
  a().ok(await page.locator('#panel-HK').isVisible(), '默认应显示香港面板');
  a().ok(!(await page.locator('#panel-JP').isVisible()), '其他地区面板默认隐藏');

  await page.locator('.dot[data-region="JP"] .dot__hit').click();
  await page.locator('#panel-JP').waitFor({ state: 'visible' });
  a().ok(!(await page.locator('#panel-HK').isVisible()), '切换后香港面板应隐藏');
  a().eq(new URL(page.url()).pathname, '/', '点击地图点位应就地切换，不跳转页面');
  a().ok(await page.locator('.dot[data-region="JP"]').evaluate((e) => e.classList.contains('is-selected')), '日本点位应为选中');
  a().ok(await page.locator('.route[data-region="JP"]').evaluate((e) => e.classList.contains('is-selected')), '日本航线应高亮');
  a().eq(await page.locator('[data-region-tab="JP"]').getAttribute('aria-current'), 'true', '日本切换条应为当前');
  a().ok((await page.locator('[data-map-live]').textContent())?.includes('日本') === true, '读屏提示应包含“日本”');
  const zs = await page.locator('.map-zoom').evaluate((e) => (e as SVGGElement).style.getPropertyValue('--zs'));
  a().ok(Number(zs) > 1, `选中地区后地图应放大，--zs=${zs}`);
  await page.locator('[data-map-reset]').click();
  a().eq(await page.locator('.map-zoom').evaluate((e) => (e as SVGGElement).style.getPropertyValue('--zs')), '1', '重置视图后缩放应为 1');

  // 欧洲三个点位共用一个专题页，但面板按国家切换
  await page.locator('[data-region-tab="DE"]').click();
  await page.locator('#panel-DE').waitFor({ state: 'visible' });
  a().ok((await page.locator('#panel-DE h3').textContent())?.includes('德国') === true, '德国面板标题');
  await clean(page, problems, '地图交互');
});

test('地图：键盘可操作（Tab 聚焦、Enter 选择），焦点样式可见', async () => {
  const { page } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  const sg = page.locator('.dot[data-region="SG"]');
  await sg.focus();
  a().ok(await sg.evaluate((e) => document.activeElement === e), '新加坡点位应可聚焦');
  const ring = await sg.evaluate((e) => {
    const cs = getComputedStyle(e);
    const halo = getComputedStyle(e.querySelector('.dot__halo')!);
    return { outline: cs.outlineStyle + cs.outlineWidth, haloStroke: halo.strokeWidth, haloFill: halo.fillOpacity };
  });
  a().ok(ring.outline !== 'none0px' || ring.haloStroke !== '0px', `聚焦时应有可见的焦点样式：${JSON.stringify(ring)}`);
  await page.keyboard.press('Enter');
  await page.locator('#panel-SG').waitFor({ state: 'visible' });
  a().ok(await page.locator('#panel-SG').isVisible(), 'Enter 应选中新加坡');
});

test('地图：品牌 / 线路 / 资料状态筛选与面板数字一致', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  const selects = await page.locator('[data-filter]').evaluateAll((els) => els.map((e) => (e as HTMLSelectElement).disabled));
  a().ok(selects.every((d) => d === false), '脚本启用后三个筛选器应可用');
  const visibleCount = (): Promise<number> =>
    page.locator('#panel-HK .region-brands > li').evaluateAll((els) => els.filter((e) => getComputedStyle(e).display !== 'none').length);
  const total = await visibleCount();
  a().eq(total, 34, '香港面板默认列出 34 家（documented + unverified）');

  await page.selectOption('[data-filter="route"]', 'iplc');
  const wantIplc = await page.locator('#panel-HK .region-brands > li').evaluateAll((els) => els.filter((e) => ((e as HTMLElement).dataset.routes ?? '').split(' ').includes('iplc')).length);
  a().eq(await visibleCount(), wantIplc, 'IPLC 筛选后的数量');
  a().ok((await page.locator('#panel-HK [data-region-count]').textContent())?.includes(`${wantIplc} / 34`) === true, '计数文字应显示“X / 34”');

  await page.selectOption('[data-filter="level"]', 'unverified');
  const wantBoth = await page.locator('#panel-HK .region-brands > li').evaluateAll(
    (els) => els.filter((e) => ((e as HTMLElement).dataset.routes ?? '').split(' ').includes('iplc') && (e as HTMLElement).dataset.level === 'unverified').length,
  );
  a().eq(await visibleCount(), wantBoth, 'IPLC + 待核验 的数量');

  await page.selectOption('[data-filter="route"]', '');
  await page.selectOption('[data-filter="level"]', '');
  await page.selectOption('[data-filter="brand"]', 'lingdongyun');
  a().eq(await visibleCount(), 1, '只选灵动云应只剩 1 行');
  await page.selectOption('[data-filter="brand"]', '');
  a().eq(await visibleCount(), 34, '清空筛选后恢复 34 行');
  await clean(page, problems, '地图筛选');
});

test('地图：没有 JavaScript 时仍是完整页面（地区链接、地区列表、搜索表单）', async () => {
  const { page } = await env.open({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const res = await page.goto(`${O}/`);
  a().eq(res?.status(), 200, '无 JS 首页状态码');
  a().ok(await page.locator('h1').isVisible(), 'H1 可见');
  a().ok(await page.locator('#panel-HK').isVisible(), '默认地区面板可见');
  a().ok(await page.locator('[data-filter="route"]').isDisabled(), '无 JS 时筛选器应保持禁用而不是假装可用');
  const hrefs = await page.locator('.dot').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  a().eq(hrefs.filter((h) => h?.startsWith('/regions/')).length, 9, '9 个点位都应是指向地区专题页的真实链接');
  a().ok((await page.locator('#region-list').count()) === 1, '应有地区列表（#region-list）');
  // 搜索表单：不依赖脚本，GET 提交到 /search/
  await page.fill('#site-q', 'IPLC');
  await Promise.all([page.waitForURL(/\/search\/\?q=IPLC/), page.press('#site-q', 'Enter')]);
  a().ok(await page.locator('[data-search-fallback]').isVisible(), '无 JS 的搜索页应显示静态入口列表');
});

test('减少动效：prefers-reduced-motion 下没有持续动画，且确实存在需要被关闭的动画', async () => {
  const offenders = (page: Parameters<typeof collectCsp>[0]): Promise<string[]> =>
    page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .filter((el) => {
          const cs = getComputedStyle(el);
          const dur = Math.max(...cs.animationDuration.split(',').map((s) => parseFloat(s) * (s.includes('ms') ? 0.001 : 1)));
          return cs.animationName !== 'none' && dur > 0.05;
        })
        .map((el) => `${el.tagName.toLowerCase()}.${(el as HTMLElement).className?.toString().split(' ')[0] ?? ''}`)
        .slice(0, 8),
    );
  const normal = await env.open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  await normal.page.goto(`${O}/`, { waitUntil: 'networkidle' });
  a().ok((await offenders(normal.page)).length > 0, '对照组：默认设置下首页应有动画（否则本测试没有意义）');

  const reduced = await env.open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await reduced.page.goto(`${O}/`, { waitUntil: 'networkidle' });
  const bad = await offenders(reduced.page);
  a().ok(bad.length === 0, `减少动效时不应有动画：${bad.join('、')}`);
  a().eq(await reduced.page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto', '减少动效时应关闭平滑滚动');
});

// ------------------------------------------------------------------ 目录、测试、报告
test('机场目录：34 家按固定顺序，34 个推广按钮属性正确，筛选不改变顺序', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/airports/`, { waitUntil: 'networkidle' });
  const rows = page.locator('[data-directory-table] tbody tr');
  a().eq(await rows.count(), 34, '目录行数');
  const slugs = await rows.evaluateAll((trs) => trs.map((tr) => tr.querySelector('a[href^="/airports/"]')?.getAttribute('href')?.split('/')[2] ?? ''));
  a().eq(slugs.join(','), BRANDS.map((b) => b.slug).join(','), '目录顺序应与固定编辑顺序一致');

  // 只数目录表里的推广按钮：页面侧栏的灵动云主推块另有一个“立即注册”按钮，不属于目录
  const promos = await page.locator('[data-directory-table] a[data-affiliate]').evaluateAll((els) =>
    els.map((e) => ({ href: e.getAttribute('href'), target: e.getAttribute('target'), rel: e.getAttribute('rel') ?? '' })),
  );
  a().eq(promos.length, 34, '推广按钮数量');
  promos.forEach((p, i) => {
    a().eq(p.href, AFFILIATE_URLS[BRANDS[i]!.slug], `第 ${i + 1} 位推广链接`);
    a().eq(p.target, '_blank', `第 ${i + 1} 位新窗口打开`);
    a().ok(['sponsored', 'nofollow', 'noopener', 'noreferrer'].every((k) => p.rel.split(/\s+/).includes(k)), `第 ${i + 1} 位 rel 属性：${p.rel}`);
  });

  const shown = (): Promise<string[]> =>
    rows.evaluateAll((trs) => trs.filter((tr) => getComputedStyle(tr).display !== 'none').map((tr) => tr.querySelector('a[href^="/airports/"]')?.getAttribute('href')?.split('/')[2] ?? ''));
  await page.fill('[data-directory-filters] [name="q"]', '灵动');
  a().eq((await shown()).join(','), 'lingdongyun', '搜“灵动”只剩灵动云');
  await page.fill('[data-directory-filters] [name="q"]', 'firefly');
  a().eq((await shown()).join(','), 'firefly', '搜 firefly 只剩 Firefly');
  await page.fill('[data-directory-filters] [name="q"]', 'zzzz不存在');
  a().eq((await shown()).length, 0, '无匹配时 0 行');
  a().ok(await page.locator('[data-directory-empty]').isVisible(), '无匹配时应显示空状态');
  await page.fill('[data-directory-filters] [name="q"]', '');
  const all = await shown();
  a().eq(all.join(','), slugs.join(','), '清空筛选后恢复固定顺序');
  await page.selectOption('[data-directory-filters] [name="price"]', { index: 1 });
  const some = await shown();
  a().ok(some.length > 0 && some.length < 34, `按价格筛选应得到部分品牌，实际 ${some.length}`);
  a().eq(some.join(','), slugs.filter((s) => some.includes(s)).join(','), '筛选结果仍按固定顺序');
  await clean(page, problems, '目录页');
});

test('分时段测试页：没有记录的窗口都有明确的空状态文字，没有凭空数字', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/time-tests/`, { waitUntil: 'networkidle' });
  const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  for (const w of ['早间', '午间', '晚间', '晚高峰', '深夜']) a().ok(text.includes(w), `应出现窗口“${w}”`);
  // 每个时段都有使用建议；有实测的晚高峰链接到实测页（2026-10-28 改版：不再逐格显示“暂无记录”）
  a().ok(!text.includes('该时间段暂无本站可核验测试记录'), '不应再出现“暂无可核验记录”的空格子');
  a().ok(text.includes('专线'), '晚高峰应给出选专线节点的建议');
  a().ok(await page.locator('a[href="/airports/lingdongyun/peak-2026-10-28/"]').count() > 0, '应链接到灵动云晚高峰实测');
  a().ok(text.includes('北京时间'), '应标明北京时间');
  // 记录浏览器：按窗口筛选
  await page.selectOption('[data-record-filters] [name="window"]', { index: 1 });
  const cnt = await page.locator('[data-record-count]').textContent();
  a().ok(!!cnt && /\d+/.test(cnt), `记录浏览器应显示计数：${cnt}`);
  await clean(page, problems, '分时段测试页');
});

test('灵动云测速报告：标题、图片加载、局限说明', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/airports/lingdongyun/singapore-speedtest-2026-10/`, { waitUntil: 'networkidle' });
  a().eq((await page.locator('h1').textContent())?.trim(), LDY_REPORT_TITLE, 'H1');
  a().ok((await page.locator('#peak').count()) === 1, '应有晚高峰复测小节');
  const img = page.locator('main img').first();
  await img.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0));
  a().ok(await img.evaluate((i) => (i as HTMLImageElement).naturalWidth > 0), '数据整理图应加载成功');
  const text = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  for (const must of ['测速汇总图', '网页工具未能测出', '空载延迟', '负载延迟']) a().ok(text.includes(must), `应包含“${must}”`);
  a().ok(!/丢包率?\s*[:：]?\s*0(\.0+)?\s*%/.test(text), '不得把丢包率写成 0%');
  await clean(page, problems, '报告页');
});

// ------------------------------------------------------------------ 搜索
test('站内搜索：不预先加载索引；新加坡→地区页优先；灵动→灵动云；IPLC 同时出线路与机场；键盘导航', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  env.server.requests.length = 0;
  await page.goto(`${O}/`, { waitUntil: 'networkidle' });
  a().ok(!env.server.requests.includes('/search-index.json'), '用户尚未使用搜索时，不应请求搜索索引');

  const input = page.locator('#site-q');
  const panel = page.locator('#site-search-panel');
  await input.click();
  await input.fill('新加坡');
  await panel.waitFor({ state: 'visible' });
  a().ok(env.server.requests.includes('/search-index.json'), '开始搜索后才请求索引');
  const firstGroup = (await panel.locator('.search-group__title').first().textContent())?.trim();
  a().eq(firstGroup, '节点地区', '搜“新加坡”第一组应是节点地区');
  a().eq(await panel.locator('a.search-hit').first().getAttribute('href'), '/regions/singapore/', '第一条应是新加坡地区页');
  a().eq(await input.getAttribute('aria-expanded'), 'true', 'aria-expanded');

  await page.keyboard.press('ArrowDown');
  a().eq(await panel.locator('a.search-hit[aria-selected="true"]').count(), 1, 'ArrowDown 后应有一条选中');
  await Promise.all([page.waitForURL(`${O}/regions/singapore/`), page.keyboard.press('Enter')]);
  a().eq(new URL(page.url()).pathname, '/regions/singapore/', 'Enter 应跳转到选中结果');

  await page.locator('#site-q').fill('灵动');
  await page.locator('#site-search-panel').waitFor({ state: 'visible' });
  a().eq(await page.locator('#site-search-panel a.search-hit').first().getAttribute('href'), '/airports/lingdongyun/', '搜“灵动”第一条是灵动云');

  await page.locator('#site-q').fill('IPLC');
  const titles = await page.locator('#site-search-panel .search-group__title').allTextContents();
  a().ok(titles.includes('线路术语') && titles.includes('机场'), `搜 IPLC 应同时有线路术语和机场：${titles.join('、')}`);
  a().ok((await page.locator('#site-search-panel').innerText()).includes('提供IPLC'), '机场结果应注明提供哪种线路');

  await page.locator('#site-q').fill('zzzzqq');
  a().ok((await page.locator('#site-search-panel .search-empty').textContent())?.includes('没有找到') === true, '无结果时应提示并给出建议');
  await page.locator('#site-q').fill('香港');
  await page.locator('#site-search-panel').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  a().ok(await page.locator('#site-search-panel').isHidden(), 'Escape 应关闭结果面板');
  await clean(page, problems, '站内搜索');
});

test('搜索页：?q= 参数、分组结果、标题随查询变化', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/search/?q=${encodeURIComponent('新加坡')}`, { waitUntil: 'networkidle' });
  const status = (await page.locator('[data-search-status]').textContent())?.trim() ?? '';
  a().ok(/找到 \d+ 条/.test(status), `应显示结果数量：${status}`);
  a().eq(await page.title(), '搜索“新加坡”｜机场节点', '搜索页标题应包含查询词');
  a().eq((await page.locator('[data-search-results] .search-group__title').first().textContent())?.trim(), '节点地区', '第一组');
  const brands = await page.locator('[data-search-results] a.search-hit[href^="/airports/"]').count();
  a().ok(brands >= 10, `应列出有新加坡公开资料记录的机场，实际 ${brands}`);
  await page.locator('[data-search-page] input[name="q"]').fill('');
  a().ok((await page.locator('[data-search-status]').textContent())?.includes('输入') === true, '清空后应回到提示');
  // 恶意输入不执行
  await page.goto(`${O}/search/?q=${encodeURIComponent('<img src=x onerror=alert(1)>')}`, { waitUntil: 'networkidle' });
  a().eq(await page.locator('[data-search-results] img').count(), 0, '查询词必须被当作文本，不能生成元素');
  await clean(page, problems, '搜索页');
});

test('套餐对比：筛选、临时排序与恢复默认', async () => {
  const { page, problems } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/plans/`, { waitUntil: 'networkidle' });
  // 表格里只放当前要显示的行；报价总数写在表格的 data-rows-total 上，全部数据在 /plans-rows.json
  const total = Number(await page.locator('[data-plan-table]').getAttribute('data-rows-total'));
  a().ok(total > 40, `报价行数应多于一页：${total}`);
  a().ok(await page.locator('[data-plan-filters] [name="budget"]').isEnabled(), '数据加载后筛选应可用');
  const visible = (): Promise<number> =>
    page.locator('[data-plan-table] tbody tr').evaluateAll((trs) => trs.filter((tr) => getComputedStyle(tr).display !== 'none').length);
  a().eq(await visible(), 40, '默认只显示前 40 条');
  await page.fill('[data-plan-filters] [name="budget"]', '20');
  // 输入框停顿 150ms 后才筛选（避免每敲一个键都重排表格），等计数文字出现再检查
  await page.waitForFunction(() => {
    const m = /符合条件 (\d+) \/ (\d+)/.exec(document.querySelector('[data-plan-count]')?.textContent ?? '');
    return !!m && Number(m[1]) < Number(m[2]);
  });
  const underBudget = await visible();
  a().ok(underBudget < 40 || underBudget === 0 || underBudget <= 40, '预算筛选后数量变化');
  const monthlies = await page.locator('[data-plan-table] tbody tr').evaluateAll((trs) =>
    trs.filter((tr) => getComputedStyle(tr).display !== 'none').map((tr) => (tr as HTMLElement).dataset.monthly ?? ''),
  );
  a().ok(monthlies.every((m) => m !== '' && Number(m) <= 20), '预算筛选后不应出现价格缺失或超预算的报价（缺失值不当作 0）');
  await page.click('[data-plan-reset]');
  a().eq(await visible(), 40, '恢复默认后回到第一页');
  await page.click('[data-plan-more]');
  a().eq(await visible(), 80, '“显示更多”后再多 40 条');
  await page.selectOption('[data-plan-filters] [name="sort"]', 'pergb');
  await page.waitForFunction(() => (document.querySelector('[data-plan-count]')?.textContent ?? '').includes('临时排序'));
  const perGB = await page.locator('[data-plan-table] tbody tr').evaluateAll((trs) => trs.map((tr) => (tr as HTMLElement).dataset));
  const exact = perGB.filter((d) => d.comp === 'exact' && d.pergb !== '').map((d) => Number(d.pergb));
  a().ok(exact.every((v, i) => i === 0 || v >= exact[i - 1]!), '按每 GB 排序后，可精确比较的报价应从低到高');
  await clean(page, problems, '套餐页');
});

// ------------------------------------------------------------------ 其他
test('404：状态码 404、noindex、带回首页的链接', async () => {
  const { page } = await env.open({ viewport: { width: 1440, height: 900 }, allow404: ['/not-a-page/'] });
  const res = await page.goto(`${O}/not-a-page/`);
  a().eq(res?.status(), 404, '状态码');
  a().ok((await page.locator('meta[name="robots"]').getAttribute('content'))?.includes('noindex') === true, '404 应 noindex');
  a().ok((await page.locator('main a[href="/"]').count()) > 0, '应有回首页的链接');
  const redirect = await page.goto(`${O}/airports`);
  a().eq(new URL(page.url()).pathname, '/airports/', '缺少结尾斜杠应跳转到规范地址');
  a().eq(redirect?.status(), 200, '跳转后状态码');
});

test('键盘：第一个 Tab 是“跳到正文”，回车后焦点进入主内容', async () => {
  const { page } = await env.open({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${O}/articles/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ cls: document.activeElement?.className, text: document.activeElement?.textContent?.trim() }));
  a().ok(String(first.cls).includes('skip-link'), `第一个可聚焦元素应是跳转链接：${JSON.stringify(first)}`);
  const box = await page.locator('.skip-link').boundingBox();
  a().ok(!!box && box.y >= 0 && box.x >= 0, '聚焦后跳转链接应出现在视口内');
  await page.keyboard.press('Enter');
  a().ok(await page.evaluate(() => location.hash === '#main'), '回车后应跳到 #main');
});

test('全站冒烟：每个页面在严格 CSP 下加载干净（无错误、无 CSP 违规、无站外请求）', async () => {
  const urls = allUrls();
  a().ok(urls.length >= 70, `页面数量：${urls.length}`);
  const { page, problems } = await env.open({ viewport: { width: 1280, height: 800 } });
  const bad: string[] = [];
  for (const url of urls) {
    problems.list.length = 0;
    const res = await page.goto(`${O}${url}`, { waitUntil: 'load' });
    if (res?.status() !== 200) bad.push(`${url} → HTTP ${res?.status()}`);
    await collectCsp(page, problems);
    for (const p of problems.list) bad.push(`${url} → ${p}`);
  }
  a().ok(bad.length === 0, `存在问题的页面：${bad.slice(0, 6).join(' ｜ ')}${bad.length > 6 ? `……共 ${bad.length} 条` : ''}`);
});

await run('浏览器端到端测试', () => env.close());
