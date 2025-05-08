import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Share2, Loader2, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoryStore } from '../store/useStoryStore';
import StoryBookReader from '../components/story/StoryBookReader';
import { saveStoryToSupabase, API_BASE_URL } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CustomizedStory } from '../types/story';

export default function StoryReadingPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { customStories, selectedStory, currentCharacter, currentPages, debugMode, setDebugMode } = useStoryStore();
  const { user } = useAuth();
  
  const [story, setStory] = useState<CustomizedStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  useEffect(() => {
    document.title = "Reading Story - StoryPals";
    
    const loadStory = async () => {
      if (storyId === 'latest' && currentPages.length > 0 && currentCharacter) {
        setStory({
          storyId: 'latest',
          title: selectedStory?.title || 'Your Story',
          character: currentCharacter,
          pages: currentPages,
          dateCreated: new Date()
        });
        setIsLoading(false);
      } else if (storyId && storyId !== 'latest' && user) {
        try {
          console.log('Loading story with ID:', storyId);
          const response = await fetch(`${API_BASE_URL}?userId=${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch stories');
          
          const { data } = await response.json();
          console.log('API Response data:', data);
          const foundStory = data.find((s: any) => s.story_id === storyId);
          console.log('Found story:', foundStory);
          
          if (foundStory) {
            setStory({
              storyId: foundStory.story_id,
              title: foundStory.title || 'Untitled Story',
              character: foundStory.character,
              pages: foundStory.pages,
              dateCreated: new Date(foundStory.date_created),
              prompt: foundStory.prompt
            });
          } else {
            console.log('No story found with ID:', storyId);
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading story:', error);
          navigate('/');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('Invalid conditions:', { storyId, hasUser: !!user });
        navigate('/');
      }
    };

    loadStory();
  }, [storyId, customStories, currentPages, currentCharacter, selectedStory, navigate, user]);
  
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
        user_id: user.id,
        story_id: storyId || `custom-${Date.now()}`,
        title: story.title || 'Untitled Story',
        character: story.character,
        pages: story.pages,
        date_created: new Date().toISOString()
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

      // Show success message or redirect
      navigate('/my-stories');
    } catch (error) {
      console.error('Error saving story:', error);
      setSaveError('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 md:px-8 py-16 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full max-w-2xl"></div>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
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
              to="/my-stories"
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
          voiceId={story.prompt?.voiceId}
        />
      </motion.div>
    </div>
  );
}