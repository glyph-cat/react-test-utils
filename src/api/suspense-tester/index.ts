import { CleanupManager } from '@glyph-cat/cleanup-manager'
import { RenderResult, render } from '@testing-library/react'
import { ComponentType, JSX, Suspense, act, createElement, useEffect } from 'react'

/**
 * @public
 */
export class SuspenseTester {

  /**
   * @internal
   */
  private M$renderResult: RenderResult = null

  /**
   * @internal
   */
  private M$componentIsUnderSuspense = false

  get componentIsUnderSuspense(): boolean {
    return this.M$componentIsUnderSuspense
  }

  constructor(TestComponent: ComponentType, cleanupManager: CleanupManager) {

    this.dispose = this.dispose.bind(this)
    if (cleanupManager) { cleanupManager.append(this.dispose) }

    const FallbackComponent = (): JSX.Element => {
      useEffect(() => {
        this.M$componentIsUnderSuspense = true
        return () => { this.M$componentIsUnderSuspense = false }
      }, [])
      return null!
    }

    this.dispose = this.dispose.bind(this)

    act(() => {
      this.M$renderResult = render(
        createElement(Suspense, {
          fallback: createElement(FallbackComponent),
        }, createElement(TestComponent))
      )
    })

  }

  dispose(): void {
    this.M$renderResult?.unmount()
  }

}
