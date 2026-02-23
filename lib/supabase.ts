import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const CHUNK_SIZE = 1800;

function chunkKey(key: string, index: number) {
  return `${key}_chunk_${index}`;
}

const ChunkedSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!countStr) return SecureStore.getItemAsync(key);

    const count = parseInt(countStr, 10);
    const chunks = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(chunkKey(key, i)),
      ),
    );
    if (chunks.some((c) => c === null)) return null;
    return chunks.join("");
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }

    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
    await Promise.all(
      chunks.map((chunk, i) =>
        SecureStore.setItemAsync(chunkKey(key, i), chunk),
      ),
    );
  },

  async removeItem(key: string): Promise<void> {
    const countStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (countStr) {
      const count = parseInt(countStr, 10);
      await Promise.all([
        SecureStore.deleteItemAsync(`${key}_chunks`),
        ...Array.from({ length: count }, (_, i) =>
          SecureStore.deleteItemAsync(chunkKey(key, i)),
        ),
      ]);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const REQUEST_TIMEOUT_MS = 10_000;

function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const merged: RequestInit = {
    ...init,
    signal: controller.signal,
  };

  return fetch(input, merged)
    .then((res) => {
      clearTimeout(timer);
      return res;
    })
    .catch((err) => {
      clearTimeout(timer);
      if (controller.signal.aborted) {
        throw new Error("Network request timed out");
      }
      throw err;
    });
}

export const QUERY_TIMEOUT_MS = 10_000;

export function withTimeout<T>(thenable: PromiseLike<T>, ms = QUERY_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Query timed out")), ms);
    }),
  ]).finally(() => clearTimeout(timer!));
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ChunkedSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { fetch: fetchWithTimeout },
});
