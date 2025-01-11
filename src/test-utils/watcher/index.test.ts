import { Watcher } from '.'

describe(Watcher.name, () => {

  let watcher: Watcher<[number]>

  afterEach(() => { watcher.dispose() })

  test('Main', () => {

    watcher = new Watcher<[number]>()

    let counter = 0
    const stopWatching = watcher.watch((num: number) => { counter += num })

    // Refresh and expect value to be updated
    watcher.refresh(1)
    expect(counter).toBe(1)

    // Refresh again and expect value to also be updated
    watcher.refresh(2)
    expect(counter).toBe(3)

    // Stop watching and expect value to stay the same as previous checkpoint
    stopWatching()
    // Make sure there are no issues when calling `unwatch` multiple times.
    stopWatching()
    watcher.refresh(3)
    expect(counter).toBe(3)

  })

  test('Unwatch All & Dispose', () => {

    watcher = new Watcher<[number]>()

    let counter1 = 0, counter2 = 0, counter3 = 0, counter4 = 0
    const stopWatching1 = watcher.watch((num: number) => { counter1 += num })
    const stopWatching2 = watcher.watch((num: number) => { counter2 += num })

    // Make sure there are no issues when calling `unwatch` multiple times.
    stopWatching1()
    stopWatching2()
    watcher.unwatchAll()
    stopWatching1()
    stopWatching2()
    watcher.unwatchAll()

    // Should return (empty) function even after unwatch all
    const unwatch3 = watcher.watch((num: number) => { counter3 += num })
    expect(typeof unwatch3).toBe('function')

    // Make sure there are no issues when calling `dispose` multiple times.
    watcher.dispose()
    watcher.dispose()

    // Should return (empty) function even after dispose
    const unwatch4 = watcher.watch((num: number) => { counter4 += num })
    expect(typeof unwatch4).toBe('function')

    watcher.refresh(1)
    watcher.refresh(2)
    watcher.refresh(3)
    expect(counter1).toBe(0)
    expect(counter2).toBe(0)
    expect(counter3).toBe(0)
    expect(counter4).toBe(0)

  })

})
