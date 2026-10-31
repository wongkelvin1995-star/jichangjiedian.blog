/**
 * 本地静态服务器：在进程内提供 dist/，行为尽量贴近 Cloudflare Pages：
 *  - 目录链接缺少结尾斜杠时 308 跳转到带斜杠的地址；
 *  - 找不到的地址返回 404 状态码，并输出 dist/404.html；
 *  - 响应头来自 dist/_headers（包括严格的 CSP），所以浏览器测试看到的就是上线后的安全策略——
 *    任何内联脚本、内联样式、外部资源都会在测试里变成 CSP 违规而被发现。
 */
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import zlib from 'node:zlib';

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.csv', '.svg']);

interface HeaderRule {
  pattern: string;
  headers: Record<string, string>;
}

function parseHeadersFile(file: string): HeaderRule[] {
  if (!fs.existsSync(file)) return [];
  const rules: HeaderRule[] = [];
  let cur: HeaderRule | null = null;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      cur = { pattern: line.trim(), headers: {} };
      rules.push(cur);
    } else if (cur) {
      const i = line.indexOf(':');
      if (i > 0) cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

const matches = (pattern: string, urlPath: string): boolean => (pattern.endsWith('*') ? urlPath.startsWith(pattern.slice(0, -1)) : pattern === urlPath);

export interface StaticServer {
  /** 例如 http://127.0.0.1:43211 */
  origin: string;
  /** 自启动以来收到的请求路径（含查询串），用于断言“某个文件在用户操作之前不应被请求” */
  requests: string[];
  close(): Promise<void>;
}

export async function startStaticServer(dist = path.resolve('dist')): Promise<StaticServer> {
  const rules = parseHeadersFile(path.join(dist, '_headers'));
  const requests: string[] = [];
  const notFound = path.join(dist, '404.html');

  const resolveFile = (pathname: string): string | null => {
    let rel: string;
    try {
      rel = decodeURIComponent(pathname);
    } catch {
      return null;
    }
    const full = path.normalize(path.join(dist, rel));
    if (!full.startsWith(dist)) return null; // 防止目录穿越
    if (rel.endsWith('/')) {
      const idx = path.join(full, 'index.html');
      return fs.existsSync(idx) ? idx : null;
    }
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
    return null;
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    requests.push(url.pathname + url.search);
    const send = (status: number, file: string | null, extra: Record<string, string> = {}): void => {
      const headers: Record<string, string> = { ...extra };
      for (const rule of rules) if (matches(rule.pattern, url.pathname)) Object.assign(headers, rule.headers);
      if (!file) {
        res.writeHead(status, headers);
        res.end();
        return;
      }
      const ext = path.extname(file).toLowerCase();
      headers['Content-Type'] = MIME[ext] ?? 'application/octet-stream';
      // 和 Cloudflare Pages 等托管一样，文本类文件按浏览器声明的能力做压缩传输（图片本身已压缩，不再压缩）。
      // 这样 Lighthouse 等工具测到的传输体积与线上一致，而不是把未压缩的 HTML 当成线上体积。
      const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(String(req.headers['accept-encoding'] ?? ''));
      if (gzip) {
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
      }
      res.writeHead(status, headers);
      if (req.method === 'HEAD') res.end();
      else if (gzip) fs.createReadStream(file).pipe(zlib.createGzip({ level: 6 })).pipe(res);
      else fs.createReadStream(file).pipe(res);
    };

    // 本地测试服务器不缓存：每次都取最新构建
    const noStore = { 'Cache-Control': 'no-store' };
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, null, { Allow: 'GET, HEAD', ...noStore });

    const file = resolveFile(url.pathname);
    if (file) return send(200, file, noStore);

    // 目录缺少结尾斜杠：308 到带斜杠的地址（与 Cloudflare Pages 一致）
    if (!url.pathname.endsWith('/') && !path.extname(url.pathname) && resolveFile(url.pathname + '/')) {
      return send(308, null, { Location: url.pathname + '/' + url.search, ...noStore });
    }
    return send(404, fs.existsSync(notFound) ? notFound : null, noStore);
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    origin: `http://127.0.0.1:${port}`,
    requests,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
