-- SIMPLE VERSION: Add weekly_hours to profiles
-- If the previous script fails, use this one instead
-- Execute each section ONE BY ONE in Supabase SQL Editor

-- ============================================
-- SECTION 1: Add Column
-- ============================================
ALTER TABLE profiles 
ADD COLUMN weekly_hours INTEGER DEFAULT 40;

-- ============================================
-- SECTION 2: Set Default Values
-- ============================================
UPDATE profiles 
SET weekly_hours = 40 
WHERE weekly_hours IS NULL;

-- ============================================
-- SECTION 3: Add Constraint
-- ============================================
ALTER TABLE profiles 
ADD CONSTRAINT weekly_hours_valid 
CHECK (weekly_hours >= 1 AND weekly_hours <= 168);

-- ============================================
-- SECTION 4: Update Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, weekly_hours)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, 40);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
