-- Migration: Add weekly_hours to profiles
-- Run this script in Supabase SQL Editor to add the weekly_hours field

-- Step 1: Add the weekly_hours column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'weekly_hours'
    ) THEN
        ALTER TABLE profiles ADD COLUMN weekly_hours INTEGER DEFAULT 40;
        RAISE NOTICE 'Column weekly_hours added successfully';
    ELSE
        RAISE NOTICE 'Column weekly_hours already exists';
    END IF;
END $$;

-- Step 2: Update existing users to have 40 hours as default
UPDATE profiles 
SET weekly_hours = 40 
WHERE weekly_hours IS NULL;

-- Step 3: Add constraint (drop if exists first to avoid errors)
DO $$
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'weekly_hours_valid' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT weekly_hours_valid;
        RAISE NOTICE 'Existing constraint dropped';
    END IF;
    
    -- Add the constraint
    ALTER TABLE profiles 
    ADD CONSTRAINT weekly_hours_valid 
    CHECK (weekly_hours >= 1 AND weekly_hours <= 168);
    
    RAISE NOTICE 'Constraint weekly_hours_valid added successfully';
END $$;

-- Step 4: Update the handle_new_user function to include weekly_hours
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, weekly_hours)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 40);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
