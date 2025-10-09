import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import dotenv from "dotenv";
dotenv.config();

const app = new Hono( {
  strict: false
});

app.get('/health', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
