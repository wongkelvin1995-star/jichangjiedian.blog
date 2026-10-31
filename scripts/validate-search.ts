/**
 * 站内中文搜索校验：直接使用浏览器里运行的同一份匹配代码（src/lib/search-core.ts）和构建出的 dist/search-index.json。
 *
 * 覆盖总指令第 25 节的要求：
 *   机场中文全名 / 简称 / 英文名 / 别名、地区中文名与英文名、线路缩写、文章标题、相关技术词语；
 *   “灵动”→灵动云；“flyv”→飞V；“firefly”→Firefly；“新加坡”→地区页 + 已有公开资料记录的机场；
 *   “IPLC”→线路文章 + 有来源的对应机场；“晚高峰”→分时段研究文章；避免中文搜索完全无结果。
 * 另外检查索引本身：链接都有效、没有推广链接、体积合理，以及短缩写（hk、us）不会被别的词里碰巧出现的字母误命中。
 */
import fs from 'node:fs';
import path from 'node:path';
import { AFFILIATE_URLS } from '../src/data/affiliates';
import { BRANDS } from '../src/data/brands';
import { MAP_POINTS, REGION_PAGES, coverageFor } from '../src/data/regions';
import { ROUTE_TYPES } from '../src/data/routes';
import { SEARCH_TERMS } from '../src/data/search-terms';
import { routeChipsOf } from '../src/lib/queries';
import { prepare, runSearch, groupHits, hitDescription, KIND_ORDER } from '../src/lib/search-core';
import type { SearchEntry, SearchKind } from '../src/lib/search-core';
import { DIST, fileForPath, pages, requireDist } from './lib/dist';
import { Report } from './lib/report';

requireDist();
const r = new Report('中文搜索校验');

const indexFile = path.join(DIST, 'search-index.json');
if (!fs.existsSync(indexFile)) {
  r.check(false, 'dist 里缺少 search-index.json');
  r.finish();
}
const raw = fs.readFileSync(indexFile, 'utf8');
const entries = JSON.parse(raw) as SearchEntry[];
const data = prepare(entries);

// ------------------------------------------------------------------ 索引本身
r.check(Array.isArray(entries) && entries.length > 60, `索引条目数异常：${entries.length}`);
r.check(raw.length < 60 * 1024, `索引体积 ${(raw.length / 1024).toFixed(1)}KB，超过 60KB，首次搜索会变慢`);
r.check(new Set(entries.map((e) => e.u)).size === entries.length, '索引里的链接不能重复');
for (const e of entries) {
  r.check(KIND_ORDER.includes(e.k as SearchKind), `索引条目类型无效：${e.k}`);
  r.check(typeof e.t === 'string' && e.t.length > 0 && typeof e.d === 'string' && e.d.length > 0, `索引条目缺少标题或简介：${e.u}`);
  r.check(e.u.startsWith('/') && !e.u.startsWith('//'), `索引链接必须是站内根路径：${e.u}`);
  r.check(fileForPath(e.u) !== null, `索引链接在 dist 里不存在：${e.u}`);
  const hash = e.u.split('#')[1];
  if (hash) {
    const page = pages().find((p) => p.urlPath === e.u.split('#')[0]);
    r.check(!!page?.root.querySelector(`[id="${hash}"]`), `索引链接的锚点在页面里不存在：${e.u}`);
  }
}
for (const url of Object.values(AFFILIATE_URLS)) r.check(!raw.includes(url), '搜索索引里不应出现推广链接');
r.check(!/<script|javascript:/i.test(raw), '搜索索引里不应出现脚本');
r.check(entries.filter((e) => e.k === 'brand').length === 34, '索引里应有 34 个机场条目');
// 页面上的每个可索引页面（除首页、列表分页）都应能被搜到
const indexed = new Set(entries.map((e) => e.u.split('#')[0]));
for (const must of ['/airports/', '/regions/', '/routes/', '/time-tests/', '/test-records/', '/plans/', '/guides/', '/articles/', '/testing-methodology/', '/sources/', '/about/', '/affiliate-disclosure/', '/privacy/']) {
  r.check(indexed.has(must), `搜索索引缺少栏目页 ${must}`);
}

