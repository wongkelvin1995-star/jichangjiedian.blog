import { tpRecords } from './_util';

export const wuyouThirdParty = tpRecords({
  brandId: 'wuyou',
  idPrefix: '20260718',
  dateISO: '2026-07-18T21:40:48+08:00',
  dateText: '2026-07-18 21:40:48（CST）',
  isp: '珠海联通 9Gbps（后端标注）',
  clientName: '喵速（MiaoKo）',
  clientVersion: '主端 4.3.3 / 喵速 4.7.0',
  threads: 32,
  method: '第三方评测站收录的历史测速截图文字摘录，32 线程；具体测试设备、下载目标与每节点时长未记录',
  caveats: [
    '其他测速参考；该页面只摘录代表行，不代表全体节点或当前网络表现。',
    '速度保留截图原标（MB/KB），没有换算为 Mbps；新加坡 SIN-02 的单位是 KB，不能与 MB 直接并列比较。',
    '新加坡 SIN-04 的 UDP 为 Unknown，不代表该节点所有连接失败。',
  ],
  rows: [
    { id: 'tyo09', region: 'JP', name: '日本 TYO-09', tls: 136, https: 2526, avg: '122.15MB', max: '330.33MB', udp: 'FullCone' },
    { id: 'sin02', region: 'SG', name: '新加坡 SIN-02', tls: 123, https: 1631, avg: '17.59KB', max: '175.93KB', udp: 'FullCone', remark: '该行速度单位为 KB。' },
    { id: 'lax05', region: 'US', name: '美国 LAX-05', tls: 253, https: 1035, avg: '15.41MB', max: '39.87MB', udp: 'FullCone' },
    { id: 'sin04', region: 'SG', name: '新加坡 SIN-04', tls: 117, https: 570, avg: '94.83MB', max: '230.14MB', udp: 'Unknown' },
    { id: 'hkg01', region: 'HK', name: '香港 HKG-01', tls: 113, https: 519, avg: '544.99MB', max: '613.03MB', udp: 'FullCone', remark: '页面另记 2026-07-18 21:47:23 的解锁图：YouTube 显示“送中(CN)”，Netflix/Disney+ 显示解锁 HK。' },
  ],
});
