/**
 * 优惠码：站长 2026-10-31 提供（来源 owner-2026-10-31-coupons），34 家各一个。
 * 本站只原样展示代码，不写折扣幅度、有效期或适用套餐——这些资料里没有，以各家官网结算页为准。
 * “无忧链接”的代码站长写作“79元mini”，按原样记录。
 */
export const COUPON_SOURCE_ID = 'owner-2026-10-31-coupons';
export const COUPON_RECEIVED_AT = '2026-10-31';

export const COUPONS: Readonly<Record<string, string>> = {
  lingdongyun: 'ld888',
  muguangjiasu: 'mm88',
  flyv: 'fly20',
  laddercloud: 'tzy888',
  wavenet: 'lw888',
  yinxingren: 'yxr888',
  feimaoyun: 'flycat888',
  xingdaomeng: 'nmw888',
  guangsuyun: 'AMM',
  weituyun: 'rabbit',
  u1s1: 'U1S1',
  jilianyun: 'JLY888',
  quanqiuyun: 'qq88',
  guangnianti: 'GN888',
  sogoyun: 'SOGO10000',
  yuzhouyun: 'YUZHOU553',
  ermaoyun: 'ermao888',
  yifanyun: '1FLYYUN',
  edgenova: 'VA888',
  kexinyun: 'kxy80',
  sujie: 'sujie888',
  kuaili: 'kuaili996',
  breezenet: 'weifeng90',
  wuyou: '79元mini',
  lingmao: 'lingmao',
  flashleap: 'shanyue',
  firefly: 'firefly',
  kuajie: 'kuajie',
  liulianyun: 'll88',
  dalaoyun: 'dly88',
  shandianyun: 'sd88',
  huanqiuyun: 'HQ66',
  shenxingyun: 'sx0077',
  yunjieyun: 'yjx888',
};

export const couponFor = (slug: string): string | null => COUPONS[slug] ?? null;
/** 页面上统一的一句说明 */
export const COUPON_NOTE = '优惠码由站长提供（2026-10-31），折扣幅度、有效期与适用套餐以官网结算页为准。';

/**
 * 站长 2026-10-31 说明：下面这些套餐不能使用优惠码（来源 owner-2026-10-31-pricing）。
 * 页面只在这些套餐旁标注“不可使用优惠码”；其他套餐是否适用，仍以官网结算页为准，本站不替服务商下结论。
 */
export const NO_COUPON_SOURCE_ID = 'owner-2026-10-31-pricing';
export const NO_COUPON_TEXT = '不可使用优惠码';
export interface NoCouponPlan { planId: string; label: string; short: string }
export const NO_COUPON_PLANS: Readonly<Record<string, readonly NoCouponPlan[]>> = {
  lingdongyun: [
    { planId: 'lingdongyun-chuanyun', label: '穿云', short: '穿云' },
    { planId: 'lingdongyun-xianyun', label: '闲云（小流量包）', short: '闲云' },
    { planId: 'lingdongyun-jingyun', label: '惊云（标准流量包）', short: '惊云' },
    { planId: 'lingdongyun-feiyun', label: '飞云（精英流量包）', short: '飞云' },
    { planId: 'lingdongyun-zhizun', label: '至尊私人定制', short: '至尊私人定制' },
  ],
  breezenet: [
    { planId: 'breezenet-qingfeng', label: '清风（年付小包）', short: '清风' },
    { planId: 'breezenet-xinfeng', label: '信风（不限时流量包）', short: '信风' },
    { planId: 'breezenet-changfeng', label: '长风（不限时流量包）', short: '长风' },
  ],
};
export const noCouponPlans = (slug: string): readonly NoCouponPlan[] => NO_COUPON_PLANS[slug] ?? [];
export const isNoCouponPlan = (planId: string): boolean => Object.values(NO_COUPON_PLANS).some((l) => l.some((p) => p.planId === planId));

const NO_COUPON_BRAND_LABEL: Readonly<Record<string, string>> = { lingdongyun: '灵动云', breezenet: '微风网络' };
/** 套餐对比方法说明里的一句话，由上面的清单生成，避免文字与数据不一致 */
export const NO_COUPON_SUMMARY = `标着“${NO_COUPON_TEXT}”的套餐，依据站长 2026-10-31 的说明：${Object.entries(NO_COUPON_PLANS)
  .map(([slug, list]) => `${NO_COUPON_BRAND_LABEL[slug] ?? slug}的${list.map((p) => p.short).join('、')}`)
  .join('；')}。其他套餐能否使用优惠码，以服务商结算页为准。`;
