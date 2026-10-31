import json
T=json.load(open('reports/_tables.json'))
crawl=json.load(open('reports/crawl-result.json'))
art=json.load(open('reports/article-audit.json'))
brand=json.load(open('reports/brand-audit.json'))
DATE='2026-10-29'

FIXED = [
 ('P1','多家机场套餐价格与站长 2026-10-29 提供的官网截图不一致','src/data/official-2026-10-29.ts（新增）、src/data/brands.ts、src/data/source-registry.ts、scripts/validate-brands.ts','/airports/*、/plans/、首页机场卡片','对照官网截图逐家核对套餐表','FlyV、浪网整套换新；暮光、梯子云、光速云、极连云、唯兔云、星岛梦、全球云、光年梯、Sogo 云、宇宙云、二猫云、一翻云、EdgeNova、可信云、速界、快狸、灵猫、隐形人、飞猫云、U1S1 价格 / 流量 / 套餐名有出入，缺季付 / 半年付 / 年付','22 家整份套餐表按截图替换（前后矛盾处按卡片顶部大字），灵动云补齐季付 / 半年付 / 年付；线路、设备、协议、流媒体与 AI 一并更新；截图本身不保存、不发布；大佬云、微风、无忧、Firefly、跨界、闪跃、榴莲云、闪电云、环球云、神行云、云界云按站长指示保留原网页资料','已修复','validate-brands 全部通过；价格与站长 Excel 最低价逐家比对，仅 EdgeNova 的 ¥15 体验小包低于 Excel 记录的 ¥22 标准套餐（属于体验包，卡片仍显示 ¥22）'),
 ('P1','推广链接更新为站长 2026-10-29 提供的 34 条新链接','src/data/affiliates.ts、docs/source-material/affiliate-mapping-2026-10-29.txt（新增）、scripts/validate-affiliates.ts','全站推广按钮','逐字对照站长消息','微风、飞猫、大佬、无忧、全球云等多家 code 或域名已更换','34 条逐字替换，校验脚本改为与新清单逐字比对（域名、code、大小写）','已修复','validate-affiliates 5940+ 项通过；目录页 34 个推广按钮链接与新清单一一对应（e2e）'),
 ('P1','机场推荐排名按站长 2026-10-29 指定的顺序调整','src/data/brand-index.ts、src/data/brands/*.ts、docs/source-material/display-order-2026-10-29.txt（新增）、scripts/validate-brands.ts','首页卡片、目录、右侧推荐栏、页脚','对照站长给的前 14 名','原排名与站长最新要求不一致；前 14 名应为：灵动云、暮光加速、微风网络、飞猫云、大佬云、隐形人、梯子云、FlyV、浪网、无忧、Firefly、唯兔云、灵猫、全球云；其余保持原相对顺序','按新排名重排 BRAND_INDEX 与各品牌 displayRank，校验改为对照新的排名文件','已修复','validate-brands 顺序检查通过；e2e 目录顺序与 BRANDS 一致'),
 ('P1','第三方资料站名称出现在页面上','src/data/source-registry.ts；src/data/brands/{shenxingyun,lingmao,liulianyun,feimaoyun,xingdaomeng,firefly,sujie,kexinyun,wuyou,kuaili,shandianyun,muguangjiasu}.ts；src/data/third-party/{lingmao,xingdaomeng,kexinyun,kuaili}.ts','/sources/、/plans/、/airports/shenxingyun/、/airports/liulianyun/、/airports/huanqiuyun/、/airports/breezenet/、/airports/muguangjiasu/、/airports/lingmao/、/airports/kuaili/、/airports/wuyou/ 等','grep dist 查找“机场PK / 机场观察站 / JichangBest / jichangpk / guojiban / JC 机场推荐指南 / 机场云 JichangCloud / 机场推荐与测评站”','站长要求不公开第三方资料站名称，但来源标题、套餐备注、来源编号（tp-jichangpk-…、tp-guojiban-…）和 originUrl 仍把站名和域名渲染到页面','站名统一改为“第三方评测页 / 第三方对比站”；去掉第三方存档的 originUrl；来源编号改为 tp-2026-09-22-huanqiuti、tp-2026-10-20-breezenet（真实网址仍保存在 docs/INTERNAL_SOURCES.md）','已修复','重新构建后 grep dist（HTML / JSON / XML / CSV）以上 14 个关键词，命中 0'),
 ('P1','10 篇文章修改后 modified 日期未更新；全站“资料整理日期”停在 2026-10-27','src/content/articles/*.md（8 篇）、src/content/guides/{seven-day-node-speed-log,youtube-stats-for-nerds}.md、src/lib/site.ts','全部文章页、页脚','打开文章看 article:modified_time 与 sitemap lastmod','内容已改但日期没变，sitemap lastmod 不反映真实更新时间','modified 改为 2026-10-29；DATA_UPDATED 改为 2026-10-29','已修复','validate-seo：lastmod 与页面 modified 一致且不晚于今天，14867 项通过'),
 ('P1','文章里有过时、与站内实际不符的说法','src/content/articles/{idle-vs-loaded-latency,low-latency-not-fast-download,online-rate-vs-stability,singapore-node-speedtest-metrics,how-to-choose-airport-nodes-2026,iepl-iplc-bgp-differences,singapore-vs-us-nodes,traffic-multiplier-explained}.md、src/content/guides/youtube-stats-for-nerds.md','对应文章页','阅读文末“局限”段落','写着“原始截图尚未挂载 / 标记为未核验 / 来源等级”，但 2026-10-28 晚高峰原图已挂载，且站内已不显示来源等级','改为准确描述，并链接到晚高峰实测页和新加坡测速报告','已修复','audit-articles：16 篇 0 问题；validate-content 552 项通过'),
 ('P1','3 篇文章站内链接偏少（2 个）','src/content/articles/traffic-multiplier-explained.md、src/content/guides/{seven-day-node-speed-log,youtube-stats-for-nerds}.md','/articles/traffic-multiplier-explained/ 等','audit-articles 统计正文站内链接','少于 3 个相关内链，Bing 难以理解文章之间的关系','各补 1–2 个相关内链（机场页、分时段指南、线路文章）；保持在内容规则要求的 2–5 个目标以内','已修复','audit-articles 每篇 ≥3；validate-content 通过'),
 ('P1','地区页出现占位文字“待补充 / 名称待补充”和大量“资料核对中”标签','src/components/RegionBrandTable.astro','/regions/hong-kong/ 等 7 个地区页','打开任一地区页的机场表','每行显示“该地区数量与名称待补充”“资料备注”“资料核对中”，属于占位内容，影响观感与内容质量判断','表格改为：该地区节点数、节点说明（全站 N 个节点，以客户端列表为准）、线路、最低月付；去掉状态标签和来源备注','已修复','重新构建；full-crawl 75 页 0 失败；axe 98 项通过'),
 ('P2','地区页 Title / Description / 导语以“资料记录、来源等级”为主，不符合搜索意图','src/pages/regions/[slug].astro、src/data/regions.ts、src/pages/regions/index.astro','/regions/*','查看 <title> 与 meta description','Title 是“香港节点整理：34家机场有公开资料记录”，描述里是统计口径','Title 改为“香港节点推荐：34家机场的香港节点、线路与价格”；导语按用途重写','已修复','validate-seo：Title / Description 唯一、长度合规'),
 ('P2','搜索结果简介是内部口径（“资料卡｜资料核对中｜有公开资料记录（来源等级 C）”）','src/lib/search-index.ts、src/lib/search-core.ts、scripts/validate-search.ts、tests/e2e.ts','/search/、页头搜索下拉','搜“唯兔云”“IPLC”','用户看到的是内部审核术语','简介改为“月付低至 ¥19.9｜50+ 个节点”；命中地区或线路时写“提供IPLC”','已修复','search-terms 12 项通过；validate-search 1724 项通过；e2e 210 项通过'),
 ('P2','地图圆点和地区面板的无障碍文字仍是“公开资料有记录 / 待核验”','src/components/WorldMap.astro、src/scripts/map-explorer.ts、src/components/{MapExplorer,RegionPanel,RegionTable,RegionMiniMap}.astro','/','用读屏或查看 aria-label','术语与页面可见文字不一致','统一为“有该地区节点 / 资料补充中 / 未列出”；首次修改触发 axe label-content-name-mismatch，已调整为“香港：34 家机场提供节点…”','已修复','axe 98 项通过'),
 ('P2','套餐对比页备注里大量“与 2026-10-26 的第三方资料一致”','src/pages/plans.astro','/plans/','看套餐表“套餐”列小字','222 处来源说明挤占可读内容','备注经 userNote 过滤，只保留对购买有用的说明','已修复','/plans/ 可见文字“第三方”0 处；e2e 套餐对比 6 项通过'),
 ('P2','品牌页“服务公告”开头带“2026-10-20 的第三方资料：”','src/pages/airports/[slug].astro','/airports/*','查看“购买前须知”','来源前缀影响阅读','显示时去掉日期+来源前缀，正文不变','已修复','重新构建；full-crawl 通过'),
]

