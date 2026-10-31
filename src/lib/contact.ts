/**
 * 站点公开联系邮箱：由站长在构建环境里设置 PUBLIC_CONTACT_EMAIL，仓库里不写死任何邮箱。
 * 未设置时页面显示“暂未公布”。
 *
 * 单独放在这个文件里，是因为它依赖 Vite 的 import.meta.env；
 * src/lib/site.ts 只放纯常量，这样 Node 脚本（scripts/validate-*.ts）也能直接引用。
 */
export const CONTACT_EMAIL: string | null = (import.meta.env.PUBLIC_CONTACT_EMAIL as string | undefined)?.trim() || null;
