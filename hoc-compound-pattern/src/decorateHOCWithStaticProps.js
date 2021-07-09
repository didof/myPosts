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

export default decorateHOCWithStaticProps
