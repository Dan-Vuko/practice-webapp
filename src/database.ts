/**
 * Database Layer for Speed Builder
 * Uses Supabase for multi-user progress tracking
 * Patterns are managed in localStorage (pattern-database.tsx)
 */

import { supabase } from './lib/supabase'

// Fixed admin user ID for testing (bypasses Supabase auth)
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001'

// Get current user ID - returns Supabase user ID for Google users, or admin ID for local login
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return user.id // Google user's actual Supabase ID
  }
  return ADMIN_USER_ID // Fallback for admin login
}

// ==========================================
// ENTITIES
// ==========================================

export interface UserPatternProgressEntity {
  id: string;
  user_id?: string;
  pattern_name: string;
  current_bpm: number;
  target_bpm: number;
  max_bpm_achieved: number;
  total_practice_minutes: number;
  total_sessions: number;
  last_practiced: string | null;
  created_at: string;
  current_cycle_week: number;
  cycle_start_date: string;
}

export interface SessionEntity {
  id: string;
  user_id?: string;
  user_pattern_progress_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  starting_bpm: number;
  ending_bpm: number;
  avg_accuracy: number;
  total_attempts: number;
  successful_attempts: number;
  myelination_cycle_week: number;
  hours_since_last_session: number;
  in_consolidation_window: boolean;
}

export interface AttemptEntity {
  id: string;
  user_id?: string;
  session_id: string;
  attempt_number: number;
  tempo: number;
  accuracy: number;
  notes_played: number;
  notes_correct: number;
  timestamp: string;
  tension_detected: boolean;
}

export interface PersonalBestEntity {
  id: string;
  user_id?: string;
  user_pattern_progress_id: string;
  metric_type: 'max_bpm' | 'max_bpm_100_accuracy' | 'longest_streak' | 'fastest_improvement';
  value: number;
  achieved_at: string;
  session_id: string;
}

// Legacy interface for compatibility
export interface PatternEntity {
  id: number;
  pattern: string;
  sequence: number[];
}

// ==========================================
// DATABASE CLASS
// ==========================================

class SpeedBuilderDB {
  async init(): Promise<void> {
    // No initialization needed
  }

  // Legacy methods for compatibility with existing code
  async seedPatterns(_patterns: PatternEntity[]): Promise<void> {
    // No-op - patterns are managed in localStorage
  }

  async getAllPatterns(): Promise<PatternEntity[]> {
    // Return empty - patterns come from localStorage
    return []
  }

  // ==========================================
  // USER PATTERN PROGRESS OPERATIONS
  // ==========================================

  async createUserPatternProgress(data: Omit<UserPatternProgressEntity, 'id' | 'created_at' | 'user_id'>): Promise<string> {
    const userId = await getCurrentUserId()
    const { data: result, error } = await supabase
      .from('user_pattern_progress')
      .insert({
        user_id: userId,
        pattern_name: data.pattern_name,
        current_bpm: data.current_bpm,
        target_bpm: data.target_bpm,
        max_bpm_achieved: data.max_bpm_achieved,
        total_practice_minutes: data.total_practice_minutes,
        total_sessions: data.total_sessions,
        last_practiced: data.last_practiced,
        current_cycle_week: data.current_cycle_week,
        cycle_start_date: data.cycle_start_date,
      })
      .select('id')
      .single()

    if (error) throw error
    return result.id
  }

  async getUserPatternProgress(patternName: string): Promise<UserPatternProgressEntity | null> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('user_pattern_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern_name', patternName)
      .maybeSingle()

    if (error) throw error
    return data
  }

  async updateUserPatternProgress(id: string, updates: Partial<UserPatternProgressEntity>): Promise<void> {
    const { id: _id, user_id: _userId, created_at: _created, ...updateData } = updates

    const { error } = await supabase
      .from('user_pattern_progress')
      .update(updateData)
      .eq('id', id)

    if (error) throw error
  }

  async getAllUserProgress(): Promise<UserPatternProgressEntity[]> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('user_pattern_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_practiced', { ascending: false, nullsFirst: false })

    if (error) throw error
    return data || []
  }

  async deleteUserPatternProgress(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_pattern_progress')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // ==========================================
  // SESSION OPERATIONS
  // ==========================================

  async createSession(data: Omit<SessionEntity, 'id' | 'user_id'>): Promise<string> {
    const userId = await getCurrentUserId()
    const { data: result, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        ...data,
      })
      .select('id')
      .single()

    if (error) throw error
    return result.id
  }

  async getSessionsByProgress(progressId: string): Promise<SessionEntity[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_pattern_progress_id', progressId)
      .order('start_time', { ascending: false })

    if (error) throw error
    return data || []
  }

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) throw error
  }

  // ==========================================
  // ATTEMPT OPERATIONS
  // ==========================================

  async createAttempt(data: Omit<AttemptEntity, 'id' | 'user_id'>): Promise<string> {
    const userId = await getCurrentUserId()
    const { data: result, error } = await supabase
      .from('attempts')
      .insert({
        user_id: userId,
        ...data,
      })
      .select('id')
      .single()

    if (error) throw error
    return result.id
  }

  async getAttemptsBySession(sessionId: string): Promise<AttemptEntity[]> {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('session_id', sessionId)
      .order('attempt_number')

    if (error) throw error
    return data || []
  }

  // ==========================================
  // PERSONAL BEST OPERATIONS
  // ==========================================

  async createPersonalBest(data: Omit<PersonalBestEntity, 'id' | 'user_id'>): Promise<string> {
    const userId = await getCurrentUserId()
    const { data: result, error } = await supabase
      .from('personal_bests')
      .insert({
        user_id: userId,
        ...data,
      })
      .select('id')
      .single()

    if (error) throw error
    return result.id
  }

  async getPersonalBests(progressId: string): Promise<PersonalBestEntity[]> {
    const { data, error } = await supabase
      .from('personal_bests')
      .select('*')
      .eq('user_pattern_progress_id', progressId)

    if (error) throw error
    return data || []
  }
}

// Singleton instance
export const db = new SpeedBuilderDB()
