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

## Getting funky with FP

Ora, this is cool and stuff, I guess. Ma senza la possibilità di fare tuning cosa viene restituito dal next, è piuttosto limitato. Pertanto rendiamo la funzione `iteratify` in grado di ricevere un secondo argomento, `nextFn`. Ad ogni ciclo, questa processa l'entry (`entries[i++]`) e il valore è il `value` restituito dall'iteratore.

```js
function iteratify(obj, nextFn) {
  ...

  return obj;

  function iterator() {
    let i = 0;
    const entries = Object.entries(obj);

    return {
      [Symbol.iterator]() {
        return this;
      },

      next() {
        if (i < entries.length) {
          return { value: nextFn(entries[i++]), done: false }; // tweaked this line
        }

        return { done: true };
      },
    };
  }
}
```

Piuttosto che sparaci dentro funzioni anonime, creiamo delle paralnti utility in stile funzionale.

```js
function extractAtIndex(index) {
  return function fromArray(arr) {
    return arr[index]
  }
}

const extractAt0 = extractAtIndex(0)
const extractAt1 = extractAtIndex(1)
```

A questo punto sarebbe sufficiente fare:

```js
const itObject = iteratify(object, extractAt1)

for (let el of itObject) {
  console.log(el)
}
```

Tuttavia allo stato attuale ci siamo autocostretti a passare sempre una funzione. Se volessimo ottenere le entries dall'iteratore dovremmo fare qualcosa del tipo:

```js
const itObject = iteratify(object, entry => entry)
```

Orribile.

La soluzione sarebbe avere una funzione in grado di ricordare un valore, _eventualmente_ processarlo tramite una funzione fornitagli, e restituirlo intaccato o meno. Esiste, e si chiama _Kestrel_ oppure _tap_.

```js
function tap(arg) {
  return function curried(fn) {
    return typeof fn === 'function' ? fn(arg) : arg
  }
}
```

```js
function iteratify(obj, nextFn) {
  ...

  return obj;

  function iterator() {
    let i = 0;
    const entries = Object.entries(obj);

    return {
      [Symbol.iterator]() {
        return this;
      },

      next() {
        if (i < entries.length) {
            const k = tap(entries[i++]);                // tweaked here

            return { value: k(nextFn), done: false };
        }

        return { done: true };
      },
    };
  }
}
```

In questo modo siamo liberi di passare o meno la `nextFn`.

```js
const itObject = iteratify(object)
for (let el of itObject) {
  console.log(el) // each returns an entry
}

const itObjectValues = iteratify(object, extractAt1)
for (let value of itObjectValues) {
  console.log(value) // each return a value
}
```

## Mettere un punto

Ottimo, funziona. Però non voglio dover specificare ogni volta se voglio le keys oppure i values. Servirebbe una funzione in grado di pre-aggiungere l'ultimo argomento di un'altra funzione.

```js
function partialRight(fn, rargs) {
  return function firstArgument(largs) {
    return fn(largs, rargs)
  }
}

const iteratifyKeys = partialRight(iteratify, extractAt0)
const iteratifyValues = partialRight(iteratify, extractAt1)

const itObjectKeys = iteratifyKeys(object)

for (let key of itObjectKeys) {
  console.log(key) // each return a key
}
```

---

## Summary

1. Iterator: La funzione `iteratify` riceve un oggetto e lo rende iterabile, restituendo in serie coppie chiave/valore.
2. Kestrel: Il suddetto comporatamento di default è ovveraidabile quando venga passata una funzione come secondo argomento.
3. Mediante semplici FP utilities è possibile salvare varianti di iteratify comuni
