-- 1) Add floow_staff role to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'floow_staff';
