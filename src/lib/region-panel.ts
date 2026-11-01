/**
 * 首页地图右侧“地区资料面板”的行数据：服务端渲染（RegionPanel.astro，默认地区）和
 * 按需加载的 JSON（pages/region-rows.json.ts，其他地区）共用同一份排序与标签规则。
 */
import type { RegionBrandRow, RegionSummary } from './queries';

/** 品牌整体状态的提示标签 */
export const REGION_PANEL_WARN: Record<string, string> = {
  'demo-site': '演示站',
  'identity-pending': '对应关系待核验',
  insufficient: '资料不足',
};

/** 面板里的机场清单：有记录的和资料补充中的放在一起，按本站编号排序 */
export const regionPanelRows = (s: RegionSummary): RegionBrandRow[] =>
  [...s.documented, ...s.unverified].sort((a, b) => a.brand.displayRank - b.brand.displayRank);
