import { tpRecords } from './_util';

export const yunjieyunThirdParty = tpRecords({
  brandId: 'yunjieyun',
  idPrefix: '20260923',
  dateISO: '2026-09-23T16:16:53+08:00',
  dateText: '2026-09-23 16:16:53（CST）',
  isp: '珠海联通 9Gbps（后端标注）',
  clientName: '喵速（MiaoKo）',
  clientVersion: '主端 4.3.3 / 喵速 4.6.3',
  threads: 32,
  method: '机场推荐与测评站页面收录的历史测速截图文字摘录，32 线程，按订阅顺序测试；具体测试设备、下载目标与每节点时长未记录',
  caveats: [
    '其他测速参考；只摘录五个代表行，不代表全体节点或当前网络表现。',
    '速度保留截图原标（MB/KB/B），没有换算为 Mbps；日本04 的平均值是 644.80KB，不是 644.80MB。',
    'UDP 类型按原图保留，不能只用延迟或 NAT 标签推断应用体验；该截图未提供流媒体与 AI 解锁检测。',
  ],
  rows: [
    { id: 'hk01', region: 'HK', name: '香港01｜维港', tls: 35, https: 604, avg: '22.57MB', max: '25.75MB', udp: 'FullCone' },
    {
      id: 'tw09',
      region: 'TW',
      name: '台湾09｜花莲',
      tls: null,
      https: null,
      avg: '0.00B',
      max: '0.00B',
      udp: 'Unknown',
      remark: '原图该行延迟为“-”、速度为 0.00B，页面未说明原因；本站不据此计算平均值，也不把它当作节点长期不可用的证据。',
    },
    { id: 'sg01', region: 'SG', name: '新加坡01｜滨海湾', tls: 73, https: 377, avg: '23.07MB', max: '29.64MB', udp: 'FullCone' },
    { id: 'us01', region: 'US', name: '美国01｜洛杉矶', tls: 179, https: 1011, avg: '24.02MB', max: '38.50MB', udp: 'PortRestrictedCone' },
    { id: 'jp04', region: 'JP', name: '日本04｜横滨', tls: 75, https: 622, avg: '644.80KB', max: '6.30MB', udp: 'Unknown', remark: '平均速度单位为 KB，最高速度单位为 MB。' },
  ],
});
