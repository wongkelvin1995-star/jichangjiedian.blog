import { tpRecords } from './_util';

export const lingmaoThirdParty = tpRecords({
  brandId: 'lingmao',
  idPrefix: '20260719',
  dateISO: '2026-07-19T17:24:44+08:00',
  dateText: '2026-07-19 17:24:44（CST）',
  isp: '珠海联通 9Gbps（图内标注）',
  clientName: '喵速（MiaoKo）',
  clientVersion: '主端 4.3.3 / 喵速 4.7.0',
  threads: 32,
  method:
    '第三方评测页收录的历史 MiaoKo 自定义测试截图文字摘录，32 线程，VLESS；原始提供者、测速目标、单节点测试时长和复测次数均未记录',
  caveats: [
    '其他测速参考；只摘录五个代表行，不代表全体节点或当前网络表现。',
    '速度保留截图原标（MB），没有换算为 Mbps；TLS RTT 与 HTTPS 延迟分别取原图对应列，不要当作同一指标。',
    '台湾与新加坡行的 UDP 类型为 Unknown，不代表该节点所有连接失败。',
  ],
  rows: [
    { id: 'hk01', region: 'HK', name: '香港 Cloud - 01', tls: 113, https: 788, avg: '529.75MB', max: '574.44MB', udp: 'FullCone' },
    { id: 'tw03', region: 'TW', name: '台湾 Cloud - 03', tls: 147, https: 1289, avg: '73.77MB', max: '88.88MB', udp: 'Unknown' },
    { id: 'jp09', region: 'JP', name: '日本 Cloud - 09', tls: 133, https: 1304, avg: '88.78MB', max: '207.84MB', udp: 'FullCone' },
    { id: 'sg01', region: 'SG', name: '新加坡 Cloud - 01', tls: 97, https: 910, avg: '239.78MB', max: '319.41MB', udp: 'Unknown' },
    { id: 'us01', region: 'US', name: '美国 Cloud - 01', tls: 246, https: 1084, avg: '9.80MB', max: '15.42MB', udp: 'FullCone' },
  ],
});
