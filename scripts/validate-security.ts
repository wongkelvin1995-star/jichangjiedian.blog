/**
 * 安全与隐私校验（读取 dist/ 与项目源码，需先 npm run build）：
 *  1. 页面严格符合 CSP：没有内联脚本、内联样式、内联事件处理器，没有第三方脚本、样式、字体、图片、iframe；
 *  2. 脚本产物里没有 eval / innerHTML / Cookie / 本地存储 / 外部请求（与隐私政策“不使用 Cookie 和本地存储”一致）；
 *  3. 没有任何邮箱、订阅链接、令牌、节点 URI、UUID、服务器 IP 等个人或敏感信息，也没有站长账号邮箱；
 *  4. dist 里只有应该公开的文件：没有源码映射、原始资料（TXT/MD/XLSX）、环境变量文件；
 *  5. _headers 中的 CSP 与其他安全响应头齐全，且不含 unsafe-inline / unsafe-eval；
 *  6. 外部链接均为 https，新窗口打开并带 noopener。
 */
import fs from 'node:fs';
import path from 'node:path';
import { DIST, pages, requireDist, walk } from './lib/dist';
import { Report } from './lib/report';

requireDist();
const r = new Report('安全与隐私校验');

// ------------------------------------------------------------------ 1. 页面
const EVENT_ATTR = /^on[a-z]+$/i;
for (const p of pages()) {
  const where = p.urlPath;
  for (const el of p.root.querySelectorAll('*')) {
    for (const name of Object.keys(el.attributes)) {
      r.check(!EVENT_ATTR.test(name), `${where}：<${el.tagName.toLowerCase()}> 带有内联事件处理器 ${name}`);
    }
    r.check(!el.hasAttribute('style'), `${where}：<${el.tagName.toLowerCase()}> 带有内联 style（会破坏严格 CSP）`);
    r.check(!el.hasAttribute('srcdoc'), `${where}：不得使用 srcdoc`);
  }
  r.check(p.root.querySelectorAll('style').length === 0, `${where}：不得有 <style> 元素`);
  for (const s of p.root.querySelectorAll('script')) {
    const type = s.getAttribute('type') ?? '';
    const src = s.getAttribute('src');
    if (type === 'application/ld+json') {
      r.check(!src, `${where}：JSON-LD 不应带 src`);
      continue;
    }
    r.check(!!src && src.startsWith('/_astro/') && type === 'module', `${where}：脚本只能是本站 /_astro/ 下的外部模块文件`, `实际：type=${type} src=${src ?? '(内联)'}`);
  }
  for (const tag of ['iframe', 'object', 'embed', 'applet', 'base', 'frame', 'frameset']) {
    r.check(p.root.querySelectorAll(tag).length === 0, `${where}：不得使用 <${tag}>`);
  }
  r.check(p.root.querySelector('meta[http-equiv]') === null, `${where}：不得使用 meta http-equiv（含 refresh）`);
  // 外部资源
  for (const el of p.root.querySelectorAll('[src], link[href], form[action], [poster], [data]')) {
    for (const attr of ['src', 'href', 'action', 'poster', 'data']) {
      const v = el.getAttribute(attr);
      if (!v || el.tagName.toLowerCase() === 'a') continue;
      if (attr === 'href' && el.tagName.toLowerCase() !== 'link') continue;
      r.check(!/^(?:https?:)?\/\//i.test(v) || (el.tagName.toLowerCase() === 'link' && el.getAttribute('rel') === 'canonical'), `${where}：<${el.tagName.toLowerCase()}> 引用了外部资源 ${v}`);
      r.check(!/^data:/i.test(v), `${where}：<${el.tagName.toLowerCase()}> 使用了 data: 地址`);
    }
  }
  // 链接
  for (const a of p.root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')!;
    r.check(!/^\s*(javascript|vbscript|data):/i.test(href), `${where}：链接使用了危险协议 ${href}`);
    if (/^https?:\/\//i.test(href)) {
      r.check(href.startsWith('https://'), `${where}：外部链接必须使用 https ${href}`);
      r.check(a.getAttribute('target') === '_blank', `${where}：外部链接应新窗口打开 ${href}`);
      r.check((a.getAttribute('rel') ?? '').split(/\s+/).includes('noopener'), `${where}：外部链接缺少 noopener ${href}`);
    }
    if (a.getAttribute('target') === '_blank') r.check((a.getAttribute('rel') ?? '').split(/\s+/).includes('noopener'), `${where}：target=_blank 缺少 noopener ${href}`);
  }
  // 表单只允许站内搜索（GET）
  for (const f of p.root.querySelectorAll('form')) {
    r.check((f.getAttribute('method') ?? 'get').toLowerCase() === 'get', `${where}：表单必须使用 GET`);
    const action = f.getAttribute('action');
    // 站内搜索提交到 /search/；筛选表单没有 action，只在脚本启用后才可用，从不向服务器提交：
    // 要么默认 hidden，要么控件全部默认 disabled（先占好位置，脚本就绪后启用，避免布局位移）
    if (action === undefined) {
      const controls = f.querySelectorAll('input, select, button, textarea');
      const allDisabled = controls.length > 0 && controls.every((c) => c.hasAttribute('disabled'));
      r.check(f.hasAttribute('hidden') || allDisabled, `${where}：没有 action 的表单必须默认 hidden 或全部控件默认 disabled（仅脚本筛选用）`);
    }
    else r.check(action === '/search/', `${where}：表单只允许提交到 /search/，实际 ${action}`);
  }
  r.check(p.root.querySelector('input[type="password"], input[type="file"]') === null, `${where}：不应有密码或文件输入`);
  // 内联 SVG
  for (const svg of p.root.querySelectorAll('svg')) {
    r.check(svg.querySelector('script, foreignObject, foreignobject') === null, `${where}：内联 SVG 不得含 script 或 foreignObject`);
  }
}

// ------------------------------------------------------------------ 2. 构建出的 CSS / JS
const files = [...walk(DIST)];
const rel = (f: string): string => path.relative(DIST, f).split(path.sep).join('/');
for (const f of files.filter((x) => x.endsWith('.css'))) {
  const css = fs.readFileSync(f, 'utf8');
  r.check(!/url\(\s*['"]?\s*data:/i.test(css), `${rel(f)}：CSS 里不得使用 data: 地址`);
  r.check(!/@import/i.test(css), `${rel(f)}：CSS 里不得 @import`);
  r.check(!/expression\s*\(|(?<![-\w])behavior\s*:|-moz-binding/i.test(css), `${rel(f)}：CSS 里有已废弃的脚本式写法`);
  for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const u = m[1]!;
    r.check(!/^(?:https?:)?\/\//i.test(u), `${rel(f)}：CSS 引用了外部地址 ${u}`);
  }
}
const FORBIDDEN_JS: { re: RegExp; label: string }[] = [
  { re: /\beval\s*\(/, label: 'eval()' },
  { re: /new\s+Function\s*\(/, label: 'new Function()' },
  { re: /document\.write\s*\(/, label: 'document.write' },
  { re: /\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML/, label: 'innerHTML / outerHTML / insertAdjacentHTML' },
  { re: /document\.cookie/, label: 'Cookie' },
  { re: /\b(?:localStorage|sessionStorage|indexedDB)\b/, label: '本地存储' },
  { re: /\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b/, label: '非必要的网络接口' },
  { re: /serviceWorker/, label: 'Service Worker' },
  { re: /\b(?:gtag|ga\(|fbq\(|_hmt|dataLayer|clarity)\b/, label: '统计/广告脚本' },
];
for (const f of files.filter((x) => x.endsWith('.js'))) {
  const js = fs.readFileSync(f, 'utf8');
  for (const { re, label } of FORBIDDEN_JS) r.check(!re.test(js), `${rel(f)}：脚本里出现 ${label}`);
  // 脚本里的 URL 只允许 SVG 命名空间
  for (const m of js.matchAll(/https?:\/\/[^\s"'`)\\]+/g)) {
    r.check(/^https?:\/\/www\.w3\.org\/(?:2000\/svg|1999\/xlink|1999\/xhtml)/.test(m[0]), `${rel(f)}：脚本里出现外部地址 ${m[0]}`);
  }
  // fetch 只能请求站内
  for (const m of js.matchAll(/fetch\(\s*([`'"])([^`'"]+)\1/g)) r.check(m[2]!.startsWith('/'), `${rel(f)}：fetch 请求了非站内地址 ${m[2]}`);
}

// ------------------------------------------------------------------ 3. 个人与敏感信息（dist + 源码）
const SECRET_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /wongminglee1234/i, label: '站长账号邮箱' },
  { re: /[A-Za-z0-9._%+-]+@(?!(?:2x|3x)\b)[A-Za-z0-9-]+\.(?:com|cn|net|org|io|me|cc|xyz|top|blog|app|dev)\b/i, label: '邮箱地址' },
  { re: /\b(?:vmess|vless|trojan|ss|ssr|hysteria2?|hy2|tuic|wireguard|socks5?):\/\/[^\s"'<]+/i, label: '节点 URI' },
  { re: /[?&](?:token|key|sub|subscribe|password|passwd|pwd|uuid|auth|access_token)=[A-Za-z0-9._~%-]{6,}/i, label: '带令牌的链接' },
  { re: /\/api\/v1\/client\/subscribe|\/sub\?target=|\/link\/[A-Za-z0-9]{12,}\?(?:sub|clash|mu)=/i, label: '订阅链接' },
  { re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i, label: 'UUID（可能是节点或账号标识）' },
  { re: /\b(?:ghp|gho|github_pat|glpat|xox[abps]|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,})[A-Za-z0-9_-]{8,}/, label: '访问令牌' },
  { re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, label: '私钥' },
  { re: /\b(?!(?:0|127|10|192|255)\.)(?:\d{1,3}\.){3}\d{1,3}\b(?!\.\d)/, label: 'IPv4 地址' },
];
const TEXT_EXT = /\.(?:html|css|js|json|csv|txt|xml|svg|map|md|mdx|ts|mjs|astro|yml|yaml|toml|example)$/i;
const scan = (label: string, text: string): void => {
  for (const { re, label: what } of SECRET_PATTERNS) {
    const m = text.match(re);
    if (!m) continue;
    // 允许项：IndexNow 密钥文件名、SVG 命名空间里的版本号、版本号形式的 x.y.z.w（如 1.0.0.0）等已在 re 里排除；
    // 构建产物里的 IPv4 例外：版本号（如 “3.2.1.0”）不会是 IP——这里要求四段都 ≤255 且不以 0 开头的整段
    if (what === 'IPv4 地址') {
      const octets = m[0].split('.').map(Number);
      if (octets.some((n) => n > 255) || octets[0] === 0) continue;
    }
    r.check(false, `${label}：出现${what}“${m[0].slice(0, 60)}”`);
  }
};
for (const f of files) {
  if (!TEXT_EXT.test(f) && path.basename(f) !== '_headers') continue;
  scan(`dist/${rel(f)}`, fs.readFileSync(f, 'utf8'));
}
const ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.astro', '.scratch', '.vscode']);
const SELF = path.resolve('scripts/validate-security.ts');
function* sourceFiles(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* sourceFiles(p);
    else yield p;
  }
}
for (const f of sourceFiles(ROOT)) {
  if (f === SELF || /package-lock\.json$/.test(f)) continue;
  // 站长提供的推广链接原文：其中的邮箱/令牌式参数由 validate-affiliates 单独负责，这里跳过
  if (f.includes(`${path.sep}docs${path.sep}source-material${path.sep}`)) continue;
  if (!TEXT_EXT.test(f) && !/\.(?:env|gitignore)/.test(path.basename(f))) continue;
  scan(path.relative(ROOT, f), fs.readFileSync(f, 'utf8'));
}
// .env 文件不得进入项目（只允许 .env.example，且其中不得有真实值）
for (const f of sourceFiles(ROOT)) {
  const base = path.basename(f);
  if (/^\.env(\..+)?$/.test(base) && base !== '.env.example') r.check(false, `${path.relative(ROOT, f)}：不应存在 .env 文件，请只保留 .env.example`);
}
const envExample = path.join(ROOT, '.env.example');
if (fs.existsSync(envExample)) {
  for (const line of fs.readFileSync(envExample, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) r.check(m[2]!.trim() === '', `.env.example：${m[1]} 不应写入真实值`);
  }
}

// ------------------------------------------------------------------ 4. dist 里的文件清单
const ALLOWED_EXT = new Set(['.html', '.css', '.js', '.json', '.csv', '.xml', '.svg', '.png', '.webp', '.avif', '.jpg', '.jpeg', '.ico', '.txt']); // .avif：深空背景图（有 webp 回退）
for (const f of files) {
  const name = rel(f);
  const base = path.basename(f);
  if (base === '_headers' || base === '_redirects') continue;
  r.check(ALLOWED_EXT.has(path.extname(f).toLowerCase()), `dist/${name}：不应公开此类型的文件`);
  r.check(!/\.map$/.test(f), `dist/${name}：不应发布源码映射`);
  r.check(!/(^|\/)\.(?!well-known)/.test(name), `dist/${name}：不应发布隐藏文件`);
  r.check(!/source-material|attachments|uploads|\.scratch|node_modules/.test(name), `dist/${name}：不应包含原始资料目录`);
  if (path.extname(f) === '.txt') {
    const ok = base === 'robots.txt' || (/^[0-9a-f]{32}\.txt$/.test(base) && fs.readFileSync(f, 'utf8').trim() === base.replace('.txt', ''));
    r.check(ok, `dist/${name}：只允许 robots.txt 和 IndexNow 密钥文件`);
  }
  if (path.extname(f) === '.json') r.check(['search-index.json', 'globe-dots.json'].includes(name), `dist/${name}：只允许公开 search-index.json 和背景地球点阵 globe-dots.json`);
  if (path.extname(f) === '.csv') r.check(name === 'data/test-records.csv', `dist/${name}：只允许公开 data/test-records.csv`);
}
// 图片体积：页面实际加载的图片（<img src>）必须小；只作为“查看原图”链接的证据原图可以大一些，但给出提示
const loaded = new Set<string>();
for (const p of pages()) {
  for (const el of p.root.querySelectorAll('img[src], source[srcset]')) {
    const v = el.getAttribute('src') ?? el.getAttribute('srcset') ?? '';
    for (const part of v.split(',')) loaded.add(decodeURIComponent(part.trim().split(/\s+/)[0]!));
  }
}
for (const f of files.filter((x) => /\.(png|jpe?g|webp)$/i.test(x))) {
  const kb = fs.statSync(f).size / 1024;
  const url = `/${rel(f)}`;
  if (loaded.has(url)) r.check(kb < 400, `dist${url}：页面会加载这张图，${kb.toFixed(0)}KB 过大，请压缩或转 WebP`);
  else if (kb > 3072) r.check(false, `dist${url}：${kb.toFixed(0)}KB，原图过大`);
  else if (kb > 900) r.warn(`dist${url}：${kb.toFixed(0)}KB，只作为“查看原图”链接使用，不会随页面加载。`);
}

// ------------------------------------------------------------------ 5. 响应头
const headersFile = path.join(DIST, '_headers');
if (r.check(fs.existsSync(headersFile), 'dist 里缺少 _headers（Cloudflare Pages / Netlify 的响应头配置）')) {
  const h = fs.readFileSync(headersFile, 'utf8');
  const csp = h.match(/Content-Security-Policy:\s*(.+)/)?.[1] ?? '';
  r.check(csp.length > 0, '_headers 缺少 Content-Security-Policy');
  for (const need of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self'", "font-src 'self'", "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) {
    r.check(csp.includes(need), `CSP 缺少 ${need}`);
  }
  r.check(!/unsafe-inline|unsafe-eval|unsafe-hashes/.test(csp), 'CSP 不得包含 unsafe-inline / unsafe-eval');
  r.check(!/(^|[\s;])\*([\s;]|$)/.test(csp) && !/\bdata:|\bhttp:|\bblob:/.test(csp), 'CSP 不得使用通配符、data:、http: 或 blob:');
  for (const need of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy:', 'Permissions-Policy:', 'Strict-Transport-Security:']) {
    r.check(h.includes(need), `_headers 缺少 ${need}`);
  }
  r.check(/Cache-Control:.*immutable/.test(h), '_headers：带哈希的 /_astro/* 应设置长期缓存');
}

r.finish();
