export type Role = 'customer' | 'assistant';
export type Confidence = 'high' | 'medium' | 'low';

/** What the model concluded about a customer's message. */
export interface Analysis {
  buyingInterest: boolean;
  /** false = the business info did not cover the question */
  answerable: boolean;
  confidence: Confidence;
  reason: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  at: number;
  /** only set on customer messages */
  analysis?: Analysis;
}

export interface Conversation {
  id: string;
  customer: string;
  messages: Message[];
  updatedAt: number;
  interested: boolean;
}

export interface Business {
  name: string;
  about: string;
  products: string;
  policies: string;
}

export interface Settings {
  baseUrl: string;
  model: string;
}

export type Tab = 'chat' | 'business' | 'dashboard' | 'settings';
