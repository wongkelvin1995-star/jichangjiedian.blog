/**
 * SEO 校验（读取 dist/，需先 npm run build）。
 *
 * 逐页检查：唯一的 title / description / H1 / canonical、lang、robots、Open Graph、JSON-LD、标题层级、图片 alt；
 * 跨页检查：title / description / H1 不重复；sitemap 与页面的 index/noindex 状态完全一致；lastmod 真实且不晚于今天；
 * 首页：标题、描述、H1 与 8 项导航与总指令逐字一致；
 * 站点文件：robots.txt、sitemap.xml、OG 分享图、图标、IndexNow 密钥文件、_headers 都在 dist 里；
 * 文案：不出现“保证收录/保证排名/最好的机场”这类无法兑现的承诺，不出现模板残留（undefined、NaN、[object Object]、字面 **）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { HOME_DESCRIPTION, HOME_H1, HOME_TITLE, NAV_ITEMS } from '../src/lib/site';
import { DIST, SITE, pages, readSitemap, requireDist, textOf } from './lib/dist';
import type { Page } from './lib/dist';
import { Report } from './lib/report';

requireDist();
const r = new Report('SEO 校验');

const all = pages();
const todayCN = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const metaContent = (p: Page, sel: string): string | undefined => p.root.querySelector(sel)?.getAttribute('content') ?? undefined;
const isNoindex = (p: Page): boolean => /(^|,)\s*noindex\b/i.test(metaContent(p, 'meta[name="robots"]') ?? '');

type Ld = Record<string, unknown>;
function jsonLd(p: Page): Ld[] {
  const out: Ld[] = [];
  for (const s of p.root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const v = JSON.parse(s.text) as Ld | Ld[];
      for (const item of Array.isArray(v) ? v : [v]) {
        const graph = item['@graph'];
        if (Array.isArray(graph)) out.push(...(graph as Ld[]));
        else out.push(item);
      }
    } catch (e) {
      r.check(false, `${p.urlPath}：JSON-LD 不是合法 JSON（${(e as Error).message}）`);
    }
  }
  return out;
}
const typeOf = (x: Ld): string => String(x['@type'] ?? '');

// ------------------------------------------------------------------ 文章/教程 frontmatter（不能 import astro:content，直接读文件）
const fm = new Map<string, { published: string; modified: string; title: string; h1: string; description: string }>();
for (const kind of ['articles', 'guides'] as const) {
  const dir = path.resolve('src/content', kind);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md') || x.endsWith('.mdx'))) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const head = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const get = (k: string): string => head.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? '';
    fm.set(`/${kind}/${f.replace(/\.mdx?$/, '')}/`, { published: get('published'), modified: get('modified'), title: get('title'), h1: get('h1') || get('title'), description: get('description') });
  }
}

// ------------------------------------------------------------------ 逐页检查
const titles = new Map<string, string[]>();
const descs = new Map<string, string[]>();
const h1s = new Map<string, string[]>();
const push = (m: Map<string, string[]>, k: string, v: string): void => {
  m.set(k, [...(m.get(k) ?? []), v]);
};

for (const p of all) {
  const where = p.urlPath;
  const expectedCanonical = p.urlPath === '/404.html' ? `${SITE}/404.html` : `${SITE}${p.urlPath}`;

  // lang、charset、viewport
  r.check(p.root.querySelector('html')?.getAttribute('lang') === 'zh-CN', `${where}：<html lang> 应为 zh-CN`);
  r.check(!!p.root.querySelector('meta[charset]'), `${where}：缺少 meta charset`);
  r.check((metaContent(p, 'meta[name="viewport"]') ?? '').includes('width=device-width'), `${where}：缺少 viewport`);

  // 唯一的 title / description / canonical / robots
  const titleEls = p.root.querySelectorAll('head title'); // 页面里的 SVG 也可以有 <title>，这里只数 <head> 里的
  r.check(titleEls.length === 1, `${where}：应有且仅有一个 <title>，实际 ${titleEls.length}`);
  const title = titleEls[0]?.text.trim() ?? '';
  r.check(title.length >= 5 && title.length <= 60, `${where}：<title> 长度 ${title.length}，应在 5–60 字之间`);
  push(titles, title, where);

  const descEls = p.root.querySelectorAll('meta[name="description"]');
  r.check(descEls.length === 1, `${where}：应有且仅有一个 meta description，实际 ${descEls.length}`);
  const desc = descEls[0]?.getAttribute('content')?.trim() ?? '';
  r.check(desc.length >= 30 && desc.length <= 160, `${where}：description 长度 ${desc.length}，应在 30–160 字之间`);
  push(descs, desc, where);

  const canon = p.root.querySelectorAll('link[rel="canonical"]');
  r.check(canon.length === 1, `${where}：应有且仅有一个 canonical，实际 ${canon.length}`);
  r.check(canon[0]?.getAttribute('href') === expectedCanonical, `${where}：canonical 应为 ${expectedCanonical}`, `实际：${canon[0]?.getAttribute('href')}`);

  const robots = p.root.querySelectorAll('meta[name="robots"]');
  r.check(robots.length === 1, `${where}：应有且仅有一个 meta robots，实际 ${robots.length}`);

  // H1
  const h1 = p.root.querySelectorAll('h1');
  r.check(h1.length === 1, `${where}：应有且仅有一个 H1，实际 ${h1.length}`);
  const h1Text = (h1[0]?.text ?? '').replace(/\s+/g, ' ').trim();
  r.check(h1Text.length >= 4, `${where}：H1 为空或过短`);
  push(h1s, h1Text, where);

  // 标题层级不跳级（只看 main 里的标题）
  const main = p.root.querySelector('main');
  if (main) {
    let last = 1;
    for (const h of main.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      const level = Number(h.tagName.slice(1));
      r.check(level <= last + 1, `${where}：标题层级跳级（H${last} → H${level}）“${h.text.trim().slice(0, 24)}”`);
      r.check(h.text.trim().length > 0, `${where}：存在空标题`);
      last = level;
    }
  } else r.check(false, `${where}：缺少 <main>`);

  // Open Graph / Twitter
  for (const prop of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:locale', 'og:site_name']) {
    r.check(!!metaContent(p, `meta[property="${prop}"]`), `${where}：缺少 ${prop}`);
  }
  r.check(metaContent(p, 'meta[property="og:url"]') === expectedCanonical, `${where}：og:url 应与 canonical 一致`);
  r.check(metaContent(p, 'meta[property="og:title"]') === title, `${where}：og:title 应与 <title> 一致`);
  r.check(metaContent(p, 'meta[property="og:description"]') === desc, `${where}：og:description 应与 description 一致`);
  r.check(metaContent(p, 'meta[name="twitter:card"]') === 'summary_large_image', `${where}：缺少 twitter:card`);
  const ogImage = metaContent(p, 'meta[property="og:image"]') ?? '';
  r.check(ogImage.startsWith(`${SITE}/`) && fs.existsSync(path.join(DIST, ogImage.slice(SITE.length))), `${where}：og:image 必须是本站已存在的文件`, ogImage);

  // 图片：alt、尺寸
  for (const img of p.root.querySelectorAll('img')) {
    const src = img.getAttribute('src') ?? '';
    r.check(img.hasAttribute('alt'), `${where}：图片缺少 alt（${src}）`);
    const inMain = !!img.closest('main');
    if (inMain) {
      r.check((img.getAttribute('alt') ?? '').trim().length > 0, `${where}：正文图片的 alt 不能为空（${src}）`);
      r.check(img.hasAttribute('width') && img.hasAttribute('height'), `${where}：图片缺少 width/height，会造成版面跳动（${src}）`);
    }
  }
  // 链接要有可读的名称
  for (const a of p.root.querySelectorAll('a')) {
    const imgAlt = a.querySelector('img')?.getAttribute('alt') ?? '';
    const name = (a.text.replace(/\s+/g, '') || a.getAttribute('aria-label') || imgAlt || a.getAttribute('title') || '').trim();
    r.check(name.length > 0, `${where}：存在没有文字或 aria-label 的链接（${a.getAttribute('href')}）`);
  }

  // 面包屑结构化数据
  const ld = jsonLd(p);
  const crumbs = p.root.querySelector('nav[aria-label="面包屑"] ol, nav.breadcrumb ol');
  const crumbLd = ld.find((x) => typeOf(x) === 'BreadcrumbList');
  if (crumbs) {
    r.check(!!crumbLd, `${where}：页面有面包屑，但缺少 BreadcrumbList 结构化数据`);
    if (crumbLd) {
      const items = (crumbLd['itemListElement'] as Ld[]) ?? [];
      r.check(items.length === crumbs.querySelectorAll('li').length, `${where}：BreadcrumbList 条数与页面面包屑不一致`);
      r.check(items.every((it, i) => it['position'] === i + 1), `${where}：BreadcrumbList position 应连续`);
      r.check(items.at(-1)?.['item'] === expectedCanonical, `${where}：BreadcrumbList 最后一项应指向当前页`, String(items.at(-1)?.['item']));
    }
  }

  // 首页独有
  if (p.urlPath === '/') {
    r.check(ld.some((x) => typeOf(x) === 'Organization'), '/：缺少 Organization 结构化数据');
    r.check(ld.some((x) => typeOf(x) === 'WebSite'), '/：缺少 WebSite 结构化数据');
  }
  // 文章
  const post = fm.get(p.urlPath);
  if (post) {
    const art = ld.find((x) => typeOf(x) === 'Article');
    if (r.check(!!art, `${where}：文章缺少 Article 结构化数据`)) {
      r.check(String(art!['datePublished']).startsWith(post.published), `${where}：datePublished 应为 ${post.published}`);
      r.check(String(art!['dateModified']).startsWith(post.modified), `${where}：dateModified 应为 ${post.modified}`);
      r.check(art!['headline'] === post.h1, `${where}：Article.headline 应与文章 H1 一致`);
      r.check(art!['inLanguage'] === 'zh-CN', `${where}：Article.inLanguage 应为 zh-CN`);
    }
    r.check(metaContent(p, 'meta[property="og:type"]') === 'article', `${where}：文章页 og:type 应为 article`);
    r.check(metaContent(p, 'meta[property="article:published_time"]')?.startsWith(post.published) === true, `${where}：缺少 article:published_time`);
    r.check(metaContent(p, 'meta[property="article:modified_time"]')?.startsWith(post.modified) === true, `${where}：缺少 article:modified_time`);
    r.check(title === `${post.title}｜机场节点`, `${where}：<title> 应为“frontmatter 的 title｜机场节点”`, `实际：${title}`);
    r.check(h1Text === post.h1, `${where}：H1 应与 frontmatter 一致`, `实际：${h1Text}`);
    r.check(desc === post.description, `${where}：description 应与 frontmatter 的 description 一致`);
    r.check(p.root.querySelector('main time[datetime]') !== null, `${where}：文章页应显示发布/更新日期`);
  }
  // 旗舰报告
  if (p.urlPath === '/airports/lingdongyun/singapore-speedtest-2026-10/') {
    r.check(
      ld.some((x) => typeOf(x) === 'Article'),
      `${where}：旗舰报告缺少 Article 结构化数据`,
    );
  }
}

// ------------------------------------------------------------------ 跨页唯一性
const dupes = (label: string, m: Map<string, string[]>): void => {
  for (const [k, ps] of m) if (k && ps.length > 1) r.check(false, `${label}重复：“${k.slice(0, 40)}”出现在 ${ps.join('、')}`);
};
dupes('title', titles);
dupes('description', descs);
dupes('H1', h1s);

// ------------------------------------------------------------------ 首页逐字（2026-10-28 站长要求改为以机场推荐、价格与注册为主）
const home = all.find((p) => p.urlPath === '/');
if (r.check(!!home, '找不到首页')) {
  r.check(home!.root.querySelector('title')?.text.trim() === HOME_TITLE, `首页 title 应为“${HOME_TITLE}”`);
  r.check(metaContent(home!, 'meta[name="description"]') === HOME_DESCRIPTION, '首页 description 与总指令不一致');
  r.check(home!.root.querySelector('h1')?.text.trim() === HOME_H1, `首页 H1 应为“${HOME_H1}”`);
  r.check(HOME_TITLE === '机场节点｜2026机场推荐：34家机场价格、节点与注册入口', '首页 title 常量与总指令不一致');
  r.check(
    HOME_DESCRIPTION === '机场节点整理2026年34家机场推荐：每家机场的最低价格、节点数量与地区（香港、台湾、日本、新加坡、美国等）、IPLC/IEPL线路、常用服务情况和注册入口，并附灵动云晚高峰实测。',
    '首页 description 常量与总指令不一致',
  );
  r.check(HOME_H1 === '机场节点与机场推荐指南 2026：看懂不同时间段的速度、延迟与稳定性', '首页 H1 常量与总指令不一致');
  const nav = home!.root.querySelectorAll('nav[aria-label="主导航"] a').map((a) => a.text.trim());
  const want = ['全球节点地图', '34家机场目录', '分时段节点测试', '节点地区', '线路知识', '套餐对比', '客户端教程', '研究文章'];
  r.check(JSON.stringify(nav) === JSON.stringify(want), '首页主导航应为 8 项且顺序一致', `实际：${nav.join(' / ')}`);
  r.check(JSON.stringify(NAV_ITEMS.map((n) => n.label)) === JSON.stringify(want), 'NAV_ITEMS 与总指令的 8 项导航不一致');
}

// ------------------------------------------------------------------ sitemap 与 index/noindex 的一致性
const sitemap = readSitemap();
const locs = new Set(sitemap.map((s) => s.loc));
r.check(sitemap.length === locs.size, 'sitemap 里有重复的 URL');
r.check(sitemap.length > 0, 'sitemap 为空');
const byLoc = new Map(all.map((p) => [`${SITE}${p.urlPath}`, p]));
for (const { loc, lastmod } of sitemap) {
  const page = byLoc.get(loc);
  if (!r.check(!!page, `sitemap 里的 ${loc} 在 dist 里没有对应页面`)) continue;
  r.check(!isNoindex(page!), `sitemap 里的 ${loc} 带有 noindex`);
  r.check(page!.root.querySelector('link[rel="canonical"]')?.getAttribute('href') === loc, `sitemap 里的 ${loc} 不是该页面的 canonical`);
  r.check(/^\d{4}-\d{2}-\d{2}$/.test(lastmod), `${loc}：lastmod 格式应为 YYYY-MM-DD，实际 ${lastmod}`);
  r.check(lastmod <= todayCN, `${loc}：lastmod ${lastmod} 晚于今天 ${todayCN}`);
  const post = fm.get(page!.urlPath);
  if (post) r.check(lastmod === post.modified, `${loc}：lastmod 应等于文章 modified（${post.modified}），实际 ${lastmod}`);
}
for (const p of all) {
  const loc = `${SITE}${p.urlPath}`;
  if (isNoindex(p)) r.check(!locs.has(loc), `${p.urlPath}：noindex 页面不得出现在 sitemap`);
  else r.check(locs.has(loc), `${p.urlPath}：可索引页面没有出现在 sitemap`);
}
for (const must of ['/', '/airports/', '/regions/', '/routes/', '/time-tests/', '/test-records/', '/plans/', '/guides/', '/articles/', '/testing-methodology/', '/sources/', '/about/', '/affiliate-disclosure/', '/privacy/', '/airports/lingdongyun/', '/airports/lingdongyun/singapore-speedtest-2026-10/']) {
  r.check(locs.has(`${SITE}${must}`), `sitemap 缺少总指令要求的页面 ${must}`);
}
for (const must of ['hong-kong', 'japan', 'singapore', 'taiwan', 'united-states', 'south-korea', 'europe']) {
  r.check(locs.has(`${SITE}/regions/${must}/`), `sitemap 缺少地区页 /regions/${must}/`);
}
for (const banned of ['/search/', '/404.html', '/404/']) r.check(!locs.has(`${SITE}${banned}`), `sitemap 不应包含 ${banned}`);
r.check(fm.size >= 15, `文章与教程应不少于 15 篇，实际 ${fm.size}`);
r.check(
  [...fm.keys()].every((k) => locs.has(`${SITE}${k}`)),
  '每一篇文章和教程都应出现在 sitemap',
);

// ------------------------------------------------------------------ 站点文件
const robotsFile = path.join(DIST, 'robots.txt');
if (r.check(fs.existsSync(robotsFile), '缺少 robots.txt')) {
  const t = fs.readFileSync(robotsFile, 'utf8');
  r.check(t.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt 缺少 Sitemap 行');
  r.check(/User-agent:\s*\*/i.test(t), 'robots.txt 缺少 User-agent');
  r.check(!/Disallow:\s*\/\s*$/m.test(t), 'robots.txt 不得禁止全站');
  r.check(!/Disallow:\s*\/(search|404|airports)/i.test(t), 'robots.txt 不应屏蔽 noindex 页面（屏蔽后搜索引擎读不到 noindex）');
}
for (const f of ['sitemap.xml', 'favicon.svg', 'favicon-32.png', 'favicon-512.png', 'apple-touch-icon.png', 'og/default.png', '_headers', 'search-index.json', 'data/test-records.csv']) {
  r.check(fs.existsSync(path.join(DIST, f)), `dist 缺少 ${f}`);
}
const keyFiles = fs.readdirSync(DIST).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f) && fs.readFileSync(path.join(DIST, f), 'utf8').trim() === f.replace('.txt', ''));
r.check(keyFiles.length === 1, `dist 根目录应有且仅有一个 IndexNow 密钥文件，实际 ${keyFiles.length}`);
if (fs.existsSync(path.join(DIST, 'og/default.png'))) {
  const buf = fs.readFileSync(path.join(DIST, 'og/default.png'));
  r.check(buf.readUInt32BE(16) === 1200 && buf.readUInt32BE(20) === 630, 'og/default.png 应为 1200×630');
  r.check(buf.length < 400 * 1024, `og/default.png 体积 ${(buf.length / 1024).toFixed(0)}KB，建议小于 400KB`);
}
// Bing / Google 站点验证：默认不放（需要站长在构建环境里设置），但变量一旦设置就必须输出
const verification = all.some((p) => p.root.querySelector('meta[name="msvalidate.01"]'));
if (!verification) r.warn('首页尚未输出 Bing 验证 meta（msvalidate.01）：需要在 Bing Webmaster Tools 取得验证码后设置 PUBLIC_BING_SITE_VERIFICATION，或改用 DNS/文件验证。');

