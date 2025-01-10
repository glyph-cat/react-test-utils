import { useState } from 'react'
import { HookTester } from '.'
import { CleanupManager } from '../cleanup-manager'

const cleanupManager = new CleanupManager()
afterEach(() => { cleanupManager.run() })

describe(HookTester.name, () => {

  test('Synchronous execution', (): void => {

    const hookInterface = new HookTester({
      useHook: () => useState(0),
      actions: {
        increaseCounter(hookData) {
          const [, setCounter] = hookData
          setCounter((c: number) => c + 1)
        },
      },
      values: {
        value(hookData) {
          const [counter] = hookData
          return counter
        },
      },
    }, cleanupManager)

    // Initial state
    expect(hookInterface.renderCount).toBe(1)
    expect(hookInterface.get('value')).toBe(0)

    // After increment
    hookInterface.actionSync('increaseCounter')
    hookInterface.actionSync('increaseCounter', 'increaseCounter')
    expect(hookInterface.renderCount).toBe(3)
    expect(hookInterface.get('value')).toBe(3)

    // Non-existent action
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Ignored on purpose to test the error
    expect(() => { hookInterface.actionSync('abc') }).toThrow()

    // Non-existent value
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Ignored on purpose to test the error
    expect(() => { hookInterface.get('abc') }).toThrow()

  })

  test('Asynchronous execution', async (): Promise<void> => {

    jest.useRealTimers()

    const hookInterface = new HookTester({
      useHook: () => useState(0),
      actions: {
        increaseCounter(hookData): Promise<void> {
          const [, setCounter] = hookData
          return new Promise((resolve) => {
            setTimeout(() => {
              setCounter((c: number) => c + 1)
              resolve()
            }, 100)
          })
        },
      },
      values: {
        value(hookData): Promise<number> {
          const [counter] = hookData
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(counter)
            }, 100)
          })
        },
      },
    }, cleanupManager)

    // Initial state
    expect(hookInterface.renderCount).toBe(1)
    expect((await hookInterface.get('value'))).toBe(0)

    // After increment
    await hookInterface.action('increaseCounter')
    await hookInterface.action(
      'increaseCounter',
      'increaseCounter',
    )
    expect(hookInterface.renderCount).toBe(3)
    expect((await hookInterface.get('value'))).toBe(2)

    // Experimental async actions - basically each async action will be executed
    // on one render, no more batching :(
    await hookInterface.action(
      'increaseCounter',
      'increaseCounter',
      'increaseCounter',
      'increaseCounter',
    )
    expect(hookInterface.renderCount).toBe(7)
    expect((await hookInterface.get('value'))).toBe(6)

    // Non-existent action
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error Ignored on purpose to test the error
      await hookInterface.action('abc')
    }).rejects.toThrow()

    // Non-existent value
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error Ignored on purpose to test the error
      await hookInterface.get('abc')
    }).rejects.toThrow()

  })

})
