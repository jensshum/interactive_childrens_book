import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Story } from '../../types/story';

interface StoryCardProps {
  story: Story;
  onClick?: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white rounded-xl overflow-hidden shadow-storybook h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={story.coverImage} 
          alt={story.title} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded-full">
          Ages {story.ageRange}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-display font-bold text-xl text-gray-800 mb-2">{story.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{story.description}</p>
        
        <Link 
          to={`/customize?story=${story.id}`} 
          className="flex items-center justify-center space-x-2 bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-center font-medium mt-auto"
          onClick={onClick}
        >
          <BookOpen size={18} />
          <span>Select Story</span>
        </Link>
      </div>
    </motion.div>
  );
}