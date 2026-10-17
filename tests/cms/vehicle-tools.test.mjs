import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paymentEstimate,calculatorMarkup,conditionMarkup,paymentDestination} from '../../public/vehicle-tools.mjs';
import {prepareReportFile} from '../../public/browser-stock.mjs';
import {File} from 'node:buffer';
import {normalizeVehicle,vehicleIssues} from '../../public/inventory-domain.mjs';
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
test('calculator keeps unknown prices blank and exposes only the requested inputs',()=>{
 const car=normalizeVehicle({id:'car',stockId:'A1',make:'Toyota',model:'Alphard',priceRm:null});
 const html=calculatorMarkup(car,{tenure:7,rate:6,downPayment:10},'en');
 assert.match(html,/id="paymentCar"/);assert.match(html,/id="payment-price"[^>]*value=""/);
 assert.ok(!html.includes('payment-years'));assert.ok(!html.includes('paymentChart'));
 assert.ok(!html.includes('Insurance'));assert.ok(!html.includes('repayment breakdown'));
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
 assert.match(html,/Report not uploaded/);assert.match(html,/Not provided/);assert.ok(!html.includes('id="openAuctionReport"'));
});
