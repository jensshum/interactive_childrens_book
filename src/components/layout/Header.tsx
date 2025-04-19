import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Book, Sparkles, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          <li>
            <Link 
              to="/customize" 
              className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
            >
              <Sparkles size={18} />
              <span>Get Started</span>
            </Link>
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
          <li>
            <NavLink to="/about" onClick={toggleMenu}>About</NavLink>
          </li>
          <li className="pt-2">
            <Link 
              to="/customize" 
              className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
              onClick={toggleMenu}
            >
              <Sparkles size={18} />
              <span>Get Started</span>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

function NavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link 
      to={to} 
      className="text-gray-600 hover:text-primary-500 font-medium transition-colors duration-200"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}