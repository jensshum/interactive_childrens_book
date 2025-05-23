import { FormEvent, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Mountain, Users, Map, Mic, MicOff, Loader2, Square, Bug, Coins } from 'lucide-react';
import { StoryPrompt } from '../../types/story';
import { getAvailableVoices, cloneVoice, deleteVoice } from '../../utils/elevenlabs';
import { useStoryStore } from '../../store/useStoryStore';
import PaymentModal from '../payment/PaymentModal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface StoryPromptFormProps {
  onSubmit: (prompt: StoryPrompt) => void;
  isLoading?: boolean;
}

interface Voice {
  voice_id: string;
  name: string;
  category: string;
}

export default function StoryPromptForm({ onSubmit, isLoading = false }: StoryPromptFormProps) {
  const { debugMode, setDebugMode, currentCharacter } = useStoryStore();
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  
  // Store raw input strings separately from processed arrays
  const [charactersInput, setCharactersInput] = useState('');
  const [plotElementsInput, setPlotElementsInput] = useState('');
  
  const [prompt, setPrompt] = useState<StoryPrompt>({
    theme: '',
    setting: '',
    characters: [],
    plotElements: [],
    customPrompt: '',
    voiceId: undefined
  });

  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isCloningVoice, setIsCloningVoice] = useState(false);
  const [voiceName, setVoiceName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [cloningError, setCloningError] = useState<string | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    loadVoices();
    
    // Initialize input fields from any existing prompt data
    if (prompt.characters && prompt.characters.length > 0) {
      setCharactersInput(prompt.characters.join(', '));
    }
    
    if (prompt.plotElements && prompt.plotElements.length > 0) {
      setPlotElementsInput(prompt.plotElements.join(', '));
    }
    
    if (user) {
      fetchUserCredits();
    }
    
    return () => {
      // Cleanup recording resources
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [user]);

  const loadVoices = async () => {
    try {
      setIsLoadingVoices(true);
      const availableVoices = await getAvailableVoices();
      setVoices(availableVoices);
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setCloningError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    }
  };

  const handleVoiceClone = async () => {
    if (!voiceName || (!audioFile && !recordedBlob)) {
      setCloningError('Please provide both a name and an audio sample');
      return;
    }

    try {
      setIsCloningVoice(true);
      setCloningError(null);
      const audioBlob = audioFile || recordedBlob;
      if (!audioBlob) return;
      
      const voiceId = await cloneVoice(voiceName, audioBlob);
      await loadVoices(); // Reload voices to include the new one
      setPrompt({ ...prompt, voiceId });
      setVoiceName('');
      setAudioFile(null);
      setRecordedBlob(null);
    } catch (error) {
      console.error('Error cloning voice:', error);
      setCloningError('Failed to clone voice. Please try again.');
    } finally {
      setIsCloningVoice(false);
    }
  };

  const handleVoiceDelete = async (voiceId: string) => {
    try {
      await deleteVoice(voiceId);
      await loadVoices(); // Reload voices after deletion
      if (prompt.voiceId === voiceId) {
        setPrompt({ ...prompt, voiceId: undefined });
      }
    } catch (error) {
      console.error('Error deleting voice:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchUserCredits = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/credits?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await response.json();
      setUserCredits(data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (userCredits <= 0) {
      setShowPaymentModal(true);
      return;
    }

    if (!user) {
      console.error('No user authenticated');
      return;
    }

    try {
      // Attempt to decrement credits
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Insufficient credits') {
          setShowPaymentModal(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to decrement credits');
      }

      const data = await response.json();
      setUserCredits(data.credits); // Update local credits state

      // Process raw input strings into arrays only when submitting
      const processedCharacters = charactersInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      const processedPlotElements = plotElementsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    
      // Create the final prompt with processed arrays and ensure voiceId is included
      const finalPrompt = {
        ...prompt,
        characters: processedCharacters,
        plotElements: processedPlotElements,
        voiceId: prompt.voiceId
      };
    
      console.log('Submitting prompt with voiceId:', finalPrompt.voiceId);
      setCurrentPage(0);
      setTotalPages(0);
      onSubmit(finalPrompt);
    } catch (error) {
      console.error('Error during submission:', error);
      setShowPaymentModal(true); // Show payment modal on any error for simplicity
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchUserCredits();
    setShowPaymentModal(false);
  };

  // Add effect to listen for page generation progress
  useEffect(() => {
    if (isLoading) {
      const checkProgress = setInterval(() => {
        const { currentPages } = useStoryStore.getState();
        if (currentPages.length > 0) {
          setCurrentPage(currentPages.length);
          setTotalPages(currentPages.length + 1); // Add 1 for the page being generated
        }
      }, 1000);

      return () => clearInterval(checkProgress);
    }
  }, [isLoading]);

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 md:p-8 shadow-storybook w-full max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-secondary-100 p-2 rounded-full">
              <Wand2 className="h-6 w-6 text-secondary-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-gray-800">Create Your Story</h2>
          </div>
        </div>

        {/* Character Preview Section */}
        {currentCharacter && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <img
                  src={currentCharacter.styledImage || currentCharacter.photo}
                  alt={currentCharacter.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-gray-800">{currentCharacter.name}</h3>
                <p className="text-sm text-gray-600">
                  {currentCharacter.age} years old • {currentCharacter.gender}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Art Style: {currentCharacter.artStyle ? currentCharacter.artStyle.charAt(0).toUpperCase() + currentCharacter.artStyle.slice(1) : 'Default'}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voice Selection Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Story Narrator Voice</h3>
            
            {/* Voice List */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a Voice
              </label>
              {isLoadingVoices ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-secondary-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {voices.map((voice) => (
                    <div
                      key={voice.voice_id}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        prompt.voiceId === voice.voice_id
                          ? 'border-secondary-500 bg-secondary-50'
                          : 'border-gray-200 hover:border-secondary-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {console.log("VOICE!!!", voice.voice_id); setPrompt({ ...prompt, voiceId: voice.voice_id })}}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-gray-900">{voice.name}</div>
                          <div className="text-sm text-gray-500">{voice.category}</div>
                        </button>
                        {voice.category === 'cloned' && (
                          <button
                            type="button"
                            onClick={() => handleVoiceDelete(voice.voice_id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <MicOff size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Cloning Section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Clone Your Voice</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice Name
                  </label>
                  <input
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    placeholder="Enter a name for your voice"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Record Your Voice
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-full transition-colors ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-secondary-500 hover:bg-secondary-600 text-white'
                        }`}
                      >
                        {isRecording ? <Square size={20} /> : <Mic size={20} />}
                      </button>
                      {isRecording && (
                        <div className="text-red-500 font-medium">
                          Recording: {formatTime(recordingTime)}
                        </div>
                      )}
                    </div>
                    {recordedBlob && (
                      <div className="mt-2">
                        <audio src={URL.createObjectURL(recordedBlob)} controls className="w-full" />
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Voice Sample
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Upload a clear audio sample of your voice (30 seconds recommended)
                    </p>
                  </div>
                </div>

                {cloningError && (
                  <div className="text-red-500 text-sm">{cloningError}</div>
                )}

                <button
                  type="button"
                  onClick={handleVoiceClone}
                  disabled={isCloningVoice || !voiceName || (!audioFile && !recordedBlob)}
                  className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isCloningVoice ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cloning Voice...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={16} />
                      <span>Clone Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

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
                  value={charactersInput}
                  onChange={(e) => setCharactersInput(e.target.value)}
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
                  value={plotElementsInput}
                  onChange={(e) => setPlotElementsInput(e.target.value)}
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

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins size={18} className="text-yellow-500" />
                <span className="text-gray-600">Available Credits: {userCredits}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!useCustomPrompt && !prompt.theme && !prompt.setting)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Your Story... (can take 5-8 minutes)</span>
                </div>
                {currentPage > 0 && totalPages > 0 && (
                  <span className="text-sm text-white/80">
                    Generated {currentPage+1} of 9 pages
                  </span>
                )}
              </div>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Generate Story</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}