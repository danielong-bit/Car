let pending;
export function loadSiteUi(){
 return pending ||= import('./assets/site-ui.js?v=gemini-merge-20261025a').catch(error=>{pending=undefined;throw error;});
}
