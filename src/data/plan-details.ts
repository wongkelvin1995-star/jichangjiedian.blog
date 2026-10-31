/**
 * 套餐详情：来源页面对每个套餐“写了什么”。
 *
 * 灵动云：站长 2026-10-31 提供的官网套餐页截图（3 张，覆盖 9 个套餐）。截图里每个套餐卡片有：
 * 标签（主推套餐 / 精选方案）、起步价、包含流量、速率、付款周期数量、设备限制，以及“订阅详情”里的 7 条权益说明。
 *
 * 这里只记录截图上能看到的内容，并用本站自己的话改写（权益说明是服务商的宣传文字，不照抄、不当作本站实测）。
 * 价格与流量不在这里：它们仍然写在 src/data/brands/*.ts 的套餐里，页面上的数字全部从那里读取并计算。
 * 本文件只放“价格表里没有的东西”：官网怎么定位这个套餐、哪一档写了别的档没有的说法。
 */

/** 灵动云官网套餐页截图（站长 2026-10-31 提供）在来源登记表里的编号 */
export const LDY_PLANS_SRC = 'owner-2026-10-31-ldy-plans';

export interface PlanDetail {
  planId: string;
  /** 套餐卡片左上角的标签 */
  badge: '主推套餐' | '精选方案';
  /** 官网给这个套餐起的定位语（卡片“订阅详情”第一条的小标题） */
  tagline: string;
  /** 官网怎么描述它适合谁（改写） */
  gist: string;
  /** 官网套餐页上只有这一档写了、或这一档特别强调的内容（改写，一条一句） */
  pageNotes: string[];
}

export interface PlanDetailSet {
  brandSlug: string;
  sourceId: string;
  /** 资料读取日 */
  recordedAt: string;
  /** 每个套餐都写了的内容（全部是服务商说法） */
  shared: { label: string; text: string }[];
  /** 官网只在个别套餐写了、带“更快 / 更稳”含义的说法：逐条列出，并写明页面没给数字 */
  performanceClaims: { planId: string; quote: string }[];
  /** 官网套餐页没有回答、购买前需要问客服或看结算页的问题 */
  openQuestions: string[];
  plans: PlanDetail[];
}

