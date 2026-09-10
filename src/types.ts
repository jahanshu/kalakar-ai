export type Language = 'en' | 'hi';

export type TabType = 'home' | 'products' | 'negotiator' | 'analytics' | 'settings' | 'add-new';

export interface Product {
  id: string;
  title: string;
  hindiTitle?: string;
  category: string;
  tags: string[];
  description: string;
  hindiDescription?: string;
  minPrice: number;
  maxPrice: number;
  imageUrl: string;
  voiceTranscript?: string;
  status: 'published' | 'draft';
  createdAt: string;
  views: number;
  shares: number;
  inquiries: number;
  whatsappMessage?: string;
  instagramCaption?: string;
}

export interface ArtisanProfile {
  id: string;
  name: string;
  hindiName: string;
  title: string;
  location: string;
  craft: string;
  avatar: string;
  story: string;
  ngoPartner: string;
  phone: string;
  totalProducts: number;
  activeListings: number;
  totalShares: number;
}

export interface SampleCraft {
  id: string;
  name: string;
  hindiName: string;
  category: string;
  imageUrl: string;
  voiceTranscript: string;
  estimatedPrice: string;
}

export interface ReplyStrategy {
  id: 'firm' | 'compromise' | 'closer';
  name: string;
  hindiName: string;
  badge: string;
  tacticAdvice: string;
  englishMessage: string;
  hindiMessage: string;
}

export interface SmartReplyResult {
  buyerIntent: string;
  sentiment: string;
  challengeLevel: 'Low' | 'Medium' | 'High';
  priceDefensePoints: string[];
  strategies: ReplyStrategy[];
}
