import React from 'react'
import { withAnalyticsCompound } from './withAnalytics'

function Card({ children }) {
  return <article>{children}</article>
}

export default withAnalyticsCompound(Card, { Header, Body })

function Header({ children }) {
  return (
    <header>
      <h4>{children}</h4>
    </header>
  )
}

function Body({ children, more, buy }) {
  const CTAmap = [
    {
      label: 'See more details',
      action: () => console.log('invoke showMore'),
    },
    {
      label: 'Buy',
      action: () => console.log('invoke addToCart'),
    },
  ]

  const buttons = [more, buy].map(Boolean)

  return (
    <div>
      {children}
      <ul>{CTAmap.filter(selectedButtons).map(buildButton)}</ul>
    </div>
  )

  function selectedButtons(_, index) {
    return buttons[index]
  }

  function buildButton({ label, action }) {
    return (
      <button key={label} onClick={action}>
        {label}
      </button>
    )
  }
}
