/**
 * 外部链接有效性检查（需要联网，请在你自己的电脑或部署环境里运行；读取 dist/，需先 npm run build）。
 *
 * 为什么单独成脚本：本项目的其余校验都是离线的、结果可复现，而外链是否可达取决于运行时的网络和对方服务器，
 * 不适合放进 npm run verify。开发沙箱的网络只开放了包管理源，所以这个脚本在沙箱里只做过本地自检（--selftest），
 * 并没有真正检查过 34 个推广链接——上线前请在能上网的环境里运行一次。
 *
 * 做什么：
 *  1. 收集 dist 里所有指向本站以外的 <a href>（推广链接、来源链接等），去重；
 *  2. 逐个请求（先 HEAD，被拒绝或报错时改用 GET；手动跟随最多 6 次跳转，记录跳转链）；
 *  3. 分类：
 *       ok        最终状态 2xx；
 *       uncertain 401/403/429/503 或超时——很可能是对方拦截了自动请求，需要人工在浏览器里确认；
 *       broken    404/410/其他 4xx、5xx、域名解析失败、连接被拒绝、证书错误等；
 *  4. 只读取，不改任何链接——推广链接必须与站长提供的原始字符串逐字一致，本脚本从不重写、不“修复”链接。
 *
 * 用法：
 *   npm run build
 *   npm run check:external                       # 检查全部外链
 *   npm run check:external -- --affiliate-only   # 只检查 34 个推广链接
 *   npm run check:external -- --timeout 20000 --concurrency 4 --out external-links-report.json
 *   npm run check:external -- --selftest         # 不联网：用本地服务器验证脚本自己的分类逻辑
 *
 * 退出码：有 broken 时为 1（可加 --warn-only 让它始终为 0）；只有 ok / uncertain 时为 0。
 *
 * 注意（推广链接）：检查推广链接就是向联盟追踪地址发请求。部分联盟系统可能把这类请求记成一次点击或访问，
 * 影响你在联盟后台看到的数据。只想确认域名还活着的话，可以先用 --affiliate-only 抽查，不必每次发布都全量检查。
 */
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { SITE, pages, requireDist } from './lib/dist';

const args = process.argv.slice(2);
const flag = (name: string): boolean => args.includes(`--${name}`);
const opt = (name: string, fallback: string): string => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1]! : fallback;
};

export type Verdict = 'ok' | 'uncertain' | 'broken';
export interface CheckResult {
  url: string;
  verdict: Verdict;
  status: number | null;
  finalUrl: string;
  hops: number;
  method: 'HEAD' | 'GET';
  reason: string;
}

const UA = 'jichangjiedian-link-check/1.0 (+https://jichangjiedian.blog)';
const MAX_HOPS = 6;

/** 把请求结果归类。状态码 → 结论；401/403/429/503 视为“可能被拦截”，不当作失效 */
export function classify(status: number): { verdict: Verdict; reason: string } {
  if (status >= 200 && status < 300) return { verdict: 'ok', reason: `HTTP ${status}` };
  if ([401, 403, 429, 503].includes(status)) return { verdict: 'uncertain', reason: `HTTP ${status}（对方可能拦截了自动请求，请用浏览器确认）` };
  return { verdict: 'broken', reason: `HTTP ${status}` };
}

