import React, { Component as ReactComponent } from 'react'
import { createCleanupRef } from '../cleanup-ref'
import { UNSTABLE_createHocInterface } from '.'

interface CounterState { counter: number }

function withCounter(Component) {

  class WithCounter extends ReactComponent<Record<string, never>, CounterState> {

    state = { counter: 0 }

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

test(UNSTABLE_createHocInterface.name, () => {

  const cleanupRef = createCleanupRef()
  const chi = UNSTABLE_createHocInterface({
    entry: ({ Component }) => withCounter(Component),
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
  }, cleanupRef)

  // Initial state
  expect(chi.getRenderCount()).toBe(1)
  expect(chi.get('value')).toBe(0)

  // After increment
  chi.actions(['increaseCounter'])
  chi.actions(['increaseCounter'])
  chi.actions(['increaseCounter'])
  expect(chi.getRenderCount()).toBe(4)
  expect(chi.get('value')).toBe(3)

  // Non-existent action
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored on purpose to test the error
    chi.actions(['abc'])
  }).toThrow()

  // Non-existent values
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Ignored on purpose to test the error
    chi.get('abc')
  }).toThrow()

  // Cleanup
  cleanupRef.run()

})
