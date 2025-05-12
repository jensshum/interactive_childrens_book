import { Brain, Lightbulb, Sparkles, MessageSquare, PenTool, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-primary-500" />,
    title: 'Personalized Stories',
    description: 'Your child becomes the main character in every adventure, making reading a personal and memorable experience.'
  },
  {
    icon: <Brain className="h-6 w-6 text-secondary-500" />,
    title: 'AI-Powered Creation',
    description: 'AI helps create unique, engaging stories tailored to your child\'s interests and age.'
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-tertiary-500" />,
    title: 'Interactive Elements',
    description: 'Clickable objects, sounds, and animations bring stories to life and engage young readers.'
  },
  {
    icon: <PenTool className="h-6 w-6 text-primary-500" />,
    title: 'Classic & Original Tales',
    description: 'Choose from beloved classics or create entirely new adventures for endless storytelling possibilities.'
  },
  {
    icon: <Lightbulb className="h-6 w-6 text-secondary-500" />,
    title: 'Educational Value',
    description: 'Stories designed to foster literacy, creativity, and emotional intelligence in children.'
  },
  {
    icon: <HeartHandshake className="h-6 w-6 text-tertiary-500" />,
    title: 'Parent & Child Bonding',
    description: 'Create meaningful moments together as you explore magical worlds and adventures.'
  }
];

export default function FeatureSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
            Magical Features for Magical Minds
          </h2>
          <p className="text-xl text-gray-600">
            Discover how StoryPals makes reading an enchanting experience for children
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}