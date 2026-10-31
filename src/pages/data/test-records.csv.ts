/**
 * 测试记录 CSV（不含任何订阅链接、令牌或个人信息）。
 * 空单元格 = 来源没有给出该数值（不是 0）；第三方速度保留原图单位，写在 *_original 列，不换算为 Mbps。
 */
import type { APIRoute } from 'astro';
import { getBrand } from '../../data/brands';
import { CLAIM_ONLY_RECORDS, TEST_RECORDS } from '../../data/test-records';
import { metricText } from '../../lib/records-view';

const esc = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const COLUMNS = [
  'test_id', 'brand_slug', 'brand_name', 'node_region', 'node_name', 'record_kind', 'evidence_grade', 'is_verified',
  'test_datetime', 'test_date_text', 'time_window', 'claimed_time_window', 'client', 'network_note',
  'download_mbps', 'upload_mbps', 'idle_latency_ms', 'loaded_download_latency_ms', 'loaded_upload_latency_ms', 'jitter_ms',
  'packet_loss_percent', 'youtube_quality', 'youtube_buffer_seconds',
  'tls_rtt_ms', 'https_latency_ms', 'avg_speed_original', 'max_speed_original', 'udp_nat', 'notes',
] as const;

export const GET: APIRoute = () => {
  const rows = [...TEST_RECORDS].map((r) => [
    r.testId,
    r.brandId,
    getBrand(r.brandId)?.brandName ?? r.brandId,
    r.nodeRegion,
    r.nodeDisplayName,
    r.recordKind,
    r.sourceType,
    r.isVerified ? 'yes' : 'no',
    r.testDateTime,
    r.testDateText,
    r.timeWindow,
    r.claimedWindow ?? '',
    [r.clientName, r.clientVersion].filter(Boolean).join(' '),
    r.originISP,
    r.downloadMbps,
    r.uploadMbps,
    r.idleLatencyMs,
    r.loadedDownloadLatencyMs,
    r.loadedUploadLatencyMs,
    r.jitterMs,
    r.packetLossPercent,
    r.youtubeQuality,
    r.youtubeBufferSeconds,
    metricText(r, 'tlsRttMs')?.replace(' ms', '') ?? '',
    metricText(r, 'httpsLatencyMs')?.replace(' ms', '') ?? '',
    metricText(r, 'avgSpeed'),
    metricText(r, 'maxSpeed'),
    metricText(r, 'udpNat'),
    r.notes,
  ]);
  void CLAIM_ONLY_RECORDS; // 仅文字描述的行没有测量值，不进入 CSV
  const csv = '﻿' + [COLUMNS.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n') + '\r\n';
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="jichangjiedian-test-records.csv"' },
  });
};
