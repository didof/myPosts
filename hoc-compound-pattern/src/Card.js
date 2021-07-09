import React from 'react'

function Card({ children }) {
  return <article>{children}</article>
}

Card.Header = Header
Card.Media = Media
Card.Body = Body

export default Card

function Header({ children }) {
  return (
    <header>
      <h4>{children}</h4>
    </header>
  )
}

function Media({ src, alt }) {
  if (!alt)
    throw new Error(`Please, always use an alt attribute. ${src} misses it!`)
  return <img src={src} alt={alt} />
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
      <ul>
        {CTAmap.filter((_, index) => buttons[index]).map(
          ({ label, action }) => {
            return (
              <button key={label} onClick={action}>
                {label}
              </button>
            )
          }
        )}
      </ul>
    </div>
  )
}
