import { tpRecords } from './_util';

export const kexinyunThirdParty = tpRecords({
  brandId: 'kexinyun',
  idPrefix: '20260514',
  dateISO: '2026-05-14T14:27:07+08:00',
  dateText: '2026-05-14 14:27:07（CST，图示时区）',
  isp: '珠海联通 9Gbps（页脚标注）',
  clientName: '喵速（MiaoKo）',
  clientVersion: '主端 4.3.3 / 喵速 4.6.4',
  threads: 32,
  method: '第三方评测页收录的 MiaoKo 自定义测试图文字摘录，32 线程，VLESS；原始提供者、测速目标、单节点测试时长和复测次数均未记录',
  caveats: [
    '其他测速参考；只选取 5 个节点，不代表全体节点或当前网络表现。',
    '速度保留截图原标（MB / B），没有换算为 Mbps；TLS RTT 与 HTTPS 延迟是图内分别记录的两种单次延迟。',
    'UDP 类型 Unknown 仅表示该项未确定，不能补写成支持或不支持。',
  ],
  rows: [
    { id: 'hk01', region: 'HK', name: 'HK 香港 01', tls: 138, https: 751, avg: '432.11MB', max: '481.37MB', udp: 'FullCone' },
    { id: 'tw03', region: 'TW', name: 'TW 台湾 03', tls: 317, https: 1163, avg: '56.12MB', max: '71.96MB', udp: 'Unknown' },
    { id: 'jp01', region: 'JP', name: 'JP 日本 01', tls: 123, https: 609, avg: '385.75MB', max: '478.32MB', udp: 'Unknown' },
    { id: 'us01', region: 'US', name: 'US 美国 01', tls: 201, https: 1211, avg: '24.70MB', max: '52.90MB', udp: 'FullCone' },
    {
      id: 'us09',
      region: 'US',
      name: 'US 美国 09',
      tls: null,
      https: null,
      avg: '0.00B',
      max: '0.00B',
      udp: 'Unknown',
      remark: '原图该行延迟为“—”、速度为 0.00B；页面写明不能作为成功测速，本站不据此计算平均值，也不把它当作节点长期不可用的证据。',
    },
  ],
});
