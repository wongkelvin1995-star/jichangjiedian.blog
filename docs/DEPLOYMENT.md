# 部署与维护说明

适用于 `https://jichangjiedian.blog/`。本站是 **Astro 静态站**：构建后得到 `dist/` 文件夹，放到任何静态托管（Cloudflare Pages、Netlify、Vercel、Nginx、对象存储 + CDN）都能运行，不需要服务器端程序，也没有数据库。

> **关于“上线”**：本次交付只在开发沙箱里完成了构建和测试。**我没有操作你的任何 GitHub 仓库、Cloudflare 项目、DNS、域名或外部服务**（你的总指令要求未经授权不得改动这些），所以网站目前**没有被部署到线上**，也没有向 Bing 或 Google 提交任何东西。下面的步骤都需要你自己（或授权后）执行。

---

## 1. 环境要求

| 项目 | 要求 |
| --- | --- |
| Node.js | **≥ 22.23.4**（Astro 7.4 的要求；低于这个版本构建会直接报错） |
| npm | 随 Node 安装即可 |
| 浏览器测试 | 运行 `npm run test` 需要 Chromium：`npx playwright install chromium`（只在本地做测试时需要，部署不需要） |

## 2. 本地命令

```bash
npm ci                    # 按 package-lock.json 安装依赖
npm run verify            # 类型检查 → 数据校验 → 构建 → 产物校验（SEO / 链接 / 内容 / 搜索 / 安全）
npm run test              # 浏览器测试：端到端、手机与响应式、无障碍（axe）
npm run build             # 只构建，输出到 dist/
npm run dev               # 本地开发（热更新）
npm run preview           # 预览 dist/（注意：不会应用 public/_headers 里的响应头）
```

单项命令：`npm run typecheck`、`npm run check`（astro check）、`npm run validate:brands | validate:affiliates | validate:evidence`、`npm run validate:seo | validate:links | validate:content | validate:search | validate:security`、`npm run test:e2e | test:mobile | test:a11y`。

任何一个校验失败，命令都会以非 0 退出，请先修好再发布。**构建失败时不要发布。**

浏览器测试用的是 `tests/lib/static-server.ts`：它会读取 `dist/_headers` 并原样应用（包括严格的内容安全策略），所以测试看到的页面行为和线上一致；这也是为什么任何内联脚本、内联样式或第三方请求都会在测试里立刻暴露。

## 3. 环境变量（都是公开信息，都可以留空）

复制 `.env.example` 为 `.env`，或直接在托管平台的环境变量里设置。它们在**构建时**写入页面，改完要重新构建部署。

| 变量 | 作用 | 留空时 |
| --- | --- | --- |
| `PUBLIC_BING_SITE_VERIFICATION` | Bing 站长工具的验证码（`msvalidate.01` meta 标签的 content 值） | 不输出该 meta（可改用文件或 DNS 方式验证） |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console 的验证码 | 不输出该 meta |
| `PUBLIC_CONTACT_EMAIL` | “关于本站”页公开的联系邮箱 | 显示“暂未公布” |

> 联系邮箱请用**专门的对外邮箱**。你的账号邮箱没有写进任何页面或源码（安全校验会检查这一点）。

## 4. Cloudflare Pages（推荐）

在 Cloudflare 控制台 → Workers & Pages → Create → Pages → 连接你的 Git 仓库，然后：

| 设置 | 值 |
| --- | --- |
| Framework preset | Astro（或 None） |
| Build command | `npm run build` |
| Build output directory | `dist` |
| 环境变量 | `NODE_VERSION` = `22.23.4`（或平台支持的更新版本）；按需添加上面三个 `PUBLIC_*` |

