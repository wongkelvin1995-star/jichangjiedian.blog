import { claim, planFactory, region, seed } from '../helpers';

const T = 't09'; // 页面存档：自称“光速云 Lightspeed Cloud”官网（页脚版权 2025，页面未标注抓取日期）
const M = 'm09';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'guangsuyun', src: T, recorded: null });
const RESET = '页面：高达 xx GB / 月（用语为“高达”，未写明超额或重置细则）';
const MEDIA = '页面：YouTube、Netflix、Disney+、Hulu 和 ChatGPT 等（无检测截图）';

export default seed({
  slug: 'guangsuyun',
  displayRank: 19,
  brandName: '光速云 LightSpeed',
  shortName: '光速云',
  nameEn: 'Lightspeed Cloud',
  aliases: ['光速云', '光速云VPN', 'LightSpeed', 'Lightspeed Cloud', 'lightspeed', 'guangsuyun'],
  uploadFileNo: 9,
  summary:
    '光速云的页面存档没有标注日期，列出三个方案：极速版（¥17/月，高达 110GB/月）、轻量版（¥99/年，高达 59GB/月）和流光版（¥34/月，高达 220GB/月）。页面标题自称“老牌”，但页脚版权年份为 2025；线路类型只写“国际专线”，标题另提到 IPLC。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“光速云 – Lightspeed Cloud”与站长给定名称一致。'],
  },
  plans: [
    plan('speed', '极速版', 'monthly-tier', [{ period: 'monthly', price: 17, monthlyGB: 110, reset: RESET, note: MEDIA }]),
    plan(
      'lite',
      '轻量版',
      'annual-small',
      [{ period: 'annual', price: 99, monthlyGB: 59, reset: RESET, note: `页面：年付 ¥99，节点数量 30+（其余方案 50+），最高速率 1000M。${MEDIA}` }],
      { supportsAllNodes: claim(null, 'D', [T], { note: '页面写该方案节点数量为 30+，其余方案为 50+；是否因此不含全部节点页面没有明确，本站不下结论。' }) },
    ),
    plan('flow', '流光版', 'monthly-tier', [{ period: 'monthly', price: 34, monthlyGB: 220, reset: RESET, note: MEDIA }]),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { note: '页面写“香港、韩国、日本、新加坡、台湾、英国和美国等热门地区服务器”，是服务商宣称的地区范围，未附节点名单。' }),
    region('KR', '韩国', null, 'C', [T], { note: '同上' }),
    region('JP', '日本', null, 'C', [T], { note: '同上' }),
    region('SG', '新加坡', null, 'C', [T], { note: '同上' }),
    region('TW', '台湾', null, 'C', [T], { note: '同上' }),
    region('GB', '英国', null, 'C', [T], { note: '同上' }),
    region('US', '美国', null, 'C', [T], { note: '同上' }),
  ],
  nodeCount: claim(50, 'C', [T], { note: '页面在极速版/流光版写“节点数量 50+”，轻量版为“30+”，是下限宣称，不是精确节点数；本站未核验。' }),
  protocols: claim(null, 'D', [T, M], {
    note: '页面只写“使用先进流量隐藏技术，将加速流量化身网页浏览”，没有写协议名称；汇编资料库的“Trojan / Shadowsocks / 通用订阅”不见于页面存档。',
  }),
  routeTypes: claim(['iplc'], 'C', [T], {
    note: '页面标题写“老牌稳定 IPLC 国际专线加速器”，正文只写“国际专线加速”“从入口到落地精选优质运营商”，没有逐节点说明；为服务商宣称，本站未核验。',
  }),
  clients: claim(['macOS', 'iOS', 'Android', 'Linux'], 'C', [T], { note: '页面写“跨平台支持包括 macOS, iOS, Android 和 Linux 等”；汇编资料库另加 Windows，页面存档未写。' }),
  streaming: claim(['YouTube', 'Netflix', 'Disney+', 'Hulu'], 'C', [T], { note: '页面写“解锁…等”，没有附检测截图；本站未实测。' }),
  ai: claim(['ChatGPT', 'Gemini'], 'C', [T], { note: '页面写“解锁 Gemini、ChatGPT”，没有附检测截图；本站未实测。' }),
  deviceLimit: claim('三个方案均标“可用设备：不限制”', 'C', [T]),
  multiplier: claim(null, 'D', [T], { note: '页面存档没有写节点倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期。“最高速率 2500Mbps / 1000M”是方案标称上限，不是实测速度；页面“折后月均低至 ¥6+/月”需要叠加优惠码，本站不推算；站长提供的优惠码见品牌页。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面标题称“老牌”，但页脚版权年份为 2025；本站没有该品牌的上线时间来源，不采用“老牌”这一说法。',
      sourceIds: [T],
    },
  ],
  conflicts: [],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
