/**
 * Rolling Fingerpicking Patterns Database
 *
 * Pattern Notation:
 * 1 = Low string
 * 2 = Middle string
 * 3 = High string
 *
 * User selects which physical strings to apply pattern to
 */

export interface Pattern {
  id: number;
  pattern: string;
  sequence: number[];
}

export const PATTERNS: Pattern[] = [
  // Starting with 1
  { id: 1, pattern: '1213', sequence: [1, 2, 1, 3] },
  { id: 2, pattern: '1231', sequence: [1, 2, 3, 1] },
  { id: 3, pattern: '1232', sequence: [1, 2, 3, 2] },
  { id: 4, pattern: '1312', sequence: [1, 3, 1, 2] },
  { id: 5, pattern: '1321', sequence: [1, 3, 2, 1] },
  { id: 6, pattern: '1323', sequence: [1, 3, 2, 3] },

  // Starting with 2
  { id: 7, pattern: '2123', sequence: [2, 1, 2, 3] },
  { id: 8, pattern: '2131', sequence: [2, 1, 3, 1] },
  { id: 9, pattern: '2132', sequence: [2, 1, 3, 2] },
  { id: 10, pattern: '2312', sequence: [2, 3, 1, 2] },
  { id: 11, pattern: '2313', sequence: [2, 3, 1, 3] },
  { id: 12, pattern: '2321', sequence: [2, 3, 2, 1] },

  // Starting with 3
  { id: 13, pattern: '3121', sequence: [3, 1, 2, 1] },
  { id: 14, pattern: '3123', sequence: [3, 1, 2, 3] },
  { id: 15, pattern: '3132', sequence: [3, 1, 3, 2] },
  { id: 16, pattern: '3212', sequence: [3, 2, 1, 2] },
  { id: 17, pattern: '3213', sequence: [3, 2, 1, 3] },
  { id: 18, pattern: '3231', sequence: [3, 2, 3, 1] },
];
