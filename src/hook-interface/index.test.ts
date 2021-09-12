import { useState } from 'react'
import { createCleanupRef } from '../cleanup-ref'
import { createHookInterface } from '.'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

describe(createHookInterface.name, () => {

  test('Synchronous execution', (): void => {

    const hookInterface = createHookInterface({
      useHook: () => useState(0),
      actions: {
        increaseCounter({ hookData }) {
          const [, setCounter] = hookData
          setCounter((c: number) => c + 1)
        },
      },
      values: {
        value({ hookData }) {
          const [counter] = hookData
          return counter
        },
      },
    }, cleanupRef)

    // Initial state
    expect(hookInterface.getRenderCount()).toBe(1)
    expect(hookInterface.get('value')).toBe(0)

    // After increment
    hookInterface.actions('increaseCounter')
    hookInterface.actions('increaseCounter', 'increaseCounter')
    expect(hookInterface.getRenderCount()).toBe(3)
    expect(hookInterface.get('value')).toBe(3)

    // Non-existent action
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Ignored on purpose to test the error
      hookInterface.actions(['abc'])
    }).toThrow()

    // Non-existent value
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Ignored on purpose to test the error
      hookInterface.get('abc')
    }).toThrow()

  })

  test('Asynchronous execution', async (): Promise<void> => {

    jest.useRealTimers()

    const hookInterface = createHookInterface({
      useHook: () => useState(0),
      actions: {
        increaseCounter({ hookData }): Promise<void> {
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
        value({ hookData }): Promise<number> {
          const [counter] = hookData
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(counter)
            }, 100)
          })
        },
      },
    }, cleanupRef)

    // Initial state
    expect(hookInterface.getRenderCount()).toBe(1)
    expect((await hookInterface.get('value'))).toBe(0)

    // After increment
    await hookInterface.actionAsync('increaseCounter')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored on purpose to test the error
    await hookInterface.actionAsync('increaseCounter', 'increaseCounter')
    expect(hookInterface.getRenderCount()).toBe(3)
    expect((await hookInterface.get('value'))).toBe(2)

    // Non-existent action
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Ignored on purpose to test the error
      await hookInterface.actionAsync('abc')
    }).rejects.toThrow()

    // Non-existent value
    await expect(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Ignored on purpose to test the error
      await hookInterface.get('abc')
    }).rejects.toThrow()

  })

})
