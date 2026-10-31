/** 结构化数据（JSON-LD）构造函数。所有内容来自站内真实数据，不虚构评分、评论或价格。 */
import { SITE_LANG, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from './site';

export type JsonLd = Record<string, unknown>;

export interface Crumb {
  name: string;
  /** 省略 href 表示当前页 */
  href?: string;
}

export const organizationLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: absoluteUrl('/favicon-512.png'),
  description: SITE_TAGLINE,
});

export const websiteLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  description: SITE_TAGLINE,
  inLanguage: SITE_LANG,
  publisher: { '@id': `${SITE_URL}/#organization` },
});

export const breadcrumbLd = (items: Crumb[], currentPath: string): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.href ?? currentPath),
  })),
});

export interface ArticleLdInput {
  title: string;
  description: string;
  path: string;
  published: string;
  modified: string;
  image?: string;
  section?: string;
  keywords?: string[];
}

export const articleLd = (a: ArticleLdInput): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  inLanguage: SITE_LANG,
  mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(a.path) },
  datePublished: `${a.published}T00:00:00+08:00`,
  dateModified: `${a.modified}T00:00:00+08:00`,
  author: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
  publisher: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#organization`, logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon-512.png') } },
  image: [absoluteUrl(a.image ?? '/og/default.png')],
  ...(a.section ? { articleSection: a.section } : {}),
  ...(a.keywords && a.keywords.length ? { keywords: a.keywords.join(',') } : {}),
});

export const collectionLd = (name: string, description: string, path: string, items: { name: string; href: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url: absoluteUrl(path),
  inLanguage: SITE_LANG,
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absoluteUrl(it.href) })),
  },
});

/** FAQPage：问答必须与页面可见内容一字不差 */
export const faqPageLd = (faq: { q: string; a: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })),
});

/** 序列化为可安全放进 <script> 的 JSON（转义 < 以免提前结束标签） */
export const serializeLd = (data: JsonLd | JsonLd[]): string => JSON.stringify(data).replace(/</g, '\\u003c');
