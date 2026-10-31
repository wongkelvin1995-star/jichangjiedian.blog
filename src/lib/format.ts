import { BILLING_LABEL } from '../data/types';
import { DATA_UPDATED } from './site';
import type { BillingPeriod, EvidenceGrade } from '../data/types';

/** ¥96 / ¥15.5 / ¥1,248 */
export const fmtCNY = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '无公开价格';
  const s = Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  return `¥${s}`;
};

export const fmtGB = (gb: number | null | undefined): string => {
  if (gb === null || gb === undefined) return '流量未公布';
  return Number.isInteger(gb) ? `${gb.toLocaleString('en-US')}GB` : `${gb}GB`;
};

export const periodLabel = (p: BillingPeriod): string => BILLING_LABEL[p];

/** 2026-10-16 -> 2026年10月16日；null -> “本站整理于 <资料更新日>” */
export const fmtDate = (d: string | null | undefined, fallback?: string): string => {
  if (!d && fallback === undefined) return `本站整理于 ${fmtDate(DATA_UPDATED)}`;
  if (!d) return fallback ?? "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
};

export const fmtDateTime = (iso: string | null | undefined, fallback = '时间未标注'): string => {
  if (!iso) return fallback;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(iso);
  if (!m) return iso;
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}${m[6] ? ':' + m[6] : ''}`;
};

export const bestGrade = (grades: EvidenceGrade[]): EvidenceGrade => {
  const order: EvidenceGrade[] = ['A', 'B', 'C', 'D'];
  for (const g of order) if (grades.includes(g)) return g;
  return 'D';
};

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** 把可能出现的 HTML 特殊字符转义（用于手工拼接的字符串，如搜索索引 JSON 以外的场景） */
export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
