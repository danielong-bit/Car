let pending;
export function loadSiteUi(){
 return pending ||= import('./assets/site-ui.js?v=brand-final-20261025b').catch(error=>{pending=undefined;throw error;});
}
