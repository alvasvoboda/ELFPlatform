import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Invalid email or password');
  }

  const validCredentials = [
    { email: 'demo@caiso.com', password: 'demo123' },
    { email: 'admin@caiso.com', password: 'admin123' }
  ];

  const credential = validCredentials.find(c => c.email === email && c.password === password);

  if (!credential) {
    throw new Error('Invalid email or password');
  }

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
  };
}

export async function getCurrentUser(): User | null {
  const userJson = localStorage.getItem('caiso_user');
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('caiso_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('caiso_user');
  }
}

export function logoutUser() {
  setCurrentUser(null);
}

export async function ensureAuthenticated() {
  return null;
}
