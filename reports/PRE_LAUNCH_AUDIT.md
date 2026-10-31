# 上线前全站审计报告（2026-10-29）

审计范围：本地项目 `jichangjiedian-blog`（Astro 7 静态站，SSG 预渲染，正式域名 https://jichangjiedian.blog/）。只修改和测试本地项目，**没有部署、推送、提交 IndexNow 或访问任何生产服务**。

## 上线结论

**PASS：允许上线**

第一轮审计（同日）结论为 FAIL，唯一原因是多家机场价格与官网最新截图不一致。站长指示按截图更新后，价格、推广链接与推荐排名已全部更新，并重新执行了完整回归：生产构建、15 项校验、e2e、响应式、无障碍、中文搜索专项和全站逐页爬行，全部通过。P0、P1 均为 0。

仍需上线后验证的项目（推广链接可达性、Bing 实际收录、跳转规则）见 REMAINING_ISSUES.md，它们无法在本地测试环境完成，不属于已知缺陷。

## 全站统计

| 项目 | 结果 |
|---|---|
| 实际发现页面（dist 内 HTML） | 75（其中 sitemap 收录 73；/search/ 与 404 为 noindex，不入 sitemap） |
| 实际发现文章 | 16（研究文章 13 + 教程 3） |
| 机场品牌 | 34（名称不重复 34，每家都有独立详情页） |
| 实际检测的站内 URL | 84（含锚点目标逐个核对） |
| 站外链接 | 34（全部是推广链接，rel / target 已检查） |
| 全站爬行交互数 | 11107（4 个视口打开 75 页 + 每个链接 + 每个按钮 / 下拉 / 输入框 + 关闭 JS + 后退 / 前进） |
| 爬行通过 / 失败 | 11107 / 0 |
| 其他浏览器测试 | e2e 210 项、响应式与性能 148 项、axe 无障碍 98 项、中文搜索专项 12 项，全部通过 |
| 构建与校验 | npm run verify：typecheck、品牌 4279、推广链接 5940、证据 2037、SEO 14867、站内链接 41422、内容 552、搜索 1724、安全 200255，全部通过 |
| 依赖安全 | npm audit：0 个漏洞 |
| Lighthouse（实验室数据） | 首页移动端性能 100（TBT 10–20ms，LCP 1.2s），首页与机场页桌面端 100/100/100/100；其余 5 个抽测页面移动端四项 100；CLS 0。背景地球只在 ≥768px 宽屏、页面空闲后加载 |
| 修复 | 13 项（P1 8 项、P2 5 项），全部复测通过 |
| 尚未解决 | P0 / P1 为 0；上线后验证 3 项、P2 1 项（ESLint 未配置）、提醒 1 项 |
| 移动端（375 / 390 / 768） | 75 页 × 3 视口无横向溢出、无 JS 错误 |


## 技术栈与结构（实际扫描结果）

- 框架：Astro 7（全部页面构建时预渲染为静态 HTML），TypeScript 严格模式，内容集合（Markdown）管理文章与教程。
- 路由：首页、`/airports/`（34 家详情页 + 灵动云 2 个实测报告页）、`/regions/`（7 个地区页）、`/articles/`（13 篇）、`/guides/`（3 篇）、`/plans/`、`/routes/`、`/time-tests/`、`/test-records/`、`/sources/`、`/testing-methodology/`、`/about/`、`/affiliate-disclosure/`、`/privacy/`、`/search/`、`/404.html`，以及 `sitemap.xml`、`robots.txt`、`search-index.json`、测试记录 CSV。
- 交互：全球地图（地区选择、品牌 / 线路 / 资料状态筛选、缩放重置）、机场目录筛选、套餐对比筛选排序、分时段记录浏览器、站内搜索（页头下拉 + 搜索页）、右侧机场推荐栏、页脚 40+ 链接。
- 数据：34 家品牌资料（src/data/brands/）、站长 Excel 价格与节点、测试记录与证据图、来源登记表。

## 问题明细（已修复）

### 1. [P1] 多家机场套餐价格与站长 2026-10-29 提供的官网截图不一致

