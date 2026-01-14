
import React from 'react';
import { BellIcon } from './Icons';

interface ControlsProps {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  onRequestNotifications: () => void;
  onToggleSound: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  notificationsEnabled, 
  soundEnabled, 
  onRequestNotifications, 
  onToggleSound 
}) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 transition-colors duration-500">
      <button 
        onClick={onRequestNotifications} 
        disabled={notificationsEnabled}
        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-500 transition-colors"
      >
        <BellIcon className="w-5 h-5 mr-2" />
        {notificationsEnabled ? 'Notificações Ativadas' : 'Ativar Notificações'}
      </button>
      <button 
        onClick={onToggleSound}
        className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
          soundEnabled 
            ? 'text-white bg-green-600 hover:bg-green-700' 
            : 'text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
        }`}
      >
        <i className={`fas ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'} w-5 h-5 mr-2`}></i>
        {soundEnabled ? 'Som Ativado' : 'Ativar Som'}
      </button>
    </div>
  );
};

export default Controls;
