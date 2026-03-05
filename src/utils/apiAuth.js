import { supabase } from '../supabaseClient';

/**
 * Get Authorization header for API calls that require auth.
 * @returns {Promise<{ Authorization?: string }>}
 */
export async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