- **文件**：src/data/official-2026-10-29.ts（新增）、src/data/brands.ts、src/data/source-registry.ts、scripts/validate-brands.ts
- **页面**：/airports/*、/plans/、首页机场卡片
- **复现**：对照官网截图逐家核对套餐表
- **问题**：FlyV、浪网整套换新；暮光、梯子云、光速云、极连云、唯兔云、星岛梦、全球云、光年梯、Sogo 云、宇宙云、二猫云、一翻云、EdgeNova、可信云、速界、快狸、灵猫、隐形人、飞猫云、U1S1 价格 / 流量 / 套餐名有出入，缺季付 / 半年付 / 年付
- **修改**：22 家整份套餐表按截图替换（前后矛盾处按卡片顶部大字），灵动云补齐季付 / 半年付 / 年付；线路、设备、协议、流媒体与 AI 一并更新；截图本身不保存、不发布；大佬云、微风、无忧、Firefly、跨界、闪跃、榴莲云、闪电云、环球云、神行云、云界云按站长指示保留原网页资料
- **结果**：已修复
- **复测证据**：validate-brands 全部通过；价格与站长 Excel 最低价逐家比对，仅 EdgeNova 的 ¥15 体验小包低于 Excel 记录的 ¥22 标准套餐（属于体验包，卡片仍显示 ¥22）

### 2. [P1] 推广链接更新为站长 2026-10-29 提供的 34 条新链接

- **文件**：src/data/affiliates.ts、docs/source-material/affiliate-mapping-2026-10-29.txt（新增）、scripts/validate-affiliates.ts
- **页面**：全站推广按钮
- **复现**：逐字对照站长消息
- **问题**：微风、飞猫、大佬、无忧、全球云等多家 code 或域名已更换
- **修改**：34 条逐字替换，校验脚本改为与新清单逐字比对（域名、code、大小写）
- **结果**：已修复
- **复测证据**：validate-affiliates 5940+ 项通过；目录页 34 个推广按钮链接与新清单一一对应（e2e）

### 3. [P1] 机场推荐排名按站长 2026-10-29 指定的顺序调整

- **文件**：src/data/brand-index.ts、src/data/brands/*.ts、docs/source-material/display-order-2026-10-29.txt（新增）、scripts/validate-brands.ts
- **页面**：首页卡片、目录、右侧推荐栏、页脚
- **复现**：对照站长给的前 14 名
- **问题**：原排名与站长最新要求不一致；前 14 名应为：灵动云、暮光加速、微风网络、飞猫云、大佬云、隐形人、梯子云、FlyV、浪网、无忧、Firefly、唯兔云、灵猫、全球云；其余保持原相对顺序
- **修改**：按新排名重排 BRAND_INDEX 与各品牌 displayRank，校验改为对照新的排名文件
- **结果**：已修复
- **复测证据**：validate-brands 顺序检查通过；e2e 目录顺序与 BRANDS 一致

### 4. [P1] 第三方资料站名称出现在页面上

- **文件**：src/data/source-registry.ts；src/data/brands/{shenxingyun,lingmao,liulianyun,feimaoyun,xingdaomeng,firefly,sujie,kexinyun,wuyou,kuaili,shandianyun,muguangjiasu}.ts；src/data/third-party/{lingmao,xingdaomeng,kexinyun,kuaili}.ts
- **页面**：/sources/、/plans/、/airports/shenxingyun/、/airports/liulianyun/、/airports/huanqiuyun/、/airports/breezenet/、/airports/muguangjiasu/、/airports/lingmao/、/airports/kuaili/、/airports/wuyou/ 等
- **复现**：grep dist 查找“机场PK / 机场观察站 / JichangBest / jichangpk / guojiban / JC 机场推荐指南 / 机场云 JichangCloud / 机场推荐与测评站”
- **问题**：站长要求不公开第三方资料站名称，但来源标题、套餐备注、来源编号（tp-jichangpk-…、tp-guojiban-…）和 originUrl 仍把站名和域名渲染到页面
- **修改**：站名统一改为“第三方评测页 / 第三方对比站”；去掉第三方存档的 originUrl；来源编号改为 tp-2026-09-22-huanqiuti、tp-2026-10-20-breezenet（真实网址仍保存在 docs/INTERNAL_SOURCES.md）
- **结果**：已修复
- **复测证据**：重新构建后 grep dist（HTML / JSON / XML / CSV）以上 14 个关键词，命中 0

### 5. [P1] 10 篇文章修改后 modified 日期未更新；全站“资料整理日期”停在 2026-10-27

- **文件**：src/content/articles/*.md（8 篇）、src/content/guides/{seven-day-node-speed-log,youtube-stats-for-nerds}.md、src/lib/site.ts
- **页面**：全部文章页、页脚
- **复现**：打开文章看 article:modified_time 与 sitemap lastmod
- **问题**：内容已改但日期没变，sitemap lastmod 不反映真实更新时间
- **修改**：modified 改为 2026-10-29；DATA_UPDATED 改为 2026-10-29
- **结果**：已修复
- **复测证据**：validate-seo：lastmod 与页面 modified 一致且不晚于今天，14867 项通过

### 6. [P1] 文章里有过时、与站内实际不符的说法

- **文件**：src/content/articles/{idle-vs-loaded-latency,low-latency-not-fast-download,online-rate-vs-stability,singapore-node-speedtest-metrics,how-to-choose-airport-nodes-2026,iepl-iplc-bgp-differences,singapore-vs-us-nodes,traffic-multiplier-explained}.md、src/content/guides/youtube-stats-for-nerds.md
- **页面**：对应文章页
- **复现**：阅读文末“局限”段落
- **问题**：写着“原始截图尚未挂载 / 标记为未核验 / 来源等级”，但 2026-10-28 晚高峰原图已挂载，且站内已不显示来源等级
- **修改**：改为准确描述，并链接到晚高峰实测页和新加坡测速报告
- **结果**：已修复
- **复测证据**：audit-articles：16 篇 0 问题；validate-content 552 项通过

### 7. [P1] 3 篇文章站内链接偏少（2 个）

- **文件**：src/content/articles/traffic-multiplier-explained.md、src/content/guides/{seven-day-node-speed-log,youtube-stats-for-nerds}.md
- **页面**：/articles/traffic-multiplier-explained/ 等
- **复现**：audit-articles 统计正文站内链接
- **问题**：少于 3 个相关内链，Bing 难以理解文章之间的关系
- **修改**：各补 1–2 个相关内链（机场页、分时段指南、线路文章）；保持在内容规则要求的 2–5 个目标以内
- **结果**：已修复
- **复测证据**：audit-articles 每篇 ≥3；validate-content 通过

### 8. [P1] 地区页出现占位文字“待补充 / 名称待补充”和大量“资料核对中”标签

- **文件**：src/components/RegionBrandTable.astro
- **页面**：/regions/hong-kong/ 等 7 个地区页
- **复现**：打开任一地区页的机场表
- **问题**：每行显示“该地区数量与名称待补充”“资料备注”“资料核对中”，属于占位内容，影响观感与内容质量判断
- **修改**：表格改为：该地区节点数、节点说明（全站 N 个节点，以客户端列表为准）、线路、最低月付；去掉状态标签和来源备注
- **结果**：已修复
- **复测证据**：重新构建；full-crawl 75 页 0 失败；axe 98 项通过

### 9. [P2] 地区页 Title / Description / 导语以“资料记录、来源等级”为主，不符合搜索意图

- **文件**：src/pages/regions/[slug].astro、src/data/regions.ts、src/pages/regions/index.astro
- **页面**：/regions/*
- **复现**：查看 <title> 与 meta description
- **问题**：Title 是“香港节点整理：34家机场有公开资料记录”，描述里是统计口径
- **修改**：Title 改为“香港节点推荐：34家机场的香港节点、线路与价格”；导语按用途重写
- **结果**：已修复
- **复测证据**：validate-seo：Title / Description 唯一、长度合规

### 10. [P2] 搜索结果简介是内部口径（“资料卡｜资料核对中｜有公开资料记录（来源等级 C）”）

- **文件**：src/lib/search-index.ts、src/lib/search-core.ts、scripts/validate-search.ts、tests/e2e.ts
- **页面**：/search/、页头搜索下拉
- **复现**：搜“唯兔云”“IPLC”
- **问题**：用户看到的是内部审核术语
- **修改**：简介改为“月付低至 ¥19.9｜50+ 个节点”；命中地区或线路时写“提供IPLC”
- **结果**：已修复
- **复测证据**：search-terms 12 项通过；validate-search 1724 项通过；e2e 210 项通过

### 11. [P2] 地图圆点和地区面板的无障碍文字仍是“公开资料有记录 / 待核验”

- **文件**：src/components/WorldMap.astro、src/scripts/map-explorer.ts、src/components/{MapExplorer,RegionPanel,RegionTable,RegionMiniMap}.astro
- **页面**：/
- **复现**：用读屏或查看 aria-label
- **问题**：术语与页面可见文字不一致
- **修改**：统一为“有该地区节点 / 资料补充中 / 未列出”；首次修改触发 axe label-content-name-mismatch，已调整为“香港：34 家机场提供节点…”
- **结果**：已修复
- **复测证据**：axe 98 项通过

### 12. [P2] 套餐对比页备注里大量“与 2026-10-26 的第三方资料一致”

- **文件**：src/pages/plans.astro
- **页面**：/plans/
- **复现**：看套餐表“套餐”列小字
- **问题**：222 处来源说明挤占可读内容
- **修改**：备注经 userNote 过滤，只保留对购买有用的说明
- **结果**：已修复
- **复测证据**：/plans/ 可见文字“第三方”0 处；e2e 套餐对比 6 项通过

### 13. [P2] 品牌页“服务公告”开头带“2026-10-20 的第三方资料：”

- **文件**：src/pages/airports/[slug].astro
- **页面**：/airports/*
- **复现**：查看“购买前须知”
- **问题**：来源前缀影响阅读
- **修改**：显示时去掉日期+来源前缀，正文不变
- **结果**：已修复
- **复测证据**：重新构建；full-crawl 通过


## 未解决与上线后验证

见 `REMAINING_ISSUES.md`。

## 本次新增的审计工具（可重复运行）

- `tests/full-crawl.ts`：全站逐页爬行（4 视口、全部链接 / 按钮 / 下拉 / 输入框、关闭 JS、后退 / 前进），结果写入 `reports/crawl-result.json`。
- `tests/search-terms.ts`：中文搜索专项（含空结果与索引加载失败）。
- `scripts/audit-articles.ts`：逐篇文章审核（Title、Description、H1、层级、字数、重复段落、跨文章相似度、占位文字、第三方站名、内链、图片 alt、日期、JSON-LD）。
- `scripts/audit-brands.ts`：34 家机场资料逐家检查，并核对地图 / 地区页数量与品牌资料一致。
