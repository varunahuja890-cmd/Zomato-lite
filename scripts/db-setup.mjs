import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local first.");
}

const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// Reset the two tables so this setup command can be run more than once safely.
await sql.query("DROP TABLE IF EXISTS reviews");
await sql.query("DROP TABLE IF EXISTS restaurants");

const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

const [restaurant] = await sql`
  INSERT INTO restaurants (name, cuisine, area)
  VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32')
  RETURNING id
`;

await sql`
  INSERT INTO reviews (restaurant_id, rating, comment, created_at)
  VALUES
    (${restaurant.id}, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'),
    (${restaurant.id}, 4, 'Good, but slow service', NOW() - INTERVAL '6 days'),
    (${restaurant.id}, 4, 'Solid. Would repeat.', NOW() - INTERVAL '2 days')
`;

const restaurants = await sql`
  SELECT id, name, cuisine, area
  FROM restaurants
  ORDER BY id
`;

const reviews = await sql`
  SELECT id, restaurant_id, rating, comment, created_at
  FROM reviews
  ORDER BY created_at
`;

console.log("\nrestaurants");
console.table(restaurants);

console.log("\nreviews");
console.table(reviews);

console.log(
  "\nSetup complete. Stored facts only: no average_rating and no latest_review columns exist."
);
