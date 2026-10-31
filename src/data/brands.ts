/**
 * 34 家机场的汇总层：固定编辑顺序 + 推广链接绑定 + 核验状态计算。
 * 页面、地图、搜索、套餐比较全部从这里读取，禁止各自写死。
 */
import { AFFILIATE_URLS } from './affiliates';
import { BRAND_INDEX } from './brand-index';
import { siteTestSummary } from './test-records';
import type { Brand, BrandSeed, EvidenceGrade, VerificationStatus } from './types';
import { applyOfficial1029 } from './official-2026-10-29';
import { applyOwnerNodeTotals, applyOwnerRoutes, applyOwnerNodes, applyOwnerSheet } from './owner-sheet-prices';
import { applyThirdParty1026 } from './third-party-2026-10-26';
import { applyThirdParty1020 } from './third-party-2026-10-20';
import { applySingleThirdParty } from './third-party-single';

import breezenet from './brands/breezenet';
import dalaoyun from './brands/dalaoyun';
import edgenova from './brands/edgenova';
import ermaoyun from './brands/ermaoyun';
import feimaoyun from './brands/feimaoyun';
import firefly from './brands/firefly';
import flashleap from './brands/flashleap';
import flyv from './brands/flyv';
import guangnianti from './brands/guangnianti';
import guangsuyun from './brands/guangsuyun';
import huanqiuyun from './brands/huanqiuyun';
import jilianyun from './brands/jilianyun';
import kexinyun from './brands/kexinyun';
import kuaili from './brands/kuaili';
import kuajie from './brands/kuajie';
import laddercloud from './brands/laddercloud';
import lingdongyun from './brands/lingdongyun';
import lingmao from './brands/lingmao';
import liulianyun from './brands/liulianyun';
import muguangjiasu from './brands/muguangjiasu';
import quanqiuyun from './brands/quanqiuyun';
import shandianyun from './brands/shandianyun';
import shenxingyun from './brands/shenxingyun';
import sogoyun from './brands/sogoyun';
import sujie from './brands/sujie';
import u1s1 from './brands/u1s1';
import wavenet from './brands/wavenet';
import weituyun from './brands/weituyun';
import wuyou from './brands/wuyou';
import xingdaomeng from './brands/xingdaomeng';
import yifanyun from './brands/yifanyun';
import yinxingren from './brands/yinxingren';
import yunjieyun from './brands/yunjieyun';
import yuzhouyun from './brands/yuzhouyun';

const RAW_SEEDS: BrandSeed[] = [
  breezenet, dalaoyun, edgenova, ermaoyun, feimaoyun, firefly, flashleap, flyv, guangnianti, guangsuyun,
  huanqiuyun, jilianyun, kexinyun, kuaili, kuajie, laddercloud, lingdongyun, lingmao, liulianyun, muguangjiasu,
  quanqiuyun, shandianyun, shenxingyun, sogoyun, sujie, u1s1, wavenet, weituyun, wuyou, xingdaomeng,
  yifanyun, yinxingren, yunjieyun, yuzhouyun,
];
/** 先用 2026-10-26 的第三方资料补全/更新，再按站长 Excel 修正最低价（Excel 优先） */
const SEEDS: BrandSeed[] = RAW_SEEDS.map(applyThirdParty1026).map(applyThirdParty1020).map(applySingleThirdParty).map(applyOwnerSheet).map(applyOwnerNodes).map(applyOfficial1029).map(applyOwnerNodeTotals).map(applyOwnerRoutes);

const SEED_BY_SLUG = new Map<string, BrandSeed>();
for (const s of SEEDS) {
  if (SEED_BY_SLUG.has(s.slug)) throw new Error(`brands: 重复的 slug ${s.slug}`);
  SEED_BY_SLUG.set(s.slug, s);
}

