'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquareShare,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { FeedbackService } from '@/lib/feedback-service';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await FeedbackService.signIn(email, password);
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Failed to sign in. Please verify your email and password.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await FeedbackService.signInDemo();
      if (res.success) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed';
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
          Welcome to PROWETOK
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Sign in to access your business feedback dashboard & QR codes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-7 sm:p-9 shadow-xl shadow-neutral-200/30 dark:shadow-none">
          {/* Quick Demo Login Option */}
          <div className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Instant Demo Preview
                </p>
                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                  Try the dashboard with sample coffee shop data in 1-click:
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-neutral-950 shadow-sm transition-all"
            >
              <span>Explore Demo Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-neutral-900 px-2 text-neutral-400 font-medium">
                Or sign in with Supabase Auth
              </span>
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
                Email Address
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 px-4 py-3 text-sm font-bold text-white dark:text-neutral-950 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Don't have a business account yet?{' '}
            <Link
              href="/signup"
              className="font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Register business
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
