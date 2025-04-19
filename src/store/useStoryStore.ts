import { create } from 'zustand';
import { Story, StoryCharacter, CustomizedStory, StoryPage, StoryPrompt } from '../types/story';
import { presetStories } from '../data/presetStories';
import { generateStoryContent, generateStoryImage } from '../utils/fal';

interface StoryState {
  presetStories: Story[];
  customStories: CustomizedStory[];
  selectedStory: Story | null;
  currentCharacter: StoryCharacter | null;
  currentPages: StoryPage[];
  isGenerating: boolean;
  
  // Actions
  selectStory: (storyId: string) => void;
  setCharacter: (character: StoryCharacter) => void;
  generateStory: () => Promise<void>;
  generateCustomStory: (prompt: StoryPrompt) => Promise<void>;
  saveCustomStory: () => void;
  getStoryById: (storyId: string) => CustomizedStory | null;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  presetStories: presetStories,
  customStories: [],
  selectedStory: null,
  currentCharacter: null,
  currentPages: [],
  isGenerating: false,
  
  selectStory: (storyId: string) => {
    const story = get().presetStories.find(s => s.id === storyId) || {
      id: 'custom',
      title: 'Custom Story',
      description: 'Create your own unique adventure with AI-powered storytelling.',
      coverImage: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      ageRange: '4-10',
      isPreset: false
    };
    set({ selectedStory: story });
  },
  
  setCharacter: (character: StoryCharacter) => {
    set({ currentCharacter: character });
  },
  
  generateStory: async () => {
    const { selectedStory, currentCharacter } = get();
    
    if (!selectedStory || !currentCharacter) {
      console.error('Cannot generate story: missing story or character');
      return;
    }
    
    set({ isGenerating: true });
    
    // In a real app, this would call an API with Gemini
    // For now, we'll simulate with a timeout and dummy data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate dummy pages based on selected story and character
    const generatedPages: StoryPage[] = [
      {
        id: 1,
        text: `Once upon a time, there was a child named ${currentCharacter.name} who lived in a small village. ${currentCharacter.name} was known for being kind and curious.`,
        image: 'https://images.pexels.com/photos/2781760/pexels-photo-2781760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        interactions: [
          {
            id: 'int1',
            type: 'click',
            targetElement: 'butterfly',
            action: 'animation',
            content: 'butterfly-flutter',
            position: { x: 70, y: 30 }
          }
        ]
      },
      {
        id: 2,
        text: `One day, ${currentCharacter.name} was walking through the forest when something magical happened. The trees seemed to whisper ${currentCharacter.name}'s name.`,
        image: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        interactions: [
          {
            id: 'int2',
            type: 'hover',
            targetElement: 'tree',
            action: 'sound',
            content: 'wind-rustle',
            position: { x: 40, y: 50 }
          }
        ]
      },
      {
        id: 3,
        text: `${currentCharacter.name} discovered a hidden door behind a waterfall. Behind it was a world full of adventures waiting to be explored.`,
        image: 'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        interactions: [
          {
            id: 'int3',
            type: 'click',
            targetElement: 'door',
            action: 'reveal',
            content: 'glow-effect',
            position: { x: 60, y: 45 }
          }
        ]
      },
      {
        id: 4,
        text: `The magical land was filled with friendly creatures who welcomed ${currentCharacter.name} with open arms. They had been waiting for someone brave like ${currentCharacter.name}.`,
        image: 'https://images.pexels.com/photos/3801089/pexels-photo-3801089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        interactions: []
      },
      {
        id: 5,
        text: `${currentCharacter.name} had many exciting adventures, made new friends, and learned important lessons about courage and kindness.`,
        image: 'https://images.pexels.com/photos/747964/pexels-photo-747964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        interactions: []
      },
      {
        id: 6,
        text: `And so, ${currentCharacter.name} returned home with wonderful stories to tell and memories to cherish forever. The End.`,
        image: 'https://images.pexels.com/photos/3049121/pexels-photo-3049121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        interactions: []
      }
    ];
    
    set({ currentPages: generatedPages, isGenerating: false });
  },
  
  generateCustomStory: async (prompt: StoryPrompt) => {
    const { currentCharacter } = get();
    
    if (!currentCharacter) {
      console.error('Cannot generate story: missing character');
      return;
    }
    
    set({ isGenerating: true });
    
    try {
      // Generate story content using Gemini
      const storyContent = await generateStoryContent(currentCharacter, {
        theme: prompt.theme || 'adventure',
        setting: prompt.setting || 'magical forest',
        additionalDetails: prompt.customPrompt || 
          (prompt.characters?.length ? `Additional characters: ${prompt.characters.join(', ')}` : '') +
          (prompt.plotElements?.length ? `\nPlot elements: ${prompt.plotElements.join(', ')}` : '')
      });
      
      // Split the story into pages (approximately 100 words per page)
      const paragraphs = storyContent.split('\n\n').filter(p => p.trim());
      const pages: StoryPage[] = [];
      
      let currentPageText = '';
      let pageId = 1;
      
      for (const paragraph of paragraphs) {
        if ((currentPageText + paragraph).split(' ').length > 100) {
          // Generate image for the current page
          const imageUrl = await generateStoryImage(currentCharacter, currentPageText, pageId);
          
          // Create a new page with the accumulated text
          pages.push({
            id: pageId++,
            text: currentPageText.trim(),
            image: imageUrl,
            interactions: []
          });
          currentPageText = paragraph;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + paragraph;
        }
      }
      
      // Add the last page if there's remaining text
      if (currentPageText.trim()) {
        const imageUrl = await generateStoryImage(currentCharacter, currentPageText, pageId);
        pages.push({
          id: pageId,
          text: currentPageText.trim(),
          image: imageUrl,
          interactions: []
        });
      }
      
      set({ currentPages: pages, isGenerating: false });
    } catch (error) {
      console.error('Error generating custom story:', error);
      set({ isGenerating: false });
      throw error;
    }
  },
  
  saveCustomStory: () => {
    const { selectedStory, currentCharacter, currentPages } = get();
    
    if (!selectedStory || !currentCharacter || currentPages.length === 0) {
      console.error('Cannot save story: missing data');
      return;
    }
    
    const customStory: CustomizedStory = {
      storyId: `custom-${Date.now()}`,
      character: currentCharacter,
      pages: currentPages,
      dateCreated: new Date()
    };
    
    set(state => ({
      customStories: [...state.customStories, customStory]
    }));
  },
  
  getStoryById: (storyId: string) => {
    return get().customStories.find(s => s.storyId === storyId) || null;
  }
}));