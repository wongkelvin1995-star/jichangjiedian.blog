import { claim, planFactory, region, seed } from '../helpers';

const T = 't31'; // 页面存档：“闪电云机场 - 解锁全球的静态演示站”（页面标题与页脚均写明“静态演示站点”）
const M = 'm31';
// 页面没有标注抓取日期 -> recorded 保持 null，绝不补造
const plan = planFactory({ brandId: 'shandianyun', src: T, recorded: null });
const DEMO = '价格来自写明“静态演示站点”的页面和汇编资料库，不能证明真实售卖；仅作线索保留。';
const PK = 't33'; // 第三方对比页（站长核对于 2026-09-22）列出的“闪电鼠”价格
const PK_NOTE = '价格来自另一家第三方对比站 对“闪电鼠”的记录（站长核对于 2026-09-22）；站长已确认闪电鼠就是闪电云。';

export default seed({
  slug: 'shandianyun',
  displayRank: 31,
  brandName: '闪电云',
  shortName: '闪电云',
  nameEn: null,
  aliases: ['闪电云', '闪电云机场', 'shandianyun', '闪电鼠'],
  uploadFileNo: 31,
  summary:
    '闪电云的推广入口指向“闪电鼠”，站长已确认两者是同一服务。站长提供的页面存档是一个写明“静态演示站点”的模板页，不能作为价格依据；目前的三档月付和年付小包价格来自另一家第三方对比站 对“闪电鼠”的记录（2026-09-22）。站长的 Excel 另记有一档 ¥19.9/月 100GB 的“闪电鼠 · 性价版”，与对比站不一致，待核对。',
  identity: {
    status: 'owner-confirmed',
    notes: [
      '推广入口域名含 shandianshu，汇编资料库注明品牌名为“闪电鼠”。站长于 2026-10-28 确认闪电鼠就是闪电云；本站使用“闪电云”，保留“闪电鼠”作为别名。',
      '站长提供的页面存档标题为“闪电云机场 - 解锁全球的静态演示站”，页脚写“静态演示站点”。这份存档不是真实的官网，本站不采用其中的价格与文案。',
    ],
  },
  plans: [
    plan('trial-day', '新手体验（按日）', 'custom', [
      { period: 'custom', price: 1.9, reset: '演示页：¥1.9/天起，流量未写', status: 'compiled-only', note: `${DEMO} 计费周期为按日，不进入月价格排序。` },
    ]),
    plan('standard-week', '标准套餐（按周）', 'custom', [
      { period: 'custom', price: 9.9, reset: '演示页：¥9.9/周起，流量未写', status: 'compiled-only', note: `${DEMO} 计费周期为按周，不进入月价格排序。` },
    ]),
    plan('annual', '年付小包', 'annual-small', [
      { period: 'annual', price: 96, monthlyGB: 60, src: PK, recorded: '2026-09-22', reset: '对比站：每月 60GB', note: `${PK_NOTE} 汇编资料库的数字相同。` },
    ]),
    plan('entry', '入门尝鲜包', 'monthly-tier', [
      { period: 'monthly', price: 22, monthlyGB: 120, src: PK, recorded: '2026-09-22', note: PK_NOTE },
    ]),
    plan('advanced', '进阶畅玩', 'monthly-tier', [
      { period: 'monthly', price: 40, monthlyGB: 250, src: PK, recorded: '2026-09-22', note: PK_NOTE },
    ]),
    plan('top', '尊享大流量', 'monthly-tier', [
      { period: 'monthly', price: 70, monthlyGB: 500, src: PK, recorded: '2026-09-22', note: PK_NOTE },
    ]),
  ],
  regions: [
    region('HK', '香港', null, 'D', [M], { note: '仅见于汇编资料库；演示页只写“覆盖 100+ 地区”，没有地区列表。' }),
    region('TW', '台湾', null, 'D', [M], { note: '同上' }),
    region('JP', '日本', null, 'D', [M], { note: '同上' }),
    region('SG', '新加坡', null, 'D', [M], { note: '同上' }),
    region('US', '美国', null, 'D', [M], { note: '同上' }),
  ],
  nodeCount: claim(null, 'D', [T], { note: '演示页写“覆盖 100+ 地区”，是演示文案，不是节点数；本站不采用。' }),
  protocols: claim(null, 'D', [T, M], { note: '演示页写“多协议融合”，没有协议名称；汇编资料库的 Trojan / VLESS 无页面依据。' }),
  routeTypes: claim(null, 'D', [T, M], { note: '演示页写“智能路由 · 专线传输”，没有写 IPLC / IEPL；汇编资料库的 IEPL 无页面依据。' }),
  clients: claim(['iOS', 'Android', 'Windows', 'macOS', 'TV', '路由器（演示页文字）'], 'D', [T], { note: '来自静态演示页的文字，不能证明真实提供。' }),
  streaming: claim(null, 'D', [T], { note: '演示页列出 Netflix、Disney+、HBO、TikTok 等图标与文案，属于演示内容，不能证明真实解锁。' }),
  ai: claim(null, 'D', [T], { note: '演示页提到 ChatGPT，属于演示内容，不能证明真实支持。' }),
  deviceLimit: claim(null, 'D', [T], { note: '演示页写“不限设备安装”和“多设备同时在线”，没有数字，且为演示内容。' }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面无依据。' }),
  notices: [
    {
      type: 'demo-site',
      severity: 'high',
      text: '站长提供的这份页面存档明确写着“静态演示站点”。页面里的价格（¥1.9/天起、¥4.6/天起、¥9.9/周起、¥19.9/月起）、用户口碑（署名 Gary）和 2025 年的“最新动态”（服务器升级完成、国庆福利活动上线、新地区节点开放）都是演示内容，不能当作真实运营、真实价格或真实评价的证据。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'warn',
      text: '本站还没有闪电云（闪电鼠）真实官网的存档或任何测试记录，现有价格只来自第三方对比站，购买前请以官网结算页为准。',
      sourceIds: [T, M],
    },
  ],
  conflicts: [
    {
      conflictId: 'shandianyun-demo-vs-compiled',
      field: '套餐价格',
      summary: '演示页与汇编资料库给出的套餐名称相同但价格口径不同，且演示页本身是静态演示站。',
      variants: [
        { label: '演示页：年付特惠 ¥19.9/月起；进阶畅玩 ¥4.6/天起', sourceId: T, grade: 'D' },
        { label: '汇编资料库：年付特惠 ¥96/年（60GB/月）；进阶畅玩包 ¥40/月（250GB）', sourceId: M, grade: 'D' },
        { label: '第三方对比页（“闪电鼠”，2026-09-22）：¥22/120GB、¥40/250GB、¥70/500GB、年付小包 ¥96/每月 60GB', sourceId: 't33', grade: 'C' },
        { label: '站长 Excel：闪电鼠 · 性价版 ¥19.9/月 100GB', sourceId: 'owner-sheet', grade: 'C' },
      ],
      handling: '站长确认闪电鼠就是闪电云后，采用第三方对比页的价格（C 级）；演示页价格不采用。站长 Excel 记录的“闪电鼠 · 性价版 ¥19.9/月 100GB”与对比站不同，等站长核对官网后再定。',
    },
  ],
  editorialNotes: [
    '站长最初提供的页面存档是一个演示模板站，这也提醒读者：搜索“某某机场”时找到的页面不一定是服务商真正的官网。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, 't33', 'owner-2026-10-28', 'owner-sheet'],
});
