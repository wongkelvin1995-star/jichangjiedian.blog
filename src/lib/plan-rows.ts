/**
 * 套餐对比表（/plans/）每一行要显示的内容，服务端模板和按需加载的 /plans-rows.json 共用。
 *
 * 为什么要按需加载：557 条报价全部写进 HTML 时，/plans/ 有 700KB 以上、近一万个 DOM 节点，
 * 远超 Bing 站长工具提示的 125KB，手机上筛选也会变慢。现在 HTML 只带前 40 行（默认顺序，没有脚本时也能看），
 * 其余报价由 src/scripts/plans.ts 读取 JSON 后只把当前要显示的行放进表格。
 * 两边的行结构必须一致：改模板（pages/plans.astro）时同步改 plans.ts 的 buildRow。
 */
import { clientFamiliesOf } from '../data/client-families';
import { isNoCouponPlan, NO_COUPON_TEXT } from '../data/coupons';
import { GRADE_INFO, OFFER_STATUS_LABEL } from '../data/labels';
import { OFFER_ROWS } from '../data/plan-calc';
import type { OfferRow } from '../data/plan-calc';
import type { EvidenceGrade } from '../data/types';
import { fmtCNY, fmtDate, periodLabel } from './format';
import { userNote } from './user-note';

export interface PlanRowView {
  /** 品牌固定顺序下的位置 */
  i: number;
  comp: 'exact' | 'flagged' | 'excluded';
  period: string;
  monthly: number | null;
  pergb: number | null;
  gb: number | null;
  regions: string;
  routes: string;
  clients: string;
  slug: string;
  name: string;
  plan: string;
  /** 不能使用优惠码时的提示文字，没有则为空 */
  noCoupon: string;
  note: string;
  periodText: string;
  price: string;
  traffic: string;
  monthlyText: string;
  perGBText: string;
  formula: string | null;
  /** 可比较性一栏的标签：[样式, 文字] */
  chip: [string, string];
  /** 不参与排序的原因 */
  reasons: string;
  /** 报价状态说明（非精确、非排除时显示） */
  status: string;
  grade: EvidenceGrade;
  date: string;
}

const trafficText = (r: OfferRow): string =>
  r.monthlyGB !== null ? `每月 ${r.monthlyGB}GB` : r.totalGBInPeriod !== null ? `总量 ${r.totalGBInPeriod}GB` : '未知';

const noteText = (r: OfferRow): string => {
  const n = userNote(r.note);
  return n.length > 60 ? `${n.slice(0, 58)}…` : n;
};

export const PLAN_ROWS: readonly PlanRowView[] = OFFER_ROWS.map((r, i) => ({
  i,
  comp: r.comparability,
  period: r.period,
  monthly: r.monthlyEquivalentCNY,
  pergb: r.perGBCNY,
  gb: r.monthlyGBApprox,
  regions: r.regionCodes.join(' '),
  routes: r.routeTypes.join(' '),
  clients: clientFamiliesOf(r.clients).join(' '),
  slug: r.brandSlug,
  name: r.shortName,
  plan: r.planName,
  noCoupon: isNoCouponPlan(r.planId) ? NO_COUPON_TEXT : '',
  note: noteText(r),
  periodText: periodLabel(r.period),
  price: r.priceCNY !== null ? fmtCNY(r.priceCNY) : '—',
  traffic: trafficText(r),
  monthlyText: r.monthlyEquivalentCNY !== null ? fmtCNY(r.monthlyEquivalentCNY) : '—',
  perGBText: r.perGBCNY !== null && r.comparability !== 'excluded' ? `¥${r.perGBCNY}` : '—',
  formula: r.perGBFormula ?? null,
  chip:
    r.comparability === 'exact'
      ? ['chip chip--electric', '可精确比较']
      : r.comparability === 'flagged'
        ? ['chip chip--gray', '品牌对应关系待核验']
        : [r.status === 'conflict' ? 'chip chip--sunset' : 'chip chip--gray', '不参与排序'],
  reasons: r.comparability === 'excluded' ? r.reasons.join('；') : '',
  status: r.comparability !== 'exact' && r.comparability !== 'excluded' && r.status !== 'sourced' ? OFFER_STATUS_LABEL[r.status] : '',
  grade: r.grade,
  date: fmtDate(r.dataDate),
}));

/** 来源等级标签的文字（GradeBadge.astro 的 showName={false} 版本），给脚本生成的行使用 */
export const GRADE_TEXT: Record<string, { title: string; label: string }> = Object.fromEntries(
  (Object.keys(GRADE_INFO) as EvidenceGrade[]).map((g) => [g, { title: `${g} 级：${GRADE_INFO[g].name}。${GRADE_INFO[g].desc}`, label: `${g} 级，${GRADE_INFO[g].name}` }]),
);
