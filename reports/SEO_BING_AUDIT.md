# Bing SEO 审核（2026-10-29）

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
