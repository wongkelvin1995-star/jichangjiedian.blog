/**
 * 套餐对比表的全部报价（构建时生成的静态 JSON）。/plans/ 的 HTML 只带前 40 行，
 * 筛选、排序和“显示更多”由 src/scripts/plans.ts 读取这个文件完成。字段说明见 src/lib/plan-rows.ts。
 */
import type { APIRoute } from 'astro';
import { GRADE_TEXT, PLAN_ROWS } from '../lib/plan-rows';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ grades: GRADE_TEXT, rows: PLAN_ROWS }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
