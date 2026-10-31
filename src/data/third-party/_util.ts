import type { EvidenceGrade, RecordKind, TestRecord } from '../types';
import { makeRecord } from '../test-helpers';

export interface TpRow {
  id: string;
  region: string;
  name: string;
  tls: number | null;
  https: number | null;
  /** 原图标注的速度字符串，例如 "122.15MB"、"17.59KB"；不换算为 Mbps */
  avg: string | null;
  max: string | null;
  udp?: string;
  remark?: string;
  /** 其他原图字段（例如解锁结果），按原文字符串保留 */
  extra?: Record<string, string>;
}

export interface TpOptions {
  brandId: string;
  idPrefix: string;
  dateISO: string | null;
  dateText: string;
  isp: string | null;
  clientName: string | null;
  clientVersion?: string | null;
  threads?: number | null;
  method: string;
  nodeType?: string;
  grade?: EvidenceGrade;
  /** 默认 third-party-speed；只含延迟/解锁、没有速度的表用 third-party-unlock */
  kind?: RecordKind;
  caveats: string[];
  rows: TpRow[];
  extraNote?: string;
}

const parseSpeed = (s: string | null): { value: number | string | null; unit?: string } => {
  if (s == null) return { value: null };
  const m = /^([\d.]+)\s*(GB|MB|KB|B)$/i.exec(s.trim());
  if (!m) return { value: s };
  return { value: Number(m[1]), unit: `${m[2]}（原图标注单位，未换算）` };
};

/** 将第三方评测站收录的“节点速度截图摘录”转成测试记录；所有速度保留原标单位，不换算成 Mbps */
export function tpRecords(o: TpOptions): TestRecord[] {
  return o.rows.map((r) =>
    makeRecord({
      testId: `c-${o.brandId}-${o.idPrefix}-${r.id}`,
      brandId: o.brandId,
      nodeRegion: r.region,
      nodeDisplayName: r.name,
      recordKind: o.kind ?? 'third-party-speed',
      sourceType: o.grade ?? 'C',
      publishedAt: '2026-10-27',
      testDateTime: o.dateISO,
      testDateText: o.dateText,
      originISP: o.isp,
      clientName: o.clientName,
      clientVersion: o.clientVersion ?? null,
      sampleCount: o.threads ?? null,
      testMethod: o.method,
      extraMetrics: {
        tlsRttMs: { value: r.tls, unit: 'ms' },
        httpsLatencyMs: { value: r.https, unit: 'ms' },
        avgSpeed: parseSpeed(r.avg),
        maxSpeed: parseSpeed(r.max),
        ...(r.udp ? { udpNat: { value: r.udp } } : {}),
        ...(o.nodeType ? { nodeType: { value: o.nodeType } } : {}),
        ...Object.fromEntries(Object.entries(r.extra ?? {}).map(([k, v]) => [k, { value: v }])),
      },
      notes: [o.extraNote, r.remark].filter(Boolean).join(' ') || '第三方评测页摘录的节点测速行。',
      caveats: o.caveats,
      isVerified: false,
    }),
  );
}
