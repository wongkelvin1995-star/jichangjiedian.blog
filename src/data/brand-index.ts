/**
 * 34 家机场的固定编辑展示顺序（不是速度或质量排名）。
 * 前 16 位由站长指定并固定；17–34 位同样按站长给定顺序。
 * uploadFileNo 仅用于追溯站长上传文件编号，禁止用于排序。
 */
export interface BrandIndexEntry {
  displayRank: number;
  slug: string;
  brandName: string;
  shortName: string;
  uploadFileNo: number;
}

export const BRAND_INDEX: readonly BrandIndexEntry[] = [
  { displayRank: 1, slug: 'lingdongyun', brandName: '灵动云', shortName: '灵动云', uploadFileNo: 5 },
  { displayRank: 2, slug: 'muguangjiasu', brandName: '暮光加速', shortName: '暮光加速', uploadFileNo: 1 },
  { displayRank: 3, slug: 'breezenet', brandName: '微风网络 Breezenet', shortName: '微风网络', uploadFileNo: 23 },
  { displayRank: 4, slug: 'feimaoyun', brandName: '飞猫云', shortName: '飞猫云', uploadFileNo: 7 },
  { displayRank: 5, slug: 'dalaoyun', brandName: '大佬云', shortName: '大佬云', uploadFileNo: 30 },
  { displayRank: 6, slug: 'yinxingren', brandName: '隐形人', shortName: '隐形人', uploadFileNo: 6 },
  { displayRank: 7, slug: 'laddercloud', brandName: '梯子云 LadderCloud', shortName: '梯子云', uploadFileNo: 3 },
  { displayRank: 8, slug: 'flyv', brandName: '飞V（FLYV）', shortName: '飞V', uploadFileNo: 2 },
  { displayRank: 9, slug: 'wavenet', brandName: '浪网 WaveNet', shortName: '浪网', uploadFileNo: 4 },
  { displayRank: 10, slug: 'wuyou', brandName: '无忧', shortName: '无忧', uploadFileNo: 24 },
  { displayRank: 11, slug: 'firefly', brandName: 'Firefly', shortName: 'Firefly', uploadFileNo: 27 },
  { displayRank: 12, slug: 'weituyun', brandName: '唯兔云', shortName: '唯兔云', uploadFileNo: 10 },
  { displayRank: 13, slug: 'lingmao', brandName: '灵猫', shortName: '灵猫', uploadFileNo: 25 },
  { displayRank: 14, slug: 'quanqiuyun', brandName: '全球云', shortName: '全球云', uploadFileNo: 13 },
  { displayRank: 15, slug: 'kuajie', brandName: '跨界', shortName: '跨界', uploadFileNo: 28 },
  { displayRank: 16, slug: 'flashleap', brandName: '闪跃 FlashLeap', shortName: '闪跃', uploadFileNo: 26 },
  { displayRank: 17, slug: 'sogoyun', brandName: 'Sogo云', shortName: 'Sogo云', uploadFileNo: 15 },
  { displayRank: 18, slug: 'xingdaomeng', brandName: '星岛梦 StarDream', shortName: '星岛梦', uploadFileNo: 8 },
  { displayRank: 19, slug: 'guangsuyun', brandName: '光速云 LightSpeed', shortName: '光速云', uploadFileNo: 9 },
  { displayRank: 20, slug: 'u1s1', brandName: 'U1S1 有一说一', shortName: 'U1S1', uploadFileNo: 11 },
  { displayRank: 21, slug: 'jilianyun', brandName: '极连云', shortName: '极连云', uploadFileNo: 12 },
  { displayRank: 22, slug: 'guangnianti', brandName: '光年梯', shortName: '光年梯', uploadFileNo: 14 },
  { displayRank: 23, slug: 'yuzhouyun', brandName: '宇宙云 YuZhou', shortName: '宇宙云', uploadFileNo: 16 },
  { displayRank: 24, slug: 'ermaoyun', brandName: '二猫云 2mao', shortName: '二猫云', uploadFileNo: 17 },
  { displayRank: 25, slug: 'yifanyun', brandName: '一翻云 1fly', shortName: '一翻云', uploadFileNo: 18 },
  { displayRank: 26, slug: 'edgenova', brandName: '边缘节点 EdgeNova', shortName: '边缘节点', uploadFileNo: 19 },
  { displayRank: 27, slug: 'kexinyun', brandName: '可信云', shortName: '可信云', uploadFileNo: 20 },
  { displayRank: 28, slug: 'sujie', brandName: '速界 SuJie', shortName: '速界', uploadFileNo: 21 },
  { displayRank: 29, slug: 'kuaili', brandName: '快狸 KuaiLi', shortName: '快狸', uploadFileNo: 22 },
  { displayRank: 30, slug: 'liulianyun', brandName: '榴莲云', shortName: '榴莲云', uploadFileNo: 29 },
  { displayRank: 31, slug: 'shandianyun', brandName: '闪电云', shortName: '闪电云', uploadFileNo: 31 },
  { displayRank: 32, slug: 'huanqiuyun', brandName: '环球云', shortName: '环球云', uploadFileNo: 32 },
  { displayRank: 33, slug: 'shenxingyun', brandName: '神行云', shortName: '神行云', uploadFileNo: 33 },
  { displayRank: 34, slug: 'yunjieyun', brandName: '云界云', shortName: '云界云', uploadFileNo: 34 },
];
