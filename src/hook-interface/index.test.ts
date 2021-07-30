import { useState } from 'react'
import { createCleanupRef } from '../cleanup-ref'
import { createCompoundHookInterface } from '.'

test('createCompoundHookInterface', () => {

  const PATH_A = 'pathA'
  const cleanupRef = createCleanupRef()
  const chi = createCompoundHookInterface({
    [PATH_A]: {
      hook: {
        method: useState,
        parameters: [0],
      },
      actions: {
        increaseCounter: ({ hookValue }) => {
          const [, setCounter] = hookValue
          setCounter((c: number) => c + 1)
        },
      },
      values: {
        value: ({ hookValue }) => {
          const [counter] = hookValue
          return counter
        },
      },
    },
  }, cleanupRef)

  // Initial state
  expect(chi.at(PATH_A).getRenderCount()).toBe(1)
  expect(chi.at(PATH_A).get('value')).toBe(0)

  // After increment
  chi.at(PATH_A).actions(['increaseCounter'])
  chi.at(PATH_A).actions(['increaseCounter', 'increaseCounter'])
  expect(chi.at(PATH_A).getRenderCount()).toBe(3)
  expect(chi.at(PATH_A).get('value')).toBe(3)

  // Non-existent channel
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored on purpose to test the error
    chi.at('abc').actions(['increaseCounter'])
  }).toThrow()

  // Non-existent action
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored on purpose to test the error
    chi.at(PATH_A).actions(['abc'])
  }).toThrow()

  // Non-existent values
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored on purpose to test the error
    chi.at(PATH_A).get('abc')
  }).toThrow()

  // Cleanup
  cleanupRef.run()

})
