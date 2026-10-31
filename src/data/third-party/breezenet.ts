import { makeRecord } from '../test-helpers';
import type { TestRecord } from '../types';

/**
 * 微风网络：第三方评测站“第三方评测页”页面上的新加坡节点测速（站长 2026-10-28 提供链接，本站当天读取）。
 * 页面只写日期（2026-10-24），没有时刻，所以 testDateTime 保持 null，不进入任何时段统计。
 */
export const breezenetThirdParty: TestRecord[] = [
  makeRecord({
    testId: 'c-breezenet-20261024-sg',
    brandId: 'breezenet',
    nodeRegion: 'SG',
    nodeDisplayName: '新加坡节点（页面未写节点编号）',
    recordKind: 'third-party-speed',
    sourceType: 'C',
    publishedAt: '2026-10-28',
    testDateTime: null,
    testDateText: '2026-10-24（页面只写日期，没有时刻）',
    originISP: '家庭宽带（页面未写运营商与城市）',
    clientName: '微风网络自研客户端（页面称基于 Clash Meta）',
    testServer: 'Cloudflare Speed Test',
    testMethod: '第三方评测页自述的单次网页测速；页面另列 IPCheck.ing 内置测速下载 475.64 / 上传 220.15 Mbps，与 Cloudflare 结果差别较大',
    downloadMbps: 337,
    uploadMbps: 260,
    idleLatencyMs: 30.1,
    jitterMs: 43.6,
    packetLossPercent: 0,
    notes: '第三方评测页的单次测速摘录：下载 337 Mbps、上传 260 Mbps、延迟 30.1 ms、抖动 43.6 ms、丢包 0%（1000/1000）。',
    caveats: [
      '丢包率 0% 是评测页给出的测量结果（Cloudflare 测速 1000/1000 个数据包成功），不是“未测得”。',
      '这是第三方评测站自己发布的单次测试，本站没有看到原始截图以外的任何日志，也没有复测。',
      '页面只写日期没有时刻，无法判断属于哪个时间段，不进入分时段统计。',
      '同一页面在 iOS 部分写“低至 10ms”，与这次 30.1 ms 的结果不一致；10 ms 来自页面 2026-10-20 的另一份节点延迟记录。',
    ],
    isVerified: false,
  }),
];
