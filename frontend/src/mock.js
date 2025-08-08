// Mock data for manga creation engine

export const mockScripts = [
  {
    id: '1',
    title: 'The Rising Hero',
    style: 'shounen',
    content: `[SCENE: Mountain Training Ground - Dawn]
[CHARACTER: Akira - Young warrior with spiky black hair, determined expression]
[ACTION: Akira practices sword swings against a waterfall]
[DIALOGUE: Akira] "I must become stronger... for everyone!"

[SCENE: Village Marketplace - Afternoon]
[CHARACTER: Akira, Merchants, Villagers]
[ACTION: Akira walks through busy marketplace, people whisper and point]
[DIALOGUE: Villager] "Is that the boy who's training to become a hero?"
[DIALOGUE: Akira] "I won't let you down..."

[SCENE: Dark Forest - Night]
[CHARACTER: Akira, Shadow Beast - Large creature with glowing red eyes]
[ACTION: Akira draws sword, ready to fight the beast]
[DIALOGUE: Akira] "This is it... my first real test!"`,
    panels: [
      {
        id: 'p1',
        sceneType: 'action',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600',
        dialogue: ["I must become stronger... for everyone!"],
        character: 'Akira',
        mood: 'determined'
      },
      {
        id: 'p2', 
        sceneType: 'social',
        imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=600',
        dialogue: ["Is that the boy who's training to become a hero?", "I won't let you down..."],
        character: 'Akira, Villagers',
        mood: 'hopeful'
      },
      {
        id: 'p3',
        sceneType: 'battle',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600',
        dialogue: ["This is it... my first real test!"],
        character: 'Akira, Shadow Beast',
        mood: 'intense'
      }
    ]
  },
  {
    id: '2',
    title: 'School Romance',
    style: 'shoujo',
    content: `[SCENE: High School Hallway - Morning]
[CHARACTER: Yuki - Shy girl with long brown hair, carrying books]
[ACTION: Yuki drops her books, papers scatter everywhere]
[DIALOGUE: Yuki] "Oh no... I'm going to be late again!"

[SCENE: Same Hallway - Continuous]
[CHARACTER: Yuki, Takeshi - Popular student with gentle smile]
[ACTION: Takeshi helps gather Yuki's scattered papers]
[DIALOGUE: Takeshi] "Here, let me help you with those."
[DIALOGUE: Yuki] "T-thank you... Takeshi-kun"`,
    panels: [
      {
        id: 'p4',
        sceneType: 'slice_of_life',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600',
        dialogue: ["Oh no... I'm going to be late again!"],
        character: 'Yuki',
        mood: 'anxious'
      },
      {
        id: 'p5',
        sceneType: 'romance',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600',
        dialogue: ["Here, let me help you with those.", "T-thank you... Takeshi-kun"],
        character: 'Yuki, Takeshi',
        mood: 'sweet'
      }
    ]
  }
];

export const mangaStyles = [
  {
    id: 'shounen',
    name: 'Shounen',
    description: 'Action-packed adventures with dynamic poses and intense expressions',
    color: '#ff6b35',
    features: ['Dynamic action', 'Bold expressions', 'Epic battles']
  },
  {
    id: 'shoujo',
    name: 'Shoujo', 
    description: 'Romantic stories with soft lines and emotional expressions',
    color: '#ffb3d9',
    features: ['Soft aesthetics', 'Emotional depth', 'Romance focus']
  },
  {
    id: 'seinen',
    name: 'Seinen',
    description: 'Mature themes with realistic art and complex storytelling',
    color: '#2c3e50',
    features: ['Realistic art', 'Complex themes', 'Mature content']
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Light-hearted fun with exaggerated expressions and visual gags',
    color: '#f39c12',
    features: ['Exaggerated expressions', 'Visual gags', 'Light mood']
  },
  {
    id: 'horror',
    name: 'Horror',
    description: 'Dark and suspenseful with eerie atmosphere and dramatic shadows',
    color: '#8b0000',
    features: ['Dark atmosphere', 'Dramatic shadows', 'Suspenseful mood']
  }
];

export const mockCharacters = [
  {
    id: 'char1',
    name: 'Akira',
    description: 'Young warrior with spiky black hair, determined expression',
    imageRef: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200',
    tags: ['protagonist', 'warrior', 'young']
  },
  {
    id: 'char2', 
    name: 'Yuki',
    description: 'Shy girl with long brown hair, carrying books',
    imageRef: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200',
    tags: ['protagonist', 'student', 'shy']
  },
  {
    id: 'char3',
    name: 'Takeshi',
    description: 'Popular student with gentle smile',
    imageRef: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200',
    tags: ['love-interest', 'student', 'popular']
  }
];

export const mockGenerationProgress = {
  currentPanel: 2,
  totalPanels: 5,
  status: 'generating',
  message: 'Generating panel artwork...',
  estimatedTime: 45
};