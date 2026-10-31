/**
 * 生成“品牌 × 资料来源”对照表（Markdown，输出到标准输出），用于 docs/DATA_SOURCES.md 的附录。
 * 数据直接取自 src/data（品牌索引、来源登记表、品牌档案），不手写，所以不会与站内数据不一致。
 *
 * 用法：npx tsx scripts/report-sources.ts > docs/DATA_SOURCES_TABLE.md
 */
import { BRANDS } from '../src/data/brands';
import { VERIFICATION_LABEL } from '../src/data/labels';
import { SOURCES, SOURCE_KIND_LABEL, sourcesForBrand } from '../src/data/source-registry';

const cell = (s: string): string => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

console.log('# 品牌与资料来源对照表（自动生成）\n');
console.log('由 `scripts/report-sources.ts` 从 `src/data` 生成。展示顺序是站长指定的固定编辑顺序，**不是排名**；“上传编号”只用来追溯文件，不参与排序。\n');
console.log('来源等级：A 本站实测 · B 服务商公开资料 · C 第三方历史参考 / 无日期的页面存档 · D 待核验或资料冲突。\n');
console.log('| 顺序 | 品牌 | slug | 上传编号 | 页面存档（TXT） | 汇编资料（MD） | 本站状态 | 冲突 | 高风险提示 | 品牌页 |');
console.log('| ---: | --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |');
for (const b of BRANDS) {
  const srcs = sourcesForBrand(b.brandId);
  const page = srcs.find((s) => s.kind === 'provider-page-capture' || s.kind === 'third-party-page-capture');
  const md = srcs.find((s) => s.kind === 'compiled-library');
  const pageText = page ? `${SOURCE_KIND_LABEL[page.kind]}${page.statedDate ? `，页面标注 ${page.statedDate}` : '，页面未标注日期'}（默认 ${page.defaultGrade}）` : '无';
  const mdText = md ? `有（默认 ${md.defaultGrade}，只作线索）` : '无';
  console.log(
    `| ${String(b.displayRank).padStart(2, '0')} | ${cell(b.brandName)} | ${b.slug} | ${b.uploadFileNo} | ${cell(pageText)} | ${mdText} | ${VERIFICATION_LABEL[b.verificationStatus]} | ${b.conflictCount} | ${b.highNoticeCount} | ${b.detailPage === 'open' ? '独立页，可索引' : '资料卡，noindex'} |`,
  );
}

console.log('\n## 全部来源登记（含特殊来源）\n');
console.log('| sourceId | 类型 | 标题 | 页面自述日期 | 默认等级 | 说明 |');
console.log('| --- | --- | --- | --- | :---: | --- |');
for (const s of SOURCES) {
  console.log(`| ${s.sourceId} | ${SOURCE_KIND_LABEL[s.kind]} | ${cell(s.title)} | ${s.statedDate ?? '—'} | ${s.defaultGrade} | ${cell(s.notes ?? '')} |`);
}
