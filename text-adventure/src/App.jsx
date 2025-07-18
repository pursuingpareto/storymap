import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [log, setLog] = useState([
    'Welcome to the Text Adventure Sandbox!',
    'Type anything to begin creating your world...'
  ]);
  const [input, setInput] = useState('');
  const logEndRef = useRef(null);

  // Scroll to bottom when log updates
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  function handleCommand(e) {
    e.preventDefault();
    if (!input.trim()) return;
    // For now, just echo the command as a sandbox
    setLog(log => [
      ...log,
      `> ${input}`,
      `You said: ${input}`
    ]);
    setInput('');
  }

  return (
    <div className="adventure-container">
      <h1>Text Adventure Sandbox</h1>
      <div className="adventure-log">
        {log.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
        <div ref={logEndRef} />
      </div>
      <form className="adventure-input" onSubmit={handleCommand}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a command..."
          autoFocus
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App
