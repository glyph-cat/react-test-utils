import {
  hasProperty,
  isThenable,
  useLayoutEffect,
} from '@glyph-cat/swiss-army-knife'
import { createElement, StrictMode } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { appendCleanupQueue, CleanupRef } from '../cleanup-ref'
import { RootRef } from '../schema'

/**
 * @public
 */
export type GenericHookType = (...args: Array<unknown>) => unknown

/**
 * @public
 */
export interface HookInterfaceActionDefinition<H extends GenericHookType> {
  (arg: { hookData: ReturnType<H> }): void
}

/**
 * @public
 */
export interface HookInterfaceValueMapper<H extends GenericHookType> {
  (arg: { hookData: ReturnType<H> }): unknown
}

/**
 * @public
 */
export interface HookInterfaceChannel<A extends string, V extends string, H extends GenericHookType> {
  useHook: H
  actions?: Partial<Record<A, HookInterfaceActionDefinition<H>>>
  values?: Partial<Record<V, HookInterfaceValueMapper<H>>>
}

/**
 * @public
 */
export type HookInterfaceChannelsCollection<K extends string, A extends string, V extends string, H extends GenericHookType> = Record<K, HookInterfaceChannel<A, V, H>>

/**
 * @public
 */
export interface HookInterface<A extends string, V extends string> {
  root: RootRef,
  actions(...actionKeyStack: Array<A>): void
  actionsAsync(...actionKeyStack: Array<A>): Promise<void>
  /**
   * @deprecated Use `actionsAsync` instead.
   */
  actionAsync(...actionKeyStack: Array<A>): Promise<void>
  get(valueKey: V): unknown | Promise<unknown>
  getRenderCount(): number
}

/**
 * @internal
 */
interface IOSchema<A extends string, V extends string> {
  dispatchableActions: Partial<Record<A, () => unknown>>,
  retrievableValues: Partial<Record<V, unknown>>,
}

/**
 * A wrapper for testing a React Hook by abstracting the DOM container's logic.
 * @public
 */
export function createHookInterface<
  A extends string,
  V extends string,
  H extends GenericHookType
>(
  config: HookInterfaceChannel<A, V, H>,
  cleanupRef: CleanupRef
): HookInterface<A, V> {

  const { useHook, actions = {}, values = {} } = config
  let renderCount = 0

  const io: IOSchema<A, V> = {
    dispatchableActions: {},
    retrievableValues: {},
  }

  const ContainerComponent = (): JSX.Element => {
    const hookData = useHook()
    useLayoutEffect(() => { renderCount += 1 })

    const actionKeys = Object.keys(actions)
    io.dispatchableActions = {}
    for (const actionKey of actionKeys) {
      const actionCallback = actions[actionKey]
      io.dispatchableActions[actionKey] = (): unknown => {
        return actionCallback({ hookData })
      }
    }

    const valueKeys = Object.keys(values)
    io.retrievableValues = {}
    for (const valueKey of valueKeys) {
      const valueMapper = values[valueKey]
      const mappedValue = valueMapper({ hookData })
      io.retrievableValues[valueKey] = mappedValue
    }

    return null
  }

  let root: ReactTestRenderer
  act((): void => {
    root = create(
      createElement(
        StrictMode,
        null,
        createElement(ContainerComponent)
      )
    )
  })
  appendCleanupQueue(cleanupRef, root.unmount)

  // NOTE: Array of actions are batched in one `act()`
  const METHOD_actions = (...actionKeyStack: Array<A>): void => {
    act((): void => {
      for (const actionKey of actionKeyStack) {
        if (hasProperty(io.dispatchableActions, actionKey)) {
          io.dispatchableActions[actionKey]()
        } else {
          throw new ReferenceError(`Action '${actionKey}' does not exist`)
        }
      }
    })
  }

  const METHOD_actionsAsync = async (
    ...actionKeyStack: Array<A>
  ): Promise<void> => {
    await act(async (): Promise<void> => {
      for (const actionKey of actionKeyStack) {
        if (hasProperty(io.dispatchableActions, actionKey)) {
          await io.dispatchableActions[actionKey]()
        } else {
          throw new ReferenceError(`Action '${actionKey}' does not exist`)
        }
      }
    })
  }

  const METHOD_actionAsync = async (
    actionKey: A,
    ...otherActionKeys: Array<A>
  ): Promise<void> => {
    if (otherActionKeys.length !== 0) {
      // eslint-disable-next-line no-console
      console.warn(
        'Batch-executing actions does not work in `actionAsync` because ' +
        'components will re-render before the next asynchronous action(s) ' +
        'can run.\n' +
        `In: .actionAsync('${actionKey}', '${otherActionKeys.join('\', \'')}')`
      )
    }
    await act(async (): Promise<void> => {
      if (hasProperty(io.dispatchableActions, actionKey)) {
        await io.dispatchableActions[actionKey]()
      } else {
        throw new ReferenceError(`Async action '${actionKey}' does not exist`)
      }
    })
  }

  const METHOD_get = (valueKey: V): unknown | Promise<unknown> => {
    if (hasProperty(io.retrievableValues, valueKey)) {
      const retrievedValue = io.retrievableValues[valueKey]
      if (isThenable(retrievedValue)) {
        return new Promise((resolve) => {
          retrievedValue.then(resolve)
        })
      } else {
        return retrievedValue
      }
    } else {
      throw new ReferenceError(`Value '${valueKey}' does not exist`)
    }
  }

  return {
    root: { current: root },
    actions: METHOD_actions,
    actionAsync: METHOD_actionAsync,
    actionsAsync: METHOD_actionsAsync,
    get: METHOD_get,
    getRenderCount: () => renderCount
  }

}
