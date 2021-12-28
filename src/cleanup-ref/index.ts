/**
 * @public
 */
export function createCleanupRef(): CleanupRef {
  const self = {
    [$$cleanupQueue]: [],
    run: () => {
      while (self[$$cleanupQueue].length > 0) {
        const cleanupCallback = self[$$cleanupQueue].shift()
        cleanupCallback()
      }
    },
  }
  return self
}

/**
 * @public
 */
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

/**
 * @internal
 */
export function appendCleanupQueue(
  cleanupRef: CleanupRef,
  callback: () => void
): void {
  cleanupRef[$$cleanupQueue].push(callback)
}
