# 上线前全站审计报告（2026-10-31）

审计范围：本地项目 `jichangjiedian-blog`（Astro 7 静态站，正式域名 https://jichangjiedian.blog/）。只读取和测试本地项目，**没有部署、没有提交 IndexNow、没有访问 Bing 或生产服务器**。完整版（含逐篇文章审计表、各阶段检查表）见项目文档《机场节点 上线前全站审计报告（2026-10-31）》。

## 结论：修复后上线

P0 为 0；P1 共 7 项（4 项文章事实/口径、1 项品牌页 FAQ 措辞、2 项上线配置）；P2 9 项；P3 2 项。区分三件事：**技术可索引**（本次确认就绪）、**已被 Bing 抓取**、**已被 Bing 收录**（后两者只能上线后在 Bing Webmaster Tools 里看，不能保证）。

## 全站统计

| 项目 | 结果 |
|---|---|
| 页面 | 75（sitemap 73；/search/ 与 404 为 noindex） |
| 文章 | 16（研究文章 13 + 教程 3），正文约 49,700 字符 |
| 机场品牌 | 34，名称不重复，地区数量与地图一致 |
| 构建与校验 | npm run verify 全部通过（品牌 5525、推广链接 6424、证据 2037、SEO 15347、站内链接 44219、内容 626、搜索 1732、安全 263397 项） |
| 浏览器测试 | e2e 210 项、axe 98 项通过；全站爬行 75 页 / 11,108 次交互 0 失败；手机端 5 组通过、INP 实验室 1 组未达标 |
| 依赖漏洞 | npm audit 0 |
| Lighthouse（本机） | 桌面：首页 100 / 品牌页 100 / 文章 100 / 套餐页 96；手机：首页 92 / 品牌页 99 / 文章 100 / 套餐页 45–58（改版前 51–60） |
| SEO 不变量（改版前后） | 75 页 title / description / canonical / robots / og / H1 / JSON-LD / 链接 / 正文 / sitemap / robots.txt 0 差异 |

## 上线前必须修复清单（按优先级）

| 级别 | 问题 | 位置 | 建议 |
|---|---|---|---|
| P1 | 文章自称“本站还没有晚高峰记录”，与 10-28 三地晚高峰实测矛盾 | src/content/articles/how-to-speedtest-at-peak-hours.md 局限第 4 条 | 改为“本站有 2026-10-28 三地各一次的晚高峰记录，单次不构成统计结论”，更新 modified |
| P1 | “高约 9 到 14 毫秒”与自身表格（上海 15 ms）矛盾 | src/content/articles/singapore-vs-us-nodes.md | 改为 9–15 |
| P1 | “美国的延迟接近物理距离的下限”站不住（测速节点是盐湖城，测试者城市未记录） | 同上 | 改写为“与理论下限相差不多，但测试者所在城市未记录，不能据此判断线路优劣”；frontmatter 补 brands |
| P1 | 标题点名 Clash Verge，正文没有 Verge 专属操作 | src/content/guides/clash-verge-latency-test.md | 加一节 Verge 里的具体位置（标注版本），或改标题 |
| P1 | 34 个品牌页 FAQ 统一写“可以。站长日常使用中…都标注为稳定”，但除灵动云外没有测试记录；依据只是站长表格的黄色标注 | src/lib/brand-pitch.ts 第 80 行 | 改为“站长在使用记录表里把…标注为稳定，没有附测试记录；以实际试用为准” |
| P1 | Bing 站点验证码未配置 | .env / 托管平台环境变量 PUBLIC_BING_SITE_VERIFICATION | 取得验证码后设置并重新构建，或用 DNS / 文件验证 |
| P1 | HTTPS、www→非 www、/index.html→/ 的 301 跳转由托管平台决定，本地无法验证 | 部署平台 | 部署后 curl -I 逐条核对 |
| P2 | 四篇文章共用同一组未核验、无日期的新加坡测速数字，未标注“未核验” | idle-vs-loaded-latency、low-latency-not-fast-download、jitter-impact-on-use-cases、singapore-node-speedtest-metrics | 括注“未核验原图”；可改用 10-28 已核验数据 |
| P2 | 34 个品牌页“适合谁 / 常见问题”完全模板化（两两相似度中位 0.25，最高 0.415） | src/lib/brand-pitch.ts | 至少给主推与前 7 家写独有编辑说明（只写有依据的差异） |
| P2 | 7 个地区页结构与表格高度相似（最高 0.614） | src/pages/regions/[slug].astro | 每页首段写该地区独有的使用建议与资料状况 |
| P2 | 文章之间模块化段落反复出现（用途→指标 4 次、1 ms/100 km 2 次、线路标签只当线索 3 次、丢包别写 0% 3 次） | 见完整报告 | 每个观点保留一篇主文，其余改一句引用 + 内链 |
| P2 | 站内口径不一致：测延迟“十次” vs “三十次”；上海—香港 1200 vs 1230 km | how-to-speedtest / jitter；how-to-choose / hong-kong-vs-japan | 统一 |
| P2 | 局限“不展示虚构示例”与正文“假设数字示例”矛盾 | src/content/guides/seven-day-node-speed-log.md | 改措辞 |
| P2 | 套餐对比页手机端性能弱（LCP ≈ 5 s，557 行表格） | /plans/ | 分页或按需渲染 |
| P2 | 手机端 INP 实验室测试“首页点地区”中位 208–260 ms（阈值 200；改版前 180–210） | tests/mobile.ts | 上线后用真机 / CrUX 判断；必要时手机端关闭星云图 |
| P2 | 三张原始截图未挂载 | public/evidence/lingdongyun/ | 站长补原图 |
| P3 | 硬编码“34 家”、重复 /routes/ 链接、两处强塞内链、“每家都写了线路类型”偏绝对 | 见完整报告 | 微调 |
| P3 | 未配置 ESLint | package.json | 可后续加入 |

## 无法验证（标注，不猜测）

HTTP→HTTPS 与 www 跳转；Cloudflare WAF / 机器人挑战对 Bingbot 的影响；服务器日志中的 Bingbot 请求；Bing 实际抓取与收录；34 个推广链接可达性（沙箱无法解析域名）；全网原创性查重；真机 Core Web Vitals。

## 上线后顺序

部署 → curl -I 核对跳转与响应头 → Bing Webmaster Tools 验证并提交 sitemap → `npm run indexnow -- --all --submit`（一次） → `npm run check:external` → 在“URL 检查”里观察抓取与索引状态。提交不等于收录。
