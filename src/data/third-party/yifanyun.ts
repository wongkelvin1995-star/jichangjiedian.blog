import { tpRecords } from './_util';

export const yifanyunThirdParty = tpRecords({
  brandId: 'yifanyun',
  idPrefix: '20260504',
  dateISO: '2026-05-04T16:14:14+08:00',
  dateText: '2026-05-04 16:14:14（CST）',
  isp: '华东上海 Azure 10Gbps（云端测试环境，不是家庭宽带）',
  clientName: '喵速（MiaoKo）/ FFQ.LA',
  clientVersion: '4.3.8-Meta',
  threads: 10,
  method: '机场推荐与测评站页面收录的 FFQ.LA / MiaoKo 测速截图文字摘录，10 线程；下载目标与每节点测试时长未记录',
  caveats: [
    '其他测速参考；测试环境是云端（上海 Azure），不是家庭宽带，也不是晚高峰记录。',
    '速度保留截图原标（MB），没有换算为 Mbps；摘录只覆盖六个代表行，不代表全体节点或当前网络表现。',
    '新加坡04 的 UDP 为 Unknown，是该项检测未确定，不代表 UDP 一定不可用。',
  ],
  rows: [
    { id: 'sg07', region: 'SG', name: '新加坡07', tls: 83, https: 434, avg: '44.28MB', max: '73.66MB', udp: 'FullCone' },
    { id: 'jp03', region: 'JP', name: '日本03', tls: 84, https: 431, avg: '59.58MB', max: '78.24MB', udp: 'FullCone' },
    { id: 'us04', region: 'US', name: '美国04', tls: 201, https: 852, avg: '55.35MB', max: '96.13MB', udp: 'FullCone' },
    { id: 'hk19', region: 'HK', name: '香港19', tls: 42, https: 192, avg: '39.75MB', max: '45.72MB', udp: 'FullCone' },
    { id: 'tw02', region: 'TW', name: '台湾02', tls: 53, https: 280, avg: '3.99MB', max: '7.57MB', udp: 'FullCone' },
    { id: 'sg04', region: 'SG', name: '新加坡04', tls: 82, https: 411, avg: '41.65MB', max: '76.53MB', udp: 'Unknown' },
  ],
});
