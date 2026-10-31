# 验收报告（交付物 P）

项目：机场节点 `https://jichangjiedian.blog/`（Astro 静态站）　验收日期：2026-10-27
所有数字来自最终代码上的一次完整运行：`npm run verify`（约 20 秒）与 `npm test`（约 3 分 27 秒）。

> **结论先说：构建通过，全部自动化检查通过。网站尚未上线，也没有声称上线。** 部署、域名、Bing / Google 验证、IndexNow 提交、真实外链检查，都需要你的账号或联网环境，没有执行（见第 7 节）。

---

## 1. 运行环境

Node ≥ 22.23.4，Astro 7.4.2（静态输出），TypeScript 6，Playwright 1.63 + Chromium（无头），axe-core，Lighthouse 12.8.2。测试环境是沙箱：只开放包管理源，不能访问外部网站。

## 2. 上线前最终检查（总指令第 32 节）

| # | 项目 | 结果 | 证据 |
| ---: | --- | :---: | --- |
| 1 | 安装依赖 | ✅ | `npm ci` 成功（`package-lock.json` 已锁定） |
| 2 | TypeScript 检查 | ✅ | `npm run typecheck`（`tsc --noEmit`）0 错误 |
| 3 | 构建 | ✅ | `npm run build`：74 页，约 2.6 秒 |
| 4 | 内链检查 | ✅ | `validate:links`：19423 项通过（4259 处站内引用，无断链、无孤岛、锚点有效） |
| 5 | 中文搜索测试 | ✅ | `validate:search` 1543 项通过；e2e 里另有浏览器内真实输入测试 |
| 6 | 地图交互测试 | ✅ | e2e：点击区域、键盘操作、筛选、关闭脚本时的降级；mobile：375 宽触控命中 |
| 7 | 34 品牌与 AFF 映射测试 | ✅ | `validate:brands` 3492 项、`validate:affiliates` 4194 项通过；e2e 里逐一核对页面上的链接 |
| 8 | 移动端测试 | ✅ | `tests/mobile.ts` 148 项（无横向溢出、点击目标、INP 近似等），覆盖 320/375/414 等宽度 |
| 9 | SEO 与 Sitemap 检查 | ✅ | `validate:seo` 8797 项通过（1 条提示） |
| 10 | 测试页面证据检查 | ✅ | `validate:evidence` 1858 项通过（1 条提示）。**注意：通过的含义是“没有伪造”，不是“证据充足”**：目前 0 条记录 isVerified，原因见 OPEN_ISSUES.md |
| 11 | 安全问题检查 | ✅ | `validate:security` 155125 项通过（1 条提示）：无订阅密钥、令牌、个人信息；无内联脚本；CSP 完整 |
| 12 | 实际部署配置 | ⚠️ 部分 | `public/_headers`、`robots.txt`、`sitemap.xml`、IndexNow 密钥文件、404 页均已生成并校验；**真实托管平台上是否生效无法在此验证**（没有部署，也没有被授权动你的 Cloudflare / DNS / 域名） |

提示项的说明：外部链接 34 个域名“未联网检查”（沙箱不能联网）；`validate:evidence` 的 1 条提示是“灵动云原图尚未挂载”；其余提示项均为信息性。

## 3. 数据测试（总指令第 31 节）

| 要求 | 脚本 | 结果 |
| --- | --- | :---: |
| brands 数量严格为 34 | `validate-brands` | ✅ |
| brandId、slug 不重复 | `validate-brands` | ✅ |
| 第 1–16 位严格匹配要求 | `validate-brands`（固定编辑顺序，不是排名） | ✅ |
| 34 个 AFF 链接与提供的原始字符串一致 | `validate-affiliates`（逐字比对原文件；页面上的 href 与 rel 属性） | ✅ |
| 每个品牌都有数据来源状态 | `validate-brands` | ✅ |
| 空字段不会被转成 0 | `validate-evidence`（`null ≠ 0`，缺失值在页面显示为“未提供”） | ✅ |
| 没有证据的测速记录不能 isVerified=true | `validate-evidence`（需要原图已挂载且有日期） | ✅ |
| 品牌身份冲突不被自动合并 | `validate-brands`（冲突品牌保留各自条目并标注） | ✅ |
| 文章里的图片引用必须存在 | `validate-links`、`validate-content` | ✅ |
| sitemap 不包含未发布页面 | `validate-seo`（与 noindex 状态完全一致） | ✅ |
| 页面不暴露个人订阅密钥 | `validate-security`（扫描全部 dist 文本） | ✅ |

## 4. 浏览器测试明细

