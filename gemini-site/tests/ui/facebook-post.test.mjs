import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {generateFacebookPost,openFacebookPost} from '../../public/facebook-post.mjs';
const car={id:'vellfire',status:'available',make:'Toyota',model:'Vellfire',variant:'Z Premier 2.4 Turbo',manufactureYear:2025,exteriorColor:'White',mileageKm:12000,priceRm:323800,auctionGrade:'5',interiorGrade:'A',engine:'2.4L Turbocharged Engine',transmission:'8-Speed Automatic',features:['Panoramic Roof','Panoramic Roof','2.4L Turbocharged Engine'],warrantyInfo:'5-Year Engine & Gearbox Warranty',location:'Mai Auto'};
test('Facebook copy follows the supplied format using actual vehicle data only',()=>{
 const text=generateFacebookPost(car,{name:'Danny',phone:'60125686528'});
 assert.match(text,/FOR SALE \| TOYOTA VELLFIRE Z PREMIER 2.4 TURBO/);
 assert.match(text,/2025 \| White \| 12,000 km \| RM323,800/);
 assert.match(text,/Grade 5\/A/);assert.match(text,/Performance:/);assert.match(text,/Features:/);assert.match(text,/Warranty:/);
 assert.equal(text.match(/Panoramic Roof/g).length,1);assert.equal(text.match(/2.4L Turbocharged Engine/g).length,1);
 assert.match(text,/https:\/\/wa.me\/60125686528/);assert.match(text,/vehicle=vellfire/);
 assert.doesNotMatch(text,/Unlimited|360/);
 const empty=generateFacebookPost({make:'Honda',model:'Civic',status:'draft'},{});
 assert.doesNotMatch(empty,/Warranty:|Grade|Performance:|Features:|vehicle=|undefined|null/);
});
test('owner can edit generated text and copy that exact revision without publishing',async()=>{
 const dom=new JSDOM('<body></body>');let copied='';const doc=dom.window.document;
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'));};
 Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async text=>{copied=text;}}});
 const dialog=openFacebookPost(car,{},doc);dialog.querySelector('textarea').value='My reviewed post';
 await dialog.querySelector('[data-copy-post]').onclick();assert.equal(copied,'My reviewed post');
 dialog.querySelector('[data-close-post]').click();assert.equal(doc.querySelector('dialog'),null);assert.equal(doc.body.style.overflow,'');dom.window.close();
});
