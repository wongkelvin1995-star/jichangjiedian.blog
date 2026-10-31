import type { TimeWindowId } from './types';

/**
 * 预定采样窗口（北京时间 UTC+8，左闭右开）。
 * 这些只是预设采样窗口，不代表某个时段一定拥堵。
 */
export interface TimeWindowDef {
  id: TimeWindowId;
  label: string;
  start: string; // HH:MM
  end: string; // HH:MM（右开）
  note: string;
}

export const TIME_WINDOWS: readonly TimeWindowDef[] = [
  { id: 'morning', label: '早间', start: '07:00', end: '09:00', note: '通勤前后，多数家庭宽带尚未进入高负载' },
  { id: 'noon', label: '午间', start: '12:00', end: '14:00', note: '午休时段，办公与个人使用叠加' },
  { id: 'evening', label: '晚间', start: '18:00', end: '20:00', note: '下班后至晚高峰前' },
  { id: 'peak', label: '晚高峰', start: '20:00', end: '23:00', note: '本站重点关注的时段' },
  { id: 'late-night', label: '深夜', start: '00:00', end: '02:00', note: '通常作为低负载对照，仍需用数据验证' },
];

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** 返回时间窗口 id；落在预设窗口之外返回 'outside'；没有时间返回 'unknown' */
export function classifyWindow(iso: string | null): TimeWindowId | 'outside' | 'unknown' {
  if (!iso) return 'unknown';
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return 'unknown';
  const minutes = Number(m[1]) * 60 + Number(m[2]);
  for (const w of TIME_WINDOWS) {
    if (minutes >= toMin(w.start) && minutes < toMin(w.end)) return w.id;
  }
  return 'outside';
}

export const windowLabel = (id: TimeWindowId | 'outside' | 'unknown'): string => {
  if (id === 'outside') return '预设窗口之外';
  if (id === 'unknown') return '时间未标注';
  return TIME_WINDOWS.find((w) => w.id === id)?.label ?? id;
};

/**
 * 对落在预设窗口之外的时间，说明它离最近的窗口有多远。
 * 例如 23:04 → “晚高峰结束后 4 分钟”。距离超过 3 小时则只返回“预设窗口之外”。
 */
export function describeOutside(iso: string | null): string {
  if (!iso) return '时间未标注';
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return '时间未标注';
  const t = Number(m[1]) * 60 + Number(m[2]);
  let best: { gap: number; text: string } | null = null;
  for (const w of TIME_WINDOWS) {
    const s = toMin(w.start);
    const e = toMin(w.end);
    if (t >= e && t - e <= 180) {
      const gap = t - e;
      if (!best || gap < best.gap) best = { gap, text: `${w.label}结束后 ${gap} 分钟` };
    }
    if (t < s && s - t <= 180) {
      const gap = s - t;
      if (!best || gap < best.gap) best = { gap, text: `${w.label}开始前 ${gap} 分钟` };
    }
  }
  return best ? best.text : '预设窗口之外';
}