const LDY: PlanDetailSet = {
  brandSlug: 'lingdongyun',
  sourceId: LDY_PLANS_SRC,
  recordedAt: '2026-10-31',
  shared: [
    { label: '线路', text: '9 个套餐都写“IEPL / IPLC 优化线路”。页面没有说明不同套餐走的线路是否相同。' },
    { label: '速率与倍率', text: '每个套餐的“速率”都写“不限速”；除至尊外的 8 个套餐写“1.0 倍率计费”（用 1GB 扣 1GB），穿云和闲云写的是“全节点 1.0 倍率”，至尊没有写倍率。' },
    { label: '节点地区', text: '香港、台湾、日本、新加坡、美国等热门地区；至尊私人定制写“按需配置”。' },
    { label: '影音与 AI', text: '写“支持 Netflix、Disney+、YouTube 等主流影音平台”和“适配 ChatGPT、Claude 等 AI 工具”（穿云把两项并成一句，没有单独写 Disney+；至尊没有写这两项）。' },
    { label: '协议与设备', text: '每个套餐卡片上的“设备限制”都是“不限”；其中 7 个套餐的文字还写了“支持 SS 协议，不限设备数量”（闲云、至尊没有这一句）。' },
  ],
  performanceClaims: [
    { planId: 'lingdongyun-fufeng', quote: '降低网络拥堵影响，提升连接体验' },
    { planId: 'lingdongyun-yulang', quote: '改善高峰期连接体验' },
    { planId: 'lingdongyun-feiyun', quote: '高优先级线路' },
  ],
  openQuestions: [
    '不同套餐的线路和节点是否完全相同：页面 9 个套餐写的是同一套线路说法，没有说明档位之间是否有差别。',
    '“高优先级线路”（飞云）具体指什么：页面没有解释，也没有给出带宽或延迟数字。',
    '一次性流量包写“永久有效”：有没有账号长期不使用而失效的条款，以结算页和服务条款为准。',
    '穿云每 30 天刷新：当月没用完的流量能否结转，页面没写。',
    '至尊私人定制：独立带宽的具体数值、专属公网 IP 的类型（原生 IP 还是机房 IP）、可选地区清单、交付后能否更换 IP、退款规则，页面都没写。',
    '试用与退款：套餐页没有写，需要在官网结算页或向客服确认。',
  ],
  plans: [
    {
      planId: 'lingdongyun-fufeng',
      badge: '主推套餐',
      tagline: '轻量优选',
      gist: '面向日常网络需求的入门档',
      pageNotes: ['线路说明里写了“降低网络拥堵影响”。'],
    },
    {
      planId: 'lingdongyun-yulang',
      badge: '精选方案',
      tagline: '进阶优选',
      gist: '写“工作娱乐全面兼顾”',
      pageNotes: ['线路说明里写了“改善高峰期连接体验”，页面没有解释具体指什么。'],
    },
    {
      planId: 'lingdongyun-poxiao',
      badge: '精选方案',
      tagline: '旗舰大流量',
      gist: '写“专为高频使用而设计”',
      pageNotes: ['速率说明里点名“大型文件下载与高流量需求”。'],
    },
    {
      planId: 'lingdongyun-lingxiao',
      badge: '精选方案',
      tagline: '旗舰大流量',
      gist: '写“满足高频使用与多设备需求”',
      pageNotes: ['官网把月流量写成 1.5TB（括号里是 1500GB），本站按 1500GB 计算。'],
    },
    {
      planId: 'lingdongyun-chuanyun',
      badge: '精选方案',
      tagline: '年度超值优选',
      gist: '写“适合日常浏览与轻量办公”',
      pageNotes: ['只有年付一种周期；写“每 30 天自动刷新流量”，另一条写“每月流量重置”。'],
    },
    {
      planId: 'lingdongyun-xianyun',
      badge: '精选方案',
      tagline: '一次购买，长期使用',
      gist: '写“适合轻度使用、偶尔出海与备用网络”，无月租',
      pageNotes: ['官网称这一档为“小流量包”，写“流量永久有效，用完为止”。'],
    },
    {
      planId: 'lingdongyun-jingyun',
      badge: '精选方案',
      tagline: '永久流量',
      gist: '一次购买，不按月清零，用完为止',
      pageNotes: ['官网称这一档为“标准流量包”，写“永久有效 / 用完为止”。'],
    },
    {
      planId: 'lingdongyun-feiyun',
      badge: '精选方案',
      tagline: '精英大流量',
      gist: '一次购买，永久有效，用完为止',
      pageNotes: [
        '官网称这一档为“精英流量包”，写“旗舰级永久流量”。',
        '速率说明里写了“高优先级线路”，其他套餐没有这一句。',
      ],
    },
    {
      planId: 'lingdongyun-zhizun',
      badge: '精选方案',
      tagline: '至尊私人专属',
      gist: '独享资源，面向跨境电商、独立站运营、TikTok 直播与远程办公',
      pageNotes: [
        '写明“独立带宽、专属公网 IP，不与其他用户共享”，月流量标注为“专线独享流量”。',
        '地区按需配置（香港、台湾、日本、新加坡、美国等）；提供专属技术维护。',
        '确认需求后约 2–3 个工作日交付。',
      ],
    },
  ],
};

export const PLAN_DETAIL_SETS: Readonly<Record<string, PlanDetailSet>> = { lingdongyun: LDY };

export const planDetailsFor = (brandSlug: string): PlanDetailSet | null => PLAN_DETAIL_SETS[brandSlug] ?? null;
