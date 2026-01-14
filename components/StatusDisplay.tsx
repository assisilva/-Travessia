
import React from 'react';
import { CrossingStatus } from '../types';

interface StatusDisplayProps {
  status: CrossingStatus;
  reason: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, reason }) => {
  const getStyles = () => {
    switch (status) {
      case CrossingStatus.PARALISADA:
        return {
          bgColor: 'bg-red-600',
          icon: 'fas fa-hand-paper',
          label: 'Interrompida'
        };
      case CrossingStatus.ATENCAO:
        return {
          bgColor: 'bg-orange-500',
          icon: 'fas fa-exclamation-triangle',
          label: 'Atenção: Escadaria'
        };
      default:
        return {
          bgColor: 'bg-green-600',
          icon: 'fas fa-check-circle',
          label: 'Normal'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-lg p-6 md:p-8 shadow-xl text-center transition-all duration-500 ${styles.bgColor} text-white`}>
      <div className="flex flex-col items-center justify-center">
        <i className={`${styles.icon} text-5xl md:text-6xl mb-4`}></i>
        <p className="text-sm uppercase tracking-widest font-semibold opacity-80">Condição Atual</p>
        <h2 className="text-4xl md:text-5xl font-extrabold my-2">{styles.label}</h2>
        <p className="text-base md:text-lg font-medium mt-4 max-w-md mx-auto bg-black/10 p-3 rounded-lg">
          {reason}
        </p>
      </div>
    </div>
  );
};

export default StatusDisplay;
