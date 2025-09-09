import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const OptionCard = ({ 
  icon: Icon, 
  iconColor, 
  iconBg, 
  title, 
  subtitle, 
  description, 
  features, 
  actionLabel, 
  onClick, 
  linkTo, 
  variant = 'primary' 
}) => {
  const isPrimary = variant === 'primary';
  
  const cardContent = (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`
        group relative bg-white rounded-2xl shadow-lg border-2 p-8 h-full cursor-pointer
        transition-all duration-300 hover:shadow-xl
        ${isPrimary 
          ? 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/30' :'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/30'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className={`inline-flex items-center justify-center w-14 h-14 ${iconBg} rounded-xl mb-4`}>
            <Icon className={`h-7 w-7 ${iconColor}`} />
          </div>
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-500 mb-1">{subtitle}</p>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>
        <ChevronRight 
          className={`
            h-5 w-5 transition-all duration-300 group-hover:translate-x-1
            ${isPrimary ? 'text-blue-400 group-hover:text-blue-600' : 'text-emerald-400 group-hover:text-emerald-600'}
          `} 
        />
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <CheckCircle 
              className={`
                h-5 w-5 mt-0.5 flex-shrink-0
                ${isPrimary ? 'text-blue-500' : 'text-emerald-500'}
              `} 
            />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        <div 
          className={`
            inline-flex items-center justify-center w-full px-6 py-3 rounded-xl font-medium
            transition-all duration-200 group-hover:translate-x-0
            ${isPrimary 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' :'bg-emerald-600 hover:bg-emerald-700 text-white'
            }
          `}
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div 
        className={`
          absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          ${isPrimary 
            ? 'bg-gradient-to-br from-blue-600/10 to-indigo-600/10' :'bg-gradient-to-br from-emerald-600/10 to-teal-600/10'
          }
        `} 
      />
    </motion.div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="h-full">
      {cardContent}
    </div>
  );
};

export default OptionCard;