export interface Story {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  ageRange: string;
  isPreset: boolean;
}

export interface StoryPage {
  id: number;
  text: string;
  image: string;
  video?: string | null;
  interactions?: Interaction[];
}

export interface Interaction {
  id: string;
  type: 'click' | 'hover' | 'drag';
  targetElement: string;
  action: 'sound' | 'animation' | 'reveal';
  content: string;
  position?: { x: number; y: number };
}

export interface StoryCharacter {
  name: string;
  gender: 'boy' | 'girl' | 'neutral';
  age?: number;
  photo?: string;
  styledImage?: string;
  artStyle?: 'watercolor' | 'cartoon' | 'pixar' | 'anime' | 'storybook';
}

export interface StoryPrompt {
  theme?: string;
  setting?: string;
  characters?: string[];
  plotElements?: string[];
  customPrompt?: string;
  voiceId?: string;
}

export interface CustomizedStory {
  storyId: string;
  character: StoryCharacter;
  pages: StoryPage[];
  dateCreated: Date;
  prompt?: StoryPrompt;
  title?: string;
}