
import React from 'react';
import { HistoryEntry, InterruptionType } from '../types';

interface HistoryLogProps {
  history: HistoryEntry[];
}

const getInterruptionDetails = (type: InterruptionType | undefined) => {
    switch (type) {
        case 'MARÉ ALTA':
            return { icon: 'fas fa-water', color: 'text-red-500', badgeBg: 'bg-red-500/10', label: 'Maré Alta' };
        case 'MARÉ BAIXA':
            return { icon: 'fas fa-water', color: 'text-yellow-500', badgeBg: 'bg-yellow-500/10', label: 'Maré Baixa' };
        case 'NAVIO PASSANDO':
            return { icon: 'fas fa-ship', color: 'text-indigo-500', badgeBg: 'bg-indigo-500/10', label: 'Navio' };
        case 'NAVIO ATRACADO ARMZ 15':
            return { icon: 'fas fa-anchor', color: 'text-orange-500', badgeBg: 'bg-orange-500/10', label: 'Armz. 15' };
        case 'NAVIO ENTRANDO ARMZ 15':
            return { icon: 'fas fa-sign-in-alt', color: 'text-red-600', badgeBg: 'bg-red-600/10', label: 'Entrando' };
        case 'NAVIO SAINDO ARMZ 15':
            return { icon: 'fas fa-sign-out-alt', color: 'text-red-600', badgeBg: 'bg-red-600/10', label: 'Saindo' };
        case 'NAVIO MANOBRANDO':
            return { icon: 'fas fa-triangle-exclamation', color: 'text-orange-500', badgeBg: 'bg-orange-500/10', label: 'Manobra' };
        default:
            return { icon: 'fas fa-exclamation-triangle', color: 'text-gray-500', badgeBg: 'bg-gray-500/10', label: 'Interrupção' };
    }
};

const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  return (
    <div className="mt-6 md:mt-8">
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
        <i className="fas fa-history mr-2"></i>
        Histórico de Interrupções
      </h3>
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md max-h-60 overflow-y-auto transition-colors duration-500">
        {history.length === 0 ? (
          <p className="p-6 text-center text-gray-500 dark:text-gray-400">Nenhuma interrupção registrada hoje.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {history.map((entry, index) => {
                const details = getInterruptionDetails(entry.type);
                return (
                    <li key={index} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center space-x-3">
                            <i className={`${details.icon} ${details.color} text-xl w-6 text-center`}></i>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{entry.reason}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                {entry.timestamp.toLocaleTimeString('pt-BR')} - {entry.timestamp.toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                        <span className={`hidden sm:inline-block px-2 py-1 text-xs font-bold rounded-full ${details.color} ${details.badgeBg}`}>
                            {details.label}
                        </span>
                    </li>
                );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryLog;
