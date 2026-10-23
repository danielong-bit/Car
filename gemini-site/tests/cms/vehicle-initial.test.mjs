import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialVehicleMarkup} from '../../public/vehicle-initial.mjs';

const document={profile:{phone:'60125686528'},finance:{rate:6,tenure:7,downPayment:10,method:'reducing'}};
const car={id:'fresh-car',make:'Honda',model:'Civic',stockId:'NEW-1',year:2024,priceRm:328000,status:'available',gallery:[{url:'/assets/uploads/car.webp',category:'Exterior'}]};

test('first response contains real vehicle information and uploaded cover without JavaScript',()=>{
 const html=initialVehicleMarkup(car,document,{base:'/Car-Recond-Japan/',pathname:'/Car-Recond-Japan/vehicle/fresh-car/'});
 assert.match(html,/<h1 id="vehicleTitle">Honda Civic<\/h1>/);
 assert.match(html,/src="\/assets\/uploads\/car.webp"/);
 assert.match(html,/RM 328,000/);
 assert.ok(!html.includes('Loading'));
 assert.match(html,/href="\/Car-Recond-Japan\/#inventory"/);
});

test('initial view preserves unavailable status and escapes owner-provided text',()=>{
 const html=initialVehicleMarkup({...car,model:'<script>alert(1)</script>',status:'sold'},document);
 assert.match(html,/data-status="sold">Sold/);
 assert.match(html,/class="stock-price is-sold">SOLD/);
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.ok(html.includes('&lt;script&gt;'));
});
