import React from 'react'

import Card from './Card'

function App() {
  return (
    <Card>
      <Card.Header>Riso, Patate e Cozze</Card.Header>
      <Card.Body more buy>
        <h6>Ingredients</h6>
        <ul>
          <li>Rice</li>
          <li>Potatoes</li>
          <li>Cozze</li>
        </ul>
      </Card.Body>
    </Card>
  )
}

export default App
