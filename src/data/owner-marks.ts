/**
 * 站长核验表（Google 表格《最低价格以及机场优势》）里的常用服务连通性标注。
 *
 * 表格用黄色底色表示“稳定”，单元格本身没有文字。2026-10-28 读取：34 家 × 9 项服务全部为黄色。
 * 站长说明“黄色代表稳定”，并要求网站全部写作“稳定”。
 *
 * 站长 2026-10-31 说明：这些标注读取自各服务商提供的资料（服务商自述的连通情况），不是本站测试；
 * 表格没有附测试时间、节点和截图，所以：
 *  - 在品牌页以“服务商资料标注（站长核对表）”单独展示，来源等级 C，并写明本站未逐项实测；
 *  - 不生成测试记录，不进入分时段统计，也不用于任何排序。
 */
import { BRAND_INDEX } from './brand-index';

export const OWNER_MARK_SOURCE = 'owner-sheet';
export const OWNER_MARK_READ_AT = '2026-10-28';
export const OWNER_MARK_SERVICES = ['Google', 'YouTube', 'ChatGPT', 'Spotify', 'Twitch', 'Disney+', 'Steam', 'PlayStation', 'Xbox'] as const;

export interface OwnerServiceMark {
  service: (typeof OWNER_MARK_SERVICES)[number];
  status: '稳定';
}

/** 读取结果：34 家全部 9 项为黄色（稳定）。如果以后表格有变化，在这里逐家修改。 */
const ALL_STABLE: OwnerServiceMark[] = OWNER_MARK_SERVICES.map((service) => ({ service, status: '稳定' }));
export const OWNER_SERVICE_MARKS: Readonly<Record<string, OwnerServiceMark[]>> = Object.fromEntries(
  BRAND_INDEX.map((b) => [b.slug, ALL_STABLE]),
);

export const ownerMarksFor = (slug: string): OwnerServiceMark[] => OWNER_SERVICE_MARKS[slug] ?? [];
