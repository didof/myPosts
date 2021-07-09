# HOC & Compound Pattern Merged

Il Compound Pattern permette di definire per un componente uno o più sotto-componenti. Questi possono essere ripetuti, riallocati. Soprattutto permettono di encapulare la struttura, lo style e logiche relative ad una porzione di UI.

L'High Order Component è l'estenzione nel contesto React dell'High Order Function. Sostanzialmente è una funzione che wrappa un componente e ne enhance e/o inietta funzionalità aggiuntive.

Hai mai provato ad utilizzare il secondo sul primo? Se sì, ti sarai reso conto che React si lamenterà. Ti dirò di più - ha ragione lui.

## Steps

1. Create Compound Component
2. Create HOC
3. Capire perché il merge fallisce
4. Trovare la soluzione
5. Bonus - Automate the HOC-compound

---

Per meglio comprendere la problematica, quindi la soluzione, usiamo del codice. Si tratta di componenti volutamente semplici, proprio perché il focus dell'attenzione deve ricadere su come si incontrano.

### 1. Create Compound Component

Un componente `Card` da utilizzarsi nel seguente modo:

```js
<Card>
  <Card.Header>Riso, Patate e Cozze</Card.Header>
  <Card.Body more buy>
    <h6>Ingredients:</h6>
    <ul>
      <li>Rice</li>
      <li>Potatoes</li>
      <li>Mussels</li>
    </ul>
  </Card.Body>
</Card>
```

Implementato così:

```js
function Card({ children }) {
  return <article>{children}</article>
}

function Header({ children }) {
  return (
    <header>
      <h4>{children}</h4>
    </header>
  )
}

function Body({ children }) { ... }

Card.Header = Header
Card.Body = Body

export default Card
```

### Create HOC

Un High Order Component può fare di tutto. Può wrappare un componente con un Provider, un Router, può anche solo aggiungere del colore qua e là o addirittura stravolgerne completamente le props. Per semplicità, il nostro `withAnalytics` si limiterà a stampare in console una specifica prop del componente wrappato.

```js
function withAnalytics(Component) {
  return function WrappedComponent(props) {
    // mock analytics call, add props as payload, etc.
    console.log('Send Analytics', JSON.stringify(props.analytics))

    return <Component {...props} />
  }
}

export default withAnalytics
```

E laddove `Card` è utilizzato aggiungiamo:

```js
<Card analytics={{ id: '123', name: 'rpc' }}>
```

### 3. Capire perché il merge fallisce

Ci sono tutti i pezzi. Manca solo da wrappare `Card` con `withAnalytics`.

```js
export default withAnalytics(Card)
```

And crash! So many errors in console!

Proviamo a rimuovere i sotto-componenti in `Card`

```js
<Card analytics={{ id: '123', name: 'rpc' }}>
  {/* <Card.Header>Riso, Patate e Cozze</Card.Header>
      <Card.Body more buy>
        <h6>Ingredients</h6>
        <ul>
          <li>Rice</li>
          <li>Potatoes</li>
          <li>Cozze</li>
        </ul>
      </Card.Body> */}
</Card>
```

L'errore è andato via. Dunque è qualcosa che ha a che fare con l'assegnazione dei sotto-componenti come proprietà statiche su `Card`.

Analizziamo l'`export` di `Card`.
Precedentemente era `export default Card`. Dunque stavamo esportando una funzione, `Card`, alla quale erano associati `Header` e `Body`.

Adesso è `export default withAnalytics(Card)`. Stiamo esportando ciò che la funzione `withAnalytics` restituisce. Cos'è?

```js
function withAnalytics(Component) {
  return function WrappedComponent(props) {
    console.log('Send Analytics', JSON.stringify(props.analytics))
    return <Component {...props} />
  }
}
```

E' un componente. Non solo - è il componente che abbiamo tra le mani laddove lo importiamo.

Ecco il problema! A causa del HOC, quando usiamo `<Card>` in `App` (o ovunque) non stiamo facendo riferimento a `function Card()` (parte 1), bensì a `funtion WrappedComponent`! Ed è su di esso che dovremmo definire i sotto-componenti!

### 4. Trovare la soluzione

Non possiamo fare qualcosa come:

```js
WrappedComponent.Header = Header
```

O meglio: è ciò che ci serve accada, ma deve accadere in modo dinamico. Basta abilitare `withAnalytics` a ricevere da parte del file che lo utilizza un set di sotto-componenti.

```js
function withAnalytics(Component, compounds) {
  function WrappedComponent(props) {
    console.log('Send Analytics', JSON.stringify(props.analytics))

    return <Component {...props} />
  }

  Object.entries(compounds).forEach(([name, component]) => {
    WrappedComponent[name] = component
  })

  return WrappedComponent
}
```

E laddove esportiamo `Card`:

```js
export default withAnalytics(Card, { Header, Body })
```

Dato che `withAnalytics` non sa né quati compounds deve allegare a `WrappedComponent`, né tantomeno il nome, è sufficiente iterare per ognuno di essi e sfruttare la struttura `{ 'nomeComponente': 'componente vero e proprio' }`.

> Se non ti torna, è sufficiente printare `name` e `component` all'interno del `forEach`.

---

Ecco fatto. Adesso puoi usare l'HOC su di un componente costruito mediante Compound Pattern.

### 5. Bonus - Automate the HOC-compound

E' possibile astrarre via l'assegnazione dei sotto-componenti in modo che il body di una qualsiasi HOC si concerned solo della propria funzionalità?
