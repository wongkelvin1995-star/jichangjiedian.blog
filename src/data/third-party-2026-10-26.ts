/**
 * 站长 2026-10-28 提供的一个第三方评测站（18 家机场，资料日期 2026-10-26）。
 *
 * 站长要求：读取资料，但页面上不写是哪个网站；文字全部重写。网址只记在不发布的内部文档
 * docs/INTERNAL_SOURCES.md 里，方便以后核对。
 *
 * 处理规则（在站长 Excel 修正之前执行，所以 Excel 的最低价优先）：
 *  - confirm：数字与站内一致 -> 原来是“仅汇编资料/冲突”的，升级为有来源；否则只注明“与 2026-10-26 资料一致”
 *  - update：数字不同 -> 改为这份较新的资料，说明里保留原来的数字
 *  - add：站内没有的套餐 -> 新增
 *  - stale：这份最新资料的完整价格表里没有的旧套餐 -> 改标“待核对”，不参与排序
 *  - note：只追加说明（例如两份资料说法不同，但暂不改动）
 *  - fill：站内为空或只有待核验（D）的字段，用这份资料补上（C 级）
 * 测速数字没有录入：18 家的结果几乎一样（香港都在 21–26ms、470–565Mbps，美国都在 13–25Mbps），
 * 又是同一天、非晚高峰，看不出是逐家独立测试，不作为测试记录。
 */
import type { BillingPeriod, BrandSeed, Claim, Notice, Plan, PlanCategory, RegionClaim, RouteTypeId } from './types';

export const TP26 = 'tp-2026-10-26';
const DATE = '2026-10-26';

export type Op =
  | { op: 'confirm'; key: string; period?: BillingPeriod; alias?: string }
  | { op: 'update'; key: string; period: BillingPeriod; price?: number; gb?: number; total?: number }
  | { op: 'add'; key: string; name: string; cat: PlanCategory; period: BillingPeriod; price: number; gb?: number; total?: number; note?: string; consult?: boolean }
  | { op: 'stale'; key: string }
  | { op: 'note'; key: string; text: string };

export interface Patch {
  ops: Op[];
  protocols?: string[];
  routeTypes?: RouteTypeId[];
  deviceLimit?: string;
  /** 付款、客服、退款、试用等，合成一条提示 */
  service?: string;
  /** 与站内现有说法不同、暂不改动的字段，写进提示 */
  differs?: string;
  /** 节点总数（站内为空或只是下限宣称时补上） */
  nodeCount?: { value: number; note: string };
  /** 资料列出的地区：站内没有的新增，站内只有 D 级的升级为 C 级 */
  regions?: [code: string, label: string][];
  /** 高风险或需要提醒的事项 */
  risk?: string;
}

