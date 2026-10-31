import { tpRecords } from './_util';

export const xingdaomengThirdParty = tpRecords({
  brandId: 'xingdaomeng',
  idPrefix: '20260617',
  dateISO: '2026-06-17T18:32:15+08:00',
  dateText: '2026-06-17 18:32:15（CST）',
  isp: '珠海联通 9Gbps（后端标注）',
  clientName: '喵速（MiaoKo）',
  clientVersion: '主端 4.3.3 / 喵速 4.6.4',
  threads: 32,
  method: '第三方评测页收录的历史测速截图文字摘录，32 线程，按订阅顺序测试；具体测试设备、下载目标与每节点时长未记录',
  caveats: [
    '其他测速参考；该页面只摘录代表行，不代表全体节点或当前网络表现。',
    '速度保留截图原标（MB/KB），没有换算为 Mbps；美国02 的结果为 KB 级，不能与 MB 行直接并列比较，也不能按 Mbps 读取。',
    '该记录时间落在本站“晚间 18:00–20:00”窗口，但它不是本站测试，不进入分时段统计。',
  ],
  rows: [
    { id: 'hk09', region: 'HK', name: '香港09', tls: 115, https: 584, avg: '387.21MB', max: '478.34MB', udp: 'FullCone' },
    { id: 'jp06', region: 'JP', name: '日本06', tls: 181, https: 836, avg: '101.08MB', max: '104.18MB', udp: 'Unknown' },
    { id: 'sg01', region: 'SG', name: '新加坡01', tls: 151, https: 1303, avg: '268.77MB', max: '330.02MB', udp: 'FullCone' },
    { id: 'us02', region: 'US', name: '美国02', tls: 280, https: 1142, avg: '1.60KB', max: '16.00KB', udp: 'FullCone', remark: '该行速度单位为 KB。' },
    { id: 'tw03', region: 'TW', name: '台湾03', tls: 143, https: 722, avg: '80.93MB', max: '110.86MB', udp: 'FullCone' },
  ],
});
