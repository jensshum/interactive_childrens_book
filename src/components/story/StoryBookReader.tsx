import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { StoryPage } from '../../types/story';

interface StoryBookReaderProps {
  pages: StoryPage[];
  characterName: string;
}

export default function StoryBookReader({ pages, characterName }: StoryBookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Auto-read text (simulated)
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (isSoundOn) {
      setIsReading(true);
      const timer = setTimeout(() => {
        setIsReading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentPageIndex, isSoundOn]);

  if (!currentPage) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-storybook my-8 flex">
        {/* Book pages */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col md:flex-row"
          >
            {/* Image side */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
              <img
                src={currentPage.image}
                alt={`Story page ${currentPageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Interactive elements */}
              {currentPage.interactions?.map((interaction) => (
                <motion.div
                  key={interaction.id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{ 
                    top: `${interaction.position?.y || 50}%`, 
                    left: `${interaction.position?.x || 50}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-yellow-400 bg-opacity-70 rounded-full flex items-center justify-center animate-pulse">
                    <span className="sr-only">{interaction.targetElement}</span>
                    ✨
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Text side */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-6 md:p-10 flex flex-col justify-center bg-gradient-to-b from-blue-50 to-yellow-50">
              <div className={`text-gray-800 text-lg md:text-xl leading-relaxed font-medium mb-6 ${isReading ? 'text-primary-700' : ''}`}>
                {currentPage.text}
              </div>
              
              <div className="mt-auto flex justify-between items-center">
                <div className="text-gray-500 text-sm">
                  Page {currentPageIndex + 1} of {totalPages}
                </div>
                
                <button
                  onClick={() => setIsSoundOn(!isSoundOn)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isSoundOn ? (
                    <Volume2 size={20} className="text-secondary-500" />
                  ) : (
                    <VolumeX size={20} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPageIndex === 0}
            className={`p-3 rounded-full ${
              currentPageIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white shadow-lg text-secondary-500 hover:bg-secondary-50'
            } transition-colors`}
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPageIndex === totalPages - 1}
            className={`p-3 rounded-full ${
              currentPageIndex === totalPages - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white shadow-lg text-secondary-500 hover:bg-secondary-50'
            } transition-colors`}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}