const PATCHES: Record<string, Patch> = {
  firefly: {
    ops: [{ op: 'confirm', key: 'annual' }, { op: 'confirm', key: 'lite' }, { op: 'confirm', key: 'plus' }, { op: 'confirm', key: 'blaze' }, { op: 'confirm', key: 'nova' }, { op: 'confirm', key: 'pack-100' },
      { op: 'note', key: 'nova', text: `${DATE} 的第三方资料写 Nova 没有年付选项，站内的年付价格来自较早的页面存档，以官网为准。` }],
    deviceLimit: '不限设备数量',
    service: '付款方式：支付宝、微信支付、USDT（TRC20）。客服 7×24 小时在线，夜间由 AI 客服值守。2026 年 10 月起改用官方专属客户端，不再提供订阅链接。',
  },
  breezenet: {
    ops: [{ op: 'note', key: 'chengfeng', text: `${DATE} 的第三方资料写乘风 ¥27；站长 Excel 和另一家评测页都是 ¥25，按 ¥25。` },
      { op: 'note', key: 'pofeng', text: `${DATE} 的第三方资料写破风 ¥57。` }, { op: 'note', key: 'yufeng', text: `${DATE} 的第三方资料写御风 ¥127。` }],
    service: '客服 7×24 小时在线，夜间由 AI 客服值守（第三方资料）。',
  },
  wuyou: {
    ops: [{ op: 'confirm', key: 'mini' }, { op: 'confirm', key: 'shuxin' }, { op: 'confirm', key: 'shengxin' }, { op: 'confirm', key: 'suixin' }, { op: 'confirm', key: 'wangyou' }, { op: 'confirm', key: 'pack-100' },
      { op: 'add', key: 'pack-300', name: '300G 永久不限时', cat: 'one-time-pack', period: 'one-time', price: 298, total: 300 }],
    deviceLimit: '不限设备数量，全线节点无倍率、不限速',
    service: '客服 7×24 小时在线，夜间由 AI 客服值守。第三方资料提到支持 TikTok 跨区直连与直播（服务商说法，本站未测试）。',
  },
  flashleap: {
    ops: [{ op: 'confirm', key: 'annual' }, { op: 'confirm', key: 'flicker' }, { op: 'confirm', key: 'leap' }, { op: 'confirm', key: 'teleport' }, { op: 'confirm', key: 'warp' }],
  },
  lingmao: {
    ops: [{ op: 'confirm', key: 'annual-small' }, { op: 'confirm', key: 'small' }, { op: 'confirm', key: 'big' }],
    deviceLimit: '不限设备，不限速，1 倍流量',
    differs: `${DATE} 的第三方资料把线路写作“中转优化线路”，与页面存档的“IPLC 专线”不同，线路类型以官网为准。`,
  },
  kuajie: {
    ops: [{ op: 'add', key: 'annual-pack', name: '跨界年付版', cat: 'annual-small', period: 'annual', price: 96, gb: 60 },
      { op: 'confirm', key: 'lite' }, { op: 'confirm', key: 'leap' }, { op: 'confirm', key: 'soar' }, { op: 'confirm', key: 'infinity' }],
    service: '付款方式：微信、支付宝（第三方资料）。线路细节和客户端支持的平台，第三方资料也说公开信息不详，建议下单前问客服。',
  },
  feimaoyun: {
    ops: [{ op: 'confirm', key: 'student' }, { op: 'confirm', key: 'xingyao' }, { op: 'confirm', key: 'xinghuan' }, { op: 'confirm', key: 'yinhe' }, { op: 'confirm', key: 'yuzhou' }, { op: 'confirm', key: 'unlimited-1000' }],
  },
  weituyun: {
    ops: [
      { op: 'add', key: 'annual-plus', name: '年付加强专线', cat: 'annual-small', period: 'annual', price: 120, gb: 75 },
      { op: 'update', key: 'annual', period: 'annual', price: 79.9, gb: 45 },
      { op: 'note', key: 'monthly-100', text: `${DATE} 的第三方资料把它写作“节假日限时开启（14.9 元）”，是限时活动，不是常规套餐。` },
      { op: 'add', key: 'advanced', name: '进阶版', cat: 'monthly-tier', period: 'monthly', price: 29.9, gb: 200 },
      { op: 'add', key: 'pro', name: '专业版', cat: 'monthly-tier', period: 'monthly', price: 59.9, gb: 500 },
      { op: 'add', key: 'supreme', name: '至尊版', cat: 'monthly-tier', period: 'monthly', price: 119.9, gb: 1000 },
      { op: 'add', key: 'pack-100', name: '永久不限时 100GB', cat: 'one-time-pack', period: 'one-time', price: 100, total: 100 },
      { op: 'add', key: 'pack-200', name: '永久不限时 200GB', cat: 'one-time-pack', period: 'one-time', price: 160, total: 200 },
      { op: 'add', key: 'pack-500', name: '永久不限时 500GB', cat: 'one-time-pack', period: 'one-time', price: 340, total: 500 },
      { op: 'stale', key: 'alt-entry' }, { op: 'stale', key: 'alt-payg' }, { op: 'stale', key: 'alt-business' },
    ],
    service: `${DATE} 的第三方资料列出了完整的价格表（年付、月付、永久流量包），看起来服务在正常销售；但旧存档里“节点全部暂时无法使用”的公告没有日期，仍请以官网当前状态为准。`,
  },
  u1s1: {
    ops: [{ op: 'confirm', key: 'basic', alias: '就是好用包' }, { op: 'confirm', key: 'advanced', alias: '普通人真够了包' }, { op: 'confirm', key: 'high', alias: '你以为用不到包' },
      { op: 'confirm', key: 'business', alias: '瘾大就拉满包' }, { op: 'confirm', key: 'team', alias: '我全都要包' }],
    service: '第三方资料称 2025 年上线、官方宣称 2000Mbps 带宽且晚高峰不限速；运营时间短，长期稳定性和售后还需要观察。',
    differs: `${DATE} 的第三方资料把线路写作 IPLC，与页面存档的“BGP + IEPL”不同，线路类型以官网为准。`,
  },
  guangsuyun: {
    ops: [{ op: 'note', key: 'speed', text: `${DATE} 的第三方资料写极速版 ¥23 / 每月 138GB。` }, { op: 'confirm', key: 'lite' }, { op: 'confirm', key: 'flow' },
      { op: 'add', key: 'quantum', name: '量子版', cat: 'monthly-tier', period: 'monthly', price: 68, gb: 450 },
      { op: 'add', key: 'boundless', name: '无界版', cat: 'monthly-tier', period: 'monthly', price: 130, gb: 900 },
      { op: 'add', key: 'pack-1000', name: '不限时套餐', cat: 'one-time-pack', period: 'one-time', price: 680, total: 1000 },
      { op: 'add', key: 'custom', name: '定制套餐', cat: 'custom', period: 'monthly', price: 680, gb: 500, consult: true, note: '定制方案，以客服报价为准。' }],
    routeTypes: ['iplc', 'relay'],
    service: '第三方资料：特殊商品不支持退款；AI 工具不是每个节点都稳定，可能需要手动切换节点。建议先买月付或小额套餐。',
  },
  sogoyun: {
    ops: [{ op: 'confirm', key: 'xiaobao' }, { op: 'confirm', key: 'basic' }, { op: 'confirm', key: 'select' }, { op: 'confirm', key: 'plus' },
      { op: 'note', key: 'top', text: `${DATE} 的第三方资料写顶配版 ¥150 / 每月 1.1TB。` },
      { op: 'confirm', key: 'pack-120' }, { op: 'confirm', key: 'pack-250' }, { op: 'confirm', key: 'pack-500' }, { op: 'confirm', key: 'pack-1000' }],
    protocols: ['VLESS'],
    routeTypes: ['iepl', 'bgp'],
    deviceLimit: '不限设备数量，不限速',
    service: '只能用自研客户端（Windows、macOS、iOS、Android、主流软路由），不能用 Clash 或 Shadowrocket。官方不提供试用。第三方资料称覆盖约 15 个国家和地区，但没有列出完整名单。',
  },
  xingdaomeng: {
    ops: [{ op: 'confirm', key: 'xiaobao' }, { op: 'confirm', key: 'over150' }, { op: 'confirm', key: 'adv300' }, { op: 'confirm', key: 'flash500' }, { op: 'confirm', key: 'flagship1t' },
      { op: 'confirm', key: 'pack-100' }, { op: 'confirm', key: 'pack-300' }, { op: 'confirm', key: 'pack-1t' },
      { op: 'add', key: 'custom', name: '定制套餐', cat: 'custom', period: 'monthly', price: 680, gb: 500, consult: true, note: '定制方案，以客服报价为准。' }],
    protocols: ['Trojan'],
    deviceLimit: '不限设备，1 倍流量',
    differs: `${DATE} 的第三方资料把线路写作 IEPL，与页面存档的“直连 + IPLC”不同，线路类型以官网为准。`,
  },
  ermaoyun: {
    ops: [
      { op: 'add', key: 'pack-100', name: '二猫云 · 不限时套餐', cat: 'one-time-pack', period: 'one-time', price: 99, total: 100 },
      { op: 'add', key: 'annual-pack', name: '二猫年付小包', cat: 'annual-small', period: 'annual', price: 89, gb: 60 },
      { op: 'add', key: 'orange', name: '二猫云 · 橘猫畅玩版', cat: 'monthly-tier', period: 'monthly', price: 40, gb: 230 },
      { op: 'add', key: 'milk', name: '二猫云 · 牛奶猫尊享版', cat: 'monthly-tier', period: 'monthly', price: 80, gb: 430 },
      { op: 'add', key: 'black', name: '二猫云 · 黑猫重度用户版', cat: 'monthly-tier', period: 'monthly', price: 160, gb: 850 },
      { op: 'stale', key: 'trial' }, { op: 'stale', key: 'fast' }, { op: 'stale', key: 'flagship' }, { op: 'stale', key: 'enterprise' },
    ],
    protocols: ['VLESS'],
    differs: `${DATE} 的第三方资料写“账号不限设备连接数”，与页面存档按套餐限 2 / 4 / 8 台不同；资料还说节点主要在香港、日本、美国，以官网为准。`,
  },
  yifanyun: {
    ops: [{ op: 'confirm', key: 'annual' }, { op: 'confirm', key: 'light' }, { op: 'confirm', key: 'comfort' }, { op: 'confirm', key: 'premium' }, { op: 'confirm', key: 'ultimate' },
      { op: 'add', key: 'pack-100', name: '轻享版 · 不限时包', cat: 'one-time-pack', period: 'one-time', price: 100, total: 100 },
      { op: 'add', key: 'pack-250', name: '舒享版 · 不限时包', cat: 'one-time-pack', period: 'one-time', price: 200, total: 250 },
      { op: 'add', key: 'pack-500', name: '尊享版 · 不限时包', cat: 'one-time-pack', period: 'one-time', price: 400, total: 500 }],
    protocols: ['Hysteria 2', 'VLESS-Reality', 'Shadowsocks'],
    routeTypes: ['iepl'],
    deviceLimit: '不限设备数量，不限速',
    service: '官方不提供试用。服务商称全节点 IEPL 专线、原生住宅 IP、单节点 2Gbps 带宽，本站未核验。',
  },
  muguangjiasu: {
    ops: [{ op: 'confirm', key: 'basic' }, { op: 'note', key: 'standard', text: `${DATE} 的第三方资料写标准版每月 240GB，页面存档写 300GB。` },
      { op: 'confirm', key: 'flagship' }, { op: 'confirm', key: 'supreme' },
      { op: 'note', key: 'annual-lite', text: `${DATE} 的第三方资料写“每月 70GB”，与页面存档的“全年 70GB”不同。` },
      { op: 'confirm', key: 'pack-150' }, { op: 'confirm', key: 'pack-400' }, { op: 'confirm', key: 'pack-800' },
      { op: 'note', key: 'custom', text: `${DATE} 的第三方资料写独享私人定制节点 ¥600，每月 500GB。` }],
    routeTypes: ['bgp'],
    deviceLimit: '支持多设备同时在线（未写数量）',
    service: '服务商称 7×24 小时真人客服。客户端支持 Windows、macOS、iOS、Android、Linux。',
  },
  quanqiuyun: {
    ops: [{ op: 'add', key: 'pack-100', name: '不限时轻量包', cat: 'one-time-pack', period: 'one-time', price: 100, total: 100 },
      { op: 'add', key: 'pack-400', name: '不限时标准包', cat: 'one-time-pack', period: 'one-time', price: 360, total: 400 },
      { op: 'add', key: 'pack-800', name: '不限时大容量包', cat: 'one-time-pack', period: 'one-time', price: 700, total: 800 },
      { op: 'add', key: 'annual-lite', name: '轻量版（年付）', cat: 'annual-small', period: 'annual', price: 99, gb: 59 },
      { op: 'confirm', key: 'entry' }, { op: 'confirm', key: 'advanced' }, { op: 'confirm', key: 'high' }, { op: 'confirm', key: 'business' },
      { op: 'note', key: 'dedicated', text: `${DATE} 的第三方资料写独享私人专线节点 ¥680，与页面存档的 ¥600 不同。` }],
    service: '服务商称全球 60 多个节点、2Gbps 以上带宽，本站未核验。',
  },
  yinxingren: {
    ops: [{ op: 'confirm', key: 'xingyao' }, { op: 'confirm', key: 'baiyin' }, { op: 'confirm', key: 'huangjin' }, { op: 'confirm', key: 'bojin' }, { op: 'confirm', key: 'zuanshi' },
      { op: 'confirm', key: 'wangzhe' }, { op: 'confirm', key: 'pack-160' }, { op: 'confirm', key: 'pack-420' }, { op: 'confirm', key: 'pack-1000' }],
    service: '只能用自带客户端，不提供订阅链接，Clash、Shadowrocket 不可用。官方不提供试用。',
  },
  dalaoyun: {
    ops: [],
    service: '付款方式：只支持支付宝。官方不提供试用。只能用自带客户端，Clash、Shadowrocket 不可用（第三方资料）。',
    differs: `${DATE} 的第三方资料标题写“¥19.99/月起、每月 150GB”，与站长 Excel 的 120GB 不同，按 Excel。`,
  },
};