// ------------------------------------------------------------------ 工具
const search = (q: string, n = Infinity) => runSearch(data, q, n);
const urlsOf = (q: string, n = Infinity): string[] => search(q, n).map((h) => h.entry.u);
const rankOf = (q: string, url: string): number => urlsOf(q).indexOf(url); // 0 起；-1 = 没找到
const expectTop = (q: string, url: string, n: number, what: string): void => {
  const rank = rankOf(q, url);
  r.check(rank >= 0 && rank < n, `${what}：搜“${q}”应在前 ${n} 位找到 ${url}`, `实际排名：${rank < 0 ? '未找到' : rank + 1}；前三：${urlsOf(q, 3).join('、') || '无结果'}`);
};
const soft: string[] = [];
const expectSoft = (q: string, url: string, what: string): void => {
  const rank = rankOf(q, url);
  if (rank !== 0) soft.push(`${what} 搜“${q}”排第 ${rank < 0 ? '—（未找到）' : rank + 1}`);
};

// ------------------------------------------------------------------ 总指令里的例子
expectTop('灵动', '/airports/lingdongyun/', 1, '总指令示例');
expectTop('flyv', '/airports/flyv/', 1, '总指令示例');
expectTop('firefly', '/airports/firefly/', 1, '总指令示例');
expectTop('FLYV', '/airports/flyv/', 1, '大小写');
expectTop('飞 v', '/airports/flyv/', 1, '空格写法');
expectTop('飞V', '/airports/flyv/', 1, '中英混写');
expectTop('晚高峰', '/articles/how-to-speedtest-at-peak-hours/', 1, '总指令示例');
r.check(urlsOf('晚高峰').includes('/time-tests/'), '搜“晚高峰”应同时找到分时段节点测试页');

// “新加坡”：地区页排第一，并包含所有“公开资料有记录”的机场（且只有它们）
{
  const hits = search('新加坡');
  r.check(hits[0]?.entry.u === '/regions/singapore/', `搜“新加坡”第一条应是地区页，实际 ${hits[0]?.entry.u}`);
  const got = new Set(hits.filter((h) => h.entry.k === 'brand').map((h) => h.entry.u));
  const want = new Set(BRANDS.filter((b) => coverageFor(b, 'SG').level === 'documented').map((b) => `/airports/${b.slug}/`));
  r.check(want.size > 0, '数据里应至少有一家机场在新加坡有公开资料记录');
  for (const u of want) r.check(got.has(u), `搜“新加坡”应找到有公开资料记录的机场 ${u}`);
  for (const u of got) r.check(want.has(u), `搜“新加坡”不应列出没有公开资料记录（或仅为待核验）的机场 ${u}`);
  r.check(urlsOf('新加坡').includes('/airports/lingdongyun/singapore-speedtest-2026-10/'), '搜“新加坡”应找到灵动云新加坡测速报告');
  // 机场结果注明命中的是哪个地区 / 线路（2026-10-28 起不再在搜索结果显示来源等级）
  for (const h of hits.filter((x) => x.entry.k === 'brand')) r.check(/提供/.test(hitDescription(h)), `${h.entry.t}：覆盖记录命中的结果应注明提供哪个地区`);
}

// “IPLC”：线路术语 + 线路文章 + 有来源的机场
{
  const hits = search('IPLC');
  r.check(hits[0]?.entry.u === '/routes/#iplc', `搜“IPLC”第一条应是线路术语，实际 ${hits[0]?.entry.u}`);
  r.check(urlsOf('IPLC').includes('/articles/iepl-iplc-bgp-differences/'), '搜“IPLC”应找到线路区别文章');
  const got = new Set(hits.filter((h) => h.entry.k === 'brand').map((h) => h.entry.u));
  const want = new Set(BRANDS.filter((b) => routeChipsOf(b).some((c) => c.id === 'iplc' && c.grade !== 'D')).map((b) => `/airports/${b.slug}/`));
  r.check(want.size > 0, '数据里应至少有一家机场的 IPLC 有来源');
  for (const u of want) r.check(got.has(u), `搜“IPLC”应找到资料里有 IPLC 记录的机场 ${u}`);
  for (const u of got) r.check(want.has(u), `搜“IPLC”不应列出 IPLC 仅为待核验的机场 ${u}`);
}

