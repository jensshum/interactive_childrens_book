import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                {view === 'login' ? 'Sign in to continue' : 'Create an account'}
              </h2>
              <p className="mt-2 text-gray-600">
                {view === 'login' 
                  ? 'Sign in to create your magical story'
                  : 'Create an account to start your storytelling journey'}
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to={view === 'login' ? '/sign-in' : '/sign-up'}
                className="block w-full bg-primary-500 hover:bg-primary-600 text-white text-center py-2 px-4 rounded-lg transition-colors"
                onClick={onClose}
              >
                {view === 'login' ? 'Sign In' : 'Sign Up'}
              </Link>

              <button
                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                className="block w-full text-gray-600 hover:text-primary-500 text-center py-2 transition-colors"
              >
                {view === 'login' 
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 