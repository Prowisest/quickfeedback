-- ============================================================
-- PROWETOK Database Schema & RLS Setup for Supabase
-- ============================================================
-- Run this entire script in Supabase Dashboard -> SQL Editor -> New Query -> Run

-- 1. Enable UUID Extension (built into Postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the "businesses" table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the "feedback" table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_name TEXT,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON public.businesses(email);
CREATE INDEX IF NOT EXISTS idx_feedback_business_id ON public.feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- 5. Grant API permissions to Supabase roles
GRANT ALL ON TABLE public.businesses TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.feedback TO anon, authenticated, service_role;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

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
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own business profile
DROP POLICY IF EXISTS "Users can update their own business" ON public.businesses;
CREATE POLICY "Users can update their own business"
    ON public.businesses
    FOR UPDATE
    TO authenticated
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
    TO anon, authenticated
    WITH CHECK (
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
    TO authenticated
    USING (
        -- Match through businesses table user_id
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE public.businesses.id = feedback.business_id
            AND public.businesses.user_id = auth.uid()
        )
        OR
        -- Match if feedback.business_id was stored as user's auth UID
        feedback.business_id = auth.uid()
        OR
        -- Match by email if user_id was pending link
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE public.businesses.id = feedback.business_id
            AND public.businesses.email = (auth.jwt() ->> 'email')
        )
    );

-- Allow business owners to delete feedback for their business
DROP POLICY IF EXISTS "Business owners can delete their feedback" ON public.feedback;
CREATE POLICY "Business owners can delete their feedback"
    ON public.feedback
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE public.businesses.id = feedback.business_id
            AND public.businesses.user_id = auth.uid()
        )
        OR
        feedback.business_id = auth.uid()
    );

-- ============================================================
-- AUTOMATIC BUSINESS PROFILE CREATION ON USER SIGNUP (TRIGGER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.businesses (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'business_name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Trigger the function whenever a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- BACKFILL: Create business profiles for any existing users
-- ============================================================
INSERT INTO public.businesses (user_id, name, email)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'business_name', split_part(email, '@', 1)),
    email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.businesses WHERE user_id IS NOT NULL);
