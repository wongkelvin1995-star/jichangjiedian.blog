/**
 * IndexNow 提交脚本（网站正式上线之后使用）。
 *
 * 默认只做“演练”：列出将要提交的 URL，不发送任何网络请求。确认无误后加 --submit 才真正提交。
 *
 * 规则：
 *  1. 只提交 dist/sitemap.xml 里存在的规范 URL（200、可索引）。noindex 页面、搜索页、404 永远不会被提交；
 *  2. 默认只提交“自上次提交以来 lastmod 变化或新增”的 URL，状态保存在 .indexnow-state.json（提交成功后才更新）；
 *     首次上线用 --all；也可以用 --urls /articles/xxx/,/airports/ 指定；
 *  3. 提交前会先请求 https://<域名>/<密钥>.txt，确认密钥文件已经在线上；没上线就拒绝提交，避免无效请求；
 *  4. 不提交任何删除的页面，不在没有内容变化时重复提交。
 *
 * 用法：
 *   npm run build
 *   npm run indexnow                          # 演练：看看会提交什么
 *   npm run indexnow -- --all --submit        # 首次上线：提交全部
 *   npm run indexnow -- --submit              # 之后：只提交有变化的
 *   npm run indexnow -- --urls /articles/idle-vs-loaded-latency/ --submit
 *
 * 可选参数：--endpoint <url>（默认 https://api.indexnow.org/indexnow；只提交给 Bing 时可用 https://www.bing.com/indexnow）
 *           --state <file>（默认 .indexnow-state.json）  --skip-verify（跳过密钥文件在线检查，不建议）
 */
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(`--${name}`);
const opt = (name: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const die = (msg: string): never => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

// ---- 站点域名：从 astro.config.mjs 读取，不在脚本里另写一份
const cfg = (await import('../astro.config.mjs')).default as { site?: string };
if (!cfg.site) die('astro.config.mjs 没有设置 site。');
const siteUrl = new URL(cfg.site as string);
const host = siteUrl.host;

// ---- sitemap
const sitemapFile = path.resolve('dist', 'sitemap.xml');
if (!fs.existsSync(sitemapFile)) die('找不到 dist/sitemap.xml，请先运行 npm run build。');
const sitemap = new Map<string, string>();
for (const m of fs.readFileSync(sitemapFile, 'utf8').matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)) {
  sitemap.set(m[1]!, m[2]!);
}
if (sitemap.size === 0) die('sitemap.xml 里没有读到任何 URL。');

// ---- 密钥：环境变量 INDEXNOW_KEY，或 public/ 下“文件名 = 内容”的 32 位十六进制 .txt
function findKey(): string {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  if (fromEnv) return fromEnv;
  const dir = path.resolve('public');
  const found = fs
    .readdirSync(dir)
    .filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
    .filter((f) => fs.readFileSync(path.join(dir, f), 'utf8').trim() === f.replace(/\.txt$/, ''));
  if (found.length === 0) return die('没有找到 IndexNow 密钥文件（public/<32位十六进制>.txt，内容与文件名相同）。');
  if (found.length > 1) return die(`public/ 下有多个密钥文件：${found.join('、')}。请只保留一个，或用环境变量 INDEXNOW_KEY 指定。`);
  return found[0]!.replace(/\.txt$/, '');
}
const key = findKey();
if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) die('IndexNow 密钥只能包含字母、数字和连字符，长度 8–128。');
const keyLocation = `${siteUrl.origin}/${key}.txt`;

// ---- 选出要提交的 URL
const statePath = path.resolve(opt('state') ?? '.indexnow-state.json');
const state: Record<string, string> = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};

let urls: string[];
const explicit = opt('urls');
if (explicit) {
  urls = explicit
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => new URL(p, siteUrl.origin).toString());
  const bad = urls.filter((u) => !sitemap.has(u));
  if (bad.length) die(`这些 URL 不在 sitemap.xml 里（只允许提交可索引的规范 URL）：\n  ${bad.join('\n  ')}`);
} else if (flag('all')) {
  urls = [...sitemap.keys()];
} else {
  urls = [...sitemap.entries()].filter(([u, lastmod]) => state[u] !== lastmod).map(([u]) => u);
}

if (urls.length === 0) {
  console.log('没有需要提交的变更（所有 URL 的 lastmod 都与上次提交一致）。');
  process.exit(0);
}

console.log(`域名：${host}`);
console.log(`密钥文件：${keyLocation}`);
console.log(`待提交 URL：${urls.length} 个`);
for (const u of urls.slice(0, 60)) console.log(`  ${u}   lastmod ${sitemap.get(u)}`);
if (urls.length > 60) console.log(`  …另有 ${urls.length - 60} 个`);

if (!flag('submit')) {
  console.log('\n这是演练，没有发送任何请求。确认无误、网站已上线后，加 --submit 真正提交。');
  process.exit(0);
}

// ---- 确认密钥文件在线上
if (!flag('skip-verify')) {
  try {
    const res = await fetch(keyLocation, { redirect: 'follow' });
    const text = (await res.text()).trim();
    if (!res.ok || text !== key) {
      die(`线上的密钥文件不可用（HTTP ${res.status}）：${keyLocation}\n请先把网站（包含 public/${key}.txt）部署上线，再提交。`);
    }
  } catch (e) {
    die(`无法访问 ${keyLocation}：${(e as Error).message}\n请确认网站已经部署，且本机能访问它。`);
  }
}

// ---- 提交（每次最多 10000 个）
const endpoint = opt('endpoint') ?? 'https://api.indexnow.org/indexnow';
let sent = 0;
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: batch }),
  });
  const note: Record<number, string> = {
    200: '已接收',
    202: '已接收，密钥验证稍后完成',
    400: '请求格式错误',
    403: '密钥无效（密钥文件不存在或内容不符）',
    422: 'URL 不属于该域名，或密钥与域名不匹配',
    429: '请求过于频繁，请稍后再试',
  };
  console.log(`批次 ${i / 10000 + 1}：HTTP ${res.status} ${note[res.status] ?? ''}`);
  if (res.status !== 200 && res.status !== 202) die('提交失败，状态文件未更新。');
  for (const u of batch) state[u] = sitemap.get(u)!;
  sent += batch.length;
}
fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
console.log(`✓ 已提交 ${sent} 个 URL，状态已写入 ${path.relative(process.cwd(), statePath)}。`);
