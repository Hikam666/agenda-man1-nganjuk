import { createClient } from '@supabase/supabase-js';
import { DEFAULT_TEMPLATES } from './constants';

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
  
  // Merge locally cached tautan if remote table did not have tautan column yet
  return (data || []).map((item) => {
    if (!item.tautan) {
      try {
        const localTautan = localStorage.getItem(`tautan_${item.id}`);
        if (localTautan) item.tautan = localTautan;
      } catch (e) {}
    }
    return item;
  });
}

/**
 * Insert new agenda with fallback for missing 'tautan' column
 */
export async function createAgenda(agendaData) {
  try {
    const { data, error } = await supabase
      .from('agenda')
      .insert([agendaData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // Graceful recovery if 'tautan' column is missing in user's Supabase instance
    if (err && err.message && (err.message.includes('tautan') || err.message.includes('schema cache'))) {
      console.warn('Kolom "tautan" belum ada di tabel Supabase. Menyimpan ke database dengan fallback aman:', err.message);
      const { tautan, ...dataWithoutTautan } = agendaData;
      const { data, error: retryError } = await supabase
        .from('agenda')
        .insert([dataWithoutTautan])
        .select()
        .single();

      if (retryError) throw retryError;
      const resultWithTautan = { ...data, tautan: tautan || '' };
      try {
        if (tautan) localStorage.setItem(`tautan_${resultWithTautan.id}`, tautan);
      } catch (e) {}
      return resultWithTautan;
    }
    throw err;
  }
}

/**
 * Update existing agenda with fallback for missing 'tautan' column
 */
export async function updateAgenda(id, agendaData) {
  try {
    const { data, error } = await supabase
      .from('agenda')
      .update(agendaData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // Graceful recovery if 'tautan' column is missing in user's Supabase instance
    if (err && err.message && (err.message.includes('tautan') || err.message.includes('schema cache'))) {
      console.warn('Kolom "tautan" belum ada di tabel Supabase. Memperbarui agenda dengan fallback aman:', err.message);
      const { tautan, ...dataWithoutTautan } = agendaData;
      const { data, error: retryError } = await supabase
        .from('agenda')
        .update(dataWithoutTautan)
        .eq('id', id)
        .select()
        .single();

      if (retryError) throw retryError;
      const resultWithTautan = { ...data, tautan: tautan || '' };
      try {
        if (tautan) localStorage.setItem(`tautan_${resultWithTautan.id}`, tautan);
      } catch (e) {}
      return resultWithTautan;
    }
    throw err;
  }
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

/**
 * Role Profiles (Nama Pejabat per Jabatan)
 */
export async function getRoleProfiles() {
  const localMap = {};
  try {
    const raw = localStorage.getItem('role_profiles');
    if (raw) Object.assign(localMap, JSON.parse(raw));
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('role_profiles')
      .select('*');

    if (!error && data && data.length) {
      const remoteMap = {};
      data.forEach(item => {
        remoteMap[item.role_key] = item;
      });
      // Merge with local storage
      const merged = { ...localMap, ...remoteMap };
      localStorage.setItem('role_profiles', JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch role_profiles from Supabase, using localStorage:', err);
  }

  return localMap;
}

export async function saveRoleProfile(roleKey, profileData) {
  // Update local storage
  let currentMap = {};
  try {
    const raw = localStorage.getItem('role_profiles');
    if (raw) currentMap = JSON.parse(raw);
  } catch (e) {}

  currentMap[roleKey] = {
    role_key: roleKey,
    ...profileData,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem('role_profiles', JSON.stringify(currentMap));

  // Update Supabase
  try {
    await supabase
      .from('role_profiles')
      .upsert({
        role_key: roleKey,
        pejabat_name: profileData.pejabat_name || '',
        nip: profileData.nip || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'role_key' });
  } catch (err) {
    console.warn('Could not save role_profiles to Supabase, saved locally:', err);
  }

  return currentMap;
}

/**
 * Agenda Templates
 */
export async function getTemplates() {
  let localTemplates = DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem('agenda_templates');
    if (raw) localTemplates = JSON.parse(raw);
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('agenda_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length) {
      localStorage.setItem('agenda_templates', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch agenda_templates from Supabase, using localStorage:', err);
  }

  return localTemplates;
}

export async function createTemplate(templateData) {
  const localItem = {
    id: `tpl-${Date.now()}`,
    ...templateData,
    created_at: new Date().toISOString()
  };

  let current = await getTemplates();
  let created = localItem;

  try {
    const { data, error } = await supabase
      .from('agenda_templates')
      .insert([templateData])
      .select()
      .single();

    if (!error && data) {
      created = data;
    }
  } catch (err) {
    console.warn('Could not create agenda_templates in Supabase, saving locally:', err);
  }

  current = [created, ...current.filter(t => t.id !== created.id)];
  localStorage.setItem('agenda_templates', JSON.stringify(current));
  return created;
}

export async function updateTemplate(id, templateData) {
  let current = await getTemplates();
  let updated = { id, ...templateData };

  try {
    const { data, error } = await supabase
      .from('agenda_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      updated = data;
    }
  } catch (err) {
    console.warn('Could not update agenda_templates in Supabase, updating locally:', err);
  }

  current = current.map(t => t.id === id ? updated : t);
  localStorage.setItem('agenda_templates', JSON.stringify(current));
  return updated;
}

export async function deleteTemplate(id) {
  let current = await getTemplates();
  current = current.filter(t => t.id !== id);
  localStorage.setItem('agenda_templates', JSON.stringify(current));

  try {
    await supabase
      .from('agenda_templates')
      .delete()
      .eq('id', id);
  } catch (err) {
    console.warn('Could not delete agenda_templates in Supabase, deleting locally:', err);
  }

  return true;
}
