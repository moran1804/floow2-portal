-- Add 'archived' to terms_state enum
ALTER TYPE public.terms_state ADD VALUE IF NOT EXISTS 'archived';