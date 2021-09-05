import { createElement, Fragment, useLayoutEffect } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { appendCleanupQueue, CleanupRef } from '../cleanup-ref/bases'
import { RootRef } from '../schema'

type UNSTABLE_FunctionType = (...args: Array<unknown>) => unknown

/**
 * @public
 */
export interface HookInterfaceActionDefinition<M extends UNSTABLE_FunctionType> {
  (arg: { hookValue: ReturnType<M> }): void
}

/**
 * @public
 */
export interface HookInterfaceValueMapper<M extends UNSTABLE_FunctionType> {
  (arg: { hookValue: ReturnType<M> }): unknown
}

/**
 * @public
 */
export interface HookInterfaceChannel<A extends string, V extends string, M extends UNSTABLE_FunctionType> {
  hook: M
  actions?: Record<A, HookInterfaceActionDefinition<M>>
  values?: Record<V, HookInterfaceValueMapper<M>>
}

/**
 * @public
 */
export type HookInterfaceChannelsCollection<K extends string, A extends string, V extends string, M extends UNSTABLE_FunctionType> = Record<K, HookInterfaceChannel<A, V, M>>

/**
 * @public
 */
export interface HookInterface<A extends string, V extends string> {
  root: RootRef,
  actions(actionKeyStack: Array<A>): void,
  get(valueKey: V): string
  getRenderCount(): number
}

/**
 * @public
 */
export interface CompoundHookInterface<K extends string, A extends string, V extends string> {
  root: RootRef,
  at(channelKey: K): Omit<HookInterface<A, V>, 'root'>
}

/**
 * A wrapper for testing a React Hook by abstracting the DOM container's logic.
 * @public
 */
export function createHookInterface<A extends string, V extends string, M extends UNSTABLE_FunctionType>(
  config: HookInterfaceChannel<A, V, M>,
  cleanupRef: CleanupRef
): HookInterface<A, V> {
  const chi = createCompoundHookInterface({ a: config }, cleanupRef)
  return {
    root: chi.root,
    actions: chi.at('a').actions,
    get: chi.at('a').get,
    getRenderCount: chi.at('a').getRenderCount,
  }
}

/**
 * A wrapper for testing multiple React Hooks by abstracting the DOM container's
 * logic.
 * @public
 */
export function createCompoundHookInterface<K extends string, A extends string, V extends string, M extends UNSTABLE_FunctionType>(
  channels: HookInterfaceChannelsCollection<K, A, V, M>,
  cleanupRef: CleanupRef
): CompoundHookInterface<K, A, V> {

  const renderStack = []
  const renderCount = {}
  const outlets = {}

  const channelKeys = Object.keys(channels)
  const channelValueKeysCache = {}
  for (let i = 0; i < channelKeys.length; i++) {
    const channelKey = channelKeys[i]

    renderCount[channelKey] = 0
    outlets[channelKey] = {
      dispatchableActions: {},
      retrievableValues: {},
    }
    const { hook, actions = {}, values = {} } = channels[channelKey]

    const ChildComponent = () => {
      const hookData = hook()
      useLayoutEffect(() => { renderCount[channelKey] += 1 })

      const actionKeys = Object.keys(actions)
      outlets[channelKey].dispatchableActions = {}
      for (const actionKey of actionKeys) {
        const actionCallback = actions[actionKey]
        outlets[channelKey].dispatchableActions[actionKey] = () => {
          actionCallback({ hookValue: hookData })
        }
      }

      const valueKeys = Object.keys(values)
      channelValueKeysCache[channelKey] = valueKeys
      outlets[channelKey].retrievableValues = {}
      for (const valueKey of valueKeys) {
        const valueMapper = values[valueKey]
        const mappedValue = valueMapper({ hookValue: hookData })
        outlets[channelKey].retrievableValues[valueKey] = mappedValue
      }

      return null
    }

    renderStack.push(createElement(ChildComponent, { key: channelKey }))
  }

  let root: ReactTestRenderer
  act(() => { root = create(createElement(Fragment, {}, renderStack)) })
  appendCleanupQueue(cleanupRef, root.unmount)

  return {
    root: { current: root },
    at: (channelKey: string) => {
      if (!outlets[channelKey]) {
        throw new ReferenceError(`Channel '${channelKey}' is undefined`)
      }
      return {
        actions: (actionKeyStack: Array<string>) => {
          if (!Array.isArray(actionKeyStack)) {
            // This allows multiple actions to be invoked in the same `act()` callback
            actionKeyStack = [actionKeyStack]
          }
          act(() => {
            // Array of actions are batched in one `act()`
            for (const actionKey of actionKeyStack) {
              if (!outlets[channelKey].dispatchableActions[actionKey]) {
                throw new ReferenceError(
                  `Action '${actionKey} in '${channelKey}' is undefined`
                )
              }
              outlets[channelKey].dispatchableActions[actionKey]()
            }
          })
        },
        get: (valueKey: string) => {
          if (!channelValueKeysCache[channelKey].includes(valueKey)) {
            throw new ReferenceError(
              `Value '${valueKey}' in '${channelKey}' is undefined`
            )
          }
          return outlets[channelKey].retrievableValues[valueKey]
        },
        getRenderCount: () => renderCount[channelKey],
      }
    },
  }
}
