import { motion } from 'framer-motion';
import { BookOpen, Wand2, Palette, BookText } from 'lucide-react';

const steps = [
  {
    icon: <BookOpen className="h-6 w-6 text-white" />,
    iconBg: 'bg-primary-500',
    title: 'Choose a Story',
    description: 'Select from classic tales or start with a brand new adventure created just for your child.'
  },
  {
    icon: <Palette className="h-6 w-6 text-white" />,
    iconBg: 'bg-secondary-500',
    title: 'Personalize',
    description: 'Add your child\'s name and customize the story to make them the star of the adventure.'
  },
  {
    icon: <Wand2 className="h-6 w-6 text-white" />,
    iconBg: 'bg-tertiary-500',
    title: 'Magical Creation',
    description: 'Our AI brings the story to life with personalized text and interactive elements.'
  },
  {
    icon: <BookText className="h-6 w-6 text-white" />,
    iconBg: 'bg-primary-500',
    title: 'Read & Interact',
    description: 'Enjoy the story together with your child, discovering interactive surprises along the way.'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 mb-4">
              How the Magic Happens
            </h2>
            <p className="text-xl text-gray-600">
              Creating personalized storybooks is simple and fun
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-50 rounded-xl p-6 shadow-md h-full">
                <div className={`w-12 h-12 rounded-full ${step.iconBg} flex items-center justify-center mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full transform -translate-y-1/2 translate-x-4 w-8">
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}