- `dist/_headers` 会被 Pages 自动识别，里面有内容安全策略、安全响应头和缓存策略，不需要额外配置。
- 目录链接缺结尾斜杠时（`/airports` → `/airports/`）Pages 会自动 308 跳转；找不到的地址会返回 `dist/404.html` 且状态码为 404。
- **自定义域名**：Pages 项目 → Custom domains → 添加 `jichangjiedian.blog`。若域名的 DNS 在 Cloudflare，会自动创建记录。
- **统一主域名与 301**（总指令要求“统一主域名、正确 301”）：站内所有 canonical、sitemap、结构化数据都使用 `https://jichangjiedian.blog/`（不带 www）。如果你也解析了 `www.jichangjiedian.blog`，请在 Cloudflare 里加一条 Redirect Rule：`www.jichangjiedian.blog/*` → `https://jichangjiedian.blog/${1}`，状态码 301；并开启 “Always Use HTTPS”，让 `http://` 301 到 `https://`。**这些是 DNS / 规则层面的改动，我没有替你做。**
- **HSTS**：`_headers` 里是 `Strict-Transport-Security: max-age=31536000`，故意没有 `includeSubDomains` 和 `preload`（preload 很难撤回，等你确认所有子域名都支持 HTTPS 再考虑）。

## 5. Netlify

`netlify.toml` 示例（放在项目根目录，Netlify 同样识别 `_headers`）：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22.23.4"
```

Netlify 对“带/不带结尾斜杠”的处理由站点的 Pretty URLs 设置决定；本站每个页面的 canonical 都带结尾斜杠，即使两种地址都能访问，搜索引擎也会按 canonical 合并。

## 6. Vercel

`vercel.json` 示例（把 `_headers` 的内容翻译成 Vercel 的写法）：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "trailingSlash": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=(), interest-cohort=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000" }
      ]
    },
    { "source": "/_astro/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

## 7. Nginx（自己的服务器）

```nginx
server {
  listen 443 ssl http2;
  server_name jichangjiedian.blog;
  root /var/www/jichangjiedian/dist;
  index index.html;
  error_page 404 /404.html;

  # 目录链接缺结尾斜杠时，Nginx 会自动 301 到带斜杠的地址
  location / { try_files $uri $uri/ =404; }

  add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options DENY always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;
  add_header Permissions-Policy "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=(), interest-cohort=()" always;
  add_header Cross-Origin-Opener-Policy same-origin always;
  add_header Strict-Transport-Security "max-age=31536000" always;

  location /_astro/ { add_header Cache-Control "public, max-age=31536000, immutable"; }   # 注意：子 location 里要重复上面的 add_header
}

