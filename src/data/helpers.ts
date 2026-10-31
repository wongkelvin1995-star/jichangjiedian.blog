import type {
  BillingPeriod,
  BrandSeed,
  Claim,
  EvidenceGrade,
  OfferStatus,
  Plan,
  PlanCategory,
  PlanOffer,
  RegionClaim,
  RouteTypeId,
} from './types';

type ClaimExtra<T> = Partial<Omit<Claim<T>, 'value' | 'grade' | 'sourceIds'>>;

/**
 * 构造字段级证据声明。
 * - 传入 null 表示“资料未提供/未知”（重载 1，类型由上下文决定，不会被推断成 null）；
 * - 传入具体值时按值推断类型。
 */
export function claim<T = never>(value: null, grade: EvidenceGrade, sourceIds: string[], extra?: ClaimExtra<T>): Claim<T>;
export function claim<T>(value: T, grade: EvidenceGrade, sourceIds: string[], extra?: ClaimExtra<T>): Claim<T>;
export function claim<T>(value: T | null, grade: EvidenceGrade, sourceIds: string[], extra: ClaimExtra<T> = {}): Claim<T> {
  return { value, grade, sourceIds, ...extra };
}

export const unknown = <T>(note = '来源资料未提供'): Claim<T> => ({
  value: null,
  grade: 'D',
  sourceIds: [],
  note,
});

export interface OfferInput {
  period: BillingPeriod;
  price: number | null;
  /** 来源明确“每月”重置的额度（GB） */
  monthlyGB?: number | null;
  /** 来源明确的“总量/一次性”额度（GB） */
  totalGB?: number | null;
  reset?: string | null;
  status?: OfferStatus;
  note?: string;
  /** 这一条报价的来源与默认来源不同时填写 */
  src?: string;
  /** 这一条报价的来源自带日期（覆盖默认值） */
  recorded?: string | null;
}

export interface PlanFactoryContext {
  brandId: string;
  /** 默认引用的来源 id */
  src: string;
  grade?: EvidenceGrade;
  /** 来源页面自带日期（例如聚合站的“最后核验日期”），没有则为 null */
  recorded?: string | null;
}

export function planFactory(ctx: PlanFactoryContext) {
  const grade = ctx.grade ?? 'C';
  const recorded = ctx.recorded ?? null;
  return function plan(
    key: string,
    name: string,
    category: PlanCategory,
    offers: OfferInput[],
    extra: Partial<Pick<Plan, 'supportsAllNodes' | 'deviceLimit' | 'nodeMultiplier' | 'note'>> = {},
  ): Plan {
    return {
      planId: `${ctx.brandId}-${key}`,
      brandId: ctx.brandId,
      name,
      category,
      offers: offers.map(
        (o): PlanOffer => ({
          offerId: `${ctx.brandId}-${key}-${o.period}`,
          billingPeriod: o.period,
          priceCNY: o.price,
          monthlyTrafficGB: o.monthlyGB ?? null,
          totalTrafficGB: o.totalGB ?? null,
          trafficResetRule: o.reset ?? null,
          priceSource: { sourceId: o.src ?? ctx.src, grade: o.status === 'compiled-only' ? 'D' : o.status === 'conflict' ? 'D' : grade },
          sourceRecordedAt: o.recorded !== undefined ? o.recorded : recorded,
          lastVerifiedAt: null,
          status: o.status ?? 'sourced',
          ...(o.note ? { note: o.note } : {}),
        }),
      ),
      ...extra,
    };
  };
}

export const region = (
  countryCode: string,
  label: string,
  nodeCount: number | null,
  grade: EvidenceGrade,
  sourceIds: string[],
  extra: Partial<Omit<RegionClaim, 'countryCode' | 'label' | 'nodeCount' | 'grade' | 'sourceIds'>> = {},
): RegionClaim => ({ countryCode, label, nodeCount, grade, sourceIds, ...extra });

/** 为未提供的字段填充“未知”占位，保证数据结构完整且绝不写 0 */
export function seed(
  base: Partial<BrandSeed> &
    Pick<
      BrandSeed,
      | 'slug'
      | 'displayRank'
      | 'brandName'
      | 'shortName'
      | 'uploadFileNo'
      | 'summary'
      | 'identity'
      | 'plans'
      | 'regions'
      | 'sourceIds'
    >,
): BrandSeed {
  return {
    nameEn: null,
    aliases: [],
    nodeCount: unknown<number>('节点总数未公布或来源不一致'),
    protocols: unknown<string[]>(),
    routeTypes: unknown<RouteTypeId[]>(),
    clients: unknown<string[]>(),
    streaming: unknown<string[]>(),
    ai: unknown<string[]>(),
    deviceLimit: unknown<string>(),
    multiplier: unknown<string>(),
    notices: [],
    conflicts: [],
    editorialNotes: [],
    detailPage: 'open',
    ...base,
  };
}
