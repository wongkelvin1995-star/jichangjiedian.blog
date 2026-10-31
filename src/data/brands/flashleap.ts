import { claim, planFactory, region, seed } from '../helpers';

const T = 't26'; // 页面存档：自称“闪跃VPN”品牌站首页（页面未标注抓取日期）
const M = 'm26';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'flashleap', src: T, recorded: null });
const COMPILED =
  '该档位的名称、价格与流量只见于汇编资料库；品牌站首页仅写“¥24 月付起价”“150GB 到 1000GB 四档月付套餐”，没有各档价格表。';

export default seed({
  slug: 'flashleap',
  displayRank: 16,
  brandName: '闪跃 FlashLeap',
  shortName: '闪跃',
  nameEn: 'FlashLeap',
  aliases: ['闪跃', '闪跃VPN', 'FlashLeap', 'flashleap', 'FlashLeap VPN', '闪跃机场'],
  uploadFileNo: 26,
  summary:
    '闪跃（页面名称“闪跃VPN”）的资料只有一份没有标注日期的品牌站首页存档：自称 2026 年上线、全节点 IPLC、晚高峰不限速，月付起价 ¥24、四档 150GB–1000GB。各档位的具体价格表只见于汇编资料库，本站全部标为“待核验”。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面名称“闪跃VPN”与站长给定“闪跃 FlashLeap”一致；页面自述 2026 年上线，没有给出运营主体信息。'],
  },
  plans: [
    plan('annual', '年付版', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, reset: '汇编资料库：60GB/月', status: 'compiled-only', note: COMPILED },
    ]),
    plan('flicker', '闪动 (Flicker)', 'monthly-tier', [
      {
        period: 'monthly',
        price: 24,
        monthlyGB: 150,
        status: 'compiled-only',
        note: '首页写“¥24 月付起价”“150GB+ 可选流量”，与汇编资料库的“闪动 150GB ¥24/月”相符，但首页没有明确把 ¥24 对应到某个档位；本站保守标为待核验。',
      },
    ]),
    plan('leap', '飞跃 (Leap)', 'monthly-tier', [{ period: 'monthly', price: 44, monthlyGB: 300, status: 'compiled-only', note: COMPILED }]),
    plan('teleport', '瞬移 (Teleport)', 'monthly-tier', [{ period: 'monthly', price: 84, monthlyGB: 600, status: 'compiled-only', note: COMPILED }]),
    plan('warp', '跃迁 (Warp)', 'monthly-tier', [{ period: 'monthly', price: 134, monthlyGB: 1000, status: 'compiled-only', note: COMPILED }]),
  ],
  // 品牌站首页没有地区名单；以下仅见于汇编资料库 -> D 级“待核验”
  regions: [
    region('HK', '香港', null, 'D', [M], { note: '仅见于汇编资料库“香港、日本、新加坡、台湾、美国等核心节点”；品牌站首页未列出地区。' }),
    region('JP', '日本', null, 'D', [M], { note: '同上' }),
    region('SG', '新加坡', null, 'D', [M], { note: '同上' }),
    region('TW', '台湾', null, 'D', [M], { note: '同上' }),
    region('US', '美国', null, 'D', [M], { note: '同上' }),
  ],
  protocols: claim(null, 'D', [T, M], {
    note: '页面写“支持通用订阅”，没有写传输协议；汇编资料库把 Clash、Shadowrocket、Sing-box、v2rayN 列为“传输协议”，这些是客户端名称，不是协议。',
  }),
  routeTypes: claim(['iplc'], 'C', [T], { note: '页面写“全节点走 IPLC 国际专线，不混用公共骨干网”，为服务商宣称，本站未核验。' }),
  clients: claim(['Android', 'iOS', 'macOS', 'Windows', 'Linux', '通用订阅（页面称订阅一次多端通用）'], 'C', [T], {
    note: '页面一处写“4 平台客户端”，另一处列出 Android、iOS、macOS、Windows、Linux 五个平台，数量不一致，以页面具体列出的平台为准。',
  }),
  streaming: claim(['Netflix', 'Disney+', 'HBO'], 'C', [T], { note: '页面写“Netflix / Disney+ / HBO 等”，没有附检测截图；本站未实测。' }),
  ai: claim(['ChatGPT', 'Claude', 'Gemini'], 'C', [T], { note: '页面写“ChatGPT / Claude / Gemini 等”，没有附检测截图；本站未实测。' }),
  deviceLimit: claim(null, 'D', [M], { note: '页面只写“订阅一次多端通用”，没有写同时在线设备数；汇编资料库把平台列表当作设备限制，本站不采用。' }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1 倍率”，品牌站首页没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '品牌站首页没有套餐价格表，只给出“¥24 月付起价”和“150GB 到 1000GB 四档月付套餐”；各档名称与价格只见于汇编资料库，本站全部标为待核验，不参与精确价格排序。',
      sourceIds: [T, M],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面称“晚高峰与节假日不额外限速”，并写明“实际速率仍受本地网络与目标服务影响”。这是服务商宣称，本站没有该品牌的分时段测试记录。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'flashleap-plan-catalog',
      field: '套餐价格表',
      summary: '品牌站首页只给出起价与档位范围，具体档位名称、价格与年付版只见于汇编资料库。',
      variants: [
        { label: '品牌站首页：¥24 月付起价、150GB–1000GB 四档月付', sourceId: T, grade: 'C' },
        { label: '汇编资料库：闪动/飞跃/瞬移/跃迁四档及年付版价格', sourceId: M, grade: 'D' },
      ],
      handling: '汇编资料库的价格标为“待核验”，不参与精确价格排序；待取得带日期的价格页后再核验。',
    },
  ],
  editorialNotes: [
    '页面页脚的“资源”栏列出 Wuyou VPN、Firefly VPN、光速云VPN、二猫云VPN 的链接，页脚署名“技术支持：机场实验室”。这只说明这些站点之间存在链接关系，不能据此认定它们属于同一运营方，本站不合并品牌。',
    '页面提到新人折扣码；本站不发布折扣码，实付以结算页为准。',
  ],
  detailPage: 'open',
  sourceIds: [T, M],
});
