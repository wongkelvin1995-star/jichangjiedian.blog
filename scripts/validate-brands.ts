/**
 * 品牌数据校验（数据层，不依赖构建产物）：
 *  - 34 家、slug / brandId / 展示序号唯一且连续；
 *  - 前 16 位及第 17–34 位与站长原始顺序文件逐位一致，且不是按上传编号排序；
 *  - 每家都有来源记录，来源编号都能在来源登记表里找到，A 级字段必须有本站来源；
 *  - 未知值一律为 null，不得写成 0 或空数组；
 *  - 身份不自动合并：已知的同名/近似名风险品牌必须保持“待核验/同名冲突/演示站/资料不完整”等状态。
 */
import fs from 'node:fs';
import { BRANDS } from '../src/data/brands';
import { BRAND_INDEX } from '../src/data/brand-index';
import { SOURCES, getSource } from '../src/data/source-registry';
import { NO_COUPON_PLANS, NO_COUPON_SOURCE_ID } from '../src/data/coupons';
import type { Brand, Claim, IdentityStatus, VerificationStatus } from '../src/data/types';
import { Report } from './lib/report';

const r = new Report('品牌数据校验');

// ------------------------------------------------------------------ 数量、唯一性、顺序
r.check(BRANDS.length === 34, `品牌数量应为 34，实际 ${BRANDS.length}`);
r.check(BRAND_INDEX.length === 34, `BRAND_INDEX 数量应为 34，实际 ${BRAND_INDEX.length}`);
r.check(new Set(BRANDS.map((b) => b.slug)).size === BRANDS.length, 'slug 必须唯一');
r.check(new Set(BRANDS.map((b) => b.brandId)).size === BRANDS.length, 'brandId 必须唯一');
r.check(
  BRANDS.every((b, i) => b.displayRank === i + 1),
  '展示序号必须是 1..34 连续，且与数组顺序一致',
);
r.check(
  BRANDS.every((b, i) => b.slug === BRAND_INDEX[i]!.slug),
  'BRANDS 的顺序必须与 BRAND_INDEX 完全一致',
);

// 站长 2026-10-29 重新指定了推荐排名（原始顺序文件 display-order-original.txt 保留不动，仅作历史记录）
const orderFile = fs.readFileSync('docs/source-material/display-order-2026-10-29.txt', 'utf8');
const expectedNames = new Map<number, string>();
for (const line of orderFile.split(/\r?\n/)) {
  const m = line.match(/^(\d{2})\s+(.+?)\s*$/);
  if (m) expectedNames.set(Number(m[1]), m[2]!);
}
r.check(expectedNames.size === 34, `排名文件应有 34 行，读到 ${expectedNames.size}`);
for (const [n, name] of expectedNames) {
  const b = BRANDS[n - 1];
  r.check(b?.brandName === name, `第 ${n} 位应为“${name}”`, `实际：${b?.brandName ?? '（缺失）'}`);
}

const byUpload = [...BRAND_INDEX].sort((a, b) => a.uploadFileNo - b.uploadFileNo).map((x) => x.slug);
r.check(new Set(BRAND_INDEX.map((b) => b.uploadFileNo)).size === 34, '上传编号必须唯一（仅用于追溯）');
r.check(JSON.stringify(byUpload) !== JSON.stringify(BRANDS.map((b) => b.slug)), '展示顺序不得等于按上传编号排序的顺序');

// ------------------------------------------------------------------ 来源与 A 级
const SITE_KINDS = new Set(['site-owner-test', 'site-owner-composite']);

function checkClaim(brand: Brand, field: string, c: Claim<unknown> | undefined): void {
  if (!c) return;
  const where = `${brand.brandName} · ${field}`;
  for (const id of c.sourceIds) r.check(!!getSource(id), `${where}：来源编号“${id}”不在来源登记表里`);
  if (c.value !== null && c.value !== undefined) {
    r.check(c.sourceIds.length > 0, `${where}：有取值但没有来源编号`);
    if (typeof c.value === 'number') r.check(c.value > 0, `${where}：数值为 ${c.value}，未知值应为 null 而不是 0`);
    if (Array.isArray(c.value)) r.check(c.value.length > 0, `${where}：空数组，未知值应为 null`);
    if (typeof c.value === 'string') r.check(c.value.trim().length > 0, `${where}：空字符串，未知值应为 null`);
  }
  if (c.grade === 'A') {
    const ok = c.sourceIds.some((id) => SITE_KINDS.has(getSource(id)?.kind ?? ''));
    r.check(ok, `${where}：标为 A 级（本站实测），但来源里没有本站测试或本站整理的记录`);
  }
}

