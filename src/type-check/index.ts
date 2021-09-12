/**
 * A quick and dirty way to check if an object is a promise. Eventually the
 * ideal method would be `isPromise()`, where not only the `.then` property is
 * checked. For example, may be we can check the constructor or the stringified
 * tag... but so far none of these worked well.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#thenable_objects
 */
export function isThenable(
  executedFn: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): executedFn is Promise<any> {
  // Check if is falsey value first, because checking for `undefined.then` will
  // throw error.
  if (!executedFn) { return false } // Early exit
  return typeof executedFn['then'] === 'function'
}
