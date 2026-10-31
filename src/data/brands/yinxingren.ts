import { claim, planFactory, region, seed } from '../helpers';

const T = 't06'; // 页面存档：隐形人指引站（页面自述为第三方使用指引与服务导航站，非官方自营平台）
const M = 'm06';
const plan = planFactory({ brandId: 'yinxingren', src: T });
const RESET_30 = '页面：自购买日起每 30 天自动刷新';

export default seed({
  slug: 'yinxingren',
  displayRank: 6,
  brandName: '隐形人',
  shortName: '隐形人',
  nameEn: 'Invisible',
  aliases: ['隐形', 'yinxing', 'yinxingren', 'Invisible', '隐形人机场'],
  uploadFileNo: 6,
  summary:
    '隐形人的页面存档来自一个自述“非官方自营”的第三方指引站，列出 9 款套餐与分地区节点数量（香港 20、台湾/日本/新加坡/美国各 10 等）。汇编资料库的月付价格与流量与该页面不同，本站以页面存档为准并标注冲突。',
  identity: {
    status: 'name-confirmed',
    notes: ['页面存档自述为第三方指引站，不是服务商自营页面；数据等级按第三方页面（C）处理。'],
  },
  plans: [
    plan('xingyao', '星耀风暴（年付）', 'annual-small', [
      {
        period: 'annual',
        price: 109,
        monthlyGB: 80,
        reset: RESET_30,
        note: '页面写“年付折算约 8 元/月”，按标价 ¥109 计算实际约 ¥9.08/月，本站按标价计算。',
      },
    ]),
    plan('baiyin', '白银纪元', 'monthly-tier', [{ period: 'monthly', price: 24, monthlyGB: 144, reset: RESET_30 }]),
    plan('huangjin', '黄金序列', 'monthly-tier', [{ period: 'monthly', price: 48, monthlyGB: 360, reset: RESET_30 }]),
    plan('bojin', '铂金至臻', 'monthly-tier', [{ period: 'monthly', price: 105, monthlyGB: 750, reset: RESET_30 }]),
    plan('zuanshi', '钻石穹顶', 'monthly-tier', [{ period: 'monthly', price: 185, monthlyGB: 1600, reset: RESET_30 }]),
    plan('wangzhe', '王者定制版', 'custom', [{ period: 'monthly', price: 680, monthlyGB: 500, reset: RESET_30, note: '页面描述为“顶配商业级 · 500GB 独立带宽”。' }]),
    plan('pack-160', '一次性小流量包', 'one-time-pack', [{ period: 'one-time', price: 229, totalGB: 160, reset: '永不过期，用完为止' }]),
    plan('pack-420', '一次性标准流量包', 'one-time-pack', [{ period: 'one-time', price: 549, totalGB: 420, reset: '永不过期，用完为止' }]),
    plan('pack-1000', '一次性精英流量包', 'one-time-pack', [{ period: 'one-time', price: 1199, totalGB: 1000, reset: '永不过期，用完为止' }]),
  ],
  regions: [
    region('HK', '香港', 20, 'C', [T], { note: '页面写“香港×20”' }),
    region('TW', '台湾', 10, 'C', [T]),
    region('JP', '日本', 10, 'C', [T]),
    region('SG', '新加坡', 10, 'C', [T]),
    region('US', '美国', 10, 'C', [T]),
    region('KR', '韩国', 2, 'C', [T]),
    region('DE', '德国', null, 'C', [T], { note: '页面仅列名，未写节点数' }),
    region('FR', '法国', null, 'C', [T], { note: '页面仅列名，未写节点数' }),
    region('GB', '英国', null, 'C', [T], { note: '页面仅列名，未写节点数' }),
    region('OTHER', '阿根廷、马来西亚、越南、菲律宾、泰国、印度等', null, 'C', [T], { note: '页面写阿根廷×2，其余只列名；页面用“等”收尾，列表不一定完整。' }),
  ],
  routeTypes: claim(['iplc'], 'C', [T], { note: '页面写“全 IPLC 专线”“单节点峰值最高 2.5Gbps”，均为页面宣称。' }),
  nodeCount: claim(50, 'C', ['owner-2026-10-28'], { recordedAt: '2026-10-29', note: '站长 2026-10-29 确认隐形人有 50+ 个节点（不少于 50 个的下限说法），没有分地区数量。' }),
  protocols: claim(null, 'D', [T, M], { note: '页面只写“主流代理协议/混淆协议”；汇编资料库写 Shadowsocks / Trojan / VLESS，未采用。' }),
  clients: claim(['Clash', 'Sing-box', 'Shadowrocket', 'Windows', 'macOS', 'Linux', 'iOS', 'Android'], 'C', [T]),
  streaming: claim(['Netflix', 'Disney+', 'TikTok'], 'C', [T], { note: '页面称原生 IP，本站未实测。' }),
  ai: claim(['ChatGPT'], 'C', [T], { note: '页面在套餐详情中列出，本站未实测。' }),
  deviceLimit: claim('周期套餐不限制同时使用客户端数量；买断包页面只说“设有对应设备并发规范”，未写数量', 'C', [T]),
  multiplier: claim('全系统一 1x（页面标注）', 'C', [T], { note: '页面同时写“晚高峰不限速”，为服务商宣称，非本站测试。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'info',
      text: '页面存档没有标注日期，价格与节点数量的时效未知。',
      sourceIds: [T],
    },
  ],
  conflicts: [
    {
      conflictId: 'yinxingren-plan-numbers',
      field: '套餐价格与月流量',
      summary:
        '页面存档：星耀风暴 80GB/月、白银 ¥24/144GB、黄金 ¥48/360GB、铂金 ¥105/750GB、钻石 ¥185/1.6TB、王者 ¥680、小流量包 ¥229；汇编资料库：70GB、¥20/120GB、¥40/300GB、¥100/700GB、¥180/1.5TB、¥600、¥219。',
      variants: [
        { label: '页面存档（本站采用，C）', sourceId: T, grade: 'C' },
        { label: '汇编资料库（未采用，D）', sourceId: M, grade: 'D' },
      ],
      handling: '以页面存档为准；等待服务商后台价格截图核验。',
    },
  ],
  editorialNotes: [],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
