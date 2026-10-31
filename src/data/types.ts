/**
 * 机场节点 · 统一数据模型
 *
 * 设计原则：
 * 1. 字段级来源：每个有判断价值的字段都带 grade（A/B/C/D）与 sourceIds，不允许整家机场只写一个“已核验”。
 * 2. null 表示“未知 / 未测得”，绝不自动转成 0。
 * 3. 地图、目录、套餐、地区页全部读取本目录的同一份数据，禁止各页面各自写死。
 */

/** A 本站实测 · B 服务商公开资料 · C 第三方历史参考 · D 待核验或资料冲突 */
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';

export type SourceKind =
  | 'site-owner-test' // 本站实测（含时间、环境、截图或日志）
  | 'provider-screenshot' // 服务商后台/公开说明截图
  | 'provider-page-capture' // 自称服务商品牌站的页面存档（归属未独立核验）
  | 'third-party-page-capture' // 第三方评测/聚合站页面存档
  | 'compiled-library' // 用户提供的汇编资料库（二次整理，仅作线索）
  | 'site-owner-composite' // 站长制作的数据整理图
  | 'user-instruction'; // 站长指定（品牌顺序、推广链接等）

export interface SourceRecord {
  sourceId: string;
  brandId?: string;
  kind: SourceKind;
  title: string;
  /** 页面来源（域名或路径，不含推广码）；未知则为 null */
  originUrl: string | null;
  /** 站长提供的文件名（上传通道会丢失中文字符，仅作追溯；以站长本地文件为准） */
  file: string | null;
  /** 站长上传编号（仅供追溯，禁止用于排序） */
  uploadNo?: number;
  /** 资料提供日（站长上传日）。注意不是页面抓取日 */
  receivedAt: string;
  /** 来源页面自身标注的核验/更新日期；没有则为 null */
  statedDate: string | null;
  defaultGrade: EvidenceGrade;
  notes?: string;
}

export interface Claim<T> {
  /** null = 资料未提供 / 未知（不是 0，也不是“无”） */
  value: T | null;
  grade: EvidenceGrade;
  sourceIds: string[];
  recordedAt?: string | null;
  note?: string;
  /** 与其他来源冲突，不能当作确定数据 */
  conflict?: boolean;
}

export type BillingPeriod =
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'biennial'
  | 'triennial'
  | 'one-time'
  | 'custom';

export const BILLING_MONTHS: Record<BillingPeriod, number | null> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
  biennial: 24,
  triennial: 36,
  'one-time': null,
  custom: null,
};

export const BILLING_LABEL: Record<BillingPeriod, string> = {
  monthly: '月付',
  quarterly: '季付',
  semiannual: '半年付',
  annual: '年付',
  biennial: '两年付',
  triennial: '三年付',
  'one-time': '一次性流量包',
  custom: '定制',
};

export type OfferStatus =
  | 'sourced' // 有页面存档支持，且未发现冲突
  | 'conflict' // 多个来源不一致，不参与精确数值排序
  | 'compiled-only' // 仅见于汇编资料库，待核验
  | 'consult'; // 咨询报价，无公开价格

export interface SourceRef {
  sourceId: string;
  grade: EvidenceGrade;
}

export interface PlanOffer {
  offerId: string;
  billingPeriod: BillingPeriod;
  /** 参考标价（未叠加优惠码）。null = 无公开价格 */
  priceCNY: number | null;
  /** 每月重置的流量额度（GB）。仅当来源明确“每月”时填写 */
  monthlyTrafficGB: number | null;
  /** 该次购买周期内的总流量（GB）。仅当来源明确“总量/一次性”时填写 */
  totalTrafficGB: number | null;
  trafficResetRule: string | null;
  priceSource: SourceRef;
  /** 来源页面自带日期；没有则 null */
  sourceRecordedAt: string | null;
  /** 本站最后核验日期；null = 本站尚未核验 */
  lastVerifiedAt: string | null;
  status: OfferStatus;
  note?: string;
}

export type PlanCategory = 'monthly-tier' | 'annual-small' | 'one-time-pack' | 'custom';

export interface Plan {
  planId: string;
  brandId: string;
  name: string;
  category: PlanCategory;
  offers: PlanOffer[];
  /** 套餐是否支持全节点（来源未说明则省略） */
  supportsAllNodes?: Claim<boolean>;
  deviceLimit?: Claim<string>;
  nodeMultiplier?: Claim<string>;
  note?: string;
}

export type IdentityStatus =
  | 'name-confirmed' // 沿用站长提供的名称，资料名称一致
  | 'owner-confirmed' // 资料页面用的是别名，站长已确认是同一服务
  | 'name-variant' // 资料中名称带后缀/别称，沿用站长名称，对应关系待核验
  | 'mapping-pending' // 与另一名称是否同一服务尚未确认
  | 'name-collision' // 资料指向同名的其他公司，品牌归属待验证
  | 'demo-site' // 资料明确是静态演示站
  | 'data-incomplete'; // 资料文件不完整

export type RouteTypeId =
  | 'iplc'
  | 'iepl'
  | 'bgp'
  | 'relay'
  | 'direct'
  | 'dedicated-exit'
  | 'cn2';

export interface RegionClaim {
  /** 与 regions.ts 的 countryCode 对应；未收录在地图上的国家用 'OTHER' 并写入 label */
  countryCode: string;
  label: string;
  nodeCount: number | null;
  nodeNames?: string[];
  grade: EvidenceGrade;
  sourceIds: string[];
  recordedAt?: string | null;
  note?: string;
}

export type NoticeType = 'service-notice' | 'demo-site' | 'identity' | 'data-gap' | 'operational-risk';

export interface Notice {
  type: NoticeType;
  severity: 'info' | 'warn' | 'high';
  text: string;
  sourceIds: string[];
}

