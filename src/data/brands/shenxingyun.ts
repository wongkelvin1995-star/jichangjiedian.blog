import { claim, planFactory, region, seed } from '../helpers';

const T = 't33'; // 页面存档：第三方对比站“神行加速”服务商档案（站长核对于 2026-09-22，数据更新 2026-09-27）
const M = 'm33';
const D = '2026-09-22';
const plan = planFactory({ brandId: 'shenxingyun', src: T, recorded: D });
const RESET = '页面：流量/月（每月额度）';
const CHECK = '页面称价格由其站长在官网购买页或商家后台核对（2026-09-22），“本站未独立复核”；本站也没有看到截图。';

export default seed({
  slug: 'shenxingyun',
  displayRank: 33,
  brandName: '神行云',
  shortName: '神行云',
  nameEn: null,
  aliases: ['神行云', '神行加速', 'shenxingyun', '神行云机场'],
  uploadFileNo: 33,
  summary:
    '站长提供的神行云页面存档，实际是第三方对比站“第三方对比站”对“神行加速”的服务商档案：三档月付套餐（¥23 / ¥40 / ¥72，120GB / 260GB / 520GB），没有季付、半年付、年付；地区、节点数、支付方式、优惠形式、域名注册日期都写“未核实”。站长已确认“神行云”就是该页面里的“神行加速”。',
  identity: {
    status: 'owner-confirmed',
    notes: [
      '资料页面使用的名称是“神行加速”。站长于 2026-10-28 确认两者是同一服务；本站使用“神行云”，并保留“神行加速”作为别名。',
      '该对比页自己也说明：官网域名会不定期轮换，所以只提供经其中转页的合作推广链接，没有另外一条独立的官网来源。',
    ],
  },
  plans: [
    plan('trial', '神行·尝鲜包', 'monthly-tier', [{ period: 'monthly', price: 23, monthlyGB: 120, reset: RESET, note: `页面季付、半年付、年付均为“—”。${CHECK}` }]),
    plan('basic', '神行·基础包', 'monthly-tier', [{ period: 'monthly', price: 40, monthlyGB: 260, reset: RESET, note: `页面季付、半年付、年付均为“—”。${CHECK}` }]),
    plan('premium', '神行·尊享包', 'monthly-tier', [{ period: 'monthly', price: 72, monthlyGB: 520, reset: RESET, note: `页面季付、半年付、年付均为“—”。${CHECK}` }]),
  ],
  regions: [
    region('HK', '香港', null, 'D', [M], { note: '对比页写“地区覆盖：未核实”；仅见于汇编资料库“香港、台湾、日本、新加坡、美国等主流节点”。' }),
    region('TW', '台湾', null, 'D', [M], { note: '同上' }),
    region('JP', '日本', null, 'D', [M], { note: '同上' }),
    region('SG', '新加坡', null, 'D', [M], { note: '同上' }),
    region('US', '美国', null, 'D', [M], { note: '同上' }),
  ],
  nodeCount: claim(null, 'D', [T], { note: '对比页写“节点总数（官网标称）：未核实”。' }),
  protocols: claim(null, 'D', [T, M], { note: '页面存档没有协议信息；汇编资料库的“通用订阅协议”不是协议名称。' }),
  routeTypes: claim(null, 'D', [M], { note: '页面存档没有线路类型；汇编资料库的“企业级专线中转”无页面依据。' }),
  clients: claim(null, 'D', [M], { note: '页面存档没有客户端信息。' }),
  streaming: claim(null, 'D', [M], { note: '页面存档明确“只列官网公开信息，不含评价与评分”，没有解锁信息；汇编资料库的清单无页面依据。' }),
  ai: claim(null, 'D', [M]),
  deviceLimit: claim(null, 'D', [M], { note: '汇编资料库写“不限制在线客户端数量”，页面存档没有此项。' }),
  multiplier: claim(null, 'D', [M], { note: '汇编资料库写“全节点 1x”，页面存档没有此项。' }),
  notices: [
    {
      type: 'data-gap',
      severity: 'warn',
      text: '该页面的数字来自对比站站长的人工核对，页面写明“本站未独立复核”，且“地区覆盖、节点总数、支付方式、优惠形式、域名注册日期”均为“未核实”。',
      sourceIds: [T],
    },
    {
      type: 'data-gap',
      severity: 'info',
      text: '该对比页披露了合作推广关系（“通过它下单不会增加你的费用，本站可能获得佣金”），并写明“不打分，也不做跨品牌的速度比较”。页面中“最低每 GB”是对比站按其公开算法现算的数字，不是官网标注。',
      sourceIds: [T],
    },
  ],
  conflicts: [
  ],
  editorialNotes: [
    '汇编资料库中“环球云”的套餐表与本品牌的价格表数字完全相同（120GB ¥23 / 260GB ¥40 / 520GB ¥72），本站认为那是资料混用，已在环球云条目中记为冲突。',
  ],
  detailPage: 'open',
  sourceIds: [T, M, 'owner-2026-10-28'],
});
