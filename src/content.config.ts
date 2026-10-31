import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * YAML 会把不带引号的 2026-10-27 解析成 Date；这里统一还原为 YYYY-MM-DD 字符串（按 UTC 取日期，
 * 与 YAML 的解析方式一致），避免时区把日期推到前一天。
 */
const date = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
);

/** 研究文章与教程共用的 frontmatter。日期必须是真实发布/修改日期（会进入 sitemap 的 lastmod 与结构化数据）。 */
const post = z.object({
  title: z.string().min(8).max(60),
  description: z.string().min(50).max(160),
  /** 页面 H1；省略时与 title 相同 */
  h1: z.string().optional(),
  published: date,
  modified: date,
  /** 列表中的分类名称 */
  category: z.string(),
  keywords: z.array(z.string()).default([]),
  /** 相关品牌 slug（用于文末“相关资料”） */
  brands: z.array(z.string()).default([]),
  /** 相关地区页 slug */
  regions: z.array(z.string()).default([]),
  /** 相关文章/教程路径，如 /articles/xxx/ */
  related: z.array(z.string()).default([]),
  /** 规划序号，仅用于列表排序（题目清单序号），不是质量排名 */
  order: z.number().default(100),
  draft: z.boolean().default(false),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: post,
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: post,
});

export const collections = { articles, guides };
