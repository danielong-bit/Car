import { scaleLinear } from 'd3-scale';
window.DannyCharts = function(host,rows,label='Views'){
 host.replaceChildren();const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 620 '+Math.max(100,rows.length*42+30));svg.setAttribute('role','img');svg.setAttribute('aria-label',label+' by model');const scale=scaleLinear().domain([0,Math.max(1,...rows.map(r=>r.value))]).range([0,330]);
 rows.forEach((r,i)=>{const y=i*42+20;for(const [x,txt] of [[0,r.name],[565,r.value.toLocaleString()]]){const t=document.createElementNS(ns,'text');t.setAttribute('x',x);t.setAttribute('y',y+15);t.setAttribute('font-size','12');t.setAttribute('fill','#657181');t.textContent=txt;svg.append(t);}const bar=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:215,y,width:scale(r.value),height:23,rx:5,fill:'var(--ds-accent)'}))bar.setAttribute(k,String(v));svg.append(bar);});host.append(svg);
};
