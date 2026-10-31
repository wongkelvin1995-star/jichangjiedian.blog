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
