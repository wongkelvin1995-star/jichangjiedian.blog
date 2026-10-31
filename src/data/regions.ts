/**
 * 地区数据：地图示意点 + 7 个地区专题页。
 *
 * 重要：地图点位是“地区示意点”（取国家/地区的参考位置），不是服务器坐标，
 * 站内没有任何品牌的真实机房坐标或物理链路路径。地图上的连线同样只是地区关系示意。
 */
import type { Brand, EvidenceGrade, MapPoint, RegionClaim, RegionPage } from './types';

export const MAP_DISCLAIMER = '航线为地区关系示意，非实际物理路由。圆点是地区示意位置，不是服务器坐标。';

export const MAP_POINTS: readonly MapPoint[] = [
  { countryCode: 'HK', regionSlug: 'hong-kong', name: '香港', nameEn: 'Hong Kong', lat: 22.32, lon: 114.17 },
  { countryCode: 'TW', regionSlug: 'taiwan', name: '中国台湾', nameEn: 'Taiwan', lat: 23.7, lon: 121.0 },
  { countryCode: 'JP', regionSlug: 'japan', name: '日本', nameEn: 'Japan', lat: 36.2, lon: 138.0 },
  { countryCode: 'SG', regionSlug: 'singapore', name: '新加坡', nameEn: 'Singapore', lat: 1.35, lon: 103.82 },
  { countryCode: 'US', regionSlug: 'united-states', name: '美国', nameEn: 'United States', lat: 39.8, lon: -98.6 },
  { countryCode: 'KR', regionSlug: 'south-korea', name: '韩国', nameEn: 'South Korea', lat: 36.5, lon: 127.9 },
  { countryCode: 'DE', regionSlug: 'europe', name: '德国', nameEn: 'Germany', lat: 51.0, lon: 10.45 },
  { countryCode: 'GB', regionSlug: 'europe', name: '英国', nameEn: 'United Kingdom', lat: 53.5, lon: -2.5 },
  { countryCode: 'FR', regionSlug: 'europe', name: '法国', nameEn: 'France', lat: 46.6, lon: 2.4 },
];

export const REGION_PAGES: readonly RegionPage[] = [
  {
    slug: 'hong-kong',
    name: '香港',
    fullName: '香港节点',
    nameEn: 'Hong Kong',
    countryCodes: ['HK'],
    intro: '香港节点离大陆最近，延迟最低，适合日常上网、刷短视频和打游戏，几乎每家机场都提供。本页列出提供香港节点的机场、各家的节点数量、线路和价格，并附灵动云香港节点的晚高峰实测。',
    searchTerms: ['香港', '香港节点', '香港机场', '港节点', 'hk', 'hongkong', 'hong kong'],
  },
  {
    slug: 'japan',
    name: '日本',
    fullName: '日本节点',
    nameEn: 'Japan',
    countryCodes: ['JP'],
    intro: '日本节点适合看 Netflix、YouTube 和日区游戏、动漫服务，延迟仅次于香港和台湾。本页列出提供日本节点的机场、节点数量、线路与最低价格。',
    searchTerms: ['日本', '日本节点', '日本机场', '东京', '大阪', 'jp', 'japan', 'tokyo'],
  },
  {
    slug: 'singapore',
    name: '新加坡',
    fullName: '新加坡节点',
    nameEn: 'Singapore',
    countryCodes: ['SG'],
    intro: '新加坡节点适合东南亚服务和流媒体，晚高峰通常比美国节点稳。本页列出提供新加坡节点的机场，并附灵动云新加坡节点的晚高峰测速原图。',
    searchTerms: ['新加坡', '新加坡节点', '新加坡节点测速', '狮城', 'sg', 'singapore'],
  },
  {
    slug: 'taiwan',
    name: '中国台湾',
    fullName: '中国台湾节点',
    nameEn: 'Taiwan',
    countryCodes: ['TW'],
    intro: '台湾节点延迟低，适合游戏和需要台湾地区的服务，在客户端里常以“台湾01”“台北”等名称出现。本页列出提供台湾节点的机场、节点数量、线路与价格。',
    searchTerms: ['台湾', '台湾节点', '中国台湾', '台北', 'tw', 'taiwan', 'taipei'],
  },
  {
    slug: 'united-states',
    name: '美国',
    fullName: '美国节点',
    nameEn: 'United States',
    countryCodes: ['US'],
    intro: '美国节点是使用 ChatGPT、Claude 等 AI 服务的首选，延迟比亚洲节点高，但可用的服务最多。本页列出提供美国节点的机场，并附灵动云美国节点的晚高峰实测。',
    searchTerms: ['美国', '美国节点', '美国节点延迟', '洛杉矶', '圣何塞', 'us', 'usa', 'united states', 'los angeles'],
  },
  {
    slug: 'south-korea',
    name: '韩国',
    fullName: '韩国节点',
    nameEn: 'South Korea',
    countryCodes: ['KR'],
    intro: '韩国节点适合韩区游戏和韩国流媒体，提供的机场比香港、日本少。本页列出提供韩国节点的机场、节点数量与价格。',
    searchTerms: ['韩国', '韩国节点', '首尔', 'kr', 'korea', 'south korea', 'seoul'],
  },
  {
    slug: 'europe',
    name: '欧洲',
    fullName: '欧洲节点',
    nameEn: 'Europe',
    countryCodes: ['DE', 'GB', 'FR'],
    intro: '欧洲节点（德国、英国、法国）适合 BBC iPlayer 等欧洲服务，提供的机场较少，延迟也较高。本页按国家列出提供欧洲节点的机场与价格。',
    searchTerms: ['欧洲', '欧洲节点', '德国', '英国', '法国', '法兰克福', '伦敦', '巴黎', 'de', 'gb', 'uk', 'fr', 'europe', 'germany', 'france'],
  },
];

const POINT_BY_CODE = new Map(MAP_POINTS.map((p) => [p.countryCode, p]));
const REGION_BY_SLUG = new Map(REGION_PAGES.map((r) => [r.slug, r]));

export const getRegionPage = (slug: string): RegionPage | undefined => REGION_BY_SLUG.get(slug);
export const getMapPoint = (code: string): MapPoint | undefined => POINT_BY_CODE.get(code);
export const regionSlugForCode = (code: string): string | undefined => POINT_BY_CODE.get(code)?.regionSlug;

/** 国家/地区代码 -> 中文名；地图以外的地区回退到资料里的原文标签 */
export const countryName = (code: string, fallback = code): string => POINT_BY_CODE.get(code)?.name ?? fallback;

/**
 * 覆盖状态：
 *  documented = 公开资料中确有记录（来源等级 A/B/C）
 *  unverified = 仅有待核验或资料冲突的记录（D）
 *  none       = 资料里没有记录（不等于没有覆盖，只表示本站没有资料）
 */
export type Coverage = 'documented' | 'unverified' | 'none';

export const coverageOfGrade = (g: EvidenceGrade): Exclude<Coverage, 'none'> => (g === 'D' ? 'unverified' : 'documented');

export function coverageFor(brand: Brand, code: string): { level: Coverage; claims: RegionClaim[] } {
  const claims = brand.regions.filter((r) => r.countryCode === code);
  if (claims.length === 0) return { level: 'none', claims };
  const level = claims.some((c) => c.grade !== 'D') ? 'documented' : 'unverified';
  return { level, claims };
}

export const COVERAGE_LABEL: Record<Coverage, string> = {
  documented: '公开资料有记录',
  unverified: '待核验',
  none: '资料中无记录',
};
