import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paymentEstimate,calculatorMarkup,conditionMarkup,paymentDestination,estimateVehiclePayment,conditionValues} from '../../public/vehicle-tools.mjs';
import {photoCategory,wrapIndex,galleryMarkup} from '../../public/vehicle-gallery.mjs';
import {prepareReportFile} from '../../public/browser-stock.mjs';
import {File} from 'node:buffer';
import {normalizeVehicle,vehicleIssues,financeSettings} from '../../public/inventory-domain.mjs';
import {publicDocument} from '../../lib/cms/contracts.mjs';

test('inline estimates cover zero interest, full down payment and invalid input',()=>{
 assert.equal(paymentEstimate(120000,10,5,0).monthly,1800);
 assert.equal(paymentEstimate(120000,100,7,6).monthly,0);
 assert.ok(Number.isFinite(paymentEstimate(120000,10,7,6.25).monthly));
 for(const args of [[120000,-1,7,6],[120000,101,7,6],[NaN,10,7,6],[120000,10,1.5,6],[120000,10,7,-1]])assert.throws(()=>paymentEstimate(...args));
});
test('old calculator URLs resolve new preview stock and mounted published stock',()=>{
 const local=[{id:'new-car',status:'available',priceRm:120000}];
 assert.equal(paymentDestination(local,new URLSearchParams('vehicle=new-car&local-preview=1'),'/Car-Recond-Japan/'),'/Car-Recond-Japan/audi/?vehicle=new-car&local-preview=1#vehicleCalculator');
 assert.equal(paymentDestination(local,new URLSearchParams('car=new-car'),'/Car-Recond-Japan/'),'/Car-Recond-Japan/vehicle/new-car/#vehicleCalculator');
 assert.equal(paymentDestination([],new URLSearchParams(),'/'),'/#inventory');
});
test('auction report files retain exact source bytes and reject unsupported uploads',async()=>{
 const bytes=Uint8Array.from([137,80,78,71,13,10,26,10,0,1,255,84]);
 const image=await prepareReportFile(new File([bytes],'large-scan.png',{type:'image/png'}));
 assert.equal(image.extension,'.png');assert.deepEqual(new Uint8Array(await image.blob.arrayBuffer()),bytes);
 const pdf=await prepareReportFile(new File(['%PDF-1.4\noriginal report'],'auction.pdf',{type:'application/pdf'}));
 assert.equal(await pdf.blob.text(),'%PDF-1.4\noriginal report');
 await assert.rejects(()=>prepareReportFile(new File(['not pdf'],'bad.pdf',{type:'application/pdf'})));
 await assert.rejects(()=>prepareReportFile(new File(['<svg/>'],'bad.svg',{type:'image/svg+xml'})));
});
test('calculator locks the current car price and rate while offering deposit and tenure',()=>{
 const car=normalizeVehicle({id:'car',stockId:'A1',make:'Toyota',model:'Alphard',priceRm:null});
 const html=calculatorMarkup(car,{tenure:7,rate:6,downPayment:10},'en');
 assert.ok(!html.includes('paymentCar'));assert.ok(!html.includes('payment-price'));assert.ok(!html.includes('payment-rate'));
 assert.match(html,/id="paymentDown"[^>]*step="5"/);assert.match(html,/id="paymentYears"/);
 assert.ok(!html.includes('paymentChart'));assert.throws(()=>estimateVehiclePayment(car,{rate:6},10,7));
 assert.ok(!html.includes('Insurance'));assert.ok(!html.includes('repayment breakdown'));
});
test('deposit steps and tenure choices use the owner price and fixed configured rate',()=>{
 const v={priceRm:438000};const f={rate:6,tenure:7,downPayment:10};
 assert.ok(estimateVehiclePayment(v,f,20,7).monthly<estimateVehiclePayment(v,f,15,7).monthly);
 assert.ok(estimateVehiclePayment(v,f,10,9).monthly<estimateVehiclePayment(v,f,10,5).monthly);
 assert.equal(estimateVehiclePayment(v,f,10,7).monthly,paymentEstimate(438000,10,7,6).monthly);
 assert.throws(()=>estimateVehiclePayment(v,f,12,7));assert.throws(()=>estimateVehiclePayment(v,f,10,6));
 assert.deepEqual(financeSettings({rate:0,tenure:9,downPayment:17}).downPayment,15);
 assert.equal(financeSettings({rate:NaN,tenure:100}).rate,6);
});
test('gallery categories and wrapping preserve the actual photo collection',()=>{
 assert.equal(photoCategory('Rear climate controls'),'interior');assert.equal(photoCategory('Wheel'),'exterior');assert.equal(photoCategory('Engine'),'engine');
 assert.equal(wrapIndex(-1,8),7);assert.equal(wrapIndex(8,8),0);assert.equal(wrapIndex(1,0),0);
 assert.match(galleryMarkup([],'Car','en'),/Photos will be added soon/);
});
test('example grades are explicit and can be replaced without modifying original evidence',()=>{
 const v=normalizeVehicle({conditionExample:true,auctionReport:{url:'/assets/report.pdf'},auctionGrade:'5',interiorGrade:'A'});
 assert.equal(conditionValues(v).auctionGrade,'4.5');assert.equal(conditionValues(v).report,null);
 assert.match(conditionMarkup(v,'en',()=>''),/EXAMPLE/);
 const actual={...v,conditionExample:false};assert.equal(conditionValues(actual).auctionGrade,'5');assert.equal(conditionValues(actual).report.url,'/assets/report.pdf');
 assert.equal(publicDocument({vehicles:[{...v,status:'available'}]}).vehicles[0].conditionExample,true);
});
test('report URLs survive publication while invalid reports fail before save',()=>{
 const car=normalizeVehicle({id:'car',stockId:'A1',make:'Toyota',model:'Alphard',status:'available',auctionGrade:'4.5/B',auctionReport:{url:'/assets/uploads/report.pdf',name:'Original report.pdf'}});
 assert.equal(vehicleIssues(car).length,0);
 assert.deepEqual(publicDocument({vehicles:[car]}).vehicles[0].auctionReport,car.auctionReport);
 assert.equal(car.interiorGrade,'B');
 for(const url of ['javascript:alert(1)','/assets/../private.pdf','https://example.com/file.html'])assert.ok(vehicleIssues({...car,auctionReport:{url}}).length);
});
test('missing grades do not invent condition values or advertise an attached report',()=>{
 const car=normalizeVehicle({id:'car',stockId:'A1',make:'Toyota',model:'Alphard'});
 const html=conditionMarkup(car,'en',()=> 'https://wa.me/60125686528');
 assert.match(html,/not provided yet/);assert.ok(!html.includes('id="openAuctionReport"'));assert.ok(!html.includes('condition-scores'));
});
