import { Link } from 'react-router-dom';
import { Book, Heart, Shield } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-12 pb-8 mt-8 border-t border-gray-200">
      <div className="container mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-500 text-white p-2 rounded-full">
                <Book size={20} />
              </div>
              <span className="text-lg font-display font-bold text-gray-800">StoryPals</span>
            </div>
            <p className="text-gray-600 mb-4">
              Creating magical, personalized storybooks that make children the heroes of their own adventures.
            </p>
            <div className="flex items-center space-x-1 text-gray-500">
              <Heart size={16} className="text-error-500" />
              <span>Made with love for little readers</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/customize" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Create Story
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-gray-800 mb-4">Parents Corner</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Shield size={16} className="text-secondary-500" />
                <span className="text-gray-600">Safe for children</span>
              </li>
              <li className="text-gray-600">
                Child-friendly content
              </li>
              <li className="text-gray-600">
                No ads or tracking
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} StoryPals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}