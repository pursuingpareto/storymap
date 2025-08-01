import { useState, useEffect } from 'react'
import './App.css'

// Story data structure
const initialStory = {
  "start": {
    id: "start",
    text: "You find yourself standing at the entrance of a mysterious cave. The air is thick with anticipation, and you can hear distant sounds echoing from within. Two paths lie before you, each leading deeper into the darkness.",
    options: [
      { text: "Take the left path", nextId: "left-path" },
      { text: "Take the right path", nextId: "right-path" },
      { text: "Examine the cave entrance more closely", nextId: "examine" }
    ]
  },
  "left-path": {
    id: "left-path",
    text: "The left path leads you into a chamber filled with ancient runes carved into the walls. The air is warmer here, and you notice a faint glow emanating from deeper within.",
    options: [
      { text: "Study the runes", nextId: "study-runes" },
      { text: "Follow the glow", nextId: "follow-glow" },
      { text: "Go back to the entrance", nextId: "start" }
    ]
  },
  "right-path": {
    id: "right-path",
    text: "The right path opens into a vast cavern with a crystal-clear underground lake. The water reflects light from above, creating a mesmerizing display of colors on the cave walls.",
    options: [
      { text: "Swim across the lake", nextId: "swim-lake" },
      { text: "Walk around the lake", nextId: "walk-around" },
      { text: "Go back to the entrance", nextId: "start" }
    ]
  },
  "examine": {
    id: "examine",
    text: "Looking more closely at the cave entrance, you discover a hidden inscription that reads 'Only the brave shall find the treasure within.' You also notice a small alcove that might contain something useful.",
    options: [
      { text: "Search the alcove", nextId: "search-alcove" },
      { text: "Take the left path", nextId: "left-path" },
      { text: "Take the right path", nextId: "right-path" }
    ]
  },
  "study-runes": {
    id: "study-runes",
    text: "As you study the runes, they begin to glow with an otherworldly light. The ancient text reveals a prophecy about a chosen one who will restore balance to the world. You feel a strange power coursing through your veins.",
    options: [
      { text: "Accept the power", nextId: "accept-power" },
      { text: "Reject the power", nextId: "reject-power" },
      { text: "Continue deeper", nextId: "follow-glow" }
    ]
  },
  "follow-glow": {
    id: "follow-glow",
    text: "Following the glow, you discover a chamber filled with precious gems and ancient artifacts. At the center stands a pedestal with a mysterious orb that pulses with energy.",
    options: [
      { text: "Take the orb", nextId: "take-orb" },
      { text: "Examine the artifacts", nextId: "examine-artifacts" },
      { text: "Leave everything as is", nextId: "leave-chamber" }
    ]
  },
  "swim-lake": {
    id: "swim-lake",
    text: "The water is surprisingly warm and inviting. As you swim, you notice the lake is much deeper than it appears. Suddenly, you see something large moving beneath the surface.",
    options: [
      { text: "Dive deeper to investigate", nextId: "dive-deeper" },
      { text: "Swim faster to the other side", nextId: "swim-fast" },
      { text: "Return to shore", nextId: "right-path" }
    ]
  },
  "walk-around": {
    id: "walk-around",
    text: "Walking around the lake, you discover a hidden passage behind a waterfall. The sound of rushing water masks any other sounds, but you can see light coming from within the passage.",
    options: [
      { text: "Enter the passage", nextId: "waterfall-passage" },
      { text: "Continue around the lake", nextId: "continue-around" },
      { text: "Return to the lake", nextId: "right-path" }
    ]
  },
  "search-alcove": {
    id: "search-alcove",
    text: "In the alcove, you find an old leather satchel containing a map, a compass, and a small vial of glowing liquid. The map shows the layout of the cave system, but some areas are marked with warnings.",
    options: [
      { text: "Use the map to navigate", nextId: "use-map" },
      { text: "Drink the glowing liquid", nextId: "drink-liquid" },
      { text: "Take the satchel and continue", nextId: "take-satchel" }
    ]
  },
  "accept-power": {
    id: "accept-power",
    text: "As you accept the power, the runes flare brightly and you feel incredible energy flowing through you. You now understand the ancient language and can sense the presence of other magical beings in the cave.",
    options: [
      { text: "Use your new powers to explore", nextId: "use-powers" },
      { text: "Seek out the other magical beings", nextId: "seek-beings" },
      { text: "Continue to the treasure chamber", nextId: "follow-glow" }
    ]
  },
  "reject-power": {
    id: "reject-power",
    text: "You choose to reject the power, and the runes fade back to their dormant state. You feel a sense of peace and clarity, knowing that some things are better left untouched.",
    options: [
      { text: "Continue exploring without power", nextId: "follow-glow" },
      { text: "Return to the entrance", nextId: "start" },
      { text: "Search for another way", nextId: "search-alcove" }
    ]
  },
  "take-orb": {
    id: "take-orb",
    text: "As you grasp the orb, it begins to float above your hand and projects images of the cave's history. You see ancient civilizations, great battles, and the creation of this very chamber. The orb chooses you as its guardian.",
    options: [
      { text: "Accept guardianship", nextId: "accept-guardianship" },
      { text: "Return the orb", nextId: "return-orb" },
      { text: "Use the orb's power", nextId: "use-orb-power" }
    ]
  },
  "examine-artifacts": {
    id: "examine-artifacts",
    text: "The artifacts tell a story of a great civilization that once thrived here. You find scrolls, weapons, and jewelry, each with its own history. One particular scroll seems to contain a spell or ritual.",
    options: [
      { text: "Read the scroll", nextId: "read-scroll" },
      { text: "Take some artifacts", nextId: "take-artifacts" },
      { text: "Leave everything undisturbed", nextId: "leave-chamber" }
    ]
  },
  "leave-chamber": {
    id: "leave-chamber",
    text: "You choose to leave the chamber untouched, respecting the ancient site. As you exit, you feel a sense of accomplishment for having discovered this place without disturbing its treasures.",
    options: [
      { text: "Return to the entrance", nextId: "start" },
      { text: "Explore other areas", nextId: "left-path" },
      { text: "End your adventure", nextId: "end" }
    ]
  }
};