server { listen 80; server_name jichangjiedian.blog www.jichangjiedian.blog; return 301 https://jichangjiedian.blog$request_uri; }
server { listen 443 ssl http2; server_name www.jichangjiedian.blog; return 301 https://jichangjiedian.blog$request_uri; }
```

> Nginx 的 `add_header` 在子 `location` 里出现时，不会继承外层的 `add_header`。如果你给 `/_astro/` 单独设置缓存头，请把上面的安全头在该 `location` 里重复一遍。

## 8. 上线后：Bing 与 Google（我没有执行，需要你登录账号操作）

### Bing 上线清单（共 10 项，对应总指令第 24 节）

1. **验证网站所有权**：登录 Bing Webmaster Tools → 添加 `https://jichangjiedian.blog/`。三种方式任选其一：
   a. 取得验证码后设置 `PUBLIC_BING_SITE_VERIFICATION`，重新构建部署，再点 Verify；
   b. 把 Bing 提供的 `BingSiteAuth.xml` 放进 `public/`，重新部署；
   c. DNS 里添加 Bing 给出的 CNAME 记录。
   也可以从已验证的 Google Search Console 导入。
2. **检查 Bingbot 能访问首页**：在 Bing 的 URL 检查里测试 `https://jichangjiedian.blog/`；同时确认 `robots.txt` 没有拦截（本站 `robots.txt` 是 `Allow: /`，并给出 sitemap 地址）；如果用了 Cloudflare 的 Bot Fight Mode / WAF 规则，要确认没有把 Bingbot 挡在外面。
3. **提交实际存在的 Sitemap**：`https://jichangjiedian.blog/sitemap.xml`（构建时由程序生成，只包含正式发布、可索引、返回 200 的规范地址；没有 sitemap-index）。
4. **检查 URL 检查（URL Inspection）结果**：逐个检查首页、`/airports/`、灵动云测速报告等重点页面，看“已发现 / 已抓取 / 已编入索引”的状态与 Bing 报告的问题。
5. **查看 Site Explorer 的抓取与索引状态**。
6. **查看 SEO Site Scan** 的报告，修复其中真实的问题。
7. **确认没有误设 noindex**：本站故意设置 noindex 的只有：404 页、站内搜索结果页，以及 32 个“资料卡”品牌页（资料还不够独立成页，见 `docs/SEO_AUDIT.md`）。其余页面不应带 noindex。`npm run validate:seo` 会检查 sitemap 与 noindex 是否一致。
8. **启用 IndexNow**（见下一节）。
9. **检查实际 Bing 搜索曝光**：在 Bing Webmaster Tools 的 Search Performance 看展示、点击和查询词。
10. **按搜索查询与页面数据迭代内容**：根据真实查询词补充或改写文章、完善资料卡。

> **没有人能保证某个日期收录或进入第一页**，本站的页面、文档和脚本里也都没有这样的承诺。收录与排名取决于搜索引擎对内容质量与站点可信度的评估，需要持续积累。

### Google Search Console

设置 `PUBLIC_GOOGLE_SITE_VERIFICATION` 后重新部署，在 Search Console 添加网址前缀资源 `https://jichangjiedian.blog/` 并验证，再提交同一个 `sitemap.xml`。

## 9. IndexNow（站点真的上线之后才用）

- 密钥文件已放在 `public/` 下，文件名和内容都是同一个 32 位十六进制密钥（`<密钥>.txt`），部署后可以在 `https://jichangjiedian.blog/<密钥>.txt` 打开。
- 提交脚本：`scripts/submit-indexnow.ts`。**默认只是演练**，不发送任何请求：

```bash
npm run build
npm run indexnow                          # 演练：列出将要提交的 URL
npm run indexnow -- --all --submit        # 首次上线：提交 sitemap 里的全部 URL
npm run indexnow -- --submit              # 之后：只提交自上次提交以来新增或 lastmod 变化的 URL
npm run indexnow -- --urls /articles/idle-vs-loaded-latency/ --submit
```

- 它只提交 sitemap 里的规范 URL；noindex 页面、搜索页、404 永远不会提交；提交前会先确认线上能打开密钥文件，打不开就拒绝；提交成功后才更新 `.indexnow-state.json`。
- **IndexNow 返回 HTTP 200/202 只表示“请求已收到”，不等于“已收录”。** 收录情况以 Bing Webmaster Tools 为准。
- 不要在每次构建时都提交全部地址；没有内容变化时不要重复提交。

## 10. 日常维护

### 新增一篇文章或教程

在 `src/content/articles/`（研究文章）或 `src/content/guides/`（教程）新建 `.md` 文件，frontmatter 必须包含：`title`（8–60 字）、`description`（50–160 字）、`published`、`modified`（**真实日期**，会进入 sitemap 的 lastmod 与结构化数据）、`category`，可选 `keywords`、`brands`、`regions`、`related`、`order`、`draft`。然后 `npm run verify`：`validate:content` 会检查正文长度、是否有“局限性”小节、站内链接数量、有没有虚构评分/评价等。

写作时注意一个中文 Markdown 的坑：**加粗的结束标记 `**` 前面如果是中文标点，在 CommonMark 里不会被识别为结束**。请写成 `**名词**：解释`，不要写成 `**名词：**解释`。构建产物里如果出现字面的 `**`，`validate:seo` 会报错。

### 新增测试记录与证据

1. 原始截图放进 `public/evidence/<品牌>/`，**保持原图**，不要裁剪、不要改数字；整理出来的汇总图必须在页面上标成“数据整理图”。
2. 在 `src/data/test-records.ts` 增加记录：没有测到的字段写 `null`，**不要写 0**；没有原始证据就不要把 `isVerified` 设为 `true`；截图上看不到日期的，用 `claimedWindow` 记录说法，时间窗口保持 `unknown`。
3. `npm run validate:evidence` 会检查以上规则，并核对证据文件是否存在、数量是否一致。
4. 时间窗口（北京时间 UTC+8）：早间 07:00–09:00、午间 12:00–14:00、晚间 18:00–20:00、晚高峰 20:00–23:00、深夜 00:00–02:00。没有本站可核验记录的窗口会显示“该时间段暂无本站可核验测试记录。”，不要用估计值填空。

### 修改品牌资料

资料在 `src/data/brands/<slug>.ts`。每个字段都带来源等级（A 本站实测、B 服务商公开资料、C 第三方历史参考、D 待核验或资料冲突）。品牌的**展示顺序是固定的编辑顺序，不是排名**，`npm run validate:brands` 会检查 34 家、顺序与前 16 位固定顺序；`npm run validate:affiliates` 会检查 34 条推广链接与你提供的原始字符串**逐字一致**（原始字符串保存在 `docs/source-material/affiliate-mapping-original.txt`）。**不要手动改写推广链接。**

### 资料更新后，同步修改“资料整理日期”

`src/lib/site.ts` 里的 `DATA_UPDATED`（格式 `YYYY-MM-DD`）有两个用途：显示在页面上的“资料整理日期”，以及目录、地区、套餐、测试档案等**数据页在 sitemap.xml 里的 `lastmod`**。资料真的更新之后，把它改成更新当天的日期；**没有更新资料就不要改**——lastmod 一旦被证明不真实，搜索引擎（尤其是 Bing）就会逐渐不再相信它。文章和教程不受它影响，它们用各自 frontmatter 里的 `modified`。

### 把资料卡升级为可索引的品牌页

品牌页默认是“资料卡”（`detailPage: 'draft'`，noindex，不进 sitemap）。当某个品牌有了足够多**本站独有**的内容（原始测试、实测截图、整理过的套餐核对），把它的 `detailPage` 改为 `'open'`，页面会自动进入 sitemap，并可以用 IndexNow 提交。目前只有灵动云和飞猫云是 `'open'`；身份还没确认的品牌（神行云、云界云、无忧、环球云等）不允许设为 `'open'`，`npm run validate:brands` 会拒绝。

### 检查外部链接（需要联网，请在你自己的电脑上运行）

```bash
npm run build
npm run check:external -- --affiliate-only   # 只检查 34 个推广链接是否可达
npm run check:external                       # 检查全部外链，结果写入 external-links-report.json
```

结果分三类：可达、需人工确认（对方可能拦截了自动请求，或只是网络波动）、失效（域名解析失败、连接被拒绝、证书错误、404 等）。**脚本只读取，不会改任何链接。**

> **关于推广链接的提醒：** 检查推广链接就是向联盟追踪地址发请求，部分联盟系统可能把它记成一次点击或访问，影响你在联盟后台看到的数据。不必每次发布都全量检查；确认域名还活着、需要时抽查即可。

推广链接失效时，请向服务商确认新地址，再替换原始字符串（见上文“修改品牌资料”）。开发沙箱的网络只开放了包管理源，所以这一项我只做了脚本自检（`npm run check:external -- --selftest`，覆盖状态码分类、跳转、HEAD 被拒后改用 GET、超时和各类网络错误的归类），**没有检查任何真实外链**。

## 11. 常见问题

| 现象 | 处理 |
| --- | --- |
| 构建报 Node 版本过低 | 升级到 ≥ 22.23.4；Cloudflare/Netlify 里设置 `NODE_VERSION` |
| 部署后页面样式或脚本不工作，控制台有 CSP 报错 | 说明新加了内联脚本、内联样式或第三方资源。本站不允许这些；把脚本/样式放进 `src/` 里由构建打包，或评估后再调整 `_headers` |
| `validate:seo` 提示缺少 Bing 验证 meta | 这是提示不是错误；设置 `PUBLIC_BING_SITE_VERIFICATION` 或改用文件/DNS 验证 |
| 想回滚 | Cloudflare Pages / Netlify / Vercel 都保留历史部署，在控制台选择上一次成功的部署回滚即可 |
