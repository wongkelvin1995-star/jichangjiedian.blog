/**
 * 首页地图右侧各地区面板的数据（构建时生成的静态 JSON）。
 *
 * 为什么单独成文件：9 个地区面板、每个最多 34 行，全部写进首页 HTML 会多出约 80KB，
 * 首页会远超 Bing 站长工具提示的 125KB（“Evaluated size of HTML is estimated to be over 125 KB and risks not being fully cached”）。
 * 默认地区（香港）的概况在 HTML 里，清单在页面加载后立即从这里读取；其他地区的概况和清单都在点开时由 map-explorer.ts 生成。
 * 这些内容与 /regions/ 下各地区专题页相同，不是首页独有的内容。
 *
 * 结构：{ 地区代码: { h: 概况, r: 清单 } }
 *  h：d 有记录的机场数、u 资料补充中、x 未列出、rc 线路统计 [名称, 已确认数, 待核验数]、sr 本站实测条数、
 *     sn 节点在线快照 [在线, 总数, 日期文字] 或 null、tp 其他测速参考行数、slug 地区专题页、total 清单总行数
 *  r 每一行：s 品牌 slug、n 名称、k 编号、l 资料状态、g 灰色标签 [文字, 提示]、c 该地区节点数、a 全站节点数、
 *     w 全站数是否“不少于”、t 线路 [id, 名称, 是否已确认]
 */
import type { APIRoute } from 'astro';
import { COVERAGE_LABEL } from '../data/regions';
import { fmtDate } from '../lib/format';
import { ALL_REGION_SUMMARIES } from '../lib/queries';
import { REGION_PANEL_WARN, regionPanelRows } from '../lib/region-panel';

export const GET: APIRoute = () => {
  const out: Record<string, unknown> = {};
  for (const s of ALL_REGION_SUMMARIES()) {
    const rows = regionPanelRows(s);
    const snap = s.snapshots[0];
    out[s.point.countryCode] = {
      h: {
        d: s.documented.length,
        u: s.unverified.length,
        x: s.none.length,
        rc: s.routeCounts.map((r) => [r.label, r.confirmed, r.pending]),
        sr: s.siteRecords.length,
        sn: snap ? [snap.online, snap.total, fmtDate(snap.snapshot.checkedFrom)] : null,
        tp: s.thirdPartyRecords.length,
        slug: s.point.regionSlug,
        total: rows.length,
      },
      r: rows.map((r) => {
        const gray: [string, string?][] = [];
        if (r.level === 'unverified') gray.push([COVERAGE_LABEL.unverified]);
        const warn = REGION_PANEL_WARN[r.brand.verificationStatus];
        if (warn) gray.push([warn]);
        if (r.panelGap) gray.push(['面板里没有', `站长 ${r.panelGap} 的后台面板里没有这个地区的节点，数量来自服务商说明`]);
        return {
          s: r.brand.slug,
          n: r.brand.shortName,
          k: r.brand.displayRank,
          l: r.level,
          g: gray,
          c: r.nodeCount,
          a: r.brand.nodeCount.value,
          w: /下限|不少于/.test(r.brand.nodeCount.note ?? ''),
          t: r.routeChips.map((c) => [c.id, c.label, c.confirmed]),
        };
      }),
    };
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