const isWeak = (c: Claim<unknown>) => c.value === null || c.grade === 'D';

export const applyThirdParty1026 = makeApplier(TP26, DATE, PATCHES);

export function makeApplier(SRC: string, DATE: string, PATCHES: Record<string, Patch>) {
  const SAME = `与 ${DATE} 的第三方资料一致。`;
  return function apply(seed: BrandSeed): BrandSeed {
  const patch = PATCHES[seed.slug];
  if (!patch) return seed;
  const plans: Plan[] = seed.plans.map((p) => ({ ...p, offers: p.offers.map((o) => ({ ...o })) }));
  const find = (key: string) => plans.find((p) => p.planId === `${seed.slug}-${key}`);
  const append = (note: string | undefined, add: string) => [note, add].filter(Boolean).join(' ');

  for (const op of patch.ops) {
    if (op.op === 'add') {
      if (find(op.key)) throw new Error(`third-party ${SRC}: ${seed.slug} 已有套餐 ${op.key}`);
      plans.push({
        planId: `${seed.slug}-${op.key}`,
        brandId: seed.slug,
        name: op.name,
        category: op.cat,
        offers: [{
          offerId: `${seed.slug}-${op.key}-${op.period}`,
          billingPeriod: op.period,
          priceCNY: op.price,
          monthlyTrafficGB: op.gb ?? null,
          totalTrafficGB: op.total ?? null,
          trafficResetRule: op.total ? '一次性流量，用完为止' : null,
          priceSource: { sourceId: SRC, grade: 'C' },
          sourceRecordedAt: DATE,
          lastVerifiedAt: null,
          status: op.consult ? 'consult' : 'sourced',
          note: append(op.note, `来自 ${DATE} 的第三方资料，此前的资料里没有这个套餐。`),
        }],
      });
      continue;
    }
    const plan = find(op.key);
    if (!plan) throw new Error(`third-party ${SRC}: ${seed.slug} 找不到套餐 ${op.key}`);
    if (op.op === 'stale') {
      for (const o of plan.offers) {
        if (o.status === 'consult') continue;
        o.status = 'conflict';
        o.priceSource = { ...o.priceSource, grade: 'D' };
        o.note = append(o.note, `${DATE} 的第三方资料列出了完整价格表，其中没有这个套餐，可能已下架，待核对。`);
      }
    } else if (op.op === 'note') {
      for (const o of plan.offers) o.note = append(o.note, op.text);
    } else if (op.op === 'confirm') {
      const targets = plan.offers.filter((o) => !op.period || o.billingPeriod === op.period);
      for (const o of targets) {
        const alias = op.alias ? `第三方资料里的套餐名是“${op.alias}”。` : '';
        if (o.status === 'compiled-only' || o.status === 'conflict') {
          o.status = 'sourced';
          o.priceSource = { sourceId: SRC, grade: 'C' };
          o.sourceRecordedAt = DATE;
          o.note = `${SAME}${alias}${o.note ? `此前的说明：${o.note}` : ''}`;
        } else {
          o.note = append(o.note, `${SAME}${alias}`);
        }
      }
    } else if (op.op === 'update') {
      const o = plan.offers.find((x) => x.billingPeriod === op.period);
      if (!o) throw new Error(`third-party ${SRC}: ${seed.slug} ${op.key} 没有 ${op.period} 报价`);
      const before = `¥${o.priceCNY ?? '—'}${o.monthlyTrafficGB ? ` / 每月 ${o.monthlyTrafficGB}GB` : o.totalTrafficGB ? ` / ${o.totalTrafficGB}GB` : ''}`;
      if (op.price !== undefined) o.priceCNY = op.price;
      if (op.gb !== undefined) { o.monthlyTrafficGB = op.gb; o.totalTrafficGB = null; }
      if (op.total !== undefined) { o.totalTrafficGB = op.total; o.monthlyTrafficGB = null; }
      o.status = 'sourced';
      o.priceSource = { sourceId: SRC, grade: 'C' };
      o.sourceRecordedAt = DATE;
      o.note = `按 ${DATE} 的第三方资料更新；此前的资料是 ${before}。`;
    }
  }

  const next: BrandSeed = { ...seed, plans, notices: [...seed.notices], sourceIds: [...new Set([...seed.sourceIds, SRC])] };
  if (patch.protocols && isWeak(seed.protocols)) next.protocols = { value: patch.protocols, grade: 'C', sourceIds: [SRC], recordedAt: DATE };
  if (patch.routeTypes && isWeak(seed.routeTypes)) next.routeTypes = { value: patch.routeTypes, grade: 'C', sourceIds: [SRC], recordedAt: DATE };
  if (patch.deviceLimit && isWeak(seed.deviceLimit)) next.deviceLimit = { value: patch.deviceLimit, grade: 'C', sourceIds: [SRC], recordedAt: DATE };
  const extra: Notice[] = [];
  if (patch.service) extra.push({ type: 'service-notice', severity: 'info', text: `${DATE} 的第三方资料：${patch.service}`, sourceIds: [SRC] });
  if (patch.differs) extra.push({ type: 'data-gap', severity: 'info', text: patch.differs, sourceIds: [SRC] });
  if (patch.risk) extra.push({ type: 'operational-risk', severity: 'warn', text: `${DATE} 的第三方资料：${patch.risk}`, sourceIds: [SRC] });
  next.notices.push(...extra);
  if (patch.nodeCount && (seed.nodeCount.value === null || seed.nodeCount.grade === 'D' || /下限|不少于/.test(seed.nodeCount.note ?? ''))) {
    next.nodeCount = { value: patch.nodeCount.value, grade: 'C', sourceIds: [SRC], recordedAt: DATE, note: patch.nodeCount.note };
  }
  if (patch.regions) {
    const regions: RegionClaim[] = seed.regions.map((r) => ({ ...r }));
    for (const [code, label] of patch.regions) {
      const ex = regions.find((r) => r.countryCode === code);
      if (!ex) regions.push({ countryCode: code, label, nodeCount: null, grade: 'C', sourceIds: [SRC], recordedAt: DATE, note: `${DATE} 的第三方资料列出此地区，未写节点数` });
      else if (ex.grade === 'D') Object.assign(ex, { grade: 'C', sourceIds: [...new Set([...ex.sourceIds, SRC])], recordedAt: DATE, note: `${DATE} 的第三方资料列出此地区（此前只有待核验线索）` });
    }
    next.regions = regions;
  }
  return next;
  };
}
