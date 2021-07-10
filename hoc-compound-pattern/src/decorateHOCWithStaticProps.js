function decorateHOCWithStaticProps(hoc) {
  return function execHOC(Component, compounds) {
    const c = hoc(Component)

    Object.entries(compounds).forEach(([name, component]) => {
      c[name] = component
    })

    return c
  }
}

export default decorateHOCWithStaticProps
