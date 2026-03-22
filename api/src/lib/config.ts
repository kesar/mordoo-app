/** Claude model used for Oracle chat. */
export const ORACLE_MODEL = process.env.ORACLE_MODEL || 'claude-sonnet-4-6';

/** Max tokens for Oracle chat responses. */
export const ORACLE_MAX_TOKENS = Number(process.env.ORACLE_MAX_TOKENS) || 500;

/** Temperature for Oracle chat responses. */
export const ORACLE_TEMPERATURE = Number(process.env.ORACLE_TEMPERATURE) || 0.8;

/** Free tier: max Oracle questions per day. */
export const FREE_ORACLE_QUESTIONS_PER_DAY = 1;

/** Free tier: max Siam Si draws per day. */
export const FREE_SIAM_SI_DRAWS_PER_DAY = 2;

/** Supabase PostgREST error code for "no rows found" (single row expected). */
export const PGRST_NOT_FOUND = 'PGRST116';
