export type StageId =
  | 'INTRO'
  | 'PROGRAM_VALUE_L1'
  | 'PAYMENT_STRUCTURE'
  | 'NBFC'
  | 'RCA'
  | 'KYC'
  | 'END_FLOW';

export interface Stage {
  id: StageId;
  title: string;
}

export const STAGES: Stage[] = [
  { id: 'INTRO', title: 'Intro' },
  { id: 'PROGRAM_VALUE_L1', title: 'Program Value' },
  { id: 'PAYMENT_STRUCTURE', title: 'Payment' },
  { id: 'NBFC', title: 'NBFC' },
  { id: 'RCA', title: 'Co-Applicant' },
  { id: 'KYC', title: 'KYC' },
  { id: 'END_FLOW', title: 'Finish' },
];

export type AgentState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking' | 'error';

export interface User {
  name: string;
  phone: string;
}

export interface Message {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  ts: number;
}

export interface Snapshot {
  user: User | null;
  currentStageId: StageId;
  transcript: Message[];
  completed: boolean;
}
