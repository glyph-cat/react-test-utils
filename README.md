Helper functions for writing tests for [React](https://reactjs.org) with [Jest](https://reactjs.org) and [react-test-renderer](https://www.npmjs.com/package/react-test-renderer).

<br/>

<div align="center">

[![Version](https://img.shields.io/npm/v/@chin98edwin/react-test-utils)](https://github.com/chin98edwin/react-test-utils/releases)
[![License](https://img.shields.io/github/license/chin98edwin/react-test-utils)](https://github.com/chin98edwin/react-test-utils/blob/main/LICENSE)

![Designed for React](https://img.shields.io/static/v1?label&logo=react&logoColor=61DBFB&message=Designed%20for%20React&color=4a4a4a)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/chin98edwin/react-test-utils)
[![Support me on Ko-fi](https://img.shields.io/static/v1?label&logo=kofi&logoColor=ffffff&message=Support%20me%20on%20Ko-fi&color=FF5E5B)](https://ko-fi.com/dev_chin98edwin)

</div>

<br/>

# Simple Example

```js
import { useState } from 'react'
import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

test('createHookInterface', () => {
  const hookInterface = createHookInterface({
    useHook: () => useState(0),
    actions: {
      increaseCounter({ hookData }) {
        const [, setCounter] = hookData
        setCounter((c: number) => c + 1)
      },
    },
    values: {
      value({ hookData }) {
        const [counter] = hookData
        return counter
      },
    },
  }, cleanupRef)

  // Trigger one action
  hookInterface.actions('increaseCounter')

  // Trigger multiple actions in the same render
  hookInterface.actions('increaseCounter', 'increaseCounter')

  // Trigger multiple asynchronous actions
  // No longer guaranteed that all actions will run in the same render cycle
  hookInterface.actionsAsync('increaseCounter', 'increaseCounter')

  // Get render count
  expect(hookInterface.getRenderCount()).toBe(2)

  // Get value
  expect(hookInterface.get('value')).toBe(3)

})
```

# Full Examples
* [`createHookInterface`](https://github.com/chin98edwin/react-test-utils/blob/main/src/hook-interface/index.test.ts)
* [`UNSTABLE_createHocInterface`](https://github.com/chin98edwin/react-test-utils/blob/main/src/hoc-interface/index.test.tsx)

<br/>

# Support Me

* Ko-fi: [`ko-fi.com/dev_chin98edwin`](https://ko-fi.com/dev_chin98edwin)
* PayPal: [`paypal.me/chin98edwin`](http://paypal.me/chin98edwin)
* BTC: [`bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we`](bitcoin:bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we)

<br/>
