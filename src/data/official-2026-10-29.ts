/**
 * 站长 2026-10-29 提供的各家官网套餐截图（只读取价格与套餐说明，截图本身不保存、不发布）。
 *
 * 站长指示：套餐价格以这批截图为准；截图里前后不一致的地方（卡片顶部与详情写的不同），按卡片顶部的大字。
 * 处理：对这里列出的品牌，整份套餐表替换为截图里的套餐（旧套餐与旧的“价格版本说明”不再显示）；
 * 灵动云只补充季付 / 半年付 / 年付价格，原套餐保持不变。
 * 没有列出的品牌（大佬云、微风网络、无忧、Firefly、跨界、闪跃、榴莲云、闪电云、环球云、神行云、云界云）保持原资料。
 */
import type { BillingPeriod, BrandSeed, Claim, Plan, PlanCategory, PlanOffer, RegionClaim, RouteTypeId } from './types';

export const OFFICIAL_1029 = 'owner-2026-10-29';
const DATE = '2026-10-29';

/** 价格：m 月付、q 季付、h 半年付、y 年付、o 一次性、c 定制（按月） */
type Prices = Partial<Record<'m' | 'q' | 'h' | 'y' | 'o' | 'c' | 'x', number | null>>;
type P = [key: string, name: string, prices: Prices, gb: number | null, note?: string];

interface Spec {
  plans?: P[];
  /** 只给已有套餐补周期价格：planId 后缀 -> 价格 */
  extend?: Record<string, Prices>;
  routes?: RouteTypeId[];
  device?: string;
  protocols?: string[];
  streaming?: string[];
  ai?: string[];
  multiplier?: string;
  regions?: [code: string, label: string, count: number | null][];
  /** 写入“购买前须知”的套餐说明 */
  notes?: string[];
}

const T5: [string, string, number | null][] = [['HK', '香港', 20], ['TW', '台湾', 10], ['JP', '日本', 10], ['SG', '新加坡', 10], ['US', '美国', 10]];

