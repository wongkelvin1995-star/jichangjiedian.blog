/**
 * 品牌页的导购内容：一句话概括、适合谁 / 不太适合谁、独立分析、常见问题。
 *
 * 原则：
 *  1. 每句话都来自该品牌数据文件里的字段或 note，没有资料的字段不写；不写退款、试用、客服、解锁能力、测速结果、用户评价。
 *  2. “适合谁”只写该品牌在 34 家中有区分度的理由（排前 1/3 才写），理由按稀有程度排序；
 *     “不太适合谁”来自 notices、conflicts、设备限制、套餐缺失、最低价偏高、资料日期缺失。
 *  3. 一句话概括与 FAQ 按品牌类型（实测型 / 风险型 / 低价型 / 大流量型 / 地区广型 / 专线型 / 常规型）选不同句式。
 *  4. “独立分析”里的数字全部由 brand-stats 从套餐数据算出。
 */
import { OWNER_MARK_READ_AT, ownerMarksFor } from '../data/owner-marks';
import { planDetailsFor } from '../data/plan-details';
import { BILLING_LABEL, BILLING_MONTHS } from '../data/types';
import type { Brand } from '../data/types';
import { crossStats } from './brand-stats';
import type { BrandFacts, Rank } from './brand-stats';
import { routeChipsOf } from './queries';

export type Profile = 'tested' | 'risk' | 'cheap' | 'big' | 'wide' | 'premium' | 'plain';

export interface FaqItem {
  q: string;
  a: string;
  /** 站内教程链接（只用于通用操作问题，页面上渲染为链接；结构化数据只用 a 的文字） */
  href?: string;
  linkText?: string;
}

export interface BrandPitch {
  profile: Profile;
  low: { name: string; price: number; gb: number } | null;
  perGB: number | null;
  priceRange: { min: number; max: number; tiers: number } | null;
  biggest: { name: string; price: number; gb: number } | null;
  nodes: string | null;
  regions: string[];
  routes: string[];
  device: string | null;
  hasAnnual: boolean;
  hasPack: boolean;
  stable: string[];
  fitFor: string[];
  notFor: string[];
  analysis: string[];
  verdict: string;
  description: string;
  faq: FaqItem[];
}

