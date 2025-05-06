import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Share2, Loader2, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoryStore } from '../store/useStoryStore';
import StoryBookReader from '../components/story/StoryBookReader';
import { saveStoryToSupabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function StoryReadingPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { customStories, selectedStory, currentCharacter, currentPages, debugMode, setDebugMode } = useStoryStore();
  const { user } = useAuth();
  
  const [story, setStory] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Reading Story - StoryPals";
    
    if (storyId === 'latest' && currentPages.length > 0 && currentCharacter) {
      setStory({
        title: selectedStory?.title || 'Your Story',
        character: currentCharacter,
        pages: currentPages
      });
    } else if (storyId && storyId !== 'latest') {
      const foundStory = customStories.find(s => s.storyId === storyId);
      if (foundStory) {
        setStory({
          title: selectedStory?.title || 'Your Story',
          character: foundStory.character,
          pages: foundStory.pages
        });
      }
    } else {
      navigate('/');
    }
  }, [storyId, customStories, currentPages, currentCharacter, selectedStory, navigate]);
  
  const handleSaveStory = async () => {
    if (!user) {
      setSaveError('Please sign in to save your story');
      return;
    }

    if (!story) {
      setSaveError('No story to save');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const storyToSave = {
        storyId: storyId || `custom-${Date.now()}`,
        character: story.character,
        pages: story.pages,
        dateCreated: new Date(),
        title: story.title
      };

      await saveStoryToSupabase(storyToSave, user.id);
      // Show success message or redirect
      navigate('/my-stories');
    } catch (error) {
      console.error('Error saving story:', error);
      setSaveError('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!story) {
    return (
      <div className="container mx-auto px-6 md:px-8 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full max-w-2xl"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link 
              to="/"
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center"
            >
              <ArrowLeft size={20} className="text-gray-600" />
              <span className="ml-1 text-gray-600">Back</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
              {story.character.name}'s Adventure: {story.title}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`p-2 rounded-full transition-colors ${
                debugMode ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={debugMode ? 'Disable debug mode' : 'Enable debug mode'}
            >
              <Bug size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={handleSaveStory}
              disabled={isSaving}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  <span className="hidden md:inline">Saving...</span>
                </>
              ) : (
                <>
                  <BookOpen size={18} className="mr-2" />
                  <span className="hidden md:inline">Save Story</span>
                </>
              )}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {saveError}
          </div>
        )}
        
        <StoryBookReader 
          pages={story.pages} 
          characterName={story.character.name}
          voiceId={story.voiceId}
        />
      </motion.div>
    </div>
  );
}