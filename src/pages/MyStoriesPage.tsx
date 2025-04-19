import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStories, deleteStoryFromSupabase } from '../utils/supabase';
import { CustomizedStory } from '../types/story';

export default function MyStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<CustomizedStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const userStories = await getUserStories(user.id);
      setStories(userStories);
    } catch (err) {
      console.error('Error loading stories:', err);
      setError('Failed to load your stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!user) return;
    
    try {
      setIsDeleting(storyId);
      await deleteStoryFromSupabase(storyId, user.id);
      setStories(stories.filter(story => story.storyId !== storyId));
    } catch (err) {
      console.error('Error deleting story:', err);
      setError('Failed to delete story. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-16 text-center">
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
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-8">My Stories</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {stories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-500 mb-6">Start creating your first story!</p>
            <Link
              to="/customize"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <motion.div
                key={story.storyId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-storybook overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={story.pages[0]?.image || '/placeholder-story.jpg'}
                    alt={story.title || 'Story cover'}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {story.title || 'Untitled Story'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Created on {new Date(story.dateCreated).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/read/${story.storyId}`}
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      Read Story
                    </Link>
                    <button
                      onClick={() => handleDeleteStory(story.storyId)}
                      disabled={isDeleting === story.storyId}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {isDeleting === story.storyId ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 