const SPECS: Record<string, Spec> = {
  lingdongyun: {
    extend: { fufeng: { q: 57, h: 108, y: 204 }, yulang: { q: 142.5, h: 270, y: 510 }, poxiao: { q: 285, h: 540, y: 1020 }, lingxiao: { q: 513, h: 972, y: 1836 } },
    notes: ['长期付：季付 95 折、半年付 9 折、年付 85 折。穿云年付 ¥99，每月 70GB，购买日起每 30 天刷新，全 IPLC 专线，折合约 ¥8.25/月。'],
  },
  dalaoyun: {
    device: '不限设备', multiplier: '全节点 1 倍率，晚高峰不限速',
    streaming: ['Netflix', 'Disney+', 'TikTok'], ai: ['ChatGPT', 'Claude'],
    notes: ['福利版为全线 IEPL 专线（99.9% 高可用）；基础版、高级版与年付活动包为全线 IPLC 专线，单节点峰值 2.5Gbps。7×24 小时真人客服。'],
  },
  muguangjiasu: {
    plans: [
      ['annual-lite', '年付轻量版', { y: 109 }, 70, '全 IPLC 专线，购买日起每 30 天刷新 70GB'],
      ['basic', '基础版', { m: 20, q: 57, h: 103, y: 204 }, 120],
      ['standard', '标准版', { m: 40, q: 114, h: 216, y: 408 }, 240],
      ['flagship', '旗舰版', { m: 100, q: 285, h: 540, y: 1020 }, 700],
      ['supreme', '至尊版', { m: 180, q: 513, h: 972, y: 1836 }, 1500],
      ['pack-150', '一次性流量包 150GB', { o: 219 }, 150, '不限时，用完为止'],
      ['pack-400', '一次性流量包 400GB', { o: 529 }, 400, '不限时，用完为止'],
      ['pack-800', '一次性流量包 800GB', { o: 959 }, 800, '不限时，用完为止'],
      ['custom', '私人定制', { c: 680 }, 500, '独立专线'],
    ],
    routes: ['bgp', 'iplc'], device: '不限设备', protocols: ['Shadowsocks'], multiplier: '全节点 1 倍率，不限速',
    streaming: ['Netflix', 'Hulu', 'HBO', 'Disney+', 'DAZN'], ai: ['ChatGPT', 'Claude'],
    notes: ['月付各档为 BGP 智能调度 + 专线出口；年付轻量版为全 IPLC 专线。支持 4K / 8K 播放。'],
  },
  flyv: {
    plans: [
      ['annual', '年付标准轻量版', { y: 99 }, 65],
      ['entry', '入门方案', { m: 25, q: 71.25, h: 135, y: 255 }, 150],
      ['adv', '进阶方案', { m: 50, q: 142.5, h: 270, y: 510 }, 380],
      ['high', '高端方案', { m: 110, q: 313.5, h: 594, y: 1122 }, 800],
      ['biz', '商业方案', { m: 190, q: 541.5, h: 1026, y: 1938 }, 1800],
      ['pack-s', '小流量包（永不限时）', { o: 189 }, 130, '一次性流量，用完为止'],
      ['pack-m', '标准流量包（永不限时）', { o: 479 }, 380, '一次性流量，用完为止'],
      ['pack-l', '精英流量包（永不限时）', { o: 799 }, 600, '一次性流量，用完为止'],
      ['gold', '原生 IP 独享黄金专线', { c: 680 }, 500],
    ],
    routes: ['bgp', 'iepl', 'iplc'], device: '不限设备、不限速',
    streaming: ['Netflix', 'Prime Video', 'Disney+', 'YouTube Premium'], ai: ['ChatGPT', 'Claude', 'Copilot'],
    notes: ['进阶方案起为 BGP 三网智能调度 + IEPL / IPLC 专线。'],
  },
  laddercloud: {
    plans: [
      ['annual-keep', '天梯随行·年度保活', { y: 89 }, 60, '每月 60GB 自动刷新'],
      ['basic', '初阶网络·基础视界', { m: 25, q: 71.25, h: 135, y: 255 }, 125],
      ['mid', '中阶加速·极清多线', { m: 60, q: 171, h: 324, y: 612 }, 350],
      ['high', '高阶专线·全球智联', { m: 110, q: 313.5, h: 594, y: 1122 }, 750],
      ['top', '顶阶商业·全球骨干', { m: 190, q: 541.5, h: 1026, y: 1938 }, 1600],
      ['pack-120', '云端买断·永不限时轻量包', { o: 169 }, 120, '一次性，永久有效直到用完'],
      ['pack-350', '云端买断·永不限时标准包', { o: 449 }, 350, '一次性，永久有效直到用完'],
      ['pack-700', '云端买断·永不限时精英包', { o: 849 }, 700, '一次性，永久有效直到用完'],
      ['custom-500', '云端独享·私人定制专线', { c: 680 }, 500, '独立 IP，2–3 个工作日交付'],
    ],
    routes: ['relay', 'bgp', 'iepl'], device: '不限设备',
    notes: ['初阶为中转 + 多入口调度；中阶为 BGP 三网 + 高速中转；高阶为 IEPL 专线；顶阶为企业级专线集群。'],
  },
  wavenet: {
    plans: [
      ['annual', '年付标准', { y: 119 }, 80, '全 IPLC 专线'],
      ['entry', '入门', { m: 30, q: 85.5, h: 162, y: 306 }, 150],
      ['adv', '进阶', { m: 70, q: 199.5, h: 378, y: 714 }, 400],
      ['high', '高端', { m: 120, q: 342, h: 648, y: 1224 }, 800],
      ['biz', '商业', { m: 200, q: 570, h: 1080, y: 2040 }, 2000],
      ['pack-180', '小流量包', { o: 239 }, 180, '一次性流量，用完为止'],
      ['pack-450', '标准流量包', { o: 569 }, 450, '一次性流量，用完为止'],
      ['pack-900', '精英流量包', { o: 1099 }, 900, '一次性流量，用完为止'],
      ['custom', '定制线路包', { c: 680 }, 500],
    ],
    routes: ['bgp', 'iplc'], device: '不限设备', streaming: ['Netflix', 'HBO', 'Disney+'], ai: ['ChatGPT', 'Claude'],
    notes: ['月付各档为 BGP 智能调度 + 专线出口；年付标准为全 IPLC 专线。'],
  },
  yinxingren: {
    plans: [
      ['xingyao', '星耀风暴（年付）', { y: 109 }, 80, '全 IEPL 专线，单节点峰值 2.5Gbps，每 30 天刷新'],
      ['baiyin', '白银纪元', { m: 24, q: 68.4, h: 129.6, y: 244.8 }, 144],
      ['huangjin', '黄金序列', { m: 48, q: 136.8, h: 259.2, y: 489.6 }, 360],
      ['bojin', '铂金至臻', { m: 105, q: 299.25, h: 567, y: 1071 }, 750],
      ['zuanshi', '钻石穹顶', { m: 185, q: 527.25, h: 999, y: 1887 }, 1600],
      ['wangzhe', '王者定制版', { c: 680 }, 500, '独享带宽'],
      ['pack-160', '一次性小流量包', { o: 229 }, 160, '永不过期，限 1 台设备'],
      ['pack-420', '一次性标准流量包', { o: 549 }, 420, '永不过期，2 台设备同时在线'],
      ['pack-1000', '一次性精英流量包', { o: 1199 }, 1000, '永不过期，3 台设备同时在线'],
    ],
    routes: ['iepl', 'bgp'], device: '周期套餐不限设备；一次性流量包限 1 / 2 / 3 台', multiplier: '全节点 1 倍率，不限速',
    streaming: ['Netflix', 'Prime Video', 'BBC', 'Abema', 'TVer'], ai: ['ChatGPT', 'GitHub Copilot', 'Hugging Face'],
    notes: ['星耀风暴为全 IEPL 专线；月付各档为 BGP 智能优化 + 专线出口。原生 IP，支持 4K / 8K。'],
  },
  feimaoyun: {
    plans: [
      ['student', '学生版', { y: 84 }, 50, '每月自动刷新'],
      ['xingyao', '星耀版', { m: 25, q: 67, h: 127, y: 240 }, 150],
      ['xinghuan', '星环版', { m: 45, q: 121, h: 229, y: 432 }, 300],
      ['yinhe', '银河版', { m: 85, q: 229, h: 433, y: 816 }, 600],
      ['yuzhou', '宇宙版', { m: 150, q: 400, h: 750, y: 1360 }, 1000],
      ['unlimited-1000', '不限时套餐', { o: 680 }, 1000, '不限时，用完为止；续费 9 折'],
      ['custom-500', '定制套餐', { c: 550 }, 500, '独享原生 IP，可选地区，全 IPLC 专线接入'],
    ],
    routes: ['iplc'], device: '不限设备', multiplier: '全节点 1 倍率，高峰不降速',
    regions: [...T5.slice(0, 4), ['US', '美国', 10], ['KR', '韩国', 3], ['OTHER', '马来西亚、越南、菲律宾、泰国、印度、英国、法国、德国、阿根廷等', null]],
    notes: ['全 IPLC 专线，最高 2.5Gbps，原生 IP。季付及以上从购买日起每 30 天刷新流量。'],
  },
  xingdaomeng: {
    plans: [
      ['xiaobao', '高校套餐', { y: 96 }, 60, '全 IPLC 专线'],
      ['over150', '超量150G', { m: 25, q: 75, h: 135, y: 240 }, 150],
      ['adv300', '进阶300G', { m: 50, q: 145, h: 270, y: 480 }, 300],
      ['flash500', '闪光500G', { m: 70, q: 195, h: 385, y: 699 }, 500],
      ['flagship1t', '旗舰1T版', { m: 130, q: 370, h: 699, y: 1249 }, 1000],
      ['pack-100', '永久不限时100G', { o: 100 }, 100, '永不过期，续费 9 折'],
      ['pack-300', '永久不限时300G', { o: 300 }, 300, '永不过期，续费 9 折'],
      ['pack-1t', '永久不限时1TB', { o: 600 }, 1000, '永不过期，续费 9 折'],
      ['custom', '美国家宽定制', { c: 700 }, 500, '美国原生家宽静态 IP'],
    ],
    routes: ['iepl', 'iplc'], device: '不限设备', multiplier: '全节点 1 倍率，晚高峰不降速',
    notes: ['月付各档为全 IEPL 专线，单节点峰值 2.5Gbps；高校套餐与不限时流量包为全 IPLC 专线。'],
  },
  guangsuyun: {
    plans: [
      ['lite', '轻量版（年付）', { y: 99 }, 69, '全 IPLC 专线'],
      ['speed', '极速版', { m: 25, q: 74, h: 94, y: 179 }, 168],
      ['flow', '流光版', { m: 34, q: 96, h: 147, y: 249 }, 238],
      ['quantum', '量子版', { m: 68, q: 198, h: 375, y: 667 }, 500],
      ['boundless', '无界版', { m: 138, q: 398, h: 567, y: 998 }, 900],
      ['snooker-147', '致敬斯诺克 147 永久套餐', { o: 147 }, 247, '一次性流量，用完为止'],
      ['custom', '定制套餐', { c: 680 }, 500, '美国原生家宽 IP，全 IPLC 专线接入'],
    ],
    routes: ['iepl', 'iplc'], device: '不限设备',
    notes: ['月付各档为全 IEPL 专线；轻量版为全 IPLC 专线。'],
  },
  weituyun: {
    plans: [
      ['annual', '年付限量款', { y: 79.9 }, 45, '全 IPLC 专线'],
      ['annual-plus', '年付加强专线', { y: 120 }, 75, 'IEPL 企业级跨境专线'],
      ['owner-lowest', '普通版', { m: 19.9, q: 53.9, h: 101.9, y: 191.9 }, 150],
      ['advanced', '进阶版', { m: 29.9, q: 80.9, h: 152.9, y: 286.9 }, 200],
      ['pro', '专业版', { m: 59.9, q: 161.9, h: 305.9, y: 547.9 }, 500],
      ['supreme', '至尊版', { m: 119.9, q: 323.9, h: 611.9, y: 1150.9 }, 1000],
      ['pack-100', '永久不限时 100GB', { o: 100 }, 100, '续费 9 折'],
      ['pack-200', '永久不限时 200GB', { o: 160 }, 200, '续费 9 折'],
      ['pack-500', '永久不限时 500GB', { o: 340 }, 500, '续费 9 折'],
    ],
    routes: ['iplc', 'iepl', 'direct'], device: '不限设备、不限速', protocols: ['VLESS'], multiplier: '全节点 1 倍率',
    streaming: ['Netflix', 'Hulu', 'HBO', 'Disney+', 'TikTok'], ai: ['ChatGPT'],
    regions: [...T5, ['MY', '马来西亚', 2], ['GB', '英国', 1], ['DE', '德国', 1], ['FR', '法国', 1], ['OTHER', '泰国、菲律宾、印度（其他地区可找客服加）', null]],
    notes: ['月付各档与年付限量款为全 IPLC 专线，另有备用直连节点；年付加强专线为 IEPL。客服全天在线。'],
  },
  u1s1: {
    plans: [
      ['basic', '就是好用包（年付）', { y: 96 }, 60],
      ['advanced', '普通人真够了包', { m: 20, q: 54, h: 102, y: 192 }, 120],
      ['high', '你以为用不到包', { m: 40, q: 108, h: 204, y: 384 }, 300],
      ['business', '瘾大就拉满包', { m: 100, q: 270, h: 510, y: 960 }, 700],
      ['team', '我全都要包', { m: 180, q: 486, h: 918, y: 1728 }, 1500],
      ['dedicated', '定制包', { c: 600 }, null, '流量按需定制'],
    ],
    routes: ['bgp', 'iepl'], device: '不限设备、不限速', protocols: ['Shadowsocks'],
    streaming: ['Netflix', 'Disney+', 'HBO', 'DAZN'], ai: ['ChatGPT', 'Claude', 'Midjourney'],
    notes: ['BGP 三网智能优化 + IEPL 专线出口。每两个月额外增加 200 兆带宽。'],
  },
  jilianyun: {
    plans: [
      ['annual', '限时年付套餐体验', { y: 96 }, 60, '福建、新疆请勿下单'],
      ['l1', '基础套餐', { m: 18, q: 51.3, h: 97.2, y: 183.6 }, 100],
      ['l2', '进阶套餐', { m: 32, q: 102, h: 194, y: 367 }, 200, '长期付价格以官网结算页为准'],
      ['l3', '旗舰套餐', { m: 61, q: 183, h: 366, y: 732 }, 500, '长期付价格以官网结算页为准'],
      ['l4', '尊享套餐', { m: 122, q: 410.4, h: 777.6, y: 1468.8 }, 1000, '长期付价格以官网结算页为准'],
      ['l5', '不限时套餐', { o: 399 }, 600, '用完为止'],
    ],
    routes: ['iplc'], device: '不限客户端', multiplier: '全节点 1 倍率，晚高峰不限速',
    notes: ['全 IPLC 专线，最大 2.5Gbps，原生 IP。不接受退款。'],
  },
  quanqiuyun: {
    plans: [
      ['annual-lite', '轻量版（年付）', { y: 99 }, 59, '全 IPLC 专线'],
      ['entry', 'BGP 智能优化 · 入门方案', { m: 20, q: 54, h: 102, y: 192 }, 120],
      ['advanced', 'BGP 智能优化 · 进阶方案', { m: 40, q: 108, h: 204, y: 384 }, 300],
      ['high', 'BGP 智能优化 · 高端方案', { m: 100, q: 270, h: 510, y: 960 }, 700],
      ['business', 'BGP 智能优化 · 商业方案', { m: 180, q: 486, h: 918, y: 1728 }, 1500],
      ['dedicated', '独享私人专线节点', { c: 680 }, 500, '独立带宽、独立公网 IP，2–3 个工作日交付'],
      ['pack-100', '不限时轻量包', { o: 100 }, 100, '永久有效'],
      ['pack-400', '不限时标准包', { o: 360 }, 400, '永久有效'],
      ['pack-800', '不限时大容量包', { o: 700 }, 800, '永久有效'],
    ],
    routes: ['bgp', 'iplc'], device: '不限设备、不限速', protocols: ['Shadowsocks'], multiplier: '全节点 1 倍率',
    streaming: ['Netflix', 'Hulu', 'HBO', 'Disney+', 'DAZN'], ai: ['ChatGPT', 'Claude'],
    regions: [...T5, ['OTHER', '马来西亚、德国、土耳其、巴西等', null]],
    notes: ['月付各档为 BGP 智能调度 + 专线出口；轻量版为全 IPLC 专线，单节点峰值 2.5Gbps。'],
  },
  guangnianti: {
    plans: [
      ['annual', '年付限时套餐', { y: 89 }, 50],
      ['entry', '入门版', { m: 18, q: 50, h: 90, y: 160 }, 110],
      ['advanced', '晋级版', { m: 34, q: 100, h: 180, y: 320 }, 220],
      ['pro', '专业版', { m: 68, q: 200, h: 375, y: 667 }, 450],
      ['supreme', '至尊版', { m: 130, q: 390, h: 702, y: 1248 }, 900],
      ['dedicated', '独享私人专线节点', { c: 680 }, 500, 'IEPL 专线链路，独立带宽与公网 IP'],
    ],
    routes: ['iplc', 'iepl'], device: '不限设备', multiplier: '全节点 1 倍率，晚高峰不限速',
    notes: ['各档全程 IPLC 专线，最高 2.5Gbps；独享专线为 IEPL。年付优惠可叠加优惠码。不提供退款。'],
  },
  sogoyun: {
    plans: [
      ['xiaobao', '小包 · 年付版', { y: 98 }, 60],
      ['basic', '基础版', { m: 25, q: 65, h: 120, y: 250 }, 150],
      ['select', '优选版', { m: 45, q: 125, h: 245, y: 485 }, 350],
      ['plus', '强化版', { m: 80, q: 230, h: 450, y: 850 }, 550],
      ['top', '顶配版', { m: 150, q: 440, h: 870, y: 1750 }, 1100],
      ['pack-120', 'SOGO 基础餐不限时版', { o: 120 }, 120],
      ['pack-250', 'SOGO 优选餐不限时版', { o: 250 }, 250],
      ['pack-500', 'SOGO 强化餐不限时版', { o: 450 }, 500],
      ['pack-1000', 'SOGO 至尊餐不限时版', { o: 850 }, 1000],
    ],
    routes: ['iepl'], device: '不限设备', multiplier: '全节点 1 倍率',
    notes: ['全 IEPL 专线，单节点峰值 2.5Gbps；每 30 天刷新流量。'],
  },
  yuzhouyun: {
    plans: [
      ['xiaobao', '星云年付小包', { y: 96 }, 60],
      ['zunxiang', '星云年付尊享版', { y: 188 }, 100],
      ['planet', '行星基础版', { m: 25, q: 70, h: 130, y: 230 }, 160],
      ['star', '恒星标准版', { m: 50, q: 140, h: 260, y: 480 }, 300],
      ['galaxy', '星系专业版', { m: 100, q: 285, h: 520, y: 980 }, 700],
      ['universe', '寰宇旗舰版', { m: 200, q: 570, h: 1020, y: 1980 }, 1500],
      ['pack-120', '行星基础版（不限时）', { o: 110 }, 120, '不按月清零，用完为止'],
      ['pack-240', '恒星标准版（不限时）', { o: 220 }, 240, '不按月清零，用完为止'],
      ['custom', '宇宙云家宽定制套餐', { x: 600 }, null, '付款方式为一次性；卡片写“月流量 500GB”，500GB 是每月还是总量页面没有说明，本站不计算每 GB。独享原生 IP，可选地区与节点'],
    ],
    regions: [['HK', '香港', 20], ['TW', '台湾', 10], ['JP', '日本', 10], ['SG', '新加坡', 10], ['US', '美国', 10], ['KR', '韩国', 3], ['OTHER', '马来西亚、越南、菲律宾、泰国、印度、英国、法国、德国、阿根廷等', null]],
    routes: ['iepl'], device: '不限设备', multiplier: '全节点 1 倍率，晚高峰不降速',
    notes: ['全 IEPL 专线，单节点峰值 2.5Gbps；每 30 天刷新流量。'],
  },
  ermaoyun: {
    plans: [
      ['annual-pack', '二猫年付小包', { y: 96 }, 60],
      ['owner-lowest', '白猫套餐', { m: 20, q: 57, h: 108, y: 204 }, 130],
      ['orange', '橘猫畅玩版', { m: 40, q: 114, h: 216, y: 408 }, 230],
      ['milk', '牛奶猫尊享版', { m: 80, q: 228, h: 432, y: 816 }, 430],
      ['black', '黑猫重度用户版', { m: 160, q: 456, h: 864, y: 1632 }, 850],
      ['pack-100', '不限时套餐', { o: 100 }, 100, '永久有效，用完为止'],
      ['pack-200', '不限时套餐加大版', { o: 199 }, 200, '永久有效，用完为止'],
      ['custom', '美国家宽定制', { c: 700 }, 500, '美国原生家宽静态 IP'],
    ],
    device: '不限设备', multiplier: '全节点 1 倍率，晚高峰不降速',
    notes: ['每 30 天刷新流量，原生 IP，智能路由。'],
  },
  yifanyun: {
    plans: [
      ['annual', '年付小包', { y: 98 }, 60],
      ['light', '轻享版', { m: 20, q: 55, h: 98, y: 168 }, 150],
      ['comfort', '舒享版', { m: 35, q: 98, h: 178, y: 298 }, 350],
      ['premium', '尊享版', { m: 55, q: 155, h: 288, y: 498 }, 600],
      ['ultimate', '极致版', { m: 95, q: 268, h: 498, y: 888 }, 1200],
      ['pack-100', '轻享版 · 不限时包', { o: 100 }, 100],
      ['pack-250', '舒享版 · 不限时包', { o: 200 }, 250],
      ['pack-500', '尊享版 · 不限时包', { o: 400 }, 500],
    ],
    routes: ['iepl'], device: '不限设备',
    notes: ['IEPL 专线，晚高峰带宽保障；有自研客户端，一键连接。'],
  },
  edgenova: {
    plans: [
      ['annual-pack', '限时年付', { y: 98 }, 45],
      ['monthly-pack', '限时体验月付小包', { m: 15 }, 50],
      ['standard', '极界·标准套餐', { m: 22, q: 62, h: 118, y: 225 }, 120],
      ['exclusive', '极界·专享套餐', { m: 35, q: 99.75, h: 189, y: 357 }, 200],
      ['advanced', '极界·进阶套餐', { m: 50, q: 145, h: 270, y: 510 }, 250],
      ['high', '极界·高级套餐', { m: 100, q: 290, h: 540, y: 1020 }, 499],
      ['ultimate', '极界·极限套餐', { m: 200, q: 580, h: 1080, y: 2040 }, 1000],
      ['pack-100', '永久不限时 100G', { o: 100 }, 100],
      ['pack-450', '永久不限时 450G', { o: 399 }, 450],
    ],
    routes: ['iplc'], device: '不限设备', multiplier: '全节点 1 倍率，高峰不降速',
    notes: ['全 IPLC 专线，最高 2.5Gbps，原生 IP。'],
  },
  kexinyun: {
    plans: [
      ['annual-pack', '年费小礼包', { y: 96 }, 60],
      ['monthly-pack', '月付小包', { m: 15 }, 60],
      ['basic', '基础版 Basic', { m: 25, q: 71.25, h: 135, y: 255 }, 150],
      ['standard', '标准版 Standard', { m: 50, q: 142.5, h: 270, y: 510 }, 300],
      ['pro', '专业版 Pro', { m: 100, q: 285, h: 540, y: 1020 }, 600],
      ['ultimate', '旗舰版 Ultimate', { m: 200, q: 570, h: 1080, y: 2040 }, 1200],
      ['pack-50', '轻量不限时', { o: 50 }, 50, '仅限前 1 万名用户'],
    ],
    routes: ['iepl'], device: '不限设备、不限速',
    notes: ['全 IEPL 专线，流量用完可重置（9 折）。'],
  },
  sujie: {
    plans: [
      ['annual', '限时年付', { y: 90 }, 70, '可花 10 元重置流量'],
      ['owner-lowest', '单月试用', { m: 15 }, 50, '体验套餐，不参加优惠活动'],
      ['speed', '极速版', { m: 25, q: 70, h: 130, y: 230 }, 130],
      ['super', '超速版', { m: 50, q: 142.5, h: 270, y: 560 }, 260],
      ['light-speed', '光速版', { m: 99, q: 285, h: 540, y: 1080 }, 550],
      ['warp', '跃迁版', { m: 200, q: 570, h: 1080, y: 2040 }, 1000],
    ],
    routes: ['iplc'], device: '不限设备、不限速', multiplier: '全节点 1 倍率，高峰不降速',
    streaming: ['Netflix', 'Disney+', 'TikTok'], ai: ['ChatGPT'],
    notes: ['全 IPLC 专线，最高 2.5Gbps，原生 IP；客服全天在线。'],
  },
  kuaili: {
    plans: [
      ['annual-pack', '森狸年付小套餐', { y: 120 }, 30],
      ['monthly-pack', '月狸月付小套餐', { m: 15 }, 50],
      ['basic', '小狸基础版', { m: 22, q: 62, h: 125, y: 255 }, 100],
      ['standard', '灵狸标准版', { m: 35, q: 103, h: 208, y: 415 }, 250],
      ['strong', '夜狸强化版', { m: 95, q: 290, h: 545, y: 1025 }, 500],
      ['top', '天狸顶配版', { m: 180, q: 535, h: 1060, y: 2140 }, 1000],
    ],
    routes: ['iepl'], device: '不限设备', multiplier: '全节点 1 倍率，晚高峰不降速',
    notes: ['全 IEPL 专线，单节点峰值 2.5Gbps；每 30 天刷新流量。'],
  },
  lingmao: {
    plans: [
      ['annual-small', '年付小包', { y: 85 }, 45],
      ['small', 'Small', { m: 25, q: 65, y: 195 }, 150],
      ['big', 'Big', { m: 45, q: 125, y: 295 }, 300],
      ['pack-100', '不限时 Small', { o: 100 }, 100, '用完重置享 9 折'],
      ['pack-500', '不限时 Big', { o: 350 }, 500, '用完重置享 9 折'],
      ['custom', '大流量定制', { c: 999 }, null, '直播、电商专线定制'],
    ],
    routes: ['iplc'], device: '不限客户端、不限速', multiplier: '全节点 1 倍率',
    streaming: ['Netflix', 'Hulu', 'HBO', 'Disney+'], ai: ['ChatGPT', 'Gemini', 'TikTok'],
    notes: ['全 IPLC 专线，最高 1000Mbps；按订单日自动重置，也可买加油包。客服全天在线。'],
  },
};

