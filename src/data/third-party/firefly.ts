import { tpRecords } from './_util';

export const fireflyThirdParty = tpRecords({
  brandId: 'firefly',
  idPrefix: '20260716',
  dateISO: '2026-07-16T01:14:26+08:00',
  dateText: '2026-07-16 01:14:26（CST）',
  isp: '珠海联通 9Gbps（截图环境标注）',
  clientName: '喵速（MiaoKo）',
  clientVersion: '4.7.0',
  threads: 32,
  method: '第三方评测站收录的历史测速截图文字摘录，32 线程',
  caveats: [
    '其他测速参考；页面自述该记录属于凌晨历史测试，不是当前晚高峰实测。',
    '速度保留截图原标（MB/KB/B），没有换算为 Mbps；零速与低速原因未记录，不能只挑高吞吐节点概括全网表现。',
  ],
  rows: [
    { id: 'hk0001', region: 'HK', name: '香港0001', tls: 91, https: 434, avg: '0.00B', max: '0.00B', udp: 'Unknown', remark: '该次未测得有效吞吐。' },
    { id: 'hk0002', region: 'HK', name: '香港0002', tls: 112, https: 802, avg: '540.74MB', max: '614.18MB', udp: 'FullCone' },
    { id: 'tw0001', region: 'TW', name: '台湾0001', tls: 184, https: 1025, avg: '92.61MB', max: '114.23MB', udp: 'FullCone' },
    { id: 'sg0004', region: 'SG', name: '新加坡0004', tls: 103, https: 979, avg: '6.40KB', max: '64.00KB', udp: 'Unknown', remark: '低速记录。' },
    { id: 'jp0001', region: 'JP', name: '日本0001', tls: 132, https: 851, avg: '58.38MB', max: '189.37MB', udp: 'FullCone' },
    { id: 'us0001', region: 'US', name: '美国0001', tls: 250, https: 990, avg: '12.17MB', max: '25.83MB', udp: 'FullCone' },
  ],
});
