/** 站点级常量：全站只在这里定义名称、域名、导航，避免各页面各写一份。 */
import { BRAND_INDEX } from '../data/brand-index';

/** 公开收录的机场数量：从品牌索引算出，不写死 */
export const BRAND_COUNT = BRAND_INDEX.length;
export const SITE_NAME = '机场节点';
export const SITE_URL = 'https://jichangjiedian.blog';
export const SITE_LANG = 'zh-CN';
export const SITE_TZ = 'Asia/Shanghai';

// 2026-11-01 站长要求首页接住“机场节点推荐”“性价比机场”“机场测评”“机场VPN”：title 放前两个，description 带上后两个
export const HOME_TITLE = `2026机场推荐与机场节点推荐：${BRAND_COUNT}家性价比对比，附晚高峰实测｜机场节点`;
export const HOME_DESCRIPTION =
  `2026年${BRAND_COUNT}家机场推荐与机场节点推荐：每家最低价格、节点数量与地区（香港、台湾、日本、新加坡、美国等）、IPLC/IEPL线路和注册入口，按每GB成本比性价比；附灵动云晚高峰测评，并讲清机场和VPN的区别。`;
export const HOME_H1 = '机场节点与机场推荐指南 2026：看懂不同时间段的速度、延迟与稳定性';
export const HOME_SUBTITLE = '机场节点的表现并非一成不变。本博客围绕早晨、白天、晚高峰与深夜等不同时段，关注节点延迟、下载速度、丢包率、网络抖动及连接稳定性的变化，并结合线路类型、地区差异和实际使用场景，帮助读者理解机场节点的性能特点。我们不仅讨论机场推荐，更注重测试方法、数据解读与长期使用体验，让每一次节点选择都有更清晰的参考依据。';
export const HOME_SLOGAN = '机场推荐：本站主推灵动云，60 个节点、IPLC / IEPL 专线 + BGP 线路，晚高峰实测香港、新加坡、美国节点。';

/** 顶部导航：共 8 项，顺序与总指令一致 */
export const NAV_ITEMS: readonly { label: string; href: string; hint: string }[] = [
  { label: '全球节点地图', href: '/#global-map', hint: '按地区查看哪些机场提供节点' },
  { label: `${BRAND_COUNT}家机场目录`, href: '/airports/', hint: '固定编辑顺序的机场资料目录' },
  { label: '分时段节点测试', href: '/time-tests/', hint: '早间、午间、晚间、晚高峰、深夜的测试记录' },
  { label: '节点地区', href: '/regions/', hint: '香港、日本、新加坡等地区专题' },
  { label: '线路知识', href: '/routes/', hint: 'IPLC、IEPL、BGP 等线路术语' },
  { label: '套餐对比', href: '/plans/', hint: '按预算、流量、周期筛选套餐' },
  { label: '客户端教程', href: '/guides/', hint: '客户端与测试方法教程' },
  { label: '研究文章', href: '/articles/', hint: '原创研究文章' },
];

export const FOOTER_LINKS: readonly { label: string; href: string }[] = [
  { label: '机场优惠码', href: '/coupons/' },
  { label: '便宜机场', href: '/plans/cheapest/' },
  { label: '测试方法', href: '/testing-methodology/' },
  { label: '测试档案', href: '/test-records/' },
  { label: '资料来源', href: '/sources/' },
  { label: '关于本站', href: '/about/' },
  { label: '合作推广声明', href: '/affiliate-disclosure/' },
  { label: '隐私政策', href: '/privacy/' },
];

export const absoluteUrl = (path: string): string => new URL(path, SITE_URL).toString();

/** 站点品牌描述，用于 Organization / WebSite 结构化数据 */
export const SITE_TAGLINE = `环球节点地图、${BRAND_COUNT}家机场资料与分时段网络表现研究`;

/** 资料整理日期（数据集最近一次整理）。页面 lastmod 以各页面自己的真实日期为准，没有则回退到它。 */
export const DATA_UPDATED = '2026-11-01';
export const SITE_FOUNDED = '2026-10-27';
export const COMPLIANCE_NOTE = '使用任何网络服务请遵守所在地区适用的法律法规。本站只整理公开资料与测试记录，不提供网络接入服务。';

/** 页头社交入口。GitHub 入口指向仓库的 Issue #1（资料汇总页）；href 为 null 时不显示该图标。 */
export const SOCIAL_LINKS: readonly { key: 'telegram' | 'github'; label: string; href: string | null }[] = [
  { key: 'telegram', label: 'Telegram 交流群', href: 'https://t.me/+wENW-g34bXY2MjM1' },
  { key: 'github', label: 'GitHub', href: 'https://github.com/wongkelvin1995-star/jichangjiedian.blog/issues/1' },
];
