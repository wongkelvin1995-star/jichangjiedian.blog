# 文章逐篇审核（2026-10-29）

共 16 篇（研究文章 13、教程 3），每篇读取构建后的完整 HTML 正文检查，不只看标题。

## 检查方法

- **标题与主题**：Title、H1 唯一；Title 15–70 字、Description 50–160 字；没有重复 Title / Description / H1。
- **正文质量**：正文字数、文内重复段落、跨文章完全相同段落、占位文字（待补充、Lorem、TODO、undefined、NaN 等）、第三方资料站名称。
- **主题差异化**：任意两篇正文按 12 字片段计算 Jaccard 相似度，阈值 8%：**没有任何一对超过阈值**，没有“只换品牌名或地区名”的重复文章。
- **SEO**：H2 / H3 层级不跳级、站内链接 ≥3（内容规则上限 5 个不同目标）、图片 alt、Article 结构化数据、发布 / 修改日期合理且不在未来。
- **人工通读**：逐篇核对与站内现状矛盾的说法（见下方“已修复”）。

## 审核表

| URL | Title | 字数 | H2/H3 | 站内链接 | 发布 / 修改 | 结构化数据 | 剩余问题 | 结果 |
|---|---|---|---|---|---|---|---|---|
| /articles/choose-airport-by-use-case/ | 按使用场景选机场：追剧、AI、多设备和备用各看什么？｜机场节点 | 2007 | 9/0 | 4 | 2026-10-28 / 2026-10-28 | BreadcrumbList、Article | 无 | 通过 |
| /articles/hong-kong-vs-japan-nodes/ | 香港节点与日本节点在实际使用中有什么不同？｜机场节点 | 1548 | 9/0 | 5 | 2026-10-27 / 2026-10-27 | BreadcrumbList、Article | 无 | 通过 |
| /articles/how-to-choose-airport-nodes-2026/ | 2026机场节点选择指南：地区、线路和测速时间怎么判断？｜机场节点 | 1525 | 8/0 | 5 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/how-to-speedtest-at-peak-hours/ | 机场晚高峰测速应该怎样进行？｜机场节点 | 1499 | 9/0 | 3 | 2026-10-27 / 2026-10-27 | BreadcrumbList、Article | 无 | 通过 |
| /articles/idle-vs-loaded-latency/ | 机场节点测速中的空载延迟与负载延迟是什么？｜机场节点 | 1497 | 8/0 | 3 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/iepl-iplc-bgp-differences/ | IEPL、IPLC与BGP究竟有什么区别？｜机场节点 | 1498 | 9/0 | 4 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/jitter-impact-on-use-cases/ | 机场节点抖动高会影响哪些使用场景？｜机场节点 | 1528 | 7/0 | 3 | 2026-10-27 / 2026-10-27 | BreadcrumbList、Article | 无 | 通过 |
| /articles/low-latency-not-fast-download/ | 为什么节点延迟低不代表下载速度快？｜机场节点 | 1581 | 9/0 | 4 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/online-rate-vs-stability/ | 节点在线率与节点真实稳定性有什么不同？｜机场节点 | 1484 | 8/0 | 5 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/singapore-node-speedtest-metrics/ | 新加坡节点测速：哪些数据可以说明线路质量？｜机场节点 | 1563 | 7/0 | 4 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/singapore-vs-us-nodes/ | 新加坡节点与美国节点应该怎样选择？｜机场节点 | 1612 | 8/0 | 4 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/traffic-multiplier-explained/ | 机场套餐的流量倍率应该如何计算？｜机场节点 | 1539 | 9/0 | 3 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /articles/why-nodes-slow-down-at-night/ | 为什么同一个机场节点晚上会变慢？｜机场节点 | 1499 | 7/0 | 4 | 2026-10-27 / 2026-10-27 | BreadcrumbList、Article | 无 | 通过 |
| /guides/clash-verge-latency-test/ | Clash Verge如何测试同一节点的延迟？｜机场节点 | 1589 | 9/0 | 4 | 2026-10-27 / 2026-10-27 | BreadcrumbList、Article | 无 | 通过 |
| /guides/seven-day-node-speed-log/ | 如何记录一个节点连续7天的速度变化？｜机场节点 | 1867 | 9/0 | 4 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |
| /guides/youtube-stats-for-nerds/ | YouTube Stats for nerds如何辅助判断节点视频播放表现？｜机场节点 | 1539 | 7/0 | 4 | 2026-10-27 / 2026-10-29 | BreadcrumbList、Article | 无 | 通过 |

## 已修复

1. 7 处“原始截图尚未挂载 / 标记为未核验 / 来源等级”等过时说法改为与站内现状一致的描述，并链接到已挂载原图的实测页：idle-vs-loaded-latency、low-latency-not-fast-download、online-rate-vs-stability、singapore-node-speedtest-metrics、how-to-choose-airport-nodes-2026、iepl-iplc-bgp-differences、singapore-vs-us-nodes、youtube-stats-for-nerds。
2. traffic-multiplier-explained、seven-day-node-speed-log、youtube-stats-for-nerds 补充相关内链（原来只有 2 个）。
3. 上述 10 篇的 modified 日期改为 2026-10-29，与实际修改一致。

## 剩余问题

无。各篇主题分工：选机场（按用途 / 2026 指南）、地区对比（港日、新美）、线路（IEPL/IPLC/BGP）、指标（空载 / 负载延迟、低延迟≠快、抖动、在线率、倍率）、测速方法（晚高峰、新加坡指标、晚上变慢）、教程（Clash Verge、7 天记录、YouTube 统计）。没有发现搜索意图完全相同的两篇。

**审核结果：16 篇全部通过。**
