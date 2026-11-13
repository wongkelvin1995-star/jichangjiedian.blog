/**
 * 证据与测试记录校验：
 *  - 没有原始证据的记录不得标为“已核验”；
 *  - 未知值是 null，不是 0（丢包率“网页工具未能测出”必须是空值）；
 *  - 没有日期的记录，时间窗口必须是 unknown，来源自述的窗口只能放在 claimedWindow，且不进入统计；
 *  - 第三方速度保留原图单位，不冒充本站测速；
 *  - 灵动云旗舰报告：标题、三份证据分开、整理图标注“数据整理图”、不夸大；
 *  - 构建产物：CSV 列、行数与数据一致；记录里引用的证据文件要么存在，要么在页面上明确写“待补充”。
 */
import fs from 'node:fs';
import path from 'node:path';
import { AVAILABILITY_SNAPSHOTS, EVIDENCE_FILES, TEST_RECORDS, isStatEligible } from '../src/data/test-records';
import { BRANDS } from '../src/data/brands';
import { LDY_REPORT_PATH, LDY_REPORT_TITLE } from '../src/data/reports/lingdongyun-sg-2026-10';
import { classifyWindow } from '../src/data/time-windows';
import { MAP_POINTS } from '../src/data/regions';
import { DIST, pages, textOf } from './lib/dist';
import { Report } from './lib/report';

const r = new Report('证据与测试记录校验');

const brandIds = new Set(BRANDS.map((b) => b.slug));
const evidenceById = new Map(EVIDENCE_FILES.map((e) => [e.evidenceId, e]));
const codes = new Set([...MAP_POINTS.map((p) => p.countryCode), 'OTHER']);
const existsInPublic = (p: string): boolean => fs.existsSync(path.join('public', p));

r.check(new Set(TEST_RECORDS.map((t) => t.testId)).size === TEST_RECORDS.length, '测试记录的 testId 必须唯一');

const NUMERIC = [
  'downloadMbps',
  'uploadMbps',
  'idleLatencyMs',
  'loadedDownloadLatencyMs',
  'loadedUploadLatencyMs',
  'jitterMs',
  'packetLossPercent',
  'testDurationSeconds',
  'sampleCount',
  'youtubeBufferSeconds',
] as const;

for (const t of TEST_RECORDS) {
  const where = `记录 ${t.testId}`;
  r.check(brandIds.has(t.brandId), `${where}：品牌 ${t.brandId} 不存在`);
  r.check(codes.has(t.nodeRegion), `${where}：地区代码 ${t.nodeRegion} 不在地图地区里`);
  for (const id of t.evidenceIds) r.check(evidenceById.has(id), `${where}：证据编号 ${id} 不存在`);

  // 未知 = null；数值必须是有限数，且不是 0（除丢包率可以真实为 0，但必须有测量依据——此处没有这类记录）
  for (const k of NUMERIC) {
    const v = t[k];
    r.check(v === null || (typeof v === 'number' && Number.isFinite(v)), `${where}：${k} 必须是 null 或有限数字`);
    // 丢包率可以真实为 0，但记录的 caveats 必须写明测量依据（例如“丢包 0%（1000/1000）”）
    const zeroAllowed = k === 'packetLossPercent' && t.caveats.some((c) => /丢包.*0%.*依据|0%.*\d+\/\d+/.test(c));
    r.check(v !== 0 || zeroAllowed, `${where}：${k} 为 0，未测得应为 null（如果确实测得 0，请在 caveats 里写明依据后再放行）`);
  }

  // 时间窗口
  r.check(t.timeWindow === classifyWindow(t.testDateTime), `${where}：timeWindow 必须由测试时间推出（实际 ${t.timeWindow}，应为 ${classifyWindow(t.testDateTime)}）`);
  if (t.testDateTime === null) {
    r.check(t.timeWindow === 'unknown', `${where}：没有日期的记录 timeWindow 必须是 unknown`);
    r.check(!isStatEligible(t), `${where}：没有日期的记录不得进入统计`);
  }
  if (t.testDateTime !== null) r.check(/\+08:00$/.test(t.testDateTime), `${where}：测试时间应写明 +08:00 时区`);

  // 已核验 = 有原始证据 + 有日期 + 证据文件真实存在
  if (t.isVerified) {
    r.check(t.testDateTime !== null, `${where}：标为已核验，但没有测试日期`);
    r.check(t.evidenceIds.length > 0, `${where}：标为已核验，但没有证据编号`);
    for (const id of t.evidenceIds) {
      const e = evidenceById.get(id);
      r.check(!!e && e.isOriginal && existsInPublic(e.publicPath), `${where}：已核验记录引用的证据 ${id} 不是已挂载的原始文件`);
    }
  }
  // 本站实测（A）但未核验：必须写明原因
  if (t.sourceType === 'A' && !t.isVerified) r.check(t.caveats.length > 0, `${where}：A 级但未核验，必须在 caveats 里写明原因`);
  // 第三方（C/D）：不是本站实测，不得标为已核验，速度不换算
  if (t.sourceType === 'C' || t.sourceType === 'D') {
    r.check(!t.isVerified, `${where}：第三方记录不得标为已核验`);
    r.check(t.caveats.length > 0, `${where}：第三方记录必须写明局限`);
  }
  // 抽查丢包率：网页工具没测出的，必须是 null
  if (t.testId === 'a-lingdongyun-sg-speedtest-undated') {
    r.check(t.packetLossPercent === null, `${where}：丢包率网页工具未能测出，必须是 null，不能是 0%`);
    r.check(t.testDateTime === null && t.timeWindow === 'unknown', `${where}：截图没有可见日期，不得补造日期`);
    r.check(!t.isVerified, `${where}：原始截图未挂载，必须保持“未核验”`);
  }
}

