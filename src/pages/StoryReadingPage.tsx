import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStoryStore } from '../store/useStoryStore';
import StoryBookReader from '../components/story/StoryBookReader';

export default function StoryReadingPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { customStories, selectedStory, currentCharacter, currentPages } = useStoryStore();
  
  const [story, setStory] = useState<any>(null);
  
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
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 size={20} className="text-gray-600" />
            </button>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
              <BookOpen size={18} className="mr-2" />
              <span className="hidden md:inline">Save Story</span>
            </button>
          </div>
        </div>
        
        <StoryBookReader 
          pages={story.pages} 
          characterName={story.character.name}
        />
      </motion.div>
    </div>
  );
}