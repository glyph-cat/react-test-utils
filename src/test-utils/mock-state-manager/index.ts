import { CleanupManager } from '@glyph-cat/cleanup-manager'
import { Watcher } from '../watcher'

// NOTE: Adapted from 'cotton-box'.

export class MockStateManager<State> {

  protected readonly _watcher = new Watcher<[State]>()
  protected _internalState: State

  constructor(defaultState: State, cleanupManager: CleanupManager) {
    this.get = this.get.bind(this)
    this.set = this.set.bind(this)
    this.watch = this.watch.bind(this)
    this.unwatchAll = this.unwatchAll.bind(this)
    this.wait = this.wait.bind(this)
    this.dispose = this.dispose.bind(this)
    this._internalState = defaultState
    cleanupManager.append(this.dispose)
  }

  get(): State {
    return this._internalState
  }

  set(newState: State): void {
    this._internalState = newState
    this._watcher.refresh(this._internalState)
  }

  watch(callback: (state: State) => void): () => void {
    return this._watcher.watch(callback)
  }

  unwatchAll(): void {
    this._watcher.unwatchAll()
  }

  wait(expectedValue: State): Promise<State> {
    const fulfillsCondition = ($state: State) => Object.is(expectedValue, $state)
    if (fulfillsCondition(this._internalState)) {
      return Promise.resolve(this._internalState)
    } else {
      return new Promise((resolve) => {
        const unwatch = this._watcher.watch((state) => {
          if (fulfillsCondition(state)) {
            unwatch()
            resolve(state)
          }
        })
      })
    }
  }

  dispose(): void {
    this._watcher.dispose()
  }

}
