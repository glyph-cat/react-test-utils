import { hasProperty, isThenable } from '.'

describe(hasProperty.name, (): void => {

  const $internals = Symbol()
  const GET_SAMPLE_OBJECT = () => ({
    foo: 1,
    bar: undefined,
    7: 'seven',
    [$internals]: {},
  })

  test('Does exist', (): void => {
    expect(hasProperty(GET_SAMPLE_OBJECT(), 'foo')).toBe(true)
    expect(hasProperty(GET_SAMPLE_OBJECT(), 7)).toBe(true)
    expect(hasProperty(GET_SAMPLE_OBJECT(), $internals)).toBe(true)
  })

  test('Does exist, but undefined', (): void => {
    expect(hasProperty(GET_SAMPLE_OBJECT(), 'bar')).toBe(true)
  })

  test('Does not exist', (): void => {
    expect(hasProperty(GET_SAMPLE_OBJECT(), 'baz')).toBe(false)
  })

  test('Non-object types', (): void => {
    expect(hasProperty(null, 'foo')).toBe(false)
    expect(hasProperty(undefined, 'foo')).toBe(false)
    expect(hasProperty(42, 'foo')).toBe(false)
    // okay... weird:
    expect(hasProperty(42, 'toString')).toBe(false)
    expect(hasProperty(false, 'valueOf')).toBe(false)
  })

})

describe(isThenable.name, () => {

  test('should be true - async function', () => {
    async function fn() { return 42 }
    const output = isThenable(fn())
    expect(output).toBe(true)
  })

  test('should be true - function that returns a Promise', () => {
    function fn() { return new Promise((resolve) => { resolve(42) }) }
    const output = isThenable(fn())
    expect(output).toBe(true)
  })

  test('should be false - normal function', () => {
    function fn() { return 42 }
    const output = isThenable(fn())
    expect(output).toBe(false)
  })

  test('should be false - falsey value', () => {
    const output = isThenable(null)
    expect(output).toBe(false)
  })

})
