import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDocument, normalizeVehicle, splitGrade, vehicleIssues,estimate} from '../../public/inventory-domain.mjs';
import {loanSchedule} from '../../public/finance-engine.mjs';
import {publicDocument} from '../../lib/cms/contracts.mjs';
test('legacy migration retains identity and photographs with nullable prices',()=>{
 const v=normalizeVehicle({id:'audi',stockId:'A1',brand:'Audi',year:2025,price:0,mileage:'12,500 km (demo)',gallery:[{url:'/assets/a.jpg'}],tour:{hotspots:[{imageSrc:'/assets/b.jpg'}]}});
 assert.equal(v.id,'audi');assert.equal(v.make,'Audi');assert.equal(v.priceRm,0);assert.equal(v.mileageKm,12500);
 assert.deepEqual(v.galleryUrls,['/assets/a.jpg','/assets/b.jpg']);assert.deepEqual(v.tour.hotspots,[]);
 assert.equal(normalizeVehicle({priceRm:null}).priceRm,null);
});
test('combined grades parse without guessing unknown grades',()=>{
 assert.deepEqual(splitGrade('4.5/B'),{auctionGrade:'4.5',interiorGrade:'B'});
 assert.deepEqual(splitGrade('5A'),{auctionGrade:'5',interiorGrade:'A'});
 assert.deepEqual(splitGrade('RA'),{auctionGrade:'RA',interiorGrade:''});
 assert.deepEqual(splitGrade('potato'),{auctionGrade:'potato',interiorGrade:''});
});
test('public projection respects statuses, sold setting, private media and private fields',()=>{
 const d=normalizeDocument({vehicles:['Available','Reserved','Sold','Draft','Archived','Unavailable'].map((status,i)=>({id:'v'+i,stockId:'D'+i,make:'Toyota',model:'A',status,gallery:[{url:'/assets/a.jpg'},{url:'/assets/private.jpg',visible:false}],internalCost:1})),homepage:{showSoldVehicles:false}});
 const p=publicDocument(d);assert.equal(p.vehicles.length,2);assert.equal(p.vehicles[0].internalCost,undefined);assert.equal(p.vehicles[0].gallery.length,1);assert.ok(!JSON.stringify(p).includes('private.jpg'));
});
test('invalid stock data is caught before saving',()=>{
 assert.ok(vehicleIssues(normalizeVehicle({make:'Audi',model:'S5',stockId:'BAD ID',auctionGrade:'7'})).length);
});
test('card instalment estimate agrees with the retained calculator',()=>{
 for(const method of ['reducing','flat'])assert.equal(estimate({priceRm:438000},{rate:6,tenure:7,downPayment:10,method}),Math.round(loanSchedule(438000*.9,7,6,method).monthly));
});
