import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kxmebhhabhcykwnvcqed.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bWViaGhhYmhjeWt3bnZjcWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTQwMDksImV4cCI6MjEwODU5MDAwOX0.2IAjxvjkHb71RCcxZYdcaoLhi2h6Rcc2yNeHzTV0l1k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all agendas from Supabase
 */
export async function getAgendas() {
  const { data, error } = await supabase
    .from('agenda')
    .select('*')
    .order('tgl', { ascending: true })
    .order('mulai', { ascending: true });

  if (error) {
    console.error('Error fetching agendas:', error);
    throw error;
  }
  return data || [];
}

/**
 * Insert new agenda
 */
export async function createAgenda(agendaData) {
  const { data, error } = await supabase
    .from('agenda')
    .insert([agendaData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update existing agenda
 */
export async function updateAgenda(id, agendaData) {
  const { data, error } = await supabase
    .from('agenda')
    .update(agendaData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete agenda
 */
export async function deleteAgenda(id) {
  const { error } = await supabase
    .from('agenda')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Role PIN verification & update
 * Falls back to localStorage if role_pins table is not yet created in Supabase.
 */
const DEFAULT_PIN = '1234';

export async function verifyRolePin(roleKey, inputPin) {
  try {
    const { data, error } = await supabase
      .from('role_pins')
      .select('pin')
      .eq('role_key', roleKey)
      .maybeSingle();

    if (!error && data && data.pin) {
      return data.pin === inputPin;
    }
  } catch (err) {
    console.warn('Could not query role_pins table, checking localStorage:', err);
  }

  // Fallback to local storage or default 1234
  const stored = localStorage.getItem(`pin_${roleKey}`) || DEFAULT_PIN;
  return stored === inputPin;
}

export async function updateRolePin(roleKey, newPin) {
  let dbSuccess = false;
  try {
    const { error } = await supabase
      .from('role_pins')
      .upsert({
        role_key: roleKey,
        pin: newPin,
        updated_at: new Date().toISOString()
      }, { onConflict: 'role_key' });

    if (!error) {
      dbSuccess = true;
    }
  } catch (err) {
    console.warn('Could not update role_pins in Supabase:', err);
  }

  // Always keep localStorage updated as well
  localStorage.setItem(`pin_${roleKey}`, newPin);
  return dbSuccess;
}