const PERIOD: Record<keyof Prices, BillingPeriod> = { m: 'monthly', q: 'quarterly', h: 'semiannual', y: 'annual', o: 'one-time', c: 'monthly', x: 'one-time' };

const offer = (brand: string, key: string, k: keyof Prices, price: number | null, gb: number | null, note?: string): PlanOffer => ({
  offerId: `${brand}-${key}-${PERIOD[k]}`,
  billingPeriod: PERIOD[k],
  priceCNY: price,
  monthlyTrafficGB: k === 'o' || k === 'x' ? null : gb,
  totalTrafficGB: k === 'o' ? gb : null,
  trafficResetRule: k === 'o' ? '一次性流量，用完为止' : null,
  priceSource: { sourceId: OFFICIAL_1029, grade: 'C' },
  sourceRecordedAt: DATE,
  lastVerifiedAt: null,
  status: 'sourced',
  ...(note ? { note } : {}),
});

const cat = (p: Prices): PlanCategory => (p.o !== undefined ? 'one-time-pack' : p.c !== undefined || p.x !== undefined ? 'custom' : p.m === undefined && p.y !== undefined ? 'annual-small' : 'monthly-tier');
const c = <T>(value: T): Claim<T> => ({ value, grade: 'C', sourceIds: [OFFICIAL_1029], recordedAt: DATE });

