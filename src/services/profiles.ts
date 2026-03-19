import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type DiverProfile = Tables<'diver_profiles'>;
export type DiveCenter = Tables<'dive_centers'>;

/**
 * Fetch a diver profile by user ID.
 */
export async function fetchDiverProfile(userId: string) {
  const { data, error } = await supabase
    .from('diver_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Create a new diver profile.
 */
export async function createDiverProfile(profile: TablesInsert<'diver_profiles'>) {
  const { data, error } = await supabase
    .from('diver_profiles')
    .insert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update a diver profile.
 */
export async function updateDiverProfile(id: string, updates: TablesUpdate<'diver_profiles'>) {
  const { data, error } = await supabase
    .from('diver_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch a dive center by ID.
 */
export async function fetchDiveCenter(id: string) {
  const { data, error } = await supabase
    .from('dive_centers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update a dive center.
 */
export async function updateDiveCenter(id: string, updates: TablesUpdate<'dive_centers'>) {
  const { error } = await supabase
    .from('dive_centers')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

/**
 * Assign diver role to a user.
 */
export async function assignDiverRole(userId: string) {
  const { error } = await supabase.from('user_roles').insert({
    user_id: userId,
    role: 'diver',
  });
  // Ignore duplicate key error — user may already have the role
  if (error && !error.message.includes('duplicate')) throw error;
}
