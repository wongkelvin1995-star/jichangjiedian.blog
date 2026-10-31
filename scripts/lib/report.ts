/** 校验脚本的统一输出：逐项列出通过/失败，任何失败都让进程以非 0 退出。 */
export class Report {
  private failures: string[] = [];
  private passes = 0;
  private warns: string[] = [];

  constructor(private readonly title: string) {
    console.log(`\n▶ ${title}`);
  }

  /** 断言：失败时记录消息，不立即退出，这样一次运行就能看到全部问题 */
  check(ok: boolean, message: string, detail?: string): boolean {
    if (ok) {
      this.passes++;
    } else {
      this.failures.push(detail ? `${message}\n      ${detail}` : message);
    }
    return ok;
  }

  warn(message: string): void {
    this.warns.push(message);
  }

  finish(): never {
    for (const w of this.warns) console.log(`  ⚠ ${w}`);
    if (this.failures.length === 0) {
      console.log(`  ✓ ${this.title}：${this.passes} 项通过${this.warns.length ? `，${this.warns.length} 条提示` : ''}`);
      process.exit(0);
    }
    for (const f of this.failures.slice(0, 80)) console.log(`  ✗ ${f}`);
    if (this.failures.length > 80) console.log(`  …另有 ${this.failures.length - 80} 项失败`);
    console.log(`  ✗ ${this.title}：${this.failures.length} 项失败，${this.passes} 项通过`);
    process.exit(1);
  }
}
