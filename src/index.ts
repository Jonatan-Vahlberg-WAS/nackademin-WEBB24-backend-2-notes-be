import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import dotenv from "dotenv";
import { requireAuth, withSupabase } from './middleware/auth.js';
import noteApp from './routes/notes.js';
import authApp from './routes/auth.js';
import { cors } from 'hono/cors';
dotenv.config();

const app = new Hono( {
  strict: false
});

app.use("*", cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use("*", withSupabase)

app.get('/health', (c) => {
  return c.text('Hello Hono!')
})

app.route("/auth", authApp)

app.use("/api/v1/*", requireAuth)
app.route("/api/v1/notes", noteApp)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
