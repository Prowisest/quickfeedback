'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Users,
  TrendingUp,
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  RefreshCw,
  Edit2,
  Check,
  X,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { FeedbackService } from '@/lib/feedback-service';
import { Business, Feedback, FeedbackStats } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import StarRating from '@/components/StarRating';
import QRCodeCard from '@/components/QRCodeCard';

export default function DashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    averageRating: 0,
    totalResponses: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    positivePercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Business Name Editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const loadDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const { business: currentBiz, userEmail: email } = await FeedbackService.getCurrentBusiness();

      if (!currentBiz) {
        // Not logged in -> redirect to login
        router.push('/login');
        return;
      }

      setBusiness(currentBiz);
      setUserEmail(email);
      setNewName(currentBiz.name);

      const items = await FeedbackService.getFeedbackForBusiness(currentBiz.id);
      setFeedbackList(items);
      setStats(FeedbackService.calculateStats(items));
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSaveBusinessName = async () => {
    if (!business || !newName.trim()) return;
    setSavingName(true);
    try {
      const ok = await FeedbackService.updateBusinessName(business.id, newName.trim());
      if (ok) {
        setBusiness({ ...business, name: newName.trim() });
        setIsEditingName(false);
      }
    } finally {
      setSavingName(false);
    }
  };

  const exportToCSV = () => {
    if (feedbackList.length === 0) return;

    const headers = ['ID', 'Customer Name', 'Rating', 'Comment', 'Submitted At'];
    const rows = feedbackList.map((item) => [
      `"${item.id}"`,
      `"${(item.customer_name || 'Anonymous').replace(/"/g, '""')}"`,
      item.rating,
      `"${(item.comment || '').replace(/"/g, '""')}"`,
      `"${item.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${(business?.name || 'feedback').toLowerCase().replace(/\s+/g, '-')}-feedback-export.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and Sort Feedback
  const filteredFeedback = useMemo(() => {
    let result = [...feedbackList];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          (f.customer_name && f.customer_name.toLowerCase().includes(q)) ||
          (f.comment && f.comment.toLowerCase().includes(q))
      );
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      result = result.filter((f) => f.rating === ratingFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });

    return result;
  }, [feedbackList, searchQuery, ratingFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
            <p className="text-sm font-medium text-neutral-500">Loading your feedback dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950 pb-16">
      <Navbar business={business} userEmail={userEmail} onLogout={() => router.push('/login')} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Dashboard Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-lg font-bold text-neutral-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveBusinessName}
                    disabled={savingName}
                    className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(business.name);
                    }}
                    className="p-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                    {business.name}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
                    title="Edit business name"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Real-time customer feedback, average ratings, and QR distribution
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={feedbackList.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Section 1: Top Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Average Rating */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Average Rating
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white">
                {stats.totalResponses > 0 ? stats.averageRating : '0.0'}
              </span>
              <span className="text-sm font-medium text-neutral-400">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <StarRating value={Math.round(stats.averageRating)} size="sm" interactive={false} />
              <span className="text-[11px] text-neutral-500 ml-1">
                ({stats.totalResponses} {stats.totalResponses === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Card 2: Total Responses */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Total Responses
              </span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white">
                {stats.totalResponses}
              </span>
              <span className="text-xs font-medium text-neutral-400">submissions</span>
            </div>
            <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              Across all QR scans & feedback links
            </p>
          </div>

          {/* Card 3: Positive Feedback % */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Customer Satisfaction
              </span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white">
                {stats.totalResponses > 0 ? `${stats.positivePercentage}%` : '0%'}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
                4-5 ★ ratings
              </span>
            </div>
            <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              Proportion of positive customer ratings
            </p>
          </div>

          {/* Card 4: Rating Breakdown Bars */}
          <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 p-5 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Rating Distribution
            </span>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.ratingDistribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
                const percentage =
                  stats.totalResponses > 0 ? Math.round((count / stats.totalResponses) * 100) : 0;

                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-neutral-600 dark:text-neutral-400 font-medium">
                      {stars}
                    </span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[11px] text-neutral-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: QR Code & Feedback Link Generator */}
        <QRCodeCard business={business} />

        {/* Section 3: Feedback Submissions Feed */}
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          {/* Feed Header with Search & Filter Controls */}
          <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  Customer Feedback Feed
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Showing {filteredFeedback.length} of {feedbackList.length} total submissions (newest first)
                </p>
              </div>

              {/* Star Rating Quick Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setRatingFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    ratingFilter === 'all'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  All ({feedbackList.length})
                </button>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] || 0;
                  return (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        ratingFilter === rating
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      <span>{rating}</span>
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Sorting */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search comments or customer names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 pl-9 pr-4 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-500 focus:bg-white dark:focus:bg-neutral-900 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ArrowUpDown className="h-4 w-4 text-neutral-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating (5-1)</option>
                  <option value="lowest">Lowest Rating (1-5)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback List Items */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => {
                const initials = item.customer_name
                  ? item.customer_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '★';

                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 hover:bg-neutral-50/70 dark:hover:bg-neutral-950/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Customer Info & Avatar */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            item.rating >= 4
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.rating === 3
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">
                            {item.customer_name || 'Anonymous Customer'}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating value={item.rating} size="sm" interactive={false} />
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                              {item.rating}.0
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timestamp Badge */}
                      <div className="text-right">
                        <span className="inline-flex rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Comment */}
                    {item.comment ? (
                      <div className="mt-3.5 pl-13 pr-4">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50/80 dark:bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                          "{item.comment}"
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 pl-13">
                        <p className="text-xs italic text-neutral-400">
                          No written comment provided with this rating.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Empty state */
              <div className="p-12 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                  {searchQuery || ratingFilter !== 'all'
                    ? 'No matching feedback found'
                    : 'No feedback submitted yet'}
                </h4>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  {searchQuery || ratingFilter !== 'all'
                    ? 'Try clearing your search query or selecting "All" ratings.'
                    : 'Share your feedback link or print your counter QR code stand to begin collecting customer reviews!'}
                </p>
                {(searchQuery || ratingFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setRatingFilter('all');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
