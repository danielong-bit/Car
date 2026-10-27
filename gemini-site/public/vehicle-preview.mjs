import {normalizeVehicle} from './inventory-domain.mjs';

// Build a browser-only preview without changing the saved draft or publication.
export function vehiclePreviewDocument(document,vehicle){
 const preview=structuredClone(document),copy=normalizeVehicle(vehicle);
 if(!['available','reserved','sold'].includes(copy.status))copy.status='available';
 const index=preview.vehicles.findIndex(v=>v.id===copy.id);
 if(index<0)preview.vehicles.push(copy);else preview.vehicles[index]=copy;
 return preview;
}
