/**
 * 资料来源登记表。
 *
 * 分级规则（与全站一致）：
 *  A 本站实测 · B 服务商公开资料/后台截图 · C 第三方历史参考（含无日期的品牌站页面存档）· D 待核验或资料冲突
 *
 * 要点：
 *  - 站长提供的 TXT 是“页面存档”，没有抓取日期，所以即使页面自称官网也只给 C；
 *  - 站长提供的 MD（单品牌与两份综合库）是二次整理的汇编资料，与页面存档多处冲突，只作线索（D）；
 *  - receivedAt 是资料提供日，不是页面抓取日；statedDate 才是来源页面自己写明的日期；
 *  - file 为上传通道保留的文件名（中文字符在上传时已丢失），以站长本地文件为准。
 */
import { BRAND_INDEX } from './brand-index';
import type { EvidenceGrade, SourceKind, SourceRecord } from './types';

export const RECEIVED_AT = '2026-10-27';

/** 上传编号 -> [TXT 文件名, 单品牌 MD 文件名]（中文字符已被上传通道替换成下划线） */
const FILES: Record<number, [string, string]> = {
  1: ['1_____.txt', '01_____.md'],
  2: ['2__V.txt', '02__V.md'],
  3: ['3_____LadderCloud.txt', '03_____LadderCloud.md'],
  4: ['4____WaveNet.txt', '04____WaveNet.md'],
  5: ['5____.txt', '05____.md'],
  6: ['6____.txt', '06____.md'],
  7: ['7____.txt', '07____.md'],
  8: ['8_____StarDream.txt', '08_____StarDream.md'],
  9: ['9_____LightSpeed.txt', '09_____LightSpeed.md'],
  10: ['10_____V2__.txt', '10_____V2_.md'],
  11: ['11_U1S1______.txt', '11_U1S1_____.md'],
  12: ['12____.txt', '12____.md'],
  13: ['13____.txt', '13____.md'],
  14: ['14____.txt', '14____.md'],
  15: ['15_Sogo_.txt', '15_Sogo_.md'],
  16: ['16_____YuZhou.txt', '16_____YuZhou.md'],
  17: ['17_____2mao.txt', '17_____2mao.md'],
  18: ['18_____1fly.txt', '18_____1fly.md'],
  19: ['19______EdgeNova.txt', '19______EdgeNova.md'],
  20: ['20____.txt', '20____.md'],
  21: ['21____SuJie.txt', '21____SuJie.md'],
  22: ['22____KuaiLi.txt', '22____KuaiLi.md'],
  23: ['23______Breezenet.txt', '23______Breezenet.md'],
  24: ['24___.txt', '24___.md'],
  25: ['25___.txt', '25___.md'],
  26: ['26____FlashLeap.txt', '26____FlashLeap.md'],
  27: ['27____Firefly_.txt', '27____Firefly.md'],
  28: ['28___.txt', '28___.md'],
  29: ['29____.txt', '29____.md'],
  30: ['30____.txt', '30____.md'],
  31: ['31____.txt', '31____.md'],
  32: ['32____.txt', '32____.md'],
  33: ['33_____.txt', '33_________.md'],
  34: ['34____.txt', '34____.md'],
};

type PageRow = {
  n: number;
  kind: Extract<SourceKind, 'provider-page-capture' | 'third-party-page-capture'>;
  title: string;
  originUrl?: string | null;
  statedDate?: string | null;
  grade?: EvidenceGrade;
  notes?: string;
};

const P = 'provider-page-capture' as const;
const T = 'third-party-page-capture' as const;