async function request(url: string, method: 'HEAD' | 'GET', timeoutMs: number): Promise<Response> {
  const res = await fetch(url, {
    method,
    redirect: 'manual',
    headers: { 'User-Agent': UA, Accept: 'text/html,*/*;q=0.8' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  void res.body?.cancel().catch(() => undefined); // 只要状态和响应头，不读正文
  return res;
}

/** 检查一个 URL：先 HEAD，HEAD 不行就 GET；手动跟随跳转 */
export async function checkUrl(url: string, timeoutMs = 15000): Promise<CheckResult> {
  let current = url;
  let method: 'HEAD' | 'GET' = 'HEAD';
  let hops = 0;
  try {
    for (;;) {
      let res = await request(current, method, timeoutMs).catch((e: unknown) => {
        if (method === 'HEAD') return null; // 个别服务器不接受 HEAD 并直接断开：换 GET 再试
        throw e;
      });
      if (res === null || (method === 'HEAD' && (res.status === 405 || res.status === 501 || res.status >= 400))) {
        method = 'GET';
        res = await request(current, 'GET', timeoutMs);
      }
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        if (++hops > MAX_HOPS) return { url, verdict: 'broken', status: res.status, finalUrl: current, hops, method, reason: `跳转超过 ${MAX_HOPS} 次` };
        current = new URL(res.headers.get('location')!, current).toString();
        continue;
      }
      const c = classify(res.status);
      return { url, status: res.status, finalUrl: current, hops, method, ...c };
    }
  } catch (e) {
    return { url, ...describeNetworkError(e, timeoutMs), status: null, finalUrl: current, hops, method };
  }
}

/**
 * 把 fetch 抛出的网络错误归类。Node 的 fetch 只抛出 “TypeError: fetch failed”，真正的原因在 error.cause 里。
 *  - 域名解析失败、连接被拒绝、证书错误：访客同样打不开 → broken；
 *  - 超时、连接被重置、临时的 DNS 故障：可能只是网络波动或对方限速 → uncertain，需要人工确认。
 */
export function describeNetworkError(e: unknown, timeoutMs: number): { verdict: Verdict; reason: string } {
  const err = e as Error & { cause?: Error & { code?: string; cause?: Error & { code?: string } } };
  if (err.name === 'TimeoutError' || err.name === 'AbortError') {
    return { verdict: 'uncertain', reason: `超过 ${timeoutMs / 1000} 秒没有响应（可能是网络或对方限速）` };
  }
  const code = err.cause?.code ?? err.cause?.cause?.code ?? '';
  const detail = `${err.cause?.message ?? ''} ${err.message}`;
  if (code === 'ENOTFOUND') return { verdict: 'broken', reason: '域名解析失败（域名不存在或已失效）' };
  if (code === 'ECONNREFUSED') return { verdict: 'broken', reason: '连接被拒绝（服务器没有在监听）' };
  if (/CERT|TLS|SSL/i.test(code + detail)) return { verdict: 'broken', reason: `证书/TLS 错误（${code || '见详情'}）` };
  if (['EAI_AGAIN', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_SOCKET'].includes(code)) {
    return { verdict: 'uncertain', reason: `网络中断或超时（${code}），可能是临时问题，请稍后重试或用浏览器确认` };
  }
  if (/bad port/i.test(detail)) return { verdict: 'broken', reason: '链接使用了浏览器与 fetch 都禁止访问的端口' };
  return { verdict: 'broken', reason: `请求失败：${code || err.cause?.message || err.message}` };
}

/** 并发受限的 map（对外链保持礼貌：默认同时 6 个） */
async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]!, i);
      }
    }),
  );
  return out;
}

