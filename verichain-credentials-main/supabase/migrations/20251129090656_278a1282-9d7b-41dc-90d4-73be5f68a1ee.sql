-- Fix function search path security warning
DROP TRIGGER IF EXISTS update_credentials_updated_at ON public.credentials;
DROP FUNCTION IF EXISTS public.update_credentials_updated_at();

CREATE OR REPLACE FUNCTION public.update_credentials_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_credentials_updated_at();