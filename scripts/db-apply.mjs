// Aplica un archivo SQL al Postgres de Supabase dentro de una transacción.
// Uso: npm run db:apply -- supabase/migrations/0007_algo.sql
// Necesita en .env.local: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_DB_PASSWORD.
// Guarda en .env.local el host que funcionó (SUPABASE_DB_HOST) para las próximas veces.
import fs from "node:fs";
import pg from "pg";

const envPath = new URL("../.env.local", import.meta.url);
const raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const env = Object.fromEntries(
  raw.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const file = process.argv[2];
if (!file) {
  console.error("Falta el archivo SQL. Ejemplo: npm run db:apply -- supabase/migrations/0007_algo.sql");
  process.exit(1);
}
const password = env.SUPABASE_DB_PASSWORD;
const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!password || !ref) {
  console.error("Faltan SUPABASE_DB_PASSWORD o NEXT_PUBLIC_SUPABASE_URL en .env.local (pedile la contraseña a Bruno).");
  process.exit(1);
}

const regions = ["us-east-1", "sa-east-1", "us-east-2", "us-west-1", "eu-west-1", "eu-central-1", "ap-southeast-1"];
const candidates = [];
if (env.SUPABASE_DB_HOST) candidates.push({ host: env.SUPABASE_DB_HOST, user: `postgres.${ref}` });
for (const r of regions) for (const p of ["aws-0", "aws-1"]) candidates.push({ host: `${p}-${r}.pooler.supabase.com`, user: `postgres.${ref}` });

let client;
for (const c of candidates) {
  const attempt = new pg.Client({ host: c.host, port: 5432, user: c.user, password, database: "postgres", ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 6000 });
  try {
    await attempt.connect();
    client = attempt;
    if (env.SUPABASE_DB_HOST !== c.host) fs.appendFileSync(envPath, `\nSUPABASE_DB_HOST=${c.host}\n`);
    break;
  } catch {
    /* probar el siguiente host */
  }
}
if (!client) {
  console.error("No pude conectarme a la base. Revisá la contraseña o la región del pooler.");
  process.exit(1);
}

const sql = fs.readFileSync(file, "utf8");
try {
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`OK: ${file} aplicado.`);
} catch (e) {
  await client.query("rollback");
  console.error(`ERROR, se deshizo todo: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
