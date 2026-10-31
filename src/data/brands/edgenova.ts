import { claim, planFactory, region, seed } from '../helpers';

const T = 't19'; // 页面存档：自称“EdgeNova | 边缘节点”品牌站（页脚 © 2026，页面未标注抓取日期）
const M = 'm19';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'edgenova', src: T, recorded: null });
const RESET = '页面：每月流量配置；提前用完可付费重置（页面称“重置 9 折”）';
const CYCLE = '页面写：季付 95 折、半年付 9 折、年付 85 折、两年付 8 折、三年付 7 折；没有列出具体价格，本站不推算。';
const MD_DIFF = (md: string) => `汇编资料库写 ${md}/月，页面存档写法不同；价格相同。`;

export default seed({
  slug: 'edgenova',
  displayRank: 26,
  brandName: '边缘节点 EdgeNova',
  shortName: '边缘节点',
  nameEn: 'EdgeNova',
  aliases: ['边缘节点', 'EdgeNova', 'edgenova', 'Edge Nova', '边缘节点机场'],
  uploadFileNo: 19,
  summary:
    '边缘节点（EdgeNova）的品牌站存档没有标注日期，列出限时月付小包（¥15，72GB/月）、限时年付（¥108，45GB/月）和四档“极界”月付套餐（¥25–¥200）。站长指出该品牌存在 50GB 与 72GB 的记录差异：本站收到的文件里，月付小包流量页面存档写 72GB、汇编资料库写 60GB，年付版页面存档写 45GB、汇编资料库写 60GB，没有找到“50GB”的出处。',
  identity: {
    status: 'name-confirmed',
    notes: [
      '页面名称“EdgeNova | 边缘节点”与站长给定名称一致。“边缘节点”也是通用技术名词，站内检索时请同时使用 EdgeNova。',
    ],
  },
  plans: [
    plan(
      'monthly-pack',
      '限时月付小包',
      'monthly-tier',
      [
        {
          period: 'monthly',
          price: 15,
          monthlyGB: 72,
          reset: RESET,
          status: 'conflict',
          note: '页面存档写“每月 72GB 流量配置”，汇编资料库写 60GB/月；站长指令另提到 50GB 的记录，但已提供文件中找不到其出处。页面注明“体验套餐不参加任何活动”。',
        },
      ],
      { deviceLimit: claim('不限速不限制设备数量（页面标注）', 'C', [T]) },
    ),
    plan('annual-pack', '限时年付', 'annual-small', [
      {
        period: 'annual',
        price: 108,
        monthlyGB: 45,
        reset: '页面：每月 45GB 流量配置',
        status: 'conflict',
        note: '页面存档写“每月 45GB 流量配置”，汇编资料库写 60GB/月；页面另写“两年付9折”。折合约 ¥9/月。',
      },
    ]),
    plan('standard', '极界·标准套餐', 'monthly-tier', [
      { period: 'monthly', price: 25, monthlyGB: 120, reset: RESET, status: 'conflict', note: `${MD_DIFF('150GB')} ${CYCLE}` },
    ], { deviceLimit: claim('不限速不限制设备数量（页面标注）', 'C', [T]) }),
    plan('advanced', '极界·进阶套餐', 'monthly-tier', [
      { period: 'monthly', price: 50, monthlyGB: 250, reset: RESET, status: 'conflict', note: MD_DIFF('350GB') },
    ], { deviceLimit: claim('不限速不限制设备数量（页面标注）', 'C', [T]) }),
    plan('high', '极界·高级套餐', 'monthly-tier', [
      { period: 'monthly', price: 100, monthlyGB: 500, reset: RESET, status: 'conflict', note: MD_DIFF('750GB') },
    ]),
    plan('ultimate', '极界·极限套餐', 'monthly-tier', [
      { period: 'monthly', price: 200, monthlyGB: 1000, reset: RESET, status: 'conflict', note: `页面写“1千GB”，按 1000GB 记录。${MD_DIFF('1.6TB')}` },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“覆盖地区：香港 / 台湾 / 日本 / 新加坡 / 马来西亚 / 美国 / 韩国 / 泰国 / 越南 / 欧洲多地区 / 南美节点”，是服务商宣称，未附节点名单。' }),
    region('TW', '台湾', null, 'C', [T], { note: '同上' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
    region('KR', '韩国', null, 'C', [T], { note: '同上' }),
    region('OTHER', '马来西亚、泰国、越南、欧洲多地区、南美节点', null, 'C', [T], { note: '这些地区不在本站地图点位内，页面也未列出具体国家或节点名。' }),
  ],
  nodeCount: claim(60, 'C', [T], { note: '页面写“已部署 60+ 节点”，是“不少于 60”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(['VLESS'], 'C', [T], { note: '页面写“VLESS 协议支持”。' }),
  routeTypes: claim(['iepl'], 'C', [T], { note: '页面写“IEPL 专线传输”“多线路智能分配”，没有逐节点说明；为服务商宣称，本站未核验。' }),
  clients: claim(['官方客户端一键连接', '第三方客户端手动导入', '适配 Windows、macOS、Linux、iOS、Android、路由器'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+', 'HBO', 'YouTube'], 'C', [T], { note: '页面写“主流流媒体全解锁”，没有附检测截图；用户评价文字不作为证据。' }),
  ai: claim(['ChatGPT', 'Gemini', 'TikTok'], 'C', [T], { note: '页面写“AI 服务兼容”，没有附检测截图；本站未实测。' }),
  deviceLimit: claim(null, 'D', [T], { note: '只有月付小包、标准、进阶套餐的要点里写“不限制设备数量”，其余套餐未写；页面另写“支持多设备同时使用”，没有数字。' }),
  multiplier: claim(null, 'D', [T], { note: '页面存档没有写节点倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期；页面称退款规则为“自购买之日起 7 天内、流量使用不超过 10GB 可申请退款，逾期不再受理”，为服务商声明，实际处理以客服为准。页面的用户评价无法核验，本站不采用。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'edgenova-small-pack-traffic',
      field: '限时月付小包 / 限时年付的月流量',
      summary: '站长指出 50GB 与 72GB 记录不一致。较早的页面存档写月付小包 72GB，汇编资料库写 60GB；2026-10-20 的第三方资料写“体验月付 ¥15 / 每月 50GB”，这就是 50GB 的出处。',
      variants: [
        { label: '页面存档：月付小包 72GB/月；年付 45GB/月', sourceId: T, grade: 'C' },
        { label: '汇编资料库：月付小包与年付均为 60GB/月', sourceId: M, grade: 'D' },
        { label: '站长指令：存在 50GB 与 72GB 的记录差异', sourceId: 'master-instruction', grade: 'D' },
        { label: '第三方资料（2026-10-20）：体验月付 ¥15 / 每月 50GB；限时年付 ¥98 / 每月 45GB', sourceId: 'tp-2026-10-20', grade: 'C' },
      ],
      handling: '按日期最新的第三方资料改为 50GB；限时年付按 ¥98 / 45GB。',
    },
    {
      conflictId: 'edgenova-tier-traffic',
      field: '极界四档月流量',
      summary: '页面存档与汇编资料库的月流量不同，价格相同。',
      variants: [
        { label: '页面存档：标准 120GB、进阶 250GB、高级 500GB、极限 1000GB', sourceId: T, grade: 'C' },
        { label: '汇编资料库：标准 150GB、进阶 350GB、高级 750GB、极限 1.6TB', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档录入，四档均标为冲突，不参与精确每 GB 成本排序。',
    },
  ],
  editorialNotes: [
    '站长清单中的“边缘节点”对应页面名称“EdgeNova | 边缘节点”；汇编资料库还列有另一个“官方解读”域名，本站未把该域名当作来源。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