// ------------------------------------------------------------------ 文案
// 否定语境（“不保证”“无法保证”“没有承诺”）里的写法不算承诺
const PROMISES: { re: RegExp; label: string }[] = [
  { re: /(?<![不无未没非别])(?:保证|确保|一定|必定|肯定|承诺)[^，。；\n]{0,6}(?:收录|排名|首页|第一|page\s*1|上首页)/i, label: '承诺收录或排名' },
  { re: /(?:排名|排行|搜索排名|榜单)(?:第一|No\.?\s*1|第1)/i, label: '排名第一' },
  { re: /最(?:好|佳|强|稳|快|便宜|划算|值得买)的?(?:机场|节点|线路|翻墙|梯子)/, label: '绝对化推荐' },
  { re: /(?:100%|百分之百|绝对|永远|永不|完全)(?:稳定|不掉线|不卡|可用|安全)/, label: '绝对化稳定性承诺' },
  { re: /(?:官方|权威)(?:认证|推荐|授权)(?:的)?(?:机场|节点)/, label: '虚构认证' },
];
const TEMPLATE_LEAKS: { re: RegExp; label: string }[] = [
  { re: /\bundefined\b|\[object Object\]|\bNaN\b|\bnull\b/, label: '模板残留' },
  { re: /\*\*/, label: '字面 **（Markdown 加粗没有被渲染）' },
  { re: /lorem ipsum|TODO|FIXME|待填写|占位文字/i, label: '占位文字' },
  { re: /\{\{|\}\}|<%|%>/, label: '未渲染的模板标记' },
];
for (const p of all) {
  const text = textOf(p);
  for (const { re, label } of PROMISES) {
    const m = text.match(re);
    r.check(!m, `${p.urlPath}：出现${label}的措辞“${m?.[0]}”`);
  }
  for (const { re, label } of TEMPLATE_LEAKS) {
    const m = text.match(re);
    r.check(!m, `${p.urlPath}：出现${label}“${m?.[0]}”`);
  }
  // 站点不得用自己的口吻声称“实时”数据/监控（总指令：不得伪造实时数据）。
  // 允许：引号里引用来源页面的原话（如品牌站的“实时测速大屏”）、“实时通话”这类指应用场景的词、否定语境。
  for (const s of text.split(/[。；！？\n]/).filter((x) => /实时/.test(x))) {
    const cleaned = s.replace(/[“"「][^”"」]*[”"」]/g, '').replace(/实时(?:通话|应用|通信|交互|语音|视频|音视频|游戏|会议)/g, '');
    if (!/实时/.test(cleaned)) continue;
    r.check(/[不没无非未别]|并非/.test(cleaned), `${p.urlPath}：出现“实时”但不在否定语境：“${s.trim().slice(0, 50)}”`);
  }
}

r.finish();
