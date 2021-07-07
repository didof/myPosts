# Iteratify

## Making it Iterable

Tra le nuove features apportare dal ES6, troviamo l'aggiunta del tipo primitivo Symbol e la definizione del generator.
In questo post ci avvaliamo dell'utilizzo di entrambi per rendere iterabile un oggetto. Seppure l'utilità di questa funzionalità sia discutibile (facilmente sostituibile mediante l'uso di `Object.entries` o simili) ci consentirà di focalizzare l'attenzione sull'argomento.

## Obiettivo

La funzione `iteratify` riceve un oggetto come parametro e ne restituisce una copia iterabile.

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

Quando si prova ad applicare un ciclo for o lo spread operator su di un tipo in JavaScript, quello che accade under the hood è l'esecuzione del metodo sotto l'etichetta `Symbol.iterator`. Allo stato attuale:

```js
typeof object[Symbol.iterator] === 'function' // false
```

E' assolutamente valido aggiungere il metodo direttamente nell'object literal:

```js
const object = {
    ...,
    [Symbol.iterator]() {
        ...
    }
}
```

Tuttavia questo comporta che il metodo `[Symbol.iterator]` sarebbe enumerabile. Non è il caso. Si risolve facilmente:

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

ES6 ha standardizzato l'interfaccia per l'Iterator. Si tratta di un metodo che una volta eseguito restituisce un oggetto. Questo deve contenere necessariamente un metodo `next`. Ad ogni esecuzione di quest'ultimo si ottiene un _IteratorResult_, ovvero un oggetto che necessariamente contiene due proprietà specifiche:

- value - il valore generato per la corrente iterazione
- done - un booleano rappresentate lo stato dell'iteratore

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
      [Symbol.iterator]() {
        return this
      },

      next() {
        if (i < entries.length) {
          return { value: entries[i++], done: false }
        }

        return { done: true }
      },
    }
  }
}
```

- `function iterator()` viene dopo il `return`. Non è mica **dead code**?
  > No. [function declaration hoisting](link)

```js
const itObject = iteratify(object)

typeof itObject[Symbol.iterator] === 'function' // returns true

for (let entry of itObject) {
  console.log(entry) // each returns relative entry
}
```
