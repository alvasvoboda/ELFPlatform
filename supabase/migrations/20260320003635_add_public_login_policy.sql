/*
  # Add public login policy

  1. Security Changes
    - Add policy to allow unauthenticated users to read user data for login purposes
    - This enables the login flow to verify credentials before authentication

  IMPORTANT: This policy is necessary for the login process to work, as users
  need to be able to query the users table before they are authenticated.
*/

-- Allow anonymous users to read user records for login verification
CREATE POLICY "Allow public read for login"
  ON users
  FOR SELECT
  TO anon
  USING (true);
