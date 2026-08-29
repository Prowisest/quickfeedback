'use client';

import { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  QrCode as QrIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { Business } from '@/lib/types';

interface QRCodeCardProps {
  business: Business;
}

export default function QRCodeCard({ business }: QRCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Determine current origin or base URL
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const feedbackUrl = `${origin}/feedback/${business.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = feedbackUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${business.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-feedback-qr.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-sm">
        {/* Header */}
        <div className="border-b border-neutral-100 dark:border-neutral-800/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400">
                <QrIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white text-base">
                  Your Public Feedback QR & Link
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Customers can scan or tap to leave instant reviews
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Live & Ready
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code Display & Quick Actions */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/60 dark:border-neutral-800/60">
            <div className="relative p-3 rounded-xl bg-white shadow-sm border border-neutral-200/70 dark:border-neutral-800">
              <QRCodeSVG
                value={feedbackUrl}
                size={160}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.ico',
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
              {/* Hidden canvas for clean high-res PNG download */}
              <div ref={canvasRef} className="hidden">
                <QRCodeCanvas
                  value={feedbackUrl}
                  size={512}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-neutral-600 dark:text-neutral-400 text-center">
              Scan with phone camera
            </p>

            <div className="mt-3 flex items-center gap-2 w-full">
              <button
                onClick={downloadQRCode}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
                title="Download QR code as PNG image"
              >
                <Download className="h-3.5 w-3.5 text-neutral-500" />
                <span>PNG</span>
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shadow-2xs"
                title="Print table stand card for store counters"
              >
                <Printer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Print Stand</span>
              </button>
            </div>
          </div>

          {/* Feedback Link & Instructions */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Direct Feedback Link
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={feedbackUrl}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none select-all"
                  />
                </div>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* How to use tips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40 p-3.5">
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Print for Counter & Tables
                </h4>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Print the ready-to-use table tent or counter stand card to collect feedback in-person right after checkout.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40 p-3.5">
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5 text-amber-500" />
                  Share on Digital Receipts
                </h4>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Include this link in SMS receipts, email order confirmations, or your social media bio.
                </p>
              </div>
            </div>

            {/* Test Public Link */}
            <div className="flex items-center justify-between pt-1">
              <a
                href={feedbackUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <span>Preview feedback form in new tab</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Counter Stand Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              Print Counter Table Stand
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Here is how your printed stand card will look. You can print this and display it on your checkout counter or tables.
            </p>

            {/* Print Card Mockup (also targeted by print stylesheet) */}
            <div className="print-area my-4 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-600/60 p-6 text-center bg-gradient-to-b from-amber-50/50 to-white dark:from-neutral-950 dark:to-neutral-900">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-neutral-950 font-bold mb-3 shadow-sm">
                ⭐
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {business.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                How was your experience today?
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Scan with your phone to leave a quick 5-second rating
              </p>

              <div className="my-5 flex justify-center">
                <div className="p-3 bg-white rounded-xl shadow-md border border-neutral-200">
                  <QRCodeSVG value={feedbackUrl} size={180} level="H" />
                </div>
              </div>

              <div className="flex justify-center items-center gap-1 text-amber-400 text-base mb-2">
                ★★★★★
              </div>
              <p className="text-[11px] text-neutral-400">
                Powered by PROWETOK
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-xs font-semibold text-neutral-950 shadow-sm"
              >
                <Printer className="h-4 w-4" />
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
