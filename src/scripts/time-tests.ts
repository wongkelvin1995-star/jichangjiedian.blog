/**
 * 记录浏览器筛选：按关键词（品牌/节点/地区）、品牌、地区、时间窗口、来源等级过滤。
 * 只隐藏不匹配的行；不改变页面上的数据，也不生成任何新数据。
 */
const root = document.querySelector<HTMLElement>('[data-record-browser]');
if (root) {
  const form = root.querySelector<HTMLFormElement>('[data-record-filters]');
  const rows = Array.from(root.querySelectorAll<HTMLTableRowElement>('[data-record-table] tbody tr'));
  const count = root.querySelector<HTMLElement>('[data-record-count]');
  const empty = root.querySelector<HTMLElement>('[data-record-empty]');
  if (form) {
    form.hidden = false;
    const field = <T extends HTMLInputElement | HTMLSelectElement>(name: string) => form.elements.namedItem(name) as T;
    const q = field<HTMLInputElement>('q');
    const brand = field<HTMLSelectElement>('brand');
    const region = field<HTMLSelectElement>('region');
    const win = field<HTMLSelectElement>('window');
    const grade = field<HTMLSelectElement>('grade');
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

    const apply = () => {
      const kw = norm(q.value);
      let shown = 0;
      for (const tr of rows) {
        const ok =
          (!kw || (tr.dataset.search ?? '').includes(kw)) &&
          (!brand.value || tr.dataset.brand === brand.value) &&
          (!region.value || (tr.dataset.regions ?? '').split(' ').includes(region.value)) &&
          (!win.value || tr.dataset.window === win.value) &&
          (!grade.value || tr.dataset.grade === grade.value);
        tr.hidden = !ok;
        if (ok) shown++;
      }
      const filtered = !!(kw || brand.value || region.value || win.value || grade.value);
      if (count) count.textContent = filtered ? `显示 ${shown} / ${rows.length} 条记录` : `共 ${rows.length} 条记录`;
      if (empty) empty.hidden = shown > 0;
    };

    const preset = new URLSearchParams(location.search);
    const pw = preset.get('window');
    if (pw && Array.from(win.options).some((o) => o.value === pw)) win.value = pw;
    const pb = preset.get('brand');
    if (pb && Array.from(brand.options).some((o) => o.value === pb)) brand.value = pb;

    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('reset', () => setTimeout(apply, 0));
    apply();
  }
}

export {};
