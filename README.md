# 机场节点 · jichangjiedian.blog

机场节点资料站的源码与数据：34 家机场的节点数量、线路类型和套餐价格，加上灵动云的晚高峰测速记录。每个数字都标明来源和等级，没有测过的机场不会写成"实测"。

- 站点：https://jichangjiedian.blog/
- 资料汇总（图文版）：[Issue #1](https://github.com/wongkelvin1995-star/jichangjiedian.blog/issues/1)
- Telegram 交流群：https://t.me/+wENW-g34bXY2MjM1

![机场节点资料库横幅：34 家机场的节点数量、线路类型、套餐价格与灵动云测速记录](docs/images/hero.jpg)

## 内容

Astro + TypeScript 静态站：全球节点航线地图、34 家机场目录、套餐对比、分时段测试档案、研究文章与教程。

## 本地运行

```bash
npm ci
npm run dev       # 本地开发
npm run verify    # 类型检查 + 数据校验 + 构建 + 页面校验
npm test          # 浏览器端到端、移动端、无障碍测试
```

文档：`docs/DEPLOYMENT.md`（部署与维护）、`docs/OPEN_ISSUES.md`（待核验问题）、`docs/SEO_AUDIT.md`、`docs/ACCEPTANCE_REPORT.md`、`docs/DATA_SOURCES.md`。

数据集中在 `src/data/`。站点不承诺收录时间或搜索排名；品牌顺序是编辑顺序，不是排名。