def issues_md(rows):
    out=''
    for i,(sev,title,files,url,repro,err,fix,res,ev) in enumerate(rows,1):
        out+=f"### {i}. [{sev}] {title}\n\n- **文件**：{files}\n- **页面**：{url}\n- **复现**：{repro}\n- **问题**：{err}\n- **修改**：{fix}\n- **结果**：{res}\n- **复测证据**：{ev}\n\n"
    return out

REMAIN = [
 ('提醒','部分官网截图本身有前后矛盾（如极连云、快狸的长期付比按月买贵，宇宙云家宽定制标“一次性”）','按站长指示照截图写入；极连云三档长期付加注“以官网结算页为准”','服务商改价后发新截图即可更新'),
 ('上线后验证','34 个推广链接的可达性','沙箱网络无法解析这些域名（同时 www.bing.com 也被拒绝连接），check-external-links 34 个全部“域名解析失败”，这是测试环境限制，不代表链接失效','上线后在正常网络运行 npm run check:external；失效时向服务商要新地址，不自行改写'),
 ('上线后验证','Bing 真实抓取与收录状态','本地无法访问 Bing Webmaster Tools','见 SEO_BING_AUDIT.md 第 6 节的上线后检查流程'),
 ('上线后验证','HTTP→HTTPS、www→非 www、/index.html→/ 的重定向','由托管平台（Cloudflare Pages 等）配置决定，静态构建无法自测','部署后用 curl -I 检查，要求 301 到 https://jichangjiedian.blog/ 规范地址'),
 ('P2','项目没有配置 ESLint','package.json 无 eslint 依赖与配置；代码质量由 tsc 严格类型检查 + 15 个自定义校验脚本保证','如需要可以另行加入 ESLint；本次不为通过检查而新增或禁用规则'),
]

