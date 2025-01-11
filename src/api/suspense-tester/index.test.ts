import { act, JSX } from 'react'
import { SuspenseTester } from '.'
import { MockStateManager } from '../../test-utils/mock-state-manager'
import { useSuspenseWaiter } from '../../test-utils/suspense-waiter'
import { CleanupManager } from '../cleanup-manager'

const cleanupManager = new CleanupManager()
afterEach(() => { cleanupManager.run() })

test('Happy Path', async () => {

  const InitState = new MockStateManager(false, cleanupManager)

  const suspenseTester = new SuspenseTester((): JSX.Element => {
    useSuspenseWaiter(InitState)
    return null!
  }, cleanupManager)

  expect(suspenseTester.componentIsUnderSuspense).toBe(false)

  act(() => { InitState.set(true) })
  expect(suspenseTester.componentIsUnderSuspense).toBe(true)

  act(() => { InitState.set(false) })
  expect(suspenseTester.componentIsUnderSuspense).toBe(false)

})
