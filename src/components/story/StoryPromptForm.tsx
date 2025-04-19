import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Mountain, Users, Map } from 'lucide-react';
import { StoryPrompt } from '../../types/story';

interface StoryPromptFormProps {
  onSubmit: (prompt: StoryPrompt) => void;
  isLoading?: boolean;
}

export default function StoryPromptForm({ onSubmit, isLoading = false }: StoryPromptFormProps) {
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [prompt, setPrompt] = useState<StoryPrompt>({
    theme: '',
    setting: '',
    characters: [],
    plotElements: [],
    customPrompt: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(prompt);
  };

  const themes = [
    'Adventure', 'Fantasy', 'Mystery', 'Friendship',
    'Nature', 'Space', 'Magic', 'Animals'
  ];

  const settings = [
    'Enchanted Forest', 'Magical Kingdom', 'Underwater City',
    'Space Station', 'Secret Garden', 'Ancient Castle',
    'Pirate Ship', 'Cloud City'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 md:p-8 shadow-storybook w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-secondary-100 p-2 rounded-full">
          <Wand2 className="h-6 w-6 text-secondary-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-gray-800">Create Your Story</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setUseCustomPrompt(false)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              !useCustomPrompt
                ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                : 'border-gray-200 hover:border-secondary-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles size={20} />
              <span>Guided Creation</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUseCustomPrompt(true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              useCustomPrompt
                ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                : 'border-gray-200 hover:border-secondary-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Wand2 size={20} />
              <span>Custom Prompt</span>
            </div>
          </button>
        </div>

        {!useCustomPrompt ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-primary-500" />
                  <span>Story Theme</span>
                </div>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setPrompt({ ...prompt, theme })}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      prompt.theme === theme
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Mountain size={16} className="text-secondary-500" />
                  <span>Story Setting</span>
                </div>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {settings.map((setting) => (
                  <button
                    key={setting}
                    type="button"
                    onClick={() => setPrompt({ ...prompt, setting })}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      prompt.setting === setting
                        ? 'bg-secondary-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {setting}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-tertiary-500" />
                  <span>Additional Characters</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="e.g., friendly dragon, wise owl (comma separated)"
                value={prompt.characters?.join(', ') || ''}
                onChange={(e) => setPrompt({
                  ...prompt,
                  characters: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Map size={16} className="text-primary-500" />
                  <span>Plot Elements</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="e.g., magical map, hidden treasure (comma separated)"
                value={prompt.plotElements?.join(', ') || ''}
                onChange={(e) => setPrompt({
                  ...prompt,
                  plotElements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Story Idea
            </label>
            <textarea
              value={prompt.customPrompt}
              onChange={(e) => setPrompt({ ...prompt, customPrompt: e.target.value })}
              placeholder="Describe your story idea in detail..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (!useCustomPrompt && !prompt.theme && !prompt.setting)}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Your Story...</span>
            </>
          ) : (
            <>
              <Wand2 size={18} />
              <span>Generate Story</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}