export interface ConflictNote {
  conflictId: string;
  field: string;
  summary: string;
  variants: { label: string; sourceId: string; grade: EvidenceGrade }[];
  handling: string;
}

export interface BrandSeed {
  slug: string; // 同时作为 brandId
  displayRank: number;
  brandName: string; // 站长提供的正式展示名
  shortName: string;
  nameEn: string | null;
  aliases: string[];
  uploadFileNo: number; // 仅供追溯，绝不参与排序
  summary: string;
  identity: { status: IdentityStatus; notes: string[] };
  plans: Plan[];
  regions: RegionClaim[];
  nodeCount: Claim<number>;
  protocols: Claim<string[]>;
  routeTypes: Claim<RouteTypeId[]>;
  clients: Claim<string[]>;
  streaming: Claim<string[]>;
  ai: Claim<string[]>;
  deviceLimit: Claim<string>;
  multiplier: Claim<string>;
  notices: Notice[];
  conflicts: ConflictNote[];
  editorialNotes: string[];
  /** open = 资料充足，详情页可索引；draft = 保留目录条目与资料卡，详情页 noindex */
  detailPage: 'open' | 'draft';
  sourceIds: string[];
}

export interface Brand extends BrandSeed {
  brandId: string;
  affiliateUrl: string;
  /** 站内汇总：该品牌所有“有取值”字段中出现过的证据等级 */
  gradesPresent: EvidenceGrade[];
  /** 本站最后一次带日期的本站观察；null = 本站尚无带日期的本站测试 */
  lastVerifiedAt: string | null;
  verificationStatus: VerificationStatus;
  /** 本站测试摘要：有记录并不等于原图齐全 */
  siteTest: { hasRecords: boolean; originalEvidenceComplete: boolean; lastTestDate: string | null };
  /** 冲突数量与高风险提示数量，用于目录标记 */
  conflictCount: number;
  highNoticeCount: number;
}

export type VerificationStatus =
  | 'site-tested'
  | 'sourced-partial'
  | 'conflict'
  | 'identity-pending'
  | 'demo-site'
  | 'insufficient';

// ---------------------------------------------------------------- 测试记录
export type TimeWindowId = 'morning' | 'noon' | 'evening' | 'peak' | 'late-night';

export type RecordKind = 'speedtest' | 'availability' | 'youtube' | 'third-party-speed' | 'third-party-unlock';

export interface TestRecord {
  testId: string;
  brandId: string;
  nodeId: string | null;
  nodeRegion: string; // countryCode
  nodeDisplayName: string;
  /** ISO 8601（含 +08:00）；null = 来源未标注，不得补造 */
  testDateTime: string | null;
  testDateText: string | null;
  timezone: string;
  /** 由 testDateTime 推出；没有日期时一定是 'unknown'（不得由来源的自述推断） */
  timeWindow: TimeWindowId | 'outside' | 'unknown';
  /** 来源自述的时间窗口（来源没有给出日期时仅供参考，不进入任何统计，也不决定 timeWindow） */
  claimedWindow?: TimeWindowId | null;
  originCountry: string | null;
  originCity: string | null;
  originISP: string | null;
  clientName: string | null;
  clientVersion: string | null;
  deviceType: string | null;
  testServer: string | null;
  testMethod: string | null;
  downloadMbps: number | null;
  uploadMbps: number | null;
  idleLatencyMs: number | null;
  loadedDownloadLatencyMs: number | null;
  loadedUploadLatencyMs: number | null;
  jitterMs: number | null;
  packetLossPercent: number | null;
  connectionSuccess: boolean | null;
  testDurationSeconds: number | null;
  sampleCount: number | null;
  youtubeQuality: string | null;
  youtubeBufferSeconds: number | null;
  sourceType: EvidenceGrade;
  screenshotPath: string | null;
  rawLogPath: string | null;
  notes: string;
  // ---- 扩展字段
  recordKind: RecordKind;
  /** 只有存在可核查原始证据时才可为 true */
  isVerified: boolean;
  evidenceIds: string[];
  extraMetrics?: Record<string, { value: number | string | null; unit?: string }>;
  caveats: string[];
  publishedAt: string;
}

export interface AvailabilitySnapshot {
  snapshotId: string;
  brandId: string;
  checkedFrom: string; // ISO
  checkedTo: string | null;
  timezone: string;
  totalNodes: number;
  onlineNodes: number;
  byRegion: { countryCode: string; label: string; online: number; total: number }[];
  trafficMultiplier: string | null;
  sourceType: EvidenceGrade;
  evidenceIds: string[];
  caveats: string[];
}

export interface EvidenceFile {
  evidenceId: string;
  brandId: string;
  title: string;
  kind: 'composite-image' | 'speedtest-screenshot' | 'node-status-screenshot' | 'youtube-stats-screenshot' | 'plan-screenshot' | 'raw-log';
  /** 站内公开路径（public/ 下），文件存在才会展示 */
  publicPath: string;
  /** 期望的原始文件名；文件缺失时页面显示“待补充”而不是破图 */
  expected: boolean;
  description: string;
  capturedAtText: string | null;
  isOriginal: boolean;
}

// ---------------------------------------------------------------- 地区
export interface MapPoint {
  countryCode: string;
  regionSlug: string; // 对应 /regions/<slug>/
  name: string;
  nameEn: string;
  lat: number;
  lon: number;
}

export interface RegionPage {
  slug: string;
  name: string;
  fullName: string;
  nameEn: string;
  countryCodes: string[];
  intro: string;
  searchTerms: string[];
}

export interface RouteTypeInfo {
  id: RouteTypeId;
  name: string;
  fullName: string;
  slug: string;
  short: string;
  aliases: string[];
}