summary=f"""| 项目 | 结果 |
|---|---|
| 实际发现页面（dist 内 HTML） | {crawl['pages']}（其中 sitemap 收录 73；/search/ 与 404 为 noindex，不入 sitemap） |
| 实际发现文章 | {art['count']}（研究文章 13 + 教程 3） |
| 机场品牌 | {brand['count']}（名称不重复 {brand['uniqueNames']}，每家都有独立详情页） |
| 实际检测的站内 URL | {crawl['internalUrls']}（含锚点目标逐个核对） |
| 站外链接 | {crawl['externalUrls']}（全部是推广链接，rel / target 已检查） |
| 全站爬行交互数 | {crawl['interactions']}（4 个视口打开 75 页 + 每个链接 + 每个按钮 / 下拉 / 输入框 + 关闭 JS + 后退 / 前进） |
| 爬行通过 / 失败 | {crawl['passed']} / {crawl['failed']} |
| 其他浏览器测试 | e2e 210 项、响应式与性能 148 项、axe 无障碍 98 项、中文搜索专项 12 项，全部通过 |
| 构建与校验 | npm run verify：typecheck、品牌 4279、推广链接 5940、证据 2037、SEO 14867、站内链接 41422、内容 552、搜索 1724、安全 200255，全部通过 |
| 依赖安全 | npm audit：0 个漏洞 |
| Lighthouse（实验室数据） | 首页移动端性能 100（TBT 10–20ms，LCP 1.2s），首页与机场页桌面端 100/100/100/100；其余 5 个抽测页面移动端四项 100；CLS 0。背景地球只在 ≥768px 宽屏、页面空闲后加载 |
| 修复 | {len(FIXED)} 项（P1 8 项、P2 5 项），全部复测通过 |
| 尚未解决 | P0 / P1 为 0；上线后验证 3 项、P2 1 项（ESLint 未配置）、提醒 1 项 |
| 移动端（375 / 390 / 768） | 75 页 × 3 视口无横向溢出、无 JS 错误 |
"""

