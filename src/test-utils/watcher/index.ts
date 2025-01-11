// NOTE: Adapted from 'cotton-box'.

export class Watcher<Args extends any[]> {

  private _isDisposed = false
  private _watcherCollection: Record<number, CallableFunction> = {}
  private _incrementalWatchId = 0

  constructor() {
    this.watch = this.watch.bind(this)
    this.refresh = this.refresh.bind(this)
    this.unwatchAll = this.unwatchAll.bind(this)
    this.dispose = this.dispose.bind(this)
  }

  watch(callback: ((...args: Args) => void)): (() => void) {
    const newId = ++this._incrementalWatchId
    this._watcherCollection[newId] = callback
    return () => { delete this._watcherCollection[newId] }
  }

  refresh(...args: Args): void {
    if (this._isDisposed) { return } // Early exit
    const callbackStack = Object.values(this._watcherCollection)
    for (let i = 0; i < callbackStack.length; i++) {
      callbackStack[i](...args)
    }
  }

  unwatchAll(): void {
    this._watcherCollection = {}
  }

  dispose(): void {
    this._isDisposed = true
    this.unwatchAll()
  }

}
