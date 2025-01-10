import { RenderResult, render } from '@testing-library/react'
import {
  ErrorInfo,
  Fragment,
  JSX,
  Component as ReactComponent,
  ReactNode,
  StrictMode,
  act,
  createElement,
  useEffect,
} from 'react'
import { CleanupManager } from '../cleanup-manager'
import { hasProperty } from '../object-utils'

/**
 * @public
 */
export type HookFn<Params extends unknown[] = [], RType = void> = (...args: Params) => RType

/**
 * @public
 */
export type HookInterfaceActionDefinition<HookRType> = (arg: HookRType) => void | Promise<void>

/**
 * @public
 */
export type HookInterfaceValueMapper<HookRType> = (arg: HookRType) => unknown

/**
 * @public
 */
export interface HookTesterConfig<
  HookParams extends unknown[],
  HookRType,
  Actions extends Record<string, HookInterfaceActionDefinition<HookRType>>,
  Values extends Record<string, HookInterfaceValueMapper<HookRType>>
> {
  useHook: HookFn<HookParams, HookRType>,
  hookParameters?: HookParams,
  actions?: Actions,
  values?: Values,
  strictMode?: boolean
}

export interface ICapturedError {
  error: Error
  errorInfo: ErrorInfo
}

/**
 * @public
 */
export class HookTester<
  HookParams extends unknown[],
  HookRType,
  Actions extends Record<string, HookInterfaceActionDefinition<HookRType>>,
  Values extends Record<string, HookInterfaceValueMapper<HookRType>>
> {

  /**
   * @internal
   */
  private readonly useHook: HookFn<HookParams, HookRType>

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
    config: HookTesterConfig<HookParams, HookRType, Actions, Values>,
    cleanupManager?: CleanupManager
  ) {

    this.onError = this.onError.bind(this)
    this.actionSync = this.actionSync.bind(this)
    this.action = this.action.bind(this)
    this.get = this.get.bind(this)
    this.dispose = this.dispose.bind(this)
    this.useHook = config.useHook
    this.M$hookParameters = (config.hookParameters ? [...config.hookParameters] : []) as HookParams
    this.M$actions = { ...config.actions } as Actions
    this.M$values = { ...config.values } as Values

    if (cleanupManager) { cleanupManager.append(this.dispose) }

    this.onError = this.onError.bind(this)
    this.actionSync = this.actionSync.bind(this)
    this.action = this.action.bind(this)
    this.get = this.get.bind(this)
    this.dispose = this.dispose.bind(this)

    act(() => {
      this.M$renderResult = render(
        createElement(
          config.strictMode ? StrictMode : Fragment,
          {},
          createElement(ErrorBoundary, {
            onError: this.onError,
          }, createElement(this.ContainerComponent))
        )
      )
    })

  }

  private ContainerComponent = (): JSX.Element => {

    const { useHook } = this
    const hookData = useHook(...this.M$hookParameters)
    useEffect(() => { this.M$renderCount += 1 })

    this.M$dispatchableActions = {}
    for (const actionKey in this.M$actions) {
      const actionCallback = this.M$actions[actionKey]
      this.M$dispatchableActions[actionKey] = () => {
        return actionCallback(hookData)
      }
    }

    this.M$retrievableValues = {}
    for (const valueKey in this.M$values) {
      const valueMapper = this.M$values[valueKey]
      const mappedValue = valueMapper(hookData) as ReturnType<Values[keyof Values]>
      this.M$retrievableValues[valueKey] = mappedValue
    }

    return createElement(Fragment)

  }

  private onError(error: Error, errorInfo: ErrorInfo): void {
    this.M$capturedErrors.push({ error, errorInfo })
  }

  actionSync(...actionKeys: Array<keyof Actions>): number {
    const previousRenderCount = this.M$renderCount
    act((): void => {
      for (const actionKey of actionKeys) {
        if (hasProperty(this.M$dispatchableActions, actionKey)) {
          this.M$dispatchableActions[actionKey]()
        } else {
          throw new ReferenceError(`Action '${actionKey as string}' does not exist`)
        }
      }
    })
    return this.M$renderCount - previousRenderCount
  }

  async action(...actionKeys: Array<keyof Actions>): Promise<number> {
    const previousRenderCount = this.M$renderCount
    await act(async (): Promise<void> => {
      for (const actionKey of actionKeys) {
        if (hasProperty(this.M$dispatchableActions, actionKey)) {
          await this.M$dispatchableActions[actionKey]()
        } else {
          throw new ReferenceError(`Action '${actionKey as string}' does not exist`)
        }
      }
    })
    return this.M$renderCount - previousRenderCount
  }

  get(valueKey: keyof Values): ReturnType<Values[keyof Values]> {
    if (hasProperty(this.M$retrievableValues, valueKey)) {
      return this.M$retrievableValues[valueKey]
    } else {
      throw new ReferenceError(`Value '${valueKey as string}' does not exist`)
    }
  }

  dispose(): void {
    this.M$renderResult?.unmount()
  }

}

interface ErrorBoundaryProps {
  children?: ReactNode
  onError(error: Error, errorInfo: ErrorInfo): void
}

interface ErrorBoundaryState {
  error: boolean
}

class ErrorBoundary extends ReactComponent<ErrorBoundaryProps, ErrorBoundaryState> {

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { error: true }
  }

  state: Readonly<ErrorBoundaryState> = { error: false }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render(): ReactNode {
    return this.state.error ? null : this.props.children
  }

}
