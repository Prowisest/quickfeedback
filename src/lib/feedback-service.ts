import { createClient, isSupabaseConfigured } from './supabase/client';
import { Business, Feedback, FeedbackStats } from './types';

// Default Demo Businesses for instant offline testing
const DEMO_BUSINESS_ID = 'a0000000-0000-0000-0000-000000000001';
const DEMO_BUSINESS: Business = {
  id: DEMO_BUSINESS_ID,
  name: 'Artisan Coffee & Bakery',
  email: 'owner@artisancoffee.demo',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const INITIAL_DEMO_FEEDBACK: Feedback[] = [
  {
    id: 'f1000000-0000-0000-0000-000000000001',
    business_id: DEMO_BUSINESS_ID,
    customer_name: 'Sarah Jenkins',
    rating: 5,
    comment: 'The oat milk latte and almond croissant were divine! Best coffee spot in town, love the cozy vibe.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000002',
    business_id: DEMO_BUSINESS_ID,
    customer_name: 'Michael Chang',
    rating: 5,
    comment: 'Super friendly staff and very fast service even during the morning rush. The mobile ordering QR is super convenient!',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000003',
    business_id: DEMO_BUSINESS_ID,
    customer_name: 'Emily Watson',
    rating: 4,
    comment: 'Great espresso blend. Would love to see more vegan pastry options on weekdays, but otherwise flawless.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000004',
    business_id: DEMO_BUSINESS_ID,
    customer_name: 'David K.',
    rating: 3,
    comment: 'Good coffee and friendly baristas, but table seating was quite crowded and noisy around 11am.',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'f1000000-0000-0000-0000-000000000005',
    business_id: DEMO_BUSINESS_ID,
    customer_name: null,
    rating: 5,
    comment: 'Love the loyalty card program and the relaxing acoustic playlist. Will definitely be a regular!',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper to access LocalStorage for demo mode
const getLocalBusinesses = (): Business[] => {
  if (typeof window === 'undefined') return [DEMO_BUSINESS];
  try {
    const data = localStorage.getItem('prowetok_businesses') || localStorage.getItem('quickfeedback_businesses');
    if (!data) {
      localStorage.setItem('prowetok_businesses', JSON.stringify([DEMO_BUSINESS]));
      return [DEMO_BUSINESS];
    }
    return JSON.parse(data);
  } catch {
    return [DEMO_BUSINESS];
  }
};

const saveLocalBusinesses = (businesses: Business[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prowetok_businesses', JSON.stringify(businesses));
  }
};

const getLocalFeedback = (): Feedback[] => {
  if (typeof window === 'undefined') return INITIAL_DEMO_FEEDBACK;
  try {
    const data = localStorage.getItem('prowetok_feedback') || localStorage.getItem('quickfeedback_feedback');
    if (!data) {
      localStorage.setItem('prowetok_feedback', JSON.stringify(INITIAL_DEMO_FEEDBACK));
      return INITIAL_DEMO_FEEDBACK;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_DEMO_FEEDBACK;
  }
};

const saveLocalFeedback = (feedback: Feedback[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prowetok_feedback', JSON.stringify(feedback));
  }
};

export const FeedbackService = {
  /**
   * Get Business details by ID (Public & Private)
   */
  async getBusinessById(businessId: string): Promise<Business | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (!error && data) return data as Business;
      } catch (err) {
        console.warn('Supabase fetch error, checking local fallback:', err);
      }
    }

    // Demo / Local storage fallback
    const businesses = getLocalBusinesses();
    return businesses.find((b) => b.id === businessId) || null;
  },

  /**
   * Get current authenticated user's business profile
   */
  async getCurrentBusiness(): Promise<{ business: Business | null; userEmail: string | null }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { business: null, userEmail: null };

        const { data: business } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (business) {
          return { business: business as Business, userEmail: user.email || null };
        }

        // If trigger didn't run or table empty, try to create or match by email
        if (user.email) {
          const { data: fallbackBiz } = await supabase
            .from('businesses')
            .select('*')
            .eq('email', user.email)
            .single();

          if (fallbackBiz) {
            return { business: fallbackBiz as Business, userEmail: user.email };
          }
        }
      } catch (err) {
        console.warn('Error fetching Supabase business, checking demo session:', err);
      }
    }

    // Demo Session check
    if (typeof window !== 'undefined') {
      const demoSession = localStorage.getItem('prowetok_current_session') || localStorage.getItem('quickfeedback_current_session');
      if (demoSession) {
        const session = JSON.parse(demoSession);
        const businesses = getLocalBusinesses();
        const biz = businesses.find((b) => b.id === session.businessId) || DEMO_BUSINESS;
        return { business: biz, userEmail: session.email };
      }
    }

    return { business: null, userEmail: null };
  },

  /**
   * Register a new business owner
   */
  async signUp(email: string, password: string, businessName: string): Promise<{ success: boolean; business?: Business; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: businessName,
            },
          },
        });

        if (error) throw error;
        if (data.user) {
          // Verify if row was inserted into businesses table
          let { data: biz } = await supabase
            .from('businesses')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (!biz) {
            // Manual insertion in case trigger is not yet installed in Supabase
            const { data: newBiz, error: insertError } = await supabase
              .from('businesses')
              .insert({
                user_id: data.user.id,
                name: businessName,
                email: email,
              })
              .select()
              .single();

            if (!insertError && newBiz) {
              biz = newBiz;
            }
          }

          if (biz) {
            return { success: true, business: biz as Business };
          }
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        return { success: false, error: message };
      }
    }

    // Local / Demo Mode Registration
    const newBizId = 'biz_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const newBusiness: Business = {
      id: newBizId,
      name: businessName,
      email: email,
      created_at: new Date().toISOString(),
    };

    const businesses = getLocalBusinesses();
    businesses.push(newBusiness);
    saveLocalBusinesses(businesses);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'prowetok_current_session',
        JSON.stringify({
          id: 'user_' + newBizId,
          email: email,
          businessId: newBizId,
          businessName: businessName,
        })
      );
    }

    return { success: true, business: newBusiness };
  },

  /**
   * Log in business owner
   */
  async signIn(email: string, password?: string): Promise<{ success: boolean; business?: Business; error?: string }> {
    if (isSupabaseConfigured() && password) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          const { data: biz } = await supabase
            .from('businesses')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (biz) {
            return { success: true, business: biz as Business };
          }
          return { success: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        return { success: false, error: message };
      }
    }

    // Demo Mode Sign In
    const businesses = getLocalBusinesses();
    let biz = businesses.find((b) => b.email.toLowerCase() === email.toLowerCase());

    if (!biz) {
      // Default to demo coffee shop if logging in with demo account
      biz = DEMO_BUSINESS;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'prowetok_current_session',
        JSON.stringify({
          id: 'user_' + biz.id,
          email: biz.email,
          businessId: biz.id,
          businessName: biz.name,
        })
      );
    }

    return { success: true, business: biz };
  },

  /**
   * Sign out current business owner
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('prowetok_current_session');
      localStorage.removeItem('quickfeedback_current_session');
    }
  },

  /**
   * Update Business Profile Name
   */
  async updateBusinessName(businessId: string, newName: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('businesses')
          .update({ name: newName })
          .eq('id', businessId);

        if (!error) return true;
      } catch (err) {
        console.warn('Error updating business in Supabase:', err);
      }
    }

    // Local / Demo update
    const businesses = getLocalBusinesses();
    const index = businesses.findIndex((b) => b.id === businessId);
    if (index !== -1) {
      businesses[index].name = newName;
      saveLocalBusinesses(businesses);

      // update current session if matched
      if (typeof window !== 'undefined') {
        const session = localStorage.getItem('prowetok_current_session') || localStorage.getItem('quickfeedback_current_session');
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed.businessId === businessId) {
            parsed.businessName = newName;
            localStorage.setItem('prowetok_current_session', JSON.stringify(parsed));
          }
        }
      }
      return true;
    }
    return false;
  },

  /**
   * Submit Feedback (Public, no customer login required)
   */
  async submitFeedback(data: {
    business_id: string;
    customer_name?: string | null;
    rating: number;
    comment?: string | null;
  }): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('feedback').insert({
          business_id: data.business_id,
          customer_name: data.customer_name?.trim() || null,
          rating: data.rating,
          comment: data.comment?.trim() || null,
        });

        if (error) throw error;
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to submit feedback';
        console.warn('Supabase submission failed, recording locally:', message);
      }
    }

    // Local / Demo storage
    const allFeedback = getLocalFeedback();
    const newFeedback: Feedback = {
      id: 'f_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
      business_id: data.business_id,
      customer_name: data.customer_name?.trim() || null,
      rating: data.rating,
      comment: data.comment?.trim() || null,
      created_at: new Date().toISOString(),
    };

    allFeedback.unshift(newFeedback); // Newest first
    saveLocalFeedback(allFeedback);
    return { success: true };
  },

  /**
   * Get all feedback submissions for a business (Newest first)
   */
  async getFeedbackForBusiness(businessId: string): Promise<Feedback[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Feedback[];
        }
      } catch (err) {
        console.warn('Error fetching feedback from Supabase:', err);
      }
    }

    // Local / Demo storage fallback
    const allFeedback = getLocalFeedback();
    return allFeedback.filter((f) => f.business_id === businessId);
  },

  /**
   * Calculate aggregated metrics from feedback list
   */
  calculateStats(feedbackList: Feedback[]): FeedbackStats {
    const totalResponses = feedbackList.length;

    if (totalResponses === 0) {
      return {
        averageRating: 0,
        totalResponses: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        positivePercentage: 0,
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let positiveCount = 0; // 4 or 5 stars

    for (const item of feedbackList) {
      const r = Math.min(5, Math.max(1, Math.round(item.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[r] = (distribution[r] || 0) + 1;
      sum += item.rating;
      if (item.rating >= 4) {
        positiveCount++;
      }
    }

    const averageRating = Number((sum / totalResponses).toFixed(1));
    const positivePercentage = Math.round((positiveCount / totalResponses) * 100);

    return {
      averageRating,
      totalResponses,
      ratingDistribution: distribution,
      positivePercentage,
    };
  },
};
