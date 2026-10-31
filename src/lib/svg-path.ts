/**
 * 把 d3-geo 的投影结果压缩成体积更小的 SVG path：
 *  - Douglas–Peucker 抽稀（容差以像素计）；
 *  - 丢弃投影后尺寸极小的子路径（小岛点缀不影响地区判断，且不代表任何数据）；
 *  - 相对坐标 + 省略前导零。
 */
import type { GeoPath, GeoPermissibleObjects } from 'd3-geo';

type Pt = [number, number];

function rdp(pts: Pt[], eps: number): Pt[] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    const [ax, ay] = pts[a]!;
    const [bx, by] = pts[b]!;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i]!;
      let d: number;
      if (len2 === 0) d = Math.hypot(px - ax, py - ay);
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      }
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > eps && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i] === 1);
}

const fmt = (n: number): string => {
  let s = n.toFixed(1);
  if (s.endsWith('.0')) s = s.slice(0, -2);
  if (s.startsWith('0.')) s = s.slice(1);
  else if (s.startsWith('-0.')) s = '-' + s.slice(2);
  if (s === '-0') s = '0';
  return s;
};

export interface CompactOptions {
  /** 抽稀容差（像素） */
  eps?: number;
  /** 子路径包围盒的最大边小于该值（像素）则丢弃 */
  minExtent?: number;
  /** 保留这些屏幕坐标附近的小子路径（例如台湾岛），避免被当成小岛丢弃 */
  keepNear?: { x: number; y: number; r: number }[];
}

export function compactPath(path: GeoPath, obj: GeoPermissibleObjects, opts: CompactOptions = {}): string {
  const eps = opts.eps ?? 0.45;
  const minExtent = opts.minExtent ?? 2.2;
  const subs: { pts: Pt[]; closed: boolean }[] = [];
  let cur: Pt[] | null = null;
  const ctx = {
    moveTo(x: number, y: number) {
      cur = [[x, y]];
      subs.push({ pts: cur, closed: false });
    },
    lineTo(x: number, y: number) {
      cur?.push([x, y]);
    },
    closePath() {
      const last = subs[subs.length - 1];
      if (last) last.closed = true;
    },
    arc() {},
    rect() {},
    bezierCurveTo() {},
    quadraticCurveTo() {},
  };
  // d3 的 geoPath 接受带有这些方法的 context
  path.context(ctx as unknown as CanvasRenderingContext2D);
  path(obj);
  path.context(null);

  const near = opts.keepNear ?? [];
  let out = '';
  for (const s of subs) {
    if (s.pts.length < 2) continue;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of s.pts) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const extent = Math.max(maxX - minX, maxY - minY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const protectedPart = near.some((n) => Math.hypot(cx - n.x, cy - n.y) <= n.r);
    if (extent < minExtent && !protectedPart) continue;
    const simp = rdp(s.pts, protectedPart ? Math.min(eps, 0.25) : eps);
    if (simp.length < 2) continue;
    let px = Math.round(simp[0]![0] * 10) / 10;
    let py = Math.round(simp[0]![1] * 10) / 10;
    out += `M${fmt(px)} ${fmt(py)}l`;
    let prev = '';
    for (let i = 1; i < simp.length; i++) {
      const nx = Math.round(simp[i]![0] * 10) / 10;
      const ny = Math.round(simp[i]![1] * 10) / 10;
      const dx = Math.round((nx - px) * 10) / 10;
      const dy = Math.round((ny - py) * 10) / 10;
      px = nx;
      py = ny;
      if (dx === 0 && dy === 0) continue;
      const a = fmt(dx);
      const b = fmt(dy);
      const token = (prev === '' || a.startsWith('-') ? '' : ' ') + a + (b.startsWith('-') ? '' : ' ') + b;
      out += token;
      prev = token;
    }
    out += s.closed ? 'z' : '';
  }
  return out;
}