// 目前不应有任何记录进入时段统计（没有 A/B + 已核验 + 有日期 + 预设窗口内的记录）
r.check(TEST_RECORDS.filter(isStatEligible).every((t) => t.isVerified && t.testDateTime !== null), '进入统计的记录必须已核验且有日期');

// ------------------------------------------------------------------ 证据文件与快照
const missingOriginals: string[] = [];
for (const e of EVIDENCE_FILES) {
  r.check(brandIds.has(e.brandId), `证据 ${e.evidenceId}：品牌不存在`);
  if (!existsInPublic(e.publicPath)) {
    r.check(e.expected, `证据 ${e.evidenceId}：文件 ${e.publicPath} 不存在，且没有标为“待补充”`);
    missingOriginals.push(`${e.title}（${e.publicPath}）`);
  } else if (e.isOriginal === false) {
    r.check(e.kind === 'composite-image', `证据 ${e.evidenceId}：已存在但不是原图，只能是“数据整理图”`);
  }
}
if (missingOriginals.length) r.warn(`尚未挂载的原始截图（页面写明“原图已不保留”，不是破图）：${missingOriginals.join('；')}`);

for (const s of AVAILABILITY_SNAPSHOTS) {
  r.check(s.onlineNodes <= s.totalNodes, `快照 ${s.snapshotId}：在线数大于总数`);
  r.check(s.byRegion.reduce((n, x) => n + x.online, 0) === s.onlineNodes, `快照 ${s.snapshotId}：各地区在线数之和 ≠ 在线总数`);
  r.check(s.byRegion.reduce((n, x) => n + x.total, 0) === s.totalNodes, `快照 ${s.snapshotId}：各地区总数之和 ≠ 节点总数`);
  r.check(/\+08:00$/.test(s.checkedFrom), `快照 ${s.snapshotId}：时间应写明 +08:00`);
  r.check(!s.evidenceIds.some((id) => !evidenceById.has(id)), `快照 ${s.snapshotId}：引用了不存在的证据`);
}

// ------------------------------------------------------------------ 构建产物
if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  r.warn('没有 dist/，跳过构建产物检查（先运行 npm run build）。');
  r.finish();
}

// CSV
const csvFile = path.join(DIST, 'data', 'test-records.csv');
if (r.check(fs.existsSync(csvFile), 'dist 里缺少 data/test-records.csv')) {
  const csv = fs.readFileSync(csvFile, 'utf8').replace(/^﻿/, '');
  const rows = csv.trim().split(/\r?\n/);
  r.check(rows.length - 1 === TEST_RECORDS.length, `CSV 行数应为 ${TEST_RECORDS.length}，实际 ${rows.length - 1}`);
  const header = rows[0]!.split(',');
  const ci = (name: string): number => header.indexOf(name);
  for (const col of ['test_id', 'time_window', 'claimed_time_window', 'packet_loss_percent', 'is_verified']) r.check(ci(col) >= 0, `CSV 缺少列 ${col}`);
  // 简单 CSV 解析（含引号字段）
  const parseRow = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (q) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const ldy = rows.slice(1).map(parseRow).find((c) => c[ci('test_id')] === 'a-lingdongyun-sg-speedtest-undated');
  if (r.check(!!ldy, 'CSV 里缺少灵动云新加坡测速记录')) {
    r.check(ldy![ci('packet_loss_percent')] === '', 'CSV：灵动云新加坡测速的丢包率必须为空，不能是 0');
    r.check(ldy![ci('is_verified')] === 'no', 'CSV：灵动云新加坡测速应为 is_verified=no');
    r.check(ldy![ci('time_window')] === 'unknown', 'CSV：灵动云新加坡测速的 time_window 应为 unknown');
  }
  for (const cells of rows.slice(1).map(parseRow)) {
    if (cells[ci('test_datetime')] === '') r.check(cells[ci('time_window')] === 'unknown', `CSV：${cells[0]} 没有日期，time_window 必须是 unknown`);
    for (const k of ['download_mbps', 'upload_mbps', 'idle_latency_ms', 'jitter_ms', 'packet_loss_percent']) {
      const v = cells[ci(k)];
      // 丢包率 0 只允许出现在记录里写明了测量依据的那几条（与上面的记录级检查一致）
      const zeroOk = k === 'packet_loss_percent' && v === '0' && TEST_RECORDS.some((t) => t.testId === cells[0] && t.packetLossPercent === 0);
      r.check(v === '' || zeroOk || (Number(v) > 0 && Number.isFinite(Number(v))), `CSV：${cells[0]} 的 ${k} 为“${v}”（未测得应为空）`);
    }
  }
  r.check(!/(token|subscribe|password|vmess:\/\/|vless:\/\/|trojan:\/\/)/i.test(csv), 'CSV 不得包含订阅链接、令牌或密码');
}

