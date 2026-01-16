/**
 * Database Layer for Speed Builder
 * Tracks user progress for each pattern + string set combination
 */

// ==========================================
// ENTITIES
// ==========================================

export interface PatternEntity {
  id: number;
  pattern: string;
  sequence: number[];
}

export interface UserPatternProgressEntity {
  id: string; // UUID
  pattern_id: number;
  string_set: string; // "3-4-5" format
  current_bpm: number;
  target_bpm: number;
  max_bpm_achieved: number;
  total_practice_minutes: number;
  total_sessions: number;
  last_practiced: string; // ISO date
  created_at: string; // ISO date

  // Myelination tracking
  current_cycle_week: number; // 1-4
  cycle_start_date: string; // ISO date
}

export interface SessionEntity {
  id: string; // UUID
  user_pattern_progress_id: string;
  start_time: string; // ISO date
  end_time: string; // ISO date
  duration_minutes: number;
  starting_bpm: number;
  ending_bpm: number;
  avg_accuracy: number;
  total_attempts: number;
  successful_attempts: number;

  // Neurophysiology tracking
  myelination_cycle_week: number;
  hours_since_last_session: number;
  in_consolidation_window: boolean;
}

export interface AttemptEntity {
  id: string; // UUID
  session_id: string;
  attempt_number: number;
  tempo: number;
  accuracy: number; // 0-1
  notes_played: number;
  notes_correct: number;
  timestamp: string; // ISO date
  tension_detected: boolean;
}

export interface PersonalBestEntity {
  id: string; // UUID
  user_pattern_progress_id: string;
  metric_type: 'max_bpm' | 'max_bpm_100_accuracy' | 'longest_streak' | 'fastest_improvement';
  value: number;
  achieved_at: string; // ISO date
  session_id: string;
}

// ==========================================
// DATABASE CLASS
// ==========================================

class SpeedBuilderDB {
  private dbName = 'speed_builder_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Patterns store
        if (!db.objectStoreNames.contains('patterns')) {
          const patternStore = db.createObjectStore('patterns', { keyPath: 'id' });
          patternStore.createIndex('pattern', 'pattern', { unique: true });
        }

        // User Pattern Progress store
        if (!db.objectStoreNames.contains('user_pattern_progress')) {
          const progressStore = db.createObjectStore('user_pattern_progress', { keyPath: 'id' });
          progressStore.createIndex('pattern_id', 'pattern_id', { unique: false });
          progressStore.createIndex('string_set', 'string_set', { unique: false });
          progressStore.createIndex('last_practiced', 'last_practiced', { unique: false });
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('user_pattern_progress_id', 'user_pattern_progress_id', { unique: false });
          sessionStore.createIndex('start_time', 'start_time', { unique: false });
        }

        // Attempts store
        if (!db.objectStoreNames.contains('attempts')) {
          const attemptStore = db.createObjectStore('attempts', { keyPath: 'id' });
          attemptStore.createIndex('session_id', 'session_id', { unique: false });
        }

        // Personal Bests store
        if (!db.objectStoreNames.contains('personal_bests')) {
          const pbStore = db.createObjectStore('personal_bests', { keyPath: 'id' });
          pbStore.createIndex('user_pattern_progress_id', 'user_pattern_progress_id', { unique: false });
          pbStore.createIndex('metric_type', 'metric_type', { unique: false });
        }
      };
    });
  }

  // ==========================================
  // PATTERN OPERATIONS
  // ==========================================

  async seedPatterns(patterns: PatternEntity[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['patterns'], 'readwrite');
    const store = transaction.objectStore('patterns');

    for (const pattern of patterns) {
      await store.put(pattern);
    }
  }

  async getAllPatterns(): Promise<PatternEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['patterns'], 'readonly');
      const store = transaction.objectStore('patterns');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==========================================
  // USER PATTERN PROGRESS OPERATIONS
  // ==========================================

  async createUserPatternProgress(data: Omit<UserPatternProgressEntity, 'id' | 'created_at'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const entity: UserPatternProgressEntity = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_pattern_progress'], 'readwrite');
      const store = transaction.objectStore('user_pattern_progress');
      const request = store.add(entity);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserPatternProgress(patternId: number, stringSet: string): Promise<UserPatternProgressEntity | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_pattern_progress'], 'readonly');
      const store = transaction.objectStore('user_pattern_progress');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as UserPatternProgressEntity[];
        const match = results.find(r => r.pattern_id === patternId && r.string_set === stringSet);
        resolve(match || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserPatternProgress(id: string, updates: Partial<UserPatternProgressEntity>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_pattern_progress'], 'readwrite');
      const store = transaction.objectStore('user_pattern_progress');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Progress record not found'));
          return;
        }

        const updated = { ...existing, ...updates };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllUserProgress(): Promise<UserPatternProgressEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_pattern_progress'], 'readonly');
      const store = transaction.objectStore('user_pattern_progress');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==========================================
  // SESSION OPERATIONS
  // ==========================================

  async createSession(data: Omit<SessionEntity, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const entity: SessionEntity = { ...data, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.add(entity);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsByProgress(progressId: string): Promise<SessionEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('user_pattern_progress_id');
      const request = index.getAll(progressId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.delete(sessionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==========================================
  // ATTEMPT OPERATIONS
  // ==========================================

  async createAttempt(data: Omit<AttemptEntity, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const entity: AttemptEntity = { ...data, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attempts'], 'readwrite');
      const store = transaction.objectStore('attempts');
      const request = store.add(entity);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getAttemptsBySession(sessionId: string): Promise<AttemptEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['attempts'], 'readonly');
      const store = transaction.objectStore('attempts');
      const index = store.index('session_id');
      const request = index.getAll(sessionId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==========================================
  // PERSONAL BEST OPERATIONS
  // ==========================================

  async createPersonalBest(data: Omit<PersonalBestEntity, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = crypto.randomUUID();
    const entity: PersonalBestEntity = { ...data, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['personal_bests'], 'readwrite');
      const store = transaction.objectStore('personal_bests');
      const request = store.add(entity);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPersonalBests(progressId: string): Promise<PersonalBestEntity[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['personal_bests'], 'readonly');
      const store = transaction.objectStore('personal_bests');
      const index = store.index('user_pattern_progress_id');
      const request = index.getAll(progressId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const db = new SpeedBuilderDB();
