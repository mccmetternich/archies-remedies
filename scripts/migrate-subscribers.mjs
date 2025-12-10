import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrateSubscribers() {
  // Get all email subscribers
  const result = await client.execute("SELECT * FROM email_subscribers");
  console.log(`Found ${result.rows.length} email subscribers to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const row of result.rows) {
    try {
      // Check if contact already exists with this email
      const existing = await client.execute({
        sql: "SELECT id FROM contacts WHERE email = ?",
        args: [row.email]
      });

      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      // Insert into contacts
      await client.execute({
        sql: `INSERT INTO contacts (
          id, email, source, email_status, email_consent_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          nanoid(),
          row.email,
          row.source || "legacy_migration",
          "active",
          row.subscribed_at || row.created_at,
          row.created_at
        ]
      });
      migrated++;
    } catch (err) {
      console.error(`Error migrating ${row.email}:`, err);
    }
  }

  console.log(`Migrated ${migrated} contacts, skipped ${skipped} duplicates`);
}

migrateSubscribers().then(() => {
  console.log("Migration complete");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
