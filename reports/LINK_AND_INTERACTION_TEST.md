# 链接与交互测试（2026-10-29）

全部在本地静态服务器上用 Playwright（Chromium）真实打开和点击；测试中拦截一切站外请求。

## 结果汇总

| 测试 | 项数 | 结果 |
|---|---|---|
| 全站爬行（tests/full-crawl.ts） | 11107 | 11107 通过 / 0 失败 |
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

| 搜索词 | 结果 | 前 3 条 | 判定 |
|---|---|---|---|
| 灵动云 | 找到 4 条与“灵动云”相关的内容。 | 灵动云月付低至 ¥20｜57 个节点｜本站主推 / 新加坡节点测速：哪些数据可以说明线路质量？以本站的灵动云新加 / 灵动云新加坡节点测速报告新加坡节点晚高峰复测、此前一次测速、 | 通过 |
| 暮光加速 | 找到 1 条与“暮光加速”相关的内容。 | 暮光加速月付低至 ¥20｜55 个节点 | 通过 |
| 香港节点 | 找到 37 条与“香港节点”相关的内容。 | 香港节点香港节点离大陆最近，延迟最低，适合日常上网、刷短视频 / 香港节点与日本节点在实际使用中有什么不同？香港与日本节点常被 / 灵动云晚高峰三地实测2026-10-28 晚高峰香港、新加坡 | 通过 |
| 日本节点 | 找到 36 条与“日本节点”相关的内容。 | 日本节点日本节点适合看 Netflix、YouTube 和日 / 香港节点与日本节点在实际使用中有什么不同？香港与日本节点常被 / 灵动云月付低至 ¥20｜57 个节点｜本站主推｜提供日本 | 通过 |
| IPLC | 找到 30 条与“IPLC”相关的内容。 | IPLC（国际专线电路）通常指跨境点到点的专用电路。 / IEPL（国际以太网专线）以太网形态的国际专线，常与 IPL / IEPL、IPLC与BGP究竟有什么区别？IEPL 与 IP | 通过 |
| IEPL | 找到 20 条与“IEPL”相关的内容。 | IEPL（国际以太网专线）以太网形态的国际专线，常与 IPL / IEPL、IPLC与BGP究竟有什么区别？IEPL 与 IP / 大佬云月付低至 ¥19.99｜60 个节点｜提供IEPL | 通过 |
| 晚高峰 | 找到 10 条与“晚高峰”相关的内容。 | 机场晚高峰测速应该怎样进行？晚高峰测速的关键不是跑出最高数字 / 2026机场节点选择指南：地区、线路和测速时间怎么判断？选机 / 新加坡节点与美国节点应该怎样选择？新加坡节点距离近、延迟下限 | 通过 |
| firefly | 找到 1 条与“firefly”相关的内容。 | Firefly月付低至 ¥25｜50+ 个节点 | 通过 |
| 飞为 | 找到 1 条与“飞为”相关的内容。 | Firefly月付低至 ¥25｜50+ 个节点 | 通过 |
| 唯兔云 | 找到 1 条与“唯兔云”相关的内容。 | 唯兔云月付低至 ¥19.9｜50+ 个节点 | 通过 |
| zzqq不存在的词 | 没有找到与“zzqq不存在的词”相关的内容。可以试试机场简称、地区名称（如“香港”）、线路缩写（如“IEPL”），或者“抖动”“倍率”这类词。 |  | 通过 |
| （索引加载失败） | 搜索暂时不可用，请刷新页面重试，或从下面的入口查找。 |  | 通过 |

## 逐页结果

