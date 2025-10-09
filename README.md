https://prod.liveshare.vsengsaas.visualstudio.com/join?990C0740DDF3BF94D7643ED4501BA8C37493
```
npm install
npm run dev
```

```
open http://localhost:3000
```

# Notes api Step by Step

## Creating a basic `Notes` api

1. Install necessary dependencies
   `npm install @hono/zod-validator @supabase/ssr @supabase/supabase-js dotenv zod`
2. Create a .env file and add the following variables:
   `SUPABASE_URL=your_supabase_url`
   `SUPABASE_ANON_KEY=your_supabase_anon_key`
3. Create a types folder and add the following files:
   `types/note.d.ts`
4. Fil in src/index.ts to handle enviroment variables.

```
import dotenv from "dotenv";
dotenv.config();

const app = new Hono( {
  strict: false
});

//TODO: implement auth later
```

5. Create a notes table in supabase based on the note type save the table as a sql file with diffrent steps.
6. Create a lib folder and add the following files:
   `lib/supabase.ts`
7. Export enviroment variables from the .env file or throw an error if the variables are not set.
8. Setup a `withSupabase` middleware to handle the supabase client. We are not in tha auth state yet.

````
declare module "hono" {
  interface ContextVariableMap {
    supabase: SupabaseClient;
    //TODO: implement User later
  }
}

async function withSupabase(c: Context, next: Next) {
    let sb = c.get("supabase");
    if(!sb) {
        sb = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
        c.set("supabase", sb);
    }
    //TODO: implement auth later
    return next();
}
```
9. Apply the `withSupabase` middleware to the app.
```
app.use("*", withSupabase);
```
10. Create first `routes/notes.ts` file to handle the notes routes.
    a. Using the `withSupabase` middleware to handle the supabase client.
    b. Create a `GET: notes` route to handle the notes routes.
    c. Create a `POST: notes` route to handle the notes routes
11. add the notes app to the main app
```

## Adding auth to the api
1. Update the `withSupabase` middleware to handle the auth routes.
```
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

async function withSupabase(c: Context, next: Next) {
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
```
2. Implement the `requireAuth` middleware to handle the auth routes.
```
async function requireAuth(c: Context, next: Next) {
    const user = c.get("user");
    if(!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    return next();
}
```
3. Go to supabase and set RLS and create a new policy for the notes table to only allow the user to view their own notes.
4. Update the notes table to include the user id make this optional at first or remove all notes that do not have a user id.
5: Set up a auth routes folder and add the following routes:
`routes/auth.ts` `POST: /signup` `POST: /login` `POST: /logout`
5. Update the `GET: notes` and `POST: notes` to only get and post notes belonging to user by using the `requireAuth` middleware. 
For the create auth you also have to add user_id to the body.
```

## What is left to do?
1. Put in some validation of the user data and queries.
2. Handle errors and status codes in a nicer way.

## What can we do to improve the api?
