import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Camera, Palette } from 'lucide-react';
import { StoryCharacter } from '../../types/story';
import ImageCaptureDialog from './ImageCaptureDialog';

interface CharacterFormProps {
  onSubmit: (character: StoryCharacter) => void;
  isLoading?: boolean;
}

const artStyles = [
  { id: 'watercolor', name: 'Watercolor', description: 'Soft and dreamy watercolor style' },
  { id: 'cartoon', name: 'Cartoon', description: 'Fun and playful cartoon style' },
  { id: 'pixar', name: 'Pixar-like', description: '3D animated style' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'storybook', name: 'Storybook', description: 'Classic children\'s book illustration' }
] as const;

export default function CharacterForm({ onSubmit, isLoading = false }: CharacterFormProps) {
  const [character, setCharacter] = useState<StoryCharacter>({
    name: '',
    gender: 'neutral',
    age: 6,
    artStyle: 'storybook'
  });

  const [isImageCaptureOpen, setIsImageCaptureOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsGeneratingImage(true);

    try {
      // Generate styled character image
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: character,
          scene: `A ${character.age}-year-old ${character.gender} character in ${getStylePrompt(character.artStyle)}. 
          The character should be friendly, approachable, and suitable for a children's book. 
          The image should be a portrait-style illustration.`,
          pageNumber: 0, // Special page number to indicate this is a character styling request
          debugMode: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate styled character image');
      }

      const { imageUrl } = await response.json();
      
      console.log('Generated styled character image URL:', imageUrl);
      
      // Update character with styled image
      const styledCharacter = {
        ...character,
        styledImage: imageUrl
      };

      console.log('Character with styled image:', styledCharacter);
      onSubmit(styledCharacter);
    } catch (error) {
      console.error('Error generating styled character:', error);
      // Still submit the form with original image if styling fails
      onSubmit(character);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getStylePrompt = (style?: string): string => {
    switch (style) {
      case 'watercolor':
        return 'soft and dreamy watercolor painting style';
      case 'cartoon':
        return 'playful cartoon illustration style';
      case 'pixar':
        return '3D rendered Pixar-style';
      case 'anime':
        return 'Japanese anime-style illustration';
      case 'storybook':
      default:
        return 'classic children\'s book illustration style';
    }
  };

  const handleImageCapture = (image: string) => {
    setCharacter(prev => ({ ...prev, photo: image }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 md:p-8 shadow-storybook w-full max-w-md mx-auto"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-tertiary-100 p-2 rounded-full">
          <User className="h-6 w-6 text-tertiary-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-800">Create Your Character</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
            Child's Name
          </label>
          <input
            type="text"
            id="childName"
            value={character.name}
            onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            required
            placeholder="Enter child's name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={character.gender === 'boy'}
                onChange={() => setCharacter({ ...character, gender: 'boy' })}
                className="h-4 w-4 text-secondary-500 focus:ring-secondary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Boy</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={character.gender === 'girl'}
                onChange={() => setCharacter({ ...character, gender: 'girl' })}
                className="h-4 w-4 text-secondary-500 focus:ring-secondary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Girl</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="neutral"
                checked={character.gender === 'neutral'}
                onChange={() => setCharacter({ ...character, gender: 'neutral' })}
                className="h-4 w-4 text-secondary-500 focus:ring-secondary-500 border-gray-300"
              />
              <span className="ml-2 text-gray-700">Neutral</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-1">
            Age
          </label>
          <select
            id="childAge"
            value={character.age}
            onChange={(e) => setCharacter({ ...character, age: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
              <option key={age} value={age}>
                {age} years old
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Camera size={16} className="text-primary-500" />
              <span>Child's Photo</span>
            </div>
          </label>
          
          {character.photo ? (
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={character.photo}
                alt="Character"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setIsImageCaptureOpen(true)}
                className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <Camera size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsImageCaptureOpen(true)}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera size={20} className="text-gray-400" />
              <span className="text-gray-600">Take or Upload Photo</span>
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Palette size={16} className="text-secondary-500" />
              <span>Art Style</span>
            </div>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {artStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setCharacter({ ...character, artStyle: style.id })}
                className={`p-3 rounded-lg text-left transition-colors ${
                  character.artStyle === style.id
                    ? 'bg-secondary-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium">{style.name}</div>
                <div className="text-xs mt-1 opacity-80">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isGeneratingImage || character.name.trim().length === 0 || !character.photo}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading || isGeneratingImage ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isGeneratingImage ? 'Creating Character...' : 'Creating Story...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Create Magical Story</span>
            </>
          )}
        </button>
      </form>

      <ImageCaptureDialog
        isOpen={isImageCaptureOpen}
        onClose={() => setIsImageCaptureOpen(false)}
        onCapture={handleImageCapture}
      />
    </motion.div>
  );
}