// 灵动云旗舰报告
const report = pages().find((p) => p.urlPath === LDY_REPORT_PATH);
if (r.check(!!report, `找不到旗舰报告页面 ${LDY_REPORT_PATH}`)) {
  const p = report!;
  const h1 = p.root.querySelector('h1')?.text.trim();
  r.check(h1 === LDY_REPORT_TITLE, `旗舰报告 H1 应为“${LDY_REPORT_TITLE}”，实际“${h1}”`);
  r.check(p.root.querySelector('title')?.text.includes(LDY_REPORT_TITLE) === true, '旗舰报告的 <title> 应包含报告标题');
  const text = textOf(p);
  for (const must of ['测速汇总图', '空载延迟', '负载延迟', '未测得', '网页工具', '未标注']) r.check(text.includes(must), `旗舰报告应包含“${must}”`);
  r.check(!/丢包率?\s*[:：]?\s*0(\.0+)?\s*%/.test(text), '旗舰报告不得把丢包率写成 0%');
  // 提到 4K 的句子必须是否定或说明“没有测”
  for (const s of text.split(/[。；]/).filter((x) => /4K/i.test(x))) r.check(/没有|未|不能|不代表|只观察/.test(s), `旗舰报告里提到 4K 的句子必须是否定/说明局限：“${s.slice(0, 40)}…”`);
  for (const s of text.split(/[。；]/).filter((x) => /所有\s*AI|全部\s*AI|AI 工具均|全部节点/.test(x))) r.check(/不|没|未/.test(s), `旗舰报告不得断言“所有 AI/全部节点”可用：“${s.slice(0, 40)}…”`);
  // 图片：整理图必须挂载在站内路径下，且页面上有“数据整理图”说明
  // 只检查正文里的图片：页面背景层（.cosmos）的三张图是纯装饰（容器 aria-hidden，alt 只是给 Bing 站长工具看的短标签），不属于报告内容
  const contentImgs = p.root.querySelectorAll('main img');
  const imgs = p.root.querySelectorAll('img').map((i) => i.getAttribute('src') ?? '');
  r.check(
    imgs.every((src) => fs.existsSync(path.join(DIST, decodeURIComponent(src.split('?')[0]!)))),
    '旗舰报告里的图片文件必须都存在于 dist',
  );
  r.check(
    contentImgs.length > 0 && contentImgs.every((i) => (i.getAttribute('alt') ?? '').trim().length >= 6),
    '旗舰报告里的图片必须有说明性 alt',
  );
}

// ------------------------------------------------------------------ 状态一致性（补齐原图之后的防护）
// 原图缺失时，上面已经要求页面写明“待补充”。反过来：三份原始截图都挂载之后，站内就不应再出现“原图待补充 / 原始截图尚未挂载”，
// 否则会出现“一处写已核验、另一处写待补充”的自相矛盾。这些文字散落在多个页面里，而且补齐原图后还需要对照原图重新核对数字、
// 改写叙述，所以这里不做自动替换，只在状态不一致时报错，并列出需要改写的页面。
{
  const originals = EVIDENCE_FILES.filter((e) => e.isOriginal);
  const allMounted = originals.length > 0 && originals.every((e) => existsInPublic(e.publicPath));
  if (allMounted) {
    const STALE = /原图待补充|原始截图尚未挂载|原始截图未挂载|截图尚未挂载/;
    for (const p of pages()) {
      const hit = STALE.exec(textOf(p));
      r.check(!hit, `${p.urlPath}：原始截图都已挂载，页面却仍写着“${hit?.[0]}”。请对照原图核对数字，并按实际证据状态改写这一页的文字`);
    }
    r.check(
      TEST_RECORDS.filter((t) => t.sourceType === 'A').every((t) => t.isVerified || t.testDateTime === null),
      '原始截图都已挂载：有日期的本站记录应改为 isVerified = true（没有可见日期的记录仍保持未核验）',
    );
  }
}

r.finish();
