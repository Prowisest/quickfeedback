'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Store,
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  MessageSquare,
  User,
  HeartHandshake,
} from 'lucide-react';
import { FeedbackService } from '@/lib/feedback-service';
import { Business } from '@/lib/types';
import StarRating from '@/components/StarRating';

export default function PublicFeedbackPage() {
  const params = useParams();
  const businessId = params?.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadBusiness() {
      if (!businessId) return;
      try {
        const data = await FeedbackService.getBusinessById(businessId);
        if (data) {
          setBusiness(data);
        } else {
          // If in demo mode and ID doesn't exist, create a friendly fallback business
          setBusiness({
            id: businessId,
            name: 'Local Business',
            email: 'feedback@business.local',
            created_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error fetching business:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [businessId]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#6366f1'],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (rating === 0) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await FeedbackService.submitFeedback({
        business_id: businessId,
        customer_name: customerName.trim() || null,
        rating,
        comment: comment.trim() || null,
      });

      if (res.success) {
        setIsSubmitted(true);
        triggerConfetti();
      } else {
        setErrorMessage(res.error || 'Failed to submit feedback. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setCustomerName('');
    setComment('');
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Loading feedback form...
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-8 text-center shadow-lg border border-neutral-200 dark:border-neutral-800">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Business Not Found
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            We couldn't locate a business matching this feedback link. Please make sure the link is correct.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500/10 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Container */}
      <div className="w-full max-w-lg mx-auto">
        {/* Top Business Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 mb-3">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {business?.name || 'Customer Feedback'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Your honest feedback helps us serve you better
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl shadow-neutral-200/40 dark:shadow-none transition-all">
          {isSubmitted ? (
            /* Thank you confirmation screen */
            <div className="text-center py-6 space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Thank You So Much!
                </h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Your feedback has been successfully submitted to{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {business?.name}
                  </span>
                  . We deeply appreciate your time!
                </p>
              </div>

              {/* Submitted rating recap */}
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                <StarRating value={rating} size="md" interactive={false} />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Submit Another Response</span>
                </button>
              </div>
            </div>
          ) : (
            /* Feedback Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating Section */}
              <div className="text-center space-y-3 pb-2">
                <label className="block text-sm sm:text-base font-semibold text-neutral-900 dark:text-white">
                  How was your overall experience? <span className="text-amber-500">*</span>
                </label>
                <div className="py-2">
                  <StarRating
                    value={rating}
                    onChange={(val) => {
                      setRating(val);
                      setErrorMessage(null);
                    }}
                    interactive={true}
                    size="xl"
                    showLabel={true}
                  />
                </div>
                {rating === 0 && (
                  <p className="text-xs text-neutral-400">
                    Tap a star to rate from 1 (poor) to 5 (excellent)
                  </p>
                )}
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 space-y-4">
                {/* Optional Customer Name */}
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                      Your Name
                    </span>
                    <span className="text-[11px] font-normal text-neutral-400">
                      Optional
                    </span>
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    maxLength={60}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>

                {/* Comment Textarea */}
                <div>
                  <label
                    htmlFor="comment"
                    className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                      Your Comments or Suggestions
                    </span>
                    <span className="text-[11px] font-normal text-neutral-400">
                      Optional
                    </span>
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you enjoy most, or what could we improve next time?"
                    maxLength={600}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                  />
                  <div className="mt-1 text-right text-[11px] text-neutral-400">
                    {comment.length}/600
                  </div>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/25 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-amber-500" />
            Powered by PROWETOK • Quick, seamless reviews
          </p>
        </div>
      </div>
    </div>
  );
}
