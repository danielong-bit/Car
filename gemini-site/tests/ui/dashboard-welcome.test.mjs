import {test} from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {welcomeHeadMarkup,welcomeInitialMarkup} from '../../public/dashboard-welcome-boot.mjs';

function open(t,time,{blocked=false}={}){
 const timers=[];
 const dom=new JSDOM(`<html><head>${welcomeHeadMarkup}</head><body class="workbench">${welcomeInitialMarkup}<aside class="wb-sidebar">Navigation</aside><main class="wb-main">Overview</main></body></html>`,{url:'https://preview.test/studio/',runScripts:'dangerously',beforeParse(win){
  if(time)win.sessionStorage.setItem('danny-dashboard-welcome',String(time));
  if(blocked)Object.defineProperty(win,'sessionStorage',{get(){throw Error('Storage blocked');}});
  win.setTimeout=(fn,delay)=>{timers.push({fn,delay});return timers.length;};
 }});
 t.after(()=>dom.window.close());return {win:dom.window,timers};
}
test('a successful login shows Welcome and hides Overview before any dashboard module runs',t=>{
 const {win,timers}=open(t,Date.now());
 assert.equal(win.getComputedStyle(win.document.querySelector('.wb-main')).visibility,'hidden');
 assert.equal(win.getComputedStyle(win.document.querySelector('#dashboardWelcomeInitial')).display,'grid');
 assert.match(win.document.querySelector('#dashboardWelcomeInitial').textContent,/Welcome toDashboard/);
 assert.equal(win.sessionStorage.getItem('danny-dashboard-welcome'),null);
 assert.equal(timers[0].delay,10000);
 // If the enhancement bundle fails, the fallback still makes the workspace usable.
 timers[0].fn();
 assert.equal(win.document.querySelector('#dashboardWelcomeInitial'),null);
 assert.notEqual(win.getComputedStyle(win.document.querySelector('.wb-main')).visibility,'hidden');
});
test('direct visits and expired login markers do not replay Welcome',t=>{
 for(const time of [undefined,Date.now()-61000,Date.now()+61000]){
  const {win}=open(t,time);
  assert.equal(win.document.documentElement.classList.contains('owner-welcoming'),false);
  assert.equal(win.getComputedStyle(win.document.querySelector('#dashboardWelcomeInitial')).display,'none');
 }
});
test('blocked session storage does not trap the owner behind the welcome screen',t=>{
 const {win}=open(t,undefined,{blocked:true});
 assert.equal(win.document.documentElement.classList.contains('owner-welcoming'),false);
 assert.notEqual(win.getComputedStyle(win.document.querySelector('.wb-main')).visibility,'hidden');
});
