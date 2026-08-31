import { createClient, isSupabaseConfigured } from './supabase/client';
import { Business, Feedback, FeedbackStats } from './types';

// Default Demo Businesses for instant testing
export const DEMO_BUSINESS_ID = 'a0000000-0000-0000-0000-000000000001';
export const DEMO_BUSINESS: Business = {
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

// Local Storage Accessors
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
   * One-click Demo Sign In (Works everywhere, with or without live Supabase)
   */
  async signInDemo(): Promise<{ success: boolean; business: Business }> {
    const biz = DEMO_BUSINESS;
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
          .maybeSingle();

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
    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const userEmail = user.email ? user.email.trim().toLowerCase() : null;
          console.log('[PROWETOK Debug] Supabase Auth User detected:', {
            userId: user.id,
            email: userEmail,
          });

          // Look up in businesses table by user_id
          let { data: business, error: bizErr } = await supabase
            .from('businesses')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (bizErr) {
            console.warn('[PROWETOK Debug] Error querying businesses by user_id:', bizErr);
          }

          if (business) {
            console.log('[PROWETOK Debug] Found business record by user_id:', business);
            if (typeof window !== 'undefined') {
              localStorage.setItem(
                'prowetok_current_session',
                JSON.stringify({
                  id: 'user_' + user.id,
                  email: userEmail || business.email,
                  businessId: business.id,
                  businessName: business.name,
                })
              );
            }
            return { business: business as Business, userEmail: userEmail || business.email };
          }

          // Try match by email
          if (userEmail) {
            const { data: fallbackBiz } = await supabase
              .from('businesses')
              .select('*')
              .eq('email', userEmail)
              .maybeSingle();

            if (fallbackBiz) {
              console.log('[PROWETOK Debug] Found business record by email:', fallbackBiz);
              // Link user_id if not set or mismatched
              if (fallbackBiz.user_id !== user.id) {
                console.log('[PROWETOK Debug] Linking user_id to business record...');
                await supabase.from('businesses').update({ user_id: user.id }).eq('id', fallbackBiz.id);
                fallbackBiz.user_id = user.id;
              }
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  'prowetok_current_session',
                  JSON.stringify({
                    id: 'user_' + user.id,
                    email: userEmail,
                    businessId: fallbackBiz.id,
                    businessName: fallbackBiz.name,
                  })
                );
              }
              return { business: fallbackBiz as Business, userEmail: userEmail };
            }
          }

          // If no record exists yet, automatically create one so dashboard never fails
          const bizName =
            user.user_metadata?.business_name ||
            (userEmail ? userEmail.split('@')[0] : 'My Business');

          console.log('[PROWETOK Debug] No existing business found, auto-provisioning new record for:', bizName);

          try {
            const { data: createdBiz, error: createErr } = await supabase
              .from('businesses')
              .insert({
                user_id: user.id,
                name: bizName,
                email: userEmail || 'owner@business.com',
              })
              .select()
              .single();

            if (!createErr && createdBiz) {
              console.log('[PROWETOK Debug] Successfully auto-provisioned business:', createdBiz);
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  'prowetok_current_session',
                  JSON.stringify({
                    id: 'user_' + user.id,
                    email: userEmail || createdBiz.email,
                    businessId: createdBiz.id,
                    businessName: createdBiz.name,
                  })
                );
              }
              return { business: createdBiz as Business, userEmail: userEmail || createdBiz.email };
            } else if (createErr) {
              console.warn('[PROWETOK Debug] Auto-provision insert error (RLS check):', createErr);
            }
          } catch (insertErr) {
            console.warn('[PROWETOK Debug] Insert exception:', insertErr);
          }

          // Resilient fallback for authenticated user
          const tempBiz: Business = {
            id: user.id,
            user_id: user.id,
            name: bizName,
            email: userEmail || 'owner@business.com',
            created_at: user.created_at || new Date().toISOString(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'prowetok_current_session',
              JSON.stringify({
                id: 'user_' + user.id,
                email: userEmail || tempBiz.email,
                businessId: tempBiz.id,
                businessName: tempBiz.name,
              })
            );
          }

          console.log('[PROWETOK Debug] Using temporary business session fallback:', tempBiz);
          return {
            business: tempBiz,
            userEmail: userEmail,
          };
        }
      } catch (err) {
        console.warn('[PROWETOK Debug] Error fetching Supabase business, checking demo session:', err);
      }
    }

    // 2. Demo Session check from LocalStorage
    if (typeof window !== 'undefined') {
      const demoSession =
        localStorage.getItem('prowetok_current_session') ||
        localStorage.getItem('quickfeedback_current_session');

      if (demoSession) {
        try {
          const session = JSON.parse(demoSession);
          const businesses = getLocalBusinesses();
          const biz = businesses.find((b) => b.id === session.businessId) || {
            id: session.businessId || DEMO_BUSINESS_ID,
            name: session.businessName || DEMO_BUSINESS.name,
            email: session.email || DEMO_BUSINESS.email,
            created_at: new Date().toISOString(),
          };
          return { business: biz, userEmail: session.email };
        } catch {
          // ignore corrupted local storage
        }
      }
    }

    return { business: null, userEmail: null };
  },

  /**
   * Register a new business owner
   */
  async signUp(
    email: string,
    password: string,
    businessName: string
  ): Promise<{ success: boolean; business?: Business; error?: string; requiresEmailConfirmation?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = businessName.trim();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              business_name: cleanName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // If Supabase has email confirmation enabled and session is not returned
          if (!data.session) {
            return {
              success: true,
              requiresEmailConfirmation: true,
            };
          }

          // User is authenticated immediately -> Create or verify business row
          let { data: biz } = await supabase
            .from('businesses')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (!biz) {
            const { data: newBiz } = await supabase
              .from('businesses')
              .insert({
                user_id: data.user.id,
                name: cleanName,
                email: cleanEmail,
              })
              .select()
              .single();

            if (newBiz) {
              biz = newBiz;
            }
          }

          const resolvedBiz = biz || {
            id: data.user.id,
            user_id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            created_at: new Date().toISOString(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'prowetok_current_session',
              JSON.stringify({
                id: 'user_' + data.user.id,
                email: cleanEmail,
                businessId: resolvedBiz.id,
                businessName: resolvedBiz.name,
              })
            );
          }

          return { success: true, business: resolvedBiz as Business };
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
      name: cleanName,
      email: cleanEmail,
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
          email: cleanEmail,
          businessId: newBizId,
          businessName: cleanName,
        })
      );
    }

    return { success: true, business: newBusiness };
  },

  /**
   * Log in business owner
   */
  async signIn(email: string, password?: string): Promise<{ success: boolean; business?: Business; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // If logging in with demo account, direct to demo mode
    if (cleanEmail === 'owner@artisancoffee.demo') {
      return this.signInDemo();
    }

    if (isSupabaseConfigured() && password) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const msg = error.message;
          if (msg.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              error: 'Please confirm your email address before signing in. Check your inbox (or spam) for the confirmation link.',
            };
          }
          if (msg.toLowerCase().includes('invalid login credentials')) {
            return {
              success: false,
              error: 'Invalid email or password. If you registered previously in Demo Mode or before connecting Supabase, please create a new business account.',
            };
          }
          return { success: false, error: msg };
        }

        if (data.user) {
          const userEmail = data.user.email ? data.user.email.trim().toLowerCase() : cleanEmail;

          const { data: biz } = await supabase
            .from('businesses')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          const resolvedBiz: Business = biz || {
            id: data.user.id,
            user_id: data.user.id,
            name: data.user.user_metadata?.business_name || (userEmail ? userEmail.split('@')[0] : 'My Business'),
            email: userEmail,
            created_at: data.user.created_at || new Date().toISOString(),
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'prowetok_current_session',
              JSON.stringify({
                id: 'user_' + data.user.id,
                email: userEmail,
                businessId: resolvedBiz.id,
                businessName: resolvedBiz.name,
              })
            );
          }

          return { success: true, business: resolvedBiz };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        return { success: false, error: message };
      }
    }

    // Local / Demo Mode Sign In
    const businesses = getLocalBusinesses();
    let biz = businesses.find((b) => b.email.toLowerCase() === cleanEmail);

    if (!biz) {
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
   * Send Password Reset Email (Supabase Auth)
   */
  async sendPasswordResetEmail(email: string, redirectTo?: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const origin =
          typeof window !== 'undefined'
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUrl = redirectTo || `${origin}/reset-password`;

        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

        if (error) throw error;
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to send password reset email';
        return { success: false, error: message };
      }
    }

    // Demo Mode simulation
    return { success: true };
  },

  /**
   * Update User Password (Used after password reset token/session is verified)
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update password';
        return { success: false, error: message };
      }
    }

    // Demo Mode simulation
    return { success: true };
  },

  /**
   * Update Business Profile Name
   */
  async updateBusinessName(businessId: string, newName: string): Promise<boolean> {
    const cleanName = newName.trim();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('businesses')
          .update({ name: cleanName })
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
      businesses[index].name = cleanName;
      saveLocalBusinesses(businesses);
    }

    if (typeof window !== 'undefined') {
      const session =
        localStorage.getItem('prowetok_current_session') ||
        localStorage.getItem('quickfeedback_current_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.businessId === businessId) {
            parsed.businessName = cleanName;
            localStorage.setItem('prowetok_current_session', JSON.stringify(parsed));
          }
        } catch {
          // ignore
        }
      }
    }
    return true;
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

        if (!error) return { success: true };
        console.warn('Supabase insert error, saving to local fallback:', error.message);
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
  async getFeedbackForBusiness(businessId: string, userId?: string): Promise<Feedback[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();

        // Collect all potential matching business IDs
        const idsToQuery = new Set<string>();
        if (businessId) idsToQuery.add(businessId);
        if (userId) idsToQuery.add(userId);

        // Fetch any business records in DB linked to this user_id
        if (userId) {
          try {
            const { data: userBizList } = await supabase
              .from('businesses')
              .select('id, user_id')
              .eq('user_id', userId);

            if (userBizList) {
              userBizList.forEach((b) => {
                if (b.id) idsToQuery.add(b.id);
              });
            }
          } catch {
            // ignore
          }
        }

        const targetIds = Array.from(idsToQuery);
        console.log('[PROWETOK Debug] Querying Supabase feedback table for business_ids:', targetIds, {
          businessId,
          userId,
        });

        let data: Feedback[] | null = null;
        let error: unknown = null;

        if (targetIds.length === 1) {
          const res = await supabase
            .from('feedback')
            .select('*')
            .eq('business_id', targetIds[0])
            .order('created_at', { ascending: false });
          data = res.data as Feedback[] | null;
          error = res.error;
        } else if (targetIds.length > 1) {
          const res = await supabase
            .from('feedback')
            .select('*')
            .in('business_id', targetIds)
            .order('created_at', { ascending: false });
          data = res.data as Feedback[] | null;
          error = res.error;
        }

        if (error) {
          console.error('[PROWETOK Debug] Supabase error querying feedback (check RLS policies):', error);
        } else {
          console.log('[PROWETOK Debug] Supabase returned feedback rows count:', data?.length || 0, data);
          if (data && data.length > 0) {
            return data;
          }
        }
      } catch (err) {
        console.error('[PROWETOK Debug] Exception fetching feedback from Supabase:', err);
      }
    }

    // Local / Demo storage fallback
    const allFeedback = getLocalFeedback();
    const filtered = allFeedback.filter(
      (f) => f.business_id === businessId || (userId && f.business_id === userId)
    );
    console.log('[PROWETOK Debug] Returning fallback local feedback:', filtered.length, 'items');
    return filtered;
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
