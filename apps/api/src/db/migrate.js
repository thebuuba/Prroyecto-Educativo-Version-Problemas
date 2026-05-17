const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

function listSqlFiles() {
  const files = [];
  const repoRoot = path.resolve(__dirname, '../../../..');
  const schemaCandidates = [
    path.resolve(repoRoot, 'supabase/schema.sql'),
    path.resolve(__dirname, './schema.sql'),
  ];
  const rootSchema = schemaCandidates.find((filePath) => fs.existsSync(filePath));
  if (rootSchema) files.push(rootSchema);

  const migrationsDir = fs.existsSync(path.resolve(repoRoot, 'supabase/migrations'))
    ? path.resolve(repoRoot, 'supabase/migrations')
    : path.resolve(__dirname, './migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((name) => name.endsWith('.sql'))
      .sort()
      .map((name) => path.join(migrationsDir, name));
    files.push(...migrationFiles);
  }
  return files;
}

async function migrate() {
  for (const filePath of listSqlFiles()) {
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`[aulabase-sql-api] aplicado ${path.basename(filePath)}`);
  }
}

migrate()
  .catch((error) => {
    console.error('[aulabase-sql-api] fallo migracion', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
