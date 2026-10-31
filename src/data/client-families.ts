/**
 * 客户端名称归一：资料里的客户端写法很杂（“Clash Verge Rev”“小火箭（Shadowrocket）”“通用订阅（兼容 …）”），
 * 这里只按关键字归并成少数几个系列，用于套餐页的“资料里提到的客户端”筛选。
 * “提到”不等于已确认可用，页面上也这样写。
 */
export interface ClientFamily {
  id: string;
  label: string;
  test: RegExp;
}

export const CLIENT_FAMILIES: readonly ClientFamily[] = [
  { id: 'clash', label: 'Clash 系（Clash / Verge / Mihomo / Meta）', test: /clash|mihomo/i },
  { id: 'shadowrocket', label: 'Shadowrocket（小火箭）', test: /shadowrocket|小火箭/i },
  { id: 'surge', label: 'Surge', test: /surge/i },
  { id: 'quantumult', label: 'Quantumult X', test: /quantumult/i },
  { id: 'v2ray', label: 'v2rayN / v2rayNG', test: /v2ray/i },
  { id: 'singbox', label: 'sing-box', test: /sing-?box/i },
  { id: 'stash', label: 'Stash', test: /stash/i },
  { id: 'loon', label: 'Loon', test: /loon/i },
  { id: 'own', label: '官方/自研客户端', test: /官方|自研|自有|Nextin/i },
  { id: 'generic', label: '通用订阅', test: /通用订阅|兼容/ },
];

export const clientFamiliesOf = (clients: readonly string[]): string[] =>
  CLIENT_FAMILIES.filter((f) => clients.some((c) => f.test.test(c))).map((f) => f.id);