r.check(SOURCES.length > 0, '来源登记表不能为空');
for (const b of BRANDS) {
  r.check(b.sourceIds.length > 0, `${b.brandName}：没有任何来源编号`);
  for (const id of b.sourceIds) r.check(!!getSource(id), `${b.brandName}：来源编号“${id}”不在来源登记表里`);
  r.check(!!b.verificationStatus, `${b.brandName}：缺少资料状态`);
  r.check(typeof b.summary === 'string' && b.summary.length > 0, `${b.brandName}：缺少摘要`);

  checkClaim(b, '节点数', b.nodeCount);
  checkClaim(b, '协议', b.protocols);
  checkClaim(b, '线路类型', b.routeTypes);
  checkClaim(b, '客户端', b.clients);
  checkClaim(b, '流媒体', b.streaming);
  checkClaim(b, 'AI 服务', b.ai);
  checkClaim(b, '设备数', b.deviceLimit);
  checkClaim(b, '倍率', b.multiplier);

  for (const reg of b.regions) {
    const where = `${b.brandName} · 地区 ${reg.label}`;
    r.check(reg.nodeCount === null || (Number.isInteger(reg.nodeCount) && reg.nodeCount > 0), `${where}：节点数应为 null 或正整数，实际 ${reg.nodeCount}`);
    r.check(reg.sourceIds.length > 0, `${where}：没有来源编号`);
    for (const id of reg.sourceIds) r.check(!!getSource(id), `${where}：来源编号“${id}”不在来源登记表里`);
  }

  for (const p of b.plans) {
    checkClaim(b, `套餐 ${p.name} · 全节点`, p.supportsAllNodes as Claim<unknown> | undefined);
    checkClaim(b, `套餐 ${p.name} · 设备数`, p.deviceLimit as Claim<unknown> | undefined);
    checkClaim(b, `套餐 ${p.name} · 倍率`, p.nodeMultiplier as Claim<unknown> | undefined);
    r.check(p.brandId === b.slug, `${b.brandName} · 套餐 ${p.name}：brandId 与所属品牌不一致`);
    for (const o of p.offers) {
      const where = `${b.brandName} · ${p.name} · ${o.offerId}`;
      r.check(o.priceCNY === null || o.priceCNY > 0, `${where}：价格应为 null 或正数，实际 ${o.priceCNY}`);
      r.check(o.monthlyTrafficGB === null || o.monthlyTrafficGB > 0, `${where}：每月流量应为 null 或正数，实际 ${o.monthlyTrafficGB}`);
      r.check(o.totalTrafficGB === null || o.totalTrafficGB > 0, `${where}：总流量应为 null 或正数，实际 ${o.totalTrafficGB}`);
      r.check(!!getSource(o.priceSource.sourceId), `${where}：价格来源编号“${o.priceSource.sourceId}”不在来源登记表里`);
      r.check(!(o.monthlyTrafficGB !== null && o.totalTrafficGB !== null), `${where}：每月流量与总流量不能同时填写（来源只会说明其中一种）`);
      // 咨询报价（需联系客服确认）可以带页面上写的参考价，但必须有说明，且套餐对比页不会拿它做精确比较
      r.check(o.status !== 'consult' || !!o.note, `${where}：咨询报价必须写明说明`);
    }
  }
}

// ------------------------------------------------------------------ 不可使用优惠码的套餐（站长 2026-10-31 说明）
r.check(!!getSource(NO_COUPON_SOURCE_ID), `不可使用优惠码的来源“${NO_COUPON_SOURCE_ID}”不在来源登记表里`);
for (const [slug, list] of Object.entries(NO_COUPON_PLANS)) {
  const b = BRANDS.find((x) => x.slug === slug);
  if (!r.check(!!b, `不可使用优惠码清单里的品牌 ${slug} 不存在`)) continue;
  r.check(b!.sourceIds.includes(NO_COUPON_SOURCE_ID), `${b!.brandName}：有“不可使用优惠码”的套餐，品牌来源里却没有 ${NO_COUPON_SOURCE_ID}`);
  r.check(new Set(list.map((x) => x.planId)).size === list.length, `${b!.brandName}：不可使用优惠码清单里有重复的套餐`);
  for (const item of list) {
    r.check(b!.plans.some((p) => p.planId === item.planId), `${b!.brandName}：不可使用优惠码清单里的套餐“${item.planId}”在套餐数据里找不到`);
  }
}

