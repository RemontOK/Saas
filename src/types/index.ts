export type Lead = {
  id: number;
  company: string;
  location: string;
  website: string;
  email?: string;
  phone?: string;
  source?: string;
  rating?: number;
  reviews?: number;
  instagram?: string;
  openedAt?: number;
  emailQuality?: 'verified' | 'guessed' | 'unknown';
}

export type SearchParams = {
  niche: string;
  location: string;
  limit: number;
  minReviews: number;
  recentOnly: boolean;
  hasInstagram: boolean;
}

export type CheckoutData = {
  plan: string;
  email: string;
  notes: string;
}

export type ApiResponse<T> = {
  items?: T[];
  ok?: boolean;
  error?: string;
}
