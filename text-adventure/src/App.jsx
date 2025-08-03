import React, { useState, useEffect } from 'react'
import './App.css'
import { initialStory, defaultNodeCode } from './initialStory.js'

// Simple JSX to React.createElement transformer for basic JSX support
const transformJSX = (code) => {
  // This is a very basic JSX transformer - for production use Babel
  // Handle self-closing tags like <div />
  code = code.replace(/<(\w+)([^>]*?)\/>/g, 'React.createElement("$1", {$2})');
  
  // Handle opening and closing tags like <div>content</div>
  code = code.replace(/<(\w+)([^>]*?)>(.*?)<\/\1>/gs, (match, tag, props, children) => {
    // Simple children parsing - this is very basic
    const childrenCode = children.trim() ? `, ${children}` : '';
    return `React.createElement("${tag}", {${props}}${childrenCode})`;
  });
  
  return code;
};

// Dynamic component renderer
const DynamicComponent = ({ code, onNavigate }) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Clear any existing styles
      const existingStyle = document.getElementById('dynamic-node-style');
      if (existingStyle) existingStyle.remove();

      // Add CSS
      if (code.css) {
        const style = document.createElement('style');
        style.id = 'dynamic-node-style';
        style.textContent = code.css;
        document.head.appendChild(style);
      }

      // Create component from JavaScript code
      if (code.javascript) {
        // Prepare the code for evaluation
        let componentCode = code.javascript
          .replace('export default NodeApp;', '')
          .replace('import { useState, useEffect } from \'react\'', '')
          .replace('import React from \'react\'', '')
          .replace('import React, { useState, useEffect } from \'react\'', '');

        // Try to detect and transform simple JSX (basic support)
        if (componentCode.includes('<') && componentCode.includes('>')) {
          componentCode = transformJSX(componentCode);
        }

        // Use eval in a controlled way
        const evalFunction = new Function(
          'React', 'useState', 'useEffect', 'onNavigate', 'console', 'document',
          `
          ${componentCode}
          return NodeApp;
          `
        );
        
        const ComponentClass = evalFunction(
          React, useState, useEffect, onNavigate, console, document
        );
        
        setComponent(() => ComponentClass);
        setError(null);
      }
    } catch (err) {
      console.error('Error creating component:', err);
      setError(err.message);
      setComponent(null);
    }
  }, [code, onNavigate]);

  if (error) {
    return (
      <div style={{ color: 'red', padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.8)', borderRadius: '8px', margin: '2rem' }}>
        <h2>Code Error</h2>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <details>
          <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>Show Code</summary>
          <pre style={{ 
            textAlign: 'left', 
            background: 'rgba(0,0,0,0.5)', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto',
            maxHeight: '300px',
            fontSize: '12px'
          }}>
            {code.javascript}
          </pre>
        </details>
        <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
          Tip: Make sure your JSX syntax is correct and you're using proper React patterns.
        </p>
      </div>
    );
  }

  if (!Component) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;
  }

  return <Component />;
};

