import React from 'react'

function withAnalytics(Component, compounds) {
  function WrappedComponent(props) {
    // mock analytics call, add props as payload, etc.
    console.log('Send Analytics', JSON.stringify(props.analytics))

    return <Component {...props} />
  }

  Object.entries(compounds).forEach(([name, component]) => {
    WrappedComponent[name] = component
  })

  return WrappedComponent
}

export default withAnalytics
