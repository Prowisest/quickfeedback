-- ============================================================
-- PROWETOK Database Schema & RLS Setup for Supabase
-- ============================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the "businesses" table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the "feedback" table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_name TEXT,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Indexes for performant queries
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_business_id ON public.feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Businesses Table Policies
-- ------------------------------------------------------------

-- Allow anyone (public/anon & auth) to read business name and ID
-- (Required for the public customer feedback page /feedback/[id] to render business name)
DROP POLICY IF EXISTS "Public can view business names" ON public.businesses;
CREATE POLICY "Public can view business names"
    ON public.businesses
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert their own business profile
DROP POLICY IF EXISTS "Users can insert their own business" ON public.businesses;
CREATE POLICY "Users can insert their own business"
    ON public.businesses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own business profile
DROP POLICY IF EXISTS "Users can update their own business" ON public.businesses;
CREATE POLICY "Users can update their own business"
    ON public.businesses
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Feedback Table Policies
-- ------------------------------------------------------------

-- Allow ANYONE (unauthenticated customers) to submit feedback
DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;
CREATE POLICY "Public can insert feedback"
    ON public.feedback
    FOR INSERT
    WITH CHECK (
        -- Verify business_id exists in businesses table
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE public.businesses.id = feedback.business_id
        )
    );

-- Allow business owners to view only their own feedback
DROP POLICY IF EXISTS "Business owners can view their feedback" ON public.feedback;
CREATE POLICY "Business owners can view their feedback"
    ON public.feedback
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE public.businesses.id = feedback.business_id
            AND public.businesses.user_id = auth.uid()
        )
    );

-- Allow business owners to delete feedback for their business
DROP POLICY IF EXISTS "Business owners can delete their feedback" ON public.feedback;
CREATE POLICY "Business owners can delete their feedback"
    ON public.feedback
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE public.businesses.id = feedback.business_id
            AND public.businesses.user_id = auth.uid()
        )
    );

-- ============================================================
-- AUTOMATIC BUSINESS PROFILE CREATION ON USER SIGNUP (TRIGGER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.businesses (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'business_name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function whenever a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- OPTIONAL SAMPLE SEED DATA FOR TESTING (Demo Business)
-- ============================================================
-- Uncomment below if you want sample data right away:
/*
DO $$
DECLARE
    demo_biz_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
    INSERT INTO public.businesses (id, name, email)
    VALUES (demo_biz_id, 'Artisan Coffee Roasters', 'owner@artisancoffee.demo')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.feedback (business_id, customer_name, rating, comment, created_at)
    VALUES
        (demo_biz_id, 'Sarah Jenkins', 5, 'The oat milk latte and almond croissant were divine! Best coffee spot in town.', NOW() - INTERVAL '2 hours'),
        (demo_biz_id, 'Michael Chang', 5, 'Super friendly staff and very fast service even during the morning rush.', NOW() - INTERVAL '6 hours'),
        (demo_biz_id, 'Emily Watson', 4, 'Great espresso blend. Would love more vegan pastry options on weekdays!', NOW() - INTERVAL '1 day'),
        (demo_biz_id, 'David K.', 3, 'Good coffee, but seating was quite limited around 11am.', NOW() - INTERVAL '2 days'),
        (demo_biz_id, 'Anonymous', 5, 'Love the loyalty card program and the relaxing background playlist.', NOW() - INTERVAL '3 days')
    ON CONFLICT DO NOTHING;
END $$;
*/
