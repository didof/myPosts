import React from 'react'

import decorateHOCWithStaticProps from './decorateHOCWithStaticProps'

function withAnalytics(Component) {
  return function WrappedComponent(props) {
    console.log('Send Analytics', JSON.stringify(props.analytics))

    return <Component {...props} />
  }
}

export default withAnalytics

export const withAnalyticsCompound = decorateHOCWithStaticProps(withAnalytics)
