# `createHookInterface`

```js
import { 
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

test('createHookInterface', () => {
  
  const hookInterface = createHookInterface({
    hook: {
      method: useState,
      parameters: [0],
      // Hook will be invoked as `method(...parameters)`,
      // resulting in `useState(0)`
    },
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
  
  const hookInterface = createCompoundHookInterface({
    pathA: {
      hook: {
        method: useState,
        parameters: [0],
      },
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
      // `hook.method` property.
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
