/** 把审计 JSON 结果转成 Markdown 表格片段，供报告引用 */
import fs from 'node:fs';
const art = JSON.parse(fs.readFileSync('reports/article-audit.json', 'utf8'));
const crawl = JSON.parse(fs.readFileSync('reports/crawl-result.json', 'utf8'));
const brand = JSON.parse(fs.readFileSync('reports/brand-audit.json', 'utf8'));
const search = JSON.parse(fs.readFileSync('reports/search-result.json', 'utf8'));
const esc = (s: string) => String(s).replace(/\|/g, '｜');
let a = '| URL | Title | 字数 | H2/H3 | 站内链接 | 发布 / 修改 | 结构化数据 | 剩余问题 | 结果 |\n|---|---|---|---|---|---|---|---|---|\n';
for (const r of art.rows) a += `| ${r.url} | ${esc(r.title)} | ${r.chars} | ${r.h2}/${r.h3} | ${r.internalLinks} | ${(r.published ?? '').slice(0, 10)} / ${(r.modified ?? '').slice(0, 10)} | ${r.ldTypes.join('、')} | ${r.issues.length ? esc(r.issues.join('；')) : '无'} | ${r.issues.length ? '✗' : '通过'} |\n`;
let c = '| URL | 链接数 | 按钮数 | 下拉/输入 | 关闭 JS 后 H1 | 关闭 JS 后正文字数 | 问题 |\n|---|---|---|---|---|---|---|\n';
for (const p of crawl.perPage) c += `| ${p.url} | ${p.links} | ${p.buttons} | ${p.controls} | ${p.noJsH1 ? '有' : '无'} | ${p.noJsChars} | ${p.problems.length ? esc(p.problems.join('；')) : '无'} |\n`;
let b = '| # | 机场 | 节点 | 地区 | 线路 | 最低月付 | 套餐数 | 本站实测 | 第三方测速行 | 问题 |\n|---|---|---|---|---|---|---|---|---|---|\n';
for (const r of brand.rows) b += `| ${String(r.rank).padStart(2, '0')} | ${r.name} | ${r.nodes ?? '—'} | ${esc(r.regions)} | ${r.routes} | ${r.lowest !== null ? '¥' + r.lowest : '—'} | ${r.plans} | ${r.siteRecords} | ${r.thirdPartyRecords} | ${r.issues.length ? r.issues.join('；') : '无'} |\n`;
let s = '| 搜索词 | 结果 | 前 3 条 | 判定 |\n|---|---|---|---|\n';
for (const r of search) s += `| ${r.term} | ${esc(r.status)} | ${esc(r.first.join(' / '))} | ${r.ok ? '通过' : '失败'} |\n`;
fs.writeFileSync('reports/_tables.json', JSON.stringify({ a, c, b, s }));
