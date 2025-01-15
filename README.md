Helper functions for writing tests for [React](https://reactjs.org) with [Jest](https://reactjs.org) and [react-test-renderer](https://www.npmjs.com/package/react-test-renderer).

<br/>

<div align="center">

[![Version](https://img.shields.io/npm/v/@glyph-cat/react-test-utils)](https://github.com/glyph-cat/react-test-utils/releases)
[![License](https://img.shields.io/github/license/glyph-cat/react-test-utils)](https://github.com/glyph-cat/react-test-utils/blob/main/LICENSE)
[![Support me on Ko-fi](https://img.shields.io/static/v1?label&logo=kofi&logoColor=ffffff&message=Support%20me%20on%20Ko-fi&color=FF5E5B)](https://ko-fi.com/glyphcat)

</div>

<br/>

# Simple Example

```js
import { CleanupManager } from '@glyph-cat/cleanup-manager'
import { HookTester } from '@glyph-cat/react-test-utils'
import { useState } from 'react'

const cleanupManager = new CleanupManager()
afterEach(() => { cleanupManager.run() })

test('Example', async () => {
  
  const tester = new HookTester({
    useHook: () => useState(0),
    actions: {
      increaseCounter(hookData) {
        const [, setCounter] = hookData
        setCounter((c: number) => c + 1)
      },
    },
    values: {
      value(hookData) {
        const [counter] = hookData
        return counter
      },
    },
  }, cleanupManager)

  // Trigger one action
  tester.action('increaseCounter')

  // Trigger multiple actions in the same render
  tester.action('increaseCounter', 'increaseCounter')

  // Trigger multiple async actions in the same render
  await tester.actionAsync('increaseCounter', 'increaseCounter')

  // Get render count
  expect(tester.renderCount).toBe(2)

  // Get value
  expect(tester.get('value')).toBe(3)

})
```

# Full Examples
* [`HookTester`](https://github.com/glyph-cat/react-test-utils/blob/main/src/api/hook-tester/index.test.ts)
* [`HOCTester`](https://github.com/glyph-cat/react-test-utils/blob/main/src/api/hoc-tester/index.test.tsx)

<br/>

# Support This Project

* Ko-fi: [`ko-fi.com/glyphcat`](https://ko-fi.com/glyphcat)
* BTC: [`bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we`](bitcoin:bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we)

<br/>
