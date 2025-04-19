import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Star, Shield, Brain, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  useEffect(() => {
    document.title = "About StoryPals - Interactive Storybooks for Children";
  }, []);

  return (
    <div className="container mx-auto px-6 md:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-6">
            About StoryPals
          </h1>
          <p className="text-xl text-gray-600">
            Creating magical reading experiences that spark imagination and joy
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-64 relative">
              <img
                src="https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Children reading together"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen size={20} />
                    <span className="font-display font-bold">Our Story</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold">
                    Bringing Stories to Life
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                StoryPals was created with a simple yet powerful vision: to make reading an interactive, personal, and magical experience for children around the world. We believe that when children see themselves as the heroes of their stories, reading becomes more than just an activity—it becomes an adventure.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our team of educators, technologists, and parents came together to create a platform that combines timeless storytelling with modern technology. By harnessing the power of AI and interactive design, we've created a unique experience that adapts classic tales and creates new adventures with your child at the center.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every story is designed to not only entertain but also to nurture important developmental skills: literacy, emotional intelligence, problem-solving, and creativity. We're proud to be part of your child's learning journey.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-8 text-center">
            Our Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="text-primary-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Child-Centered</h3>
              <p className="text-gray-600">
                Everything we create puts the child's experience and development first. We design with curiosity, joy, and learning in mind.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-secondary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Star className="text-secondary-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Quality Storytelling</h3>
              <p className="text-gray-600">
                We believe in the power of well-crafted stories to teach, inspire, and transform. Our content meets the highest standards of storytelling.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-tertiary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="text-tertiary-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Safety & Trust</h3>
              <p className="text-gray-600">
                Parents can trust that our platform is safe, educational, and purposefully designed without ads or inappropriate content.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-primary-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="text-primary-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We thoughtfully combine technology and storytelling to create experiences that weren't possible before, while honoring timeless storytelling traditions.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center bg-secondary-50 p-8 md:p-12 rounded-xl"
        >
          <div className="mb-6">
            <Sparkles size={32} className="text-secondary-500 mx-auto" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 mb-4">
            Ready to Create Some Magic?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of families who are making reading time more magical with personalized stories
          </p>
          <Link
            to="/customize"
            className="inline-flex items-center justify-center space-x-2 bg-secondary-500 hover:bg-secondary-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-medium"
          >
            <BookOpen size={20} />
            <span>Create Your First Story</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}