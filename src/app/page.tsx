'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareShare,
  QrCode,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Store,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';

export default function LandingPage() {
  const [demoRating, setDemoRating] = useState(5);
  const [demoComment, setDemoComment] = useState('Loved the cappuccino and friendly baristas!');
  const [submittedDemo, setSubmittedDemo] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 flex flex-col justify-between">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.1),rgba(0,0,0,0))]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>The 5-Second Customer Feedback Tool</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
                  Turn QR Scans Into{' '}
                  <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Actionable Customer Feedback.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  PROWETOK helps cafes, restaurants, salons, and retail shops collect authentic 1-5 star reviews from patrons right after checkout. No customer login or app downloads required.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] px-7 py-3.5 text-sm sm:text-base font-bold text-neutral-950 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Store className="h-4 w-4" />
                    <span>Create Your Free Business QR</span>
                  </Link>

                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-6 py-3.5 text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200 transition-all shadow-2xs"
                  >
                    <span>Explore Live Demo</span>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>No customer app required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Printable counter QR stand</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Powered by Supabase</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Widget Simulation */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-7 shadow-2xl shadow-neutral-200/50 dark:shadow-none relative">
                  {/* Badge */}
                  <div className="absolute -top-3 right-6 rounded-full bg-amber-500 text-neutral-950 px-3 py-0.5 text-[11px] font-bold shadow-sm">
                    Interactive Customer Preview
                  </div>

                  <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">
                      ☕
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                        Artisan Coffee Roasters
                      </h3>
                      <p className="text-xs text-neutral-500">Scan & rate in 5 seconds</p>
                    </div>
                  </div>

                  {submittedDemo ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                        Review Submitted!
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Average rating updated on the owner's dashboard in real-time.
                      </p>
                      <button
                        onClick={() => setSubmittedDemo(false)}
                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline pt-2"
                      >
                        Try rating again
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="text-center space-y-2">
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          How was your experience?
                        </p>
                        <StarRating
                          value={demoRating}
                          onChange={setDemoRating}
                          interactive={true}
                          size="lg"
                          showLabel={true}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                          Comment (optional)
                        </label>
                        <input
                          type="text"
                          value={demoComment}
                          onChange={(e) => setDemoComment(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSubmittedDemo(true)}
                        className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 text-xs font-bold text-neutral-950 transition-all cursor-pointer shadow-sm"
                      >
                        Submit Feedback (5★)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-16 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Everything Small Businesses Need to Collect Real Feedback
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Built specifically for counter businesses, restaurants, and service providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <QrCode className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Instant QR & Printable Stand
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Generate high-contrast QR codes and ready-to-print table tent cards formatted for store counters and dining tables.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Zero Friction For Customers
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Mobile-optimized forms load in under a second. Customers give 1-5 star ratings and comments without creating an account.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Real-time Owner Dashboard
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  View aggregated star averages, total submissions, sentiment ratios, rating distribution bar charts, and export CSV reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-neutral-950 font-bold">
              <MessageSquareShare className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              PROWETOK
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} PROWETOK. Built with Next.js, Tailwind CSS & Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