// ------------------------------------------------------------------ 机场：全名、简称、英文名、别名
for (const b of BRANDS) {
  const url = `/airports/${b.slug}/`;
  expectTop(b.brandName, url, 1, `${b.brandName} 全名`);
  expectTop(b.shortName, url, 3, `${b.brandName} 简称`);
  expectSoft(b.shortName, url, `${b.brandName} 简称`);
  if (b.nameEn) expectTop(b.nameEn, url, 3, `${b.brandName} 英文名`);
  expectTop(b.slug, url, 3, `${b.brandName} 拼音/英文标识`);
  for (const a of b.aliases) expectTop(a, url, 3, `${b.brandName} 别名`);
}

// ------------------------------------------------------------------ 地区：中文名、英文名、别名、代码；机场清单与专题页一致
for (const page of REGION_PAGES) {
  const url = `/regions/${page.slug}/`;
  for (const q of [page.name, page.fullName, page.nameEn, ...page.searchTerms, ...page.countryCodes]) expectTop(q, url, 3, `地区 ${page.name}`);
  expectTop(page.name, url, 1, `地区 ${page.name}`);

  // 搜地区名得到的机场，必须正好是该地区专题页“公开资料有记录”的机场
  const want = new Set(
    BRANDS.filter((b) => page.countryCodes.some((c) => coverageFor(b, c).level === 'documented')).map((b) => `/airports/${b.slug}/`),
  );
  const got = new Set(search(page.name).filter((h) => h.entry.k === 'brand').map((h) => h.entry.u));
  for (const u of want) r.check(got.has(u), `搜“${page.name}”应找到该地区有公开资料记录的机场 ${u}`);
  for (const u of got) r.check(want.has(u), `搜“${page.name}”不应列出该地区没有公开资料记录的机场 ${u}`);
}
for (const p of MAP_POINTS) {
  expectTop(p.name, `/regions/${p.regionSlug}/`, 3, `地图点位 ${p.name}`);
  expectTop(p.nameEn, `/regions/${p.regionSlug}/`, 3, `地图点位 ${p.nameEn}`);
}
// 短缩写不能被别的词里碰巧出现的字母误命中（曾经 “hk” 命中过 south korea）
{
  const hk = search('hk').map((h) => h.entry.u);
  r.check(!hk.includes('/regions/south-korea/'), '搜“hk”不应命中韩国页面');
  r.check(hk[0] === '/regions/hong-kong/', `搜“hk”第一条应是香港页面，实际 ${hk[0]}`);
  const us = search('us').map((h) => h.entry.u);
  r.check(us[0] === '/regions/united-states/', `搜“us”第一条应是美国页面，实际 ${us[0]}`);
  r.check(search('v').length === 0 || search('v').every((h) => /v/i.test(h.entry.t + h.entry.s.join(''))), '搜单个字母“v”不应返回毫不相干的结果');
}

// ------------------------------------------------------------------ 线路：缩写与别名
for (const rt of ROUTE_TYPES) {
  const url = `/routes/#${rt.slug}`;
  expectTop(rt.name, url, 1, `线路 ${rt.name}`);
  for (const a of rt.aliases) expectTop(a, url, 3, `线路 ${rt.name}`);
  const want = new Set(BRANDS.filter((b) => routeChipsOf(b).some((c) => c.id === rt.id && c.grade !== 'D')).map((b) => `/airports/${b.slug}/`));
  const got = new Set(search(rt.name).filter((h) => h.entry.k === 'brand').map((h) => h.entry.u));
  for (const u of want) r.check(got.has(u), `搜“${rt.name}”应找到资料里有该线路类型记录的机场 ${u}`);
  for (const u of got) r.check(want.has(u), `搜“${rt.name}”不应列出该线路类型仅为待核验的机场 ${u}`);
}

