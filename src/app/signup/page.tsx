'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquareShare,
  Mail,
  Lock,
  Store,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { FeedbackService } from '@/lib/feedback-service';

export default function SignUpPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Please enter your business or store name.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await FeedbackService.signUp(email, password, businessName.trim());
      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setConfirmationSent(true);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        setErrorMessage(res.error || 'Failed to create business account.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-500/10 via-neutral-50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <MessageSquareShare className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Create Business Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Get your instant QR code & feedback collection link in seconds
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-7 sm:p-9 shadow-xl shadow-neutral-200/30 dark:shadow-none">
          {confirmationSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Check Your Email
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We sent a confirmation link to <span className="font-semibold text-neutral-900 dark:text-white">{email}</span>. Please click the link in your email, then return to sign in to your dashboard.
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-bold text-neutral-950 shadow-sm"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="mb-6 space-y-2 rounded-2xl bg-neutral-50 dark:bg-neutral-950/60 p-3.5 border border-neutral-200/70 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Instant QR Code ready to print for counters</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Mobile feedback form with zero customer login required</span>
                </div>
              </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Business / Store Name
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Sunset Bistro & Bakery"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Business Owner Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourbusiness.com"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] px-4 py-3 text-sm font-bold text-neutral-950 shadow-md shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Create Account & Get QR Code</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
