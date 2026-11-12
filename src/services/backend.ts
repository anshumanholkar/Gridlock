import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, StudySessionLog } from '../types';

// Supabase configuration
// Users can provide their URL & Anon key, or the app uses the built-in resilient local storage engine
const SUPABASE_URL_KEY = '@gridlock_supabase_url';
const SUPABASE_ANON_KEY = '@gridlock_supabase_anon';

let supabaseClient: any = null;

export async function initSupabase(): Promise<any> {
  try {
    const url = await AsyncStorage.getItem(SUPABASE_URL_KEY);
    const key = await AsyncStorage.getItem(SUPABASE_ANON_KEY);
    if (url && key) {
      supabaseClient = createClient(url, key);
      return supabaseClient;
    }
  } catch (err) {
    console.warn('Supabase initialization fallback:', err);
  }
  return null;
}

export async function setSupabaseConfig(url: string, anonKey: string): Promise<void> {
  await AsyncStorage.setItem(SUPABASE_URL_KEY, url);
  await AsyncStorage.setItem(SUPABASE_ANON_KEY, anonKey);
  supabaseClient = createClient(url, anonKey);
}

// -------------------------------------------------------------
// Group & Sync Operations
// -------------------------------------------------------------
export async function syncSessionToCloud(session: StudySessionLog, user: UserProfile): Promise<boolean> {
  if (!supabaseClient) return false;
  try {
    const { error } = await supabaseClient.from('study_sessions').insert({
      id: session.id,
      user_name: user.name,
      group_code: user.groupCode,
      topic: session.topic,
      duration_seconds: session.durationSeconds,
      timestamp: session.timestamp,
      verified: session.verified,
      notes_summary: session.notesSummary,
      quiz_score: session.quizScore,
    });
    return !error;
  } catch (e) {
    console.warn('Sync session error:', e);
    return false;
  }
}

export async function fetchGroupLeaderboard(groupCode: string): Promise<any[]> {
  if (!supabaseClient) {
    // Return local mock members
    return [
      { rank: 1, name: 'Alex Vance (You)', xp: 1450, streak: 6, status: 'Compliant', multiplier: 1.0, monitor: true },
      { rank: 2, name: 'Kaelen Cross', xp: 1380, streak: 5, status: 'Compliant', multiplier: 1.0, monitor: false },
      { rank: 3, name: 'Marcus Thorne', xp: 1190, streak: 4, status: 'Compliant', multiplier: 1.0, monitor: false },
      { rank: 4, name: 'Sarah Lin', xp: 840, streak: 1, status: 'Warning · -25% Quota', multiplier: 1.25, monitor: false },
      { rank: 5, name: 'Damian Reed', xp: 420, streak: 0, status: 'CRITICAL · PROBATION', multiplier: 1.5, monitor: false },
    ];
  }

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('group_code', groupCode)
      .order('xp', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((item: any, index: number) => ({
        rank: index + 1,
        name: item.name,
        xp: item.xp,
        streak: item.streak,
        status: item.streak > 1 ? 'Compliant' : 'Warning',
        multiplier: item.penalty_multiplier || 1.0,
        monitor: index === 0,
      }));
    }
  } catch (e) {
    console.warn('Supabase fetch leaderboard error:', e);
  }

  return [];
}
