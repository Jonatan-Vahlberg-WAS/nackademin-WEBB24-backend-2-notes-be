import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";

const authApp = new Hono({
  strict: false,
});

authApp.post("/signup", async (c) => {
  const { email, password, first_name, last_name } = await c.req.json();
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
    const userId = response.data.user!.id
    try {
        await sb.from("userprofiles").update({first_name, last_name}).eq("id", userId)
    } catch(err) {
        console.warn("Could not update user profile", err)
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

authApp.get("/me", requireAuth, async (c) => {
  const sb = c.get("supabase")
  const user = c.get("user")!

  try {
    const response: PostgrestSingleResponse<UserProfile> = await sb.from("userprofiles").select("*").eq("id", user.id).single()
    if(response.error) {
      if(response.error.code === "PGRST116") {
        const creationResponse: PostgrestSingleResponse<UserProfile>  =  await sb.from("userprofiles").insert({
          id: user.id,
          email: user.email,
        }). select("*").single()
        if(creationResponse.data) {
          return c.json(creationResponse.data)
        }
      }
      throw response.error
    }

    return c.json(response.data)

  } catch (err) {
    console.warn(err)
    return c.json("Error in getting user profile", 404)
  }

})

export default authApp;
