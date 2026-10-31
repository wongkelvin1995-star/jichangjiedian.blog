/**
 * 7 个地区专题页各自独有的正文：标题、导语、分析重点、“数据能说明什么 / 还缺什么”、使用场景、问答与地区间内链。
 *
 * 规则：
 *  - 数字一律从数据层取（机场数、测试记录字段），页面不写死；没有实测的地区如实写“本站尚无该地区实测”。
 *  - 地理距离、光纤传播时延是原理 / 理论推算，文中都标明“约”“理论下限”，与站内文章口径一致
 *    （上海—香港约 1230 km；光纤往返每 100 km 约 1 ms；光在光纤里约 20 万 km/s）。
 *  - 段落里只允许站内链接（<a href="/...">），由页面以 set:html 输出。
 */
import type { TestRecord } from './types';
import { LDY_HK_PEAK, LDY_HK_REACHABILITY, LDY_HK_YOUTUBE, LDY_PEAK_PAGE_PATH, LDY_US_PEAK, LDY_US_REACHABILITY } from './reports/lingdongyun-peak-2026-10-28';
import { LDY_PEAK, LDY_PEAK_REACHABILITY, LDY_REPORT_PATH, LDY_SPEEDTEST, LDY_YOUTUBE } from './reports/lingdongyun-sg-2026-10';
import { LDY_AVAILABILITY_1031 } from './reports/lingdongyun-sg-2026-10-31';
import { TIME_WINDOWS } from './time-windows';

export interface RegionFaq {
  q: string;
  a: string;
}

export interface RegionLink {
  slug: string;
  /** 锚文本，要和上下文相关，不堆砌关键词 */
  anchor: string;
  /** 一句话说明为什么要去看那一页 */
  why: string;
}

/** 页面在渲染前算好、交给文案函数使用的数字（全部来自数据层） */
export interface RegionContentCtx {
  /** 本站收录的机场总数 */
  total: number;
  /** 公开资料有记录的机场数（欧洲页按品牌去重） */
  documented: number;
  /** 其中资料里写明了该地区节点数量的机场数 */
  withCount: number;
  /** 其中资料里有该地区节点名称原文的机场数 */
  withNames: number;
  /** 本站实测记录（A/B 级） */
  siteRecords: TestRecord[];
  /** 节点在线快照条数 */
  snapshots: number;
  /** 其他测速参考行数 */
  thirdParty: number;
  /** 欧洲页：各国有记录的机场数 */
  parts: { name: string; documented: number }[];
}

export interface RegionContent {
  /** <title>，含站名后缀，60 字以内 */
  title: string;
  h1: string;
  /** meta description，50–160 字 */
  description: string;
  /** 这一页主要回答的搜索问题（显示在导语上方） */
  intent: string;
  /** 导语，可含站内链接 */
  lead: string;
  /** 分析重点 */
  focus: { heading: string; paragraphs: string[] };
  /** 这个地区的数据能说明什么 / 还缺什么 */
  evidence: { heading: string; paragraphs: string[]; missing: string[]; method: string[] };
  /** 使用场景与选择建议 */
  scenarios: { heading: string; items: { label: string; text: string }[] };
  faq: RegionFaq[];
  related: RegionLink[];
}

const peak = TIME_WINDOWS.find((w) => w.id === 'peak')!;
const PEAK = `${peak.start}–${peak.end}`;
const reach = (rows: { site: string; ms: number | null; label: string }[], site: string) => rows.find((r) => r.site === site)!;
const reachText = (rows: { site: string; ms: number | null; label: string }[], site: string) => {
  const r = reach(rows, site);
  return r.ms === null ? `${site} ${r.label}` : `${site} ${r.ms} ms（${r.label}）`;
};

/** 理论往返传播下限：光纤约 20 万 km/s，往返每 100 km 约 1 ms；输入直线距离（km） */
const floorMs = (km: number) => Math.round(km / 100);

const THEORY = '以下距离是直线距离的约数，延迟是光纤传播的理论往返下限（约 20 万 km/s，每 100 km 约 1 ms），不是实测；真实光缆比直线长，还要加上设备转发和排队时间，实测一定更高。';

const hk = LDY_HK_PEAK;
const hkYt = LDY_HK_YOUTUBE;
const us = LDY_US_PEAK;
const sgPeak = LDY_PEAK;
const sgUndated = LDY_SPEEDTEST;
const sgYt = LDY_YOUTUBE;
const snap = LDY_AVAILABILITY_1031;
const snapOf = (code: string) => snap.byRegion.find((r) => r.countryCode === code)!;

