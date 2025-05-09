import { create } from 'zustand';
import { Story, StoryCharacter, CustomizedStory, StoryPage, StoryPrompt } from '../types/story';
import { presetStories } from '../data/presetStories';
import { v4 as uuidv4 } from 'uuid';

interface StoryState {
  presetStories: Story[];
  customStories: CustomizedStory[];
  selectedStory: Story | null;
  currentCharacter: StoryCharacter | null;
  currentPages: StoryPage[];
  isGenerating: boolean;
  debugMode: boolean;
  saveError: string | null;
  
  // Actions
  selectStory: (storyId: string) => void;
  setCharacter: (character: StoryCharacter) => void;
  generateStory: () => Promise<void>;
  generateCustomStory: (prompt: StoryPrompt) => Promise<void>;
  saveCustomStory: (userId: string) => Promise<void>;
  getStoryById: (storyId: string) => CustomizedStory | null;
  setDebugMode: (enabled: boolean) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  presetStories: presetStories,
  customStories: [],
  selectedStory: null,
  currentCharacter: null,
  currentPages: [],
  isGenerating: false,
  debugMode: true,
  saveError: null,
  
  selectStory: (storyId: string) => {
    const story = get().presetStories.find(s => s.id === storyId) || {
      id: 'custom',
      title: 'Custom Story',
      description: 'Create your own unique adventure with AI-powered storytelling.',
      coverImage: 'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      ageRange: '4-10',
      isPreset: false,
      prompt: {} // Initialize empty prompt object
    };
    set({ selectedStory: story });
  },
  
  setCharacter: (character: StoryCharacter) => {
    set({ currentCharacter: character });
  },
  
  generateStory: async () => {
    const { selectedStory, currentCharacter, debugMode } = get();
    
    if (!selectedStory || !currentCharacter) {
      console.error('Cannot generate story: missing story or character');
      return;
    }
    
    set({ isGenerating: true });
    
    try {
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
          // Generate image for the current page
          const imageResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character: {
                ...currentCharacter,
                photo: currentCharacter.styledImage || currentCharacter.photo // Use styled image if available
              },
              scene: currentPageText,
              pageNumber: pageId,
              debugMode
            })
          });
          
          if (!imageResponse.ok) {
            throw new Error('Failed to generate image');
          }
          
          const { imageUrl, videoUrl } = await imageResponse.json();
          
          console.log(`Generated page ${pageId} image using ${currentCharacter.styledImage ? 'styled' : 'original'} character image`);
          
          // Create a new page with the accumulated text
          pages.push({
            id: pageId++,
            text: currentPageText.trim(),
            image: imageUrl,
            video: debugMode ? null : videoUrl,
            interactions: []
          });
          currentPageText = paragraph;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + paragraph;
        }
      }
      
      // Add the last page if there's remaining text
      if (currentPageText.trim()) {
        const imageResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character: {
              ...currentCharacter,
              photo: currentCharacter.styledImage || currentCharacter.photo // Use styled image if available
            },
            scene: currentPageText,
            pageNumber: pageId,
            debugMode
          })
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to generate image');
        }
        
        const { imageUrl, videoUrl } = await imageResponse.json();
        
        pages.push({
          id: pageId,
          text: currentPageText.trim(),
          image: imageUrl,
          video: debugMode ? null : videoUrl,
          interactions: []
        });
      }
      
      set({ currentPages: pages, isGenerating: false });
    } catch (error) {
      console.error('Error generating story:', error);
      set({ saveError: 'Failed to generate story. Please try again.' });
    } finally {
      set({ isGenerating: false });
    }
  },
  
  generateCustomStory: async (prompt: StoryPrompt) => {
    const { currentCharacter, debugMode } = get();
    
    if (!currentCharacter) {
      console.error('Cannot generate story: missing character');
      return;
    }
    
    set({ isGenerating: true });
    
    try {
      // Update selectedStory with the prompt including voiceId
      set(state => ({
        selectedStory: state.selectedStory ? {
          ...state.selectedStory,
          prompt: {
            ...state.selectedStory.prompt,
            voiceId: prompt.voiceId
          }
        } : null
      }));

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
          // Generate image for the current page
          const imageResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              character: currentCharacter,
              scene: currentPageText,
              pageNumber: pageId,
              debugMode
            })
          });
          
          if (!imageResponse.ok) {
            throw new Error('Failed to generate image');
          }
          
          const { imageUrl, videoUrl } = await imageResponse.json();
          
          console.log(`Generated page ${pageId} image using ${currentCharacter.styledImage ? 'styled' : 'original'} character image`);
          
          // Create a new page with the accumulated text
          pages.push({
            id: pageId++,
            text: currentPageText.trim(),
            image: imageUrl,
            video: debugMode ? null : videoUrl,
            interactions: []
          });
          currentPageText = paragraph;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + paragraph;
        }
      }
      
      // Add the last page if there's remaining text
      if (currentPageText.trim()) {
        const imageResponse = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character: currentCharacter,
            scene: currentPageText,
            pageNumber: pageId,
            debugMode
          })
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to generate image');
        }
        
        const { imageUrl, videoUrl } = await imageResponse.json();
        
        pages.push({
          id: pageId,
          text: currentPageText.trim(),
          image: imageUrl,
          video: debugMode ? null : videoUrl,
          interactions: []
        });
      }
      
      set({ currentPages: pages, isGenerating: false });
    } catch (error) {
      console.error('Error generating custom story:', error);
      set({ saveError: 'Failed to generate story. Please try again.' });
    } finally {
      set({ isGenerating: false });
    }
  },
  
  saveCustomStory: async (userId: string) => {
    const { currentCharacter, currentPages, selectedStory } = get();

    if (!currentCharacter || !currentPages.length) {
      set({ saveError: 'No story to save' });
      return;
    }

    console.log("SELECTED STORY", selectedStory?.prompt?.voiceId);
    try {
      const storyToSave = {
        id: uuidv4(),
        user_id: userId,
        story_id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: selectedStory?.title || 'Untitled Story',
        character: currentCharacter,
        pages: currentPages,
        date_created: new Date().toISOString(),
        voice_id: selectedStory?.prompt?.voiceId
      };

      const response = await fetch('/api/supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story: storyToSave
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save story');
      }

      set({ saveError: null });
    } catch (error) {
      console.error('Error saving story:', error);
      set({ saveError: 'Failed to save story. Please try again.' });
    }
  },
  
  getStoryById: (storyId: string) => {
    return get().customStories.find(s => s.storyId === storyId) || null;
  },
  
  setDebugMode: (enabled: boolean) => {
    set({ debugMode: enabled });
  }
}));