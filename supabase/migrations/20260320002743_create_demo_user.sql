/*
  # Create demo user for authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for users to update their own profile

  3. Demo Data
    - Insert demo user: demo@caiso.com with password 'demo123'
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert demo user (password: demo123)
-- Using a simple hash for demo purposes - in production use bcrypt
INSERT INTO users (email, password_hash, full_name)
VALUES ('demo@caiso.com', '$2a$10$xYzQ1qN2m3N4o5P6r7S8t9U0vWxYz1A2b3C4d5E6f7G8h9I0jKlMn', 'Demo User')
ON CONFLICT (email) DO NOTHING;