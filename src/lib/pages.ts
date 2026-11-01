/**
 * 站内“可索引页面”登记表。
 *
 * sitemap.xml、站内搜索索引和 scripts/validate-seo.ts 共用这一份清单，避免三处各写一份、日后互相不一致。
 * 只登记应该被搜索引擎收录的规范 URL；以下页面刻意不在这里：
 *   - /search/、/404.html（noindex）
 *   - 资料不足、尚未开放详情页的品牌页 /airports/<slug>/（noindex,follow；目录页仍然列出这些品牌）
 *
 * lastmod 必须是页面内容真实发生变化的日期：
 *   - 文章、教程：取各自 frontmatter 的 modified；
 *   - 灵动云测速报告：取报告自己的 modified；
 *   - 其余数据驱动页面：取资料整理日期 DATA_UPDATED（站长每次更新资料时修改它）；
 *   - 列表页、首页：取所列内容里最新的一个日期。
 */
import { BRANDS } from '../data/brands';
import { REGION_PAGES } from '../data/regions';
import { LDY_REPORT_MODIFIED, LDY_REPORT_PATH } from '../data/reports/lingdongyun-sg-2026-10';
import { LDY_PEAK_PAGE_MODIFIED, LDY_PEAK_PAGE_PATH } from '../data/reports/lingdongyun-peak-2026-10-28';
import { loadPosts } from './content';
import { DATA_UPDATED } from './site';

export interface SitePage {
  /** 以 / 开头并以 / 结尾的站内路径 */
  path: string;
  /** YYYY-MM-DD */
  lastmod: string;
}

const newest = (dates: string[]): string => dates.reduce((a, b) => (a > b ? a : b), '0000-00-00');

/** 数据驱动的单页（无独立日期的页面都跟随资料整理日期） */
const DATA_PAGES = [
  '/airports/',
  '/regions/',
  '/routes/',
  '/routes/iepl-iplc/',
  '/ai/',
  '/time-tests/',
  '/test-records/',
  '/plans/',
  '/plans/cheapest/',
  '/coupons/',
  '/testing-methodology/',
  '/sources/',
  '/about/',
  '/affiliate-disclosure/',
  '/privacy/',
] as const;

export async function indexablePages(): Promise<SitePage[]> {
  const posts = await loadPosts();
  const articles = posts.filter((p) => p.kind === 'articles');
  const guides = posts.filter((p) => p.kind === 'guides');

  const pages: SitePage[] = [
    { path: '/', lastmod: newest([DATA_UPDATED, ...posts.map((p) => p.modified)]) },
    ...DATA_PAGES.map((path) => ({ path, lastmod: DATA_UPDATED })),
    ...BRANDS.filter((b) => b.detailPage === 'open').map((b) => ({ path: `/airports/${b.slug}/`, lastmod: DATA_UPDATED })),
    { path: LDY_REPORT_PATH, lastmod: LDY_REPORT_MODIFIED },
    { path: LDY_PEAK_PAGE_PATH, lastmod: LDY_PEAK_PAGE_MODIFIED },
    ...REGION_PAGES.map((r) => ({ path: `/regions/${r.slug}/`, lastmod: DATA_UPDATED })),
    { path: '/articles/', lastmod: newest(articles.map((p) => p.modified)) || DATA_UPDATED },
    ...articles.map((p) => ({ path: p.href, lastmod: p.modified })),
    { path: '/guides/', lastmod: newest(guides.map((p) => p.modified)) || DATA_UPDATED },
    ...guides.map((p) => ({ path: p.href, lastmod: p.modified })),
  ];

  // 路径必须唯一
  const seen = new Set<string>();
  for (const p of pages) {
    if (seen.has(p.path)) throw new Error(`页面登记表中路径重复：${p.path}`);
    seen.add(p.path);
  }
  return pages;
}
