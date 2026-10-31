/** 去掉备注里只对编辑有用的出处说明（“与 2026-10-26 的第三方资料一致”等），留下对读者有用的内容。 */
const DROP = /(第三方|汇编资料|页面存档|站长 Excel|来源|核验|此前的说明|此前的资料|本站未取得|对比站|资料日期|读取）)/;
export const userNote = (text: string | null | undefined): string =>
  (text ?? '')
    .split(/(?<=[。；])\s*/)
    .map((x) => x.trim())
    .filter((x) => x && !DROP.test(x))
    .join('')
    .replace(/；$/, '。');
