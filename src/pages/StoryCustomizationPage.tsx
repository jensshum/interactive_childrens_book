import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStoryStore } from '../store/useStoryStore';
import StoryCard from '../components/story/StoryCard';
import CharacterForm from '../components/story/CharacterForm';
import StoryPromptForm from '../components/story/StoryPromptForm';
import { StoryCharacter, StoryPrompt } from '../types/story';

type Step = 'select' | 'customize' | 'prompt' | 'preview';

export default function StoryCustomizationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get('story');
  
  const { 
    presetStories, 
    selectStory, 
    selectedStory, 
    setCharacter, 
    generateStory,
    generateCustomStory,
    isGenerating,
    currentPages,
    saveCustomStory
  } = useStoryStore();
  
  const [step, setStep] = useState<Step>(storyId ? 'customize' : 'select');
  const [character, setCharacterState] = useState<StoryCharacter | null>(null);
  
  useEffect(() => {
    document.title = "Create a Story - StoryPals";
    
    if (storyId) {
      selectStory(storyId);
    }
  }, [storyId, selectStory]);
  
  const handleStorySelect = (id: string) => {
    selectStory(id);
    setStep('customize');
  };
  
  const handleCharacterSubmit = async (char: StoryCharacter) => {
    setCharacter(char);
    setCharacterState(char);
    
    if (selectedStory?.isPreset) {
      await generateStory();
      saveCustomStory();
      navigate('/read/latest');
    } else {
      setStep('prompt');
    }
  };
  
  const handlePromptSubmit = async (prompt: StoryPrompt) => {
    if (!character) return;
    
    await generateCustomStory(prompt);
    saveCustomStory();
    navigate('/read/latest');
  };
  
  const getStepTitle = () => {
    switch (step) {
      case 'select':
        return 'Choose a Story';
      case 'customize':
        return 'Personalize Your Story';
      case 'prompt':
        return 'Create Your Adventure';
      case 'preview':
        return 'Preview Your Story';
      default:
        return '';
    }
  };
  
  const getStepDescription = () => {
    switch (step) {
      case 'select':
        return 'Select a story to customize for your child';
      case 'customize':
        return 'Make your child the star of this adventure';
      case 'prompt':
        return 'Tell us what kind of story you want to create';
      case 'preview':
        return 'Review your personalized storybook before reading';
      default:
        return '';
    }
  };
  
  return (
    <div className="container mx-auto px-6 md:px-8 py-12">
      <div className="flex items-center mb-8">
        {step !== 'select' && (
          <button
            onClick={() => setStep(step === 'prompt' ? 'customize' : 'select')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
        )}
        
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-800">
            {getStepTitle()}
          </h1>
          <p className="text-gray-600 mt-2">
            {getStepDescription()}
          </p>
        </div>
      </div>
      
      {step === 'select' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {presetStories.map((story) => (
              <StoryCard 
                key={story.id} 
                story={story} 
                onClick={() => handleStorySelect(story.id)}
              />
            ))}
          </div>
          
          <div className="mt-12 p-8 bg-secondary-50 rounded-xl text-center">
            <h3 className="text-xl font-display font-bold text-gray-800 mb-2 flex items-center justify-center">
              <Sparkles size={20} className="mr-2 text-secondary-500" />
              Create a Brand New Story
            </h3>
            <p className="text-gray-600 mb-4">
              Want something completely original? Let our AI create a unique adventure!
            </p>
            <button 
              onClick={() => {
                selectStory('custom');
                setStep('customize');
              }}
              className="inline-flex items-center space-x-2 bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <BookOpen size={18} />
              <span>Start from Scratch</span>
            </button>
          </div>
        </motion.div>
      )}
      
      {step === 'customize' && selectedStory && (
        <div className="flex flex-col md:flex-row md:items-start md:space-x-8">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <h3 className="font-display font-bold text-xl text-gray-800 mb-4">Selected Story</h3>
              <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src={selectedStory.coverImage} 
                  alt={selectedStory.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-display font-bold text-lg text-gray-800 mb-2">{selectedStory.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{selectedStory.description}</p>
              <div className="text-sm text-gray-500">Recommended for ages {selectedStory.ageRange}</div>
            </motion.div>
          </div>
          
          <div className="md:w-2/3">
            <CharacterForm 
              onSubmit={handleCharacterSubmit}
              isLoading={isGenerating}
            />
          </div>
        </div>
      )}
      
      {step === 'prompt' && (
        <StoryPromptForm
          onSubmit={handlePromptSubmit}
          isLoading={isGenerating}
        />
      )}
    </div>
  );
}