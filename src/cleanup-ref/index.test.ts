import { $$cleanupQueue, appendCleanupQueue } from './bases'
import { createCleanupRef } from '.'

describe('createCleanupRef', () => {

  test('Initial state', () => {
    const cleanupRef = createCleanupRef()
    expect(cleanupRef[$$cleanupQueue]).toStrictEqual([])
  })

})

describe('appendCleanupQueue', () => {

  test('Appending', () => {
    const cleanupRef = createCleanupRef()
    const mockCallback = jest.fn()
    appendCleanupQueue(cleanupRef, mockCallback)
    expect(cleanupRef[$$cleanupQueue]).toStrictEqual([mockCallback])
  })

  test('Loop through queue', () => {
    const cleanupRef = createCleanupRef()
    const mockCallback = jest.fn()
    appendCleanupQueue(cleanupRef, mockCallback)
    cleanupRef.run()
    expect(mockCallback).toBeCalledTimes(1)
    // Expect queue to be cleaned up as well
    expect(cleanupRef[$$cleanupQueue]).toStrictEqual([])
  })

})
