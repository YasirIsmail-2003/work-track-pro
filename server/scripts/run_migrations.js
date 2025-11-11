const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const url = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('Please set DATABASE_URL or SUPABASE_DB_URL environment variable to run migrations.');
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    const migrDir = path.join(__dirname, '..', 'migrations');
    const files = ['001_init.sql', '002_seed.sql'].map((f) => path.join(migrDir, f));
    for (const f of files) {
      if (!fs.existsSync(f)) continue;
      const sql = fs.readFileSync(f, 'utf8');
      console.log('Running', f);
      await client.query(sql);
    }
    console.log('Migrations finished');
  } catch (err) {
    console.error('Migration error', err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
