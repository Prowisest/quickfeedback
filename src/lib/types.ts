export interface Business {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  business_id: string;
  customer_name: string | null;
  rating: number; // 1 to 5
  comment: string | null;
  created_at: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalResponses: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  positivePercentage: number; // % of 4 and 5 stars
}

export interface UserSession {
  id: string;
  email: string;
  businessId: string;
  businessName: string;
}
