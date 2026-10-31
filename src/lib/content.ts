/** 研究文章与教程两个内容集合的统一读取。 */
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type PostKind = 'articles' | 'guides';

export interface PostItem {
  id: string;
  kind: PostKind;
  href: string;
  title: string;
  h1: string;
  description: string;
  category: string;
  published: string;
  modified: string;
  order: number;
  brands: string[];
  regions: string[];
  related: string[];
  keywords: string[];
  entry: CollectionEntry<PostKind>;
}

const toItem = (kind: PostKind, e: CollectionEntry<PostKind>): PostItem => ({
  id: e.id,
  kind,
  href: `/${kind}/${e.id}/`,
  title: e.data.title,
  h1: e.data.h1 ?? e.data.title,
  description: e.data.description,
  category: e.data.category,
  published: e.data.published,
  modified: e.data.modified,
  order: e.data.order,
  brands: e.data.brands,
  regions: e.data.regions,
  related: e.data.related,
  keywords: e.data.keywords,
  entry: e,
});

let cache: PostItem[] | null = null;

/** 全部已发布（draft=false）的文章与教程，按规划序号排序 */
export async function loadPosts(): Promise<PostItem[]> {
  if (cache) return cache;
  const [a, g] = await Promise.all([getCollection('articles'), getCollection('guides')]);
  cache = [...a.map((e) => toItem('articles', e)), ...g.map((e) => toItem('guides', e))]
    .filter((p) => !p.entry.data.draft)
    .sort((x, y) => x.order - y.order || x.id.localeCompare(y.id));
  return cache;
}

export const postsForRegion = (posts: PostItem[], slug: string): PostItem[] => posts.filter((p) => p.regions.includes(slug));
export const postsForBrand = (posts: PostItem[], slug: string): PostItem[] => posts.filter((p) => p.brands.includes(slug));
