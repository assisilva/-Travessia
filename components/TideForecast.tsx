
import React, { useState } from 'react';
import { DailyTideForecast } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface TideForecastProps {
  dailyForecasts: DailyTideForecast[];
}

const TideForecast: React.FC<TideForecastProps> = ({ dailyForecasts }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const getTabLabel = (index: number, dayOfWeek: string) => {
    if (index === 0) return 'Hoje';
    if (index === 1) return 'Amanhã';
    return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).split('-')[0];
  };

  const activeForecast = dailyForecasts[activeTabIndex];

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
        <i className="fas fa-water mr-2"></i>
        Previsão da Maré
      </h3>
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md transition-colors duration-500 overflow-hidden">
        {dailyForecasts.length === 0 ? (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">Carregando previsão da maré...</p>
        ) : (
          <>
            <div className="flex border-b border-gray-200 dark:border-gray-600">
              {dailyForecasts.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTabIndex(index)}
                  className={`flex-1 py-3 px-2 text-sm font-bold focus:outline-none transition-colors duration-300 ${
                    activeTabIndex === index
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  aria-current={activeTabIndex === index ? 'page' : undefined}
                >
                  {getTabLabel(index, day.dayOfWeek)}
                </button>
              ))}
            </div>
            {activeForecast && (
                 <div className="p-4" role="tabpanel">
                     <p className="text-center text-gray-600 dark:text-gray-300 font-semibold text-lg mb-4">
                         {activeForecast.date.charAt(0).toUpperCase() + activeForecast.date.slice(1)}
                     </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        {activeForecast.forecast.map((event, index) => (
                          <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-600">
                            {event.type === 'Alta' ? (
                              <ArrowUpIcon className="w-6 h-6 text-blue-500 mb-1" aria-label="Maré Alta" />
                            ) : (
                              <ArrowDownIcon className="w-6 h-6 text-yellow-500 mb-1" aria-label="Maré Baixa" />
                            )}
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Maré {event.type}</p>
                            <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{event.time}</p>
                          </div>
                        ))}
                    </div>
                 </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TideForecast;
