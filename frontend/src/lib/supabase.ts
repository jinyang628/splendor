import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let cachedUserId: string | null = null;
let userIdPromise: Promise<string> | null = null;

export async function getCurrentUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }

  if (userIdPromise) {
    return userIdPromise;
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error('Failed to get Supabase session', { cause: sessionError.message });
  }

  if (session?.user?.id) {
    cachedUserId = session.user.id;
    return cachedUserId;
  }

  userIdPromise = (async () => {
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
      userIdPromise = null;
      throw new Error('Supabase anonymous login failed', { cause: authError.message });
    }
    if (!authData?.user) {
      userIdPromise = null;
      throw new Error('Supabase anonymous login failed: No user found');
    }

    cachedUserId = authData.user.id;
    userIdPromise = null;
    return cachedUserId;
  })();

  return userIdPromise;
}