function App() {
  const [story, setStory] = useState(initialStory);
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [nextNodeId, setNextNodeId] = useState(1);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('javascript');
  const [editingJavaScript, setEditingJavaScript] = useState('');
  const [editingCSS, setEditingCSS] = useState('');
  const [showMetaControls, setShowMetaControls] = useState(false);
  const currentNode = story[currentNodeId];

  // Helper function to generate next unique node ID
  const generateNextNodeId = () => {
    const newId = nextNodeId;
    setNextNodeId(prev => prev + 1);
    return `node-${newId}`;
  };

  // Helper function to create a new node
  const createNewNode = () => {
    const newNodeId = generateNextNodeId();
    const newNode = {
      id: newNodeId,
      code: { ...defaultNodeCode }
    };

    setStory(prev => ({
      ...prev,
      [newNodeId]: newNode
    }));

    return newNodeId;
  };

  // Navigation function to pass to dynamic components
  const handleNodeNavigation = (nodeId) => {
    if (story[nodeId]) {
      setHistory(prev => [...prev, { nodeId: currentNodeId }]);
      setCurrentNodeId(nodeId);
    }
  };

  // Save and load functionality
  useEffect(() => {
    if (isInitialized) {
      const appState = {
        story: story,
        currentNodeId: currentNodeId,
        history: history,
        nextNodeId: nextNodeId
      };
      localStorage.setItem('adventure-app-state', JSON.stringify(appState));
    }
  }, [story, currentNodeId, history, nextNodeId, isInitialized]);

  useEffect(() => {
    const savedState = localStorage.getItem('adventure-app-state');
    if (savedState) {
      try {
        const appState = JSON.parse(savedState);
        setStory(appState.story || initialStory);
        setCurrentNodeId(appState.currentNodeId || "start");
        setHistory(appState.history || []);
        setNextNodeId(appState.nextNodeId || 1);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Code editor functions
  const startEditingCode = () => {
    setIsEditingCode(true);
    setEditingJavaScript(currentNode.code?.javascript || defaultNodeCode.javascript);
    setEditingCSS(currentNode.code?.css || defaultNodeCode.css);
  };

  const saveNodeCode = () => {
    const updatedCode = {
      javascript: editingJavaScript,
      css: editingCSS
    };

    setStory(prev => ({
      ...prev,
      [currentNodeId]: {
        ...prev[currentNodeId],
        code: updatedCode
      }
    }));

    setIsEditingCode(false);
  };

  const cancelEditingCode = () => {
    setIsEditingCode(false);
    setEditingJavaScript('');
    setEditingCSS('');
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

  // File operations
  const saveStoryToFile = () => {
    const storyData = {
      story: story,
      currentNodeId: currentNodeId,
      history: history,
      nextNodeId: nextNodeId,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(storyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adventure-story-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadStoryFromFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const storyData = JSON.parse(e.target.result);
          if (storyData.story) {
            setStory(storyData.story);
            setCurrentNodeId(storyData.currentNodeId || "start");
            setHistory(storyData.history || []);
            setNextNodeId(storyData.nextNodeId || 1);
            alert('Story loaded successfully!');
          } else {
            alert('Invalid story file format.');
          }
        } catch (error) {
          alert('Error loading story file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const lastEntry = newHistory.pop();
      setHistory(newHistory);
      setCurrentNodeId(lastEntry.nodeId);
    }
  };

  const resetStory = () => {
    const confirmed = confirm("Reset to default story? This will lose all changes.");
    if (confirmed) {
      setStory(initialStory);
      setCurrentNodeId("start");
      setHistory([]);
      setNextNodeId(1);
    }
  };

  // Get existing nodes for navigation
  const existingNodes = Object.keys(story);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Meta Controls Toggle */}
      <button
        onClick={() => setShowMetaControls(!showMetaControls)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: '1px solid white',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        {showMetaControls ? '✕ Hide Controls' : '⚙️ Meta Controls'}
      </button>

      {/* Meta Controls Panel */}
      {showMetaControls && (
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          zIndex: 999,
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          border: '1px solid white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '300px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>Meta Controls</h3>
          
          {/* Current Node Info */}
          <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <strong>Current Node:</strong> {currentNodeId}
          </div>

          {/* Code Editor */}
          <button
            onClick={startEditingCode}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔧 Edit Application Code
          </button>

          {/* Node Navigation */}
          <div style={{ marginBottom: '15px' }}>
            <strong>Navigate to Node:</strong>
            <select
              value={currentNodeId}
              onChange={(e) => setCurrentNodeId(e.target.value)}
              style={{
                width: '100%',
                padding: '5px',
                marginTop: '5px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px'
              }}
            >
              {existingNodes.map(nodeId => (
                <option key={nodeId} value={nodeId} style={{ background: '#333' }}>
                  {nodeId}
                </option>
              ))}
            </select>
          </div>

          {/* Create New Node */}
          <button
            onClick={() => {
              const newNodeId = createNewNode();
              setCurrentNodeId(newNodeId);
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ➕ Create New Node
          </button>

          {/* Navigation */}
          <button
            onClick={goBack}
            disabled={history.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              background: history.length === 0 ? '#666' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: history.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Go Back
          </button>

          {/* File Operations */}
          <div style={{ borderTop: '1px solid #666', paddingTop: '15px', marginTop: '15px' }}>
            <button
              onClick={saveStoryToFile}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '5px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              💾 Save Story
            </button>
            
            <label style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              marginBottom: '5px',
              background: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '12px'
            }}>
              📁 Load Story
              <input
                type="file"
                accept=".json"
                onChange={loadStoryFromFile}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={resetStory}
              style={{
                width: '100%',
                padding: '8px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔄 Reset Story
            </button>
          </div>
        </div>
      )}

      {/* Code Editor Modal */}
      {isEditingCode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '90%',
            height: '90%',
            background: '#1e1e1e',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Code Editor Header */}
            <div style={{
              display: 'flex',
              background: '#333',
              borderBottom: '1px solid #666'
            }}>
              <button
                onClick={() => setActiveCodeTab('javascript')}
                style={{
                  padding: '12px 24px',
                  background: activeCodeTab === 'javascript' ? '#007bff' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRight: '1px solid #666'
                }}
              >
                React Component (JavaScript)
              </button>
              <button
                onClick={() => setActiveCodeTab('css')}
                style={{
                  padding: '12px 24px',
                  background: activeCodeTab === 'css' ? '#007bff' : 'transparent',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Styles (CSS)
              </button>
            </div>
            
            {/* Code Editor Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {activeCodeTab === 'javascript' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    background: '#2d2d2d', 
                    padding: '10px', 
                    borderBottom: '1px solid #666',
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    💡 <strong>Tips:</strong> Write a complete React component function named "NodeApp". 
                    You can use React.createElement() or simple JSX. 
                    useState and useEffect are available.
                  </div>
                  <textarea
                    value={editingJavaScript}
                    onChange={(e) => setEditingJavaScript(e.target.value)}
                    placeholder={`// Write your complete React component here
function NodeApp() {
  const [count, setCount] = useState(0);
  
  function incrementCount() {
    setCount(count + 1);
  }
  
  return React.createElement('div', {
    style: { padding: '2rem', textAlign: 'center', color: 'white' }
  },
    React.createElement('h1', {}, 'Hello World!'),
    React.createElement('p', {}, 'Count: ' + count),
    React.createElement('button', {
      onClick: incrementCount,
      style: { padding: '10px 20px', fontSize: '16px' }
    }, 'Click me!')
  );
}`}
                    style={{
                      flex: 1,
                      background: '#1e1e1e',
                      color: '#d4d4d4',
                      border: 'none',
                      padding: '20px',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
              
              {activeCodeTab === 'css' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    background: '#2d2d2d', 
                    padding: '10px', 
                    borderBottom: '1px solid #666',
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    💡 <strong>Tips:</strong> Write complete CSS styles. These will apply globally when this node is active.
                  </div>
                  <textarea
                    value={editingCSS}
                    onChange={(e) => setEditingCSS(e.target.value)}
                    placeholder={`/* Complete CSS styles for your application */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

h1 {
  font-size: 3rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

button {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: #ff5252;
  transform: translateY(-2px);
}`}
                    style={{
                      flex: 1,
                      background: '#1e1e1e',
                      color: '#d4d4d4',
                      border: 'none',
                      padding: '20px',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      resize: 'none',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Code Editor Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              background: '#333',
              borderTop: '1px solid #666',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={saveNodeCode}
                style={{
                  padding: '12px 24px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💾 Save & Apply Changes
              </button>
              <button
                onClick={() => {
                  if (activeCodeTab === 'javascript') {
                    setEditingJavaScript(`function NodeApp() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hello from your custom app!');
  
  function handleClick() {
    setCount(count + 1);
    setMessage('You clicked ' + (count + 1) + ' times!');
  }
  
  return React.createElement('div', {
    style: { 
      padding: '3rem', 
      textAlign: 'center', 
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }
  },
    React.createElement('h1', {
      style: { fontSize: '3rem', marginBottom: '1rem' }
    }, 'Your Custom Application'),
    React.createElement('p', {
      style: { fontSize: '1.5rem', marginBottom: '2rem' }
    }, message),
    React.createElement('button', {
      onClick: handleClick,
      style: { 
        padding: '15px 30px', 
        fontSize: '18px',
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '1rem'
      }
    }, 'Click me! (' + count + ')'),
    React.createElement('p', {
      style: { fontSize: '1rem', opacity: 0.8 }
    }, 'Edit this code to create anything you want!')
  );
}`);
                  } else {
                    setEditingCSS(`body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
}

h1 {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

button {
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  background: #ff5252 !important;
}`);
                  }
                }}
                style={{
                  padding: '12px 24px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📝 Load Example
              </button>
              <button
                onClick={cancelEditingCode}
                style={{
                  padding: '12px 24px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Component Renderer */}
      <div style={{ width: '100%', height: '100%' }}>
        <DynamicComponent 
          code={currentNode?.code || defaultNodeCode} 
          onNavigate={handleNodeNavigation}
        />
      </div>
    </div>
  );
}

export default App;