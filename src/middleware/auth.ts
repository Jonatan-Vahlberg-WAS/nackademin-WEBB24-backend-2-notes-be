import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Context, Next } from "hono";
import { supabaseAnonKey, supabaseUrl } from "../lib/supabase.js";

declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
    //TODO: implement User later
  }
}

export async function withSupabase(c: Context, next: Next) {
    let sb = c.get("supabase");
    if(!sb) {
        sb = createClient(supabaseUrl, supabaseAnonKey);
        c.set("supabase", sb);
    }
    //TODO: implement auth later
    return next();
}