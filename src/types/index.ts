// src/types/index.ts

export type ReportType = 
  | "robo" 
  | "vehiculo_sospechoso" 
  | "emergencia_medica" 
  | "microtrafico" 
  | "otro";

export type ReportStatus = "pending" | "confirmed" | "fake";

export type VoteType = "confirmed" | "doubtful";

export interface Report {
  id?: string;
  type: ReportType;
  description: string;
  status: ReportStatus;
  authorId: string;
  authorNickname: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  mediaUrl?: string;
  confirmations: number;
  doubts: number;
  createdAt: Date;
}

export interface User {
  id?: string;
  nickname: string;
  trustScore: number;
  reportsCount: number;
  neighborhood: string;
  createdAt: Date;
}

export interface Validation {
  id?: string;
  reportId: string;
  userId: string;
  vote: VoteType;
  createdAt: Date;
}