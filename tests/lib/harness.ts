/**
 * 浏览器测试的公共部分：启动静态服务器和 Chromium，提供 test() 与“页面问题收集器”。
 *
 * 问题收集器会记录：控制台错误、未捕获异常、失败或 4xx/5xx 的请求、CSP 违规、
 * 以及任何试图访问本站以外域名的请求（测试中一律拦截，不会真的出网）。
 */
import { chromium } from 'playwright';
import type { Browser, BrowserContext, BrowserContextOptions, Page } from 'playwright';
import { startStaticServer } from './static-server';
import type { StaticServer } from './static-server';

export interface Problems {
  list: string[];
  /** 本页收到的所有请求 URL（含被拦截的外部请求） */
  requested: string[];
}

export interface Env {
  server: StaticServer;
  browser: Browser;
  /** 新建一个带问题收集器的页面（每个测试用自己的上下文，互不影响） */
  open(opts?: BrowserContextOptions & { allow404?: string[] }): Promise<{ page: Page; context: BrowserContext; problems: Problems }>;
  close(): Promise<void>;
}

export async function setup(): Promise<Env> {
  const server = await startStaticServer();
  const browser = await chromium.launch();
  const contexts: BrowserContext[] = [];

  return {
    server,
    browser,
    async open(opts = {}) {
      const { allow404 = [], ...ctxOpts } = opts;
      const context = await browser.newContext({ locale: 'zh-CN', timezoneId: 'Asia/Shanghai', ...ctxOpts });
      contexts.push(context);
      const page = await context.newPage();
      const problems: Problems = { list: [], requested: [] };

      // 站外请求一律拦截并记录：页面不应该访问任何第三方
      await context.route('**/*', (route) => {
        const url = route.request().url();
        problems.requested.push(url);
        if (url.startsWith(server.origin)) return route.continue();
        problems.list.push(`请求了站外地址（已拦截）：${url}`);
        return route.abort();
      });

      // tsx（esbuild）会给嵌套函数加 __name 辅助函数；传给 page.evaluate 的函数在浏览器里没有它，这里补一个空实现
      await context.addInitScript({ content: 'window.__name = window.__name || function (f) { return f; };' });

      // CSP 违规：用 Playwright 的初始化脚本（经 CDP 注入，不受页面 CSP 约束）监听事件
      await context.addInitScript(() => {
        const w = window as unknown as { __csp: string[] };
        w.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) => {
          w.__csp.push(`${e.violatedDirective} → ${e.blockedURI || 'inline'} @ ${e.sourceFile || location.pathname}:${e.lineNumber}`);
        });
      });

      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') problems.list.push(`控制台${m.type()}：${m.text()}`);
      });
      page.on('pageerror', (e) => problems.list.push(`未捕获异常：${e.message}`));
      page.on('requestfailed', (r) => {
        if (!r.url().startsWith(server.origin)) return; // 站外的已在上面记录
        problems.list.push(`请求失败：${r.url()}（${r.failure()?.errorText}）`);
      });
      page.on('response', (r) => {
        const u = new URL(r.url());
        if (r.status() >= 400 && !allow404.includes(u.pathname)) problems.list.push(`HTTP ${r.status()}：${r.url()}`);
      });
      return { page, context, problems };
    },
    async close() {
      for (const c of contexts) await c.close().catch(() => undefined);
      await browser.close();
      await server.close();
    },
  };
}

/** 读取页面里累计的 CSP 违规 */
export async function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
}

export async function collectCsp(page: Page, problems: Problems): Promise<void> {
  for (const v of await cspViolations(page)) problems.list.push(`CSP 违规：${v}`);
}

// ------------------------------------------------------------------ 极简测试运行器
interface Case {
  name: string;
  fn: () => Promise<void>;
}
const cases: Case[] = [];
export const test = (name: string, fn: () => Promise<void>): void => {
  cases.push({ name, fn });
};

export class Assert {
  failures: string[] = [];
  count = 0;
  ok(cond: unknown, msg: string): void {
    this.count++;
    if (!cond) this.failures.push(msg);
  }
  eq<T>(actual: T, expected: T, msg: string): void {
    this.count++;
    if (actual !== expected) this.failures.push(`${msg}（期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}）`);
  }
}

export async function run(title: string, after?: () => Promise<void>): Promise<never> {
  console.log(`\n▶ ${title}`);
  let failed = 0;
  let checks = 0;
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length);
  for (const c of cases) {
    if (only && !c.name.includes(only)) continue;
    const a = new Assert();
    current = a;
    const t0 = Date.now();
    try {
      await c.fn();
    } catch (e) {
      a.failures.push(`异常：${(e as Error).message.split('\n')[0]}`);
    }
    checks += a.count;
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (a.failures.length === 0) console.log(`  ✓ ${c.name}（${a.count} 项，${secs}s）`);
    else {
      failed++;
      console.log(`  ✗ ${c.name}（${secs}s）`);
      for (const f of a.failures.slice(0, 12)) console.log(`      - ${f}`);
      if (a.failures.length > 12) console.log(`      …另有 ${a.failures.length - 12} 项`);
    }
  }
  console.log(failed === 0 ? `  ✓ ${title}：全部通过，共 ${checks} 项检查` : `  ✗ ${title}：${failed} 个用例失败`);
  await after?.();
  process.exit(failed === 0 ? 0 : 1);
}

let current = new Assert();
/** 在用例里取得当前断言器 */
export const a = (): Assert => current;