// ------------------------------------------------------------------ 身份不自动合并
type Rule = { identity: IdentityStatus[]; minConflicts?: number; minHighNotices?: number };
const RISK: Record<string, Rule> = {
  breezenet: { identity: ['name-confirmed'], minConflicts: 1 }, // 微风网络：2026-10-28 起用第三方评测页 + 站长节点清单
  // 2026-10-28 站长确认：无忧 = 无忧链接，神行云 = 神行加速，云界云 = 云界线，唯兔云 = V2云 / OnlyRabbit
  wuyou: { identity: ['owner-confirmed'] },
  shenxingyun: { identity: ['owner-confirmed'] },
  yunjieyun: { identity: ['owner-confirmed'] },
  huanqiuyun: { identity: ['owner-confirmed'] }, // 环球云 = 环球梯（站长 2026-10-28 确认）；同名云计算公司存档不使用
  shandianyun: { identity: ['owner-confirmed'], minHighNotices: 1 }, // 闪电云 = 闪电鼠（站长确认）；演示站存档提示仍需保留
  weituyun: { identity: ['owner-confirmed'], minHighNotices: 1 }, // 唯兔云：服务公告仍需保留
  edgenova: { identity: ['name-confirmed'] }, // 2026-10-29 站长提供官网截图后，旧的价格冲突已按截图解决
  sogoyun: { identity: ['name-confirmed'] }, // 2026-10-29 站长提供官网截图后，旧的价格冲突已按截图解决
  muguangjiasu: { identity: ['name-confirmed'] }, // 2026-10-29 站长提供官网截图后，旧的价格冲突已按截图解决
  feimaoyun: { identity: ['name-confirmed'] }, // 2026-10-29 站长提供官网截图后，旧的价格冲突已按截图解决
};
for (const [slug, rule] of Object.entries(RISK)) {
  const b = BRANDS.find((x) => x.slug === slug);
  if (!r.check(!!b, `风险品牌 ${slug} 不存在`)) continue;
  r.check(rule.identity.includes(b!.identity.status), `${b!.brandName}：身份状态应为 ${rule.identity.join('/')}，实际 ${b!.identity.status}`);
  if (rule.minConflicts) r.check(b!.conflictCount >= rule.minConflicts, `${b!.brandName}：应至少记录 ${rule.minConflicts} 处来源冲突，实际 ${b!.conflictCount}`);
  if (rule.minHighNotices) r.check(b!.highNoticeCount >= rule.minHighNotices, `${b!.brandName}：应至少有 ${rule.minHighNotices} 条高风险提示，实际 ${b!.highNoticeCount}`);
}

// 通用规则：身份未确认的品牌，资料状态不能被“升级”成已有来源/已测试
const UNCONFIRMED: IdentityStatus[] = ['mapping-pending', 'name-collision', 'demo-site', 'data-incomplete'];
const ALLOWED_FOR_UNCONFIRMED: VerificationStatus[] = ['identity-pending', 'demo-site', 'insufficient'];
for (const b of BRANDS) {
  if (UNCONFIRMED.includes(b.identity.status)) {
    r.check(ALLOWED_FOR_UNCONFIRMED.includes(b.verificationStatus), `${b.brandName}：身份未确认（${b.identity.status}），资料状态却是 ${b.verificationStatus}`);
    r.check(b.identity.notes.length > 0, `${b.brandName}：身份未确认，必须写明原因`);
  }
  if (b.identity.status === 'name-variant') r.check(b.identity.notes.length > 0, `${b.brandName}：名称有变体，必须写明对应关系的说明`);
  // 同名风险品牌不允许开放独立详情页（资料不足以建立可索引页面）
  if (UNCONFIRMED.includes(b.identity.status)) r.check(b.detailPage === 'draft', `${b.brandName}：身份未确认的品牌不应开放可索引的详情页`);
}

// 开放详情页的品牌：至少有一份带来源的字段，避免出现“薄页面”
for (const b of BRANDS.filter((x) => x.detailPage === 'open')) {
  const offers = b.plans.reduce((n, p) => n + p.offers.length, 0);
  r.check(offers > 0 || b.regions.length > 0, `${b.brandName}：开放了详情页，但既没有套餐报价也没有地区记录`);
}

r.finish();
