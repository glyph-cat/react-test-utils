import { createSuspenseWaiter } from '.'
import { TestUtils } from '..'

describe(createSuspenseWaiter.name, () => {

  jest.useRealTimers()

  test('Error', async () => {
    const promise = Promise.reject('match-key')
    const wait = createSuspenseWaiter(promise)
    await TestUtils.delay(10)
    expect(() => { wait() }).toThrow('match-key')
  })

  test('Pending', async () => {
    const promise = TestUtils.delay(20)
    const wait = createSuspenseWaiter(promise)
    await TestUtils.delay(10)
    expect(() => { wait() }).toThrow()
  })

  test('Completed', async () => {
    const promise = TestUtils.delay(10)
    const wait = createSuspenseWaiter(promise)
    await TestUtils.delay(20)
    expect(() => { wait() }).not.toThrow()
  })

})
