import { claim, planFactory, region, seed } from '../helpers';

const T = 't30'; // 页面存档：机场云 JichangCloud 大佬云评测（2026-10-20）
const M = 'm30';
const D = '2026-10-20';
const plan = planFactory({ brandId: 'dalaoyun', src: T, recorded: D });

export default seed({
  slug: 'dalaoyun',
  displayRank: 5,
  brandName: '大佬云',
  shortName: '大佬云',
  nameEn: 'DaLaoYun',
  aliases: ['大佬', 'dalao', 'dalaoyun', 'DaLaoYun', '大佬云测速'],
  uploadFileNo: 30,
  summary:
    '大佬云是 2026 年 9 月才上线的新服务（页面记录官网域名注册于 2026-09-05）。第三方页面称套餐价格来自官方面板并于 2026-10-20 观察；线路类型在官方文案中 IPLC 与 IEPL 说法不一致，长期稳定性尚需观察。',
  identity: { status: 'name-confirmed', notes: ['注意：大佬云不等于大哥云，本站不合并。'] },
  plans: [
    plan('chuyun-fuli', '初云·福利版', 'monthly-tier', [{ period: 'monthly', price: 19.99, monthlyGB: 100, reset: null }]),
    plan('chuyun-jinjie', '初云·进阶版', 'monthly-tier', [{ period: 'monthly', price: 25, monthlyGB: 150, reset: null }]),
    plan('lingyun-jichu', '凌云·基础版', 'monthly-tier', [{ period: 'monthly', price: 43, monthlyGB: 300, reset: null }]),
    plan('yuyun-gaoji', '御云·高级版', 'monthly-tier', [{ period: 'monthly', price: 73, monthlyGB: 600, reset: null }]),
    plan('annual-promo', '年付活动包', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: '页面：每月 60GB', note: '页面写“每月 60G，折合约 ¥8/月”。' },
    ]),
    plan('xianyun', '闲云·随心包', 'one-time-pack', [{ period: 'one-time', price: 99, totalGB: 78, reset: '不限时，用完为止' }]),
    plan('youyun', '悠云·长享包', 'one-time-pack', [{ period: 'one-time', price: 199, totalGB: 160, reset: '不限时，用完为止' }]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D, note: '页面称“推广站资料显示”覆盖' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D }),
    region('US', '美国', null, 'C', [T], { recordedAt: D }),
  ],
  nodeCount: claim(60, 'C', [T], { recordedAt: '2026-09-23', note: '页面注明：2026-09-23 历史检测样本共 60 个，非当前在线节点数量。' }),
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: D }),
  routeTypes: claim(['iplc', 'iepl'], 'C', [T], { recordedAt: D, conflict: true, note: '页面写“IPLC / IEPL（推广站说法）”，并指出官方文案对线路的描述在 IPLC 与 IEPL 之间不一致。' }),
  clients: claim(['官方客户端（Windows / macOS / Android）', 'Nextin（iOS）', '通用订阅（联系客服获取）'], 'C', [T], { recordedAt: D }),
  streaming: claim(['Netflix', 'YouTube', 'TikTok（第三方 2026-09-23 历史检测中多个节点通过；Disney+ 在香港、台湾、日本、美国存在失败或 N/A）'], 'C', [T], {
    recordedAt: '2026-09-23',
    note: '第三方整理的历史截图，本站未实测，当前解锁需按具体节点确认。',
  }),
  ai: claim(null, 'D', [T], { note: '页面标注 AI 适配“待实测”。' }),
  deviceLimit: claim('不限（官方称）', 'C', [T], { recordedAt: D }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x、晚高峰千兆不限速”，页面存档没有此项，未采用。' }),
  notices: [
    {
      type: 'operational-risk',
      severity: 'warn',
      text: '2026 年 9 月新上线（官网域名注册于 2026-09-05，官方客户端 2026-09-22 上线），页面自述“长期稳定性还需观察”。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称未公开退款条款，建议购买前咨询客服。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'dalaoyun-route',
      field: '线路类型',
      summary: '官方文案在 IPLC 与 IEPL 之间说法不一致（页面存档指出）。',
      variants: [{ label: '页面存档', sourceId: T, grade: 'C' }],
      handling: '同时记录 IPLC 与 IEPL 并标记冲突，不作为线路筛选的“已确认”依据。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
