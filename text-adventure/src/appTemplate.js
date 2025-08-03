// Complete application template for each node
export const getDefaultAppCode = () => ({
  javascript: `function NodeApp() {
  const [story, setStory] = useState({
    "start": {
      id: "start",
      text: "Welcome to your custom node! Edit this entire application to create your unique experience.",
      options: [
        { text: "Continue", nextId: "next" }
      ],
      color: "#1e3c72"
    },
    "next": {
      id: "next", 
      text: "This is completely customizable! You can modify the entire React application for this node.",
      options: [
        { text: "Go back", nextId: "start" }
      ],
      color: "#764ba2"
    }
  });
  
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const currentNode = story[currentNodeId];

  // Helper function to adjust color brightness
  const adjustColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  };

  // Helper function to calculate text color based on background brightness
  const getTextColor = (backgroundColor) => {
    if (!backgroundColor) return '#f8f8f8';
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  function handleChoice(option) {
    setHistory(function(prev) {
      return prev.concat([{ nodeId: currentNodeId }]);
    });
    setCurrentNodeId(option.nextId);
  }

  function goBack() {
    if (history.length > 0) {
      const newHistory = history.slice();
      const lastEntry = newHistory.pop();
      setHistory(newHistory);
      setCurrentNodeId(lastEntry.nodeId);
    }
  }

  return React.createElement('div', {
    className: "adventure-container",
    style: {
      background: currentNode.color ? 'linear-gradient(135deg, ' + currentNode.color + ' 0%, ' + adjustColor(currentNode.color, 20) + ' 100%)' : 'rgba(255, 255, 255, 0.1)'
    }
  }, 
    React.createElement('h1', {
      style: { color: getTextColor(currentNode.color) }
    }, 'Custom Node Application'),
    
    React.createElement('div', {
      className: "story-text",
      style: {
        color: getTextColor(currentNode.color),
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid ' + getTextColor(currentNode.color),
        padding: '1rem',
        borderRadius: '8px',
        maxWidth: '600px',
        textAlign: 'left'
      }
    }, currentNode.text || "This part of the story hasn't been written yet."),
    
    React.createElement('div', { className: "choice-buttons" },
      currentNode.options && currentNode.options.length > 0 ? 
        currentNode.options.map(function(option, index) {
          return React.createElement('button', {
            key: index,
            className: "choice-button",
            onClick: function() { handleChoice(option); },
            style: {
              color: getTextColor(currentNode.color),
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid ' + getTextColor(currentNode.color),
              padding: '1rem 2rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1em',
              margin: '0.5rem'
            }
          }, option.text);
        })
      : React.createElement('p', {
          style: { color: getTextColor(currentNode.color) }
        }, 'No choices available at this point.')
    ),
    
    React.createElement('div', { className: "navigation-buttons" },
      React.createElement('button', {
        onClick: goBack,
        disabled: history.length === 0,
        style: {
          color: getTextColor(currentNode.color),
          borderColor: getTextColor(currentNode.color),
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '0.8rem 1.5rem',
          borderRadius: '10px',
          cursor: history.length === 0 ? 'not-allowed' : 'pointer',
          opacity: history.length === 0 ? 0.5 : 1
        }
      }, 'Go Back')
    )
  );
}`,

  css: `#root {
  max-width: 100vw;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  text-align: center;
  font-size: 1.3rem;
  font-family: 'Segoe UI', 'Arial', sans-serif;
  color: #f3f3f3;
  overflow: hidden;
}

.adventure-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  margin: 0;
  overflow-y: auto;
}

h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
}

.story-text {
  max-width: 100%;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  font-size: 1.2em;
  line-height: 1.6;
  text-align: left;
  transition: all 0.3s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
}

.choice-button {
  flex: 1;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 2px solid transparent;
}

.choice-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  #root {
    font-size: 1.1rem;
  }
  
  .adventure-container {
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
  }
}`
});