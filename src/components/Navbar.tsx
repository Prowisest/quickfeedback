'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquareShare, LogOut, Store, Sparkles, ExternalLink } from 'lucide-react';
import { Business } from '@/lib/types';
import { FeedbackService } from '@/lib/feedback-service';

interface NavbarProps {
  business?: Business | null;
  userEmail?: string | null;
  onLogout?: () => void;
}

export default function Navbar({ business, userEmail, onLogout }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await FeedbackService.signOut();
    if (onLogout) {
      onLogout();
    } else {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <MessageSquareShare className="h-5 w-5 text-neutral-950 font-bold" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
              PROWETOK
              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                PRO
              </span>
            </span>
            <span className="hidden sm:block text-[11px] text-neutral-500 dark:text-neutral-400 -mt-1">
              Customer Feedback for Small Business
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {business ? (
            <div className="flex items-center gap-3">
              {/* Public link button */}
              <Link
                href={`/feedback/${business.id}`}
                target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="View your public customer feedback form"
              >
                <ExternalLink className="h-3.5 w-3.5 text-amber-500" />
                <span>View Public Form</span>
              </Link>

              {/* Business Name Badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800">
                <Store className="h-4 w-4 text-amber-500" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white leading-tight truncate max-w-[140px]">
                    {business.name}
                  </p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-none truncate max-w-[140px]">
                    {userEmail || business.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 hover:border-red-200 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-950 shadow-sm transition-all duration-150 hover:shadow"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
