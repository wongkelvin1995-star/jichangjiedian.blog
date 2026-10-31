import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// 纯静态输出。sitemap.xml 与 robots.txt 由 src/pages 下的端点生成（需要排除 noindex 页面并使用真实 lastmod），
// 因此不使用 @astrojs/sitemap。
export default defineConfig({
  site: 'https://jichangjiedian.blog',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // 样式一律输出为外部文件，便于部署严格的 CSP（style-src 'self'）
    inlineStylesheets: 'never',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  // 代码块不使用 Shiki：它会给 <pre> 写内联 style，与严格 CSP（style-src 'self'）冲突。
  // 站内只有极少的代码块（CSV 列名模板），用 prose.css 里的样式即可。
  markdown: { syntaxHighlight: false },
  integrations: [mdx()],
  vite: {
    build: {
      // 脚本同样不内联为 data: 或 inline，保证 script-src 'self' 可用
      assetsInlineLimit: 0,
    },
  },
});
