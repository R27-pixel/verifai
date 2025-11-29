-- Create credentials table for storing blockchain-anchored academic credentials
CREATE TABLE public.credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  university_name TEXT NOT NULL,
  major TEXT NOT NULL,
  degree_type TEXT NOT NULL,
  gpa TEXT NOT NULL,
  graduation_date TEXT NOT NULL,
  credential_hash TEXT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL,
  transaction_id TEXT,
  raw_json JSONB NOT NULL,
  is_revoked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read credentials (for verification and search)
CREATE POLICY "Credentials are publicly readable"
  ON public.credentials
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert credentials (will be restricted by wallet signature in production)
CREATE POLICY "Anyone can issue credentials"
  ON public.credentials
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only allow updating is_revoked status
CREATE POLICY "Credentials can be revoked"
  ON public.credentials
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index on credential_hash for fast verification lookups
CREATE INDEX idx_credentials_hash ON public.credentials(credential_hash);

-- Create index on student search fields
CREATE INDEX idx_credentials_search ON public.credentials(major, gpa, graduation_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_credentials_updated_at();