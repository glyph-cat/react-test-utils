import { RenderResult, render } from '@testing-library/react'
import {
  ErrorInfo,
  Fragment,
  JSX,
  StrictMode,
  act,
  createElement,
  useEffect,
} from 'react'
import { ICapturedError } from '../../abstractions'
import { ActionNotExistError, ValueNotExistError } from '../../errors'
import { ErrorBoundary, hasProperty } from '../../internals'
import { CleanupManager } from '../cleanup-manager'

/**
 * @public
 */
export type HookFn<Params extends unknown[] = [], ReturnedType = void> = (...args: Params) => ReturnedType

/**
 * @public
 */
export type HookTesterActionDefinition<HookReturnedType> = (arg: HookReturnedType) => void | Promise<void>

/**
 * @public
 */
export type HookTesterValueMapper<HookReturnedType> = (arg: HookReturnedType) => unknown

/**
 * @public
 */
export interface HookTesterConfig<
  HookParams extends unknown[],
  HookReturnedType,
  Actions extends Record<string, HookTesterActionDefinition<HookReturnedType>>,
  Values extends Record<string, HookTesterValueMapper<HookReturnedType>>
> {
  useHook: HookFn<HookParams, HookReturnedType>,
  hookParameters?: HookParams,
  actions?: Actions,
  values?: Values,
  strictMode?: boolean
}

/**
 * @public
 */
export class HookTester<
  HookParams extends unknown[],
  HookReturnedType,
  Actions extends Record<string, HookTesterActionDefinition<HookReturnedType>>,
  Values extends Record<string, HookTesterValueMapper<HookReturnedType>>
> {

  /**
   * @internal
   */
  private readonly M$useHook: HookFn<HookParams, HookReturnedType>

  /**
   * @internal
   */
  private readonly M$hookParameters: HookParams

  /**
   * @internal
   */
  private readonly M$actions: Actions

  /**
   * @internal
   */
  private readonly M$values: Values

  /**
   * @internal
   */
  private M$renderResult!: RenderResult

  /**
   * @internal
   */
  private M$dispatchableActions: Partial<Record<keyof Actions, (() => void | Promise<void>)>> = {}

  /**
   * @internal
   */
  private M$retrievableValues: Partial<Record<keyof Values, ReturnType<Values[keyof Values]>>> = {}

  /**
   * @internal
   */
  private M$renderCount = 0
  get renderCount(): number { return this.M$renderCount }

  /**
   * @internal
   */
  readonly M$capturedErrors: Array<ICapturedError> = []
  get capturedErrors(): Readonly<Array<ICapturedError>> { return this.M$capturedErrors }

  constructor(
    config: HookTesterConfig<HookParams, HookReturnedType, Actions, Values>,
    cleanupManager?: CleanupManager
  ) {

    this.onError = this.onError.bind(this)
    this.action = this.action.bind(this)
    this.actionAsync = this.actionAsync.bind(this)
    this.get = this.get.bind(this)
    this.dispose = this.dispose.bind(this)

    const { useHook, hookParameters, actions, values, strictMode } = config
    this.M$useHook = useHook
    this.M$hookParameters = (hookParameters ? [...hookParameters] : []) as HookParams
    this.M$actions = { ...actions } as Actions
    this.M$values = { ...values } as Values

    if (cleanupManager) { cleanupManager.append(this.dispose) }

    act(() => {
      this.M$renderResult = render(
        createElement(
          strictMode ? StrictMode : Fragment,
          {},
          createElement(ErrorBoundary, {
            onError: this.onError,
          }, createElement(this.ContainerComponent))
        )
      )
    })

  }

  /**
   * @internal
   */
  private readonly ContainerComponent = (): JSX.Element => {

    const { M$useHook: useHook } = this
    const hookData = useHook(...this.M$hookParameters)
    useEffect(() => { this.M$renderCount += 1 })

    this.M$dispatchableActions = {}
    for (const actionKey in this.M$actions) {
      const actionCallback = this.M$actions[actionKey]
      this.M$dispatchableActions[actionKey] = () => {
        actionCallback(hookData)
      }
    }

    this.M$retrievableValues = {}
    for (const valueKey in this.M$values) {
      const valueMapper = this.M$values[valueKey]
      const mappedValue = valueMapper(hookData) as ReturnType<Values[keyof Values]>
      this.M$retrievableValues[valueKey] = mappedValue
    }

    return null!

  }

  action(...actionKeys: Array<keyof Actions>): number {
    const previousRenderCount = this.M$renderCount
    act((): void => {
      for (const actionKey of actionKeys) {
        if (hasProperty(this.M$dispatchableActions, actionKey)) {
          this.M$dispatchableActions[actionKey]()
        } else {
          throw new ActionNotExistError(actionKey)
        }
      }
    })
    return this.M$renderCount - previousRenderCount
  }

  async actionAsync(...actionKeys: Array<keyof Actions>): Promise<number> {
    const previousRenderCount = this.M$renderCount
    await act(async (): Promise<void> => {
      for (const actionKey of actionKeys) {
        if (hasProperty(this.M$dispatchableActions, actionKey)) {
          await this.M$dispatchableActions[actionKey]()
        } else {
          throw new ActionNotExistError(actionKey)
        }
      }
    })
    return this.M$renderCount - previousRenderCount
  }

  get(valueKey: keyof Values): ReturnType<Values[keyof Values]> {
    if (hasProperty(this.M$retrievableValues, valueKey)) {
      return this.M$retrievableValues[valueKey]!
    } else {
      throw new ValueNotExistError(valueKey)
    }
  }

  dispose(): void {
    this.M$renderResult?.unmount()
  }

  /**
   * @internal
   */
  private onError(error: Error, errorInfo: ErrorInfo): void {
    this.M$capturedErrors.push({ error, errorInfo })
  }

}
