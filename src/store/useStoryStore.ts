import { create } from 'zustand';
import { Story, StoryCharacter, CustomizedStory, StoryPage, StoryPrompt } from '../types/story';
import { presetStories } from '../data/presetStories';

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
    
    try {
      // First, generate the character image
      const characterImageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          scene: 'Generate a character portrait',
          pageNumber: 0,
          isCharacterImage: true
        })
      });
      
      if (!characterImageResponse.ok) {
        throw new Error('Failed to generate character image');
      }
      
      const { imageUrl: characterImageUrl } = await characterImageResponse.json();
      
      // Call the story generation API
      const storyResponse = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          prompt: {
            theme: 'adventure',
            setting: 'magical world',
            additionalDetails: 'A story about friendship and discovery'
          }
        })
      });
      
      if (!storyResponse.ok) {
        throw new Error('Failed to generate story');
      }
      
      const { content } = await storyResponse.json();
      
      // Split the story into pages (approximately 100 words per page)
      const paragraphs = content.split('\n\n').filter((p: string) => p.trim());
      const pages: StoryPage[] = [];
      
      let currentPageText = '';
      let pageId = 1;
      
      for (const paragraph of paragraphs) {
        if ((currentPageText + paragraph).split(' ').length > 100) {
          // Generate video for the current page using the character image
          const videoResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character: currentCharacter,
              scene: currentPageText,
              pageNumber: pageId,
              characterImageUrl,
              isCharacterImage: false
            })
          });
          
          if (!videoResponse.ok) {
            throw new Error('Failed to generate video');
          }
          
          const { videoUrl } = await videoResponse.json();
          
          // Create a new page with the accumulated text
          pages.push({
            id: pageId++,
            text: currentPageText.trim(),
            image: characterImageUrl,
            video: videoUrl,
            interactions: []
          });
          currentPageText = paragraph;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + paragraph;
        }
      }
      
      // Add the last page if there's remaining text
      if (currentPageText.trim()) {
        const videoResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character: currentCharacter,
            scene: currentPageText,
            pageNumber: pageId,
            characterImageUrl,
            isCharacterImage: false
          })
        });
        
        if (!videoResponse.ok) {
          throw new Error('Failed to generate video');
        }
        
        const { videoUrl } = await videoResponse.json();
        
        pages.push({
          id: pageId,
          text: currentPageText.trim(),
          image: characterImageUrl,
          video: videoUrl,
          interactions: []
        });
      }
      
      set({ currentPages: pages, isGenerating: false });
    } catch (error) {
      console.error('Error generating story:', error);
      set({ isGenerating: false });
      throw error;
    }
  },
  
  generateCustomStory: async (prompt: StoryPrompt) => {
    const { currentCharacter } = get();
    
    if (!currentCharacter) {
      console.error('Cannot generate story: missing character');
      return;
    }
    
    set({ isGenerating: true });
    
    try {
      // First, generate the character image
      const characterImageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          scene: 'Generate a character portrait',
          pageNumber: 0,
          isCharacterImage: true
        })
      });
      
      if (!characterImageResponse.ok) {
        throw new Error('Failed to generate character image');
      }
      
      const { imageUrl: characterImageUrl } = await characterImageResponse.json();
      
      // Call the story generation API
      const storyResponse = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: currentCharacter,
          prompt: {
            theme: prompt.theme || 'adventure',
            setting: prompt.setting || 'magical forest',
            additionalDetails: prompt.customPrompt || 
              (prompt.characters?.length ? `Additional characters: ${prompt.characters.join(', ')}` : '') +
              (prompt.plotElements?.length ? `\nPlot elements: ${prompt.plotElements.join(', ')}` : '')
          }
        })
      });
      
      if (!storyResponse.ok) {
        throw new Error('Failed to generate story');
      }
      
      const { content } = await storyResponse.json();
      
      // Split the story into pages (approximately 100 words per page)
      const paragraphs = content.split('\n\n').filter((p: string) => p.trim());
      const pages: StoryPage[] = [];
      
      let currentPageText = '';
      let pageId = 1;
      
      for (const paragraph of paragraphs) {
        if ((currentPageText + paragraph).split(' ').length > 100) {
          // Generate video for the current page using the character image
          const videoResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character: currentCharacter,
              scene: currentPageText,
              pageNumber: pageId,
              characterImageUrl,
              isCharacterImage: false
            })
          });
          
          if (!videoResponse.ok) {
            throw new Error('Failed to generate video');
          }
          
          const { videoUrl } = await videoResponse.json();
          
          // Create a new page with the accumulated text
          pages.push({
            id: pageId++,
            text: currentPageText.trim(),
            image: characterImageUrl,
            video: videoUrl,
            interactions: []
          });
          currentPageText = paragraph;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + paragraph;
        }
      }
      
      // Add the last page if there's remaining text
      if (currentPageText.trim()) {
        const videoResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character: currentCharacter,
            scene: currentPageText,
            pageNumber: pageId,
            characterImageUrl,
            isCharacterImage: false
          })
        });
        
        if (!videoResponse.ok) {
          throw new Error('Failed to generate video');
        }
        
        const { videoUrl } = await videoResponse.json();
        
        pages.push({
          id: pageId,
          text: currentPageText.trim(),
          image: characterImageUrl,
          video: videoUrl,
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