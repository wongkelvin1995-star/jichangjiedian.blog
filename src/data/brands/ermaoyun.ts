import { claim, planFactory, region, seed } from '../helpers';

const T = 't17'; // 页面存档：自称“二猫云官网 (ermaocloud.homes)”品牌站（页脚 © 2026，页面未标注抓取日期）
const M = 'm17';
// 页面没有标注日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'ermaoyun', src: T, recorded: null });
const RESET = '页面：每月流量（页面未写明重置日规则）';
const CYCLE =
  '页面有“月付周期 / 季付套餐 9折 / 年付特惠 8折超值”三个标签，但存档文本只显示月付价格，季付、年付的具体金额未采集，本站不推算。';

export default seed({
  slug: 'ermaoyun',
  displayRank: 24,
  brandName: '二猫云 2mao',
  shortName: '二猫云',
  nameEn: 'ERMAO CLOUD',
  aliases: ['二猫云', '2mao', 'ERMAO CLOUD', 'ermao', 'ermaocloud', 'ermaoyun', '二猫云机场', '二猫'],
  uploadFileNo: 17,
  summary:
    '二猫云的品牌站存档没有标注日期，列出四个按设备数分档的月付方案（¥15–¥98/月，100GB–1500GB）。页面首屏的“实时测速大屏”（986.4 Mbps、18.2 ms、48/48 在线、丢包 0.0%）是没有日期和测试环境的展示数字，本站不采用。汇编资料库的套餐表与页面存档完全不同，本站以页面存档为准。',
  identity: {
    status: 'name-confirmed',
    notes: [
      '页面名称“二猫云官网 / ERMAO CLOUD”与站长给定名称一致，页面自述域名 ermaocloud.homes（本站未独立核验）。',
      '页面的套餐名称“灵猫极速版”“飞猫旗舰版”与站长清单中的“灵猫”“飞猫云”品牌名相近；本站不据此合并品牌。',
    ],
  },
  plans: [
    plan(
      'trial',
      '小猫试水版',
      'monthly-tier',
      [{ period: 'monthly', price: 15, monthlyGB: 100, reset: RESET, note: `页面：最高 300Mbps 突发峰值速率（标称）。${CYCLE}` }],
      { deviceLimit: claim('支持 2 台设备同时在线', 'C', [T]) },
    ),
    plan(
      'fast',
      '灵猫极速版',
      'monthly-tier',
      [{ period: 'monthly', price: 28, monthlyGB: 280, reset: RESET, note: `页面：最高 1000Mbps 对称带宽（标称）。${CYCLE}` }],
      { deviceLimit: claim('支持 4 台设备同时在线', 'C', [T]) },
    ),
    plan(
      'flagship',
      '飞猫旗舰版',
      'monthly-tier',
      [{ period: 'monthly', price: 48, monthlyGB: 600, reset: RESET, note: `页面：1000Mbps+ 不限速（标称）。${CYCLE}` }],
      { deviceLimit: claim('支持 8 台设备同时在线', 'C', [T]) },
    ),
    plan(
      'enterprise',
      '巨猫企业版',
      'monthly-tier',
      [{ period: 'monthly', price: 98, monthlyGB: 1500, reset: RESET, note: `页面：商业级专线带宽、纯净原生静态 IP 资源池（宣称）。${CYCLE}` }],
      { deviceLimit: claim('不限设备数', 'C', [T]) },
    ),
  ],
  regions: [
    region('HK', '香港', null, 'C', [T], { nodeNames: ['香港 02 (流媒体)', 'HK-IEPL-Premium-01'], note: '页面“实时测速大屏”出现这两个节点名；大屏数字本身不采用，节点名仅作线索。' }),
    region('JP', '日本', null, 'D', [M], { note: '汇编资料库列出；页面只在电竞宣传里写“日服 35ms”，没有节点名单。' }),
    region('TW', '台湾', null, 'D', [M], { note: '仅见于汇编资料库“香港、台湾、日本、新加坡、美国、欧洲等核心机房”。' }),
    region('SG', '新加坡', null, 'D', [M], { note: '同上' }),
    region('US', '美国', null, 'D', [M], { note: '同上；页面仅写“亚太及欧美主流常用节点”，没有具体国家。' }),
  ],
  protocols: claim(null, 'D', [T, M], {
    note: '页面写“自研抗丢包协议”“BGP Anycast Bypass DPI”，不是可核验的协议名称；汇编资料库写 Shadowsocks / VLESS，页面不支持。',
  }),
  routeTypes: claim(['iepl', 'iplc', 'bgp', 'relay'], 'C', [T], {
    conflict: true,
    note: '页面正文称“企业 IEPL/IPLC 国际内网专线，端到端不过公网国际网关”，但同页“实时测速大屏”把线路分为 IEPL 专线、BGP 专线、BGP 中转三类；页面没有说明各节点属于哪一类，在核验前不当作已确认的 IEPL。',
  }),
  clients: claim(['Windows', 'iOS（Shadowrocket 一键导入）', 'Android（v2rayNG 教程）', 'macOS', 'Clash 一键导入'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+', 'HBO Max', 'Hulu', 'YouTube Premium'], 'C', [T], { note: '页面写“全绿解锁”，没有附带日期的检测截图；用户评价文字不作为证据。' }),
  ai: claim(['ChatGPT', 'Claude', 'Midjourney'], 'C', [T], { note: '页面写“ChatGPT 4o / Claude 3.5 纯净原生支持”，使用的是较旧的模型名，没有检测截图；本站未实测。' }),
  deviceLimit: claim('按套餐区分：2 / 4 / 8 台，企业版不限（页面标注）', 'C', [T]),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有写节点倍率。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '页面首屏的“实时测速大屏”显示 986.4 Mbps、香港专线延迟 18.2 ms、在线节点 48/48 正常、平均时延 24.6 ms、丢包 0.0%，并配有“刷新实时测速”按钮。存档中没有测试日期、测试环境和方法，这些是展示数字，不是可核查的实测，本站不采用，也不会在本站复制这类“实时”展示。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面常见问题写支付由“外部平台（pingjichang.online）”处理，付款页面域名可能与品牌站域名不同；购买前请核对结算页域名。页面还称“0 丢包”“端到端不过公网国际网关”，均为服务商宣称。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'ermaoyun-plan-catalog',
      field: '套餐表',
      summary: '汇编资料库的套餐表与页面存档不是同一套：名称、流量档位与价格均不同。',
      variants: [
        { label: '页面存档：小猫试水版 ¥15/100GB、灵猫极速版 ¥28/280GB、飞猫旗舰版 ¥48/600GB、巨猫企业版 ¥98/1500GB', sourceId: T, grade: 'C' },
        {
          label: '汇编资料库：迷你年付版 60GB ¥96；畅玩版 150GB ¥25；进阶版 320GB ¥48；尊贵版 650GB ¥88；王者版 1.2TB ¥148；永久探索包 100GB ¥109、畅享包 300GB ¥299、尊享包 700GB ¥599',
          sourceId: M,
          grade: 'D',
        },
      ],
      handling: '以页面存档为准录入套餐；汇编资料库的另一套价格仅作为冲突线索保留，不进入价格表与排序。',
    },
    {
      conflictId: 'ermaoyun-route-type',
      field: '线路类型',
      summary: '页面正文称全 IEPL/IPLC 专线，页面测速大屏却标注了 BGP 专线与 BGP 中转。',
      variants: [
        { label: '页面正文：IEPL/IPLC 国际内网专线', sourceId: T, grade: 'C' },
        { label: '页面测速大屏的分类：IEPL 专线 / BGP 专线 / BGP 中转', sourceId: T, grade: 'C' },
      ],
      handling: '两种说法并列保留并标为冲突，不在线路筛选中算作已确认 IEPL。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M],
});
