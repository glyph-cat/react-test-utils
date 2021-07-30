export const $$cleanupQueue = Symbol()

/**
 * @public
 */
export interface CleanupRef {
  /**
   * @internal
   */
  [$$cleanupQueue]: Array<unknown>
  /**
   * @public
   */
  run(): void
}

export function appendCleanupQueue(
  cleanupRef: CleanupRef,
  callback: () => void
): void {
  cleanupRef[$$cleanupQueue].push(callback)
}
