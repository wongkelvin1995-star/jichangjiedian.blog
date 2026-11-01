/**
 * 构建期生成世界地图与地区小地图的 SVG 几何（d3-geo + world-atlas）。
 *
 * 约定：
 *  - 只绘制陆地轮廓，不绘制国界线（避免任何边界表述）；
 *  - 点位是“地区示意点”，不是服务器坐标；航线是“地区关系示意”，不是物理路由；
 *  - 航线的起点“国内入口”只是一个示意标记，不代表任何真实网络入口位置。
 */
import { geoGraticule, geoMercator, geoNaturalEarth1, geoPath } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import type { Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import land50 from 'world-atlas/land-50m.json';
import { MAP_POINTS } from '../data/regions';
import { compactPath } from './svg-path';

type LandFeature = Feature<MultiPolygon | Polygon>;

const toLand = (topo: unknown): LandFeature => {
  const t = topo as Topology;
  const f = feature(t, (t.objects as Record<string, never>).land) as unknown as LandFeature | FeatureCollection<MultiPolygon | Polygon>;
  return 'features' in f ? (f.features[0] as LandFeature) : f;
};

/** 去掉南极洲，避免地图下方出现大片无关陆地 */
function withoutAntarctica(f: LandFeature): LandFeature {
  const g = f.geometry;
  if (g.type !== 'MultiPolygon') return f;
  const kept = g.coordinates.filter((poly) => {
    const ring = poly[0] ?? [];
    const maxLat = Math.max(...ring.map((p) => p[1] ?? -90));
    return maxLat > -60;
  });
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: kept } };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export interface MapDot {
  countryCode: string;
  regionSlug: string;
  name: string;
  nameEn: string;
  x: number;
  y: number;
  /** 标签相对圆点的偏移与对齐 */
  labelDx: number;
  labelDy: number;
  anchor: 'start' | 'end' | 'middle';
  /** 示意航线（二次贝塞尔） */
  route: string;
  /** 航线动画的出场序号（CSS 用 nth 选择器，不使用内联样式） */
  order: number;
}

export interface WorldMapGeometry {
  width: number;
  height: number;
  landPath: string;
  graticulePath: string;
  dots: MapDot[];
  entrance: { x: number; y: number };
}

/** 标签位置微调（屏幕坐标偏移），只影响标签，不影响点位 */
const LABEL: Record<string, { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }> = {
  HK: { dx: -10, dy: 6, anchor: 'end' },
  TW: { dx: 11, dy: -5, anchor: 'start' },
  JP: { dx: 11, dy: 4, anchor: 'start' },
  SG: { dx: -10, dy: 6, anchor: 'end' },
  US: { dx: 0, dy: -13, anchor: 'middle' },
  KR: { dx: 0, dy: -11, anchor: 'middle' },
  DE: { dx: 9, dy: -7, anchor: 'start' },
  GB: { dx: -9, dy: -7, anchor: 'end' },
  FR: { dx: -9, dy: 12, anchor: 'end' },
};

/** 航线起点：国内入口（示意） */
const ENTRANCE_LONLAT: [number, number] = [105, 33];
const CENTER_LON = 150; // 以太平洋为中心：欧洲在左、亚洲居中、美洲在右，航线不会绕出图外

let worldCache: WorldMapGeometry | null = null;

