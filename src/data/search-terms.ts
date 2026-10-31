/**
 * 站内搜索的“术语 → 页面”别名：让用户直接搜“抖动”“负载延迟”“倍率”“Clash”这类词时，
 * 一步到达最相关的文章或栏目，而不是只靠标题里恰好出现的字。
 *
 * 别名会并入 url 对应页面的检索词，不会产生额外的搜索结果行。
 * url 必须指向站内已存在的搜索条目（构建搜索索引时会逐条检查，找不到就报错）。
 * 别名只负责“导航”，不下任何结论。
 */
export interface SearchTerm {
  /** 仅供维护者阅读 */
  label: string;
  url: string;
  /** 同义词、缩写、英文写法 */
  aliases: string[];
}

export const SEARCH_TERMS: readonly SearchTerm[] = [
  {
    label: '空载延迟与负载延迟',
    url: '/articles/idle-vs-loaded-latency/',
    aliases: ['空载延迟', '负载延迟', '满载延迟', '下载时延迟', '上传时延迟', 'idle latency', 'loaded latency', 'latency under load', 'bufferbloat', '缓冲膨胀', 'ping'],
  },
  {
    label: '抖动（Jitter）',
    url: '/articles/jitter-impact-on-use-cases/',
    aliases: ['抖动', '延迟抖动', 'jitter', '丢包', '丢包率', 'packet loss', '卡顿', '视频会议'],
  },
  {
    label: '延迟低为什么下载不一定快',
    url: '/articles/low-latency-not-fast-download/',
    aliases: ['延迟', '带宽', '下载速度', '下载慢', '速度慢', '低延迟', '吞吐', 'throughput', 'tcp'],
  },
  {
    label: '晚高峰测速怎么做',
    url: '/articles/how-to-speedtest-at-peak-hours/',
    aliases: ['晚高峰', '晚高峰测速', '测速方法', '分时段', '时间窗口', '早间', '午间', '晚间', '深夜', '测速步骤'],
  },
  {
    label: '节点晚上变慢的原因',
    url: '/articles/why-nodes-slow-down-at-night/',
    aliases: ['晚上慢', '晚上卡', '变慢', '拥塞', '超售', '超卖', '排查', '为什么慢'],
  },
  {
    label: '流量倍率怎么算',
    url: '/articles/traffic-multiplier-explained/',
    aliases: ['倍率', '流量倍率', '有效流量', '每GB成本', '流量', '套餐流量', '扣流量', '流量重置'],
  },
  {
    label: '在线率与稳定性的区别',
    url: '/articles/online-rate-vs-stability/',
    aliases: ['在线率', '在线状态', '稳定性', '稳不稳', '可用性', '99.9%', '节点在线', '掉线', '断线', '重连'],
  },
  {
    label: 'IEPL、IPLC 与 BGP 的区别',
    url: '/articles/iepl-iplc-bgp-differences/',
    aliases: ['专线', '国际专线', '线路区别', '线路标签'],
  },
  {
    label: 'Clash Verge 延迟测试教程',
    url: '/guides/clash-verge-latency-test/',
    aliases: ['Clash', 'Clash Verge', 'clash verge', '延迟测试', '客户端', '客户端教程', '测延迟', '测试地址', '204'],
  },
  {
    label: 'YouTube Stats for nerds 教程',
    url: '/guides/youtube-stats-for-nerds/',
    aliases: ['Stats for nerds', 'stats for nerds', '详细统计信息', 'Buffer Health', 'Connection Speed', 'YouTube', '油管', '视频播放', '缓冲', '掉帧', '720p', '4K'],
  },
  {
    label: '连续 7 天速度记录方法',
    url: '/guides/seven-day-node-speed-log/',
    aliases: ['7天', '七天', '一周', '速度记录', '测速表格', '记录表', '证据保存', '截图'],
  },
  {
    label: '香港与日本节点的区别',
    url: '/articles/hong-kong-vs-japan-nodes/',
    aliases: ['香港日本', '港日', '香港还是日本', '东京', '大阪'],
  },
  {
    label: '新加坡与美国节点怎么选',
    url: '/articles/singapore-vs-us-nodes/',
    aliases: ['新加坡美国', '美国还是新加坡', '洛杉矶', '纽约', '延迟下限'],
  },
  {
    label: '2026 机场节点选择指南',
    url: '/articles/how-to-choose-airport-nodes-2026/',
    aliases: ['怎么选', '怎么选择', '如何选择', '选择', '选择指南', '选机场', '选节点', '哪个好', '哪家好', '新手', '入门', '选购', '2026'],
  },
  {
    label: '新加坡节点测速指标',
    url: '/articles/singapore-node-speedtest-metrics/',
    aliases: ['测速指标', '测速数据', '怎么看测速', '线路质量', '网页测速', '测速结果'],
  },
  {
    label: '证据等级 A / B / C / D 的含义',
    url: '/sources/',
    aliases: ['证据等级', '来源等级', 'A级', 'B级', 'C级', 'D级', '待核验', '已核验', '未核验', '资料冲突', '来源'],
  },
  {
    label: '测试记录 CSV 下载',
    url: '/test-records/',
    aliases: ['CSV', 'csv', '下载数据', '测试档案', '原始数据', '导出'],
  },
  {
    label: '合作推广声明',
    url: '/affiliate-disclosure/',
    aliases: ['推广', '推广链接', '联盟', '佣金', 'affiliate', '广告', '购买入口', '合作'],
  },
  {
    label: '隐私政策',
    url: '/privacy/',
    aliases: ['隐私', 'cookie', 'Cookie', '个人信息', '统计'],
  },
];
