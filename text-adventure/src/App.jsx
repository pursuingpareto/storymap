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
  
  // AI Assistant state (for code editor)
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedLLMProvider, setSelectedLLMProvider] = useState('claude');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
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

  // AI Assistant Functions
  const LLM_PROVIDERS = {
    claude: { 
      name: 'Claude (Anthropic)', 
      apiKey: localStorage.getItem('claude_api_key') || '',
      endpoint: localStorage.getItem('claude_proxy_endpoint') || 'https://api.anthropic.com/v1/messages',
      needsProxy: false // Claude now supports direct browser access with special header
    },
    openai: { 
      name: 'OpenAI GPT-4', 
      apiKey: localStorage.getItem('openai_api_key') || '',
      endpoint: localStorage.getItem('openai_proxy_endpoint') || 'https://api.openai.com/v1/chat/completions',
      needsProxy: true
    },
    gemini: { 
      name: 'Google Gemini', 
      apiKey: localStorage.getItem('gemini_api_key') || '',
      endpoint: localStorage.getItem('gemini_proxy_endpoint') || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      needsProxy: false // Gemini allows direct calls
    },
    ollama: { 
      name: 'Ollama (Local)', 
      apiKey: 'local',
      endpoint: localStorage.getItem('ollama_endpoint') || 'http://localhost:11434/api/generate',
      needsProxy: false
    }
  };

  // Real AI API call
  const callAI = async (provider, prompt, currentCode, targetTab) => {
    setIsAIProcessing(true);
    
    try {
      const providerConfig = LLM_PROVIDERS[provider];
      
      if (!providerConfig.apiKey && provider !== 'ollama') {
        throw new Error(`API key not found for ${providerConfig.name}. Please set it in the AI panel.`);
      }
      
      const systemPrompt = targetTab === 'javascript' 
        ? `You are a React code assistant. The user will provide existing JavaScript code for a React component and ask you to modify it. Return ONLY the complete, modified JavaScript code without any explanations, markdown formatting, or additional text. The code should be a complete React component function named "NodeApp" that uses React.createElement() calls.`
        : `You are a CSS assistant. The user will provide existing CSS code and ask you to modify it. Return ONLY the complete, modified CSS code without any explanations, markdown formatting, or additional text. Include all existing styles plus your modifications.`;

      const userPrompt = `Current ${targetTab === 'javascript' ? 'JavaScript' : 'CSS'} code:
\`\`\`${targetTab === 'javascript' ? 'javascript' : 'css'}
${targetTab === 'javascript' ? currentCode.javascript : currentCode.css}
\`\`\`

User request: ${prompt}

Please provide the complete modified ${targetTab === 'javascript' ? 'JavaScript' : 'CSS'} code:`;

      let response;
      
      switch (provider) {
        case 'claude':
          response = await callClaudeAPI(providerConfig, systemPrompt, userPrompt);
          break;
        case 'openai':
          response = await callOpenAIAPI(providerConfig, systemPrompt, userPrompt);
          break;
        case 'gemini':
          response = await callGeminiAPI(providerConfig, systemPrompt, userPrompt);
          break;
        case 'ollama':
          response = await callOllamaAPI(providerConfig, systemPrompt, userPrompt);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        provider,
        prompt,
        response: {
          javascript: targetTab === 'javascript' ? response : currentCode.javascript,
          css: targetTab === 'css' ? response : currentCode.css
        },
        targetTab,
        applied: false
      };
      
      setAiHistory(prev => [historyEntry, ...prev]);
      return historyEntry;
      
    } catch (error) {
      console.error('AI API Error:', error);
      let errorMessage = error.message;
      
      // Provide helpful error messages for common issues
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        const providerConfig = LLM_PROVIDERS[provider];
        if (providerConfig.needsProxy) {
          errorMessage = `CORS Error: ${providerConfig.name} blocks direct browser requests.\n\nSolutions:\n• Use a CORS proxy (recommended for development)\n• Set up a backend server to proxy requests\n• Use browser extension like "CORS Unblock"\n\nExample proxy setup: https://github.com/Rob--W/cors-anywhere`;
        } else {
          errorMessage = `Network error. Please check if the service is running and accessible.`;
        }
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Invalid API key. Please check your API key in the settings.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait and try again.';
      }
      
      throw new Error(`${LLM_PROVIDERS[provider].name}: ${errorMessage}`);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Claude API call
  const callClaudeAPI = async (config, systemPrompt, userPrompt) => {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: userPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.content[0].text);
  };

  // OpenAI API call
  const callOpenAIAPI = async (config, systemPrompt, userPrompt) => {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.choices[0].message.content);
  };

  // Gemini API call
  const callGeminiAPI = async (config, systemPrompt, userPrompt) => {
    const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.candidates[0].content.parts[0].text);
  };

  // Ollama API call
  const callOllamaAPI = async (config, systemPrompt, userPrompt) => {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'codellama',
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.response);
  };

  // Helper function to set API keys and endpoints
  const setAPIKey = (provider, value) => {
    if (provider === 'ollama') {
      localStorage.setItem('ollama_endpoint', value);
      LLM_PROVIDERS[provider].endpoint = value;
    } else if (value.startsWith('http')) {
      // If the value looks like a URL, treat it as a custom endpoint
      localStorage.setItem(`${provider}_proxy_endpoint`, value);
      LLM_PROVIDERS[provider].endpoint = value;
    } else {
      // Otherwise treat it as an API key
      localStorage.setItem(`${provider}_api_key`, value);
      LLM_PROVIDERS[provider].apiKey = value;
    }
    // Force re-render to update the provider config
    setSelectedLLMProvider(prev => prev);
  };

  // Helper function to clean AI response (remove markdown formatting)
  const cleanAIResponse = (response) => {
    // Remove markdown code blocks
    response = response.replace(/```[a-zA-Z]*\n/g, '');
    response = response.replace(/```/g, '');
    
    // Remove any leading/trailing whitespace
    response = response.trim();
    
    return response;
  };

  const handleAIRequest = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      const currentCode = {
        javascript: editingJavaScript,
        css: editingCSS
      };
      const result = await callAI(selectedLLMProvider, aiPrompt, currentCode, activeCodeTab);
      setAiPrompt('');
    } catch (error) {
      alert('AI request failed: ' + error.message);
    }
  };

  const applyAIChanges = (historyEntry) => {
    // Apply changes based on which tab the request was made for
    if (historyEntry.targetTab === 'javascript') {
      setEditingJavaScript(historyEntry.response.javascript);
    } else if (historyEntry.targetTab === 'css') {
      setEditingCSS(historyEntry.response.css);
    } else {
      // Fallback: apply both
      setEditingJavaScript(historyEntry.response.javascript);
      setEditingCSS(historyEntry.response.css);
    }

    setAiHistory(prev => 
      prev.map(entry => 
        entry.id === historyEntry.id 
          ? { ...entry, applied: true }
          : entry
      )
    );
  };

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
          maxHeight: '70vh',
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
                  cursor: 'pointer',
                  borderRight: '1px solid #666'
                }}
              >
                Styles (CSS)
              </button>
              <div style={{ flex: 1 }}></div>
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                style={{
                  padding: '12px 24px',
                  background: showAIPanel ? '#6a11cb' : 'rgba(106, 17, 203, 0.3)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  borderLeft: '1px solid #666'
                }}
              >
                {showAIPanel ? '✕ Hide AI' : '🤖 AI Assistant'}
              </button>
            </div>
            
            {/* Code Editor Content */}
            <div style={{ flex: 1, display: 'flex' }}>
              {/* Main Code Editor Area */}
              <div style={{ 
                flex: showAIPanel ? '2' : '1',
                display: 'flex',
                flexDirection: 'column',
                borderRight: showAIPanel ? '1px solid #666' : 'none'
              }}>
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

              {/* AI Assistant Side Panel */}
              {showAIPanel && (
                <div style={{
                  flex: '1',
                  background: '#1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: '1px solid #6a11cb',
                  minWidth: '350px'
                }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    padding: '15px',
                    borderBottom: '1px solid #333'
                  }}>
                    <h3 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '1.1rem' }}>
                      🤖 AI Assistant
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                      Editing: {activeCodeTab === 'javascript' ? 'JavaScript' : 'CSS'}
                    </p>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' }}>
                    {/* LLM Provider Selection */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>
                        AI Provider:
                      </label>
                      <select
                        value={selectedLLMProvider}
                        onChange={(e) => setSelectedLLMProvider(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {Object.entries(LLM_PROVIDERS).map(([key, provider]) => (
                          <option key={key} value={key} style={{ background: '#333' }}>
                            {provider.name} {provider.apiKey ? '✓' : '⚠️'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* API Key Setup */}
                    <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,193,7,0.1)', border: '1px solid #ffc107', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#ffc107', fontWeight: 'bold' }}>
                          {LLM_PROVIDERS[selectedLLMProvider].apiKey ? '✓ API Key Set' : '⚠️ API Key Required'}
                        </span>
                      </div>
                      <input
                        type="password"
                        placeholder={selectedLLMProvider === 'ollama' 
                          ? 'Ollama endpoint (e.g., http://localhost:11434/api/generate)' 
                          : `${LLM_PROVIDERS[selectedLLMProvider].name} API Key or Proxy URL`}
                        style={{
                          width: '100%',
                          padding: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: '1px solid #666',
                          borderRadius: '3px',
                          fontSize: '11px',
                          marginBottom: '5px'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            setAPIKey(selectedLLMProvider, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>
                        {selectedLLMProvider === 'ollama' 
                          ? 'Press Enter to save endpoint. Default: http://localhost:11434/api/generate'
                          : 'Press Enter to save API key or proxy URL (stored locally in browser)'
                        }
                      </div>
                      {selectedLLMProvider === 'claude' && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#6a11cb', marginTop: '3px' }}>
                            Get API key from: console.anthropic.com
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#28a745', marginTop: '3px' }}>
                            ✓ Supports direct browser access (no proxy needed)
                          </div>
                        </div>
                      )}
                      {selectedLLMProvider === 'openai' && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#6a11cb', marginTop: '3px' }}>
                            Get API key from: platform.openai.com/api-keys
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#ff6b6b', marginTop: '3px' }}>
                            ⚠️ CORS Error? Use proxy: https://cors-anywhere.herokuapp.com/https://api.openai.com/v1/chat/completions
                          </div>
                        </div>
                      )}
                      {selectedLLMProvider === 'gemini' && (
                        <div style={{ fontSize: '0.7rem', color: '#6a11cb', marginTop: '3px' }}>
                          Get API key from: makersuite.google.com/app/apikey
                        </div>
                      )}
                      {selectedLLMProvider === 'ollama' && (
                        <div style={{ fontSize: '0.7rem', color: '#6a11cb', marginTop: '3px' }}>
                          Install Ollama locally from: ollama.ai
                        </div>
                      )}
                    </div>

                    {/* CORS Information */}
                    {selectedLLMProvider === 'openai' && (
                      <div style={{ 
                        marginBottom: '15px', 
                        padding: '10px', 
                        background: 'rgba(255,87,51,0.1)', 
                        border: '1px solid #ff5733', 
                        borderRadius: '4px' 
                      }}>
                        <div style={{ fontSize: '0.8rem', color: '#ff5733', fontWeight: 'bold', marginBottom: '5px' }}>
                          🛡️ CORS Information
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#ddd', lineHeight: '1.3' }}>
                          {selectedLLMProvider.charAt(0).toUpperCase() + selectedLLMProvider.slice(1)} blocks direct browser requests for security.
                          <br/><br/>
                          <strong>Development Solutions:</strong>
                          <br/>
                          • <strong>CORS Proxy:</strong> Visit <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank" style={{color: '#6a11cb'}}>cors-anywhere demo</a>, click "Request access", then use proxy URL above
                          <br/>
                          • <strong>Browser Extension:</strong> Install "CORS Unblock" or "Disable CORS"
                          <br/>
                          • <strong>Local Proxy:</strong> Run your own Node.js proxy server
                          <br/><br/>
                          <strong>Production:</strong> Always use a backend server to make API calls, never expose API keys in frontend code.
                        </div>
                      </div>
                    )}

                    {/* Claude Direct Access Information */}
                    {selectedLLMProvider === 'claude' && (
                      <div style={{ 
                        marginBottom: '15px', 
                        padding: '10px', 
                        background: 'rgba(40,167,69,0.1)', 
                        border: '1px solid #28a745', 
                        borderRadius: '4px' 
                      }}>
                        <div style={{ fontSize: '0.8rem', color: '#28a745', fontWeight: 'bold', marginBottom: '5px' }}>
                          ✅ Direct Browser Access Enabled
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#ddd', lineHeight: '1.3' }}>
                          Claude supports direct browser requests using the <code style={{background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '3px'}}>anthropic-dangerous-direct-browser-access</code> header.
                          <br/><br/>
                          Just enter your API key - no proxy needed!
                          <br/><br/>
                          <strong>Note:</strong> This is for development only. In production, always use a backend server.
                        </div>
                      </div>
                    )}

                    {/* AI Prompt Input */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>
                        What do you want to change?
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder={activeCodeTab === 'javascript' 
                          ? "e.g., Add a counter, Create a button, Change the title..."
                          : "e.g., Make buttons red, Add gradient background, Add animations..."
                        }
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '8px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: '1px solid #666',
                          borderRadius: '4px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          fontSize: '12px'
                        }}
                      />
                      <button
                        onClick={handleAIRequest}
                        disabled={!aiPrompt.trim() || isAIProcessing}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginTop: '8px',
                          background: isAIProcessing ? '#666' : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isAIProcessing ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        {isAIProcessing ? '🔄 AI Working...' : '✨ Generate Code'}
                      </button>
                    </div>

                    {/* AI History */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'white' }}>
                        Recent Changes
                      </h4>
                      {aiHistory.length === 0 ? (
                        <p style={{ color: '#888', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          No AI requests yet. Try asking the AI to modify your {activeCodeTab === 'javascript' ? 'React component' : 'CSS styles'}!
                        </p>
                      ) : (
                        aiHistory
                          .filter(entry => entry.targetTab === activeCodeTab)
                          .map((entry) => (
                          <div
                            key={entry.id}
                            style={{
                              marginBottom: '15px',
                              padding: '12px',
                              background: entry.applied ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255,255,255,0.05)',
                              border: entry.applied ? '1px solid #28a745' : '1px solid #333',
                              borderRadius: '8px'
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <small style={{ color: '#888', fontSize: '0.7rem' }}>
                                {LLM_PROVIDERS[entry.provider].name}
                              </small>
                              <small style={{ color: '#888', fontSize: '0.7rem' }}>
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </small>
                            </div>
                            
                            <div style={{ 
                              margin: '0 0 10px 0', 
                              fontSize: '0.8rem',
                              background: 'rgba(0,0,0,0.3)',
                              padding: '8px',
                              borderRadius: '4px',
                              fontStyle: 'italic',
                              color: 'white'
                            }}>
                              <strong>Request:</strong> "{entry.prompt}"
                            </div>

                            {/* AI Response Display */}
                            <div style={{ marginBottom: '10px' }}>
                              <div style={{ 
                                fontSize: '0.8rem', 
                                color: '#6a11cb', 
                                fontWeight: 'bold',
                                marginBottom: '5px'
                              }}>
                                🤖 AI Response ({entry.targetTab}):
                              </div>
                              <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                maxHeight: '200px',
                                overflowY: 'auto'
                              }}>
                                <pre style={{
                                  margin: 0,
                                  padding: '8px',
                                  fontSize: '0.7rem',
                                  color: '#d4d4d4',
                                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                                  lineHeight: '1.3',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                                }}>
                                  {entry.targetTab === 'javascript' 
                                    ? entry.response.javascript 
                                    : entry.response.css}
                                </pre>
                              </div>
                            </div>

                            {/* Current vs Proposed Comparison */}
                            <div style={{ marginBottom: '10px' }}>
                              <div style={{ 
                                fontSize: '0.8rem', 
                                color: '#ffc107', 
                                fontWeight: 'bold',
                                marginBottom: '5px'
                              }}>
                                📋 Changes Preview:
                              </div>
                              <div style={{
                                background: 'rgba(255,193,7,0.1)',
                                border: '1px solid #ffc107',
                                borderRadius: '4px',
                                padding: '8px',
                                fontSize: '0.7rem',
                                color: '#ddd'
                              }}>
                                {(() => {
                                  const currentCode = entry.targetTab === 'javascript' ? editingJavaScript : editingCSS;
                                  const proposedCode = entry.targetTab === 'javascript' ? entry.response.javascript : entry.response.css;
                                  
                                  if (currentCode === proposedCode) {
                                    return '✅ No changes - code is identical';
                                  }
                                  
                                  const currentLines = currentCode.split('\n').length;
                                  const proposedLines = proposedCode.split('\n').length;
                                  const sizeDiff = proposedLines - currentLines;
                                  
                                  return (
                                    <div>
                                      <div>📏 Current: {currentLines} lines → Proposed: {proposedLines} lines</div>
                                      {sizeDiff !== 0 && (
                                        <div style={{ color: sizeDiff > 0 ? '#28a745' : '#dc3545' }}>
                                          {sizeDiff > 0 ? '+' : ''}{sizeDiff} lines
                                        </div>
                                      )}
                                      <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                        {currentCode.length === 0 
                                          ? '🆕 Creating new code'
                                          : proposedCode.includes(currentCode.substring(0, 50))
                                            ? '✏️ Modifying existing code'
                                            : '🔄 Complete rewrite'
                                        }
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            {!entry.applied ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => applyAIChanges(entry)}
                                  style={{
                                    padding: '8px 16px',
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    flex: 1
                                  }}
                                >
                                  ✅ Apply Changes
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      entry.targetTab === 'javascript' 
                                        ? entry.response.javascript 
                                        : entry.response.css
                                    );
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  📋 Copy
                                </button>
                              </div>
                            ) : (
                              <div style={{ 
                                padding: '8px 16px',
                                background: 'rgba(40, 167, 69, 0.2)',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: '#28a745',
                                textAlign: 'center'
                              }}>
                                ✅ Applied Successfully
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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