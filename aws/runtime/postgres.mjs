// Compatibility surface for the application's bounded, parameterized D1 queries.
// Schema stays text JSON to preserve serialization and optimistic revision checks.
export function postgresSql(sql){
 let converted=sql.replace(/`([a-z_]+)`/gi,'"$1"');
 converted=converted.replace(/json_extract\(data,\s*'\$\.photo'\)/gi,"(data::jsonb ->> 'photo')");
 if(/INSERT OR IGNORE INTO/i.test(converted))converted=converted.replace(/INSERT OR IGNORE INTO/i,'INSERT INTO')+' ON CONFLICT DO NOTHING';
 if(/ON CONFLICT\(id\) DO UPDATE SET count=/i.test(converted)){
  converted=converted.replace(/SET count=count/gi,'SET count=ai_usage.count').replace(/WHERE count/gi,'WHERE ai_usage.count');
 }
 let n=0,inString=false,result='';
 for(let i=0;i<converted.length;i++){
  const c=converted[i];
  if(c==="'"){
   if(inString&&converted[i+1]==="'"){result+="''";i++;continue;}
   inString=!inString;
  }
  result+=c==='?'&&!inString?'$'+(++n):c;
 }
 return result;
}
export function databaseAdapter(client){
 return {prepare(sql){const query=postgresSql(sql);let args=[];
  const statement={bind(...values){args=values;return statement;},async first(){return (await client.query(query,args)).rows[0]||null;},async all(){return {results:(await client.query(query,args)).rows};},async run(){return {meta:{changes:(await client.query(query,args)).rowCount||0}};}};
  return statement;
 }};
}
