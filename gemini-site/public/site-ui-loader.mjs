let pending;
export function loadSiteUi(){
 return pending ||= import('./assets/site-ui.js?v=showroom-polish-20261024b').catch(error=>{pending=undefined;throw error;});
}
