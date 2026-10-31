/** 中文搜索专项：真实浏览器在 /search/?q= 输入指定词，确认结果、空结果提示，以及索引加载失败时的提示。 */
import fs from 'node:fs';
import { chromium } from 'playwright';
import { startStaticServer } from './lib/static-server';
const s = await startStaticServer();
const b = await chromium.launch();
const terms = ['灵动云', '暮光加速', '香港节点', '日本节点', 'IPLC', 'IEPL', '晚高峰', 'firefly', '飞为', '唯兔云', 'zzqq不存在的词'];
const out: { term: string; status: string; first: string[]; ms: number; ok: boolean }[] = [];
for (const t of terms) {
  const p = await b.newPage();
  const t0 = Date.now();
  await p.goto(`${s.origin}/search/?q=${encodeURIComponent(t)}`, { waitUntil: 'networkidle' });
  await p.waitForFunction(() => (document.querySelector('[data-search-status]')?.textContent ?? '').trim().length > 0, null, { timeout: 5000 }).catch(() => undefined);
  const status = ((await p.textContent('[data-search-status]')) ?? '').trim();
  const first = (await p.$$eval('[data-search-results] a', (as) => as.slice(0, 3).map((a) => (a.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30))));
  const empty = t.includes('不存在');
  const ok = empty ? first.length === 0 && status.length > 0 : first.length > 0;
  out.push({ term: t, status, first, ms: Date.now() - t0, ok });
  await p.close();
}
// 索引加载失败
const p = await b.newPage();
await p.route('**/search-index.json', (r) => r.fulfill({ status: 500, body: 'x' }));
await p.goto(`${s.origin}/search/?q=灵动云`, { waitUntil: 'networkidle' });
await p.waitForTimeout(800);
const failStatus = ((await p.textContent('[data-search-status]')) ?? '').trim();
const fallbackVisible = await p.locator('[data-search-fallback]').isVisible();
out.push({ term: '（索引加载失败）', status: failStatus, first: [], ms: 0, ok: failStatus.length > 0 || fallbackVisible });
await b.close(); await s.close();
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/search-result.json', JSON.stringify(out, null, 1));
for (const o of out) console.log(`${o.ok ? '✓' : '✗'} ${o.term}：${o.status}｜${o.first.join(' / ')}`);
process.exit(out.every((o) => o.ok) ? 0 : 1);
