// NOTE: Adapted from 'cotton-box'.

export function hasProperty(
  object: unknown,
  propertyName: PropertyKey
): boolean {
  if (!object) { return false } // Early exit
  return Object.prototype.hasOwnProperty.call(object, propertyName)
}

export function isThenable(executedFn: unknown): executedFn is Promise<any> {
  return typeof executedFn?.['then'] === 'function'
}