open('reports/PRE_LAUNCH_AUDIT.md','w').write(f"""# 上线前全站审计报告（{DATE}）

审计范围：本地项目 `jichangjiedian-blog`（Astro 7 静态站，SSG 预渲染，正式域名 https://jichangjiedian.blog/）。只修改和测试本地项目，**没有部署、推送、提交 IndexNow 或访问任何生产服务**。

## 上线结论

**PASS：允许上线**

第一轮审计（同日）结论为 FAIL，唯一原因是多家机场价格与官网最新截图不一致。站长指示按截图更新后，价格、推广链接与推荐排名已全部更新，并重新执行了完整回归：生产构建、15 项校验、e2e、响应式、无障碍、中文搜索专项和全站逐页爬行，全部通过。P0、P1 均为 0。

仍需上线后验证的项目（推广链接可达性、Bing 实际收录、跳转规则）见 REMAINING_ISSUES.md，它们无法在本地测试环境完成，不属于已知缺陷。

## 全站统计

{summary}

## 技术栈与结构（实际扫描结果）

- 框架：Astro 7（全部页面构建时预渲染为静态 HTML），TypeScript 严格模式，内容集合（Markdown）管理文章与教程。
- 路由：首页、`/airports/`（34 家详情页 + 灵动云 2 个实测报告页）、`/regions/`（7 个地区页）、`/articles/`（13 篇）、`/guides/`（3 篇）、`/plans/`、`/routes/`、`/time-tests/`、`/test-records/`、`/sources/`、`/testing-methodology/`、`/about/`、`/affiliate-disclosure/`、`/privacy/`、`/search/`、`/404.html`，以及 `sitemap.xml`、`robots.txt`、`search-index.json`、测试记录 CSV。
- 交互：全球地图（地区选择、品牌 / 线路 / 资料状态筛选、缩放重置）、机场目录筛选、套餐对比筛选排序、分时段记录浏览器、站内搜索（页头下拉 + 搜索页）、右侧机场推荐栏、页脚 40+ 链接。
- 数据：34 家品牌资料（src/data/brands/）、站长 Excel 价格与节点、测试记录与证据图、来源登记表。

## 问题明细（已修复）

{issues_md(FIXED)}
## 未解决与上线后验证

见 `REMAINING_ISSUES.md`。

## 本次新增的审计工具（可重复运行）

- `tests/full-crawl.ts`：全站逐页爬行（4 视口、全部链接 / 按钮 / 下拉 / 输入框、关闭 JS、后退 / 前进），结果写入 `reports/crawl-result.json`。
- `tests/search-terms.ts`：中文搜索专项（含空结果与索引加载失败）。
- `scripts/audit-articles.ts`：逐篇文章审核（Title、Description、H1、层级、字数、重复段落、跨文章相似度、占位文字、第三方站名、内链、图片 alt、日期、JSON-LD）。
- `scripts/audit-brands.ts`：34 家机场资料逐家检查，并核对地图 / 地区页数量与品牌资料一致。
""")

open('reports/ARTICLE_AUDIT.md','w').write(f"""# 文章逐篇审核（{DATE}）

共 {art['count']} 篇（研究文章 13、教程 3），每篇读取构建后的完整 HTML 正文检查，不只看标题。

## 检查方法

- **标题与主题**：Title、H1 唯一；Title 15–70 字、Description 50–160 字；没有重复 Title / Description / H1。
- **正文质量**：正文字数、文内重复段落、跨文章完全相同段落、占位文字（待补充、Lorem、TODO、undefined、NaN 等）、第三方资料站名称。
- **主题差异化**：任意两篇正文按 12 字片段计算 Jaccard 相似度，阈值 8%：**没有任何一对超过阈值**，没有“只换品牌名或地区名”的重复文章。
- **SEO**：H2 / H3 层级不跳级、站内链接 ≥3（内容规则上限 5 个不同目标）、图片 alt、Article 结构化数据、发布 / 修改日期合理且不在未来。
- **人工通读**：逐篇核对与站内现状矛盾的说法（见下方“已修复”）。

## 审核表

{T['a']}
## 已修复

1. 7 处“原始截图尚未挂载 / 标记为未核验 / 来源等级”等过时说法改为与站内现状一致的描述，并链接到已挂载原图的实测页：idle-vs-loaded-latency、low-latency-not-fast-download、online-rate-vs-stability、singapore-node-speedtest-metrics、how-to-choose-airport-nodes-2026、iepl-iplc-bgp-differences、singapore-vs-us-nodes、youtube-stats-for-nerds。
2. traffic-multiplier-explained、seven-day-node-speed-log、youtube-stats-for-nerds 补充相关内链（原来只有 2 个）。
3. 上述 10 篇的 modified 日期改为 2026-10-29，与实际修改一致。

## 剩余问题

无。各篇主题分工：选机场（按用途 / 2026 指南）、地区对比（港日、新美）、线路（IEPL/IPLC/BGP）、指标（空载 / 负载延迟、低延迟≠快、抖动、在线率、倍率）、测速方法（晚高峰、新加坡指标、晚上变慢）、教程（Clash Verge、7 天记录、YouTube 统计）。没有发现搜索意图完全相同的两篇。

**审核结果：16 篇全部通过。**
""")

