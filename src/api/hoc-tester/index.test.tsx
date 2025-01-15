import { CleanupManager } from '@glyph-cat/cleanup-manager'
import { ComponentType, Component as ReactComponent, useState } from 'react'
import { HOCTester } from '.'
import { ActionNotExistError, ValueNotExistError } from '../../errors'
import { TestUtils } from '../../test-utils'

const cleanupManager = new CleanupManager()
afterEach(() => { cleanupManager.run() })

interface CounterState { counter: number }

interface CounterProps {
  state: ReturnType<typeof useState<CounterState>>
}

function withCounter(Component: ComponentType<CounterProps>) {

  class WithCounter extends ReactComponent<Record<string, never>, CounterState> {

    readonly state = { counter: 0 }

    render() {
      return (
        <Component
          state={[
            this.state,
            this.setState.bind(this),
            // Will get error if we don't bind it here.
            // "Cannot read property 'updater' of undefined"
            // See: https://github.com/facebook/react/issues/9654#issuecomment-300659423
          ]}
        />
      )
    }

    increaseCounter = () => {
      this.setState((oldState) => ({
        ...oldState,
        counter: oldState.counter + 1,
      }))
    }

  }

  return WithCounter

}

test('Synchronous execution', async (): Promise<void> => {

  const tester = new HOCTester({
    factory: (Component) => withCounter(Component),
    actions: {
      increaseCounter: (props) => {
        const [, setState] = props.state
        setState((oldState: CounterState) => ({
          ...oldState,
          counter: oldState.counter + 1,
        }))
      },
    },
    values: {
      value: ((props) => {
        const [state] = props.state
        return state.counter
      }),
    },
  }, cleanupManager)

  // Initial state
  expect(tester.renderCount).toBe(1)
  expect(tester.get('value')).toBe(0)

  // After increment
  tester.action('increaseCounter')
  expect(tester.renderCount).toBe(2)
  expect(tester.get('value')).toBe(1)

  // After another increment
  tester.action('increaseCounter', 'increaseCounter')
  expect(tester.renderCount).toBe(3)
  expect(tester.get('value')).toBe(3)

  // Non-existent action
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.action(['abc']) }).toThrow(ActionNotExistError)

  // Non-existent values
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.get('abc') }).toThrow(ValueNotExistError)

})

test('Asynchronous execution', async (): Promise<void> => {

  jest.useRealTimers()

  const tester = new HOCTester({
    factory: (Component) => withCounter(Component),
    actions: {
      async increaseCounter(props): Promise<void> {
        const [, setState] = props.state
        await TestUtils.delay(100)
        setState((oldState: CounterState) => ({
          ...oldState,
          counter: oldState.counter + 1,
        }))
      },
    },
    values: {
      value: ((props) => {
        const [state] = props.state
        return state.counter
      }),
    },
  }, cleanupManager)

  // Initial state
  expect(tester.renderCount).toBe(1)
  expect((tester.get('value'))).toBe(0)

  // After increment
  await tester.actionAsync('increaseCounter')
  expect(tester.renderCount).toBe(2)
  expect(tester.get('value')).toBe(1)

  // After another increment
  await tester.actionAsync(
    'increaseCounter',
    'increaseCounter',
  )
  expect(tester.renderCount).toBe(3)
  expect(tester.get('value')).toBe(3)

  // Every set of actions called in `action` or `actionAsync` will be batched.
  await tester.actionAsync(
    'increaseCounter',
    'increaseCounter',
    'increaseCounter',
    'increaseCounter',
  )
  expect(tester.renderCount).toBe(4)
  expect(tester.get('value')).toBe(7)

  // Non-existent action
  await expect(async () => {
    // @ts-expect-error Ignored on purpose to test the error
    await tester.actionAsync('abc')
  }).rejects.toThrow(ActionNotExistError)

  // Non-existent value
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.get('abc') }).toThrow(ValueNotExistError)

})
