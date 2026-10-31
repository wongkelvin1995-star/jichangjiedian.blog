/** 站内通用的中文标签。所有页面共用，避免同一个状态在不同页面写成不同说法。 */
import type { EvidenceGrade, IdentityStatus, NoticeType, OfferStatus, RecordKind, VerificationStatus } from './types';

export const GRADE_INFO: Record<EvidenceGrade, { letter: EvidenceGrade; name: string; desc: string }> = {
  A: { letter: 'A', name: '本站实测', desc: '由本站进行测试，包含时间、环境、原始截图或日志。' },
  B: { letter: 'B', name: '服务商公开资料', desc: '来自服务商能够识别的公开说明或后台截图。' },
  C: { letter: 'C', name: '公开资料整理', desc: '整理自服务商页面、评测文章或站长提供的资料，不是本站直接测试。' },
  D: { letter: 'D', name: '核对中', desc: '几份资料说法不一样或还缺资料，本站正在核对，暂不作为确定数据。' },
};

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  'site-tested': '有本站测试记录',
  'sourced-partial': '部分字段有来源',
  conflict: '资料核对中',
  'identity-pending': '品牌对应关系待核验',
  'demo-site': '资料为静态演示站',
  insufficient: '资料不足',
};

export const VERIFICATION_HINT: Record<VerificationStatus, string> = {
  'site-tested': '本站有该品牌的测试记录；其余字段（套餐、协议等）仍按各自的来源等级显示。',
  'sourced-partial': '价格等字段有页面存档来源，但多数没有本站测试，不代表已全部核验。',
  conflict: '不同来源对部分套餐、流量或线路的说法不一样，本站正在逐项核对；有出入的字段暂不参与精确排序。',
  'identity-pending': '站长提供的名称与资料页面名称不完全一致，或资料指向同名的其他主体，尚未确认是同一服务。',
  'demo-site': '本站只拿到写明“静态演示站点”的页面，不能证明真实运营。',
  insufficient: '资料文件不完整或没有页面存档给出价格，暂无可靠数据。',
};

export const IDENTITY_LABEL: Record<IdentityStatus, string> = {
  'name-confirmed': '名称与资料一致',
  'owner-confirmed': '别名，站长已确认是同一服务',
  'name-variant': '名称略有出入（对应关系待核验）',
  'mapping-pending': '品牌对应关系待核验',
  'name-collision': '资料指向同名主体（品牌归属待验证）',
  'demo-site': '资料为静态演示站',
  'data-incomplete': '资料文件不完整',
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  sourced: '有页面来源',
  conflict: '资料冲突',
  'compiled-only': '仅见于汇编资料',
  consult: '咨询报价',
};

export const NOTICE_TYPE_LABEL: Record<NoticeType, string> = {
  'service-notice': '服务公告',
  'demo-site': '演示站提示',
  identity: '品牌身份',
  'data-gap': '资料缺口',
  'operational-risk': '运营风险',
};

export const RECORD_KIND_LABEL: Record<RecordKind, string> = {
  speedtest: '网页测速',
  availability: '节点在线',
  youtube: 'YouTube 播放观察',
  'third-party-speed': '第三方测速摘录',
  'third-party-unlock': '第三方延迟/解锁摘录',
};

/** 采样窗口之外/未标注时间的显示文字 */
export const WINDOW_EMPTY_TEXT = '该时段实测持续更新中。';

export const AFFILIATE_REL = 'sponsored nofollow noopener noreferrer';
export const AFFILIATE_NOTE = '推广链接：通过它注册或购买，本站可能获得佣金；佣金不影响资料如何整理，价格与规则以服务商结算页为准。';