export const REGION_CONTENT: Record<string, (c: RegionContentCtx) => RegionContent> = {
  'hong-kong': (c) => ({
    title: `香港节点推荐：${c.documented}家机场、延迟与晚高峰实测｜机场节点`,
    h1: '香港节点：离大陆最近的选择，延迟多低、晚高峰表现如何',
    description: `香港节点离大陆最近，是日常上网和游戏的常用选择。本页列出 ${c.documented} 家提供香港节点的机场，解释约 1230 km 距离对应的延迟理论下限，并解读灵动云香港节点 2026-10-28 晚高峰实测：下载 ${hk.downloadMbps} Mbps、空载延迟 ${hk.idleLatencyMs} ms。`,
    intent: '这一页回答：香港节点到底有多“近”，晚高峰实测里的延迟和速度该怎么读，哪些机场提供香港节点。',
    lead: `香港是本站资料里出现得最普遍的地区：${c.documented} 家机场全部有记录，其中 ${c.withCount} 家写明了香港节点数量。它常被当作“默认节点”，理由是距离近、延迟低。本页把这个理由拆开看：距离决定的是延迟下限，而晚高峰实测里 ${hk.idleLatencyMs} ms 的空载延迟和 ${hk.downloadMbps} Mbps 的下载速度，说明下限和实际之间还有很大一段是由线路、入口和时段决定的。`,
    focus: {
      heading: '距离近到什么程度，延迟为什么还不止十几毫秒',
      paragraphs: [
        `${THEORY}从上海到香港直线约 1230 km，理论往返下限约 ${floorMs(1230)} ms；从北京约 1970 km，约 ${floorMs(1970)} ms；从广州只有约 130 km，约 ${floorMs(130)} ms。在本站覆盖的地区里，<a href="/regions/taiwan/">台湾节点</a>（上海—台北约 690 km）和韩国节点（约 870 km）的直线距离与香港处在同一量级，其中台湾几乎每家机场都有，是对延迟敏感的用户最该和香港放在一起比较的一页。`,
        `但 2026-10-28 晚高峰实测里，灵动云香港节点的空载延迟是 ${hk.idleLatencyMs} ms，比同一晚新加坡节点的 ${sgPeak.idleLatencyMs} ms 还高，虽然新加坡的直线距离是香港的三倍。这不是测错，而是延迟由三段组成：本地宽带到跨境入口、跨境线路本身、出口到目标。香港节点省下的只是中间一段，如果入口绕路或者走拥挤的公网，前后两段会把差距吃掉。读香港节点的延迟数字时，要看“比理论下限多出多少”，而不是只看绝对值。`,
        `同一次测试的负载延迟更能说明晚高峰状态：下载时延迟升到 ${hk.loadedDownloadLatencyMs} ms，上传时升到 ${hk.loadedUploadLatencyMs} ms，分别是空载的约 ${Math.round(hk.loadedDownloadLatencyMs! / hk.idleLatencyMs!)} 倍和 ${Math.round(hk.loadedUploadLatencyMs! / hk.idleLatencyMs!)} 倍。对游戏和视频通话来说，这个“带宽占满时延迟涨多少”比空载延迟更重要，解释见<a href="/articles/idle-vs-loaded-latency/">空载延迟与负载延迟</a>。`,
      ],
    },
    evidence: {
      heading: '香港的数据能说明什么，还缺什么',
      paragraphs: [
        `本站有 ${c.siteRecords.length} 条香港节点实测，都来自灵动云、都在 2026-10-28 晚高峰（${PEAK}）：一次网页测速（下载 ${hk.downloadMbps} Mbps、上传 ${hk.uploadMbps} Mbps、空载延迟 ${hk.idleLatencyMs} ms、抖动 ${hk.jitterMs} ms，测速节点 HKG，丢包率浏览器测不出所以记为“未测得”），和一次 YouTube 720p 播放观察（缓冲 ${hkYt.youtubeBufferSeconds} 秒、掉帧 13/750）。另有 ${c.snapshots} 次节点在线快照：2026-10-31 面板显示香港 ${snapOf('HK').online}/${snapOf('HK').total} 在线。完整原图和三地对比在<a href="${LDY_PEAK_PAGE_PATH}">晚高峰三地实测</a>。`,
        `同一页面的 15 个网站连通性里，${reachText(LDY_HK_REACHABILITY, 'YouTube')}、${reachText(LDY_HK_REACHABILITY, 'ChatGPT')}、${reachText(LDY_HK_REACHABILITY, 'TikTok')}；慢的是 ${reachText(LDY_HK_REACHABILITY, 'Netflix')}、${reachText(LDY_HK_REACHABILITY, 'Telegram')}，${reachText(LDY_HK_REACHABILITY, 'Claude')}。连通性只是“能不能连上、连上要多久”，不等于解锁或能正常使用。`,
        `这些数字能说明的是：这一晚这一刻，一个香港节点上日常网页和 720p 视频没有问题，但抖动很小（${hk.jitterMs} ms）的同时下载速度并不高。它不能说明香港节点整体快慢，也不能说明其他 ${c.documented - 1} 家机场的香港节点如何。`,
      ],
      missing: [
        '只有一个品牌、一个晚上、一个节点的单次记录；没有连续多天同一时段的对比，不能判断“晚高峰是否稳定”。',
        '截图没有显示是 20 个香港节点里的哪一个，也没有记录测试者的城市和本地宽带，所以“比理论下限多出多少”只能粗估。',
        `其他 ${c.documented - 1} 家机场的香港节点，本站只有资料记录和 ${c.thirdParty} 行第三方摘录，没有本站实测。`,
      ],
      method: [
        `在 ${PEAK} 固定时段，用同一台设备连同一个香港节点，网页测速连续三天各一次，记下载、上传、空载与负载延迟、抖动，并截图保留系统时钟。`,
        '游戏用户另外用客户端（如 Clash Verge）对同一节点连续测 10 次延迟，看波动范围而不是单次最小值，方法见<a href="/guides/clash-verge-latency-test/">Clash Verge 延迟测试</a>。',
        '记录自己所在城市，这样才能把实测延迟和理论下限放在一起比。',
      ],
    },
    scenarios: {
      heading: '什么情况该选香港节点',
      items: [
        { label: '日常网页、搜索、社交', text: '最省心的选择，几乎每家机场都有香港节点，节点数量也最多，高峰时有换的余地。' },
        { label: '游戏（亚服）', text: `看负载延迟和抖动，不只看空载。实测里空载 ${hk.idleLatencyMs} ms、抖动 ${hk.jitterMs} ms 对多数网游够用，但下载占满带宽时延迟会升到两三倍，游戏时别同时下载。` },
        { label: '短视频、720p–1080p 视频', text: `YouTube 720p 观察到缓冲 ${hkYt.youtubeBufferSeconds} 秒，说明带宽足够。4K 没有测过，不下结论。` },
        { label: 'Netflix 等流媒体', text: `连通性测试里 Netflix 是 ${reach(LDY_HK_REACHABILITY, 'Netflix').ms} ms“较慢”。看流媒体更常用<a href="/regions/japan/">日本</a>或<a href="/regions/singapore/">新加坡</a>节点，取舍见那两页。` },
      ],
    },
    faq: [
      { q: '香港节点的延迟理论上能低到多少？', a: `这是原理推算，不是实测：光在光纤里约 20 万 km/s，往返每 100 km 约 1 ms。上海到香港直线约 1230 km，理论往返下限约 ${floorMs(1230)} ms；广州约 130 km，下限约 ${floorMs(130)} ms。真实光缆绕路，再加上设备和排队时间，实测会明显高于这个数。本站 2026-10-28 晚高峰实测到的空载延迟是 ${hk.idleLatencyMs} ms。` },
      { q: '为什么实测里香港节点延迟比新加坡还高？', a: `2026-10-28 同一晚，灵动云香港节点空载延迟 ${hk.idleLatencyMs} ms，新加坡 ${sgPeak.idleLatencyMs} ms。距离只决定中间一段的下限，入口在哪、线路怎么绕、出口接到哪家网络同样影响延迟。这只是一个品牌一晚的记录，不能推广到所有香港节点。` },
      { q: '香港节点晚高峰看 YouTube 卡不卡？', a: `本站只有一次观察：2026-10-28 21:45，720p 播放缓冲 ${hkYt.youtubeBufferSeconds} 秒、掉帧 13/750，没有卡顿迹象。这是单次 720p 观察，1080p、4K 和其他机场的香港节点没有测过。` },
      { q: '有多少家机场提供香港节点？', a: `本站收录的 ${c.documented} 家机场资料里都有香港节点记录，其中 ${c.withCount} 家写明了数量，其余只写“多个”。资料里的数量不是本站数出来的，以客户端实际列表为准。` },
    ],
    related: [
      { slug: 'taiwan', anchor: '台湾节点同样以低延迟见长', why: '直线距离与香港同一量级，对游戏用户是最直接的替代。' },
      { slug: 'singapore', anchor: '同一晚新加坡节点的实测数字', why: '同品牌、同一晚、同一方法，可以和香港这组数据直接对照。' },
    ],
  }),

  japan: (c) => ({
    title: `日本节点推荐：${c.documented}家机场、流媒体与日区服务怎么选｜机场节点`,
    h1: '日本节点：看流媒体和日区服务，与香港、新加坡怎么取舍',
    description: `日本节点常用于 Netflix 日区、YouTube、日区游戏和动漫服务。本页列出 ${c.documented} 家提供日本节点的机场，说明日本与香港、新加坡在距离、延迟理论下限和用途上的差别。本站尚无日本节点实测，页内给出自测方法。`,
    intent: '这一页回答：什么时候该用日本节点而不是香港或新加坡，日本节点和这两个地区比有什么不同，怎么自己测。',
    lead: `${c.documented} 家机场都有日本节点记录，${c.withCount} 家写明了数量。日本节点很少是“离得最近”的选择，它被选中通常是因为服务：Netflix 日区片库、日区游戏服务器、只对日本 IP 开放的网站和应用。所以本页不按延迟排座次，而是把日本放在<a href="/regions/hong-kong/">香港</a>和<a href="/regions/singapore/">新加坡</a>之间，说清楚三者各适合什么。`,
    focus: {
      heading: '日本、香港、新加坡：一张取舍表',
      paragraphs: [
        `${THEORY}从上海到东京直线约 1760 km，理论往返下限约 ${floorMs(1760)} ms；到香港约 1230 km、约 ${floorMs(1230)} ms；到新加坡约 3800 km、约 ${floorMs(3800)} ms。从北京出发，东京约 2090 km、香港约 1970 km，两者差距不大；从广州出发，东京约 2900 km，是香港的二十多倍。也就是说，日本节点“比香港慢多少”很取决于你在哪座城市。`,
        '用途上的差别比延迟更明确。香港节点的出口 IP 在香港，对多数日区内容没有用；新加坡节点能看东南亚服务，但同样进不了日区片库。需要日本 IP 的场景只有日本节点能做：日区 Netflix、日本限定的游戏服、日本本地的视频和购物站。反过来，只是看 YouTube、刷社交媒体，日本和新加坡没有本质差别，选晚高峰更稳的那个。',
        `另一个常被忽略的差别是线路标注。资料里出现过带“直连”“BGP”“IEPL”字样的日本节点名（例如本页表格里的“日本直连01”），同一家机场的日本节点可能既有专线又有公网直连，两者晚高峰表现差很多。线路术语的含义见<a href="/articles/iepl-iplc-bgp-differences/">IEPL、IPLC 与 BGP 的区别</a>。`,
      ],
    },
    evidence: {
      heading: '日本的数据能说明什么，还缺什么',
      paragraphs: [
        `本站尚无日本节点实测。现有的本站记录只有 ${c.snapshots} 次节点在线快照：2026-10-31 灵动云面板显示日本 ${snapOf('JP').online}/${snapOf('JP').total} 在线，这只说明那一分钟节点可连接，不说明速度或延迟。`,
        `其他测速参考有 ${c.thirdParty} 行，来自不同评测页的截图摘录，测试时间从 2026 年 5 月到 9 月不等，有的在凌晨、有的用云端服务器测，网络和客户端也各不相同，只能当作“这个节点存在、当时能跑出数”的线索，不能互相比较，也不能和本站的 Mbps 数字放在一起看。`,
      ],
      missing: [
        '没有任何一次本站在晚高峰对日本节点做的网页测速或视频播放观察。',
        '资料里没有哪家机场说明自己的日本节点是东京还是大阪机房，也没有写明哪些节点是专线、哪些是直连，表格里的线路类型是品牌级字段。',
        '没有日区流媒体是否可用的记录；本站的网站连通性测试只测“能不能连上”，不测解锁。',
      ],
      method: [
        `在 ${PEAK} 用同一个日本节点做网页测速，重点记空载延迟、下载时延迟和抖动；和自己所在城市的理论下限对比。`,
        '看 Netflix 或 YouTube 时打开“Stats for nerds”，记录分辨率、Connection Speed 和缓冲秒数，方法见<a href="/guides/youtube-stats-for-nerds/">YouTube Stats for nerds 怎么看</a>。',
        '同一时段再测一次香港节点，把两组数字放在一起，才能回答“我这里日本比香港慢多少”。',
      ],
    },
    scenarios: {
      heading: '什么情况该选日本节点',
      items: [
        { label: '日区 Netflix、动漫平台', text: '只有出口在日本的节点能进日区片库。资料里没有解锁记录，买前先用月付套餐自己验证。' },
        { label: '日区游戏服务器', text: `延迟理论下限比香港高几毫秒到十几毫秒，取决于你的城市；更要看晚高峰的抖动和负载延迟，不要只看客户端里的单次延迟。` },
        { label: 'YouTube、社交媒体', text: '日本和新加坡没有本质差别，选晚高峰更稳的那个；两者的流媒体取舍见新加坡页。' },
        { label: '只是日常上网', text: '不需要特意用日本节点，香港节点更近、提供的机场也一样多。' },
      ],
    },
    faq: [
      { q: '日本节点和香港节点哪个延迟更低？', a: `原理上看距离：上海到香港约 1230 km、到东京约 1760 km，理论往返下限分别约 ${floorMs(1230)} ms 和 ${floorMs(1760)} ms；但在北京两地距离相近，在广州则相差很远。实际延迟还取决于线路和入口，本站没有日本节点实测，无法用数据回答。` },
      { q: '看 Netflix 该选日本还是新加坡节点？', a: '取决于片库：想看日区内容只能用日本节点；只是要流畅看剧，两者都可以，看哪个在你的晚高峰更稳。本站对新加坡节点有两次晚高峰实测，对日本节点还没有。' },
      { q: '哪些机场提供日本节点？', a: `本站收录的 ${c.documented} 家机场资料里都有日本节点记录，其中 ${c.withCount} 家写明了数量，${c.withNames} 家有节点名称原文（如“日本直连01”“日本04｜横滨”）。` },
    ],
    related: [
      { slug: 'singapore', anchor: '新加坡节点的两次晚高峰实测', why: '流媒体场景下和日本最常被互相替代的地区，而且有真实数据。' },
      { slug: 'hong-kong', anchor: '香港节点的延迟与实测解读', why: '日常上网时的默认对照项。' },
    ],
  }),

  singapore: (c) => ({
    title: `新加坡节点推荐：${c.documented}家机场与两次晚高峰实测解读｜机场节点`,
    h1: '新加坡节点：东南亚出口，两次晚高峰实测说明了什么',
    description: `新加坡是东南亚服务和流媒体常用的出口。本页列出 ${c.documented} 家提供新加坡节点的机场，并解读本站对灵动云新加坡节点的全部实测：晚高峰下载 ${sgPeak.downloadMbps} Mbps、空载延迟 ${sgPeak.idleLatencyMs} ms，以及一次无日期测速和一次 YouTube 720p 观察。`,
    intent: '这一页回答：新加坡节点适合哪些服务，本站两次新加坡测速各能说明什么、哪些数字不能直接比，怎么判断它在你这里的晚高峰稳不稳。',
    lead: `新加坡是本站实测记录最多的地区：${c.siteRecords.length} 条本站记录都来自灵动云新加坡节点，分别是一次没有可见日期的网页测速、一次 2026-10-24 深夜的 YouTube 720p 观察、一次 2026-10-28 晚高峰复测，以及 2026-10-31 的一次网页测速（截图时钟 21:30，下载 13.31 Mbps、延迟 135 ms）和一次 20:41 的 YouTube 观察（缓冲 66.14 秒、掉帧 0/1112）。它们时间不同、方法不同，本页逐条解读，而不是把它们拼成一条“趋势”。${c.documented} 家机场都有新加坡节点记录，${c.withCount} 家写明了数量。`,
    focus: {
      heading: '两次测速为什么不能直接比，分别说明了什么',
      paragraphs: [
        `第一次测速没有可见日期：下载 ${sgUndated.downloadMbps} Mbps、上传 ${sgUndated.uploadMbps} Mbps、空载延迟 ${sgUndated.idleLatencyMs} ms、抖动 ${sgUndated.jitterMs} ms。它的特点是下载远高于上传（约 ${Math.round(sgUndated.downloadMbps! / sgUndated.uploadMbps!)} 倍），抖动接近空载延迟的 ${Math.round((sgUndated.jitterMs! / sgUndated.idleLatencyMs!) * 100)}%。因为没有日期，它不进入任何时段统计，只能当作“这个节点曾经测出过这样的数”。`,
        `第二次是 2026-10-28 约 21:26 的晚高峰复测，有原图和系统时钟：下载 ${sgPeak.downloadMbps} Mbps、上传 ${sgPeak.uploadMbps} Mbps、空载延迟 ${sgPeak.idleLatencyMs} ms、抖动 ${sgPeak.jitterMs} ms，测速节点 SIN。和第一次相比，下载变低、上传变高、延迟和抖动都明显变小。但两次的时间、可能的节点编号都不同，不能说“变快了”或“变慢了”，只能说这个品牌的新加坡节点在晚高峰测出过一组延迟较低、带宽中等的结果。`,
        `同一晚高峰的负载延迟值得单独看：下载时 ${sgPeak.loadedDownloadLatencyMs} ms，上传时 ${sgPeak.loadedUploadLatencyMs} ms，上传时的增幅是三地里最大的。做视频会议、上传大文件的用户要注意这一点，而不是只看 ${sgPeak.idleLatencyMs} ms 的空载延迟。各项指标怎么读，见<a href="/articles/singapore-node-speedtest-metrics/">新加坡节点测速指标解读</a>。`,
        `${THEORY}从上海到新加坡直线约 3800 km，理论往返下限约 ${floorMs(3800)} ms；从广州约 2630 km、约 ${floorMs(2630)} ms。晚高峰实测的 ${sgPeak.idleLatencyMs} ms 比下限高出约 ${Math.round(sgPeak.idleLatencyMs! - floorMs(3800))} ms（按上海算），这部分就是线路、入口和排队的开销。`,
      ],
    },
    evidence: {
      heading: '新加坡的数据能说明什么，还缺什么',
      paragraphs: [
        `除两次测速外，还有 2026-10-24 23:04:55 的 YouTube 720p 观察：缓冲 ${sgYt.youtubeBufferSeconds} 秒、掉帧 0/1718、播放器估算连接速度约 ${Math.round(Number(sgYt.extraMetrics?.connectionSpeedKbps?.value ?? 0) / 1000)} Mbps。它在预设晚高峰窗口（${PEAK}）结束后 4 分钟，所以不计入晚高峰统计。节点在线快照 ${c.snapshots} 次：2026-10-31 面板显示新加坡 ${snapOf('SG').online}/${snapOf('SG').total} 在线。完整报告见<a href="${LDY_REPORT_PATH}">灵动云新加坡节点测速报告</a>。`,
        `晚高峰复测同一页面的网站连通性：${reachText(LDY_PEAK_REACHABILITY, 'YouTube')}、${reachText(LDY_PEAK_REACHABILITY, 'ChatGPT')}、${reachText(LDY_PEAK_REACHABILITY, 'TikTok')}；${reachText(LDY_PEAK_REACHABILITY, 'Netflix')}，${reachText(LDY_PEAK_REACHABILITY, 'Claude')}。到 Netflix、Claude 这类服务的连接明显更慢，和它作为“东南亚出口”而不是美国出口的定位一致。`,
      ],
      missing: [
        '第一次测速没有日期，第一次测速和 YouTube 观察的原始截图已不保留，这两条记录标记为“未核验”。',
        '三条记录都没有显示是 8 个新加坡节点里的哪一个，也没有本地宽带信息。',
        `其他 ${c.documented - 1} 家机场的新加坡节点没有本站实测，只有 ${c.thirdParty} 行第三方摘录。`,
        '没有东南亚本地服务（如新加坡、马来西亚的流媒体和购物站）是否可用的记录。',
      ],
      method: [
        `在 ${PEAK} 连续 7 天、每天同一时间测同一个新加坡节点，记录方法见<a href="/guides/seven-day-node-speed-log/">连续 7 天记录节点速度</a>；第一天的数字只能和自己的后几天比。`,
        '上传为主的用户单独记“上传时延迟”，这是新加坡这组数据里波动最大的指标。',
        '测速页的“网络/ASN”显示的是出口侧信息，不要误当成本地宽带。',
      ],
    },
    scenarios: {
      heading: '什么情况该选新加坡节点',
      items: [
        { label: '东南亚服务、区域电商和游戏服', text: '出口在新加坡的节点是这类服务最自然的入口，这是新加坡相对日本、香港的独有用途。' },
        { label: 'YouTube、社交媒体', text: `720p 观察缓冲 ${sgYt.youtubeBufferSeconds} 秒、零掉帧，晚高峰连通性里 YouTube ${reach(LDY_PEAK_REACHABILITY, 'YouTube').ms} ms。和<a href="/regions/japan/">日本节点</a>相比没有本质差别，看哪个在你这里更稳。` },
        { label: 'ChatGPT 等 AI 服务', text: `晚高峰连通性 ChatGPT ${reach(LDY_PEAK_REACHABILITY, 'ChatGPT').ms} ms 可连接，但 Claude 超时。能不能登录和使用取决于服务商的地区策略，本站不记录解锁。需要美国 IP 的服务见<a href="/regions/united-states/">美国节点</a>。` },
        { label: '视频会议、大文件上传', text: `注意上传时延迟升到 ${sgPeak.loadedUploadLatencyMs} ms；会议前先测一次上传。` },
      ],
    },
    faq: [
      { q: '本站的两次新加坡测速哪一次更能代表晚高峰？', a: `只有 2026-10-28 约 21:26 的复测在晚高峰窗口（${PEAK}）内且有原图和系统时钟：下载 ${sgPeak.downloadMbps} Mbps、上传 ${sgPeak.uploadMbps} Mbps、空载延迟 ${sgPeak.idleLatencyMs} ms。另一次没有日期，不进入时段统计。两次不能比较升降。` },
      { q: '新加坡节点晚高峰比美国节点稳吗？', a: `2026-10-28 同一晚、同一品牌、同一方法下，新加坡空载延迟 ${sgPeak.idleLatencyMs} ms、下载 ${sgPeak.downloadMbps} Mbps，美国 ${us.idleLatencyMs} ms、${us.downloadMbps} Mbps。这只是一个晚上的单次对照，两地的详细比较见<a href="/articles/singapore-vs-us-nodes/">新加坡节点与美国节点怎么选</a>。` },
      { q: '新加坡节点的延迟理论下限是多少？', a: `原理推算：上海到新加坡直线约 3800 km，光纤往返每 100 km 约 1 ms，下限约 ${floorMs(3800)} ms；广州约 2630 km、约 ${floorMs(2630)} ms。实测 ${sgPeak.idleLatencyMs} ms 高出的部分来自线路绕行、设备和排队。` },
      { q: '哪些机场有新加坡节点？', a: `本站收录的 ${c.documented} 家机场资料里都有新加坡节点记录，其中 ${c.withCount} 家写明数量，${c.withNames} 家有节点名称原文。` },
    ],
    related: [
      { slug: 'united-states', anchor: '同一晚美国节点测到的 101 ms 怎么解读', why: '同品牌同一晚的另一组数据，适合和新加坡对照。' },
      { slug: 'japan', anchor: '日本节点与新加坡在流媒体上的取舍', why: '看剧时最常被互相替代的两个地区。' },
    ],
  }),

  taiwan: (c) => ({
    title: `台湾节点推荐：${c.documented}家机场、低延迟与客户端里怎么认｜机场节点`,
    h1: '台湾节点：低延迟与台区服务，客户端里的台湾节点怎么认',
    description: `台湾节点距离近、延迟理论下限低，适合游戏和需要台湾 IP 的服务。本页列出 ${c.documented} 家提供中国台湾节点的机场，说明资料里“台湾01”“台北”“花莲”等命名怎么对应，并与香港节点比较。本站尚无台湾节点实测，页内给出测法。`,
    intent: '这一页回答：台湾节点和香港节点在延迟上谁更近、怎么选，客户端列表里哪些名字是台湾节点，以及怎样自己测。',
    lead: `${c.documented} 家机场都有中国台湾节点记录，${c.withCount} 家写明了数量，但各家的数量差别比其他地区大：有的写 10 个，有的只写 5 个。台湾节点在客户端里的名字也最杂：“台湾01”“台北”“TW 台湾 03”“台湾09｜花莲”。本页先解决“怎么认”，再谈它和<a href="/regions/hong-kong/">香港节点</a>之间的低延迟之争。`,
    focus: {
      heading: '台湾和香港：谁更近，取决于你在哪',
      paragraphs: [
        `${THEORY}从上海到台北直线约 690 km，理论往返下限约 ${floorMs(690)} ms，比到香港的约 1230 km、约 ${floorMs(1230)} ms 更近；从北京到台北约 1720 km、到香港约 1970 km，仍是台北略近；只有从广州出发，香港约 130 km 远比台北约 870 km 近。华东、华北用户在原理上台湾节点更近，华南用户香港更近。`,
        '原理归原理，实际延迟还要看线路。台湾节点的跨境入口、是否走专线，和香港一样决定了实测会比下限高多少。本站对香港节点有一次晚高峰实测可做参考，对台湾节点还没有，所以“台湾比香港低几毫秒”这句话目前只能是推算，不是结论。',
        `客户端里认台湾节点：资料里出现过的写法有“台湾01/台湾1”这种编号式、“台北”“花莲”这种城市式、“TW 台湾 03”“TW台湾10”这种带国家代码的，还有“台湾 Cloud - 03”这类品牌自有格式。它们都对应本页表格里的中国台湾一行。本页按资料原文列出节点名，不替品牌补全没写明的数量；${c.withNames} 家机场有名称原文，其余只写“多个”或全站总数。`,
      ],
    },
    evidence: {
      heading: '台湾的数据能说明什么，还缺什么',
      paragraphs: [
        `本站尚无中国台湾节点实测。唯一的本站记录是 ${c.snapshots} 次在线快照：2026-10-31 灵动云面板显示台湾 ${snapOf('TW').online}/${snapOf('TW').total} 在线，只说明那一分钟可连接。其他测速参考 ${c.thirdParty} 行来自不同时间、不同网络的第三方截图，不能当作当前表现。`,
      ],
      missing: [
        '没有任何一次本站对台湾节点的网页测速、延迟或视频播放观察。',
        '资料里没有机场说明台湾节点在台北还是其他城市（只有“花莲”这类节点名能看出一点），也没有专线与直连的区分。',
        '没有台区服务（台区游戏服、本地流媒体）是否可用的记录。',
      ],
      method: [
        `在 ${PEAK} 同一时段，用同一台设备先测台湾节点再测香港节点，各做一次网页测速；两组“空载延迟”相减，就是你所在城市两地的实际差距。`,
        '游戏用户用客户端对同一台湾节点连续测 10 次延迟，记最大、最小和中位数，而不是只记最小值，见<a href="/guides/clash-verge-latency-test/">Clash Verge 延迟测试</a>。',
        '测前记下节点在客户端里的完整名字，否则事后分不清测的是哪一个。',
      ],
    },
    scenarios: {
      heading: '什么情况该选台湾节点',
      items: [
        { label: '游戏（亚服、台服）', text: '华东、华北用户的延迟理论下限比香港更低；但实际差距要自己测，别只看推算。' },
        { label: '需要台湾 IP 的服务', text: '台区游戏服、只对台湾开放的网站和应用，只有出口在台湾的节点能用。资料里没有解锁记录。' },
        { label: '日常上网', text: '和香港节点一样合适，提供的机场数量相同；如果客户端里台湾节点数量少（有的机场只有 5 个），高峰时可能更拥挤。' },
        { label: '流媒体', text: '没有特别优势；看剧更常用日本或新加坡节点。' },
      ],
    },
    faq: [
      { q: '台湾节点和香港节点哪个延迟更低？', a: `按原理推算（光纤往返每 100 km 约 1 ms）：上海到台北约 690 km、到香港约 1230 km，台北更近；广州到香港约 130 km、到台北约 870 km，香港更近。实际延迟取决于线路，本站只有香港节点实测（空载 ${hk.idleLatencyMs} ms），台湾尚无实测。` },
      { q: '客户端里哪些名字是台湾节点？', a: '资料里出现过“台湾01”“台湾1”“台北”“花莲”“TW 台湾 03”“台湾 Cloud - 03”等写法，都是台湾节点。本页表格按资料原文列出节点名，没写明数量的不替品牌补全。' },
      { q: '为什么有的机场台湾节点只有 5 个？', a: `这是资料里写的数字，不是本站数出来的。${c.documented} 家机场里 ${c.withCount} 家写明了数量，有 10 个也有 5 个；没写的显示“多个”。数量多不等于晚高峰更稳。` },
    ],
    related: [
      { slug: 'hong-kong', anchor: '香港节点的晚高峰实测与延迟解读', why: '低延迟场景的直接对照，而且有真实测速数据。' },
      { slug: 'japan', anchor: '日本节点适合的服务', why: '台区之外需要特定地区 IP 时的另一选择。' },
    ],
  }),

  'united-states': (c) => ({
    title: `美国节点推荐：${c.documented}家机场、延迟下限与AI服务实测｜机场节点`,
    h1: '美国节点：跨洋延迟的物理下限，AI 服务与 101 ms 实测怎么读',
    description: `美国节点是使用 ChatGPT、Claude 等 AI 服务的常见选择，但延迟受太平洋距离限制。本页列出 ${c.documented} 家提供美国节点的机场，解释约 10,000 km 对应约 100 ms 的理论往返下限，并解读灵动云美国节点 2026-10-28 晚高峰实测 ${us.idleLatencyMs} ms 的意义与局限。`,
    intent: '这一页回答：美国节点为什么快不过 100 ms 左右，实测 101 ms 到底算好算坏，AI 服务该怎么选节点。',
    lead: `${c.documented} 家机场都有美国节点记录，${c.withCount} 家写明了数量，节点名偶见“洛杉矶”这样的城市标注。美国节点的核心矛盾是：需要美国 IP 的服务最多，距离却最远。本页先算清楚跨洋延迟的物理下限，再用本站唯一一次美国实测（空载延迟 ${us.idleLatencyMs} ms、下载 ${us.downloadMbps} Mbps）说明实测数字该怎么读、哪些结论不能下。`,
    focus: {
      heading: '跨洋一万公里，延迟为什么下不去',
      paragraphs: [
        `${THEORY}光在光纤里约 20 万 km/s，单程 10,000 km 要约 50 ms，往返约 100 ms。上海到洛杉矶直线约 10,400 km，理论往返下限约 ${floorMs(10400)} ms；到盐湖城约 10,300 km、约 ${floorMs(10300)} ms；到圣何塞约 9,950 km、约 ${floorMs(9950)} ms。北京到美国西海岸略近（到洛杉矶约 10,060 km），广州更远（约 11,650 km）。无论哪家机场、哪种专线，美国西海岸节点的往返延迟都不可能低于一百毫秒上下，这不是机场的问题，是距离的问题。`,
        `2026-10-28 21:41 的晚高峰实测里，灵动云美国节点空载延迟 ${us.idleLatencyMs} ms，测速节点是 SLC（盐湖城），出口 IP 在犹他州 Draper。把它和理论下限放在一起看：上海到盐湖城直线约 10,300 km，下限约 ${floorMs(10300)} ms；北京约 9,800 km，下限约 ${floorMs(9800)} ms；广州约 11,500 km，下限约 ${floorMs(11500)} ms。${us.idleLatencyMs} ms 已经落在上海、北京两条下限之间，几乎没有留出绕行和排队的余量。这只有两种解释：要么测试者在华北、线路接近大圆路径，要么“每 100 km 约 1 ms”这个取整后的经验值对这条线路略偏高。无论哪种，都说明这条线路几乎没有多余绕行。但判断到此为止：测试者的城市没有记录，所以本站只说“${us.idleLatencyMs} ms 接近中美之间的物理下限”，不把它说成“非常优秀”，也不拿它和别家比。`,
        `带宽那一侧的数字不如延迟好看：下载 ${us.downloadMbps} Mbps、上传 ${us.uploadMbps} Mbps，下载时延迟升到 ${us.loadedDownloadLatencyMs} ms，上传时 ${us.loadedUploadLatencyMs} ms，抖动 ${us.jitterMs} ms。对 AI 对话和网页这类小流量场景够用；高清视频和大文件下载在这一晚的这个节点上会受限。延迟低不代表下载快，原因见<a href="/articles/low-latency-not-fast-download/">为什么延迟低不代表下载速度快</a>。`,
      ],
    },
    evidence: {
      heading: '美国的数据能说明什么，还缺什么',
      paragraphs: [
        `本站有 ${c.siteRecords.length} 条美国节点实测：2026-10-28 21:41 的网页测速（有原图和系统时钟）。节点在线快照 ${c.snapshots} 次：2026-10-31 面板显示美国 ${snapOf('US').online}/${snapOf('US').total} 在线。同一晚另有一张网站连通性截图，但它没有时钟、是 21:30 发来的，和测速不是同一次：${reachText(LDY_US_REACHABILITY, 'ChatGPT')}、${reachText(LDY_US_REACHABILITY, 'Claude')}、${reachText(LDY_US_REACHABILITY, 'Gemini')}、${reachText(LDY_US_REACHABILITY, 'Netflix')}，15 个网站没有一个在“可连接”档。三地原图和对照见<a href="${LDY_PEAK_PAGE_PATH}">晚高峰三地实测</a>。`,
        `这组数据能说明的是：这一晚美国节点的往返延迟接近物理下限，但带宽偏低、负载下延迟上升明显，连到美国本土服务也普遍在 200–350 ms。它不能说明其他 ${c.documented - 1} 家机场的美国节点，也不能说明洛杉矶、圣何塞节点和这个盐湖城出口的差别。`,
      ],
      missing: [
        '测试者城市未记录，无法准确判断实测延迟比理论下限高出多少。',
        '截图没有显示是 10 个美国节点里的哪一个；资料里出现过“美国01｜洛杉矶”这样的节点名，而这次出口在犹他州，说明节点名和出口位置不一定一致。',
        '只有一个晚上的单次记录，没有连续多天的晚高峰对照；连通性截图与测速不是同一次。',
        `其他 ${c.documented - 1} 家机场只有资料记录和 ${c.thirdParty} 行第三方摘录。`,
      ],
      method: [
        '测前记下自己的城市，测后把空载延迟和该城市到节点出口的理论下限比，差值越小说明绕行越少。',
        `在 ${PEAK} 对同一美国节点做网页测速，注意测速页识别出的出口城市和测速节点代码（如 LAX、SJC、SLC），它们决定了下限该按哪段距离算。`,
        '用 AI 服务的用户另外记一次“打开对话页到首字返回”的时间，这比测速更接近真实体验；晚高峰测速的完整步骤见<a href="/articles/how-to-speedtest-at-peak-hours/">晚高峰测速怎么做</a>。',
      ],
    },
    scenarios: {
      heading: '什么情况该选美国节点',
      items: [
        { label: 'ChatGPT、Claude、Gemini 等 AI 服务', text: `需要美国 IP 时的常规选择。对话是小流量场景，${us.idleLatencyMs} ms 级别的延迟可以接受；但能否登录和使用取决于服务商策略，本站不记录解锁。` },
        { label: '美区流媒体、美区商店', text: '只有出口在美国的节点能用；这一晚的下载 7 Mbps 级别够 720p，高清要再测。' },
        { label: '游戏', text: '美服延迟受距离限制，往返约 100 ms 起步；亚服请用香港或台湾节点。' },
        { label: '只是看 YouTube', text: `没有必要绕到美国。同一晚新加坡节点空载延迟 ${sgPeak.idleLatencyMs} ms、下载 ${sgPeak.downloadMbps} Mbps，见<a href="/regions/singapore/">新加坡节点</a>。` },
      ],
    },
    faq: [
      { q: '美国节点延迟最低能到多少？', a: `这是原理推算：光纤约 20 万 km/s，往返每 100 km 约 1 ms。上海到美国西海岸直线约 10,000–10,400 km，理论往返下限约 100–104 ms；真实光缆更长，实测一定更高。本站 2026-10-28 测到的空载延迟是 ${us.idleLatencyMs} ms。` },
      { q: '实测 101 ms 算好吗？', a: `上海到盐湖城直线约 10,300 km、北京约 9,800 km，理论往返下限分别约 ${floorMs(10300)} ms 和 ${floorMs(9800)} ms，${us.idleLatencyMs} ms 落在两者之间，说明这条线路几乎没有绕行。但测试者的城市没有记录，这个判断有前提缺口；而且同一次测速下载只有 ${us.downloadMbps} Mbps，延迟好不等于带宽好。` },
      { q: '用 ChatGPT 一定要美国节点吗？', a: `需要美国 IP 时才要。2026-10-28 的连通性截图里，美国节点连 ChatGPT ${reach(LDY_US_REACHABILITY, 'ChatGPT').ms} ms，而同一晚新加坡节点是 ${reach(LDY_PEAK_REACHABILITY, 'ChatGPT').ms} ms；能不能用取决于服务商策略，本站不记录解锁。` },
      { q: '哪些机场有美国节点？', a: `本站收录的 ${c.documented} 家机场资料里都有美国节点记录，${c.withCount} 家写明数量。节点名里的“洛杉矶”等城市是资料原文，实际出口位置可能不同。` },
    ],
    related: [
      { slug: 'singapore', anchor: '同一晚新加坡节点的对照数据', why: '同品牌、同方法的另一组实测，适合比较远近两地。' },
      { slug: 'europe', anchor: '欧洲节点的延迟为什么更高', why: '另一个跨洲地区，距离问题同样适用。' },
    ],
  }),

  'south-korea': (c) => ({
    title: `韩国节点推荐：${c.documented}家机场、韩区游戏与怎么自测｜机场节点`,
    h1: '韩国节点：提供的机场少，韩区游戏和流媒体该怎么测',
    description: `韩国节点用于韩区游戏服务器和韩国流媒体，但本站收录的机场里只有 ${c.documented} 家资料写了韩国节点，数量多为 2–3 个。本页列出这些机场，解释约 870 km 距离对应的延迟理论下限，说明本站尚无韩国实测，并给出针对游戏和视频的自测方法。`,
    intent: '这一页回答：哪些机场有韩国节点、为什么这么少，韩国节点适合什么，以及没有实测时该怎么自己测。',
    lead: `韩国是本站覆盖的亚洲地区里提供者最少的一个：${c.documented} 家机场的资料里写了韩国节点，另外 ${c.total - c.documented} 家未列出。写明数量的 ${c.withCount} 家大多只有 2–3 个节点，和香港、日本动辄 10 个以上的规模不同。所以选韩国节点的第一步不是比速度，而是先确认你看中的机场到底有没有。`,
    focus: {
      heading: '为什么提供者少，这对你意味着什么',
      paragraphs: [
        '韩国节点的需求集中在两类用户：玩韩服游戏、看韩国本地流媒体和直播。这类需求比香港日常上网、美国 AI 服务窄得多，多数机场只放 2–3 个节点做补充，有的根本不列。资料里灵动云的韩国节点就是一个例子：套餐说明写“韩国×2”，但 2026-10-21 的节点状态截图里没有出现韩国节点，两份资料并不一致，本页按原文记录，不替品牌裁决。',
        `${THEORY}从上海到首尔直线约 870 km，理论往返下限约 ${floorMs(870)} ms；从北京约 950 km、约 ${floorMs(950)} ms；从广州约 2070 km、约 ${floorMs(2070)} ms。华东、华北用户到首尔的距离其实比到香港更近，但节点少意味着晚高峰时每个节点承载的用户更多，拥挤比距离更可能成为瓶颈。`,
        '节点少还有一个实际影响：客户端里韩国节点往往只有一两个备选，一个不好用时没有多少换的余地。这和<a href="/regions/japan/">日本节点</a>形成对比，日本几乎每家机场都有十个左右可以轮换。',
      ],
    },
    evidence: {
      heading: '韩国的数据能说明什么，还缺什么',
      paragraphs: [
        `本站尚无韩国节点实测，也没有韩国的节点在线快照和第三方测速摘录（${c.siteRecords.length} 条实测、${c.snapshots} 次快照、${c.thirdParty} 行参考）。本页能提供的只有“哪些机场的资料里写了韩国节点、写了几个、用什么线路”，表格里的数字都来自资料原文。`,
      ],
      missing: [
        '没有任何韩国节点的延迟、速度或视频播放记录。',
        `${c.documented} 家机场里只有 ${c.withCount} 家写了数量，没有一家写明节点名称或机房城市。`,
        '资料来源等级整体偏低，有一家的两份资料互相不一致（套餐说明有、节点状态截图没有）。',
      ],
      method: [
        `游戏用户：在 ${PEAK} 用客户端对韩国节点连续测 10 次延迟，记中位数和最大值；再进游戏看服务器显示的 ping，两者差距大说明客户端测的 HTTP 延迟不能代表游戏延迟。`,
        '流媒体用户：打开目标站点的视频，用播放器统计（YouTube 可用 Stats for nerds）记分辨率和缓冲秒数，并截图保留时钟。',
        '买前先用月付套餐确认客户端里确实有韩国节点，并且出口 IP 在韩国（测速页通常会显示出口地区）。',
      ],
    },
    scenarios: {
      heading: '什么情况该选韩国节点',
      items: [
        { label: '韩服游戏', text: '只有出口在韩国的节点能进韩服并拿到合理延迟；距离上华东、华北用户的理论下限只有十几毫秒，但节点少，晚高峰要自己测。' },
        { label: '韩国流媒体、直播', text: '需要韩国 IP 的站点只能用韩国节点。资料里没有解锁记录，本站不记录解锁。' },
        { label: '日常上网', text: '不建议把韩国节点当主力：提供的机场少、每家节点少，换的余地小。日常用香港节点，需要时再切韩国。' },
      ],
    },
    faq: [
      { q: '哪些机场有韩国节点？', a: `本站收录的 ${c.total} 家机场里，${c.documented} 家资料写了韩国节点，${c.withCount} 家写明数量（多为 2–3 个），其余 ${c.total - c.documented} 家资料里没有记录。“未列出”只表示本站没有资料，不等于该机场没有韩国节点。` },
      { q: '韩国节点延迟理论上有多低？', a: `原理推算：上海到首尔直线约 870 km，光纤往返每 100 km 约 1 ms，下限约 ${floorMs(870)} ms；北京约 ${floorMs(950)} ms，广州约 ${floorMs(2070)} ms。这不是实测，本站尚无韩国节点实测。` },
      { q: '本站为什么没有韩国节点测速？', a: '本站实测目前只覆盖灵动云的香港、新加坡、美国节点。韩国节点提供者少、资料里连节点名都很少写明，本站不编造测速结果；页内给出了游戏和视频的自测方法。' },
    ],
    related: [
      { slug: 'japan', anchor: '日本节点：几乎每家机场都有十个左右', why: '同样是东亚地区，但提供者多、可轮换，是韩国节点的对照。' },
      { slug: 'hong-kong', anchor: '香港节点作为日常主力', why: '韩国节点不适合当主力时的默认选择。' },
    ],
  }),

  europe: (c) => ({
    title: `欧洲节点推荐：德英法三地机场、BBC iPlayer与延迟｜机场节点`,
    h1: '欧洲节点：德国、英国、法国为什么合并，延迟高到什么程度',
    description: `欧洲节点（德国、英国、法国）用于 BBC iPlayer 等欧洲本地服务。本站收录的机场里只有 ${c.documented} 家资料写了欧洲节点，多数没写数量。本页解释三国为什么合并成一页、约 9000 km 距离对应的延迟理论下限、本站尚无欧洲实测，以及怎样自测。`,
    intent: '这一页回答：哪些机场有德国、英国、法国节点，欧洲节点延迟高是什么量级，什么服务非它不可，怎么测。',
    lead: `${c.documented} 家机场的资料里写了至少一个欧洲国家的节点，按国家分别是${c.parts.map((p) => `${p.name} ${p.documented} 家`).join('、')}；写明数量的只有 ${c.withCount} 家，而且都只有 1 个。资料太少、每个国家又互相重叠，所以本站把德国、英国、法国放在同一页，但表格按国家分开统计，不把三国的数字合并，也不推算没写明的数量。`,
    focus: {
      heading: '三国为什么合并，延迟为什么高',
      paragraphs: [
        '合并的原因很直接：有欧洲节点的机场几乎都同时列出德国、英国、法国，三国名单高度重叠；每个国家单独一页只会得到三份几乎相同的表格。合并后，表格仍按国家分开，是因为用途不同：BBC iPlayer 只认英国 IP，德国节点常被当作欧洲大陆的通用出口，法国节点多用于法语区服务。',
        `${THEORY}从上海到法兰克福直线约 8800 km，理论往返下限约 ${floorMs(8800)} ms；到伦敦约 9200 km、约 ${floorMs(9200)} ms；到巴黎约 9260 km、约 ${floorMs(9260)} ms。从北京出发各近约 1000 km，从广州出发各远约 200–300 km。这个量级和<a href="/regions/united-states/">美国节点</a>相近，也就是说欧洲节点的往返延迟不可能低于九十毫秒上下，加上线路通常经过多次中转，实测常见于一百几十毫秒以上。`,
        '欧洲节点的线路路径比美国更不透明：到欧洲的光缆既有经俄罗斯的陆缆，也有经中东、印度洋的海缆，还有先到美国再横跨大西洋的绕行。不同机场、甚至同一机场的不同节点可能走完全不同的路径，延迟差距很大。表格里的线路类型是品牌级字段，不能据此判断某个欧洲节点走的是哪条路。',
      ],
    },
    evidence: {
      heading: '欧洲的数据能说明什么，还缺什么',
      paragraphs: [
        `本站尚无德国、英国、法国任何一个节点的实测，也没有在线快照和第三方摘录（${c.siteRecords.length} 条实测、${c.snapshots} 次快照、${c.thirdParty} 行参考）。能说明的只有“哪些机场的资料里列了欧洲节点”，这些资料多来自套餐说明或官网节点列表，没有一家写明机房城市。`,
      ],
      missing: [
        '没有任何欧洲节点的延迟、速度、视频播放或网站连通性记录。',
        `${c.documented} 家机场里只有 ${c.withCount} 家写了数量（都是 1 个），没有一家写明节点名称、机房城市或所走的线路路径。`,
        '没有 BBC iPlayer 等欧洲服务是否可用的记录；本站不记录解锁。',
      ],
      method: [
        `在 ${PEAK} 对目标国家的节点做网页测速，记空载延迟并和该国的理论下限（约 90 ms）比：高出 30 ms 以内说明路径较直，高出 100 ms 以上说明多次中转或绕行。`,
        '看 BBC iPlayer、欧洲流媒体时，先确认测速页显示的出口国家是英国（或目标国），再用播放器统计记分辨率和缓冲；能连上不等于能播放。',
        '有些机场对欧洲等远距离节点设更高的流量倍率，测试时同时记一下客户端显示的倍率，算有效流量的方法见<a href="/articles/traffic-multiplier-explained/">流量倍率怎么算</a>。',
      ],
    },
    scenarios: {
      heading: '什么情况该选欧洲节点',
      items: [
        { label: 'BBC iPlayer、英国本地服务', text: '只有英国出口能用，看表格里英国一栏。资料里没有解锁记录，买前用月付验证。' },
        { label: '德国、法国本地服务与欧区游戏服', text: '欧区游戏服延迟受距离限制，往返约 90 ms 起步，再加中转；对延迟敏感的玩法不适合。' },
        { label: '欧洲学术、机构网站', text: '多数欧洲网站从亚洲节点也能访问，先试香港或新加坡节点，不行再切欧洲。' },
        { label: '日常上网、看 YouTube', text: '没有理由绕到欧洲：延迟高、提供者少、有些机场的倍率还更高。' },
      ],
    },
    faq: [
      { q: '为什么把德国、英国、法国放在一页？', a: `有欧洲节点的机场几乎都同时列出三国，名单高度重叠，单独成页只会得到三份几乎相同的表格。本页把三国放在一起，但表格按国家分开统计（${c.parts.map((p) => `${p.name} ${p.documented} 家`).join('、')}），不合并数字。` },
      { q: '欧洲节点延迟一般多高？', a: `原理推算：上海到法兰克福约 8800 km、伦敦约 9200 km、巴黎约 9260 km，光纤往返每 100 km 约 1 ms，理论下限约 88–93 ms；真实线路常经多次中转，实测通常明显更高。本站尚无欧洲节点实测，不给具体实测数字。` },
      { q: '看 BBC iPlayer 选哪个节点？', a: 'BBC iPlayer 只认英国 IP，要选表格里英国一栏的机场，并在测速页确认出口国家是英国。能不能播放取决于服务方的策略，本站不记录解锁，建议用月付套餐先验证。' },
      { q: '哪些机场有欧洲节点？', a: `本站收录的 ${c.total} 家机场里，${c.documented} 家资料写了至少一个欧洲国家的节点，其余机场资料里没有记录。“未列出”只表示本站没有资料，不等于该机场没有欧洲节点。` },
    ],
    related: [
      { slug: 'united-states', anchor: '美国节点：同样受跨洋距离限制，但有一次实测', why: '延迟量级相近，而且有真实数据可以参照。' },
      { slug: 'singapore', anchor: '新加坡节点作为欧洲网站的替代入口', why: '多数欧洲网站从亚洲节点也能访问。' },
    ],
  }),
};

export const getRegionContent = (slug: string, ctx: RegionContentCtx): RegionContent => {
  const f = REGION_CONTENT[slug];
  if (!f) throw new Error(`region-content: 未定义地区页内容 ${slug}`);
  return f(ctx);
};
