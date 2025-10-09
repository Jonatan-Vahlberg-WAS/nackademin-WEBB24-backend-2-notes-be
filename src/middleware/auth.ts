import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Context, Next } from "hono";
import { supabaseAnonKey, supabaseUrl } from "../lib/supabase.js";
import { setCookie } from "hono/cookie";

declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
    user: User | null;
  }
}

function createSupabaseForRequest(c: Context) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header("Cookie") ?? "").map(
          ({ name, value }) => ({ name, value: value ?? "" })
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(c, name, value, {
            ...options,
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
          });
        });
      },
    },
  });
}

export async function withSupabase(c: Context, next: Next) {
    let sb = c.get("supabase");
    if(!sb) {
        sb = createSupabaseForRequest(c);
        c.set("supabase", sb);
    }

    const {
      data: { user },
      error,
    } = await sb.auth.getUser();

     // If Error is JWT expired, attempt to refresh the session
    if (error && error.code === "session_expired") {
        console.log("session has expired attempting refreshing the session")
      const { data: refreshData, error: refreshError } =
        await sb.auth.refreshSession();

      if (!refreshError && refreshData.user) {
        c.set("user", refreshData.user);
      } else {
        c.set("user", null);
      }
    } else {
      c.set("user", error ? null : user);
    }

    return next();
}

export async function requireAuth(c: Context, next: Next) {
    const user = c.get("user");
    if(!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    return next();
}