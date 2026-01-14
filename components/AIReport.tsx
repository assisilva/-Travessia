
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface GroundingLink {
  title: string;
  uri: string;
}

const AIReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [links, setLinks] = useState<GroundingLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setLinks([]);

    try {
      let lat = -23.9351; // Default Santos/VDC Area
      let lng = -46.3129;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch (e) {
          console.warn("Using default coordinates due to geolocation error", e);
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Fixed model name to gemini-2.5-flash as per Maps Grounding requirements
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Me dê um resumo sobre a situação da região da travessia de catraias entre Santos e Vicente de Carvalho. Mencione terminais próximos, trânsito e se há estabelecimentos úteis abertos agora. Seja conciso e use informações do Google Maps.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        },
      });

      const text = response.text || "Não foi possível gerar o relatório no momento.";
      setReport(text);

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedLinks: GroundingLink[] = chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any) => ({
          title: chunk.maps.title || "Ver no Google Maps",
          uri: chunk.maps.uri
        }));
      
      setLinks(extractedLinks);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        setError("Erro: Modelo não encontrado ou permissão insuficiente. Verifique se o Google Maps Grounding está ativado no seu projeto.");
      } else {
        setError("Falha ao conectar com o serviço de IA. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 border border-blue-200 dark:border-indigo-500/30 rounded-2xl p-6 shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <i className="fas fa-magic text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Insight Inteligente</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">Google Maps + Gemini IA</p>
            </div>
          </div>
          <button 
            onClick={generateReport}
            disabled={loading}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              loading 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <i className="fas fa-circle-notch animate-spin mr-2"></i> Consultando...
              </span>
            ) : 'Consultar Agora'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm mb-4 border border-red-200 dark:border-red-800/50">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        {report ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
              {report.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
            
            {links.length > 0 && (
              <div className="pt-4 border-t border-blue-200 dark:border-indigo-500/20">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i> Referências do Google Maps:
                </p>
                <div className="flex flex-wrap gap-2">
                  {links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    >
                      {link.title} <i className="fas fa-external-link-alt ml-2 opacity-50"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
            Clique para receber um resumo atualizado da região via Google Maps Grounding.
          </p>
        )}

        {loading && (
          <div className="space-y-3 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReport;
