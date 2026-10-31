/** 34 家机场资料逐家检查（上线前审计用），结果写入 reports/brand-audit.json */
import fs from 'node:fs';
import { BRANDS } from '../src/data/brands';
import { BRAND_INDEX } from '../src/data/brand-index';
import { SHEET_LOWEST } from '../src/data/owner-sheet-prices';
import { TEST_RECORDS } from '../src/data/test-records';
import { ALL_REGION_SUMMARIES } from '../src/lib/queries';

const rows = BRANDS.map((b, i) => {
  const issues: string[] = [];
  if (b.slug !== BRAND_INDEX[i]!.slug) issues.push('顺序与 BRAND_INDEX 不一致');
  if (!fs.existsSync(`dist/airports/${b.slug}/index.html`)) issues.push('详情页不存在');
  const html = fs.existsSync(`dist/airports/${b.slug}/index.html`) ? fs.readFileSync(`dist/airports/${b.slug}/index.html`, 'utf8') : '';
  if (/noindex/.test(html)) issues.push('详情页 noindex');
  if (b.nodeCount.value === null) issues.push('没有节点总数');
  if (!b.regions.some((r) => r.grade !== 'D')) issues.push('没有节点地区');
  if (!b.routeTypes.value?.length) issues.push('没有线路类型');
  const monthly = b.plans.flatMap((p) => p.offers).filter((o) => o.billingPeriod === 'monthly' && o.priceCNY !== null && o.status === 'sourced');
  if (!monthly.length && !SHEET_LOWEST[b.slug]) issues.push('没有月付价格');
  const recs = TEST_RECORDS.filter((r) => r.brandId === b.slug);
  const site = recs.filter((r) => r.sourceType === 'A' || r.sourceType === 'B');
  for (const r of site) if (r.isVerified && !r.testDateTime) issues.push(`实测记录 ${r.testId} 标为附原图但没有日期`);
  if (b.siteTest.hasRecords && b.slug !== 'lingdongyun') issues.push('非灵动云品牌被标为有本站实测');
  return { rank: b.displayRank, slug: b.slug, name: b.brandName, nodes: b.nodeCount.value, regions: b.regions.filter((r) => r.grade !== 'D').map((r) => r.label).join('、'), routes: (b.routeTypes.value ?? []).join('/'), lowest: SHEET_LOWEST[b.slug]?.price ?? null, plans: b.plans.length, siteRecords: site.length, thirdPartyRecords: recs.length - site.length, issues };
});
// 地图 / 地区页数量与品牌资料一致
const sum = ALL_REGION_SUMMARIES();
const regionCheck = sum.map((s) => ({ region: s.point.countryCode, documented: s.documented.length, recount: BRANDS.filter((b) => b.regions.some((r) => r.countryCode === s.point.countryCode && r.grade !== 'D')).length }));
const mismatched = regionCheck.filter((r) => r.documented !== r.recount);
const names = new Set(BRANDS.map((b) => b.brandName));
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/brand-audit.json', JSON.stringify({ count: BRANDS.length, uniqueNames: names.size, rows, regionCheck, mismatched }, null, 1));
for (const r of rows) console.log(`${r.issues.length ? '✗' : '✓'} ${String(r.rank).padStart(2, '0')} ${r.name} 节点${r.nodes} 线路${r.routes} 最低¥${r.lowest} 套餐${r.plans} 实测${r.siteRecords} ${r.issues.join('；')}`);
console.log(`品牌 ${BRANDS.length}，名称不重复 ${names.size}，地区数量不一致 ${mismatched.length}`, mismatched);
