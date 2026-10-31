/**
 * 线路类型词条。这里的说明只讲术语含义；品牌是否真的使用某种线路，
 * 以各品牌 routeTypes 字段的来源等级为准。多数线路类型是服务商自己的宣传说法，本站无法从外部核验。
 */
import type { RouteTypeId, RouteTypeInfo } from './types';

export const ROUTE_TYPES: readonly RouteTypeInfo[] = [
  {
    id: 'iplc',
    name: 'IPLC',
    fullName: 'International Private Leased Circuit（国际专线电路）',
    slug: 'iplc',
    short: '通常指跨境点到点的专用电路。机场宣传里的“IPLC”多半是商业说法，具体线路和带宽无法从外部验证。',
    aliases: ['IPLC', 'iplc', '国际专线', 'IPLC专线', '专线'],
  },
  {
    id: 'iepl',
    name: 'IEPL',
    fullName: 'International Ethernet Private Line（国际以太网专线）',
    slug: 'iepl',
    short: '以太网形态的国际专线，常与 IPLC 并列出现。名称相近，但宣传里两者经常被混用，需要看来源怎么写。',
    aliases: ['IEPL', 'iepl', 'IEPL专线', 'IEPL机场', '以太网专线'],
  },
  {
    id: 'bgp',
    name: 'BGP',
    fullName: 'BGP 多线接入',
    slug: 'bgp',
    short: '指通过多运营商 BGP 接入的网络。机场资料里“BGP”有时指入口接入方式，有时被当作线路类型宣传，需要看上下文。',
    aliases: ['BGP', 'bgp', 'BGP多线', 'BGP线路'],
  },
  {
    id: 'cn2',
    name: 'CN2',
    fullName: '中国电信 CN2 线路',
    slug: 'cn2',
    short: '中国电信的优质骨干网络线路名称，常见于入口或出口一侧的宣传。资料里单独出现的“CN2”不能说明整条路径的质量。',
    aliases: ['CN2', 'cn2', 'CN2 GIA', 'CN2线路'],
  },
  {
    id: 'relay',
    name: '中转',
    fullName: '中转 / 中继节点',
    slug: 'relay',
    short: '用户先连到入口节点，再由入口转发到出口节点。中转本身不等于专线，质量取决于入口、转发段和出口三者。',
    aliases: ['中转', '中继', 'relay', '转发', '中转节点'],
  },
  {
    id: 'direct',
    name: '直连',
    fullName: '直连节点',
    slug: 'direct',
    short: '用户直接连到出口服务器，没有额外的转发段。延迟取决于用户所在网络到出口机房的公网路径。',
    aliases: ['直连', 'direct', '直连节点'],
  },
  {
    id: 'dedicated-exit',
    name: '独享出口',
    fullName: '独享出口 / 独享专线',
    slug: 'dedicated-exit',
    short: '出口 IP 或线路按用户或小团体独占分配，常用于有固定 IP 需求的场景，价格通常也更高。',
    aliases: ['独享', '独享出口', '独享专线', '专属线路', 'dedicated'],
  },
];

const BY_ID = new Map(ROUTE_TYPES.map((r) => [r.id, r]));
export const getRouteType = (id: RouteTypeId): RouteTypeInfo => {
  const r = BY_ID.get(id);
  if (!r) throw new Error(`routes: 未知线路类型 ${id}`);
  return r;
};
export const routeLabel = (id: RouteTypeId): string => getRouteType(id).name;
