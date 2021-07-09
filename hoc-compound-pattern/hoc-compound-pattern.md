# HOC & Compound Pattern Merged

The **Compound Pattern** allows you to associate one or more sub-components to a component. These can be repeated and reallocated. Above all, they allow you to _encapulate_ the structure, style and logic relating to a portion of the UI.

The **High Order Component** is the extension in the React context of the _High Order Function_. Basically it is a function that wraps a component and enhances it and/or injects additional functionality.

Have you ever tried to use the second over the first? If so, you will have realized that React will complain. I'll tell you more - he's right.

## Steps

1. Create Compound Component ([detail](https://kentcdodds.com/blog/compound-components-with-react-hooks))
2. Create High Order Component ([detail](https://medium.com/@jrwebdev/react-higher-order-component-patterns-in-typescript-42278f7590fb))
3. Merging... it fails!
4. Reasoning to the solution
5. Abstract away the problem

> If you are already aware of both patterns skip to step 3

---

To better understand the problem, therefore the solution, we use some code. These are deliberately simple components, precisely because I hope the focus of attention falls on how they connect rather than on what they do.

### 1. Create Compound Component

A `Card` component to be used in the following way:

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

Implemented like this:

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

Card.Header = Header        // The magic of Compound Pattern
Card.Body = Body            // is all here

export default Card
```

### Create High Order Component (HOC)

A HOC can do it all. It can wrap a component with a Provider, a Router, it can also just add color here and there or even completely distort its props. For simplicity, our `withAnalytics` will simply print a specific prop of the wrapped component to the console.

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

And where `Card` is used we add:

```js
<Card analytics={{ id: '123', name: 'rpc' }}>
```

### 3. Merging... it fails!

All the pieces are there. We just need to wrap `Card` with` withAnalytics`.

```js
export default withAnalytics(Card)
```

And crash! So many errors in console!

Let's try to remove the sub-components in `Card`.

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

The error went away. So it's something to do with assigning sub-components as static properties on `Card`.

Let's analyze the `Card` export.
Previously it was `export default Card`. So we were exporting a function, `Card`, with the associated `Header` and `Body`.

It is now `export default withAnalytics(Card)`. We are exporting what the `withAnalytics` function returns. And what is it about?

```js
function withAnalytics(Component) {
  return function WrappedComponent(props) {
    console.log('Send Analytics', JSON.stringify(props.analytics))

    return <Component {...props} />
  }
}
```

It's a function, `WrappedComponent`, which accepts props... wait a minute, it's a component! Not only that - it is the component we have in our hands where we import it.

Here's the problem! Because of the HOC, where we use `<Card>` we are not referring to `function Card()` (the one defined at step 1), but to `funtion WrappedComponent`!

> It is on it that we should define the sub-components!

### 4. Reasoning to the solution

We can't do something like:

```js
WrappedComponent.Header = Header
```

Or rather: it is what we need to happen, but it must happen dynamically. Just enable `withAnalytics` to receive a set of sub-components from the file that uses it.

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

Since `withAnalytics` does not know how many compounds to attach to the` WrappedComponent`, nor the name, it is sufficient to iterate for each of them and exploit the structure `{'componentname': 'actual component'}`.

> If that doesn't work, just print the `name` and` component` inside the `forEach`.

Done. Now you can use the HOC on a component built using Compound Pattern.

But, if you feel like it, there is more.

---

### 5. Abstract away the problem

Is it possible to abstract away the sub-component assignment so that the body function of any High Order Component is concerned only with its own functionality? **Yes**.

We build a decorator whose purpose is to make _dependencies injection_ of the various compounds. In this way when we build a HOC we don't have to worry about managing the compounds when we want to use it on a component created with compound pattern.

```js
function decorateHOCWithStaticProps(hoc) {
  return function getCompounds(compounds) {
    return function execHOC(Component) {
      const c = hoc(Component)

      Object.entries(compounds).forEach(([name, component]) => {
        c[name] = component
      })

      return c
    }
  }
}
```

We report `withAnalytics` to deal only with its issues. It no longer handles `compounds`. Rollback!

```js
function withAnalytics(Component) {
  return function WrappedComponent(props) {
    console.log('Send Analytics', JSON.stringify(props.analytics))

    return <Component {...props} />
  }
}

export default withAnalytics
```

> We keep exporting `withAnalytics` as default because it is sufficient as is when we want to apply it on a "Non-Compound Component".

When instead we want to apply it on a _Compound Component_:

```js
export default withAnalytics

export const withAnalyticsCompound = decorateHOCWithStaticProps(withAnalytics)
```

> Our HOC, `withAnalytics`, is stored inside `decorateHOCWithStaticProps`. The `withAnalyticsCompound` variable therefore corresponds to the `getCompounds` function.

Where we define and export the Compound Component `Card`:

```js
import { withAnalyticsCompound } from 'somewhere'

function Card({ children }) { ... }

const withAnalyticsSpecial = withAnalyticsCompound({ Header, Body })
```

The `withAnalyticsSpecial` variable corresponds to the `execHOC` function.

> Ideally, all this abstraction just serves to be able to call it `withAnalytics` while ignoring the problem. However I opted for the `-Special` suffix to highlight that it is not the "simple" HOC default exported.

```js
export default withAnalyticsSpecial(Card)
```

Before being exported, _it is executed_. We make explicit the values ​​passed in the various steps:

```js
function decorateHOCWithStaticProps(hoc) {
  // where hoc = withAnalytics
  return function getCompounds(compounds) {
    // where compounds = { Header, Body }
    return function execHOC(Component) {
      // where Component = Card
      const c = hoc(Component)

      // wrap Card with withAnalytics but, before returning it,
      // decorate it:
      // c.Header = Header
      // c['Body'] = Body
      Object.entries(compounds).forEach(([name, component]) => {
        c[name] = component
      })

      return c
    }
  }
}
```

In this way we have abstracted the resolution of the problem, solving it once and for all.
When you create a HOC and you want to make sure that it can also be used on Compound Components you just need:

1. In addition to the default, also export a version of the HOC processed by `decorateHOCWithStaticProps`
2. Where you export the Compound Component, import the previous one and invoke it passing the sub-components.
3. Forget about the problem and export wrapping with the result of the previous one

---

#### Contacts

Hope you find all of this useful. If you feel like it, let's get in touch!

- [Twitter](https://twitter.com/did0f)
- [Linkedin](https://www.linkedin.com/in/francesco-di-donato-2a9836183/)
