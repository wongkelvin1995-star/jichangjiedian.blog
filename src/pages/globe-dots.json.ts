/** 背景地球的陆地点阵：构建时用 world-atlas 110m 陆地采样，浏览器空闲时才加载。只是装饰，不代表任何服务器位置。 */
import type { APIRoute } from 'astro';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';

export const GET: APIRoute = () => {
  const t = land110 as unknown as Topology;
  const land = feature(t, (t.objects as Record<string, never>).land) as unknown as Parameters<typeof geoContains>[0];
  const pts: number[] = [];
  for (let lat = -56; lat <= 78; lat += 2.4) {
    const step = 2.4 / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180; lon < 180; lon += step) {
      if (geoContains(land, [lon, lat])) pts.push(Math.round(lon * 10), Math.round(lat * 10));
    }
  }
  return new Response(JSON.stringify(pts), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
