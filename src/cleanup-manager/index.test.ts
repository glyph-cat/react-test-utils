import { CleanupManager } from '.'

describe(CleanupManager.name, () => {

  test('Initial state', () => {
    const cleanupHandler = new CleanupManager()
    expect(cleanupHandler.M$queue).toStrictEqual([])
  })

})

describe('appendCleanupQueue', () => {

  test('Appending', () => {
    const cleanupHandler = new CleanupManager()
    const mockCallback = jest.fn()
    cleanupHandler.append(mockCallback)
    expect(cleanupHandler.M$queue).toStrictEqual([mockCallback])
  })

  test('Loop through queue', () => {
    const cleanupHandler = new CleanupManager()
    const mockCallback = jest.fn()
    cleanupHandler.append(mockCallback)
    cleanupHandler.run()
    expect(mockCallback).toHaveBeenCalled()
    expect(cleanupHandler.M$queue).toStrictEqual([])
  })

})
