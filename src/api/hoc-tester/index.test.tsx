import { ComponentType, Component as ReactComponent, useState } from 'react'
import { HOCTester } from '.'
import { CleanupManager } from '../cleanup-manager'
import { ActionNotExistError, ValueNotExistError } from '../../errors'

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
      increaseCounter: ({ props }) => {
        const [, setState] = props.state
        setState((oldState: CounterState) => ({
          ...oldState,
          counter: oldState.counter + 1,
        }))
      },
    },
    values: {
      value: (({ props }) => {
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
  tester.action('increaseCounter')
  tester.action('increaseCounter')
  expect(tester.renderCount).toBe(4)
  expect(tester.get('value')).toBe(3)

  // Batched increment
  tester.action('increaseCounter', 'increaseCounter', 'increaseCounter')
  expect(tester.renderCount).toBe(5)
  expect(tester.get('value')).toBe(6)

  // Batched increment
  await tester.actionAsync('increaseCounter', 'increaseCounter', 'increaseCounter')
  expect(tester.renderCount).toBe(8)
  expect(tester.get('value')).toBe(9)

  // Non-existent action
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.actions(['abc']) }).toThrow(ActionNotExistError)

  // Non-existent values
  // @ts-expect-error Ignored on purpose to test the error
  expect(() => { tester.get('abc') }).toThrow(ValueNotExistError)

  // Cleanup
  cleanupManager.run()

})

test('Asynchronous execution', async (): Promise<void> => {

  jest.useRealTimers()

  // TODO

})
