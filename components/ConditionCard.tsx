
import React from 'react';

interface ConditionCardProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  valueColor: string;
  details?: string;
}

const ConditionCard: React.FC<ConditionCardProps> = ({ title, icon, value, valueColor, details }) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-md flex items-center space-x-4 transition-colors duration-500">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-grow">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
        {details && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{details}</p>}
      </div>
    </div>
  );
};

export default ConditionCard;
