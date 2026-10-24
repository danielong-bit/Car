import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {visitorAnalytics} from '../../visitor-analytics.mjs';
import worker from '../../owner-worker.mjs';

test('visit sessions are deduplicated, expire after 30 days and report device/country totals',async()=>{
 const db=new DatabaseSync(':memory:');
 const storage={sql:{exec(query,...params){const statement=db.prepare(query);if(statement.columns().length)return statement.all(...params);statement.run(...params);return [];}}};
 const now=Date.parse('2026-10-24T12:00:00Z');
 const visit=(id,time,country='MY',device='Mobile')=>visitorAnalytics(storage,new Request('https://site.test/api/analytics/visit',{method:'POST',body:JSON.stringify({id,country,device})}),time);
 try{
  await visit('00000000-0000-4000-8000-000000000001',now-40*86400000);
  await visit('00000000-0000-4000-8000-000000000002',now);
  await visit('00000000-0000-4000-8000-000000000002',now);
  await visit('00000000-0000-4000-8000-000000000003',now-86400000,'SG','Desktop');
  const response=await visitorAnalytics(storage,new Request('https://site.test/api/owner/analytics'),now),data=await response.json();
  assert.equal(data.total,2);assert.equal(data.today,1);
  assert.deepEqual(data.devices.map(x=>x.name).sort(),['Desktop','Mobile']);
  assert.deepEqual(data.countries.map(x=>x.name).sort(),['MY','SG']);
  const invalid=await visitorAnalytics(storage,new Request('https://site.test/api/analytics/visit',{method:'POST',body:'null'}),now);assert.equal(invalid.status,400);
 }finally{db.close();}
});

test('analytics report requires owner auth; public collection rejects cross origin',async()=>{
 const response=await worker.fetch(new Request('https://site.test/api/owner/analytics'),{});assert.equal(response.status,401);
 const rejected=await worker.fetch(new Request('https://site.test/api/analytics/visit',{method:'POST',headers:{Origin:'https://other.test'},body:'{}'}),{});assert.equal(rejected.status,403);
});

test('collection uses platform country and device categories, never client-supplied location or IP',async()=>{
 let forwarded;
 const env={CONTENT_STORE:{idFromName:()=>1,get:()=>({fetch:async request=>{forwarded=await request.json();return new Response('{}');}})}};
 const request=new Request('https://site.test/api/analytics/visit',{method:'POST',headers:{Origin:'https://site.test','User-Agent':'Mozilla/5.0 iPhone Mobile'},body:JSON.stringify({id:'00000000-0000-4000-8000-000000000004',country:'FAKE'})});
 Object.defineProperty(request,'cf',{value:{country:'MY'}});
 const response=await worker.fetch(request,env);assert.equal(response.status,200);
 assert.deepEqual(forwarded,{id:'00000000-0000-4000-8000-000000000004',country:'MY',device:'Mobile'});
});
