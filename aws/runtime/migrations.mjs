import {createHash} from 'node:crypto';
export const checksum=sql=>createHash('sha256').update(sql).digest('hex');
export async function applyMigrations(client,migrations,{target,apply=false}={}){
 await client.query('SELECT pg_advisory_lock(734192)');
 try{
  const exists=await client.query("SELECT to_regclass('public.schema_migrations') AS name");
  const applied=exists.rows[0]?.name?(await client.query('SELECT version,checksum FROM schema_migrations')).rows:[];
  for(const record of applied){const source=migrations.find(m=>m.version===record.version);if(!source||checksum(source.sql)!==record.checksum)throw Error('Migration history differs from this release');}
  const ordered=[...migrations].sort((a,b)=>a.version.localeCompare(b.version));
  if(target&&!ordered.some(m=>m.version===target))throw Error('Unknown migration target');
  if(target&&applied.some(m=>m.version>target))throw Error('Rollback requires restore; down migrations are forbidden');
  const pending=ordered.filter(m=>!applied.some(a=>a.version===m.version)&&(!target||m.version<=target));
  if(!apply)return {pending:pending.map(m=>m.version),applied:applied.map(m=>m.version)};
  await client.query('BEGIN');
  try{
   await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(version text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
   for(const migration of pending){await client.query(migration.sql);await client.query('INSERT INTO schema_migrations(version,checksum) VALUES($1,$2)',[migration.version,checksum(migration.sql)]);}
   await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK');throw e;}
  return {applied:pending.map(m=>m.version)};
 }finally{await client.query('SELECT pg_advisory_unlock(734192)');}
}
