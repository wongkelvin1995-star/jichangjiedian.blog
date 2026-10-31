// ESLint 平面配置：TypeScript（类型感知）+ Astro 组件。只检查源码、脚本与测试，不检查构建产物。
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'public/**', 'reports/**', 'docs/**', 'evidence-originals/**', '.scratch/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // 项目里数组按索引访问后常用 `!` 断言（tsconfig 开了 noUncheckedIndexedAccess），不视为问题
      '@typescript-eslint/no-non-null-assertion': 'off',
      // 中文文案里会出现全角空格等“非常规空白”，那是文字内容不是代码；只在代码里检查
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipComments: true, skipRegExps: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Astro 模板的文字内容里允许全角空格等中文排版空白
      'no-irregular-whitespace': 'off',
    },
  },
);
