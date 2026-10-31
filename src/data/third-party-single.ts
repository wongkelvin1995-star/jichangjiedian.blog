/**
 * 站长 2026-10-28 逐家提供的第三方评测页（极连云、光年梯、宇宙云）。
 * 网站名称不在页面上公开，网址见 docs/INTERNAL_SOURCES.md。处理规则同 third-party-2026-10-26.ts。
 */
import { makeApplier } from './third-party-2026-10-26';

export const TP_JILIAN = 'tp-jilianyun-2026-07-16';
export const TP_GNT = 'tp-guangnianti-2026-10-19';
export const TP_YZ1 = 'tp-yuzhouyun-2026-08-04';
export const TP_YZ2 = 'tp-yuzhouyun-2026-08-14';

const jilian = makeApplier(TP_JILIAN, '2026-07-16', {
  jilianyun: {
    ops: [
      { op: 'confirm', key: 'l2' }, { op: 'confirm', key: 'l3' }, { op: 'confirm', key: 'l4' },
      { op: 'note', key: 'l1', text: '2026-07-16 的第三方评测页写 ¥15.5 / 每月 100GB。' },
      { op: 'note', key: 'l5', text: '2026-07-16 的第三方评测页写“1000GB 不限时 ¥399 一次性”，与页面存档的 ¥680 不同，以官网为准。' },
      { op: 'add', key: 'annual', name: '年付（60GB / 月）', cat: 'annual-small', period: 'annual', price: 96, gb: 60 },
    ],
    regions: [['TW', '台湾'], ['KR', '韩国']],
    service: '使用方式：购买后在用户中心复制订阅地址，导入 Clash Verge Rev、Clash Meta、v2rayN、Sing-box（电脑）或 Shadowrocket、Stash、Quantumult X、Surge（iPhone / iPad）；没有一键登录的官方客户端，对新手有一定门槛。',
    risk: '线路说法不一致：有的页面写“全 IPLC 专线”，另有评测记录为公网隧道中转加 IEPL。2025 年 12 月的一份独立评测提到晚高峰带宽不足、单一入口抗风险能力较弱，当时香港节点对部分 AI 服务有限制。建议先买月付，在晚上 8–11 点自己测。',
  },
});

const gnt = makeApplier(TP_GNT, '2026-10-19', {
  guangnianti: {
    ops: [
      { op: 'add', key: 'annual', name: '入门版（年付）', cat: 'annual-small', period: 'annual', price: 90, gb: 50, note: '折合 ¥7.5 / 月。' },
      { op: 'confirm', key: 'advanced' }, { op: 'confirm', key: 'pro' }, { op: 'confirm', key: 'supreme' }, { op: 'confirm', key: 'dedicated' },
    ],
    protocols: ['Shadowsocks'],
    service: '付款方式：支付宝和加密货币。套餐写“全节点 x1 · 高峰满速”“不限客户端”；服务商自称自有机房、多年运营，评测页没有给出证据。独享私人专线带独立带宽和独立公网 IP。',
    differs: '2026-10-19 的第三方评测页写“全 IPLC 专线”，与页面存档的 IEPL 说法不同，线路类型以官网为准。',
  },
});

const yz1 = makeApplier(TP_YZ1, '2026-08-04', {
  yuzhouyun: {
    ops: [
      { op: 'confirm', key: 'xiaobao' },
      { op: 'note', key: 'planet', text: '2026-08-04 的第三方评测页写 ¥25 / 每月 120GB。' },
      { op: 'confirm', key: 'star' }, { op: 'confirm', key: 'galaxy' }, { op: 'confirm', key: 'universe' },
    ],
    deviceLimit: '全部套餐不限设备（第三方评测页）',
    service: '付款周期有月付、季付、半年付、年付、两年付、三年付；可导入 Clash、Shadowrocket、v2rayN 等客户端。退款规则没有公开。',
  },
});

const yz2 = makeApplier(TP_YZ2, '2026-08-14', {
  yuzhouyun: {
    ops: [],
    differs: '另一家评测页（2026-08-14）写起步价 ¥21 / 130GB，与其他资料不同；它称线路为“BGP 多线中转 + 双 ISP 原生住宅 IP”，并列出 2026-08-14 20:30 的晚高峰测速（香港 42 ms 等）。但测速表的下载速度标为“663 MB/s”这类不合常理的数值，平均延迟也和表内数字对不上，所以本站没有录入这组测速。',
  },
});

export const applySingleThirdParty = (seed: Parameters<typeof jilian>[0]) => yz2(yz1(gnt(jilian(seed))));
