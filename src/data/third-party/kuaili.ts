import { tpRecords } from './_util';

/**
 * 快狸页面的“历史解锁图摘录”：只有延迟与解锁结果，没有速度。
 * 同一时间戳（2026-06-27 15:11:12）与相同结果也出现在星岛梦页面，归属存疑 -> D 级。
 */
export const kuailiThirdParty = tpRecords({
  brandId: 'kuaili',
  idPrefix: '20260627',
  kind: 'third-party-unlock',
  grade: 'D',
  dateISO: '2026-06-27T15:11:12+08:00',
  dateText: '2026-06-27 15:11:12（CST）',
  isp: '珠海联通 9Gbps 单线程（页脚标注）',
  clientName: '喵速（MiaoKo）基础流媒体检测',
  clientVersion: '主端 4.3.3 / 喵速 4.7.0',
  threads: 1,
  method: '第三方评测页收录的 MiaoKo 基础流媒体检测截图文字摘录，VLESS 节点；原始提供者、账号、内容样本和复测次数均未记录',
  caveats: [
    '归属存疑：相同的时间戳与相同的节点结果也出现在星岛梦页面，本站无法确定该图属于哪一家，因此降为 D 级，不进入任何统计。',
    '表中数值是 TLS RTT 与 HTTPS 延迟，不是下载速度；本记录没有速度数据，速度字段保持为空（未测得），不是 0。',
    '平台地区沿用检测结果，未根据节点名称改写；N/A 表示图中未给出可判定结果，不能当作解锁成功。',
  ],
  rows: [
    { id: 'jp01', region: 'JP', name: 'JP日本01', tls: 272, https: 1074, avg: null, max: null, extra: { netflix: 'N/A', disneyPlus: '解锁(JP)', tiktok: '失败', openai: '解锁(JP)' } },
    { id: 'sg01', region: 'SG', name: 'SG新加坡01', tls: 244, https: 1143, avg: null, max: null, extra: { netflix: '解锁(SG)', disneyPlus: '解锁(US)', tiktok: '解锁(SG)', openai: '解锁(SG)' } },
    { id: 'us01', region: 'US', name: 'US美国01', tls: 430, https: 1965, avg: null, max: null, extra: { netflix: '解锁(US)', disneyPlus: '解锁(US)', tiktok: '解锁(US)', openai: '解锁(US)' } },
    { id: 'tw10', region: 'TW', name: 'TW台湾10', tls: 258, https: 1085, avg: null, max: null, extra: { netflix: '解锁(GB)', disneyPlus: '解锁(GB)', tiktok: '失败', openai: '解锁(TW)' } },
    { id: 'hk18', region: 'HK', name: 'HK香港18', tls: 282, https: 1648, avg: null, max: null, extra: { netflix: 'N/A', disneyPlus: 'N/A', tiktok: '失败', openai: 'N/A' } },
  ],
});