export function buildWorldMap(): WorldMapGeometry {
  if (worldCache) return worldCache;
  const WIDTH = 1000;
  const PAD = 6;
  const land = withoutAntarctica(toLand(land110));
  const projection: GeoProjection = geoNaturalEarth1().rotate([-CENTER_LON, 0]).precision(0.5);
  projection.fitWidth(WIDTH - PAD * 2, land);
  const [tx, ty] = projection.translate();
  projection.translate([tx + PAD, ty + PAD]);
  const path = geoPath(projection);
  const bounds = path.bounds(land);
  const height = Math.ceil(bounds[1][1] + PAD);
  // 台湾岛在 110m 数据里只有几像素，单独保护，避免被当成小岛丢弃
  const [twx, twy] = projection([121, 23.7]) as [number, number];
  // 抽稀容差 0.7px：放大 3.4 倍时误差约 2px，肉眼看不出；路径比 0.4px 时小约 5KB（首页 HTML 体积）
  const landPath = compactPath(path, land, { eps: 0.7, minExtent: 3, keepNear: [{ x: twx, y: twy, r: 6 }] });

  const grat = geoGraticule().step([30, 30]);
  const graticulePath = compactPath(path, grat(), { eps: 0.6, minExtent: 0 });

  const [ex, ey] = projection(ENTRANCE_LONLAT) as [number, number];
  const entrance = { x: r1(ex), y: r1(ey) };

  const dots: MapDot[] = MAP_POINTS.map((p, i) => {
    const [x, y] = projection([p.lon, p.lat]) as [number, number];
    const mx = (ex + x) / 2;
    const my = (ey + y) / 2;
    const len = Math.hypot(x - ex, y - ey);
    // 航线向上弯曲（屏幕上方 = 北），弯曲幅度与距离成正比
    const lift = Math.min(0.32 * len, 150);
    const cx = mx;
    const cy = my - lift;
    const l = LABEL[p.countryCode] ?? { dx: 10, dy: 4, anchor: 'start' as const };
    return {
      countryCode: p.countryCode,
      regionSlug: p.regionSlug,
      name: p.name,
      nameEn: p.nameEn,
      x: r1(x),
      y: r1(y),
      labelDx: l.dx,
      labelDy: l.dy,
      anchor: l.anchor,
      route: `M${r1(ex)} ${r1(ey)}Q${r1(cx)} ${r1(cy)} ${r1(x)} ${r1(y)}`,
      order: i + 1,
    };
  });

  worldCache = { width: WIDTH, height, landPath, graticulePath, dots, entrance };
  return worldCache;
}

// ------------------------------------------------------------------ 地区小地图
interface BBox {
  lon: [number, number];
  lat: [number, number];
}
/** 各地区页小地图的取景范围（经纬度） */
const REGION_VIEW: Record<string, BBox> = {
  'hong-kong': { lon: [109, 121], lat: [18, 27] },
  taiwan: { lon: [115, 127], lat: [19, 28] },
  japan: { lon: [127, 148], lat: [29, 46] },
  singapore: { lon: [97, 112], lat: [-4, 8] },
  'south-korea': { lon: [122, 133], lat: [32, 41] },
  'united-states': { lon: [-127, -65], lat: [23, 51] },
  europe: { lon: [-12, 22], lat: [40, 59] },
};

export interface RegionMapGeometry {
  width: number;
  height: number;
  landPath: string;
  dots: { countryCode: string; name: string; x: number; y: number; labelDx: number; labelDy: number; anchor: 'start' | 'end' | 'middle' }[];
}

const regionCache = new Map<string, RegionMapGeometry>();

export function buildRegionMap(slug: string): RegionMapGeometry {
  const hit = regionCache.get(slug);
  if (hit) return hit;
  const view = REGION_VIEW[slug];
  if (!view) throw new Error(`geo: 未配置地区取景范围 ${slug}`);
  const W = 640;
  const H = 360;
  const land = withoutAntarctica(toLand(land50));
  const bbox: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      // d3 要求外环顺时针（经度向东为 x、纬度向北为 y 时：左下 → 左上 → 右上 → 右下），逆时针会被理解为“球面上除这个框以外的全部区域”
      coordinates: [[[view.lon[0], view.lat[0]], [view.lon[0], view.lat[1]], [view.lon[1], view.lat[1]], [view.lon[1], view.lat[0]], [view.lon[0], view.lat[0]]]],
    },
  };
  const projection = geoMercator().precision(0.5);
  projection.fitExtent([[10, 10], [W - 10, H - 10]], bbox);
  projection.clipExtent([[0, 0], [W, H]]);
  const path = geoPath(projection);
  const landPath = compactPath(path, land, { eps: 0.5, minExtent: 1.6 });
  const pts = MAP_POINTS.filter((p) => p.regionSlug === slug);
  const dots = pts.map((p) => {
    const [x, y] = projection([p.lon, p.lat]) as [number, number];
    const l = LABEL[p.countryCode] ?? { dx: 10, dy: 4, anchor: 'start' as const };
    return { countryCode: p.countryCode, name: p.name, x: r1(x), y: r1(y), labelDx: l.dx, labelDy: l.dy, anchor: l.anchor };
  });
  const geo: RegionMapGeometry = { width: W, height: H, landPath, dots };
  regionCache.set(slug, geo);
  return geo;
}
