import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Hono } from "hono";

const authApp = new Hono({
  strict: false,
});

authApp.post("/signup", async (c) => {
  const { email, password } = await c.req.json();
  const sb = c.get("supabase");

  try {
    const response = await sb.auth.signUp({ email, password });
    if (response.error) {
      if (response.error.code === "23505") {
        return c.json(
          {
            message: "Email allready in use",
          },
          409
        );
      }
      throw response.error;
    }
    return c.json({
        message: "User has been registered"
    })
  } catch (err) {
    console.warn("ERROR in signing up", err);
    return c.json(
      {
        message: "Invalid credentials",
      },
      400
    );
  }
});

authApp.post("/signin", async (c) => {
  const { email, password } = await c.req.json();
  const sb = c.get("supabase");

  try {
    const response = await sb.auth.signInWithPassword({ email, password });
    if (response.error) {
      throw response.error;
    }
    return c.json({
        message: "User has logged in successfully"
    })
  } catch (err) {
    console.warn("ERROR in signing up", err);
    return c.json(
      {
        message: "Invalid credentials",
      },
      400
    );
  }
});
export default authApp;
