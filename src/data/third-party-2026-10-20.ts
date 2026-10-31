/**
 * 站长 2026-10-28 提供的第二个第三方评测站（逐家档案页，资料日期 2026-10-19 / 2026-10-20）。
 * 网站名称不在页面上公开，网址见 docs/INTERNAL_SOURCES.md。处理规则与 third-party-2026-10-26.ts 相同。
 *
 * 这份资料没有覆盖极连云、光年梯、宇宙云。
 * 环球云：站长 2026-10-28 确认环球云不是资料里的“环球梯”，这份资料不用于环球云。
 */
import { makeApplier } from './third-party-2026-10-26';
import type { Patch } from './third-party-2026-10-26';

export const TP20 = 'tp-2026-10-20';
const DATE = '2026-10-20';

const PATCHES: Record<string, Patch> = {
  edgenova: {
    ops: [
      { op: 'update', key: 'monthly-pack', period: 'monthly', price: 15, gb: 50 },
      { op: 'note', key: 'monthly-pack', text: '第三方资料里的名称是“体验月付”。' },
      { op: 'add', key: 'exclusive', name: '极界·专享', cat: 'monthly-tier', period: 'monthly', price: 35, gb: 200, note: '2026-09-10 新增。' },
      { op: 'confirm', key: 'advanced' },
      { op: 'update', key: 'high', period: 'monthly', gb: 499 },
      { op: 'confirm', key: 'ultimate' },
      { op: 'update', key: 'annual-pack', period: 'annual', price: 98, gb: 45 },
      { op: 'note', key: 'annual-pack', text: '第三方资料记录 2026-09-10 由 ¥108 降到 ¥98。' },
      { op: 'add', key: 'pack-100', name: '永久流量包 100GB', cat: 'one-time-pack', period: 'one-time', price: 100, total: 100 },
      { op: 'add', key: 'pack-450', name: '永久流量包 450GB', cat: 'one-time-pack', period: 'one-time', price: 399, total: 450 },
    ],
    deviceLimit: '全部套餐不限设备、不限速（官方说法）',
    nodeCount: { value: 60, note: '第三方资料写 60 个节点，没有分地区数量；覆盖香港、台湾、日本、新加坡、美国、韩国、欧洲、东南亚、南美。' },
    service: '退款：官方 FAQ 写购买 7 天内、已用流量不超过 10GB 可退款（实际是否执行未核实）。客服以网站在线客服为主，没有官方 Telegram。客户端：官方 edgenova 客户端（Windows / macOS / Android），iOS 用 Nextin，也可手动导入第三方客户端。',
    risk: '2026-10-07 起有用户反馈节点经常失效、延迟升高（用户反馈，不是核实过的故障数据）。另有仿冒网站，edgenova.club 不是官网。',
    differs: '站长之前提到的“50GB”找到了出处：体验月付 ¥15 / 每月 50GB。旧的页面存档写的是 72GB，按这份较新的资料改为 50GB。',
  },
  sujie: {
    ops: [
      { op: 'add', key: 'speed', name: '极速版', cat: 'monthly-tier', period: 'monthly', price: 25, gb: 130, note: '另有季付 ¥70、年付 ¥230。' },
      { op: 'add', key: 'super', name: '超速版', cat: 'monthly-tier', period: 'monthly', price: 50, gb: 260 },
      { op: 'add', key: 'light-speed', name: '光速版', cat: 'monthly-tier', period: 'monthly', price: 99, gb: 550 },
      { op: 'add', key: 'warp', name: '跃迁版', cat: 'monthly-tier', period: 'monthly', price: 200, gb: 1000 },
      { op: 'add', key: 'annual', name: '限时年付', cat: 'annual-small', period: 'annual', price: 90, gb: 70 },
      { op: 'stale', key: 'light' }, { op: 'stale', key: 'enjoy' }, { op: 'stale', key: 'pro' },
    ],
    protocols: ['Shadowsocks', 'VMess', 'Trojan'],
    routeTypes: ['iplc', 'iepl'],
    nodeCount: { value: 52, note: '2026-07 第三方晚高峰实测时记录的节点数；没有分地区数量。官网首页另写“100+ 全球优选节点”。' },
    regions: [['HK', '香港'], ['JP', '日本'], ['TW', '台湾'], ['SG', '新加坡'], ['US', '美国'], ['KR', '韩国'], ['GB', '英国'], ['DE', '德国']],
    service: '退款：下单页标注 7 天无理由退款，以客服说明为准。客户端：官方 speedcloud（Windows / macOS / Android），iOS 用 Nextin；第三方客户端支持有限。全节点 1 倍率。',
    risk: '2026-08-12 起官网访问和订阅更新出现问题，8 月 27 日前恢复并发放补偿。第三方 2026-07 测试中 Claude 未解锁。',
    differs: '第三方资料写“设备数量不限”，与旧页面存档“按套餐限 1 / 3 / 10 台”不同，以官网为准。旧存档里的轻量 / 畅享 / 专业三档已不在最新价格表中。',
  },
  kuaili: {
    ops: ['annual-pack', 'monthly-pack', 'basic', 'standard', 'strong', 'top'].map((key) => ({ op: 'confirm' as const, key })),
    routeTypes: ['iepl'],
    deviceLimit: '全部套餐不限设备、不限速；全节点 1 倍率（官方面板说法）',
    nodeCount: { value: 57, note: '第三方资料写约 57 个节点，没有分地区数量。' },
    regions: [['GB', '英国'], ['FR', '法国'], ['DE', '德国'], ['OTHER', '马来西亚、土耳其、泰国、巴西']],
    service: '客服：Crisp 在线客服和工单。客户端：官方 klcloud（Windows / macOS / Android），iOS 用 Nextin。退款条款没有公开，建议先买月付。kuaili.homes 是推广页，不是官网。',
  },
  liulianyun: {
    ops: ['light', 'enjoy', 'king', 'thorn', 'annual', 'pack-100', 'pack-500'].map((key) => ({ op: 'confirm' as const, key })),
    service: '客户端：官方客户端（Windows / macOS / Android），iOS 用 Nextin，通用订阅找客服。退款条款没有公开。2026 年 9 月上线，运营时间短。',
    differs: '第三方 2026-10-03 在美国节点测试：ChatGPT、Claude、Gemini 页面能打开，但 Netflix 被识别为代理。想看 Netflix 的话先自己试。',
  },
  shandianyun: {
    ops: [
      { op: 'stale', key: 'entry' },
      { op: 'add', key: 'qingkuai', name: '轻快版', cat: 'monthly-tier', period: 'monthly', price: 25, gb: 150 },
      { op: 'confirm', key: 'advanced', alias: '疾速版' },
      { op: 'confirm', key: 'top', alias: '雷霆版' },
      { op: 'confirm', key: 'annual', alias: '限时钜惠小包' },
    ],
    protocols: ['VLESS'],
    routeTypes: ['iepl', 'iplc'],
    deviceLimit: '全部套餐不限设备、不限速；全节点 1 倍率',
    nodeCount: { value: 60, note: '第三方资料写 60 个节点，没有分地区数量。' },
    regions: [['HK', '香港'], ['TW', '台湾'], ['JP', '日本'], ['SG', '新加坡'], ['US', '美国']],
    service: '客服：Crisp 在线客服和工单。客户端：官方客户端（Windows / macOS / Android），iOS 用 Nextin，通用订阅找客服。退款条款没有公开。2026 年 9 月上线。注意：它和已改名为星岛梦的“ThunderMouse”不是同一家。',
  },
  shenxingyun: {
    ops: [
      { op: 'update', key: 'basic', period: 'monthly', gb: 300 },
      { op: 'update', key: 'premium', period: 'monthly', gb: 666 },
      { op: 'add', key: 'annual', name: '神行·年付特惠版', cat: 'annual-small', period: 'annual', price: 96, gb: 60 },
      { op: 'add', key: 'pack-90', name: '不限时小包', cat: 'one-time-pack', period: 'one-time', price: 99, total: 90 },
      { op: 'add', key: 'pack-450', name: '不限时大包', cat: 'one-time-pack', period: 'one-time', price: 398, total: 450 },
    ],
    protocols: ['VLESS'],
    deviceLimit: '全部套餐不限设备、不限速',
    nodeCount: { value: 60, note: '第三方资料称服务商截图显示 60 个节点，没有分地区数量。' },
    regions: [['HK', '香港'], ['TW', '台湾'], ['SG', '新加坡'], ['JP', '日本'], ['US', '美国']],
    service: '客服：面板内在线客服和工单，另有 Telegram 交流群。客户端：官方客户端（Windows / macOS / Android），iOS 用 Nextin，Clash 等需要找客服要通用订阅。退款条款没有公开。2026 年 9 月上线。',
  },
  yunjieyun: {
    ops: [
      { op: 'confirm', key: 'annual-pack' },
      { op: 'update', key: 'advanced', period: 'monthly', price: 40 },
      { op: 'note', key: 'advanced', text: '季付及以上的价格来自较早的页面存档，可能已随月付一起调整。' },
      { op: 'update', key: 'senior', period: 'monthly', price: 66 },
      { op: 'note', key: 'senior', text: '第三方资料里的名称是“御云·高级版”。季付及以上的价格来自较早的页面存档，可能已随月付一起调整。' },
      { op: 'confirm', key: 'pack-80' },
      { op: 'confirm', key: 'pack-200' },
    ],
    nodeCount: { value: 60, note: '第三方资料称服务商截图显示 60 个节点，没有分地区数量。' },
    service: '客服：Crisp 在线客服和工单，没有官方 Telegram。客户端：官方客户端（Windows / macOS / Android），iOS 用 Nextin，通用订阅找客服。退款条款没有公开。2026 年 9 月上线。',
  },
  kexinyun: {
    ops: [
      ...['monthly-pack', 'annual-pack', 'basic', 'standard', 'pro', 'ultimate'].map((key) => ({ op: 'confirm' as const, key })),
      { op: 'add', key: 'pack-50', name: '轻量不限时', cat: 'one-time-pack', period: 'one-time', price: 50, total: 50 },
    ],
    deviceLimit: '不限设备、不限速',
    service: '协议：VLESS、AnyTLS。客户端：官方 kxcloud（Windows / macOS / Android），iOS 用 Nextin，第三方客户端需找客服要通用订阅。有官方 Telegram 频道。退款条款没有公开。和中国信通院的“可信云”认证无关。',
    risk: '2026-09-09 出现节点超时，2026-10-08 第三方复测已恢复。',
  },
};

export const applyThirdParty1020 = makeApplier(TP20, DATE, PATCHES);