// ------------------------------------------------------------------ 文章、教程：标题；相关技术词语
for (const e of entries.filter((x) => x.k === 'article' || x.k === 'guide')) {
  expectTop(e.t, e.u, 1, `文章标题 ${e.t.slice(0, 14)}…`);
  // 去掉标点的标题片段（用户常只记得后半句）
  const tail = e.t.replace(/[？?]$/, '').slice(-8);
  expectTop(tail, e.u, 3, `文章标题片段“${tail}”`);
}
for (const term of SEARCH_TERMS) {
  // label 只供维护者阅读，不要求能被搜到；别名才是读者会输入的词
  for (const alias of term.aliases) expectTop(alias, term.url, 3, `术语“${term.label}”`);
}

// ------------------------------------------------------------------ 常见中文问法：不能完全无结果
const PLAUSIBLE = [
  '机场', '节点', '测速', '延迟', '速度', '稳定', '稳定性', '价格', '便宜', '套餐', '年付', '月付', '流量', '客户端', '教程', '文章',
  '地图', '香港', '日本', '美国', '新加坡', '台湾', '韩国', '欧洲', '德国', '英国', '法国', '线路', '专线', '中转', '直连',
  '早间', '午间', '晚间', '晚高峰', '深夜', '抖动', '丢包', '卡顿', '掉线', '倍率', '在线率', '推广', '隐私', '联系', '来源', '证据',
  'iepl', 'iplc', 'bgp', 'cn2', 'clash', 'youtube', 'csv', 'ping', '4k', '720p',
  '灵动', '飞猫', '飞为', '飞v', '浪网', '微风', '大佬', '梯子', '速界', '光速',
  '怎么选', '哪个好', '为什么慢', '怎么测', '晚上慢',
];
const empty = PLAUSIBLE.filter((q) => search(q).length === 0);
r.check(empty.length === 0, `这些常见查询没有任何结果：${empty.join('、')}`);

// 分组顺序：最高分的类型排在前面
{
  const g1 = groupHits(search('新加坡')).map((x) => x.kind);
  r.check(g1[0] === 'region', `搜“新加坡”时地区应排在第一组，实际 ${g1.join('>')}`);
  const g2 = groupHits(search('灵动')).map((x) => x.kind);
  r.check(g2[0] === 'brand', `搜“灵动”时机场应排在第一组，实际 ${g2.join('>')}`);
}

// ------------------------------------------------------------------ 健壮性
for (const q of ['', ' ', '　', '。。。', '<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', 'a'.repeat(500), '😀', '\\', '%', '()[]{}', '* + ? ^ $']) {
  let ok = true;
  try {
    search(q);
  } catch {
    ok = false;
  }
  r.check(ok, `查询 ${JSON.stringify(q.slice(0, 20))} 不应抛出异常`);
}
r.check(search('').length === 0 && search('   ').length === 0 && search('。。。').length === 0, '空查询和纯标点查询应返回空结果');

// 性能：300 次查询应在半秒内完成（这是在最慢的环境里也不会被感知的量级）
{
  const qs = [...PLAUSIBLE, ...BRANDS.map((b) => b.shortName), ...REGION_PAGES.map((x) => x.name)];
  const t0 = performance.now();
  for (let i = 0; i < 300; i++) search(qs[i % qs.length]!);
  const ms = performance.now() - t0;
  r.check(ms < 500, `300 次查询耗时 ${ms.toFixed(0)}ms，应小于 500ms`);
}

if (soft.length) r.warn(`以下查询能找到目标，但不是第一位（可接受）：${soft.slice(0, 12).join('；')}${soft.length > 12 ? `……共 ${soft.length} 条` : ''}`);
r.finish();
