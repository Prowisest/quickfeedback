# PROWETOK — Customer Feedback Collection Tool for Small Businesses

PROWETOK is a mobile-first customer feedback collection application designed specifically for small businesses (cafes, restaurants, salons, retail, gyms). Business owners can sign up, receive an instant unique feedback link and printable QR code stand, and monitor customer reviews and analytics in real-time.

---

## ✨ Features

- 🔐 **Supabase Auth & PostgreSQL Schema**: Business owners sign up and sign in using email and password.
- 📱 **Mobile-First Public Feedback Form** (`/feedback/[business-id]`):
  - No customer login or app download required.
  - Interactive 1-5 star ratings with hover/touch animations and feeling descriptions.
  - Optional customer name and feedback comment textarea.
  - Interactive confetti celebration animation upon submission.
- 🔲 **Live QR Code Generator & Printable Counter Tent**:
  - Automatically generates a dynamic QR code for each business.
  - High-res PNG image download.
  - "Print Stand" mode for counter / table-tent placement.
  - 1-click link copying with instant feedback.
- 📊 **Business Owner Dashboard** (`/dashboard`):
  - **Live Metrics**: Overall average star rating (e.g. 4.8 / 5.0), total response count, and customer satisfaction %.
  - **Rating Breakdown**: Visual distribution bars for 5, 4, 3, 2, and 1 star ratings.
  - **Feedback Feed**: Chronological list of submissions (newest first) with search filter, star filters, and sorting.
  - **CSV Export**: Download feedback submissions in spreadsheet format.
- 🚀 **Built-in Smart Demo Mode**: Test the full app experience out of the box with sample data even before connecting your live Supabase project.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security & Triggers)
- **QR Code Engine**: `qrcode.react`
- **Effects**: `canvas-confetti`

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase (Optional for Live DB)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase-schema.sql`](./supabase-schema.sql) and run the script. This creates:
   - `businesses` table with UUID primary key, `name`, and `email`.
   - `feedback` table with `business_id` foreign key, `rating` (1-5), optional `customer_name`, and `comment`.
   - Row Level Security (RLS) policies allowing public submissions and owner-only dashboard access.
   - Automatic signup trigger on `auth.users`.
4. Copy your project URL and anon public key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
quickfeedback/
├── supabase-schema.sql            # PostgreSQL schema, RLS policies, indexes & triggers
├── .env.local.example             # Example Supabase environment variables
├── src/
│   ├── app/
│   │   ├── layout.tsx             # App shell layout & metadata (PROWETOK)
│   │   ├── page.tsx               # Landing page with interactive preview & features
│   │   ├── login/page.tsx         # Business owner login + 1-click demo preview
│   │   ├── signup/page.tsx        # Business owner registration
│   │   ├── dashboard/page.tsx     # Owner analytics, QR code card, feedback feed
│   │   └── feedback/[businessId]/ # Mobile-first customer feedback form
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation header with PROWETOK branding
│   │   ├── QRCodeCard.tsx         # QR code display, PNG download & printable table stand
│   │   └── StarRating.tsx         # 1-5 Star interactive rating selector
│   └── lib/
│       ├── supabase/client.ts     # Supabase SSR browser client & config checker
│       ├── feedback-service.ts    # Data access layer for Supabase & local storage
│       ├── types.ts               # TypeScript data models
│       └── utils.ts              # Helper functions & relative date formatting
```
