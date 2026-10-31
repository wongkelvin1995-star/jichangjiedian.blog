import { claim, planFactory, region, seed } from '../helpers';
import { LDY_PLANS_SRC } from '../plan-details';

const T = 't05'; // 页面存档：灵动云品牌站（lingdongyun.sbs）
const M = 'm05'; // 汇编资料库条目
const IMG = 'img-ldy-report'; // 站长整理图：节点状态与测速汇总
const P = LDY_PLANS_SRC; // 灵动云官网套餐页截图（站长 2026-10-31 提供，9 个套餐）
// 套餐的名称、起步价、流量以 P 为准（与此前的页面存档完全一致）；季付 / 半年付 / 年付价格另见 official-2026-10-29.ts
const plan = planFactory({ brandId: 'lingdongyun', src: P, grade: 'B', recorded: '2026-10-31' });

export default seed({
  slug: 'lingdongyun',
  displayRank: 1,
  brandName: '灵动云',
  shortName: '灵动云',
  nameEn: 'LingDongYun',
  aliases: ['灵动', '灵动云', 'lingdong', 'lingdongyun', 'LingDongYun', '灵动星云'],
  uploadFileNo: 5,
  summary:
    '灵动云是目前本站唯一拥有本站测试记录的品牌：2026-10-28 晚高峰香港、新加坡、美国节点各一次测速（下载 10.8 / 13.2 / 7.07 Mbps）和一次香港 YouTube 720p 观察，都附原图、已核验；另有此前一次新加坡测速、2026-10-21 的节点在线截图（57/57）和 2026-10-24 的 YouTube 720p 播放观察。套餐名称、价格、流量与权益说明以站长 2026-10-31 提供的官网套餐页截图为准（与此前的页面存档一致），汇编资料库的另一套套餐不采用。',
  identity: {
    status: 'name-confirmed',
    notes: [],
  },
  plans: [
    plan('fufeng', '灵动·拂风', 'monthly-tier', [
      { period: 'monthly', price: 20, monthlyGB: 100, reset: '页面：账单日或自然月定期重置' },
    ]),
    plan('yulang', '灵动·驭浪', 'monthly-tier', [
      { period: 'monthly', price: 50, monthlyGB: 300, reset: '页面：每月周期定期重置' },
    ]),
    plan('poxiao', '灵动·破晓', 'monthly-tier', [
      { period: 'monthly', price: 100, monthlyGB: 700, reset: '页面：每月周期自动刷新' },
    ]),
    plan('lingxiao', '灵动·凌霄', 'monthly-tier', [
      { period: 'monthly', price: 180, monthlyGB: 1500, reset: '页面：每月周期重置（官网写 1.5TB，按 1500GB 记录）' },
    ]),
    plan('chuanyun', '灵动·穿云（年付）', 'annual-small', [
      {
        period: 'annual',
        price: 99,
        monthlyGB: 70,
        reset: '服务商面板：购买日起每 30 天自动刷新 70GB',
        src: 'ldy-panel-chuanyun',
        recorded: null,
        note: '官网写明每月 70GB，购买日起每 30 天自动刷新；年付折合约 ¥8.25/月。',
      },
    ], { deviceLimit: claim('不限制同时使用客户端数量', 'B', ['ldy-panel-chuanyun', P]) }),
    plan('xianyun', '灵动·闲云（小流量包）', 'one-time-pack', [
      { period: 'one-time', price: 199, totalGB: 150, reset: '一次性流量包，不按月清零，用完为止；官网写“流量永久有效”' },
    ]),
    plan('jingyun', '灵动·惊云（标准流量包）', 'one-time-pack', [
      { period: 'one-time', price: 499, totalGB: 400, reset: '一次性流量包，不按月清零，用完为止；官网写“永久有效”' },
    ]),
    plan('feiyun', '灵动·飞云（精英流量包）', 'one-time-pack', [
      { period: 'one-time', price: 899, totalGB: 800, reset: '一次性流量包，不按月清零，用完为止；官网写“永久有效”' },
    ]),
    plan('zhizun', '灵动云·至尊私人定制', 'custom', [
      {
        // 官网套餐页：起步价 ¥680 / 月，付款周期只有“月付”，月流量 500GB（专线独享）。价格沿用原数字，不变。
        period: 'monthly',
        price: 680,
        monthlyGB: 500,
        reset: '官网写“月流量 500GB（专线独享流量）”',
        note: '官网写明月付 ¥680 / 500GB，独立带宽、专属公网 IP，确认需求后约 2–3 个工作日交付；带宽数值与 IP 类型页面没写，以客服确认为准。',
      },
    ]),
  ],
  regions: [
    region('HK', '香港', 20, 'B', [IMG], { recordedAt: '2026-10-21', nodeNames: ['香港01', '香港02', '香港03', '香港20'], note: '站长账号节点列表截图：20/20 在线（整理图转录）' }),
    region('JP', '日本', 10, 'B', [IMG], { recordedAt: '2026-10-31', nodeNames: ['日本1', '日本2', '日本3', '日本10'], note: '2026-10-31 面板 10/10 在线（10-21 的截图是 9 个）；服务商套餐说明写日本×10' }),
    region('SG', '新加坡', 10, 'B', [IMG], { recordedAt: '2026-10-31', nodeNames: ['新加坡1', '新加坡2', '新加坡10'], note: '2026-10-31 面板 10/10 在线（10-21 的截图是 8 个）；服务商套餐说明写新加坡×10' }),
    region('TW', '台湾', 10, 'B', [IMG], { recordedAt: '2026-10-21', nodeNames: ['台湾1', '台湾2', '台湾10'], note: '10/10 在线' }),
    region('US', '美国', 10, 'B', [IMG], { recordedAt: '2026-10-21', nodeNames: ['美国1', '美国2', '美国10'], note: '10/10 在线' }),
    region('KR', '韩国', 2, 'B', ['ldy-panel-chuanyun'], { note: '服务商套餐说明写韩国×2；2026-10-21 的节点状态截图里没有韩国节点' }),
    region('DE', '德国', null, 'B', ['ldy-panel-chuanyun'], { note: '服务商套餐说明列出，没写数量' }),
    region('FR', '法国', null, 'B', ['ldy-panel-chuanyun'], { note: '服务商套餐说明列出，没写数量' }),
    region('GB', '英国', null, 'B', ['ldy-panel-chuanyun'], { note: '服务商套餐说明列出，没写数量' }),
    region('OTHER', '阿根廷、马来西亚、越南、菲律宾、泰国、印度', null, 'B', ['ldy-panel-chuanyun'], { note: '服务商套餐说明写阿根廷×2，其余只列名；说明以“等”结尾' }),
  ],
  nodeCount: claim(60, 'B', [IMG], {
    recordedAt: '2026-10-31',
    note: '2026-10-31 后台节点面板 60 个节点（香港 20、台湾 10、日本 10、新加坡 10、美国 10，全部在线、倍率 1x）；2026-10-21 的截图是 57 个（日本 9、新加坡 8）。服务商套餐说明另写香港×20、台湾×10、日本×10、新加坡×10、美国×10、韩国×2、阿根廷×2，以及马来西亚、越南、菲律宾、泰国、印度、德国、法国、英国等，标了数量的合计 64 个，其余地区没写数量。',
  }),
  protocols: claim(['Shadowsocks'], 'B', [P, T, 'owner-sheet'], {
    note: '官网套餐页（站长 2026-10-31 截图）有 7 个套餐的说明写“支持 SS 协议”（闲云、至尊没有这句）；页面存档与站长 Excel 同样写 Shadowsocks（SS）。汇编资料库另写 VLESS / Trojan，没有其他资料支持，未采用。',
  }),
  routeTypes: claim(['iplc', 'iepl', 'bgp'], 'B', [P, 'ldy-panel-chuanyun', T, 'owner-sheet', 'owner-2026-10-31'], {
    note: '官网套餐页（站长 2026-10-31 截图）9 个套餐都写“IEPL / IPLC 优化线路”；服务商面板的穿云套餐说明另写“全 IPLC 专线，低延迟；单节点峰值最高 2.5Gbps”；页面存档与站长 Excel 写“BGP 多线接入”。三种说法可以同时成立（BGP 多线入口、IPLC / IEPL 跨境专线），本站都列出。每个节点具体走哪种线路，页面没写，本站无法从外部核验。',
  }),
  clients: claim(['Clash Verge', 'Clash Party', 'Mihomo', 'Clash for Android', 'Clash Meta', 'Sing-box', 'Shadowrocket', 'Loon', 'Quantumult X', 'Stash'], 'C', [T], {
    note: '页面存档的客户端建议；订阅链接导入。',
  }),
  streaming: claim(['Netflix', 'Disney+', 'YouTube', 'TikTok'], 'B', ['ldy-panel-chuanyun', P], {
    note: '官网套餐页写“支持 Netflix、Disney+、YouTube 等主流影音平台”；服务商面板写“原生 IP，支持 Netflix / Disney+ / ChatGPT / TikTok 等主流平台”。两处都是服务商宣称，非本站解锁实测。本站新加坡节点网站可达性观察：YouTube 可连接 25ms，Netflix 较慢 271ms，Disney+ 可连接 57ms（仅表示连通性，不代表解锁地区内容）。',
  }),
  ai: claim(['ChatGPT', 'Claude', 'Midjourney'], 'C', [T, P], {
    note: '官网套餐页写“适配 ChatGPT、Claude 等热门 AI 工具”，页面存档另写 Midjourney，都是服务商宣称。本站新加坡节点单次观察：ChatGPT 可连接 101ms，Gemini 可连接 96ms，Claude 超时或无法连接，不能写成全部 AI 工具均可使用。',
  }),
  deviceLimit: claim('不限制同时使用客户端数量，多设备自由在线', 'B', [P, 'ldy-panel-chuanyun', 'owner-sheet'], { note: '官网套餐页 9 个套餐的“设备限制”都是“不限”，其中 7 个套餐的文字另写“不限设备数量”；服务商面板与站长 Excel 同样写不限设备。' }),
  multiplier: claim('1x', 'B', [P, IMG], { recordedAt: '2026-10-31', note: '官网套餐页除至尊外的 8 个套餐写“1.0 倍率计费”（穿云、闲云写“全节点 1.0 倍率”）；2026-10-21 的节点状态截图也显示流量倍率“全部 1x”。' }),
  notices: [
    {
      type: 'service-notice',
      severity: 'info',
      text: '服务商列出的特点（灵动·穿云套餐详情）：① 全节点 1 倍率，晚高峰不限速；② 全 IPLC 专线，单节点峰值最高 2.5Gbps；③ 原生 IP，宣称支持 Netflix、Disney+、ChatGPT、TikTok；④ 不限制同时在线的设备数；⑤ 购买日起每 30 天刷新流量；⑥ 客服响应快。以上是服务商说法，本站晚高峰实测见“测试记录与证据”。',
      sourceIds: ['ldy-panel-chuanyun'],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '官网套餐页（2026-10-31 读取）：9 个套餐都写 IEPL / IPLC 优化线路、速率“不限速”、设备限制“不限”；除至尊外都写 1.0 倍率计费，7 个套餐写支持 SS 协议。页面上能看出的套餐差别是月流量、付款周期、流量是否按月清零，以及至尊私人定制的独立带宽与专属公网 IP。以上是服务商说法，本站没有按套餐分别测试；各套餐的逐项说明见“套餐详解”。',
      sourceIds: [P],
    },
    {
      type: 'data-gap',
      severity: 'warn',
      text: '2026-10-28 晚高峰的香港、新加坡、美国节点测速和香港 YouTube 观察有原始截图，已核验。较早的三份证据（第一次新加坡测速、节点状态、YouTube）只有站长整理图，原始截图已不保留，这三条记录在补齐前不标记为“已核验”。',
      sourceIds: [IMG],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '客服与售后（页面存档）：官网 Crisp 在线客服、工单系统（页面承诺 24 小时内响应）和 Telegram 公告频道。页面存档没有写付款方式和退款规则。',
      sourceIds: [T],
    },
    {
      type: 'service-notice',
      severity: 'info',
      text: '三份证据来自不同日期：节点在线 2026-10-21，YouTube 观察 2026-10-24，网页测速截图没有可见日期。不能写成同一次连续测试。',
      sourceIds: [IMG],
    },
  ],
  conflicts: [
    {
      conflictId: 'lingdongyun-plan-set',
      field: '套餐名称与价格',
      summary:
        '页面存档列出拂风/驭浪/破晓/凌霄（¥20/50/100/180，100GB–1.5TB 每月）、穿云年付 ¥99、三档一次性流量包；汇编资料库则列出星云年付小包 ¥96、行星/恒星/星系/寰宇（¥25/45/80/150，150GB–1.2TB 每月）与四档买断包 ¥119/229/459/859。两套记录无法对应。站长 Excel 记录的最低价套餐是“灵动 · 拂风 ¥20/月 100GB”，与页面存档一致。',
      variants: [
        { label: '官网套餐页截图（站长 2026-10-31 提供，本站采用，B）', sourceId: P, grade: 'B' },
        { label: '页面存档（与官网套餐页截图一致，C）', sourceId: T, grade: 'C' },
        { label: '汇编资料库（未采用，D）', sourceId: M, grade: 'D' },
      ],
      handling: '站长 2026-10-31 提供的官网套餐页截图列出 9 个套餐，名称、起步价与流量和页面存档完全一致，因此以官网套餐页为准展示；汇编库的另一套套餐没有其他资料支持，仅在此列出，不采用。',
    },
    {
      conflictId: 'lingdongyun-99-annual',
      field: '¥99 年付套餐的流量口径',
      summary: '总指令曾写 70GB 为全年总量；页面存档、服务商面板截图和官网套餐页截图都写每月 70GB。',
      variants: [
        { label: '官网套餐页截图：月流量 70GB，每 30 天自动刷新（站长 2026-10-31 提供，本站采用）', sourceId: P, grade: 'B' },
        { label: '服务商面板截图：70GB/月，购买日起每 30 天刷新（本站采用）', sourceId: 'ldy-panel-chuanyun', grade: 'B' },
        { label: '页面存档：每月 70GB', sourceId: T, grade: 'C' },
        { label: '总指令：全年总量 70GB（已更正）', sourceId: 'master-instruction', grade: 'C' },
      ],
      handling: '按服务商面板截图记录为每月 70GB，参与价格比较。',
    },
    {
      conflictId: 'lingdongyun-protocol-route',
      field: '协议与线路类型',
      summary: '官网套餐页：SS 协议、IEPL / IPLC 优化线路；页面存档与站长 Excel：Shadowsocks、BGP；汇编资料库：VLESS/Shadowsocks/Trojan、IPLC/IEPL。',
      variants: [
        { label: '官网套餐页截图（站长 2026-10-31 提供，B）', sourceId: P, grade: 'B' },
        { label: '页面存档', sourceId: T, grade: 'C' },
        { label: '站长 Excel（2026-10-28 提供）', sourceId: 'owner-sheet', grade: 'C' },
        { label: '汇编资料库', sourceId: M, grade: 'D' },
      ],
      handling: '协议按官网套餐页与页面存档一致的 Shadowsocks 记录；线路同时列出 IPLC、IEPL（官网套餐页）和 BGP（页面存档与站长 Excel），三者可以同时成立；汇编资料库的 VLESS / Trojan 没有其他资料支持，不采用。',
    },
  ],
  editorialNotes: [
    '站长当前提供的整理图把三类证据放在一起，但三类证据时间不同，站内所有页面都分开写明时间。',
    '丢包率网页工具未能测出，站内记录为“未测得”，没有写成 0%。',
    '“套餐详解”里的“官网写明”都是服务商的宣传文字，本站没有逐项实测；日均流量、每 GB 折算价、套餐之间的价格对比由本站按标价计算，不代表速度或稳定性。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, IMG, 'owner-sheet', 'ldy-panel-chuanyun', P],
});
