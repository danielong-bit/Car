import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDocument} from '../../public/inventory-domain.mjs';
import {publicDocument} from '../../lib/cms/contracts.mjs';
import {normalizeBrandFilters,visibleBrandFilters,matchesInventorySelection} from '../../public/inventory-brand-filters.mjs';

const vehicles=[
  {id:'lexus-stock',make:'Lexus',model:'RX',status:'available'},
  {id:'lexus-sold',make:'Lexus',model:'NX',status:'sold'},
  {id:'audi-booked',make:'Audi',model:'S5',status:'reserved'},
  {id:'honda-sold',make:'Honda',model:'Civic',status:'sold'},
  {id:'nissan-draft',make:'Nissan',model:'GT-R',status:'draft'}
];
const select=filters=>vehicles.filter(v=>matchesInventorySelection(v,filters)).map(v=>v.id);

test('automatic brand buttons include live stock and bookings, not sold-only or draft brands',()=>{
  assert.deepEqual(visibleBrandFilters({vehicles}),['Audi','Lexus']);
  const soldOut=vehicles.map(v=>v.id==='lexus-stock'?{...v,status:'sold'}:v);
  assert.deepEqual(visibleBrandFilters({vehicles:soldOut}),['Audi']);
  assert.equal(soldOut.filter(v=>matchesInventorySelection(v,{status:'sold'})).length,3);
});

test('status and brand filters intersect; All stock includes available and sold records for that brand',()=>{
  assert.deepEqual(select({make:'Lexus'}),['lexus-stock','lexus-sold']);
  assert.deepEqual(select({status:'available',make:'Lexus'}),['lexus-stock']);
  assert.deepEqual(select({status:'sold',make:'Lexus'}),['lexus-sold']);
  assert.deepEqual(select({status:'reserved',make:'Audi'}),['audi-booked']);
  assert.deepEqual(select({status:'sold',make:''}),['lexus-sold','honda-sold']);
});

test('manual button choices do not remove sold cars or invent empty brand categories',()=>{
  const homepage={brandFilterMode:'manual',brandFilters:['Audi','Honda','Unknown','Nissan']};
  assert.deepEqual(visibleBrandFilters({vehicles,homepage}),['Audi','Honda']);
  assert.deepEqual(visibleBrandFilters({vehicles,homepage:{...homepage,brandFilters:[]}}),[]);
  assert.deepEqual(select({status:'sold'}),['lexus-sold','honda-sold']);
});

test('brand configuration is normalized and survives public export and backup reload',()=>{
  assert.deepEqual(normalizeBrandFilters({brandFilterMode:'bad',brandFilters:[' Lexus ','lexus',null,'']}),{brandFilterMode:'auto',brandFilters:['Lexus']});
  const input=normalizeDocument({vehicles,homepage:{brandFilterMode:'manual',brandFilters:['Audi']}});
  const output=normalizeDocument(JSON.parse(JSON.stringify(publicDocument(input))));
  assert.equal(output.homepage.brandFilterMode,'manual');
  assert.deepEqual(output.homepage.brandFilters,['Audi']);
  assert.equal(output.vehicles.filter(v=>v.status==='sold').length,2);
});

test('search still finds a sold car when its brand button is hidden',()=>{
  const filters={status:'sold',search:'honda'};
  assert.deepEqual(select(filters),['honda-sold']);
  assert.deepEqual(select({status:'sold',make:'Lexus',search:'NX'}),['lexus-sold']);
});