| 套件 | 项数 | 内容 |
| --- | ---: | --- |
| `tests/e2e.ts` | 207 | 每个页面在严格 CSP 下加载且无错误、无站外请求；关闭 JavaScript 时的可读性；地图与区域筛选；中文搜索；套餐对比的筛选、排序、分页；分时段测试的空状态；404 状态码；推广链接属性 |
| `tests/mobile.ts` | 148 | 多个手机宽度下无横向溢出；点击目标；表格滚动；INP 近似（CPU 4 倍降速，总响应 ≤ 200ms，我们自己的脚本 ≤ 50ms）；开场动画与减少动效 |
| `tests/a11y.ts` | 97 | axe WCAG A/AA：桌面 74 项（全部页面）、手机 20 项（关键页面）、首页 2 种操作状态 |

## 5. Lighthouse（本地实验室数据）

14 次运行（7 个页面 × 手机 / 桌面）：性能、无障碍、最佳实践、SEO **全部 100**；手机 LCP 0.95–1.5 秒，TBT ≤ 92ms，CLS ≤ 0.006。完整表格与局限见 `docs/SEO_AUDIT.md` 第 8 节。**这是本地模拟节流，不是 PageSpeed Insights，也不是真实用户数据**；线上数字会不同。

## 6. 交付物 A–P 对照

| 交付物 | 位置 | 状态 |
| --- | --- | --- |
| A 完整网站源码 | 整个项目（`src/`、`public/`、`scripts/`、`tests/`） | ✅ |
| B 实际首页与全部核心页面 | `dist/`（74 页）；页面清单 `docs/SEO_PAGES.md` | ✅ |
| C 全球地图与地区筛选 | 首页；构建时生成 SVG 地图，9 个区域点，键盘与触控可用 | ✅ |
| D 34 家机场完整目录 | `/airports/`，34 家全部列出 | ✅ |
| E 前 16 家固定排序 | 按总指令固定顺序，页面明确写明“编辑顺序，不是排名” | ✅ |
| F 34 条原始推广链接 | 逐字保留，`rel="sponsored nofollow noopener noreferrer"` | ✅（链接是否有效未联网检查） |
| G 机场资料及套餐数据 | `src/data/`；`/plans/`（300 条报价、197 个套餐）；`docs/DATA_SOURCES.md`、`DATA_SOURCES_TABLE.md` | ✅ |
| H 灵动云实测专题与原始证据 | `/airports/lingdongyun/` 品牌页 + 新加坡测速专题 | ⚠️ 页面完成；**原始截图未提供，记录均为“待核验”** |
| I 分时段测试系统 | `/time-tests/`、`/test-records/`、测试方法页 | ⚠️ 系统完成；当前无符合统计条件的记录，页面显示空状态而不是编造数字 |
| J 首批原创研究文章 | 13 篇文章 + 3 篇教程：总指令的 15 个选题，加站长追加的《按使用场景选机场》 | ✅ |
| K 中文站内搜索 | `/search/` 及首页搜索框，客户端索引 32KB | ✅ |
| L Sitemap、Robots、Canonical、IndexNow | `dist/sitemap.xml`、`robots.txt`、每页 canonical、`scripts/submit-indexnow.ts` | ✅ 生成；❌ 未提交 |
| M 全站 SEO 审查报告 | `docs/SEO_AUDIT.md` | ✅ |
| N 部署及维护说明 | `docs/DEPLOYMENT.md` | ✅ |
| O 数据真实性、品牌冲突与尚未核验问题清单 | `docs/OPEN_ISSUES.md` | ✅ |
| P 实际构建、链接、移动端和 SEO 测试结果 | 本文件 | ✅ |

## 7. 没有做的事与已知局限

1. **没有部署，没有上线**。没有动任何 GitHub 仓库、Cloudflare 项目、DNS 或域名。
2. **没有向 Bing / Google 提交**，没有 IndexNow 提交；不承诺收录时间或第一页排名。
3. **没有检查真实外链**（34 个推广链接和来源链接）。外链检查脚本已写好并自检通过，需要你在联网环境运行 `npm run check:external`。
4. **缺少原始证据**：灵动云的三张原始截图未提供（页面已留好挂载位置，挂载后需把记录改为已核验）；没有 Excel 核验表；没有其他品牌的测速证据；微风网络的 TXT 文件解析出 0 字节。
5. **联系邮箱未设置**（需要你提供，写入站点配置）。
6. 总指令里提到的“边缘节点 50GB”在任何提供的文件中都没有找到依据，没有写入站点。
7. **只在无头 Chromium 测试**，没有 Safari / Firefox / 真机。
8. Lighthouse 与 INP 都是本地实验室数据，不等于线上的 Core Web Vitals。
9. 品牌身份冲突（神行云、云界云、无忧、环球云等）保留为冲突状态，未擅自合并，待你确认。

详细清单与建议处理顺序见 `docs/OPEN_ISSUES.md`。

## 8. 如何复现

```bash
npm ci
npm run verify          # 类型检查 + 数据校验 + 构建 + 页面校验（约 20 秒）
npm test                # 浏览器端到端 + 移动端 + 无障碍（约 3.5 分钟）
npm run check:originality
npm run report:pages    # 重新生成 docs/SEO_PAGES.md
npm run check:external  # 需要联网：检查 34 个推广链接与来源链接
```