open('reports/LINK_AND_INTERACTION_TEST.md','w').write(f"""# 链接与交互测试（{DATE}）

全部在本地静态服务器上用 Playwright（Chromium）真实打开和点击；测试中拦截一切站外请求。

## 结果汇总

| 测试 | 项数 | 结果 |
|---|---|---|
| 全站爬行（tests/full-crawl.ts） | {crawl['interactions']} | {crawl['passed']} 通过 / {crawl['failed']} 失败 |
| 端到端（tests/e2e.ts） | 210 | 全部通过 |
| 响应式与性能（tests/mobile.ts） | 148 | 全部通过 |
| 无障碍 axe WCAG A/AA（tests/a11y.ts） | 98 | 全部通过 |
| 中文搜索专项（tests/search-terms.ts） | 12 | 全部通过 |
| 站内链接静态校验（validate-links） | 41422 | 全部通过 |

## 全站爬行覆盖内容

- 75 个页面 × 4 个视口（375 / 390 / 768 / 1440）打开：状态码、H1 数量、横向溢出、控制台错误、站外请求。
- 1440 视口下每页的**全部链接**：站内链接逐个请求确认 200；带锚点的链接确认目标 id 存在；空链接与无文字链接判失败；站外链接检查 `target=_blank` 与 `rel` 含 `noopener`（推广链接另含 `sponsored nofollow`）。
- 每页**全部可见按钮**逐个点击（地图地区、筛选、重置、搜索、折叠、返回顶部等），点击后无 JS 错误；**全部下拉框**依次选第 2 项、最后一项、恢复默认；**全部输入框**输入“灵动”再清空。
- **关闭 JavaScript** 打开每页：H1 存在，正文最少 806 字（/search/ 与 404 除外）——Bing 不执行脚本也能读到标题、正文、地区和品牌信息。
- 8 个入口页各抽 6 个链接真实点击，并测试浏览器**后退 / 前进**都回到正确页面。
- 说明：首页地图圆点和地区切换标签在有 JS 时是“选中地区并在右侧显示机场”，不跳转（无 JS 时才跳转到地区页），这是设计行为，不计入跳转测试。

## 中文搜索

{T['s']}
## 逐页结果

{T['c']}
## 发现并修复的交互问题

- 地图圆点 aria-label 与可见文字不一致（axe label-content-name-mismatch，修改措辞时引入），已修复并复测通过。
- 其他交互（导航、地图、筛选、搜索、分页、套餐对比、记录浏览器、证据图片、返回顶部）未发现无效按钮或空白链接。
""")