/** 汇总一个品牌所有“有取值”的字段中出现过的证据等级 */
function gradesPresent(seed: BrandSeed): EvidenceGrade[] {
  const set = new Set<EvidenceGrade>();
  for (const p of seed.plans) for (const o of p.offers) if (o.priceCNY !== null) set.add(o.priceSource.grade);
  for (const r of seed.regions) set.add(r.grade);
  for (const c of [seed.nodeCount, seed.protocols, seed.routeTypes, seed.clients, seed.streaming, seed.ai, seed.deviceLimit, seed.multiplier]) {
    if (c.value !== null) set.add(c.grade);
  }
  return (['A', 'B', 'C', 'D'] as const).filter((g) => set.has(g));
}

/** 至少有页面存档给出价格的套餐报价数量（含与其他来源冲突的报价；不含“仅见于汇编库”与“咨询报价”） */
const pageSourcedOfferCount = (seed: BrandSeed): number =>
  seed.plans.reduce(
    (n, p) => n + p.offers.filter((o) => (o.status === 'sourced' || o.status === 'conflict') && o.priceCNY !== null).length,
    0,
  );

/**
 * 核验状态（单一“标题”状态）。优先级：
 *  演示站 > 品牌对应关系待核验 > 资料不足（没有任何页面存档给出价格）> 有本站测试记录 > 存在冲突/高风险提示 > 部分有来源
 * 具体到字段的证据等级始终单独显示，这个状态不代表套餐/协议/节点/测速全部已核验。
 */
function verificationOf(seed: BrandSeed, hasSiteRecords: boolean, highNotices: number): VerificationStatus {
  if (seed.identity.status === 'demo-site') return 'demo-site';
  if (seed.identity.status === 'mapping-pending' || seed.identity.status === 'name-collision') return 'identity-pending';
  if (seed.identity.status === 'data-incomplete' || pageSourcedOfferCount(seed) === 0) return 'insufficient';
  if (hasSiteRecords) return 'site-tested';
  if (seed.conflicts.length > 0 || highNotices > 0) return 'conflict';
  return 'sourced-partial';
}

export const BRANDS: readonly Brand[] = BRAND_INDEX.map((entry): Brand => {
  const seed = SEED_BY_SLUG.get(entry.slug);
  if (!seed) throw new Error(`brands: 缺少品牌数据 ${entry.slug}`);
  if (
    seed.displayRank !== entry.displayRank ||
    seed.brandName !== entry.brandName ||
    seed.uploadFileNo !== entry.uploadFileNo ||
    seed.shortName !== entry.shortName
  ) {
    throw new Error(`brands: ${entry.slug} 的顺序/名称/上传编号与固定索引不一致`);
  }
  const affiliateUrl = AFFILIATE_URLS[seed.slug];
  if (!affiliateUrl) throw new Error(`brands: ${seed.slug} 缺少推广链接`);

  const site = siteTestSummary(seed.slug);
  const highNoticeCount = seed.notices.filter((n) => n.severity === 'high').length;
  return {
    ...seed,
    brandId: seed.slug,
    affiliateUrl,
    gradesPresent: gradesPresent(seed),
    lastVerifiedAt: site.lastTestDate,
    verificationStatus: verificationOf(seed, site.hasRecords, highNoticeCount),
    siteTest: site,
    conflictCount: seed.conflicts.length,
    highNoticeCount,
  };
});

if (BRANDS.length !== 34) throw new Error(`brands: 品牌数量应为 34，实际 ${BRANDS.length}`);
if (SEEDS.length !== SEED_BY_SLUG.size || SEEDS.length !== 34) throw new Error('brands: 存在未登记或重复的品牌文件');

const BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));
export const getBrand = (slug: string): Brand | undefined => BY_SLUG.get(slug);
export const mustGetBrand = (slug: string): Brand => {
  const b = BY_SLUG.get(slug);
  if (!b) throw new Error(`brands: 未找到品牌 ${slug}`);
  return b;
};
