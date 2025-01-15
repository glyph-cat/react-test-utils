import { CleanupManager } from '@glyph-cat/cleanup-manager'
import { act, JSX } from 'react'
import { SuspenseTester } from '.'
import { MockStateManager } from '../../test-utils/mock-state-manager'
import { useSuspenseWaiter } from '../../test-utils/suspense-waiter'

const cleanupManager = new CleanupManager()
afterEach(() => { cleanupManager.run() })

test('Happy Path', async () => {

  const InitState = new MockStateManager(false, cleanupManager)

  const suspenseTester = new SuspenseTester((): JSX.Element => {
    useSuspenseWaiter(InitState)
    return null!
  }, cleanupManager)

  expect(suspenseTester.componentIsUnderSuspense).toBe(false)

  // NOTE: under the hood, `act` always runs asynchronously.
  // Since we are waiting for a suspension (a.k.a. thrown promise) to resolve,
  // we should use await.

  await act(async () => { InitState.set(true) })
  expect(suspenseTester.componentIsUnderSuspense).toBe(true)

  await act(async () => { InitState.set(false) })
  expect(suspenseTester.componentIsUnderSuspense).toBe(false)

})