export function applyOfficial1029(seed: BrandSeed): BrandSeed {
  const s = SPECS[seed.slug];
  if (!s) return seed;
  let plans = seed.plans;
  if (s.plans) {
    plans = s.plans.map(([key, name, prices, gb, note]): Plan => ({
      planId: `${seed.slug}-${key}`,
      brandId: seed.slug,
      name,
      category: cat(prices),
      offers: (Object.keys(prices) as (keyof Prices)[]).map((k) => offer(seed.slug, key, k, prices[k] ?? null, gb, note)),
    }));
  }
  if (s.extend) {
    plans = plans.map((p) => {
      const key = p.planId.replace(`${seed.slug}-`, '');
      const ext = s.extend![key];
      if (!ext) return p;
      const gb = p.offers[0]?.monthlyTrafficGB ?? null;
      const add = (Object.keys(ext) as (keyof Prices)[]).filter((k) => !p.offers.some((o) => o.billingPeriod === PERIOD[k])).map((k) => offer(seed.slug, key, k, ext[k] ?? null, gb));
      return { ...p, offers: [...p.offers, ...add] };
    });
  }
  let regions = seed.regions;
  if (s.regions) {
    regions = s.regions.map(([code, label, count]): RegionClaim => {
      const old = seed.regions.find((r) => r.countryCode === code);
      return { countryCode: code, label, nodeCount: count, grade: 'C', sourceIds: [OFFICIAL_1029], recordedAt: DATE, ...(old?.nodeNames ? { nodeNames: old.nodeNames } : {}) };
    });
  }
  return {
    ...seed,
    plans,
    regions,
    conflicts: s.plans ? [] : seed.conflicts,
    ...(s.routes ? { routeTypes: c(s.routes) } : {}),
    ...(s.device ? { deviceLimit: c(s.device) } : {}),
    ...(s.protocols ? { protocols: c(s.protocols) } : {}),
    ...(s.streaming ? { streaming: c(s.streaming) } : {}),
    ...(s.ai ? { ai: c(s.ai) } : {}),
    ...(s.multiplier ? { multiplier: c(s.multiplier) } : {}),
    notices: [
      ...(s.notes ?? []).map((text) => ({ type: 'service-notice' as const, severity: 'info' as const, text, sourceIds: [OFFICIAL_1029] })),
      ...seed.notices.filter((n) => !s.plans || n.type !== 'service-notice'),
    ],
    sourceIds: [...new Set([...seed.sourceIds, OFFICIAL_1029])],
  };
}
