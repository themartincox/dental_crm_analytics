import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../../../components/AppIcon';


const FeatureCard = ({ feature, index }) => {
  const { icon: Icon, title, description, benefit } = feature || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          {Icon && <Icon className="h-6 w-6 text-blue-600" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="bg-green-50 rounded-lg p-3">
        <p className="text-green-700 font-medium text-sm">{benefit}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;