// ------------------------------------------------------------------ 自检（不联网）
async function selftest(): Promise<never> {
  const server = http.createServer((req, res) => {
    const u = new URL(req.url ?? '/', 'http://x');
    const send = (code: number, headers: Record<string, string> = {}) => {
      res.writeHead(code, headers);
      res.end(req.method === 'HEAD' ? undefined : 'x');
    };
    switch (u.pathname) {
      case '/ok': return send(200);
      case '/redirect': return send(301, { Location: '/ok' });
      case '/loop': return send(302, { Location: '/loop' });
      case '/gone': return send(404);
      case '/boom': return send(500);
      case '/blocked': return send(403);
      case '/head-405': return req.method === 'HEAD' ? send(405) : send(200);
      case '/head-404-get-200': return req.method === 'HEAD' ? send(404) : send(200);
      case '/slow': return void setTimeout(() => send(200), 3000);
      default: return send(404);
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  // 先占用再释放一个端口，保证此刻没有服务在监听 → ECONNREFUSED。
  // 不能写死 127.0.0.1:1：fetch 把端口 1 列为禁用端口，会在连接之前就报 “bad port”，测不到真正的拒绝连接。
  const probe = http.createServer();
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve));
  const deadPort = (probe.address() as AddressInfo).port;
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  const dead = `http://127.0.0.1:${deadPort}/`;
  const cases: [string, Verdict, string][] = [
    ['/ok', 'ok', '200'],
    ['/redirect', 'ok', '301 → 200'],
    ['/loop', 'broken', '跳转死循环'],
    ['/gone', 'broken', '404'],
    ['/boom', 'broken', '500'],
    ['/blocked', 'uncertain', '403 视为可能被拦截'],
    ['/head-405', 'ok', 'HEAD 405 后改用 GET'],
    ['/head-404-get-200', 'ok', 'HEAD 404 但 GET 200：以 GET 为准'],
    ['/slow', 'uncertain', '超时'],
  ];
  let failed = 0;
  for (const [p, want, label] of cases) {
    const r = await checkUrl(base + p, p === '/slow' ? 500 : 3000);
    const good = r.verdict === want;
    if (!good) failed++;
    console.log(`  ${good ? '✓' : '✗'} ${label}：${r.verdict}（${r.reason}）`);
  }
  const d = await checkUrl(dead, 2000);
  const goodDead = d.verdict === 'broken' && d.reason.startsWith('连接被拒绝');
  if (!goodDead) failed++;
  console.log(`  ${goodDead ? '✓' : '✗'} 连接被拒绝：${d.verdict}（${d.reason}）`);
  // 错误归类（不依赖网络）：用构造好的错误对象验证每一类
  const mk = (code: string, message = 'x'): unknown => Object.assign(new TypeError('fetch failed'), { cause: Object.assign(new Error(message), { code }) });
  const classCases: [string, unknown, Verdict, string][] = [
    ['域名解析失败', mk('ENOTFOUND'), 'broken', '域名解析失败'],
    ['连接被拒绝', mk('ECONNREFUSED'), 'broken', '连接被拒绝'],
    ['证书过期', mk('CERT_HAS_EXPIRED'), 'broken', '证书'],
    ['连接被重置', mk('ECONNRESET'), 'uncertain', '网络中断'],
    ['临时 DNS 故障', mk('EAI_AGAIN'), 'uncertain', '网络中断'],
    ['禁用端口', Object.assign(new TypeError('fetch failed'), { cause: new Error('bad port') }), 'broken', '端口'],
  ];
  for (const [label, err, want, text] of classCases) {
    const r = describeNetworkError(err, 3000);
    const good = r.verdict === want && r.reason.includes(text);
    if (!good) failed++;
    console.log(`  ${good ? '✓' : '✗'} 错误归类 · ${label}：${r.verdict}（${r.reason}）`);
  }
  server.close();
  console.log(failed === 0 ? '\n✓ 自检通过（分类逻辑正确；注意这没有检查任何真实外链）' : `\n✗ 自检失败 ${failed} 项`);
  process.exit(failed === 0 ? 0 : 1);
}

// ------------------------------------------------------------------ 主流程
if (flag('selftest')) await selftest();

requireDist();
const siteHost = new URL(SITE).host;
const affiliateOnly = flag('affiliate-only');
const timeout = Number(opt('timeout', '15000'));
const concurrency = Number(opt('concurrency', '6'));
const outFile = opt('out', 'external-links-report.json');

const usage = new Map<string, { pages: Set<string>; sponsored: boolean }>();
for (const p of pages()) {
  for (const a of p.root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')!;
    if (!/^https?:\/\//i.test(href)) continue;
    let u: URL;
    try {
      u = new URL(href);
    } catch {
      continue;
    }
    if (u.host === siteHost) continue;
    const rel = (a.getAttribute('rel') ?? '').toLowerCase();
    const cur = usage.get(href) ?? { pages: new Set<string>(), sponsored: false };
    cur.pages.add(p.urlPath);
    cur.sponsored ||= rel.includes('sponsored');
    usage.set(href, cur);
  }
}
const urls = [...usage.keys()].filter((u) => !affiliateOnly || usage.get(u)!.sponsored);
if (urls.length === 0) {
  console.log('没有找到需要检查的外部链接。');
  process.exit(0);
}
console.log(`\n▶ 外部链接有效性检查：${urls.length} 个链接（${affiliateOnly ? '仅推广链接' : '全部外链'}），并发 ${concurrency}，超时 ${timeout / 1000}s\n`);

const results = await mapLimit(urls, concurrency, async (u, i) => {
  const r = await checkUrl(u, timeout);
  const mark = r.verdict === 'ok' ? '✓' : r.verdict === 'uncertain' ? '?' : '✗';
  console.log(`  ${mark} [${i + 1}/${urls.length}] ${new URL(u).host}${new URL(u).pathname === '/' ? '' : new URL(u).pathname}  ${r.reason}${r.hops ? `（跳转 ${r.hops} 次 → ${new URL(r.finalUrl).host}）` : ''}`);
  return r;
});

const count = (v: Verdict): number => results.filter((r) => r.verdict === v).length;
fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      note: '由 scripts/check-external-links.ts 生成。uncertain = 可能被对方拦截或超时，需要人工在浏览器确认。',
      summary: { total: results.length, ok: count('ok'), uncertain: count('uncertain'), broken: count('broken') },
      results: results.map((r) => ({ ...r, usedOn: [...usage.get(r.url)!.pages].sort(), sponsored: usage.get(r.url)!.sponsored })),
    },
    null,
    2,
  ),
);
console.log(`\n结果：可达 ${count('ok')}，需人工确认 ${count('uncertain')}，失效 ${count('broken')}。详细报告已写入 ${outFile}。`);
if (count('broken') > 0) {
  console.log('\n失效的链接：');
  for (const r of results.filter((x) => x.verdict === 'broken')) console.log(`  ✗ ${r.url}\n      ${r.reason}；用于：${[...usage.get(r.url)!.pages].slice(0, 3).join('、')}`);
  console.log('\n注意：推广链接不要自行改写或“修复”；失效时请向服务商确认新的推广地址，再替换站长提供的原始字符串。');
}
process.exit(count('broken') > 0 && !flag('warn-only') ? 1 : 0);
