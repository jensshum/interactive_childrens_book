import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PaymentSuccessPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Handle auth loading state
  useEffect(() => {
    if (!authLoading) {
      setIsAuthLoading(false);
      if (!user) {
        // If no user after auth is loaded, redirect to sign in
        navigate('/sign-in', { 
          state: { 
            from: '/payment-success',
            message: 'Please sign in to view your payment status'
          }
        });
      }
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setCredits(data.credits);
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading && user) {
      fetchCredits();
    }
  }, [user, isAuthLoading]);

  // Show loading state while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if we're redirecting
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your credits have been added to your account.
          </p>

          {isLoading ? (
            <div className="text-gray-500">Loading your credits...</div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-600">Your current balance:</p>
              <p className="text-2xl font-bold text-primary-600">{credits} credits</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => navigate('/customize')}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create a New Story
            </button>
            
            <button
              onClick={() => navigate('/my-stories')}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View My Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 