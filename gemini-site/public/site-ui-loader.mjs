let pending;
export function loadSiteUi(){
 return pending ||= import('./assets/site-ui.js?v=brand-compact-20261026a').catch(error=>{pending=undefined;throw error;});
}
