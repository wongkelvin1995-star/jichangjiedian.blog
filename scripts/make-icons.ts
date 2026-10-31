/**
 * 生成站点图标与分享图（只需要在改版时运行一次，生成的 PNG 提交进 public/）：
 *   public/favicon-32.png        32×32
 *   public/favicon-512.png       512×512（Organization 结构化数据里的 logo）
 *   public/apple-touch-icon.png  180×180（满版方形，iOS 会自己裁圆角）
 *   public/og/default.png        1200×630 分享图（微信、Telegram、X、Bing 等预览）
 *
 * 分享图使用与首页地图相同的地图几何（src/lib/geo.ts）和同一套配色，
 * 图上写明“航线为地区关系示意，非实际物理路由”。不含任何评分、排名或虚构数字。
 * 用法：npm run icons
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { buildWorldMap } from '../src/lib/geo';

const PUBLIC = path.resolve('public');
fs.mkdirSync(path.join(PUBLIC, 'og'), { recursive: true });

const C = { night: '#091830', star: '#214986', electric: '#58CEFF', sunset: '#F5B36C' };

// ---------------------------------------------------------------- 图标
const markSvg = (round: boolean): string => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" ${round ? 'rx="9"' : ''} fill="${C.star}"/>
  <path d="M9 28Q18 8 31 13" fill="none" stroke="${C.electric}" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="9" cy="28" r="3.2" fill="${C.electric}"/>
  <circle cx="31" cy="13" r="3.2" fill="${C.sunset}"/>
</svg>`;

async function icon(svg: string, size: number, out: string): Promise<void> {
  await sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC, out));
  console.log(`✓ ${out}  ${size}×${size}`);
}
await icon(markSvg(true), 32, 'favicon-32.png');
await icon(markSvg(true), 512, 'favicon-512.png');
await icon(markSvg(false), 180, 'apple-touch-icon.png');

// ---------------------------------------------------------------- 分享图
const map = buildWorldMap();
const W = 1200;
const H = 630;
// 取景：放大亚太部分，让“国内入口”落在画面右侧，美洲的航线从右边缘延伸出去；欧洲落在文字下方，被渐变压暗
const scale = 1.5;
const mapW = map.width * scale;
const mapH = map.height * scale;
const mapX = 800 - map.entrance.x * scale;
const mapY = 300 - map.entrance.y * scale;

const routes = map.dots
  .map(
    (d) =>
      `<path d="${d.route}" fill="none" stroke="${C.electric}" stroke-opacity="0.75" stroke-width="${(2.2 / scale).toFixed(2)}" stroke-linecap="round"/>`,
  )
  .join('\n');
const SHOWN = new Set(['HK', 'TW', 'JP', 'SG', 'KR']);
const labels = map.dots
  .filter((d) => SHOWN.has(d.countryCode))
  .map(
    (d) =>
      `<text x="${d.x + d.labelDx / scale}" y="${d.y + d.labelDy / scale}" text-anchor="${d.anchor}" font-size="${(17 / scale).toFixed(1)}" fill="#cfe3ff" font-weight="600">${d.name}</text>`,
  )
  .join('\n');
const dots = map.dots
  .map(
    (d) =>
      `<circle cx="${d.x}" cy="${d.y}" r="${(11 / scale).toFixed(1)}" fill="${C.electric}" fill-opacity="0.16"/>` +
      `<circle cx="${d.x}" cy="${d.y}" r="${(4.6 / scale).toFixed(1)}" fill="${C.electric}"/>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: ${W}px; height: ${H}px; background: ${C.night}; overflow: hidden; }
  body { position: relative; font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif; color: #eaf2ff; }
  .glow { position: absolute; inset: 0; background:
    radial-gradient(760px 420px at 78% 78%, rgba(88,206,255,.16), transparent 70%),
    radial-gradient(620px 360px at 8% 0%, rgba(33,73,134,.55), transparent 70%); }
  svg.map { position: absolute; left: ${mapX.toFixed(1)}px; top: ${mapY.toFixed(1)}px; width: ${mapW.toFixed(1)}px; height: ${mapH.toFixed(1)}px; }
  .fade { position: absolute; inset: 0; background: linear-gradient(90deg, ${C.night} 0%, rgba(9,24,48,.9) 38%, rgba(9,24,48,0) 62%); }
  .copy { position: absolute; left: 72px; top: 64px; width: 640px; }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand svg { width: 58px; height: 58px; }
  .brand b { font-size: 44px; font-weight: 800; letter-spacing: .05em; }
  h1 { margin-top: 54px; font-size: 62px; line-height: 1.22; font-weight: 800; letter-spacing: .01em; }
  p.sub { margin-top: 26px; font-size: 27px; line-height: 1.6; color: #a9bddb; }
  .foot { position: absolute; left: 72px; bottom: 46px; font-size: 23px; color: ${C.electric}; letter-spacing: .04em; }
  .note { position: absolute; right: 44px; bottom: 34px; font-size: 17px; color: #7f95b8; }
</style></head><body>
  <div class="glow"></div>
  <svg class="map" viewBox="0 0 ${map.width} ${map.height}" aria-hidden="true">
    <path d="${map.graticulePath}" fill="none" stroke="#2a4f8a" stroke-opacity="0.35" stroke-width="${(1 / scale).toFixed(2)}"/>
    <path d="${map.landPath}" fill="#16325f" stroke="#2c5390" stroke-width="${(1 / scale).toFixed(2)}" stroke-linejoin="round"/>
    ${routes}
    ${dots}
    ${labels}
    <circle cx="${map.entrance.x}" cy="${map.entrance.y}" r="${(13 / scale).toFixed(1)}" fill="${C.sunset}" fill-opacity="0.2"/>
    <circle cx="${map.entrance.x}" cy="${map.entrance.y}" r="${(5.4 / scale).toFixed(1)}" fill="${C.sunset}"/>
  </svg>
  <div class="fade"></div>
  <div class="copy">
    <div class="brand">${markSvg(true).replace('<svg ', '<svg aria-hidden="true" ')}<b>机场节点</b></div>
    <h1>看懂不同时间段的<br>速度、延迟与稳定性</h1>
    <p class="sub">34 家机场资料、分时段测试记录与线路知识，每条数据都标注来源和证据等级。</p>
  </div>
  <div class="foot">jichangjiedian.blog</div>
  <div class="note">航线为地区关系示意，非实际物理路由</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const raw = await page.screenshot({ type: 'png' });
await browser.close();
// 重新压缩，分享图通常 < 300KB 更容易被各平台抓取
await sharp(raw).png({ compressionLevel: 9, palette: false }).toFile(path.join(PUBLIC, 'og', 'default.png'));
console.log(`✓ og/default.png  ${W}×${H}  ${(fs.statSync(path.join(PUBLIC, 'og', 'default.png')).size / 1024).toFixed(0)}KB`);
