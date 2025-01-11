/**
 * @public
 */
export class CleanupManager {

  /**
   * @internal
   */
  readonly M$queue: Array<() => void> = []

  constructor() {
    this.append = this.append.bind(this)
    this.run = this.run.bind(this)
  }

  append(cleanupFn: () => void): void {
    this.M$queue.push(cleanupFn)
  }

  run(): void {
    while (this.M$queue.length > 0) {
      const cleanupCallback = this.M$queue.shift()
      cleanupCallback?.()
    }
  }

}
