import { useState } from 'react'
import { HookTester } from '.'
import { CleanupManager } from '../cleanup-manager'
import { ActionNotExistError, ValueNotExistError } from '../../errors'

const cleanupManager = new CleanupManager()
afterEach(() => { cleanupManager.run() })

test('Synchronous execution', (): void => {

  const tester = new HookTester({
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
  expect(tester.renderCount).toBe(1)
  expect(tester.get('value')).toBe(0)

  // After increment
  tester.action('increaseCounter')
  tester.action('increaseCounter', 'increaseCounter')
  expect(tester.renderCount).toBe(3)
  expect(tester.get('value')).toBe(3)

  // Non-existent action
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.action('abc') }).toThrow(ActionNotExistError)

  // Non-existent value
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.get('abc') }).toThrow(ValueNotExistError)

})

test('Asynchronous execution', async (): Promise<void> => {

  jest.useRealTimers()

  const tester = new HookTester({
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
  expect(tester.renderCount).toBe(1)
  expect((await tester.get('value'))).toBe(0)

  // After increment
  await tester.actionAsync('increaseCounter')
  await tester.actionAsync(
    'increaseCounter',
    'increaseCounter',
  )
  expect(tester.renderCount).toBe(3)
  expect((await tester.get('value'))).toBe(2)

  // Experimental async actions - basically each async action will be executed
  // on one render, no more batching :(
  await tester.actionAsync(
    'increaseCounter',
    'increaseCounter',
    'increaseCounter',
    'increaseCounter',
  )
  expect(tester.renderCount).toBe(7)
  expect((await tester.get('value'))).toBe(6)

  // Non-existent action
  await expect(async () => {
    // @ts-expect-error Ignored on purpose to test the error
    await tester.actionAsync('abc')
  }).rejects.toThrow(ActionNotExistError)

  // Non-existent value
  await expect(async () => {
    // @ts-expect-error Ignored on purpose to test the error
    await tester.get('abc')
  }).rejects.toThrow(ValueNotExistError)

})
