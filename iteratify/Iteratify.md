# Iteratify

## Premise

Among the new features brought by the ES6, we find the addition of the primitive type Symbol and the definition of the iterator.
In this post, we use both to make an **object iterable**. While the usefulness of this functionality is questionable (easily replaceable by the use of `Object.entries` or similar) it will allow us to **focus attention** on the subject.

## Impl

### What

The `iteratify` function takes an object as a parameter and returns an iterable copy of it.

```js
const object = {
  foo: true,
  bar: 'hello',
  baz: 42,
}

const itObject = iteratify(object)

for (let(key, val) of itObject) {
  console.log(key, val)
}
```

### Where

When trying to apply a for loop or spread operator on a type in _JavaScript_, what happens under the hood is the execution of the method under the `Symbol.iterator` label. The current state:

```js
typeof object[Symbol.iterator] === 'function' // returns false
```

It is absolutely valid to add the method directly in the object literal:

```js
const object = {
    ...,
    [Symbol.iterator]() {
        ...
    }
}
```

However, this means that the `[Symbol.iterator]` method would be _enumerable_. It's not the case. It is easily solved:

```js
function iteratify(obj) {
  // create a copy of object (supposing it is flat for simplicity)
  const copy = Object.assign({}, obj)

  Object.defineProperty(copy, Symbol.iterator, {
      enumerable: false,
      writable: true,
      configurable: true,
      value: // next step
  })

  return copy
}
```

### How

ES6 has standardized the interface for the Iterator. It is a method that when executed returns an object. This must necessarily contain a `next` method. At each execution of the latter, an _IteratorResult_ is obtained, that is an object that necessarily contains two specific properties:

- value - the value generated for the current iteration. Can be any type.
- done - a boolean representing the state of the iterator.

```js
function iteratify(obj) {
  const copy = Object.assign({}, obj)

  Object.defineProperty(copy, Symbol.iterator, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: iterator,
  })

  return copy

  function iterator() {
    const entries = Object.entries(copy)
    let i = 0

    return {
      next() {
        if (i < entries.length) {
          return { value: entries[i++], done: false }
        }

        return { done: true } // implicit: value: undefined
      },
    }
  }
}
```

In this case calling `next` gets an _IteratorResult_ whose value is the entry to the index `i` - also `i++` happens, so the next time `next` is called it will return the next entry.

> `function iterator()` viene dopo il `return`. Non è mica _dead code_?
> No. [function hoisting](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch5.md#hoisting-declaration-vs-expression)

---

## Usage

Invocation of `next`? And when in the world?
In case you delegate the iteration to the `for ... of` loop, the _JavaScript_ internal calls next repeatedly until an _IteratorResult_ is returned whose `done` is `true`. However, you can "manually" call `next` as follows:

```js
const itObject = iteratify({
  foo: true,
  bar: 'hello',
  baz: 42,
})

const it = itObject[Symbol.iterator]()

it.next() // { value: [ 'foo', true ], done: false }
it.next() // { value: [ 'bar', 'hello' ], done: false }
it.next() // { value: [ 'baz', 42 ], done: false }
it.next() // { value: undefined, done: true }
```

Definitely useful for more complex, fine applications. But without digressing, let's stick to the `for...of`:

```js
const itObject = iteratify({
  foo: true,
  bar: 'hello',
  baz: 42,
})

typeof itObject[Symbol.iterator] === 'function' // returns true, thus is iterable

for (let entry of itObject) {
  console.log(entry) // each returns relative entry
  // [ 'foo', true ]
  // [ 'bar', 'string' ]
  // [ 'baz', 42 ]
}
```

---

## Conclusion

I hope the simplicity of the example served more as a gentle introduction to the subject rather than a source of yawning.

Here is the recap of some considerations.

1. _JavaScript_ built-in features like `for...of` call the method under the `Symbol.iterator` label
2. Make the method it is to enumerate... unenumerable
3. The `next` method can access and interact with the variables declared in the `iterator` ([Closure](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md)) - you can do very cool things, not just keep track of an `i` counter ;)

---

## Docs and Correlated

Iterators in detail (MUST READ, TRUST ME): [You Don't Know JS: ES6 & Beyond](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/es6%20%26%20beyond/ch3.md)

This post is related to [Expanding iteratify with Functional Programming](#) - SOON
