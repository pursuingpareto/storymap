# Choose Your Own Adventure

A dynamic, interactive choose-your-own-adventure application built with React. Users can not only play through branching storylines but also edit and customize the adventure as they go!

## Features

### 🎮 Interactive Storytelling
- **Branching Narratives**: Navigate through complex story paths with multiple choices
- **Story Progression**: Each choice leads to new story content and more decisions
- **Breadcrumb Navigation**: Track your journey through the adventure
- **Go Back Functionality**: Navigate to previous story points

### ✏️ Real-Time Editing
- **Edit Story Text**: Modify the narrative content at any point in the story
- **Edit Choices**: Change the available options for any decision point
- **Add New Choices**: Create new story branches on the fly
- **Auto-Save**: All changes are automatically saved to localStorage

### 🎨 Modern UI
- **Beautiful Design**: Glassmorphism effects with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Engaging transitions and hover effects
- **Intuitive Interface**: Easy-to-use editing modals and controls

## How to Use

### Playing the Adventure
1. **Start the Story**: Begin at the cave entrance and read the story text
2. **Make Choices**: Click on any choice button to progress the story
3. **Navigate**: Use the breadcrumb trail to see your path
4. **Go Back**: Use the "Go Back" button to return to previous decisions
5. **Reset**: Start over with the "Reset Story" button

### Editing the Adventure
1. **Edit Story Text**: Click the "Edit Story Text" button to modify the current story content
2. **Edit Choices**: Click the "Edit" button next to any choice to modify it
3. **Add New Choices**: Click "Add New Choice" to create a new story branch
4. **Save Changes**: All edits are automatically saved and persist between sessions

### Story Structure
Each story node contains:
- **Text**: The narrative content for that point in the story
- **Options**: Array of choices with text and next node IDs
- **ID**: Unique identifier for the story node

## Technical Details

### Built With
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **localStorage**: Persistent data storage for story changes

### Data Structure
```javascript
{
  "nodeId": {
    id: "nodeId",
    text: "Story content...",
    options: [
      { text: "Choice text", nextId: "nextNodeId" }
    ]
  }
}
```

### Key Components
- **Story Navigation**: Handles story progression and history
- **Edit Modal**: Provides editing interface for story content and choices
- **Choice Buttons**: Interactive story decision points
- **Breadcrumb Trail**: Visual story path tracking

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

4. **Start Playing**: Begin your adventure and customize it as you go!

## Customization

The application comes with a pre-built adventure about exploring a mysterious cave, but you can:
- Edit any story text to create your own narrative
- Modify existing choices to change story paths
- Add new choices to expand the adventure
- Create entirely new story branches

All changes are automatically saved and will persist when you reload the page.

## Future Enhancements

Potential features for future versions:
- Export/import story data
- Multiple story themes
- Character stats and inventory
- Sound effects and music
- Collaborative story editing
- Story templates and examples

Enjoy creating and playing your own choose-your-own-adventure stories! 🚀