open('reports/SEO_BING_AUDIT.md','w').write(f"""# Bing SEO 审核（{DATE}）

依据 Bing Webmaster Guidelines 的公开要点（可抓取、可索引、内容质量、不使用欺骗手段）。本地无法确认真实 Bingbot 抓取与收录，相关项目标为“上线后验证”。**不承诺任何收录时间或排名。**

## 1. 索引与抓取

| 检查项 | 结果 |
|---|---|
| robots.txt | `User-agent: * / Allow: /`，声明 `Sitemap: https://jichangjiedian.blog/sitemap.xml`，没有阻断 Bingbot |
| sitemap.xml | 73 个 URL，全部 200、可索引、canonical 指向自身；不含 /search/、404、noindex 页 |
| lastmod | 取页面真实修改日期（本次修改过的 10 篇文章与资料页已更新为 2026-10-29），不晚于今天 |
| Canonical | 全部页面有且只有一个，指向 https://jichangjiedian.blog/ 下的规范地址（结尾斜杠统一） |
| noindex | 仅 /search/ 与 404；其余 73 页无 noindex、无 X-Robots-Tag |
| 34 家机场页 | 全部可索引（此前 32 家为 noindex，已在本轮之前开放），均在 sitemap 中 |
| HTML 链接可发现性 | 每个页面都有导航、页脚 40+ 链接和右侧推荐栏链接，全部为普通 `<a href>`，不依赖 JS |
| 筛选参数 URL | 筛选状态只在页面内切换，不生成可抓取的参数 URL；/search/?q= 页面 noindex |
| 重定向 / www / HTTPS / index.html | 静态构建无重定向；由托管平台配置 → **上线后验证** |

## 2. 页面 SEO

- 75 个页面 Title、Description **全部唯一**，H1 每页一个；validate-seo 14867 项检查通过。
- 结构化数据类型：WebSite、Organization、BreadcrumbList、CollectionPage、Article（文章与报告）、FAQPage（首页与 34 家机场页，问答内容与页面可见 FAQ 一致）。全部可解析。
- Open Graph：每页有 og:title / og:description / og:image / og:url。
- 地区页 Title 已从“香港节点整理：34家机场有公开资料记录”改为“香港节点推荐：34家机场的香港节点、线路与价格”，Description 改为按用途写的导语。
- 没有 Soft 404：最短的可索引页面关闭 JS 后仍有 806 字正文。

## 3. JavaScript 抓取风险

全站为 SSG 预渲染，所有标题、正文、机场卡片、价格、节点、地区表格都在初始 HTML 里；地图是增强功能，地图里的地区与机场数量同时以普通表格和链接形式输出。关闭 JS 的逐页测试全部通过。

## 4. 内容质量

- 没有隐藏文字、关键词堆砌、门页或不同版本内容；页脚链接是真实的站内导航。
- 推广链接全部带 `rel="sponsored nofollow noopener noreferrer"`，并有合作推广声明页。
- 没有虚构评分或评价；测速数据只有站长提供原图的灵动云实测，其他机场不标“已实测”。
- 第三方资料站名称已从页面全部移除（来源网址仅保存在内部文档 docs/INTERNAL_SOURCES.md）。
- 16 篇文章两两相似度均低于 8%，没有替换词式重复文章。

## 5. Bing 专项上线准备

| 项目 | 状态 |
|---|---|
| IndexNow key 文件 | `public/763619a65ef7f3cb05f08f551c5ff48e.txt`，文件名与内容一致 |
| IndexNow 提交脚本 | `npm run indexnow` 默认演练，不发请求；只提交 sitemap 内、lastmod 变化的 URL；提交前先在线确认 key 文件 |
| Bing 站点验证 | 支持 `PUBLIC_BING_SITE_VERIFICATION` 环境变量输出 msvalidate.01 meta，或用文件 / DNS 验证（docs/DEPLOYMENT.md） |
| 安全头 | CSP、X-Frame-Options、HSTS 等在 public/_headers；不含屏蔽爬虫的规则 |
| Cloudflare | 若使用，需确认 Bot Fight Mode / WAF 不拦截 Bingbot，缓存不缓存 404 → **上线后验证** |

## 6. 上线后检查流程（需站长执行）

1. 部署后 `curl -I` 检查 http→https、www→非 www 都是 301 到规范地址，`/index.html` 不单独可访问或 canonical 指回 `/`。
2. Bing Webmaster Tools 添加站点并验证，提交 `https://jichangjiedian.blog/sitemap.xml`。
3. `npm run indexnow -- --all --submit` 首次提交；以后只在内容变化后运行 `npm run indexnow -- --submit`。
4. 用 URL Inspection 检查首页、`/airports/lingdongyun/`、一篇文章、一个地区页的 Live URL 渲染结果。
5. 一周后运行 Site Scan，查看抓取错误与 SEO 提示。
6. 运行 `npm run check:external` 确认 34 个推广链接可达（本次沙箱无法访问外网）。
""")

open('reports/REMAINING_ISSUES.md','w').write(f"""# 尚未解决的问题（{DATE}）

| 严重程度 | 问题 | 原因 / 现状 | 处理方法 |
|---|---|---|---|
""" + ''.join(f"| {a} | {b} | {c} | {d} |\n" for a,b,c,d in REMAIN) + f"""
## 34 家机场资料现状

所有机场都有独立详情页、节点数、节点地区、线路和最低月付价格；地图与地区页数量和品牌资料一致（不一致 0 处）。本站实测只有灵动云（6 条，附原图或站长截图）；其他机场没有被标为“已实测”。

{T['b']}
""")
print('ok')
