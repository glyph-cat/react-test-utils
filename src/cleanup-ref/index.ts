import { $$cleanupQueue, CleanupRef } from './bases'

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

export { CleanupRef } from './bases'
