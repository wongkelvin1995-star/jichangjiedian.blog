/**
 * 原创性检查：文章与教程的正文，有没有大段照搬你上传的资料（TXT 页面存档、MD 汇编资料）。
 *
 * 方法：把资料和文章都去掉空白与标点，只保留汉字、字母和数字，然后取每 N 个连续字符（默认 12）作为一个“片段”。
 * 文章里的片段如果在资料里也出现，就算“重合”。重合比例高，或者有很长的连续重合，说明可能是照搬。
 *
 * 判定（文章与教程，必须通过）：
 *   - 重合片段占比 ≤ 8%；
 *   - 没有任何一段连续重合超过 36 个字符（约两三句话）。
 * 数字、品牌名、套餐名等事实性信息会带来少量自然重合，所以不是要求 0%。
 *
 * 资料文件不在仓库里（它们是你提供的原始资料），所以需要用 --sources 指定存放 TXT/MD 的文件夹：
 *   npx tsx scripts/check-originality.ts --sources /path/to/你的资料文件夹
 *   npx tsx scripts/check-originality.ts --sources ./资料 --ngram 10 --max-ratio 0.06 --pages   # 同时看 dist 里的全部页面（只提示，不判失败）
 *
 * 文件名含 “attachment” 的文件（例如总指令本身）默认不参与比对；可用 --exclude 追加。
 */
import fs from 'node:fs';
import path from 'node:path';
import { pages, requireDist, textOf } from './lib/dist';
import { Report } from './lib/report';

const args = process.argv.slice(2);
const opt = (name: string, fallback?: string): string | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const multi = (name: string): string[] => args.flatMap((a, i) => (a === `--${name}` && args[i + 1] ? [args[i + 1]!] : []));

const sourcesDir = opt('sources');
if (!sourcesDir) {
  console.error('用法：npx tsx scripts/check-originality.ts --sources <存放 TXT/MD 资料的文件夹> [--ngram 12] [--max-ratio 0.08] [--max-run 36] [--pages]');
  process.exit(2);
}
const N = Number(opt('ngram', '12'));
const MAX_RATIO = Number(opt('max-ratio', '0.08'));
const MAX_RUN = Number(opt('max-run', '36'));
const excludes = ['attachment', ...multi('exclude')];

/** 只保留汉字、字母、数字（按码点），去掉空白、标点、Markdown 符号 */
const normalize = (s: string): string[] => Array.from(s.toLowerCase()).filter((ch) => /[\p{Script=Han}a-z0-9]/u.test(ch));

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// ---- 资料语料
const corpusFiles = [...walk(path.resolve(sourcesDir))].filter((f) => /\.(txt|md)$/i.test(f) && !excludes.some((x) => path.basename(f).includes(x)));
if (corpusFiles.length === 0) {
  console.error(`✗ 在 ${sourcesDir} 里没有找到可比对的 .txt/.md 文件。`);
  process.exit(2);
}
const shingles = new Set<string>();
let corpusChars = 0;
for (const f of corpusFiles) {
  const chars = normalize(fs.readFileSync(f, 'utf8'));
  corpusChars += chars.length;
  for (let i = 0; i + N <= chars.length; i++) shingles.add(chars.slice(i, i + N).join(''));
}

interface Overlap {
  total: number;
  matched: number;
  longest: number;
  sample: string;
}

/** 返回重合片段数、占比所需的总数，以及最长连续重合（字符数）与示例 */
function overlap(text: string): Overlap {
  const chars = normalize(text);
  const hit: boolean[] = [];
  for (let i = 0; i + N <= chars.length; i++) hit.push(shingles.has(chars.slice(i, i + N).join('')));
  let matched = 0;
  let longest = 0;
  let sample = '';
  let runStart = -1;
  for (let i = 0; i <= hit.length; i++) {
    if (i < hit.length && hit[i]) {
      matched++;
      if (runStart < 0) runStart = i;
    } else if (runStart >= 0) {
      const len = i - runStart + N - 1; // 连续命中 k 个片段 ≈ 连续重合 k+N-1 个字符
      if (len > longest) {
        longest = len;
        sample = chars.slice(runStart, Math.min(runStart + 40, i + N - 1)).join('');
      }
      runStart = -1;
    }
  }
  return { total: hit.length, matched, longest, sample };
}

// ---- 文章与教程正文（去掉 frontmatter 和代码块）
const r = new Report('原创性检查（与上传资料的重合度）');
const contentDir = path.resolve('src', 'content');
const posts = [...walk(contentDir)].filter((f) => /\.(md|mdx)$/i.test(f));
let worst = 0;
for (const f of posts) {
  const raw = fs.readFileSync(f, 'utf8').replace(/^---[\s\S]*?\n---\n/, '').replace(/```[\s\S]*?```/g, '');
  const o = overlap(raw);
  const ratio = o.total === 0 ? 0 : o.matched / o.total;
  worst = Math.max(worst, ratio);
  const name = path.relative(contentDir, f);
  r.check(ratio <= MAX_RATIO, `${name}：与资料重合 ${(ratio * 100).toFixed(1)}%，超过 ${(MAX_RATIO * 100).toFixed(0)}%`, `最长连续重合 ${o.longest} 字：“${o.sample}…”`);
  r.check(o.longest <= MAX_RUN, `${name}：有 ${o.longest} 个字符的连续重合，超过 ${MAX_RUN}`, `示例：“${o.sample}…”`);
  console.log(`  · ${name}：重合 ${(ratio * 100).toFixed(1)}%（${o.matched}/${o.total}），最长连续 ${o.longest} 字`);
}

// ---- 可选：dist 里的全部页面（只提示）
if (args.includes('--pages')) {
  requireDist();
  const rows = pages()
    .map((p) => ({ path: p.urlPath, ...overlap(textOf(p)) }))
    .map((x) => ({ ...x, ratio: x.total ? x.matched / x.total : 0 }))
    .sort((a, b) => b.ratio - a.ratio);
  console.log('\n  页面文字与资料的重合度（只供参考；品牌名、套餐名、价格等事实性信息会带来自然重合）：');
  for (const x of rows.slice(0, 12)) console.log(`   ${(x.ratio * 100).toFixed(1).padStart(5)}%  最长连续 ${String(x.longest).padStart(3)} 字  ${x.path}`);
}

r.warn(`资料共 ${corpusFiles.length} 个文件、${corpusChars} 个字符；文章与教程 ${posts.length} 篇；片段长度 ${N}；最高重合 ${(worst * 100).toFixed(1)}%。`);
r.finish();
