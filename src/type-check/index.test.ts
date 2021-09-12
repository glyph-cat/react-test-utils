import { isThenable } from '.'

describe('isThenable', () => {

  it('should be true - async function', () => {
    async function fn() { return 42 }
    const output = isThenable(fn())
    expect(output).toBe(true)
  })

  it('should be true - function that returns a Promise', () => {
    function fn() { return new Promise((resolve) => { resolve(42) }) }
    const output = isThenable(fn())
    expect(output).toBe(true)
  })

  it('should be false - normal function', () => {
    function fn() { return 42 }
    const output = isThenable(fn())
    expect(output).toBe(false)
  })

  it('should be false - falsey value', () => {
    const output = isThenable(null)
    expect(output).toBe(false)
  })

})
