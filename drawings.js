'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const stage=$('stage'), image=$('drawing'), status=$('status');
 const sheets = {
  overall:{title:'Overall floor plan',description:'Building arrangement and spatial connections.',code:'OVERALL',scale:'1:150',image:'BINDERS_OVERALL_R08.svg',pdf:'BINDERS_OVERALL_BLACK_R08.pdf',crop:[280,245,1675,1420]},
  a:{title:'Building A / Detail plan',description:'Information · Curation · Clinic · Binding',code:'A-01',scale:'1:100',image:'BINDERS_A_R08.svg',pdf:'BINDERS_ABC_DETAILS_BLACK_UNIFIED_R08.pdf#page=1',crop:[397,367,1987,983]},
  b:{title:'Building B / Detail plan',description:'Printing · Heating · Storage · Incubating · Inoculation · Pickup · Lounge',code:'B-01',scale:'1:100',image:'BINDERS_B_R08.svg',pdf:'BINDERS_ABC_DETAILS_BLACK_UNIFIED_R08.pdf#page=2',crop:[291,284,2093,1066]},
  c:{title:'Building C / Workshop detail plan',description:'Workshop · Mobile partitions · Landscaped corridor · Toilets',code:'C-01',scale:'1:100',image:'BINDERS_C_R08.svg',pdf:'BINDERS_ABC_DETAILS_BLACK_UNIFIED_R08.pdf#page=3',crop:[651,315,1733,1035]}
 };
 let sheet='overall',mode='plan',scale=1,fitScale=1,x=0,y=0,loaded=false,request=0;
 const pointers=new Map();
 let gesture=null,pendingLoadResolve=null;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function draw(){
  image.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
  overlay.style.transform=image.style.transform;
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
  stopPlayback();stopMotion();
  next=clamp(next,fitScale*.65,fitScale*16);
  const ratio=next/scale;
  x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;scale=next;draw();
 }
 function changeMode(next){stopPlayback();stopMotion();clearSpace();mode=next;$('mode-plan').setAttribute('aria-pressed',String(next==='plan'));$('mode-sheet').setAttribute('aria-pressed',String(next==='sheet'));fit();rebuildSpaces();}
 function publish(){
  const hash='#'+sheet;if(location.hash!==hash)history.replaceState(null,'',hash);
  if(parent!==window)parent.postMessage({type:'drawing-sheet',sheet},location.origin);
 }
 function select(key){
  if(pendingLoadResolve){pendingLoadResolve(false);pendingLoadResolve=null;}
  explorerBeforeSelect();
  if(!sheets[key])key='overall';
  sheet=key;const data=sheets[key],token=++request;
  loaded=false;picker.disabled=true;$('process-play').disabled=true;image.hidden=true;status.hidden=false;status.classList.remove('error');status.textContent='Loading vector drawing…';
  $('sheet-title').textContent=data.title;$('sheet-description').textContent=data.description;
  $('stamp').textContent=`${data.code} / A1 / ${data.scale}`;$('pdf').href=data.pdf;
  image.alt=`${data.title} — vector architectural drawing`;
  document.querySelectorAll('[data-sheet]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sheet===key)));
  const ready=new Promise(resolve=>{pendingLoadResolve=resolve;
  image.onload=()=>{if(token!==request){resolve(false);return;}loaded=true;image.hidden=false;status.hidden=true;fit();explorerLoaded();pendingLoadResolve=null;resolve(true);};
  image.onerror=()=>{if(token!==request){resolve(false);return;}loaded=false;status.classList.add('error');status.textContent='The drawing could not load. Please open the PDF above or try this sheet again.';explorerLoaded();pendingLoadResolve=null;resolve(false);};
  });
  image.src=data.image;
  publish();return ready;
 }
 const spaces=[
  {
    "id": "information",
    "sheet": "a",
    "name": "Information",
    "description": "Arrival and visitor information.",
    "points": [
      [
        548,
        557
      ],
      [
        758,
        557
      ],
      [
        758,
        882
      ],
      [
        548,
        882
      ],
      [
        548,
        778
      ],
      [
        665,
        635
      ],
      [
        548,
        635
      ]
    ],
    "overall": [
      [
        444.206,
        1135.802
      ],
      [
        572.121,
        1077.588
      ],
      [
        662.215,
        1275.553
      ],
      [
        534.299,
        1333.767
      ],
      [
        505.469,
        1270.418
      ],
      [
        537.095,
        1150.88
      ],
      [
        465.828,
        1183.314
      ]
    ]
  },
  {
    "id": "curation",
    "sheet": "a",
    "name": "Curation Room",
    "description": "Displays and a central exhibition area.",
    "points": [
      [
        780,
        558
      ],
      [
        1208,
        558
      ],
      [
        1208,
        764
      ],
      [
        780,
        764
      ]
    ],
    "overall": [
      [
        585.799,
        1072.099
      ],
      [
        846.503,
        953.452
      ],
      [
        903.609,
        1078.931
      ],
      [
        642.905,
        1197.578
      ]
    ]
  },
  {
    "id": "clinic",
    "sheet": "a",
    "name": "Clinic Room",
    "description": "Consultation workstations and a shared central table.",
    "points": [
      [
        1232,
        558
      ],
      [
        1430,
        558
      ],
      [
        1430,
        764
      ],
      [
        1232,
        764
      ]
    ],
    "overall": [
      [
        861.122,
        946.799
      ],
      [
        981.728,
        891.911
      ],
      [
        1038.834,
        1017.39
      ],
      [
        918.228,
        1072.278
      ]
    ]
  },
  {
    "id": "clinic-lounge",
    "sheet": "a",
    "name": "Clinic Lounge",
    "description": "Seating beside the clinic workstations.",
    "points": [
      [
        1430,
        558
      ],
      [
        1658,
        558
      ],
      [
        1658,
        764
      ],
      [
        1430,
        764
      ]
    ],
    "overall": [
      [
        981.728,
        891.911
      ],
      [
        1120.608,
        828.707
      ],
      [
        1177.714,
        954.186
      ],
      [
        1038.834,
        1017.39
      ]
    ]
  },
  {
    "id": "binding",
    "sheet": "a",
    "name": "Binding Room",
    "description": "The angled room linking the two building wings.",
    "points": [
      [
        1684,
        558
      ],
      [
        1737,
        430
      ],
      [
        1925,
        518
      ],
      [
        1740,
        910
      ],
      [
        1684,
        880
      ]
    ],
    "overall": [
      [
        1136.445,
        821.499
      ],
      [
        1133.246,
        728.839
      ],
      [
        1272.155,
        730.326
      ],
      [
        1268.135,
        1020.386
      ],
      [
        1225.707,
        1017.637
      ]
    ]
  },
  {
    "id": "printing",
    "sheet": "b",
    "name": "Printing Room",
    "description": "Robotic workstations arranged along wall-mounted and floor rails.",
    "points": [
      [
        446,
        448
      ],
      [
        656,
        448
      ],
      [
        656,
        675
      ],
      [
        881,
        675
      ],
      [
        881,
        986
      ],
      [
        446,
        986
      ]
    ],
    "overall": [
      [
        527.253,
        353.602
      ],
      [
        666.752,
        353.602
      ],
      [
        666.752,
        504.394
      ],
      [
        816.215,
        504.394
      ],
      [
        816.215,
        710.985
      ],
      [
        527.253,
        710.985
      ]
    ]
  },
  {
    "id": "heating",
    "sheet": "b",
    "name": "Heating Room",
    "description": "A dedicated room with a central gridded platform.",
    "points": [
      [
        680,
        448
      ],
      [
        881,
        448
      ],
      [
        881,
        651
      ],
      [
        680,
        651
      ]
    ],
    "overall": [
      [
        682.695,
        353.602
      ],
      [
        816.215,
        353.602
      ],
      [
        816.215,
        488.451
      ],
      [
        682.695,
        488.451
      ]
    ]
  },
  {
    "id": "storage",
    "sheet": "b",
    "name": "Storage Room",
    "description": "Parallel storage rows serving the adjacent workspaces.",
    "points": [
      [
        909,
        448
      ],
      [
        1333,
        448
      ],
      [
        1333,
        651
      ],
      [
        909,
        651
      ]
    ],
    "overall": [
      [
        834.815,
        353.602
      ],
      [
        1116.47,
        353.602
      ],
      [
        1116.47,
        488.451
      ],
      [
        834.815,
        488.451
      ]
    ]
  },
  {
    "id": "incubating",
    "sheet": "b",
    "name": "Incubating Room",
    "description": "Nine cultivation pods arranged in two rows.",
    "points": [
      [
        909,
        786
      ],
      [
        1333,
        786
      ],
      [
        1333,
        986
      ],
      [
        909,
        986
      ]
    ],
    "overall": [
      [
        834.815,
        578.129
      ],
      [
        1116.47,
        578.129
      ],
      [
        1116.47,
        710.985
      ],
      [
        834.815,
        710.985
      ]
    ]
  },
  {
    "id": "inoculation",
    "sheet": "b",
    "name": "Inoculation Room",
    "description": "An enclosed preparation workspace beside the incubating room.",
    "points": [
      [
        1359,
        786
      ],
      [
        1564,
        786
      ],
      [
        1564,
        986
      ],
      [
        1359,
        986
      ]
    ],
    "overall": [
      [
        1133.742,
        578.129
      ],
      [
        1269.919,
        578.129
      ],
      [
        1269.919,
        710.985
      ],
      [
        1133.742,
        710.985
      ]
    ]
  },
  {
    "id": "pickup",
    "sheet": "b",
    "name": "Pickup Counter",
    "description": "A regular grid of collection compartments.",
    "points": [
      [
        1362,
        448
      ],
      [
        1784,
        448
      ],
      [
        1784,
        651
      ],
      [
        1362,
        651
      ]
    ],
    "overall": [
      [
        1135.734,
        353.602
      ],
      [
        1416.061,
        353.602
      ],
      [
        1416.061,
        488.451
      ],
      [
        1135.734,
        488.451
      ]
    ]
  },
  {
    "id": "lounge",
    "sheet": "b",
    "name": "Lounge",
    "description": "Circular shared seating and furniture along the lower wall.",
    "points": [
      [
        1587,
        675
      ],
      [
        2017,
        675
      ],
      [
        2017,
        986
      ],
      [
        1587,
        986
      ]
    ],
    "overall": [
      [
        1285.197,
        504.394
      ],
      [
        1570.838,
        504.394
      ],
      [
        1570.838,
        710.985
      ],
      [
        1285.197,
        710.985
      ]
    ]
  },
  {
    "id": "workshop",
    "sheet": "c",
    "name": "Workshop Studio",
    "description": "Shared worktables, benches and mobile partitions.",
    "points": [
      [
        708,
        455
      ],
      [
        1349,
        455
      ],
      [
        1349,
        665
      ],
      [
        708,
        665
      ]
    ],
    "overall": [
      [
        1572.815,
        736.173
      ],
      [
        1572.815,
        1164.831
      ],
      [
        1432.381,
        1164.831
      ],
      [
        1432.381,
        736.173
      ]
    ]
  },
  {
    "id": "garden",
    "sheet": "c",
    "name": "Landscaped Corridor",
    "description": "Brick paving and planted areas beside the workshop.",
    "points": [
      [
        708,
        723
      ],
      [
        1349,
        723
      ],
      [
        1349,
        887
      ],
      [
        708,
        887
      ]
    ],
    "overall": [
      [
        1393.594,
        736.173
      ],
      [
        1393.594,
        1164.831
      ],
      [
        1283.922,
        1164.831
      ],
      [
        1283.922,
        736.173
      ]
    ]
  },
  {
    "id": "toilets",
    "sheet": "c",
    "name": "Toilets",
    "description": "Restrooms at the end of the workshop wing.",
    "points": [
      [
        1379,
        455
      ],
      [
        1580,
        455
      ],
      [
        1580,
        665
      ],
      [
        1379,
        665
      ]
    ],
    "overall": [
      [
        1572.815,
        1184.893
      ],
      [
        1572.815,
        1319.309
      ],
      [
        1432.381,
        1319.309
      ],
      [
        1432.381,
        1184.893
      ]
    ]
  }
];
 const overlay=$('space-overlay'), picker=$('space-picker'), card=$('space-card');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let selectedSpace=null,hoverSpace=null,motion=0,motionResolve=null,playTimer=0,playing=false,playIndex=0,pausedIndex=null,tap=null;
 const sequence=['printing','heating','incubating','inoculation','pickup'];
 const NS='http://www.w3.org/2000/svg';
 function spacePoints(space){return sheet==='overall'?space.overall:space.points;}
 function availableSpaces(){return spaces.filter(s=>sheet==='overall'||s.sheet===sheet);}
 function paintSpaces(){
  overlay.replaceChildren();
  if(!loaded||mode==='sheet')return;
  for(const space of availableSpaces()){
   if(space.id!==selectedSpace?.id&&space.id!==hoverSpace?.id)continue;
   const poly=document.createElementNS(NS,'polygon');
   poly.setAttribute('points',spacePoints(space).map(p=>p.join(',')).join(' '));
   poly.setAttribute('class',space.id===selectedSpace?.id?'space-selected':'space-hover');
   poly.setAttribute('vector-effect','non-scaling-stroke');overlay.append(poly);
  }
 }
 function stopMotion(){cancelAnimationFrame(motion);motion=0;if(motionResolve){motionResolve(false);motionResolve=null;}}
 function animateCamera(target,duration=850){
  stopMotion();
  const from={x,y,scale},start=performance.now();
  if(reduced.matches)duration=0;
  return new Promise(resolve=>{
   motionResolve=resolve;
   function tick(now){
    const t=duration?Math.min(1,(now-start)/duration):1,e=t*t*(3-2*t);
    x=from.x+(target.x-from.x)*e;y=from.y+(target.y-from.y)*e;scale=from.scale+(target.scale-from.scale)*e;draw();
    if(t<1)motion=requestAnimationFrame(tick);else{motion=0;motionResolve=null;resolve(true);}
   }
   motion=requestAnimationFrame(tick);
  });
 }
 function cameraForSpace(space){
  const ps=spacePoints(space),xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);
  const box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  let w=stage.clientWidth,h=stage.clientHeight;
  if(w>760)w-=Math.min(280,w*.3);else h-=Math.min(card.offsetHeight+32,h*.42);
  const next=clamp(Math.min((w-64)/(box[2]-box[0]),(h-56)/(box[3]-box[1])),fitScale,fitScale*6);
  return {scale:next,x:w/2-(box[0]+box[2])/2*next,y:h/2-(box[1]+box[3])/2*next};
 }
 function updatePlayback(){
  $('process-play').textContent=playing?'Pause process':pausedIndex!==null?'Resume process':'Play process';
  $('process-play').setAttribute('aria-pressed',String(playing));
  $('process-step').textContent=playing?`${playIndex+1} / ${sequence.length}`:pausedIndex!==null?`${pausedIndex+1} / ${sequence.length}`:'';
 }
 function stopPlayback(){clearTimeout(playTimer);playing=false;pausedIndex=null;updatePlayback();}
 function clearSpace(){selectedSpace=null;hoverSpace=null;picker.value='';card.hidden=true;paintSpaces();}
 function rebuildSpaces(){
  picker.replaceChildren(new Option('Choose a space',''));
  for(const s of availableSpaces())picker.add(new Option(sheet==='overall'?`${s.sheet.toUpperCase()} / ${s.name}`:s.name,s.id));
  picker.disabled=!loaded||mode==='sheet';paintSpaces();
 }
 async function focusSpace(id,fromPlayback=false){
  const space=spaces.find(s=>s.id===id);if(!space||!loaded)return false;
  if(!fromPlayback)stopPlayback();
  if(mode==='sheet')changeMode('plan');
  selectedSpace=space;hoverSpace=null;picker.value=id;
  $('space-name').textContent=space.name;$('space-description').textContent=space.description;
  $('space-location').textContent=`BUILDING ${space.sheet.toUpperCase()} / SPACE STUDY`;
  $('open-detail').hidden=sheet!=='overall';card.hidden=false;paintSpaces();
  return animateCamera(cameraForSpace(space));
 }
 function insidePolygon(p,polygon){
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
   const a=polygon[i],b=polygon[j];
   if((a[1]>p.y)!==(b[1]>p.y)&&p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }return inside;
 }
 function hitSpace(p){if(!loaded||mode==='sheet')return null;return availableSpaces().find(s=>insidePolygon({x:(p.x-x)/scale,y:(p.y-y)/scale},spacePoints(s)))||null;}
 async function playNext(){
  if(!playing)return;
  const completed=await focusSpace(sequence[playIndex],true);
  if(!playing||!completed)return;
  playTimer=setTimeout(()=>{if(!playing)return;if(playIndex===sequence.length-1){stopPlayback();return;}playIndex++;updatePlayback();playNext();},2600);
 }
 async function togglePlayback(){
  if(playing){const index=playIndex;stopPlayback();stopMotion();pausedIndex=index;updatePlayback();return;}
  const resumeIndex=pausedIndex;
  if(!loaded)return;
  if(sheet!=='b'){const ok=await select('b');if(!ok)return;}
  if(mode==='sheet')changeMode('plan');
  playIndex=resumeIndex??0;pausedIndex=null;playing=true;updatePlayback();playNext();
 }
 picker.onchange=()=>picker.value?focusSpace(picker.value):resetExplorer();
 $('process-play').onclick=togglePlayback;
 function resetExplorer(){stopPlayback();stopMotion();clearSpace();fit();}
 $('close-space').onclick=resetExplorer;
 $('open-detail').onclick=async()=>{if(!selectedSpace)return;const id=selectedSpace.id,key=selectedSpace.sheet;if(await select(key))focusSpace(id);};
 card.addEventListener('pointerdown',e=>e.stopPropagation());
 card.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
 function explorerBeforeSelect(){stopPlayback();stopMotion();clearSpace();}
 function explorerLoaded(){rebuildSpaces();$('process-play').disabled=!loaded;}
 function explorerPointerDown(e){
  if(e.target.closest('#space-card'))return;
  stopPlayback();stopMotion();
  if(pointers.size)tap=null;else tap={id:e.pointerId,p:at(e.clientX,e.clientY),valid:true};
 }
 function explorerPointerMove(e){
  const p=at(e.clientX,e.clientY);
  if(tap&&Math.hypot(p.x-tap.p.x,p.y-tap.p.y)>8)tap.valid=false;
  if(!pointers.size&&e.pointerType==='mouse'){
   const next=hitSpace(p);if(next?.id!==hoverSpace?.id){hoverSpace=next;paintSpaces();stage.classList.toggle('over-space',!!next);}
  }
 }
 function explorerPointerUp(e){
  if(e.type==='pointerup'&&tap?.id===e.pointerId&&tap.valid&&pointers.size===1){const space=hitSpace(at(e.clientX,e.clientY));if(space)focusSpace(space.id);}
  tap=null;
 }
 stage.addEventListener('pointerleave',()=>{hoverSpace=null;stage.classList.remove('over-space');paintSpaces();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPlayback();stopMotion();}});
 reduced.addEventListener('change',()=>{stopPlayback();stopMotion();});

 document.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>select(b.dataset.sheet));
 $('mode-plan').onclick=()=>changeMode('plan');$('mode-sheet').onclick=()=>changeMode('sheet');
 $('reset').onclick=resetExplorer;$('zoom-in').onclick=()=>zoom(scale*1.25);$('zoom-out').onclick=()=>zoom(scale/1.25);
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
  explorerPointerDown(e);stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,at(e.clientX,e.clientY));startGesture();stage.classList.add('dragging');
 });
 stage.addEventListener('pointermove',e=>{
  explorerPointerMove(e);
  if(!pointers.has(e.pointerId)||!gesture)return;
  pointers.set(e.pointerId,at(e.clientX,e.clientY));const ps=[...pointers.values()];
  if(gesture.kind==='pinch'&&ps.length>=2){
   const a=ps[0],b=ps[1],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
   scale=clamp(gesture.scale*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance,fitScale*.65,fitScale*16);
   x=cx-gesture.worldX*scale;y=cy-gesture.worldY*scale;
  }else if(gesture.kind==='pan'&&ps.length===1){x=gesture.x+ps[0].x-gesture.start.x;y=gesture.y+ps[0].y-gesture.start.y;}
  draw();
 });
 function release(e){explorerPointerUp(e);pointers.delete(e.pointerId);startGesture();if(!pointers.size)stage.classList.remove('dragging');}
 ['pointerup','pointercancel','lostpointercapture'].forEach(type=>stage.addEventListener(type,release));
 stage.addEventListener('dblclick',resetExplorer);
 stage.addEventListener('keydown',e=>{
  if(e.target.closest('#space-card'))return;
  if(['Escape','0','Home'].includes(e.key)){e.preventDefault();resetExplorer();return;}
  stopPlayback();stopMotion();
  if(e.key==='+'||e.key==='='){e.preventDefault();zoom(scale*1.25);}
  else if(e.key==='-'){e.preventDefault();zoom(scale/1.25);}
  else if(e.key==='0'||e.key==='Home'){e.preventDefault();fit();}
  else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;draw();
  }
 });
 let resizeFrame=0;
 new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{stopMotion();fit();if(selectedSpace)animateCamera(cameraForSpace(selectedSpace),0);});}).observe(stage);
 window.addEventListener('message',e=>{
  if(e.source!==parent||e.origin!==location.origin)return;
  if(e.data?.type==='study-active'&&!e.data.active){stopPlayback();stopMotion();}
  if(e.data?.type==='select-drawing'&&sheets[e.data.sheet]&&sheet!==e.data.sheet)select(e.data.sheet);
 });
 window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(sheets[key]&&key!==sheet)select(key);});
 select(location.hash.slice(1)||'overall');
})();
