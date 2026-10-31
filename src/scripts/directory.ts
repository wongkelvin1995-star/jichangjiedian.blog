/**
 * 机场目录筛选：按名称/别名/英文名、最低月付价格、有公开资料记录的地区过滤。
 * 只隐藏不匹配的行，不改变默认的固定编辑顺序；“恢复默认顺序”清空全部筛选。
 */
const root = document.querySelector<HTMLElement>('[data-directory]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-directory-filters]');
  const rows = Array.from(root.querySelectorAll<HTMLTableRowElement>('[data-directory-table] tbody tr'));
  const count = root.querySelector<HTMLElement>('[data-directory-count]');
  const empty = root.querySelector<HTMLElement>('[data-directory-empty]');
  if (form) {
    form.hidden = false;
    const q = form.elements.namedItem('q') as HTMLInputElement;
    const status = form.elements.namedItem('price') as HTMLSelectElement;
    const region = form.elements.namedItem('region') as HTMLSelectElement;
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

    const apply = () => {
      const kw = norm(q.value);
      let shown = 0;
      for (const tr of rows) {
        const ok =
          (!kw || (tr.dataset.search ?? '').includes(kw)) &&
          (!status.value || tr.dataset.price === status.value) &&
          (!region.value || (tr.dataset.regions ?? '').split(' ').includes(region.value));
        tr.hidden = !ok;
        if (ok) shown++;
      }
      const filtered = !!(kw || status.value || region.value);
      if (count) count.textContent = filtered ? `显示 ${shown} / ${rows.length} 家，仍按固定编辑顺序排列` : '';
      if (empty) empty.hidden = shown > 0;
    };

    // 允许从站内搜索跳转：/airports/?q=灵动
    const preset = new URLSearchParams(location.search).get('q');
    if (preset) q.value = preset.slice(0, 40);

    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('reset', () => setTimeout(apply, 0));
    apply();
  }
}

export {};
