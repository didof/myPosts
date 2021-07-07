/**
 * https://stackoverflow.com/questions/36871299/how-to-extend-function-with-es6-classes
 */

function tap(arg) {
  return function curried(fn) {
    return typeof fn === 'function' ? fn(arg) : arg
  }
}

function partial(fn, larg) {
  return function restArgs(...args) {
    return fn(larg, ...args)
  }
}

function partialRight(fn, ...rargs) {
  return function restArgs(...largs) {
    return fn(...largs, ...rargs)
  }
}

function iteratify(obj, nextFn) {
  function iterator() {
    let i = 0
    const entries = Object.entries(obj)

    return {
      [Symbol.iterator]() {
        return this
      },

      next() {
        if (i < entries.length) {
          const k = tap(entries[i++])
          return { value: k(nextFn), done: false }
        } else {
          return { done: true }
        }
      },
    }
  }

  Object.defineProperty(obj, Symbol.iterator, {
    value: iterator,
    enumerable: false,
    writable: true,
    configurable: true,
  })

  return obj
}

const object = {
  foo: true,
  bar: 'string',
  baz: 42,
}

function extractAtIndex(index) {
  return function fromArray(arr) {
    return arr[index]
  }
}

const extractAt0 = extractAtIndex(0)
const extractAt1 = extractAtIndex(1)

const iteratifyKeys = partialRight(iteratify, extractAt0)
const iteratifyValues = partialRight(iteratify, extractAt1)

const itObjectValues = iteratifyValues(object)
for (let val of itObjectValues) {
  console.log(val)
}

const itObjectKeys = iteratifyKeys(object)
for (let key of itObjectKeys) {
  console.log(key)
}

const itObjectDefault = iteratify(object)
for (let entries of itObjectDefault) {
  console.log(entries)
}