| URL | 链接数 | 按钮数 | 下拉/输入 | 关闭 JS 后 H1 | 关闭 JS 后正文字数 | 问题 |
|---|---|---|---|---|---|---|
| / | 477 | 0 | 4 | 有 | 8933 | 无 |
| /404.html | 97 | 0 | 1 | 有 | 172 | 无 |
| /about/ | 96 | 0 | 1 | 有 | 1337 | 无 |
| /affiliate-disclosure/ | 92 | 0 | 1 | 有 | 806 | 无 |
| /airports/ | 161 | 1 | 4 | 有 | 2722 | 无 |
| /airports/breezenet/ | 111 | 0 | 1 | 有 | 2712 | 无 |
| /airports/dalaoyun/ | 109 | 0 | 1 | 有 | 1689 | 无 |
| /airports/edgenova/ | 113 | 0 | 1 | 有 | 2169 | 无 |
| /airports/ermaoyun/ | 109 | 0 | 1 | 有 | 1968 | 无 |
| /airports/feimaoyun/ | 111 | 0 | 1 | 有 | 2661 | 无 |
| /airports/firefly/ | 108 | 0 | 1 | 有 | 2378 | 无 |
| /airports/flashleap/ | 107 | 0 | 1 | 有 | 1743 | 无 |
| /airports/flyv/ | 109 | 0 | 1 | 有 | 1945 | 无 |
| /airports/guangnianti/ | 109 | 0 | 1 | 有 | 1699 | 无 |
| /airports/guangsuyun/ | 113 | 0 | 1 | 有 | 1767 | 无 |
| /airports/huanqiuyun/ | 109 | 0 | 1 | 有 | 2010 | 无 |
| /airports/jilianyun/ | 114 | 0 | 1 | 有 | 2065 | 无 |
| /airports/kexinyun/ | 110 | 0 | 1 | 有 | 2372 | 无 |
| /airports/kuaili/ | 113 | 0 | 1 | 有 | 2238 | 无 |
| /airports/kuajie/ | 107 | 0 | 1 | 有 | 2030 | 无 |
| /airports/laddercloud/ | 109 | 0 | 1 | 有 | 2012 | 无 |
| /airports/lingdongyun/ | 146 | 0 | 1 | 有 | 5589 | 无 |
| /airports/lingdongyun/peak-2026-10-28/ | 119 | 0 | 1 | 有 | 3023 | 无 |
| /airports/lingdongyun/singapore-speedtest-2026-10/ | 123 | 0 | 1 | 有 | 5397 | 无 |
| /airports/lingmao/ | 110 | 0 | 1 | 有 | 2105 | 无 |
| /airports/liulianyun/ | 108 | 0 | 1 | 有 | 2105 | 无 |
| /airports/muguangjiasu/ | 110 | 0 | 1 | 有 | 1856 | 无 |
| /airports/quanqiuyun/ | 108 | 0 | 1 | 有 | 2209 | 无 |
| /airports/shandianyun/ | 109 | 0 | 1 | 有 | 2093 | 无 |
| /airports/shenxingyun/ | 108 | 0 | 1 | 有 | 1585 | 无 |
| /airports/sogoyun/ | 111 | 0 | 1 | 有 | 1951 | 无 |
| /airports/sujie/ | 114 | 0 | 1 | 有 | 1777 | 无 |
| /airports/u1s1/ | 111 | 0 | 1 | 有 | 1809 | 无 |
| /airports/wavenet/ | 110 | 0 | 1 | 有 | 2190 | 无 |
| /airports/weituyun/ | 112 | 0 | 1 | 有 | 2159 | 无 |
| /airports/wuyou/ | 109 | 0 | 1 | 有 | 2536 | 无 |
| /airports/xingdaomeng/ | 113 | 0 | 1 | 有 | 2495 | 无 |
| /airports/yifanyun/ | 111 | 0 | 1 | 有 | 2410 | 无 |
| /airports/yinxingren/ | 113 | 0 | 1 | 有 | 2042 | 无 |
| /airports/yunjieyun/ | 109 | 0 | 1 | 有 | 3568 | 无 |
| /airports/yuzhouyun/ | 110 | 0 | 1 | 有 | 2107 | 无 |
| /articles/ | 117 | 0 | 1 | 有 | 1825 | 无 |
| /articles/choose-airport-by-use-case/ | 118 | 0 | 1 | 有 | 2803 | 无 |
| /articles/hong-kong-vs-japan-nodes/ | 111 | 0 | 1 | 有 | 2188 | 无 |
| /articles/how-to-choose-airport-nodes-2026/ | 113 | 0 | 1 | 有 | 2279 | 无 |
| /articles/how-to-speedtest-at-peak-hours/ | 108 | 0 | 1 | 有 | 2224 | 无 |
| /articles/idle-vs-loaded-latency/ | 108 | 0 | 1 | 有 | 2140 | 无 |
| /articles/iepl-iplc-bgp-differences/ | 107 | 0 | 1 | 有 | 2066 | 无 |
| /articles/jitter-impact-on-use-cases/ | 104 | 0 | 1 | 有 | 2063 | 无 |
| /articles/low-latency-not-fast-download/ | 107 | 0 | 1 | 有 | 2120 | 无 |
| /articles/online-rate-vs-stability/ | 108 | 0 | 1 | 有 | 2036 | 无 |
| /articles/singapore-node-speedtest-metrics/ | 108 | 0 | 1 | 有 | 2247 | 无 |
| /articles/singapore-vs-us-nodes/ | 109 | 0 | 1 | 有 | 2241 | 无 |
| /articles/traffic-multiplier-explained/ | 106 | 0 | 1 | 有 | 1991 | 无 |
| /articles/why-nodes-slow-down-at-night/ | 105 | 0 | 1 | 有 | 2031 | 无 |
| /guides/ | 96 | 0 | 1 | 有 | 856 | 无 |
| /guides/clash-verge-latency-test/ | 107 | 0 | 1 | 有 | 2143 | 无 |
| /guides/seven-day-node-speed-log/ | 108 | 0 | 1 | 有 | 2454 | 无 |
| /guides/youtube-stats-for-nerds/ | 106 | 0 | 1 | 有 | 2080 | 无 |
| /plans/ | 649 | 2 | 7 | 有 | 35969 | 无 |
| /privacy/ | 90 | 0 | 1 | 有 | 850 | 无 |
| /regions/ | 115 | 0 | 1 | 有 | 1662 | 无 |
| /regions/europe/ | 130 | 0 | 1 | 有 | 2090 | 无 |
| /regions/hong-kong/ | 147 | 0 | 1 | 有 | 5286 | 无 |
| /regions/japan/ | 145 | 0 | 1 | 有 | 4655 | 无 |
| /regions/singapore/ | 150 | 0 | 1 | 有 | 5506 | 无 |
| /regions/south-korea/ | 131 | 0 | 1 | 有 | 1093 | 无 |
| /regions/taiwan/ | 140 | 0 | 1 | 有 | 4158 | 无 |
| /regions/united-states/ | 146 | 0 | 1 | 有 | 4996 | 无 |
| /routes/ | 93 | 0 | 1 | 有 | 1439 | 无 |
| /search/ | 161 | 1 | 2 | 有 | 915 | 无 |
| /sources/ | 166 | 0 | 1 | 有 | 9753 | 无 |
| /test-records/ | 134 | 0 | 1 | 有 | 7375 | 无 |
| /testing-methodology/ | 95 | 0 | 1 | 有 | 1903 | 无 |
| /time-tests/ | 165 | 1 | 6 | 有 | 4374 | 无 |

## 发现并修复的交互问题

- 地图圆点 aria-label 与可见文字不一致（axe label-content-name-mismatch，修改措辞时引入），已修复并复测通过。
- 其他交互（导航、地图、筛选、搜索、分页、套餐对比、记录浏览器、证据图片、返回顶部）未发现无效按钮或空白链接。
