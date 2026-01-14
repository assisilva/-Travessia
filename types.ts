
export enum CrossingStatus {
  LIBERADA = 'Normal',
  ATENCAO = 'Atenção: Escadaria',
  PARALISADA = 'Interrompida',
}

export enum TideLevel {
  ALTA = 'Alta',
  BAIXA = 'Baixa',
  INTERMEDIARIA = 'Intermediária',
}

export type InterruptionType = 
  | 'MARÉ ALTA' 
  | 'MARÉ BAIXA' 
  | 'NAVIO PASSANDO' 
  | 'NAVIO ATRACADO ARMZ 15' 
  | 'NAVIO ENTRANDO ARMZ 15' 
  | 'NAVIO SAINDO ARMZ 15' 
  | 'NAVIO MANOBRANDO';

export interface HistoryEntry {
  timestamp: Date;
  reason: string;
  type: InterruptionType;
}

export interface TideEvent {
  type: 'Alta' | 'Baixa';
  time: string;
  dateTime: Date;
  height: number;
}

export interface DailyTideForecast {
  date: string;
  dayOfWeek: string;
  forecast: TideEvent[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}
