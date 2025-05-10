import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Book, Sparkles, Info, LogOut, BookOpen, Coins } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import PaymentModal from '../payment/PaymentModal';
import { supabase } from '../../utils/supabase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchUserCredits();
    }
  }, [user]);

  const fetchUserCredits = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user/credits?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      const data = await response.json();
      setCredits(data.credits);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handlePaymentSuccess = async () => {
    await fetchUserCredits();
    setIsPaymentModalOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleGetStarted = () => {
    if (user) {
      navigate('/customize');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 md:px-8">
      <nav className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary-500 text-white p-2 rounded-full">
            <Book size={24} />
          </div>
          <span className="text-xl font-display font-bold text-gray-800">StoryPals</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center space-x-8">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/customize">Create Story</NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink to="/my-stories" className="flex items-center space-x-1">
                  <BookOpen size={18} />
                  <span>My Stories</span>
                </NavLink>
              </li>
              <li>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <Coins size={18} className="text-yellow-500" />
                  <span>{credits} Credits</span>
                </button>
              </li>
            </>
          )}
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          <li>
            {user ? (
              <button 
                onClick={handleLogOut}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors duration-200"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            ) : (
              <button 
                onClick={handleGetStarted}
                className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
              >
                <Sparkles size={18} />
                <span>Get Started</span>
              </button>
            )}
          </li>
        </ul>
      </nav>

      {/* Mobile menu */}
      <div className={cn(
        "fixed inset-x-0 top-16 bg-white shadow-lg md:hidden transition-transform duration-300 z-50",
        isMenuOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <ul className="flex flex-col py-4 px-6 space-y-4">
          <li>
            <NavLink to="/" onClick={toggleMenu}>Home</NavLink>
          </li>
          <li>
            <NavLink to="/customize" onClick={toggleMenu}>Create Story</NavLink>
          </li>
          {user && (
            <>
              <li>
                <NavLink to="/my-stories" onClick={toggleMenu} className="flex items-center space-x-1">
                  <BookOpen size={18} />
                  <span>My Stories</span>
                </NavLink>
              </li>
              <li>
                <button
                  onClick={() => {
                    toggleMenu();
                    setIsPaymentModalOpen(true);
                  }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <Coins size={18} className="text-yellow-500" />
                  <span>{credits} Credits</span>
                </button>
              </li>
            </>
          )}
          <li>
            <NavLink to="/about" onClick={toggleMenu}>About</NavLink>
          </li>
          <li className="pt-2">
            {user ? (
              <button 
                onClick={() => {
                  toggleMenu();
                  handleLogOut();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors duration-200"
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  toggleMenu();
                  handleGetStarted();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
              >
                <Sparkles size={18} />
                <span>Get Started</span>
              </button>
            )}
          </li>
        </ul>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </header>
  );
}

function NavLink({ to, children, onClick, className }: { to: string; children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <Link 
      to={to} 
      className={cn(
        "text-gray-600 hover:text-primary-500 font-medium transition-colors duration-200",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}