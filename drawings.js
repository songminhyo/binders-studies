'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const stage=$('stage'), image=$('drawing'), status=$('status');
 const sheets = {
  overall:{title:'Overall floor plan',description:'Building arrangement and spatial connections.',code:'OVERALL',scale:'1:150',image:'BINDERS_OVERALL_R05.svg',pdf:'BINDERS_OVERALL_BLACK_R05.pdf',crop:[280,245,1675,1420]},
  a:{title:'Building A / Detail plan',description:'Information · Curation · Clinic · Binding',code:'A-01',scale:'1:100',image:'BINDERS_A_R05.svg',pdf:'BINDERS_ABC_DETAILS_BLACK_UNIFIED_R05.pdf#page=1',crop:[397,367,1987,983]},
  b:{title:'Building B / Detail plan',description:'Printing · Heating · Storage · Incubating · Inoculation · Pickup · Lounge',code:'B-01',scale:'1:100',image:'BINDERS_B_R05.svg',pdf:'BINDERS_ABC_DETAILS_BLACK_UNIFIED_R05.pdf#page=2',crop:[291,284,2093,1066]},
  c:{title:'Building C / Workshop detail plan',description:'Workshop · Mobile partitions · Landscaped corridor · Toilets',code:'C-01',scale:'1:100',image:'BINDERS_C_R05.svg',pdf:'BINDERS_ABC_DETAILS_BLACK_UNIFIED_R05.pdf#page=3',crop:[651,315,1733,1035]}
 };
 let sheet='overall',mode='plan',scale=1,fitScale=1,x=0,y=0,loaded=false,request=0;
 const pointers=new Map();
 let gesture=null;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function draw(){
  image.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
  $('zoom-value').value=`${Math.round(scale/fitScale*100)}%`;
  $('zoom-value').textContent=$('zoom-value').value;
 }
 function fit(){
  const r=stage.getBoundingClientRect(),box=mode==='sheet'?[0,0,2384,1684]:sheets[sheet].crop;
  image.style.clipPath=mode==='sheet'?'none':`inset(${box[1]}px ${2384-box[2]}px ${1684-box[3]}px ${box[0]}px)`;
  fitScale=Math.min((r.width-24)/(box[2]-box[0]),(r.height-24)/(box[3]-box[1]));
  fitScale=Math.max(.01,fitScale);scale=fitScale;
  x=(r.width-(box[2]-box[0])*scale)/2-box[0]*scale;
  y=(r.height-(box[3]-box[1])*scale)/2-box[1]*scale;
  draw();
 }
 function at(clientX,clientY){const r=stage.getBoundingClientRect();return {x:clientX-r.left,y:clientY-r.top};}
 function zoom(next,cx=stage.clientWidth/2,cy=stage.clientHeight/2){
  if(!loaded)return;
  next=clamp(next,fitScale*.65,fitScale*16);
  const ratio=next/scale;
  x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;scale=next;draw();
 }
 function changeMode(next){mode=next;$('mode-plan').setAttribute('aria-pressed',String(next==='plan'));$('mode-sheet').setAttribute('aria-pressed',String(next==='sheet'));fit();}
 function publish(){
  const hash='#'+sheet;if(location.hash!==hash)history.replaceState(null,'',hash);
  if(parent!==window)parent.postMessage({type:'drawing-sheet',sheet},location.origin);
 }
 function select(key){
  if(!sheets[key])key='overall';
  sheet=key;const data=sheets[key],token=++request;
  loaded=false;image.hidden=true;status.hidden=false;status.classList.remove('error');status.textContent='Loading vector drawing…';
  $('sheet-title').textContent=data.title;$('sheet-description').textContent=data.description;
  $('stamp').textContent=`${data.code} / A1 / ${data.scale}`;$('pdf').href=data.pdf;
  image.alt=`${data.title} — vector architectural drawing`;
  document.querySelectorAll('[data-sheet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sheet===key)));
  image.onload=()=>{if(token!==request)return;loaded=true;image.hidden=false;status.hidden=true;fit();};
  image.onerror=()=>{if(token!==request)return;loaded=false;status.classList.add('error');status.textContent='The drawing could not load. Please open the PDF above or try this sheet again.';};
  image.src=data.image;
  publish();
 }
 document.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>select(b.dataset.sheet));
 $('mode-plan').onclick=()=>changeMode('plan');$('mode-sheet').onclick=()=>changeMode('sheet');
 $('reset').onclick=fit;$('zoom-in').onclick=()=>zoom(scale*1.25);$('zoom-out').onclick=()=>zoom(scale/1.25);
 stage.addEventListener('wheel',e=>{e.preventDefault();const p=at(e.clientX,e.clientY);zoom(scale*Math.exp(-e.deltaY*.0016),p.x,p.y);},{passive:false});
 function startGesture(){
  const ps=[...pointers.values()];
  if(ps.length>=2){
   const a=ps[0],b=ps[1],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
   gesture={kind:'pinch',distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale,worldX:(cx-x)/scale,worldY:(cy-y)/scale};
  }else if(ps.length===1)gesture={kind:'pan',start:ps[0],x,y};
  else gesture=null;
 }
 stage.addEventListener('pointerdown',e=>{
  if(!loaded||e.pointerType==='mouse'&&e.button!==0)return;
  stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,at(e.clientX,e.clientY));startGesture();stage.classList.add('dragging');
 });
 stage.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId)||!gesture)return;
  pointers.set(e.pointerId,at(e.clientX,e.clientY));const ps=[...pointers.values()];
  if(gesture.kind==='pinch'&&ps.length>=2){
   const a=ps[0],b=ps[1],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
   scale=clamp(gesture.scale*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance,fitScale*.65,fitScale*16);
   x=cx-gesture.worldX*scale;y=cy-gesture.worldY*scale;
  }else if(gesture.kind==='pan'&&ps.length===1){x=gesture.x+ps[0].x-gesture.start.x;y=gesture.y+ps[0].y-gesture.start.y;}
  draw();
 });
 function release(e){pointers.delete(e.pointerId);startGesture();if(!pointers.size)stage.classList.remove('dragging');}
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>stage.addEventListener(type,release));
 stage.addEventListener('dblclick',fit);
 stage.addEventListener('keydown',e=>{
  if(e.key==='+'||e.key==='='){e.preventDefault();zoom(scale*1.25);}
  else if(e.key==='-'){e.preventDefault();zoom(scale/1.25);}
  else if(e.key==='0'||e.key==='Home'){e.preventDefault();fit();}
  else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;draw();
  }
 });
 let resizeFrame=0;
 new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(fit);}).observe(stage);
 window.addEventListener('message',e=>{
  if(e.source!==parent||e.origin!==location.origin)return;
  if(e.data?.type==='select-drawing'&&sheets[e.data.sheet]&&sheet!==e.data.sheet)select(e.data.sheet);
 });
 window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(sheets[key]&&key!==sheet)select(key);});
 select(location.hash.slice(1)||'overall');
})();
