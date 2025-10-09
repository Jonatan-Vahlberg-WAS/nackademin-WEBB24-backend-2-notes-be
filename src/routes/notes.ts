import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Hono } from "hono";

const noteApp = new Hono({
  strict: false,
});

noteApp.get("/", async (c) => {
  const sb = c.get("supabase");
  const { is_pinned } = c.req.query();
  try {
    const query = sb.from("notes").select("*");
    if (is_pinned === "true") {
      query.eq("is_pinned", true);
    }
    const response: PostgrestSingleResponse<Note[]> = await query;
    return c.json(response.data || []);
  } catch (err) {
    return c.json(err, 500);
  }
});

noteApp.post("/", async (c) => {
  const sb = c.get("supabase");
  const user = c.get("user")!
  let newNote: Note = await c.req.json();
  newNote.user_id = user.id
  try {
    const query = sb.from("notes").insert(newNote).select().single();
    const response: PostgrestSingleResponse<Note> = await query;
    if (!response.data && response.error) {
      throw response.error;
    }
    return c.json(response.data, 201);
  } catch (err) {
    return c.json(err, 400);
  }
});

noteApp.put("/:uuid", async (c) => {
  const { uuid } = c.req.param()  
  const sb = c.get("supabase");
  const user =c.get("user")!
  let updatedNote: Note = await c.req.json();
  updatedNote.user_id = user.id

  try {
    const query = sb.from("notes").update(updatedNote).eq("id", uuid).select().single()
    const response: PostgrestSingleResponse<Note> = await query;
    if (!response.data && response.error) {
      throw response.error;
    }
    return c.json(response.data, 200);
  } catch (err) {
    return c.json(err, 400);
  }
});

export default noteApp;
