import test from 'node:test';
import assert from 'node:assert/strict';
import {parseListingDetails} from '../../public/listing-import.mjs';
import {validateDocument} from '../../lib/cms/contracts.mjs';
import {publicContent, validateContent} from '../../content-contracts.mjs';

test('dealer notes fill labeled details and show unknown lines for review', () => {
 const notes = [
  'Engine: 2.4L Turbo', '排量：2,393 cc', 'Gearbox: 8-speed automatic',
  'Fuel type: petrol', 'Warranty: 5 years', '✨ Features:',
  '✅ Panoramic roof', '✅ 360° camera', '✅ panoramic roof',
  'Price: RM323,800', 'Engine: another engine', 'Chassis: check on arrival',
 ].join('\n');
 assert.deepEqual(parseListingDetails(notes), {
  fields:{engine:'2.4L Turbo',engineCc:'2393',transmission:'8-speed automatic',fuelType:'Petrol',warrantyInfo:'5 years'},
  features:['Panoramic roof','360° camera'],
  unrecognized:['Price: RM323,800','Engine: another engine','Chassis: check on arrival'],
 });
});

test('recognized performance bullets keep source wording and exclude ambiguous values', () => {
 assert.deepEqual(parseListingDetails('✨ Performance:\n✅ 2.4L Turbocharged Engine\n✅ 8-Speed Automatic Transmission\n✅ Check with Danny\n\nEngine size: 2.4 L\nWarranty: <pending>'), {
  fields:{engine:'2.4L Turbocharged Engine',transmission:'8-Speed Automatic Transmission'},
  features:[],
  unrecognized:['Check with Danny','Engine size: 2.4 L','Warranty: <pending>'],
 });
});

test('an incomplete draft passes both contracts and stays out of public stock', () => {
 const draft={id:'new-draft',stockId:'DRS-101',status:'draft',make:'',model:'',gallery:[]};
 const document={vehicles:[draft]};
 assert.deepEqual(validateDocument(document),[]);
 assert.equal(validateContent(document,true),document);
 assert.deepEqual(publicContent(document).vehicles,[]);
 const available={vehicles:[{...draft,status:'available',make:' ',model:'M2',gallery:[{url:'/assets/cover.webp'}]}]};
 assert.throws(()=>validateContent(available,true),/make, model and visible cover photo/);
 assert.ok(validateDocument(available,true).includes('Make is required.'));
});
