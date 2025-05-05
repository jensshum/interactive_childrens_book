import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { StoryPage } from '../../types/story';
import { generateSpeech } from '../../utils/elevenlabs';

interface StoryBookReaderProps {
  pages: StoryPage[];
  characterName: string;
  voiceId?: string;
}

export default function StoryBookReader({ pages, characterName, voiceId }: StoryBookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setIsVideoPlaying(false);
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setIsVideoPlaying(false);
    }
  };

  // Generate audio for the current page
  useEffect(() => {
    let isActive = true; // For handling component unmount
    
    const generateAudioForPage = async () => {
      if (!currentPage || !isSoundOn) return;
      
      try {
        setIsLoadingAudio(true);
        // Clean up previous audio URL if it exists
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
        }
        
        // Generate new audio for the current page using the selected voice
        const newAudioUrl = await generateSpeech(currentPage.text, voiceId);
        
        // Check if component is still mounted
        if (isActive) {
          setAudioUrl(newAudioUrl);
          
          // Play the audio
          if (audioRef.current) {
            audioRef.current.src = newAudioUrl;
            audioRef.current.play();
          }
        } else {
          // Clean up if component unmounted during fetch
          URL.revokeObjectURL(newAudioUrl);
        }
      } catch (error) {
        console.error('Error generating audio:', error);
      } finally {
        if (isActive) {
          setIsLoadingAudio(false);
        }
      }
    };
    
    generateAudioForPage();
    
    // Cleanup function
    return () => {
      isActive = false;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [currentPageIndex, isSoundOn, currentPage, voiceId]);

  // Toggle sound on/off
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
    if (audioRef.current) {
      if (!isSoundOn) {
        // If turning sound on and we have an audio URL, play it
        if (audioUrl) {
          audioRef.current.play();
        }
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Toggle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Handle video ended event
  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
  };

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
            {/* Video side */}
            <div className="w-full md:w-2/3 h-1/2 md:h-full relative">
              <video
                ref={videoRef}
                src={currentPage.image}
                className="w-full h-full object-cover"
                onEnded={handleVideoEnded}
                loop={false}
                playsInline
              />
              
              {/* Video controls overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-4 py-2">
                <button
                  onClick={toggleVideo}
                  className="text-white hover:text-primary-300 transition-colors"
                >
                  {isVideoPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
              </div>
              
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
            <div className="w-full md:w-1/3 h-1/2 md:h-full p-6 md:p-10 flex flex-col justify-center bg-gradient-to-b from-blue-50 to-yellow-50">
              <div className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium mb-6">
                {currentPage.text}
              </div>
              
              <div className="mt-auto flex justify-between items-center">
                <div className="text-gray-500 text-sm">
                  Page {currentPageIndex + 1} of {totalPages}
                </div>
                
                <button
                  onClick={toggleSound}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={isLoadingAudio}
                >
                  {isLoadingAudio ? (
                    <div className="w-5 h-5 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : isSoundOn ? (
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
      
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}