import { useState } from 'react';
import { X, Loader2, Minus, Plus } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const CREDIT_PRICE = 1.00; // Price per credit in USD

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setError('You must be signed in to make a purchase');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_CREDIT_PRICE_ID,
          quantity: quantity,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }

      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = (CREDIT_PRICE * quantity).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Purchase Credits</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            You need credits to create more stories. Each story costs 1 credit.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Quantity</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className={cn(
                      "p-1 rounded-full hover:bg-gray-200 transition-colors",
                      quantity <= 1 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                    className={cn(
                      "p-1 rounded-full hover:bg-gray-200 transition-colors",
                      quantity >= 10 && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700">Total</span>
                <span className="font-bold text-gray-900">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className={cn(
              "flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Processing...
              </>
            ) : (
              `Purchase ${quantity} Credit${quantity > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 