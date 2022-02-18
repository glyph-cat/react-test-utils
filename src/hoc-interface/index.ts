import { Component as ReactComponent, createElement, StrictMode } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { appendCleanupQueue, CleanupRef } from '../cleanup-ref'
import { RootRef } from '../schema'

// NOTE: I don't have enough knowledge on how to make this work, so I'm only
// using the `any` type for HOCs...

/**
 * @public
 */
export interface HocInterfaceChannel<A extends string, V extends string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions?: Record<A, (props: any) => void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: Record<V, (hocData: ReturnType<any>) => string>
}

/**
 * @public
 */
export interface HocInterfaceConfig<A extends string, V extends string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry(entryArgs: { Component: any }): any
  actions?: HocInterfaceChannel<A, V>['actions']
  values?: HocInterfaceChannel<A, V>['values']
}

/**
 * @public
 */
export interface HocInterface<A extends string, V extends string> {
  root: RootRef
  actions(...actionKeyStack: Array<A>): void
  actionsAsync(...actionKeyStack: Array<A>): Promise<void>
  get(valueKey: V): string
  getRenderCount(): number
}

/**
 * @public
 */
export function UNSTABLE_createHocInterface<A extends string, V extends string>(
  config: HocInterfaceConfig<A, V>,
  cleanupRef: CleanupRef
): HocInterface<A, V> {

  const { entry, actions = {}, values = {} } = config
  const valueKeys = Object.keys(values)

  let renderCount = 0
  let dispatchableActions = {}
  let retrievableValues = {}

  class Component extends ReactComponent {

    render() {
      return null
    }

    componentDidMount() {
      this.componentDidEffect()
    }

    componentDidUpdate() {
      this.componentDidEffect()
    }

    componentDidEffect() {
      renderCount += 1
      const actionKeys = Object.keys(actions)
      dispatchableActions = {}
      for (const actionKey of actionKeys) {
        const actionCallback = actions[actionKey]
        dispatchableActions[actionKey] = () => {
          actionCallback({ props: this.props })
        }
      }

      retrievableValues = {}
      for (const valueKey of valueKeys) {
        const valueMapper = values[valueKey]
        const mappedValue = valueMapper({ props: this.props })
        retrievableValues[valueKey] = mappedValue
      }
    }

  }

  let root: ReactTestRenderer
  act(() => {
    // Parameters are first applied then passed in as a component, example
    // entry: ({ Component }) => withHoc(Component, options)
    const WrappedComponent = entry({ Component })
    root = create(
      createElement(
        StrictMode,
        null,
        createElement(WrappedComponent)
      )
    )
  })
  appendCleanupQueue(cleanupRef, root.unmount)

  return {
    root: { current: root },
    actions: (...actionKeyStack: Array<string>): void => {
      if (!Array.isArray(actionKeyStack)) {
        // This allows multiple actions to be invoked in the same `act()` callback
        actionKeyStack = [actionKeyStack]
      }
      act(() => {
        // Array of actions are batched in one `act()`
        for (const actionKey of actionKeyStack) {
          if (!dispatchableActions[actionKey]) {
            throw new ReferenceError(`Action '${actionKey}' is undefined`)
          }
          dispatchableActions[actionKey]()
        }
      })
    },
    actionsAsync: async (...actionKeyStack: Array<string>): Promise<void> => {
      if (!Array.isArray(actionKeyStack)) {
        // This allows multiple actions to be invoked in the same `act()` callback
        actionKeyStack = [actionKeyStack]
      }
      await act(async () => {
        // Actions are not guaranteed to be batched in the same render cycle
        for (const actionKey of actionKeyStack) {
          if (!dispatchableActions[actionKey]) {
            throw new ReferenceError(`Action '${actionKey}' is undefined`)
          }
          await dispatchableActions[actionKey]()
        }
      })
    },
    get: (valueKey: string) => {
      // NOTE: If we check with `retrievableValues[valueKey]`, it will trigger
      // false positive when the returned value is falsey.
      if (!valueKeys.includes(valueKey)) {
        throw new ReferenceError(`Value '${valueKey}' is undefined`)
      }
      return retrievableValues[valueKey]
    },
    getRenderCount: () => renderCount,
  }
}
