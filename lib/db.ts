import { neon } from "@neondatabase/serverless";

let client: ReturnType<typeof neon> | null = null;

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!client) {
    client = neon(connectionString);
  }

  return client;
}
