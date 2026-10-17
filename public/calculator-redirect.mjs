import {readLocal} from './browser-stock.mjs';
import {paymentDestination} from './vehicle-tools.mjs';
let inventory=window.CMS_DATA||{};
const params=new URLSearchParams(location.search);
if(params.get('local-preview')==='1') {
  try{inventory=await readLocal('preview')||inventory;}catch{/* Use the published stock if browser storage cannot open. */}
}
const target=paymentDestination(inventory.vehicles||[],params,window.SITE_BASE||'/');
document.getElementById('calculatorDestination').href=target;
location.replace(target);
