export const SHOWROOM_ADDRESS='U8, Metropolitan Business Park, 4, Jalan Para U8/103, Bukit Jelutong, 40150 Shah Alam, Selangor';
export function showroomLocation(profile={}){
 const value=String(profile.location||'').trim();
 const legacy=['','Shah Alam','Bukit Jelutong Glenmarie Shah Alam','Bukit Jelutong, Glenmarie, Shah Alam','Bukit Jelutong · Glenmarie, Shah Alam, Selangor'];
 return legacy.includes(value)?SHOWROOM_ADDRESS:value;
}
