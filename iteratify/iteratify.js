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
  const copy = Object.assign({}, obj)

  Object.defineProperty(copy, Symbol.iterator, {
    value: iterator,
    enumerable: false,
    writable: true,
    configurable: true,
  })

  return copy

  function iterator() {
    let i = 0
    const entries = Object.entries(copy)

    return {
      [Symbol.iterator]() {
        return this // è corretto?
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

const itObject = iteratify(object)

let it = itObject[Symbol.iterator]()

console.log(it.next())
console.log(it.next())
console.log(it.next())
console.log(it.next())
console.log(it.next())
itObject.test = true
it = itObject[Symbol.iterator]()
console.log(it.next())
console.log(it.next())
console.log(it.next())
console.log(it.next())
console.log(it.next())

// Consideration
/**
 *
 * If I add a prop during the next() calls it is not gonna be iterated over until a brand new iterator is spawned.
 * Solution (maybe): proxy
 */
