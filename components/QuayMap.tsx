
import React from 'react';
import { TideLevel } from '../types';

interface QuayMapProps {
  tideLevel: TideLevel;
}

const QuayMap: React.FC<QuayMapProps> = ({ tideLevel }) => {
  const isExtremeTide = tideLevel === TideLevel.ALTA || tideLevel === TideLevel.BAIXA;
  const useStairs = isExtremeTide;
  
  // A catraia se move em direção ao destino ativo
  const showCatraia = true;
  
  return (
    <div className="mt-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-500">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest flex items-center">
            <i className="fas fa-map-marked-alt mr-2 text-blue-600"></i>
            Esquema Armazém 15
          </h3>
          <div className="flex items-center space-x-4">
             <span className="flex items-center text-[10px] font-bold text-gray-400">
               <span className={`w-2 h-2 rounded-full mr-1 ${useStairs ? 'bg-orange-500' : 'bg-blue-400 animate-pulse'}`}></span> {useStairs ? 'DESTINO: CAIS' : 'DESTINO: BACIA'}
             </span>
          </div>
        </div>
        
        {/* Schematic Map Area based on User Image */}
        <div className="relative h-[400px] w-full bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center p-8">
          
          <div className="relative w-full h-full flex flex-col items-center">
            
            {/* 1. TOP SECTION: Vicente de Carvalho */}
            <div className="relative w-full flex flex-col items-center">
                {/* Gray Box above VDC */}
                <div className="w-24 h-12 bg-gray-500 mb-0"></div>
                
                {/* Blue Horizontal Bar */}
                <div className="w-full h-24 bg-[#5fa1d9] flex items-center justify-end pr-8 relative">
                    <span className="text-lg font-black text-black uppercase tracking-tight">Vicente de Carvalho</span>
                </div>
            </div>

            {/* 2. MIDDLE SECTION: Vertical Pier and Cais */}
            <div className="relative w-28 h-40 bg-[#5fa1d9] flex justify-center">
                
                {/* ESCADARIA DO CAIS (Right Side of Pier) */}
                <div className={`absolute top-4 -right-20 w-20 h-10 border-2 border-black flex items-center transition-all duration-500 ${useStairs ? 'bg-orange-100 border-orange-600 scale-110 shadow-lg' : 'bg-white opacity-40'}`}>
                    {/* Stair stripes */}
                    <div className="flex-1 h-full flex border-r border-black">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex-1 border-r border-black last:border-r-0 bg-gray-400"></div>
                        ))}
                    </div>
                    <div className="px-2 flex flex-col justify-center">
                         <span className="text-xs font-black text-black uppercase">Cais</span>
                    </div>
                    {useStairs && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full">
                            <i className="fas fa-arrow-left text-orange-600 animate-bounce-x"></i>
                        </div>
                    )}
                </div>

                {/* Catraia Animation inside the vertical path */}
                {showCatraia && (
                   <div className={`absolute left-1/2 -translate-x-1/2 w-8 h-12 bg-blue-800 rounded-sm shadow-xl border-b-4 border-blue-900 z-10 ${useStairs ? 'animate-catraia-to-cais' : 'animate-catraia-to-bacia'}`}>
                      <div className="w-full h-2 bg-white/30 rounded-full mt-2"></div>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/20 blur-[2px] rounded-full animate-pulse"></div>
                   </div>
                )}
            </div>

            {/* 3. BOTTOM SECTION: Bacia do Mercado */}
            <div className="relative flex items-end">
                {/* Blue Square for Bacia */}
                <div className={`w-64 h-64 bg-[#5fa1d9] flex items-center justify-center transition-all duration-500 ${!useStairs ? 'ring-4 ring-blue-400 shadow-2xl' : 'opacity-60 grayscale-[0.5]'}`}>
                    <div className="text-center px-4">
                        <span className="text-2xl font-black text-black uppercase block leading-tight">Bacia do Mercado</span>
                    </div>
                </div>

                {/* Gray Box at the bottom right */}
                <div className="w-24 h-44 bg-gray-500 ml-4 mb-0"></div>
            </div>

          </div>

          {/* Warning Overlays */}
          {useStairs && (
            <div className="absolute top-1/2 right-12 -translate-y-1/2 pointer-events-none z-20">
               <div className="bg-orange-600 text-white text-xs font-black px-6 py-3 rounded-full animate-pulse uppercase tracking-widest shadow-2xl border-2 border-orange-400 flex items-center">
                 <i className="fas fa-exclamation-circle mr-3 text-lg"></i> Desembarque no Cais
               </div>
            </div>
          )}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes catraia-to-bacia {
            0% { transform: translate(-50%, -100px) rotate(0deg); }
            100% { transform: translate(-50%, 150px) rotate(0deg); }
          }
          
          @keyframes catraia-to-cais {
            0% { transform: translate(-50%, 150px) rotate(180deg); }
            80% { transform: translate(-50%, -100px) rotate(180deg); }
            100% { transform: translate(40px, -140px) rotate(90deg); }
          }

          @keyframes bounce-x {
            0%, 100% { transform: translate(0, -50%); }
            50% { transform: translate(-10px, -50%); }
          }

          .animate-catraia-to-bacia {
            animation: catraia-to-bacia 8s ease-in-out infinite alternate;
          }
          
          .animate-catraia-to-cais {
            animation: catraia-to-cais 8s ease-in-out infinite alternate;
          }

          .animate-bounce-x {
            animation: bounce-x 1s infinite;
          }
        `}} />
        
        <div className="p-6 bg-white dark:bg-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex flex-col items-center space-y-2 border-t dark:border-gray-700">
           <div className="flex justify-center space-x-12">
               <span className="flex items-center font-bold"><i className="fas fa-anchor mr-2 text-blue-500"></i> Armazém 15</span>
               <span className={`flex items-center font-bold ${useStairs ? 'text-orange-600' : 'text-blue-600'}`}>
                 <i className={`fas ${useStairs ? 'fa-stairs' : 'fa-water'} mr-2`}></i> 
                 Ponto de Desembarque: {useStairs ? 'Cais (Escadaria)' : 'Bacia do Mercado'}
               </span>
           </div>
           {isExtremeTide && (
             <div className="mt-2 bg-orange-100 dark:bg-orange-900/30 px-6 py-2 rounded-full border border-orange-200 dark:border-orange-800">
                <p className="text-orange-700 dark:text-orange-400 font-black uppercase text-center">
                  Atenção: Maré {tideLevel === 'Alta' ? 'Alta (≥ 1.15m)' : 'Baixa (≤ 0.46m)'} - Siga para o Cais
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default QuayMap;
