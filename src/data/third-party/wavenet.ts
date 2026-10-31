import type { TestRecord } from '../types';
import { makeRecord } from '../test-helpers';

const rows: Array<[string, string, string, string, number, number, string]> = [
  ['hk01', 'HK', '香港 01 [IPLC 专线]', 'Shadowsocks / IEPL', 852, 24, '页面写“8K 超清秒开无缓冲”“ChatGPT 完全支持”'],
  ['jp02', 'JP', '日本 02 [IEPL 极速]', '页面未写', 785, 42, '页面写“4K 60fps 极速”“原生 IP”'],
  ['sg01', 'SG', '新加坡 01 [流媒体解锁]', 'V2ray / 中转', 740, 56, '页面写“4K 超清流畅”'],
  ['us01', 'US', '美国 01 [原生解锁]', 'Shadowsocks / 专线', 660, 135, '页面写“4K 高清播放”“干净 IP”'],
];

export const wavenetThirdParty: TestRecord[] = rows.map(([id, r, name, proto, mbps, ms, remark]) =>
  makeRecord({
    testId: `d-wavenet-${id}`,
    brandId: 'wavenet',
    nodeRegion: r,
    nodeDisplayName: name,
    recordKind: 'third-party-speed',
    sourceType: 'D',
    publishedAt: '2026-10-27',
    testDateTime: null,
    testDateText: '页面未标注测试日期；页面发布与最后核验日期均为 2026-09-19',
    claimedWindow: 'peak',
    originISP: '1000M 宽带（页面自述，未写运营商与城市）',
    testMethod: '页面自述“编辑部在晚高峰 20:30–22:30 实测采样汇总”，无截图与日志',
    downloadMbps: mbps,
    idleLatencyMs: ms,
    notes: `${remark}。协议架构列：${proto}。`,
    caveats: [
      '未给出测试日期、原始截图或日志，无法核验，只能当作线索。',
      '时间窗口仅为页面自述的“20:30–22:30”，具体日期未知，不进入本站时段统计。',
      '页面把“实测平均下载”和“实测延迟”并列，没有说明延迟是空载还是负载、测试工具与服务器。',
    ],
    isVerified: false,
  }),
);
