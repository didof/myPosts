import React from 'react'

function withBlueBg(Component, compounds) {
  function WrappedComponent(props) {
    return (
      <div style={{ backgroundColor: 'blue' }}>
        <Component {...props} />
      </div>
    )
  }

  Object.entries(compounds).forEach(([name, component]) => {
    WrappedComponent[name] = component
  })

  return WrappedComponent
}

export default withBlueBg
