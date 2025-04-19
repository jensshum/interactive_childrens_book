import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStoryStore } from '../store/useStoryStore';
import StoryCard from '../components/story/StoryCard';
import HeroSection from '../components/ui/HeroSection';
import FeatureSection from '../components/ui/FeatureSection';
import HowItWorks from '../components/ui/HowItWorks';

export default function HomePage() {
  const { presetStories } = useStoryStore();

  useEffect(() => {
    document.title = "StoryPals - Interactive Storybooks for Children";
  }, []);

  return (
    <div>
      <HeroSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
                Popular Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Choose from our collection of timeless tales, reimagined with your child as the hero
              </p>
            </div>
            <Link to="/customize" className="mt-4 md:mt-0 inline-flex items-center text-secondary-500 hover:text-secondary-600 font-medium">
              View all stories 
              <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {presetStories.slice(0, 3).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>
      
      <FeatureSection />
      
      <HowItWorks />
      
      <section className="py-16 bg-primary-500">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Ready to Create a Magical Story?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8">
              Turn your child into the hero of their own adventure with just a few clicks
            </p>
            <Link 
              to="/customize" 
              className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-primary-500 px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-medium"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}