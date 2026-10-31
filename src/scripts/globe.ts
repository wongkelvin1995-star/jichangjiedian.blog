/**
 * 背景地球：缓慢旋转的陆地点阵 + 经纬网 + 几条从国内到各节点地区的示意弧线（沿线有光点移动，目标地区有脉冲圆点）。
 * 纯装饰（aria-hidden）。首页画在标题右侧的圆形槽里（文字沿圆形绕排，所以不会盖住文字）；
 * 内页画在页头右侧并向左渐隐。宽度 < 900px 不加载；prefers-reduced-motion 时只画一帧；
 * 标签页在后台或滚出视野时停止绘制。弧线是地区关系示意，不是真实路由。
 */
const slot = document.querySelector<HTMLElement>('[data-globe-host]');
const head = document.querySelector<HTMLElement>('.page-head');
// 品牌页的页头右侧是价格卡片，地球放在它后面会显得杂乱，所以不画
const host = slot ?? (head && !head.querySelector('.brand-cta') ? head : null);
if (host) void init(host, slot !== null);

async function init(el: HTMLElement, inSlot: boolean): Promise<void> {
  let dots: number[];
  try {
    const r = await fetch('/globe-dots.json', { credentials: 'omit' });
    if (!r.ok) return;
    dots = (await r.json()) as number[];
  } catch {
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.className = 'globe-bg';
  canvas.setAttribute('aria-hidden', 'true');
  if (inSlot) {
    el.append(canvas);
  } else {
    el.classList.add('has-globe');
    el.prepend(canvas);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rad = Math.PI / 180;
  const pts: [number, number][] = [];
  for (let i = 0; i < dots.length; i += 2) pts.push([(dots[i]! / 10) * rad, (dots[i + 1]! / 10) * rad]);
  // 国内（示意）到各节点地区
  const origin: [number, number] = [116 * rad, 34 * rad];
  const targets: [number, number][] = [[114.2, 22.3], [139.7, 35.7], [103.8, 1.35], [121.5, 25], [-118.2, 34], [-0.1, 51.5], [127, 37.5]].map(([a, b]) => [a! * rad, b! * rad]);
  const arcs = targets.map((t) => {
    const out: [number, number, number][] = [];
    const [l1, p1] = origin;
    const [l2, p2] = t;
    const v1 = [Math.cos(p1) * Math.cos(l1), Math.cos(p1) * Math.sin(l1), Math.sin(p1)];
    const v2 = [Math.cos(p2) * Math.cos(l2), Math.cos(p2) * Math.sin(l2), Math.sin(p2)];
    const d = Math.acos(Math.min(1, v1[0]! * v2[0]! + v1[1]! * v2[1]! + v1[2]! * v2[2]!));
    for (let i = 0; i <= 40; i++) {
      const f = i / 40;
      const a = Math.sin((1 - f) * d) / Math.sin(d);
      const b = Math.sin(f * d) / Math.sin(d);
      const x = a * v1[0]! + b * v2[0]!;
      const y = a * v1[1]! + b * v2[1]!;
      const z = a * v1[2]! + b * v2[2]!;
      out.push([Math.atan2(y, x), Math.atan2(z, Math.hypot(x, y)), 1 + 0.12 * Math.sin(Math.PI * f)]);
    }
    return out;
  });

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let size = 0;
  const tilt = 18 * rad;
  const sinT = Math.sin(tilt);
  const cosT = Math.cos(tilt);
  let lam = -110 * rad; // 起始正对东亚
  // 深空主题：青色陆地点阵与经纬网、蓝紫球体，弧线交替用青色与琥珀色
  const BLUE = '54, 215, 255';
  const ORANGE = '255, 179, 87';
  const NAVY = '244, 247, 255';

  const draw = (t: number) => {
    if (!size) return;
    const full = size * dpr;
    const R = full * 0.43; // 留出外圈光晕的位置，光晕不能超出画布，否则会被裁出直边
    const c = full / 2;
    ctx.clearRect(0, 0, full, full);
    const project = (lon: number, lat: number, h = 1): [number, number, number] => {
      const dl = lon + lam;
      const cosLat = Math.cos(lat);
      const z = sinT * Math.sin(lat) + cosT * cosLat * Math.cos(dl);
      return [c + h * R * cosLat * Math.sin(dl), c - h * R * (cosT * Math.sin(lat) - sinT * cosLat * Math.cos(dl)), z];
    };

    // 大气光晕
    const halo = ctx.createRadialGradient(c, c, R * 0.97, c, c, R * 1.16);
    halo.addColorStop(0, `rgba(57, 139, 255, 0.4)`);
    halo.addColorStop(1, `rgba(112, 71, 255, 0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(c, c, R * 1.16, 0, Math.PI * 2);
    ctx.fill();

    // 球体：左上亮、右下深，带细轮廓
    const body = ctx.createRadialGradient(c - R * 0.38, c - R * 0.42, R * 0.08, c, c, R);
    body.addColorStop(0, '#2a4a9a');
    body.addColorStop(0.5, '#122455');
    body.addColorStop(1, '#070d24');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(c, c, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeStyle = `rgba(${BLUE}, 0.6)`;
    ctx.stroke();

    // 经纬网
    ctx.lineWidth = dpr;
    ctx.strokeStyle = `rgba(${BLUE}, 0.14)`;
    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      let pen = false;
      for (let lat = -90; lat <= 90; lat += 6) {
        const [x, y, z] = project(lon * rad, lat * rad);
        if (z <= 0) { pen = false; continue; }
        if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let pen = false;
      for (let lon = -180; lon <= 180; lon += 6) {
        const [x, y, z] = project(lon * rad, lat * rad);
        if (z <= 0) { pen = false; continue; }
        if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        pen = true;
      }
      ctx.stroke();
    }

    // 陆地点阵（越靠近球心越实）
    ctx.fillStyle = `rgb(${BLUE})`;
    const s = 2.2 * dpr;
    for (const [lon, lat] of pts) {
      const [x, y, z] = project(lon, lat);
      if (z <= 0) continue;
      ctx.globalAlpha = 0.3 + 0.7 * z;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;

    // 左上高光
    const shine = ctx.createRadialGradient(c - R * 0.42, c - R * 0.46, 0, c - R * 0.42, c - R * 0.46, R * 0.7);
    shine.addColorStop(0, 'rgba(160, 200, 255, 0.28)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(c, c, R, 0, Math.PI * 2);
    ctx.fill();

    // 弧线：先画一条宽而淡的底线，再画清晰的细线，沿线有光点移动
    arcs.forEach((arc, i) => {
      const col = i % 2 ? ORANGE : BLUE;
      for (const [w, a] of [[5, 0.16], [1.9, 0.95]] as const) {
        ctx.beginPath();
        let pen = false;
        for (const [lon, lat, h] of arc) {
          const [x, y, z] = project(lon, lat, h);
          if (z <= -0.05) { pen = false; continue; }
          if (pen) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          pen = true;
        }
        ctx.lineWidth = w * dpr;
        ctx.strokeStyle = `rgba(${col}, ${a})`;
        ctx.stroke();
      }
      const k = Math.floor((t / 60 + i * 9) % 40);
      const [lon, lat, h] = arc[k]!;
      const [x, y, z] = project(lon, lat, h);
      if (z > 0) {
        ctx.beginPath();
        ctx.arc(x, y, 7 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col}, 0.22)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 3.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${col})`;
        ctx.fill();
      }
    });

    // 节点标记：目标地区的脉冲圆点
    targets.forEach(([lon, lat], i) => {
      const [x, y, z] = project(lon, lat);
      if (z <= 0.05) return;
      const pulse = (t / 1100 + i * 0.37) % 1;
      ctx.beginPath();
      ctx.arc(x, y, (3.5 + pulse * 10) * dpr, 0, Math.PI * 2);
      ctx.lineWidth = 1.4 * dpr;
      ctx.strokeStyle = `rgba(${ORANGE}, ${0.6 * (1 - pulse)})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 3.8 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${ORANGE})`;
      ctx.fill();
      ctx.lineWidth = 1.2 * dpr;
      ctx.strokeStyle = '#0b1735';
      ctx.stroke();
    });
    // 国内入口（示意）
    const [ox, oy, oz] = project(origin[0], origin[1]);
    if (oz > 0.05) {
      ctx.beginPath();
      ctx.arc(ox, oy, 4.4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${NAVY})`;
      ctx.fill();
      ctx.lineWidth = 1.4 * dpr;
      ctx.strokeStyle = `rgb(${BLUE})`;
      ctx.stroke();
    }
  };

  let lastT = 0;
  const resize = () => {
    size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    draw(lastT);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  let visible = true;
  let raf = 0;
  let last = 0;
  const loop = (t: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (t - last > 40) {
      lam += (0.0022 * Math.min(t - last, 100)) / 16;
      last = t;
      lastT = t;
      draw(t);
    }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };
  new IntersectionObserver((e) => { visible = e[0]!.isIntersecting; start(); }).observe(canvas);
  document.addEventListener('visibilitychange', start);
  start();
}

export {};
