import { Book, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary-50 to-primary-50 py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-12 mb-12 md:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-800 mb-6">
                Your Child's{' '}
                <span className="text-primary-500">Magical</span>{' '}
                <span className="text-secondary-500">Adventure</span> Awaits
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Create personalized interactive storybooks where your child becomes the hero of their own adventure. Spark imagination and foster a love for reading!
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/customize"
                  className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-medium"
                >
                  <Wand2 size={20} />
                  <span>Create a Story</span>
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-lg font-medium border border-gray-200"
                >
                  <Book size={20} />
                  <span>Learn More</span>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-storybook overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/6204340/pexels-photo-6204340.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Child reading a storybook"
                  className="w-full rounded-2xl"
                />
              </div>
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                className="absolute top-5 -right-14 w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center z-0"
              >
                <Sparkles size={32} className="text-primary-500" />
              </motion.div>
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -bottom-5 -left-10 w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center z-0"
              >
                <Book size={28} className="text-secondary-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}