const yuan = (n: number) => `¥${Number.isInteger(n) ? n : n.toFixed(2).replace(/0$/, '')}`;
const pct = (a: number, b: number) => `${Math.round((Math.abs(a - b) / b) * 100)}%`;
const rankText = (r: Rank | null) => (r ? `${r.tied ? '并列' : ''}第 ${r.rank}/${r.of}` : '');
/** 去掉“2026-10-20 的第三方资料：”这类前缀，取第一句；超长时在最后一个逗号处截断 */
const clip = (s: string, max: number) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const i = cut.lastIndexOf('，');
  return `${i > max / 2 ? cut.slice(0, i) : cut}…`;
};
const stripPrefix = (t: string) => t.replace(/^\d{4}-\d{2}-\d{2} 的第三方资料[：:]\s*/, '').replace(/^(第三方资料|页面|评测页|对比站|演示页|服务商面板|汇编资料库)[：:]\s*/, '');
const firstSentence = (t: string, max = 64) => clip(stripPrefix(t).split(/[。；]/)[0]!.trim(), max);
/** 提示类文字：优先取带“待核验 / 没有 / 不”等保留词的那一句，避免只摘到正面半句 */
const cautionSentence = (t: string, max = 72) => {
  const parts = stripPrefix(t).split(/[。；]/).map((x) => x.trim()).filter(Boolean);
  const hit = parts.find((x) => !/已核验$/.test(x) && /待|未|没有|不|仅|只|疑|矛盾|风险|观察|请|问题|失效|中断|攻击|超时|排队|无关|同名|演示/.test(x));
  return clip(hit ?? parts[0] ?? '', max);
};
const plainNote = (t: string, max: number) => firstSentence(t.replace(/^页面标注/, '').replace(/[“”"]/g, ''), max);

function profileOf(b: Brand, f: BrandFacts): Profile {
  const st = crossStats();
  if (b.siteTest.hasRecords) return 'tested';
  const risky =
    b.highNoticeCount > 0 ||
    b.verificationStatus === 'demo-site' ||
    b.verificationStatus === 'identity-pending' ||
    b.verificationStatus === 'insufficient' ||
    b.notices.some((n) => (n.type === 'operational-risk' || n.type === 'demo-site') && n.severity !== 'info');
  if (risky) return 'risk';
  if (f.low && (st.rankPerGB(b.slug)?.top || st.rankLowest(b.slug)?.top)) return 'cheap';
  if (st.rankBiggest(b.slug)?.top) return 'big';
  if (st.rankRegions(b.slug)?.top) return 'wide';
  if (f.premium) return 'premium';
  return 'plain';
}

export function brandPitch(b: Brand): BrandPitch {
  const st = crossStats();
  const f = st.facts[b.slug]!;
  const profile = profileOf(b, f);
  const low = f.low ? { name: f.low.name, price: f.low.price, gb: f.low.gb } : null;
  const perGB = f.low?.perGB ?? null;
  const priceRange = f.tiers ? { min: f.tiers.min, max: f.tiers.max, tiers: f.tiers.count } : null;
  const biggest = f.biggest ? { name: f.biggest.name, price: f.biggest.price, gb: f.biggest.gb } : null;
  const v = b.nodeCount.value;
  const nodes = v === null ? null : /下限|不少于|50\+|60\+/.test(b.nodeCount.note ?? '') ? `${v}+` : `${v}`;
  const regions = b.regions.filter((r) => r.grade !== 'D').map((r) => r.label);
  const routes = routeChipsOf(b).filter((r) => r.confirmed).map((r) => r.label);
  const premiumRoutes = routes.filter((r) => /IPLC|IEPL/i.test(r));
  const device = b.deviceLimit.value && b.deviceLimit.grade !== 'D' ? b.deviceLimit.value : null;
  const stable = ownerMarksFor(b.slug).map((m) => m.service);
  const rLow = st.rankLowest(b.slug);
  const rPer = st.rankPerGB(b.slug);
  const rBig = st.rankBiggest(b.slug);
  const rReg = st.rankRegions(b.slug);
  const S = b.shortName;
  const det = planDetailsFor(b.slug);
  const typeRank: Record<string, number> = { 'demo-site': 0, identity: 1, 'operational-risk': 2, 'service-notice': 3, 'data-gap': 4 };
  const riskNotices = b.notices
    .filter((n) => n.severity !== 'info')
    .sort((a, z) => (a.severity === 'high' ? 0 : 1) - (z.severity === 'high' ? 0 : 1) || (typeRank[a.type] ?? 9) - (typeRank[z.type] ?? 9));

  // ---------------------------------------------------------------- 适合谁：按稀有程度排序，最多 4 条
  const cand: { key: string; text: string }[] = [];
  if (f.low && rPer?.top) cand.push({ key: 'perGB', text: `看每 GB 单价的人：入门档「${f.low.name}」${yuan(f.low.price)}/月 ${f.low.gb}GB，约 ${yuan(f.low.perGB)}/GB，在本站 34 家里排${rankText(rPer)}（中位数 ${yuan(st.medianPerGB)}/GB）。` });
  if (f.low && rLow?.top && !(rPer?.top && f.low.price > st.medianLowest)) cand.push({ key: 'cheap', text: `预算有限、先买一个月试试的人：最低月付 ${yuan(f.low.price)}，低于 34 家最低价的中位数 ${yuan(st.medianLowest)}。` });
  if (f.biggest && rBig?.top) cand.push({ key: 'big', text: `流量用得多的人：顶档「${f.biggest.name}」每月 ${f.biggest.gb}GB（${yuan(f.biggest.price)}，约 ${yuan(f.biggest.perGB)}/GB），最大月流量在 34 家里排${rankText(rBig)}。` });
  if (rReg?.top && regions.length) cand.push({ key: 'regions', text: `需要多个出口地区的人：资料里有 ${regions.length} 个地区（${regions.slice(0, 6).join('、')}${regions.length > 6 ? ' 等' : ''}），地区数在 34 家里排${rankText(rReg)}。` });
  if (f.student) cand.push({ key: 'student', text: `学生：有「${f.student}」${f.annual && f.annual.name === f.student ? `，${yuan(f.annual.price)}/年、每月 ${f.annual.monthlyGB}GB，折合约 ${yuan(f.annual.perMonth)}/月` : ''}。` });
  if (f.annual && f.annual.name !== f.student) cand.push({ key: 'annual', text: `用量不大、想一年只付一次的人：「${f.annual.name}」${yuan(f.annual.price)}/年、每月 ${f.annual.monthlyGB}GB，折合约 ${yuan(f.annual.perMonth)}/月。` });
  if (f.packs.length) {
    const p0 = f.packs[0]!;
    cand.push({ key: 'pack', text: `偶尔才用、不想按月续费的人：有 ${f.packs.length} 档一次性流量包，最小「${p0.name}」${yuan(p0.price)} / ${p0.gb}GB${p0.rule ? `（${firstSentence(p0.rule, 30)}）` : ''}。` });
  }
  if (f.custom && f.custom.price !== null) cand.push({ key: 'custom', text: `需要独享线路或固定 IP 的人：有「${f.custom.name}」${yuan(f.custom.price)}/月${f.custom.gb ? `、${f.custom.gb}GB` : ''}${f.custom.note ? `，资料写“${plainNote(f.custom.note, 30)}”` : ''}，细节以客服报价为准。` });
  if (f.premium && premiumRoutes.length) cand.push({ key: 'premium', text: `在意跨境链路类型的人：资料写线路为 ${premiumRoutes.join(' / ')} 专线（服务商说法，本站未核验）。` });
  if (f.deviceUnlimited) cand.push({ key: 'device', text: `多台设备一起用的人：资料写“${device}”。` });
  if (f.periods.some((p) => p === 'biennial' || p === 'triennial')) cand.push({ key: 'longCycle', text: `想一次付两三年的人：资料列出 ${[...f.periods].sort((a, z) => (BILLING_MONTHS[a] ?? 0) - (BILLING_MONTHS[z] ?? 0)).map((p) => BILLING_LABEL[p]).join('、')} 共 ${f.periods.length} 种付款周期的标价。` });
  if (b.siteTest.hasRecords) cand.push({ key: 'tested', text: `想先看本站实测再决定的人：本站对${S}有带日期的测试记录（最近 ${b.siteTest.lastTestDate}），见本页“实测”。` });
  const fitFor = cand
    .map((c) => ({ ...c, n: st.traitCount[c.key] ?? 0 }))
    .sort((a, z) => a.n - z.n)
    .slice(0, 4)
    .map((c) => c.text);
  if (fitFor.length < 2) fitFor.push(`资料不足以判断${S}更适合哪类用户：目前只有 ${fitFor.length ? '上面这一条' : '价格表'}能说明问题，其余字段待核验。`);

  // ---------------------------------------------------------------- 不太适合谁 / 注意：1–3 条
  const notFor: string[] = [];
  if (f.deviceLimited && device) notFor.push(`多设备同时在线的人：资料写“${device}”。`);
  for (const n of riskNotices.slice(0, 2)) notFor.push(`${n.type === 'demo-site' ? '把这份资料当官网的人' : n.type === 'identity' ? '按名字搜官网的人' : n.type === 'operational-risk' ? '要求长期稳定的人' : '想拿本页资料当最终依据的人'}：${cautionSentence(n.text)}。`);
  if (notFor.length < 3 && b.conflicts.length) notFor.push(`想要一个确定价格的人：${b.conflicts[0]!.field}有两份资料不一致，本页${firstSentence(b.conflicts[0]!.handling, 40)}。`);
  if (notFor.length < 3 && f.low && rLow?.bottom) notFor.push(`预算很低的人：最低月付 ${yuan(f.low.price)}，在 34 家里偏高（中位数 ${yuan(st.medianLowest)}）。`);
  if (notFor.length < 3 && !f.annual && !f.packs.length) notFor.push(`只想买小额年付或一次性流量包的人：资料里没有这两类套餐。`);
  if (notFor.length < 3 && f.low && !f.low.dated) notFor.push(`要求价格有日期的人：最低价一档的来源没有标注日期，购买前以官网结算页为准。`);
  if (notFor.length < 3 && b.identity.status !== 'name-confirmed') notFor.push(`按名字搜官网的人：资料页面用的名称与本站名称不同（见“关于名称”），请从本页入口进入。`);
  if (!notFor.length) notFor.push(`资料里没有发现明显的限制项；价格以官网当天为准。`);
  notFor.splice(3);

  // ---------------------------------------------------------------- 独立分析：全部由数据算出
  const analysis: string[] = [];
  if (f.low) {
    const d = f.low.price - st.medianLowest;
    analysis.push(`入门档每 GB 成本：${yuan(f.low.price)} ÷ ${f.low.gb}GB ≈ ${yuan(f.low.perGB)}/GB，34 家里排${rankText(rPer)}（中位数 ${yuan(st.medianPerGB)}/GB）。`);
    analysis.push(`最低月付 ${yuan(f.low.price)}，${d === 0 ? '等于' : d < 0 ? `低于` : `高于`} 34 家最低价的中位数 ${yuan(st.medianLowest)}${d !== 0 ? `（差 ${yuan(Math.abs(Math.round(d * 100) / 100))}，约 ${pct(f.low.price, st.medianLowest)}）` : ''}。`);
  }
  if (f.tiers && f.bestValue) analysis.push(`月付共 ${f.tiers.count} 档（${yuan(f.tiers.min)}–${yuan(f.tiers.max)}）；每 GB 最便宜的是「${f.bestValue.name}」${yuan(f.bestValue.price)} / ${f.bestValue.gb}GB ≈ ${yuan(f.bestValue.perGB)}/GB。`);
  if (f.annual) analysis.push(`年付「${f.annual.name}」${yuan(f.annual.price)} ÷ 12 ≈ ${yuan(f.annual.perMonth)}/月，每月 ${f.annual.monthlyGB}GB，≈ ${yuan(f.annual.perGB)}/GB${f.low ? `（入门月付档 ${yuan(f.low.perGB)}/GB）` : ''}。`);
  if (f.packs.length === 1) analysis.push(`一次性流量包 1 档：「${f.packs[0]!.name}」${yuan(f.packs[0]!.price)} / ${f.packs[0]!.gb}GB ≈ ${yuan(f.packs[0]!.perGB)}/GB。`);
  else if (f.packs.length) analysis.push(`一次性流量包 ${f.packs.length} 档：${yuan(f.packs[0]!.price)}–${yuan(f.packs[f.packs.length - 1]!.price)}，每 GB ${yuan(Math.min(...f.packs.map((p) => p.perGB)))}–${yuan(Math.max(...f.packs.map((p) => p.perGB)))}。`);
  if (f.biggest) analysis.push(`最大月流量档「${f.biggest.name}」${f.biggest.gb}GB/月，34 家里排${rankText(rBig)}（中位数 ${st.medianBiggestGB}GB）。`);
  if (regions.length) analysis.push(`有记录的地区 ${regions.length} 个，34 家里排${rankText(rReg)}（中位数 ${st.medianRegions} 个）。`);

  // ---------------------------------------------------------------- 一句话概括：按类型选句式
  const lowStr = f.low ? `「${f.low.name}」${yuan(f.low.price)}/月 ${f.low.gb}GB（约 ${yuan(f.low.perGB)}/GB）` : '';
  const nodeStr = nodes || regions.length ? `${nodes ? `${nodes} 个节点，` : ''}覆盖 ${regions.slice(0, 5).join('、')}${regions.length > 5 ? ` 等 ${regions.length} 个地区` : ''}` : '';
  const routeStr = routes.length ? `线路资料写 ${routes.join(' / ')}` : '';
  const topRisk = riskNotices[0];
  let verdict: string;
  switch (profile) {
    case 'tested':
      verdict = `${S}是本站目前唯一有带日期晚高峰测试记录的机场（最近 ${b.siteTest.lastTestDate}）；最低档${lowStr}，${nodeStr}；${routeStr}。实测数字见本页“实测”，不等于长期表现。`;
      break;
    case 'risk':
      verdict = `${S}的资料先看风险再看价格：${topRisk ? cautionSentence(topRisk.text, 90) : '存在待核验项'}。${f.low ? `已记录的最低档是${lowStr}` : '目前没有可用的月付价格'}${nodeStr ? `，${nodeStr}` : ''}。`;
      break;
    case 'cheap':
      verdict = rPer?.top
        ? `${S}的卖点在单价：最低档${lowStr}，每 GB 成本在 34 家里排${rankText(rPer)}，最低月付 ${yuan(f.low!.price)} ${f.low!.price < st.medianLowest ? '低于' : f.low!.price === st.medianLowest ? '等于' : '高于'}中位数 ${yuan(st.medianLowest)}${nodeStr ? `；${nodeStr}` : ''}${routeStr ? `；${routeStr}` : ''}。`
        : `${S}的入门门槛低：最低月付 ${yuan(f.low!.price)} 在 34 家里排${rankText(rLow)}（中位数 ${yuan(st.medianLowest)}），但这一档只有 ${f.low!.gb}GB，每 GB 约 ${yuan(f.low!.perGB)} 排${rankText(rPer)}，流量多的话要看上面的档位${nodeStr ? `；${nodeStr}` : ''}${routeStr ? `；${routeStr}` : ''}。`;
      break;
    case 'big':
      verdict = `${S}的特点是大流量档位：顶档「${f.biggest!.name}」每月 ${f.biggest!.gb}GB（${yuan(f.biggest!.price)}），在 34 家里排${rankText(rBig)}；入门档${lowStr}${nodeStr ? `；${nodeStr}` : ''}。`;
      break;
    case 'wide':
      verdict = `${S}的地区覆盖在 34 家里排${rankText(rReg)}：${nodeStr}；入门档${lowStr}${routeStr ? `；${routeStr}` : ''}。`;
      break;
    case 'premium':
      verdict = `${S}主打 ${premiumRoutes.join(' / ')} 专线（服务商说法，本站未核验）；入门档${lowStr}${f.tiers ? `，月付共 ${f.tiers.count} 档` : ''}${nodeStr ? `；${nodeStr}` : ''}。`;
      break;
    default:
      verdict = `${S}${f.tiers ? `月付从 ${yuan(f.tiers.min)} 到 ${yuan(f.tiers.max)} 共 ${f.tiers.count} 档，` : ''}入门档${lowStr}${nodeStr ? `；${nodeStr}` : ''}${routeStr ? `；${routeStr}` : ''}。`;
  }

  // ---------------------------------------------------------------- SEO description（50–160 字，每家不同）
  const profileWord: Record<Profile, string> = { tested: '本站有晚高峰实测记录', risk: '资料有待核验项', cheap: `每 GB 成本 34 家中${rankText(rPer)}`, big: `最大月流量 34 家中${rankText(rBig)}`, wide: `地区数 34 家中${rankText(rReg)}`, premium: `${premiumRoutes.join('/')} 专线（服务商说法）`, plain: `月付 ${f.tiers ? `${f.tiers.count} 档` : ''}` };
  const nameT = /[A-Za-z0-9]$/.test(b.brandName) ? `${b.brandName} ` : b.brandName;
  let description = `${nameT}机场怎么样：${profileWord[profile]}；${f.low ? `最低 ${yuan(f.low.price)}/月 ${f.low.gb}GB（约 ${yuan(f.low.perGB)}/GB）` : '套餐价格'}${nodes ? `，${nodes} 个节点` : ''}${regions.length ? `，覆盖${regions.slice(0, 4).join('、')}${regions.length > 4 ? ` 等 ${regions.length} 地` : ''}` : ''}。${det ? `本页整理 ${det.plans.length} 个套餐的流量、周期与官网权益，以及节点地区、适合谁、注意事项与常见问题。` : '本页整理套餐、节点地区、适合谁、注意事项与常见问题。'}`;
  if (description.length > 160) description = `${description.slice(0, 157)}…`;

  // ---------------------------------------------------------------- 常见问题：按条件触发，按类型排序，3–6 条
  const pool: Record<string, FaqItem | null> = {};
  if (f.low) {
    const tail: Record<Profile, string> = {
      tested: '价格与本站测试无关，测试记录只说明当天的表现。',
      risk: '下单前先看本页“购买前须知”。',
      cheap: f.low.price < st.medianLowest ? `这个价格低于 34 家最低价的中位数 ${yuan(st.medianLowest)}${rPer?.top ? '' : `，但这一档流量只有 ${f.low.gb}GB，每 GB 约 ${yuan(f.low.perGB)} 并不算低`}。` : `月付不算最低（中位数 ${yuan(st.medianLowest)}），便宜在每 GB 单价：约 ${yuan(f.low.perGB)}/GB。`,
      big: `流量大的话直接看顶档「${f.biggest?.name ?? ''}」。`,
      wide: '各地区节点数见本页表格。',
      premium: '线路类型见上一问。',
      plain: '具体以官网当天价格为准。',
    };
    pool.price = { q: `${S}多少钱一个月？`, a: `最低档「${f.low.name}」${yuan(f.low.price)}/月，每月 ${f.low.gb}GB${f.tiers && f.tiers.max > f.low.price ? `；月付最高一档 ${yuan(f.tiers.max)}` : ''}${f.annual ? `；年付「${f.annual.name}」${yuan(f.annual.price)}/年` : ''}${f.packs.length ? `；另有 ${f.packs.length} 档一次性流量包` : ''}。${tail[profile]}` };
  }
  pool.annual = f.annual
    ? { q: `${S}的年付套餐划算吗？`, a: `「${f.annual.name}」${yuan(f.annual.price)}/年，每月 ${f.annual.monthlyGB}GB，折合约 ${yuan(f.annual.perMonth)}/月、${yuan(f.annual.perGB)}/GB${f.low ? `；入门月付档是 ${yuan(f.low.perGB)}/GB` : ''}。${f.annual.perGB < (f.low?.perGB ?? Infinity) ? '按每 GB 算年付更便宜，但一次要付一年，流量也更少。' : '年付小包的每 GB 单价并不比月付低，优点只是一年付一次。'}${f.low ? `第一次买建议先选月付「${f.low.name}」。` : ''}` }
    : null;
  pool.pack = f.packs.length
    ? { q: `${S}的一次性流量包怎么算？`, a: `${f.packs.map((p) => `「${p.name}」${yuan(p.price)} / ${p.gb}GB（约 ${yuan(p.perGB)}/GB）`).join('；')}。${f.packs[0]!.rule ? `规则：${firstSentence(f.packs[0]!.rule, 40)}。` : ''}${f.low ? `对比入门月付档约 ${yuan(f.low.perGB)}/GB，流量包适合用量不固定的人。` : ''}` }
    : null;
  pool.custom = f.custom && f.custom.price !== null
    ? (() => {
        const base = `资料里是一档定制方案：${yuan(f.custom.price)}/月${f.custom.gb ? `、每月 ${f.custom.gb}GB` : '，流量按需定制'}`;
        const n = f.custom.note ? plainNote(f.custom.note, 44) : '';
        return { q: `${S}的「${f.custom.name}」是什么？`, a: `${base}${n && !base.includes(n) ? `，说明写“${n}”` : ''}。属于按需交付的方案，实际价格与交付时间以客服确认为准。` };
      })()
    : null;
  if (det && f.custom && f.custom.price !== null && f.custom.gb) {
    const zz = det.plans.find((x) => x.planId === `${b.slug}-zhizun`);
    pool.custom = {
      q: `${S}的「${f.custom.name}」是什么？`,
      a: `月付 ${yuan(f.custom.price)}、每月 ${f.custom.gb}GB。${zz ? `官网定位“${zz.tagline}”：${zz.gist}。${zz.pageNotes.join('')}` : ''}每 GB 约 ${yuan(Math.round((f.custom.price / f.custom.gb) * 100) / 100)}，多付的钱买的是“独享”而不是流量。带宽数值、IP 类型和退款规则页面没写，本站也没有测试过这个套餐，下单前向客服确认。`,
    };
  }
  if (det && f.tiers && f.low && f.bestValue && f.annual && f.packs.length && f.custom && f.custom.price !== null) {
    const pmin = Math.min(...f.packs.map((p) => p.perGB));
    const pmax = Math.max(...f.packs.map((p) => p.perGB));
    pool.choose = {
      q: `${S}的 ${det.plans.length} 个套餐怎么选？`,
      a: `月付 ${f.tiers.count} 档（${yuan(f.tiers.min)}–${yuan(f.tiers.max)}/月），档位越高每 GB 越便宜，最低 ${yuan(f.bestValue.perGB)}/GB；年付小包「${f.annual.name}」${yuan(f.annual.price)}/年；一次性流量包 ${f.packs.length} 档，每 GB ${yuan(pmin)}–${yuan(pmax)}，不按月清零；另有月付 ${yuan(f.custom.price)} 的私人定制。第一次买建议先月付最低档「${f.low.name}」试一个月；用量小又想一年付一次看年付小包；偶尔才用、不想按月续费看流量包；要独享带宽和专属公网 IP 才考虑私人定制。逐个套餐的官网说明与对比见本页“套餐详解”。`,
    };
  }
  pool.conflict = b.conflicts.length
    ? { q: `为什么${S}的两份资料价格不一样？`, a: `${firstSentence(b.conflicts[0]!.summary, 90)}。本页的处理：${firstSentence(b.conflicts[0]!.handling, 60)}。${b.conflicts.length > 1 ? `另有 ${b.conflicts.length - 1} 处差异见“价格版本说明”。` : ''}` }
    : null;
  pool.device = device
    ? { q: `${S}能几台设备同时用？`, a: `资料写“${device}”${b.deviceLimit.note ? `（${firstSentence(b.deviceLimit.note, 50)}）` : ''}。${f.deviceLimited ? '按套餐档位限制台数，买之前数一下自己的设备。' : '这是服务商说法，本站没有做多设备并发测试。'}` }
    : null;
  pool.clients = b.clients.value && b.clients.grade !== 'D'
    ? { q: `${S}支持哪些客户端？`, a: `资料列出：${b.clients.value.slice(0, 8).join('、')}${b.clients.value.length > 8 ? ' 等' : ''}。${b.clients.note ? firstSentence(b.clients.note, 60) + '。' : ''}` }
    : null;
  pool.protocols = b.protocols.value && b.protocols.grade !== 'D'
    ? { q: `${S}用什么协议？`, a: `资料写 ${b.protocols.value.join('、')}${b.protocols.conflict ? '（不同来源说法不一致）' : ''}。${b.protocols.note ? firstSentence(b.protocols.note, 70) + '。' : '协议决定能用哪些客户端导入，见上一问。'}` }
    : null;
  pool.multiplier = b.multiplier.value && b.multiplier.grade !== 'D'
    ? { q: `${S}的流量倍率是多少？`, a: `资料写“${b.multiplier.value}”${b.multiplier.note ? `（${firstSentence(b.multiplier.note, 50)}）` : ''}。1 倍率表示实际用 1GB 扣 1GB。`, href: '/articles/traffic-multiplier-explained/', linkText: '流量倍率怎么算' }
    : null;
  pool.routes = premiumRoutes.length
    ? { q: `${S}是 IPLC 还是 IEPL 专线？`, a: `资料写线路为 ${routes.join(' / ')}${b.routeTypes.note ? `；${firstSentence(b.routeTypes.note, 80)}` : ''}。这是服务商或第三方页面的说法，本站无法从外部核验具体链路。` }
    : null;
  pool.nodes = nodes || regions.length
    ? { q: `${S}有哪些节点？`, a: `${nodes ? `资料写共 ${nodes} 个节点` : '资料没有写节点总数'}${b.nodeCount.note && /下限|不少于|截图|合计/.test(b.nodeCount.note) ? `（${firstSentence(b.nodeCount.note, 70)}）` : ''}；地区包括 ${regions.join('、')}。各地区数量见本页“节点地区”表。` }
    : null;
  {
    const own = (b.ai.note ?? '').split(/[。；]/).map((s) => s.trim()).find((s) => /^本站.*(观察|ms|可连接|超时)/.test(s));
    const claimed = b.streaming.value && b.streaming.grade !== 'D' ? b.streaming.value.slice(0, 5) : [];
    const claimedAI = b.ai.value && b.ai.grade !== 'D' ? b.ai.value.slice(0, 4) : [];
    const tail = claimed.length || claimedAI.length ? `${S}自己的资料另列 ${[...claimed, ...claimedAI].join('、')}，同样是服务商说法。` : `${S}的页面存档没有列出流媒体或 AI 服务清单。`;
    pool.services = stable.length ? { q: `${S}能用 ChatGPT、YouTube 吗？`, a: `服务商提供的资料里把 ${stable.join('、')} 标注为稳定（站长核对表 ${OWNER_MARK_READ_AT}），本站未逐项实测；${tail}${own ? `${own}。` : ''}` } : null;
  }
  pool.risk = topRisk
    ? { q: `买${S}之前要注意什么？`, a: `${cautionSentence(topRisk.text, 120)}。${riskNotices.length > 1 ? `另有 ${riskNotices.length - 1} 条提示见“购买前须知”。` : ''}${f.low ? `如果要试，先买最低档「${f.low.name}」${yuan(f.low.price)} 一个月。` : ''}` }
    : null;
  pool.register = b.slug === 'lingdongyun'
    ? { q: `${S}怎么注册、怎么导入？`, a: `点本页“注册${S}”进入官网，用邮箱注册并选套餐；付款后在官网下载客户端或复制订阅链接导入。选节点与看测速的方法见本站选择指南。`, href: '/articles/how-to-choose-airport-nodes-2026/', linkText: '2026 机场节点选择指南' }
    : null;

  const order: Record<Profile, string[]> = {
    tested: ['nodes', 'services', 'price', 'routes', 'register', 'multiplier', 'device', 'annual', 'pack', 'custom', 'clients', 'protocols', 'conflict', 'risk'],
    risk: ['risk', 'conflict', 'price', 'device', 'nodes', 'services', 'annual', 'pack', 'clients', 'protocols', 'routes', 'multiplier', 'custom', 'register'],
    cheap: ['price', 'annual', 'pack', 'services', 'nodes', 'device', 'conflict', 'routes', 'protocols', 'clients', 'multiplier', 'custom', 'risk', 'register'],
    big: ['price', 'pack', 'device', 'nodes', 'services', 'annual', 'custom', 'routes', 'multiplier', 'protocols', 'clients', 'conflict', 'risk', 'register'],
    wide: ['nodes', 'price', 'routes', 'services', 'device', 'annual', 'pack', 'custom', 'protocols', 'clients', 'multiplier', 'conflict', 'risk', 'register'],
    premium: ['routes', 'price', 'annual', 'services', 'custom', 'device', 'nodes', 'pack', 'protocols', 'clients', 'multiplier', 'conflict', 'risk', 'register'],
    plain: ['price', 'nodes', 'services', 'annual', 'pack', 'device', 'clients', 'protocols', 'routes', 'multiplier', 'custom', 'conflict', 'risk', 'register'],
  };
  const faqOrder = det ? ['price', 'choose', 'pack', 'custom', 'services', 'routes', 'nodes', 'register', 'multiplier', 'device', 'annual'] : order[profile];
  const faq = faqOrder.map((k) => pool[k]).filter((x): x is FaqItem => !!x).slice(0, 6);

  return { profile, low, perGB, priceRange, biggest, nodes, regions, routes, device, hasAnnual: !!f.annual, hasPack: f.packs.length > 0, stable, fitFor, notFor, analysis, verdict, description, faq };
}

export const faqLd = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
