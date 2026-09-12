import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdirSync} from 'node:fs';
export function openDb(path=':memory:'){
 if(path!==':memory:')mkdirSync('.local',{recursive:true});
 const sqlite=new DatabaseSync(path);sqlite.exec('CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY)');
 for(const name of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()){if(!sqlite.prepare('SELECT name FROM _local_migrations WHERE name=?').get(name)){sqlite.exec(readFileSync('drizzle/'+name,'utf8'));sqlite.prepare('INSERT INTO _local_migrations VALUES (?)').run(name);}}
 return {prepare(sql){let args=[];const statement={bind(...values){args=values;return statement;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){const result=sqlite.prepare(sql).run(...args);return {meta:{changes:result.changes}};}};return statement;},close:()=>sqlite.close()};
}
