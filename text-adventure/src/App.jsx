import { useState } from 'react'
import './App.css'

function App() {
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  function handleChoice(choice) {
    setBreadcrumbs(prev => [...prev, choice]);
  }

  return (
    <div className="adventure-container">
      <h1>Text Adventure: Two Doors</h1>
      <div className="breadcrumbs">
        {breadcrumbs.length === 0 ? (
          <span>No choices yet</span>
        ) : (
          breadcrumbs.map((crumb, idx) => (
            <span key={idx}>
              {crumb}
              {idx < breadcrumbs.length - 1 && ' > '}
            </span>
          ))
        )}
      </div>
      <div className="choice-buttons">
        <button onClick={() => handleChoice('left')}>left</button>
        <button onClick={() => handleChoice('right')}>right</button>
      </div>
    </div>
  );
}

export default App
