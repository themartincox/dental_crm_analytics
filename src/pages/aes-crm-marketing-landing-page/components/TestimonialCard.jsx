import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = ({ testimonial, index }) => {
  const { name, practice, location, content, rating } = testimonial || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 relative"
    >
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <Quote className="h-4 w-4 text-white" />
      </div>
      <div className="mb-4">
        <div className="flex items-center space-x-1 mb-2">
          {[.Array(rating || 5)]?.map((_, i) => (
            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-gray-700 leading-relaxed">{content}</p>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-sm text-gray-600">
          {practice} • {location}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;