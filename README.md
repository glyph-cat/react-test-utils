Helper functions for writing tests for [React](https://reactjs.org) with [Jest](https://reactjs.org) and [react-test-renderer](https://www.npmjs.com/package/react-test-renderer).

<br/>

<div align="center">

![Designed for React](https://img.shields.io/static/v1?label&logo=react&logoColor=61DBFB&message=Designed%20for%20React&color=4a4a4a)
[![Become a Patron](https://img.shields.io/static/v1?label&logo=patreon&logoColor=ffffff&message=Become%20a%20Patron&color=ff424d)](https://www.patreon.com/bePatron?u=27931751)

</div>

<br/>

# Table of Contents
- [Table of Contents](#table-of-contents)
- [`createHookInterface`](#createhookinterface)
- [`createCompoundHookInterface`](#createcompoundhookinterface)
- [`UNSTABLE_createHocInterface`](#unstable_createhocinterface)

<br/>

# `createHookInterface`

```js
import { 
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

test('createHookInterface', () => {
  
  function useMyState() {
    return useState(0)
  }

  const hookInterface = createHookInterface({
    hook: () => useMyState(0)
    actions: {
      increaseCounter: ({ hookValue }) => {
        const [, setCounter] = hookValue
        setCounter((c: number) => c + 1)
      },
      doSomethingElse: ({ hookValue }) => {
        // ...
      }
    },
    values: {
      value: ({ hookValue }) => {
        const [counter] = hookValue
        return `${counter}`
      },
      customVariable: ({ hookValue }) => {
        return '...'
      },
    },
  }, cleanupRef)

  // Get render count
  expect(hookInterface.getRenderCount()).toBe(1)

  // Trigger an action
  // NOTE: When actions are called separately like this, they will be executed
  // in separate render cycles.
  hookInterface.actions(['increaseCounter'])
  hookInterface.actions(['increaseCounter'])

  // Trigger multiple actions
  // NOTE: When actions are called in an array, they will be executed in the
  // same render cycle.
  hookInterface.actions(['increaseCounter', 'doSomethingElse'])

  // Get value
  expect(hookInterface.get('value')).toBe(someValue)
  expect(hookInterface.get('customVariable')).toBe('...')

})

```

<br/>

# `createCompoundHookInterface`

```js
import { 
  createCleanupRef,
  createCompoundHookInterface,
} from '@chin98edwin/react-test-utils'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

test('createCompoundHookInterface', () => {
  
  function useMyState() {
    return useState(0)
  }

  const hookInterface = createCompoundHookInterface({
    pathA: {
      hook: useMyState,
      actions: {
        increaseCounter: ({ hookValue }) => {
          const [, setCounter] = hookValue
          setCounter((c: number) => c + 1)
        },
        doSomethingElse: ({ hookValue }) => {
          // ...
        }
      },
      values: {
        value: ({ hookValue }) => {
          const [counter] = hookValue
          return `${counter}`
        },
      },
    },
    pathB: {
      // You can specify the setup for another hook here
      // LIMITATION: Hooks on different paths cannot interact with each other.
      // To communicate between different hooks, you will have to create a
      // custom hook that combines them then pass that single hook into the
      // `hook` property.
    },
  }, cleanupRef)

  // Get render count
  expect(hookInterface.at('pathA').getRenderCount()).toBe(1)

  // Trigger an action
  hookInterface.at('pathA').actions(['increaseCounter'])

  // Trigger multiple actions
  hookInterface.at('pathA').actions(['increaseCounter', 'doSomethingElse'])
  hookInterface.at('pathB').actions(['unicornFunction'])
  hookInterface.at('pathB').actions(['unicornFunction', 'unicornFunction'])
  hookInterface.at('pathA').actions(['doSomethingElse'])

  // Get value
  expect(hookInterface.at('pathA').get('value')).toBe(someValue)
  expect(hookInterface.at('pathB').get('value')).toBe(someOtherValue)

})

```

<br/>

# `UNSTABLE_createHocInterface`

```js
import { 
  createCleanupRef,
  UNSTABLE_createHocInterface,
} from '@chin98edwin/react-test-utils'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

test('UNSTABLE_createHocInterface', () => {
  
  const hocInterface = UNSTABLE_createHocInterface({
    entry: ({ Component }) => withYourHoc(Component),
  })

})

```

<br/>