/** 站长提供的 34 份 TXT 页面存档。sourceId = t + 两位上传编号 */
const PAGE_ROWS: PageRow[] = [
  { n: 1, kind: T, title: '第三方评测页：暮光加速测评页面存档', statedDate: '2026-09-19', notes: '页面标注“最后核验日期 2026-09-19”，该日期是评测站自己的说法，本站未独立核验。' },
  { n: 2, kind: P, title: '飞V官网页面存档（自称品牌站）', originUrl: 'flyv.mom' },
  { n: 3, kind: P, title: '梯子云 LadderCloud 官网页面存档（自称品牌站）', originUrl: 'laddercloud.cyou' },
  { n: 4, kind: T, title: '第三方评测页：浪网测评页面存档', statedDate: '2026-09-19', notes: '页面标注发布与最后核验日期 2026-09-19。' },
  { n: 5, kind: P, title: '灵动云官网页面存档（自称品牌站）', originUrl: 'lingdongyun.sbs' },
  { n: 6, kind: T, title: '隐形人官网与机场导航页面存档', notes: '页面自述为第三方使用指引与服务导航站，不是官方自营平台。' },
  { n: 7, kind: T, title: '第三方评测页：飞猫云(FlyCat)页面存档', statedDate: '2026-10-16' },
  { n: 8, kind: T, title: '第三方评测页：星岛梦(StarDream)页面存档', statedDate: '2026-10-16' },
  { n: 9, kind: P, title: '光速云 Lightspeed Cloud 官网页面存档（自称品牌站）', notes: '页脚版权年份为 2025。' },
  { n: 10, kind: P, title: '唯兔云 OnlyRabbit 官网页面存档（自称品牌站）', originUrl: 'weitucloud.vip', notes: '页面同时出现服务暂时不可用类公告与“正常运营中”类状态文字，详见品牌档案。' },
  { n: 11, kind: P, title: 'U1s1 有一说一官网页面存档（自称品牌站）', notes: '页脚写“2026-2029”版权年份，属于异常写法，已在品牌档案记录。' },
  { n: 12, kind: P, title: '极连云官网页面存档（自称品牌站）' },
  { n: 13, kind: P, title: '全球云 Global Cloud 官网页面存档（自称品牌站）' },
  { n: 14, kind: P, title: '光年梯 LightYear 官网页面存档（自称品牌站）' },
  { n: 15, kind: P, title: 'Sogo云推广落地页存档（自称品牌站）' },
  { n: 16, kind: P, title: '宇宙云官网页面存档（自称品牌站）', originUrl: 'yuzhouyun.top' },
  { n: 17, kind: P, title: '二猫云官网页面存档（自称品牌站）', originUrl: 'ermaocloud.homes' },
  { n: 18, kind: T, title: '第三方评测页：一翻云(1fly)页面存档', statedDate: '2026-10-16' },
  { n: 19, kind: P, title: 'EdgeNova 边缘节点官网页面存档（自称品牌站）' },
  { n: 20, kind: T, title: '第三方评测页：可信云(KeXin)页面存档', statedDate: '2026-10-16' },
  { n: 21, kind: P, title: '速界官网页面存档（自称品牌站）' },
  { n: 22, kind: T, title: '第三方评测页：快狸(KuaiLi)页面存档', statedDate: '2026-10-16' },
  { n: 23, kind: P, title: '微风网络 Breezenet 页面存档（仅有页面标题，内容不完整）', grade: 'D', notes: '文件只有 70 字节，只含一行页面标题；另一份提取文件 23_breezenet_extracted.txt 为 0 字节。' },
  { n: 24, kind: T, title: '第三方评测页：无忧链接(WuYou)页面存档', statedDate: '2026-10-16', notes: '页面名称是“无忧链接”，站长清单写作“无忧”；站长已于 2026-10-28 确认是同一服务。' },
  { n: 25, kind: T, title: '第三方评测页：灵猫网络(SpiritCat)页面存档', statedDate: '2026-10-16' },
  { n: 26, kind: P, title: '闪跃VPN 首页存档（自称品牌站）', notes: '只有首页内容，没有标注日期。' },
  { n: 27, kind: T, title: '第三方评测页：飞为(Firefly)页面存档', statedDate: '2026-10-16' },
  { n: 28, kind: P, title: '跨界云官网页面存档（自称品牌站）', originUrl: 'kuajiecloud.homes' },
  { n: 29, kind: T, title: '第三方评测页：榴莲云评测页面存档', statedDate: '2026-10-20' },
  { n: 30, kind: T, title: '第三方评测页：大佬云评测页面存档', statedDate: '2026-10-20' },
  { n: 31, kind: P, title: '“闪电云机场”静态演示站页面存档', grade: 'D', notes: '页面标题和页脚均写明“静态演示站点”，不能证明真实运营。' },
  { n: 32, kind: P, title: '“环球云-专业的云计算服务商”页面存档（同名云计算公司）', grade: 'D', notes: '页面是一家同名云计算/CDN 公司的网站，没有机场内容。站长 2026-10-28 确认环球云就是“环球梯”，这份存档不使用。' },
  { n: 33, kind: T, title: '第三方评测页：神行加速服务商档案页面存档', statedDate: '2026-09-22', notes: '页面标注站长核对于 2026-09-22、数据更新于 2026-09-27；页面名称是“神行加速”，站长清单写作“神行云”；站长已于 2026-10-28 确认是同一服务。' },
  { n: 34, kind: T, title: '第三方评测页：云界线(YunJieXian)页面存档', statedDate: '2026-10-16', notes: '页面名称是“云界线”，站长清单写作“云界云”；站长已于 2026-10-28 确认是同一服务。' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const brandByUploadNo = new Map(BRAND_INDEX.map((b) => [b.uploadFileNo, b]));

const pageSources: SourceRecord[] = PAGE_ROWS.map((r) => {
  const b = brandByUploadNo.get(r.n);
  if (!b) throw new Error(`source-registry: 上传编号 ${r.n} 没有对应品牌`);
  const [file] = FILES[r.n]!;
  return {
    sourceId: `t${pad2(r.n)}`,
    brandId: b.slug,
    kind: r.kind,
    title: r.title,
    originUrl: r.originUrl ?? null,
    file,
    uploadNo: r.n,
    receivedAt: RECEIVED_AT,
    statedDate: r.statedDate ?? null,
    defaultGrade: r.grade ?? 'C',
    ...(r.notes ? { notes: r.notes } : {}),
  };
});

const compiledSources: SourceRecord[] = BRAND_INDEX.map((b) => ({
  sourceId: `m${pad2(b.uploadFileNo)}`,
  brandId: b.slug,
  kind: 'compiled-library' as const,
  title: `汇编资料条目：${b.shortName}（站长整理的单品牌资料）`,
  originUrl: null,
  file: FILES[b.uploadFileNo]![1],
  uploadNo: b.uploadFileNo,
  receivedAt: RECEIVED_AT,
  statedDate: null,
  defaultGrade: 'D' as const,
  notes: '二次整理的汇编资料，经常与页面存档冲突或带有模板痕迹，只作线索，不作为确定数据。',
}));

const specialSources: SourceRecord[] = [
  {
    sourceId: 'ldy-panel-chuanyun',
    brandId: 'lingdongyun',
    kind: 'provider-screenshot',
    title: '灵动云面板：灵动·穿云套餐详情截图（站长 2026-10-28 提供）',
    originUrl: null,
    file: 'plan-chuanyun-2026-10-28.png',
    receivedAt: '2026-10-28',
    statedDate: null,
    defaultGrade: 'B',
    notes: '服务商面板里的套餐详情，写明 70GB/月、每 30 天刷新、全 IPLC 专线与各地区节点数量。截图没有时间。套餐说明中的节点清单与另一品牌（隐形人）页面存档的写法完全相同，可能是服务商套用的模板文字，所以节点数量按“服务商宣称”展示。',
  },
  {
    sourceId: 'tp-jilianyun-2026-07-16',
    brandId: 'jilianyun',
    kind: 'third-party-page-capture',
    title: '第三方评测页：极连云（站长提供，2026-07-16）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-07-16',
    defaultGrade: 'C',
    notes: '第三方评测站对极连云的整理，站长要求不公开网站名称。页面列出套餐参考价、常用地区和使用方式，没有节点数量。',
  },
  {
    sourceId: 'tp-guangnianti-2026-10-19',
    brandId: 'guangnianti',
    kind: 'third-party-page-capture',
    title: '第三方评测页：光年梯（站长提供，2026-10-19）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-10-19',
    defaultGrade: 'C',
    notes: '第三方评测站对光年梯的整理，站长要求不公开网站名称。页面列出 6 档套餐和付款方式，没有节点数量和地区。',
  },
  {
    sourceId: 'tp-yuzhouyun-2026-08-04',
    brandId: 'yuzhouyun',
    kind: 'third-party-page-capture',
    title: '第三方评测页：宇宙云（站长提供，最近核实 2026-08-04）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-08-04',
    defaultGrade: 'C',
    notes: '第三方评测站对宇宙云的整理，站长要求不公开网站名称。页面列出 5 档套餐，没有节点数量、地区和协议。',
  },
  {
    sourceId: 'tp-yuzhouyun-2026-08-14',
    brandId: 'yuzhouyun',
    kind: 'third-party-page-capture',
    title: '第三方评测页：宇宙云（站长提供，测速样本 2026-08-14）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-08-14',
    defaultGrade: 'C',
    notes: '另一家第三方评测站对宇宙云的整理，站长要求不公开网站名称。页面的测速数值不合常理，本站没有录入。',
  },
  {
    sourceId: 'tp-2026-09-22-huanqiuti',
    brandId: 'huanqiuyun',
    kind: 'third-party-page-capture',
    title: '第三方对比资料：环球梯（站长提供，价格核对于 2026-09-22）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-09-22',
    defaultGrade: 'C',
    notes: '第三方对比站的环球梯价格表，该站写明价格由其站长在 2026-09-22 核对，节点、地区、协议等都标“未核实”。站长要求不公开网站名称。',
  },
  {
    sourceId: 'tp-2026-10-20',
    kind: 'third-party-page-capture',
    title: '第三方评测资料（站长提供，资料日期 2026-10-19 / 10-20）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-10-20',
    defaultGrade: 'C',
    notes:
      '另一家第三方评测站的逐家档案页，站长要求不公开网站名称。价格多为该站从官方面板看到的数字（观察日期 2026-10-19 / 10-20），节点数多为服务商截图或第三方测试，没有分地区数量。本站只摘录事实，文字全部重写。',
  },
  {
    sourceId: 'tp-2026-10-26',
    kind: 'third-party-page-capture',
    title: '第三方评测资料（站长提供，资料日期 2026-10-26）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-10-26',
    defaultGrade: 'C',
    notes:
      '一家第三方评测站对 18 家机场的整理，站长要求不公开网站名称。本站只摘录套餐价格、协议、线路、设备数、付款与客服等事实，文字全部重写。该站的测速数字 18 家几乎一样，看不出是逐家独立测试，没有录入。',
  },
  {
    sourceId: 'owner-2026-10-29',
    kind: 'user-instruction',
    title: '站长提供的官网套餐截图（2026-10-29）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-29',
    statedDate: '2026-10-29',
    defaultGrade: 'C',
    notes: '站长逐家提供的官网套餐页截图，只读取价格、流量、线路与套餐说明，截图不保存、不发布。截图里前后不一致的地方按卡片顶部的大字。',
  },
  {
    sourceId: 'owner-2026-10-31-coupons',
    kind: 'user-instruction',
    title: '站长提供的优惠码清单（2026-10-31）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-31',
    statedDate: '2026-10-31',
    defaultGrade: 'C',
    notes: '34 家各一个优惠码，站长说明来自各服务商。本站只原样展示代码，不写折扣幅度与有效期；见 src/data/coupons.ts。',
  },
  {
    sourceId: 'owner-2026-10-31',
    kind: 'user-instruction',
    title: '站长说明（2026-10-31）：灵动云线路含 IEPL 专线',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-31',
    statedDate: '2026-10-31',
    defaultGrade: 'C',
    notes: '站长要求在灵动云的线路里加上“IEPL 专线”。这是站长说明，没有附服务商页面或截图，不等于独立证据；本站按说明列出并标注来源。',
  },
  {
    sourceId: 'owner-2026-10-31-ldy-plans',
    brandId: 'lingdongyun',
    kind: 'provider-screenshot',
    title: '灵动云官网套餐页截图：9 个套餐的价格、流量与权益说明（站长 2026-10-31 提供）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-31',
    statedDate: null,
    defaultGrade: 'B',
    notes:
      '站长提供的 3 张官网套餐页截图，覆盖拂风、驭浪、破晓、凌霄、穿云、闲云、惊云、飞云和至尊私人定制 9 个套餐。本站读取套餐名称、起步价、月流量或总流量、付款周期数量、设备限制和每个套餐的权益说明；权益说明是服务商的宣传文字，本站改写后列出，没有逐项实测。截图没有时间也没有网址，截图本身不在站内发布。',
  },
  {
    sourceId: 'owner-2026-10-31-ldy-panel',
    brandId: 'lingdongyun',
    kind: 'provider-screenshot',
    title: '灵动云后台节点面板截图：60 个节点的在线状态与倍率（站长 2026-10-31 21:37–21:38 提供）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-31',
    statedDate: '2026-10-31',
    defaultGrade: 'B',
    notes:
      '站长提供的 4 张后台节点面板截图，逐行共 60 个节点（编号 1–60）：香港 20、台湾 10、日本 10、新加坡 10、美国 10，全部在线，倍率均为 1x，“最后检查”时间在 21:37–21:38 之间。截图含后台面板，按站长要求不公开，本站只转录各地区数量和在线数。它比 2026-10-21 的 57 个节点快照和站长 2026-10-29 口头确认的 57 个更新，所以灵动云的节点总数以这一份为准。',
  },
  {
    sourceId: 'owner-2026-10-28',
    kind: 'user-instruction',
    title: '站长确认（2026-10-28）：品牌身份与微风网络节点清单',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-10-28',
    defaultGrade: 'C',
    notes:
      '站长确认：神行云 = 神行加速，云界云 = 云界线，无忧 = 无忧链接，闪电云 = 闪电鼠，环球云 = 环球梯，唯兔云统一使用“唯兔云”（V2云、OnlyRabbit 为别名）。站长同时给出微风网络的节点清单。这是站长说明，不等于独立证据。',
  },
  {
    sourceId: 'owner-sheet',
    kind: 'user-instruction',
    title: '站长 Excel：《最低价格以及机场优势》（Google 表格）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: null,
    defaultGrade: 'C',
    notes:
      '站长整理的 34 家最低价套餐、优势、节点、线路与客户端汇总，没有日期和截图。其中 9 家的节点栏是同一段示例文字（“香港01…美国4，等等++”），不能当作节点清单；测速栏（Google、YouTube、ChatGPT 等）为空。',
  },
  {
    sourceId: 'tp-2026-10-20-breezenet',
    brandId: 'breezenet',
    kind: 'third-party-page-capture',
    title: '第三方评测页：微风网络（站长提供，资料日期 2026-10-20）',
    originUrl: null,
    file: null,
    receivedAt: '2026-10-28',
    statedDate: '2026-10-20',
    defaultGrade: 'C',
    notes:
      '站长于 2026-10-28 提供链接，本站当天读取。页面写“最后核验更新 2026-10-20”，并附 2026-10-24 的新加坡节点测速。页面是推广性质的评测，所有链接都经过该站的跳转页，没有写出服务商自己的域名；测速与“已核验”标记都是该站自述。本站只摘录事实数据，文字全部重写。',
  },
  {
    sourceId: 'master-instruction',
    kind: 'user-instruction',
    title: '站长建站总指令：品牌固定顺序、推广入口与站长说明',
    originUrl: null,
    file: 'attachment.txt',
    receivedAt: RECEIVED_AT,
    statedDate: null,
    defaultGrade: 'C',
    notes: '站长指定品牌顺序、34 条推广入口，并说明了灵动云 ¥99 年付 70GB 的口径与边缘节点 50GB/72GB 的冲突。这些是站长的说明，不等于独立证据。',
  },
  {
    sourceId: 'img-ldy-report',
    brandId: 'lingdongyun',
    kind: 'site-owner-composite',
    title: '站长整理图：灵动云新加坡节点测速、节点在线与 YouTube 播放核验报告',
    originUrl: null,
    file: 'image.png',
    receivedAt: RECEIVED_AT,
    statedDate: null,
    defaultGrade: 'A',
    notes:
      '整理图把三类不同时间的证据放在一起：节点在线（2026-10-21 18:57:32–18:58:30，北京时间）、新加坡测速（截图没有可见日期）、YouTube Stats for nerds（2026-10-24 23:04:55）。原始截图已不保留，站内记录在补齐原图前不标记为“已核验”。',
  },
  {
    sourceId: 'lib-prices',
    kind: 'compiled-library',
    title: '《34家机场全套餐价格与综合资料库》',
    originUrl: null,
    file: '34______________.md',
    receivedAt: RECEIVED_AT,
    statedDate: null,
    defaultGrade: 'D',
    notes: '综合汇编库，与单品牌 MD 同属二次整理；数字多处与页面存档冲突，且存在同一套数字被套用到不同品牌的痕迹，只作线索。',
  },
  {
    sourceId: 'lib-panorama',
    kind: 'compiled-library',
    title: '《34家机场资料库与全部套餐价格全景分类指南》',
    originUrl: null,
    file: '34___________________.md',
    receivedAt: RECEIVED_AT,
    statedDate: null,
    defaultGrade: 'D',
    notes: '综合汇编库，用途同上；只作线索。',
  },
  {
    sourceId: 't23x',
    brandId: 'breezenet',
    kind: 'provider-page-capture',
    title: '微风网络 Breezenet 提取文件（空文件）',
    originUrl: null,
    file: '23_breezenet_extracted.txt',
    uploadNo: 23,
    receivedAt: RECEIVED_AT,
    statedDate: null,
    defaultGrade: 'D',
    notes: '文件大小为 0 字节，没有任何内容。',
  },
];

export const SOURCES: readonly SourceRecord[] = [...specialSources, ...pageSources, ...compiledSources];

const BY_ID = new Map(SOURCES.map((s) => [s.sourceId, s]));
if (BY_ID.size !== SOURCES.length) throw new Error('source-registry: 存在重复的 sourceId');

export const getSource = (id: string): SourceRecord | undefined => BY_ID.get(id);

export function mustGetSource(id: string): SourceRecord {
  const s = BY_ID.get(id);
  if (!s) throw new Error(`source-registry: 未登记的来源 ${id}`);
  return s;
}

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  'site-owner-test': '本站实测记录',
  'provider-screenshot': '服务商后台/公开说明截图',
  'provider-page-capture': '自称品牌站的页面存档（归属未独立核验）',
  'third-party-page-capture': '第三方评测/聚合站页面存档',
  'compiled-library': '汇编资料（二次整理，仅作线索）',
  'site-owner-composite': '站长数据整理图',
  'user-instruction': '站长指定',
};

/** 某个品牌引用到的全部来源（去重，保持注册顺序） */
export function sourcesForBrand(brandId: string): SourceRecord[] {
  return SOURCES.filter((s) => s.brandId === brandId);
}
