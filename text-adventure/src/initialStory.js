import { getDefaultAppCode } from './appTemplate.js';

// Default code template for new nodes - now contains complete application code
export const defaultNodeCode = getDefaultAppCode();

// Story data structure
export const initialStory = {
  "start": {
    id: "start",
    text: "You find yourself standing at the entrance of a mysterious cave. The air is thick with anticipation, and you can hear distant sounds echoing from within. Two paths lie before you, each leading deeper into the darkness.",
    options: [
      { text: "Take the left path", nextId: "left-path" },
      { text: "Take the right path", nextId: "right-path" },
      { text: "Examine the cave entrance more closely", nextId: "examine" }
    ],
    code: { ...defaultNodeCode }
  },
  "left-path": {
    id: "left-path",
    text: "The left path leads you into a chamber filled with ancient runes carved into the walls. The air is warmer here, and you notice a faint glow emanating from deeper within.",
    options: [
      { text: "Study the runes", nextId: "study-runes" },
      { text: "Follow the glow", nextId: "follow-glow" },
      { text: "Go back to the entrance", nextId: "start" }
    ],
    code: { ...defaultNodeCode }
  },
  "right-path": {
    id: "right-path",
    text: "The right path opens into a vast cavern with a crystal-clear underground lake. The water reflects light from above, creating a mesmerizing display of colors on the cave walls.",
    options: [
      { text: "Swim across the lake", nextId: "swim-lake" },
      { text: "Walk around the lake", nextId: "walk-around" },
      { text: "Go back to the entrance", nextId: "start" }
    ],
    code: { ...defaultNodeCode }
  },
  "examine": {
    id: "examine",
    text: "Looking more closely at the cave entrance, you discover a hidden inscription that reads 'Only the brave shall find the treasure within.' You also notice a small alcove that might contain something useful.",
    options: [
      { text: "Search the alcove", nextId: "search-alcove" },
      { text: "Take the left path", nextId: "left-path" },
      { text: "Take the right path", nextId: "right-path" }
    ],
    code: { ...defaultNodeCode }
  },
  "study-runes": {
    id: "study-runes",
    text: "As you study the runes, they begin to glow with an otherworldly light. The ancient text reveals a prophecy about a chosen one who will restore balance to the world. You feel a strange power coursing through your veins.",
    options: [
      { text: "Accept the power", nextId: "accept-power" },
      { text: "Reject the power", nextId: "reject-power" },
      { text: "Continue deeper", nextId: "follow-glow" }
    ],
    code: { ...defaultNodeCode }
  },
  "follow-glow": {
    id: "follow-glow",
    text: "Following the glow, you discover a chamber filled with precious gems and ancient artifacts. At the center stands a pedestal with a mysterious orb that pulses with energy.",
    options: [
      { text: "Take the orb", nextId: "take-orb" },
      { text: "Examine the artifacts", nextId: "examine-artifacts" },
      { text: "Leave everything as is", nextId: "leave-chamber" }
    ],
    code: { ...defaultNodeCode }
  },
  "swim-lake": {
    id: "swim-lake",
    text: "The water is surprisingly warm and inviting. As you swim, you notice the lake is much deeper than it appears. Suddenly, you see something large moving beneath the surface.",
    options: [
      { text: "Dive deeper to investigate", nextId: "dive-deeper" },
      { text: "Swim faster to the other side", nextId: "swim-fast" },
      { text: "Return to shore", nextId: "right-path" }
    ],
    code: { ...defaultNodeCode }
  },
  "walk-around": {
    id: "walk-around",
    text: "Walking around the lake, you discover a hidden passage behind a waterfall. The sound of rushing water masks any other sounds, but you can see light coming from within the passage.",
    options: [
      { text: "Enter the passage", nextId: "waterfall-passage" },
      { text: "Continue around the lake", nextId: "continue-around" },
      { text: "Return to the lake", nextId: "right-path" }
    ],
    code: { ...defaultNodeCode }
  },
  "search-alcove": {
    id: "search-alcove",
    text: "In the alcove, you find an old leather satchel containing a map, a compass, and a small vial of glowing liquid. The map shows the layout of the cave system, but some areas are marked with warnings.",
    options: [
      { text: "Use the map to navigate", nextId: "use-map" },
      { text: "Drink the glowing liquid", nextId: "drink-liquid" },
      { text: "Take the satchel and continue", nextId: "take-satchel" }
    ],
    code: { ...defaultNodeCode }
  },
  "accept-power": {
    id: "accept-power",
    text: "As you accept the power, the runes flare brightly and you feel incredible energy flowing through you. You now understand the ancient language and can sense the presence of other magical beings in the cave.",
    options: [
      { text: "Use your new powers to explore", nextId: "use-powers" },
      { text: "Seek out the other magical beings", nextId: "seek-beings" },
      { text: "Continue to the treasure chamber", nextId: "follow-glow" }
    ],
    code: { ...defaultNodeCode }
  },
  "reject-power": {
    id: "reject-power",
    text: "You choose to reject the power, and the runes fade back to their dormant state. You feel a sense of peace and clarity, knowing that some things are better left untouched.",
    options: [
      { text: "Continue exploring without power", nextId: "follow-glow" },
      { text: "Return to the entrance", nextId: "start" },
      { text: "Search for another way", nextId: "search-alcove" }
    ],
    code: { ...defaultNodeCode }
  },
  "take-orb": {
    id: "take-orb",
    text: "As you grasp the orb, it begins to float above your hand and projects images of the cave's history. You see ancient civilizations, great battles, and the creation of this very chamber. The orb chooses you as its guardian.",
    options: [
      { text: "Accept guardianship", nextId: "accept-guardianship" },
      { text: "Return the orb", nextId: "return-orb" },
      { text: "Use the orb's power", nextId: "use-orb-power" }
    ],
    code: { ...defaultNodeCode }
  },
  "examine-artifacts": {
    id: "examine-artifacts",
    text: "The artifacts tell a story of a great civilization that once thrived here. You find scrolls, weapons, and jewelry, each with its own history. One particular scroll seems to contain a spell or ritual.",
    options: [
      { text: "Read the scroll", nextId: "read-scroll" },
      { text: "Take some artifacts", nextId: "take-artifacts" },
      { text: "Leave everything undisturbed", nextId: "leave-chamber" }
    ],
    code: { ...defaultNodeCode }
  },
  "leave-chamber": {
    id: "leave-chamber",
    text: "You choose to leave the chamber untouched, respecting the ancient site. As you exit, you feel a sense of accomplishment for having discovered this place without disturbing its treasures.",
    options: [
      { text: "Return to the entrance", nextId: "start" },
      { text: "Explore other areas", nextId: "left-path" },
      { text: "End your adventure", nextId: "end" }
    ],
    code: { ...defaultNodeCode }
  },
  "end": {
    id: "end",
    text: "",
    options: [
      { text: "Start a new adventure", nextId: "start" }
    ],
    code: { ...defaultNodeCode }
  },
  "dive-deeper": {
    id: "dive-deeper",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "swim-fast": {
    id: "swim-fast",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "waterfall-passage": {
    id: "waterfall-passage",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "continue-around": {
    id: "continue-around",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "use-map": {
    id: "use-map",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "drink-liquid": {
    id: "drink-liquid",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "take-satchel": {
    id: "take-satchel",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "use-powers": {
    id: "use-powers",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "seek-beings": {
    id: "seek-beings",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "accept-guardianship": {
    id: "accept-guardianship",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "return-orb": {
    id: "return-orb",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "use-orb-power": {
    id: "use-orb-power",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "read-scroll": {
    id: "read-scroll",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  },
  "take-artifacts": {
    id: "take-artifacts",
    text: "",
    options: [],
    code: { ...defaultNodeCode }
  }
};