function App() {
  const [story, setStory] = useState(initialStory);
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(null); // 'text', 'options', 'add-option'
  const [editText, setEditText] = useState("");
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);
  const [newOptionText, setNewOptionText] = useState("");
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [pendingChoice, setPendingChoice] = useState(null);

  const currentNode = story[currentNodeId];

  useEffect(() => {
    // Save story to localStorage whenever it changes
    localStorage.setItem('adventure-story', JSON.stringify(story));
  }, [story]);

  useEffect(() => {
    // Load story from localStorage on component mount
    const savedStory = localStorage.getItem('adventure-story');
    if (savedStory) {
      setStory(JSON.parse(savedStory));
    }
  }, []);

  // File save functionality
  const saveStoryToFile = () => {
    const storyData = {
      story: story,
      currentNodeId: currentNodeId,
      history: history,
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

  // File load functionality
  const loadStoryFromFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const storyData = JSON.parse(e.target.result);
          if (storyData.story) {
            setStory(storyData.story);
            if (storyData.currentNodeId) {
              setCurrentNodeId(storyData.currentNodeId);
            }
            if (storyData.history) {
              setHistory(storyData.history);
            }
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

  function handleChoice(option) {
    setHistory(prev => [...prev, { nodeId: currentNodeId, choice: option.text }]);
    setCurrentNodeId(option.nextId);
    setIsEditing(false);
    setEditMode(null);
  }

  function handleEditText() {
    setStory(prev => ({
      ...prev,
      [currentNodeId]: {
        ...prev[currentNodeId],
        text: editText
      }
    }));
    setIsEditing(false);
    setEditMode(null);
    setEditText("");
  }

  function handleEditOption(index) {
    const updatedOptions = [...currentNode.options];
    updatedOptions[index] = { ...updatedOptions[index], text: editText };
    
    setStory(prev => ({
      ...prev,
      [currentNodeId]: {
        ...prev[currentNodeId],
        options: updatedOptions
      }
    }));
    setIsEditing(false);
    setEditMode(null);
    setEditText("");
    setEditingOptionIndex(null);
  }

  function handleAddOption() {
    // Show choice modal with all existing nodes as options
    const existingNodes = Object.keys(story);
    
    setPendingChoice({
      text: newOptionText,
      existingNodes: existingNodes
    });
    setShowChoiceModal(true);
  }

  function createNewNode() {
    const { text } = pendingChoice;
    const newOptionId = `node-${Date.now()}`;
    const newOption = { text, nextId: newOptionId };
    
    // Create new empty node
    const newNode = {
      id: newOptionId,
      text: "",
      options: []
    };

    // Add option to current node
    const updatedOptions = [...currentNode.options, newOption];
    
    setStory(prev => ({
      ...prev,
      [currentNodeId]: {
        ...prev[currentNodeId],
        options: updatedOptions
      },
      [newOptionId]: newNode
    }));
    
    setIsEditing(false);
    setEditMode(null);
    setNewOptionText("");
    setShowChoiceModal(false);
    setPendingChoice(null);
  }

  function linkToExistingNode(existingNodeId) {
    const { text } = pendingChoice;
    
    const newOption = { text, nextId: existingNodeId };
    
    // Add option to current node
    const updatedOptions = [...currentNode.options, newOption];
    
    setStory(prev => ({
      ...prev,
      [currentNodeId]: {
        ...prev[currentNodeId],
        options: updatedOptions
      }
    }));
    
    setIsEditing(false);
    setEditMode(null);
    setNewOptionText("");
    setShowChoiceModal(false);
    setPendingChoice(null);
  }

  function startEdit(mode, initialText = "", optionIndex = null) {
    setIsEditing(true);
    setEditMode(mode);
    setEditText(initialText);
    setEditingOptionIndex(optionIndex);
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditMode(null);
    setEditText("");
    setNewOptionText("");
    setEditingOptionIndex(null);
    setShowChoiceModal(false);
    setPendingChoice(null);
  }

  function goBack() {
    if (history.length > 0) {
      const newHistory = [...history];
      const lastEntry = newHistory.pop();
      setHistory(newHistory);
      setCurrentNodeId(lastEntry.nodeId);
    }
  }

  function resetStory() {
    setStory(initialStory);
    setCurrentNodeId("start");
    setHistory([]);
    setIsEditing(false);
    setEditMode(null);
  }

  return (
    <div className="adventure-container">
      <h1>Choose Your Own Adventure</h1>
      
      {/* File operations */}
      <div className="file-operations">
        <button 
          className="file-button save-button"
          onClick={saveStoryToFile}
        >
          💾 Save Story to File
        </button>
        <label className="file-button load-button">
          📁 Load Story from File
          <input
            type="file"
            accept=".json"
            onChange={loadStoryFromFile}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      {/* Breadcrumb navigation */}
      <div className="breadcrumbs">
        {history.length === 0 ? (
          <span>Start of your adventure</span>
        ) : (
          history.map((entry, idx) => (
            <span key={idx} className="breadcrumb-item">
              {entry.choice}
              {idx < history.length - 1 && ' > '}
            </span>
          ))
        )}
      </div>

      {/* Story content */}
      <div className="story-content">
        <div className="story-text">
          {currentNode.text || "This part of the story hasn't been written yet."}
        </div>
        
        {/* Edit button for story text */}
        <button 
          className="edit-button"
          onClick={() => startEdit('text', currentNode.text)}
        >
          Edit Story Text
        </button>
      </div>

      {/* Choice buttons */}
      <div className="choice-buttons">
        {currentNode.options && currentNode.options.length > 0 ? (
          currentNode.options.map((option, index) => (
            <div key={index} className="choice-item">
              <button 
                className="choice-button"
                onClick={() => handleChoice(option)}
              >
                {option.text}
              </button>
              <button 
                className="edit-option-button"
                onClick={() => startEdit('options', option.text, index)}
              >
                Edit
              </button>
            </div>
          ))
        ) : (
          <p className="no-options">No choices available at this point.</p>
        )}
        
        {/* Add new option button */}
        <button 
          className="add-option-button"
          onClick={() => startEdit('add-option')}
        >
          Add New Choice
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="navigation-buttons">
        <button 
          className="nav-button"
          onClick={goBack}
          disabled={history.length === 0}
        >
          Go Back
        </button>
        <button 
          className="nav-button"
          onClick={resetStory}
        >
          Reset Story
        </button>
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div className="edit-modal">
          <div className="edit-content">
            <h3>
              {editMode === 'text' && 'Edit Story Text'}
              {editMode === 'options' && 'Edit Choice'}
              {editMode === 'add-option' && 'Add New Choice'}
            </h3>
            
            {editMode === 'add-option' ? (
              <div className="edit-form">
                <input
                  type="text"
                  placeholder="Enter new choice text..."
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  className="edit-input"
                />
                <div className="edit-buttons">
                  <button onClick={handleAddOption} disabled={!newOptionText.trim()}>
                    Add Choice
                  </button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="edit-form">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-textarea"
                  placeholder="Enter text..."
                  rows={4}
                />
                <div className="edit-buttons">
                  <button onClick={() => editMode === 'text' ? handleEditText() : handleEditOption(editingOptionIndex)}>
                    Save
                  </button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Choice modal for new options */}
      {showChoiceModal && pendingChoice && (
        <div className="choice-modal">
          <div className="choice-content">
            <h3>Add New Choice</h3>
            <p><strong>Choice Text:</strong> {pendingChoice.text}</p>
            
            <div className="choice-options">
              <button onClick={createNewNode} className="create-new-button">
                ➕ Create New Node
              </button>
              
              {pendingChoice.existingNodes.length > 0 && (
                <div className="link-to-existing">
                  <h4>Link to Existing Node:</h4>
                  <div className="existing-nodes-list">
                    {pendingChoice.existingNodes.map(nodeId => (
                      <button 
                        key={nodeId}
                        onClick={() => linkToExistingNode(nodeId)}
                        className="existing-node-button"
                      >
                        <strong>{nodeId}</strong>
                        <small>{story[nodeId].text || "Empty node"}</small>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button onClick={cancelEdit} className="cancel-choice-button">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
