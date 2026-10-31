import { claim, planFactory, region, seed } from '../helpers';

const T = 't20'; // 页面存档：第三方评测页“可信云(KeXin)”（页面日期 2026-10-16）
const M = 'm20';
const D = '2026-10-16';
const TEST = '2026-05-14';
const plan = planFactory({ brandId: 'kexinyun', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';
const CYCLE = '页面：表内季付为 95 折、年付为 85 折后的价格（未叠加优惠码）；两年付、三年付另有周期折扣，页面未列具体价格。';

export default seed({
  slug: 'kexinyun',
  displayRank: 27,
  brandName: '可信云',
  shortName: '可信云',
  nameEn: 'KeXin',
  aliases: ['可信云', 'KeXin', 'KeXin VPN', 'kexin', 'kexinyun', '可信云梯子', '可信云机场'],
  uploadFileNo: 20,
  summary:
    '可信云的页面存档（第三方评测页，2026-10-16）列出月付小包、年费小礼包和四档周期套餐，自述全 IEPL 专线与 60+ 节点，页面称其为“开业限时优惠”的新服务，并收录一份 2026-05-14 的第三方历史测速摘录，其中美国 09 节点速度为零。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“可信云(KeXin)”与站长给定名称一致。'],
  },
  plans: [
    plan('monthly-pack', '月付小包', 'monthly-tier', [
      { period: 'monthly', price: 15, monthlyGB: 60, reset: RESET, note: '页面：短期体验用；页面未展示该方案的季付、年付。' },
    ]),
    plan('annual-pack', '年费小礼包', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: RESET, note: '页面：60GB/月，需一次支付 ¥96，折合约 ¥8/月；页面未展示月付、季付。' },
    ]),
    plan('basic', '基础版 Basic', 'monthly-tier', [
      { period: 'monthly', price: 25, monthlyGB: 150, reset: RESET },
      { period: 'quarterly', price: 71.25, monthlyGB: 150, reset: RESET, note: CYCLE },
      { period: 'annual', price: 255, monthlyGB: 150, reset: RESET, note: CYCLE },
    ]),
    plan('standard', '标准版 Standard', 'monthly-tier', [
      { period: 'monthly', price: 50, monthlyGB: 300, reset: RESET },
      { period: 'quarterly', price: 142.5, monthlyGB: 300, reset: RESET, note: CYCLE },
      { period: 'annual', price: 510, monthlyGB: 300, reset: RESET, note: CYCLE },
    ]),
    plan('pro', '专业版 Pro', 'monthly-tier', [
      { period: 'monthly', price: 100, monthlyGB: 600, reset: RESET },
      { period: 'quarterly', price: 285, monthlyGB: 600, reset: RESET, note: CYCLE },
      { period: 'annual', price: 1020, monthlyGB: 600, reset: RESET, note: CYCLE },
    ]),
    plan('ultimate', '旗舰版 Ultimate', 'monthly-tier', [
      { period: 'monthly', price: 200, monthlyGB: 1200, reset: RESET, note: '页面写 1.2TB，按 1TB=1000GB 记为 1200GB。' },
      { period: 'quarterly', price: 570, monthlyGB: 1200, reset: RESET, note: CYCLE },
      { period: 'annual', price: 2040, monthlyGB: 1200, reset: RESET, note: CYCLE },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { recordedAt: D, nodeNames: ['HK 香港 01'], note: '页面写“60+ 专线节点，覆盖香港、台湾、新加坡、日本、美国等地区”，服务介绍另列东南亚、印度、韩国和欧美；节点名取自 2026-05-14 测速摘录。' }),
    region('TW', '台湾', null, 'C', [T], { recordedAt: D, nodeNames: ['TW 台湾 03'] }),
    region('SG', '新加坡', null, 'C', [T], { recordedAt: D, note: '页面列出新加坡，但测速摘录没有新加坡节点。' }),
    region('JP', '日本', null, 'C', [T], { recordedAt: D, nodeNames: ['JP 日本 01'] }),
    region('US', '美国', null, 'C', [T], { recordedAt: D, nodeNames: ['US 美国 01', 'US 美国 09'] }),
    region('KR', '韩国', null, 'C', [T], { recordedAt: D, note: '页面“服务介绍”列出，没有节点名称或测速。' }),
    region('OTHER', '东南亚、印度、欧美等（页面未列具体国家）', null, 'C', [T], { recordedAt: D }),
  ],
  nodeCount: claim(60, 'C', [T], { recordedAt: D, note: '页面写“60+ 专线节点”，是“不少于 60”的下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(['VLESS'], 'C', [T], { recordedAt: TEST, note: '来自 2026-05-14 测速截图页脚标注“协议为 VLESS”，不是官方协议列表。' }),
  routeTypes: claim(['iepl'], 'C', [T], { recordedAt: D, note: '页面写“套餐页标注全 IEPL 专线”，页面作者未独立验证。' }),
  clients: claim(['通用订阅（页面指向客户端教程汇总）'], 'C', [T], { recordedAt: D }),
  streaming: claim(['主流流媒体（页面未逐项列出平台）', 'TikTok'], 'C', [T], { recordedAt: D, note: '页面写“支持主流流媒体”，没有逐项平台和检测截图；本站未实测。' }),
  ai: claim(['ChatGPT', 'Gemini'], 'C', [T], { recordedAt: D, note: '页面称支持，本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制在线客户端连接数量”，页面存档没有此项。' }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“开业限时优惠”，说明这是较新的服务；本站没有该品牌的上线时间来源。页面介绍的“分布式网络和多重加密技术”“无日志策略”属于服务商宣称，页面要求以当前服务条款为准。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面收录的 2026-05-14 测速里，美国 09 的 TLS RTT 与 HTTPS 延迟为“—”、速度为 0.00B，页面写明“不能作为成功测速”。本站保留该行并标注，不据此判断该节点长期不可用。页面提到的优惠码本站不发布，实付以结算页为准。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
