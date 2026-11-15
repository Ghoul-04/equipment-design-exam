/* ===== Chapter 2: separators — drawings, converter, CD iteration, charts, solvers ===== */
(function(){
const ED = window.ED; ED.onView = ED.onView || {};
const F = (x,d=2)=>ED.fmt(x,d);

/* ---------- physics ---------- */
const SEP = ED.SEP = {
  props(i){ const T=i.T+460; return {T, rl:62.4*141.5/(131.5+i.API), rg:2.70*i.S*i.P/(T*i.Z)}; },
  iterate(rl,rg,dm,mu,maxIt=25,tol=0.001){
    const rows=[]; let cd=0.34;
    for(let k=0;k<maxIt;k++){
      const Vt=0.0119*Math.sqrt((rl-rg)/rg*dm/cd), Re=0.0049*rg*dm*Vt/mu, cdn=24/Re+3/Math.sqrt(Re)+0.34;
      rows.push({cd,Vt,Re,cdn}); if(Math.abs(cdn-cd)<tol) break; cd=cdn;
    }
    return rows;
  },
  K(i,p,cd){ return (p.T*i.Z*i.Qg/i.P)*Math.sqrt((p.rg/(p.rl-p.rg))*cd/i.dm); }
};

/* ---------- separator drawings ---------- */
const VALVE=(x,y)=>`<path d="M${x-10},${y-8} L${x-10},${y+8} L${x+10},${y-8} L${x+10},${y+8} Z" fill="var(--card)" stroke="var(--text)" stroke-width="1.6"/><path d="M${x},${y} V${y-12}" stroke="var(--text)" stroke-width="1.6"/><path d="M${x-8},${y-12} A8,6 0 0,1 ${x+8},${y-12} Z" fill="var(--card)" stroke="var(--text)" stroke-width="1.6"/>`;
const HS=(n,part,x,y)=>`<g class="hs" data-part="${part}" tabindex="0"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y+4.5}" text-anchor="middle">${n}</text></g>`;
const DEFS=(id)=>`<defs><pattern id="mesh${id}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0,0 L6,6 M6,0 L0,6" stroke="var(--text)" stroke-width=".8"/></pattern>
  <marker id="arw${id}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="var(--text)"/></marker>
  <marker id="arg${id}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="var(--amber)"/></marker></defs>`;
const drops=(pts,dy)=>pts.map(([x,y],k)=>`<circle class="drop" cx="${x}" cy="${y}" r="3" fill="var(--amber)" style="--dy:${dy}px;animation-delay:-${(k*0.7)%2.6}s"/>`).join('');
const bubs=(pts,dy)=>pts.map(([x,y],k)=>`<circle class="bub" cx="${x}" cy="${y}" r="3.2" fill="none" stroke="var(--text)" style="--dy:${dy}px;animation-delay:-${(k*0.9)%3}s"/>`).join('');
const wave=(x1,x2,y)=>{let d=`M${x1},${y}`;for(let x=x1;x<x2;x+=16)d+=` q4,-4 8,0 t8,0`;return `<path d="${d}" stroke="var(--cyan)" stroke-width="2" fill="none"/>`;};

const DRAW = {
h:()=>{ const shell='M80,70 H320 A40,60 0 0,1 320,190 H80 A40,60 0 0,1 80,70 Z';
 return `<svg viewBox="0 0 420 250" aria-label="عازلة أفقية">${DEFS('h')}<clipPath id="clipH"><path d="${shell}"/></clipPath>
  <rect x="30" y="130" width="340" height="70" fill="var(--cyan)" opacity=".25" clip-path="url(#clipH)"/>
  ${wave(42,356,130)}
  <path d="${shell}" fill="none" stroke="var(--text)" stroke-width="3"/>
  <path d="M5,105 H40" stroke="var(--amber)" stroke-width="3" marker-end="url(#argh)"/><text class="lab-en" x="6" y="96">Inlet</text>
  <path d="M58,88 V122" stroke="var(--text)" stroke-width="4"/>
  <path class="flow" d="M75,100 H255" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#arwh)"/>
  ${drops([[110,86],[150,90],[190,86],[230,92]],38)}
  ${bubs([[120,180],[180,184],[240,180],[290,184]],44)}
  <rect x="270" y="74" width="44" height="16" fill="url(#meshh)" stroke="var(--text)"/>
  <path d="M292,74 V40 H412" stroke="var(--text)" stroke-width="2.5" fill="none"/>${VALVE(352,40)}<text class="lab-en" x="372" y="58">Gas out</text>
  <path d="M300,190 V222 H412" stroke="var(--text)" stroke-width="2.5" fill="none"/>${VALVE(352,222)}<text class="lab-en" x="366" y="242">Liquid out</text>
  ${HS(1,'inlet',22,124)}${HS(2,'diverter',58,72)}${HS(3,'gravity',160,114)}${HS(4,'mist',250,82)}${HS(5,'interface',205,130)}${HS(6,'liquid',160,165)}${HS(7,'pcv',352,14)}${HS(8,'lcv',330,240)}
 </svg>`; },
v:()=>{ const shell='M110,70 A55,24 0 0,1 220,70 V330 A55,24 0 0,1 110,330 Z';
 return `<svg viewBox="0 0 330 380" aria-label="عازلة عمودية" style="max-width:440px;margin:auto">${DEFS('v')}<clipPath id="clipV"><path d="${shell}"/></clipPath>
  <rect x="100" y="240" width="130" height="120" fill="var(--cyan)" opacity=".25" clip-path="url(#clipV)"/>
  ${wave(110,220,240)}
  <path d="${shell}" fill="none" stroke="var(--text)" stroke-width="3"/>
  <path d="M30,200 H108" stroke="var(--amber)" stroke-width="3" marker-end="url(#argv)"/><text class="lab-en" x="30" y="190">Inlet</text>
  <path d="M124,186 V216" stroke="var(--text)" stroke-width="4"/>
  <path class="flow" d="M165,225 V92" stroke="var(--muted)" stroke-width="1.6" marker-end="url(#arwv)"/>
  ${drops([[140,92],[192,100],[150,128],[200,140]],86)}
  ${bubs([[135,345],[168,350],[198,345]],90)}
  <rect x="140" y="54" width="50" height="14" fill="url(#meshv)" stroke="var(--text)"/>
  <path d="M165,46 V20 H322" stroke="var(--text)" stroke-width="2.5" fill="none"/>${VALVE(255,20)}<text class="lab-en" x="270" y="40">Gas out</text>
  <path d="M220,305 H322" stroke="var(--text)" stroke-width="2.5" fill="none"/>${VALVE(272,305)}<text class="lab-en" x="246" y="330">Liquid out</text>
  ${HS(1,'inlet',40,218)}${HS(2,'diverter',124,172)}${HS(3,'gravity',198,170)}${HS(4,'mist',212,62)}${HS(5,'interface',236,240)}${HS(6,'liquid',150,290)}${HS(7,'pcv',236,8)}${HS(8,'lcv',300,288)}
 </svg>`; },
s:()=>`<svg viewBox="0 0 340 370" aria-label="عازلة كروية" style="max-width:440px;margin:auto">${DEFS('s')}<clipPath id="clipS"><circle cx="160" cy="175" r="110"/></clipPath>
  <rect x="40" y="190" width="240" height="100" fill="var(--cyan)" opacity=".25" clip-path="url(#clipS)"/>
  ${wave(54,266,190)}
  <circle cx="160" cy="175" r="110" fill="none" stroke="var(--text)" stroke-width="3"/>
  <path d="M160,12 V62" stroke="var(--amber)" stroke-width="3" marker-end="url(#args)"/><text class="lab-en" x="168" y="24">Inlet</text>
  <path d="M105,108 Q160,62 215,108" stroke="var(--text)" stroke-width="3.5" fill="none"/>
  <rect x="96" y="116" width="54" height="12" fill="url(#meshs)" stroke="var(--text)"/><rect x="170" y="116" width="54" height="12" fill="url(#meshs)" stroke="var(--text)"/>
  <rect x="154" y="116" width="12" height="214" fill="var(--card)" stroke="var(--text)" stroke-width="1.6"/>
  ${drops([[112,134],[208,138],[128,150]],40)}
  ${bubs([[110,272],[208,272],[130,262]],60)}
  <path d="M160,330 H332" stroke="var(--text)" stroke-width="2.5" fill="none"/>${VALVE(262,330)}<text class="lab-en" x="276" y="352">Gas out</text>
  <path d="M262,215 H332" stroke="var(--text)" stroke-width="2.5" fill="none"/>${VALVE(300,215)}<text class="lab-en" x="268" y="240">Liquid out</text>
  ${HS(1,'inlet',140,34)}${HS(2,'diverter',236,96)}${HS(3,'gravity',104,162)}${HS(4,'mist',86,104)}${HS(5,'interface',38,190)}${HS(6,'liquid',112,236)}${HS(7,'pcv',236,346)}${HS(8,'lcv',300,190)}
 </svg>`
};
const PARTS = {
  inlet:['المدخل','Inlet','الخليط (غاز + سائل) يدخل من هنا جاي من البئر.'],
  diverter:['مغيّر اتجاه المدخل','Inlet diverter','الخليط يضرب بيه فيتغيّر زخمه فجأة، فيصير <b>أول وأكبر انفصال</b> بين السائل والغاز.'],
  gravity:['قسم الترسيب بالجاذبية','Gravity settling section','الغاز يمشي ببطء والقطرات تنزل بالجاذبية. <b>هذا القسم يحدد القطر (سعة الغاز)</b>.'],
  mist:['مانع الضباب','Mist extractor','شبكة (مثل المنخل) تلزم أصغر القطرات (الضباب) قبل لا يطلع الغاز.'],
  interface:['سطح التلامس غاز-سائل','Gas-liquid interface','الحد بين الغاز والسائل. بالأفقية القوانين تفرضه بالنص (<b>50% full</b>).'],
  liquid:['قسم تجميع السائل','Liquid collection section','السائل يبقى بيه <b>زمن المكوث (3 min)</b> حتى تطلع فقاعات الغاز، ويستوعب الدفقات (slugs). <b>هذا يحدد الحجم (سعة السائل)</b>.'],
  pcv:['صمام التحكم بالضغط','Pressure control valve','يحافظ على ضغط العازلة ثابت ويطلّع الغاز.'],
  lcv:['صمام التحكم بالمستوى','Level control valve','مسيطر المستوى (level controller) يحس بارتفاع السائل، ويفتح الصمام أو يسدّه حتى يطلّع السائل.']
};
const DRAWSTEPS = {
 h:['ارسم كبسولة أفقية (مستطيل وطرفين مدورين).','خط متموّج <b>بالنص</b> (50% full)، وظلّل تحته: سائل.','المدخل بالطرف الأيسر + لوح عمودي قدّامه (Inlet diverter).','مربع مشبّك فوك يمين (Mist extractor) ← أنبوب Gas out وعليه صمام PCV.','أنبوب من الأسفل يمين ← Liquid out وعليه صمام LCV.','اكتب الأقسام: Gravity settling (فوك) و Liquid collection (جوه).'],
 v:['ارسم كبسولة عمودية طويلة.','المدخل من الجانب بالنص + لوح diverter قدّامه.','خط متموّج <b>تحت المدخل</b> (interface) وظلّل تحته: سائل.','مربع مشبّك بالأعلى (Mist extractor) ← Gas out + PCV من فوك.','Liquid out من الجانب السفلي + LCV.','اكتب: Gravity settling (فوك) و Liquid collection (جوه).'],
 s:['ارسم دائرة.','المدخل من الأعلى، وتحته قوس (Inlet diverter).','شبكتين أفقيتين (Mist extractor) على جانبين أنبوب بالنص.','الأنبوب الوسطي ينزل لتحت ويطلع منه الغاز (Gas out + PCV).','خط سائل بالنص وظلّل تحته، و Liquid out من الجانب + LCV.']
};

/* ---------- chart helper ---------- */
ED.sepChart = function(svg, o){
  const W=420,H=270,L=46,R=12,T=26,B=40, x0=o.xmin, x1=o.xmax, y0=0, y1=o.ymax;
  const X=d=>L+(d-x0)/(x1-x0)*(W-L-R), Y=v=>H-B-(Math.min(v,y1)-y0)/(y1-y0)*(H-T-B);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  let s='';
  for(let v=0;v<=y1;v+=(y1>20?5:2)){ s+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(v)+4}" text-anchor="end" class="lab-en">${v}</text>`; }
  for(let d=Math.ceil(x0/6)*6; d<=x1; d+=6){ s+=`<text x="${X(d)}" y="${H-B+16}" text-anchor="middle" class="lab-en">${d}</text>`; }
  s+=`<text x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle" class="lab-en">d (in)</text><text x="6" y="14" class="lab-en">Lss (ft)</text>`;
  // SR band
  const band=[]; for(let d=x0; d<=x1; d+=1) band.push(`${X(d)},${Y(d/4)}`); for(let d=x1; d>=x0; d-=1) band.push(`${X(d)},${Y(d/3)}`);
  s+=`<polygon points="${band.join(' ')}" fill="var(--green)" opacity=".16"/><text x="${X(x1)-4}" y="${Y(x1/3.5)+4}" text-anchor="end" class="lab-en" style="fill:var(--green)">SR 3–4</text>`;
  if(o.dmin && o.dmin>x0){ s+=`<rect x="${L}" y="${T}" width="${X(Math.min(o.dmin,x1))-L}" height="${H-T-B}" fill="var(--red)" opacity=".10"/><line x1="${X(o.dmin)}" x2="${X(o.dmin)}" y1="${T}" y2="${H-B}" stroke="var(--red)" stroke-dasharray="4 4"/><text x="${X(o.dmin)+4}" y="${T+12}" class="lab-en" style="fill:var(--red)">d min = ${F(o.dmin,1)}</text>`; }
  const pts=[]; for(let d=Math.max(x0,o.cstart||x0); d<=x1; d+=0.5){ const v=o.curve(d); if(isFinite(v)) pts.push(`${X(d)},${Y(v)}`); }
  s+=`<polyline points="${pts.join(' ')}" fill="none" stroke="var(--cyan)" stroke-width="2.5"/>`;
  o.points.forEach(p=>{ const pk=p.pick; s+=`<circle cx="${X(p.d)}" cy="${Y(p.L)}" r="${pk?7:4}" fill="${pk?'var(--amber)':'var(--cyan)'}" stroke="var(--bg)" stroke-width="1.5"/>`; if(pk) s+=`<text x="${X(p.d)+9}" y="${Y(p.L)-9}" class="lab" style="font-weight:700">${p.d}″ × ${Math.ceil(p.L)} ft</text>`; });
  s+=`<line x1="${L}" x2="${L}" y1="${T}" y2="${H-B}" stroke="var(--muted)"/><line x1="${L}" x2="${W-R}" y1="${H-B}" y2="${H-B}" stroke="var(--muted)"/>`;
  svg.innerHTML=s;
};
const vLss=(h,dmin)=>Math.max((h+76)/12,(h+dmin+40)/12);
const hLss=(dL,liq,d)=>{ const g=dL/d, l=liq/(d*d); const a=g+d/12, b=4/3*l, c=l+2.5; return {g,l,Lss:Math.max(a,b,c),gov: Math.max(a,b,c)===a?'gas':(c>b?'+2.5':'4/3')}; };
function pickRow(rows){ const ok=rows.filter(r=>r.ok!==false && r.SR>=2.95 && r.SR<=4.05); if(ok.length) return ok[0]; const c=rows.filter(r=>r.ok!==false); return c.sort((a,b)=>Math.abs(a.SR-3.5)-Math.abs(b.SR-3.5))[0]; }

/* ---------- chapter 2 view ---------- */
ED.onView.ch2 = function(v){
  const $=ED.$, $$=ED.$$;
  // drawings
  let cur='h';
  function draw(){ $('#sep-fig').innerHTML = DRAW[cur]() + `<div class="chips" style="justify-content:center">${Object.keys(PARTS).map((k,i)=>`<button class="chip" data-pt="${k}">${i+1}. ${PARTS[k][0]}</button>`).join('')}</div>`;
    $('#sep-draw').innerHTML = '<ol style="margin:.4em 0;padding-inline-start:1.3em">'+DRAWSTEPS[cur].map(x=>`<li>${x}</li>`).join('')+'</ol>'; }
  function info(k){ const p=PARTS[k]; $('#sep-info').innerHTML=`<b>${p[0]}</b> <span class="en muted">${p[1]}</span><br>${p[2]}`;
    $$('#sep-fig .hs').forEach(g=>g.classList.toggle('on',g.dataset.part===k)); $$('#sep-fig [data-pt]').forEach(b=>b.classList.toggle('on',b.dataset.pt===k)); }
  $('#sep-tabs').addEventListener('click',e=>{ const b=e.target.closest('[data-sep]'); if(!b) return; $$('#sep-tabs .chip').forEach(x=>x.classList.toggle('on',x===b)); cur=b.dataset.sep; draw(); });
  $('#sep-fig').addEventListener('click',e=>{ const g=e.target.closest('[data-part],[data-pt]'); if(g) info(g.dataset.part||g.dataset.pt); });
  draw();
  // converter
  const cv=()=>{ const i={API:+$('#cv-api').value,S:+$('#cv-s').value,P:+$('#cv-p').value,T:+$('#cv-t').value,Z:+$('#cv-z').value}; const p=SEP.props(i);
    $('#cv-out').innerHTML = `<div class="eq">${ED.tex(`\\begin{aligned}T&=${F(i.T)}+460=${F(p.T)}\\ ^\\circ\\text{R}\\\\\\rho_l&=62.4\\left[\\frac{141.5}{131.5+${F(i.API)}}\\right]=${F(p.rl,2)}\\ \\text{lb/ft}^3\\\\\\rho_g&=2.70\\,\\frac{(${F(i.S)})(${F(i.P)})}{(${F(p.T)})(${F(i.Z)})}=${F(p.rg,2)}\\ \\text{lb/ft}^3\\end{aligned}`)}</div>`; };
  ['cv-api','cv-s','cv-p','cv-t','cv-z'].forEach(id=>$('#'+id).addEventListener('input',cv)); cv();
  // CD stepper
  let rows=[];
  const inp=()=>({rl:+$('#cd-rl').value,rg:+$('#cd-rg').value,dm:+$('#cd-dm').value,mu:+$('#cd-mu').value});
  function stepOnce(){ const i=inp(); const cd = rows.length? rows[rows.length-1].cdn : 0.34;
    const Vt=0.0119*Math.sqrt((i.rl-i.rg)/i.rg*i.dm/cd), Re=0.0049*i.rg*i.dm*Vt/i.mu, cdn=24/Re+3/Math.sqrt(Re)+0.34; rows.push({cd,Vt,Re,cdn}); }
  function paint(){
    const done = rows.length && Math.abs(rows[rows.length-1].cdn-rows[rows.length-1].cd)<0.002;
    $('#cd-table').innerHTML = `<tr><th>#</th><th>C<sub>D</sub> المستخدم</th><th>V<sub>t</sub> (ft/s)</th><th>Re</th><th>C<sub>D</sub> الجديد</th></tr>` +
      (rows.length? rows.map((r,k)=>`<tr class="${done&&k===rows.length-1?'pick':''}"><td>${k+1}</td><td>${F(r.cd,3)}</td><td>${F(r.Vt,3)}</td><td>${F(r.Re,1)}</td><td>${F(r.cdn,3)}${done&&k===rows.length-1?' ✓':''}</td></tr>`).join('') : `<tr><td colspan="5">اضغط «تكرار واحد». نبدأ بـ C<sub>D</sub> = 0.34</td></tr>`);
    const svg=$('#cd-chart'); const n=Math.max(rows.length,5), vals=rows.map(r=>r.cdn), mx=Math.max(1,...vals)*1.1;
    const X=k=>40+k*(360/(n-1||1)), Y=v=>150-v/mx*130;
    svg.innerHTML = `<line x1="40" y1="150" x2="410" y2="150" stroke="var(--muted)"/><line x1="40" y1="10" x2="40" y2="150" stroke="var(--muted)"/>`+
      [0.25,0.5,0.75,1].filter(v=>v<mx).map(v=>`<line x1="40" x2="410" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="34" y="${Y(v)+4}" text-anchor="end" class="lab-en">${v}</text>`).join('')+
      `<polyline points="${vals.map((v,k)=>`${X(k)},${Y(v)}`).join(' ')}" fill="none" stroke="var(--amber)" stroke-width="2.5"/>`+
      vals.map((v,k)=>`<circle cx="${X(k)}" cy="${Y(v)}" r="4" fill="var(--amber)"/><text x="${X(k)}" y="170" text-anchor="middle" class="lab-en">${k+1}</text>`).join('');
  }
  $('#cd-step').addEventListener('click',()=>{ if(rows.length<20) stepOnce(); paint(); });
  $('#cd-all').addEventListener('click',()=>{ let g=0; while(g++<20){ stepOnce(); const r=rows[rows.length-1]; if(Math.abs(r.cdn-r.cd)<0.002) break; } paint(); });
  $('#cd-reset').addEventListener('click',()=>{ rows=[]; paint(); });
  ['cd-rl','cd-rg','cd-dm','cd-mu'].forEach(id=>$('#'+id).addEventListener('input',()=>{ rows=[]; paint(); }));
  paint();
};

/* ---------- example charts ---------- */
ED.onView.ex41 = function(v){
  const dmin=21.87;
  ED.sepChart(ED.$('#e41-chart'),{xmin:18,xmax:50,ymax:16,dmin,cstart:dmin,curve:d=>vLss(50000/(d*d),dmin),
    points:[24,30,36,42,48].map(d=>({d,L:vLss(50000/(d*d),dmin),pick:d===36}))});
  initSolver(ED.$('[data-sep-solver="v"]',v),'v');
};
ED.onView.ex42 = function(v){
  ED.sepChart(ED.$('#e42-chart'),{xmin:14,xmax:50,ymax:30,curve:d=>hLss(39.85,8571.4,d).Lss,
    points:[16,20,24,30,36,42,48].map(d=>({d,L:hLss(39.85,8571.4,d).Lss,pick:d===36}))});
  initSolver(ED.$('[data-sep-solver="h"]',v),'h');
};

/* ---------- solvers ---------- */
function initSolver(box,type){
  const $=s=>box.querySelector(s);
  const dflt={Qg:10,S:0.6,Ql:2000,API:40,P:1000,T:60,Z:0.84,mu:0.013,dm:140,tr:3,ds: type==='v'?'24,30,36,42,48':'16,20,24,30,36,42,48'};
  const fields=[['Qg','Q<sub>g</sub> (MMscfd)'],['S','S (gas sp. gr.)'],['Ql','Q<sub>l</sub> (bpd)'],['API','API'],['P','P (psia)'],['T','T (°F)'],['Z','Z'],['mu','μ (cp)'],['dm','d<sub>m</sub> (micron)'],['tr','t<sub>r</sub> (min)']];
  box.innerHTML = `<div class="form">${fields.map(([k,l])=>`<label><span>${l}</span><input type="number" data-k="${k}" value="${dflt[k]}" step="any" inputmode="decimal"></label>`).join('')}
    <label class="wide">الأقطار اللي نجرّبها (in)<input type="text" data-k="ds" value="${dflt.ds}" inputmode="decimal"></label></div>
    <div class="row" style="margin-top:12px"><button class="btn small ghost" data-reset>↺ أرقام المثال</button></div><div data-out style="margin-top:8px"></div>`;
  box.querySelector('[data-reset]').addEventListener('click',()=>{ box.querySelectorAll('[data-k]').forEach(i=>i.value=dflt[i.dataset.k]); run(); });
  box.querySelectorAll('[data-k]').forEach(i=>i.addEventListener('input',run));
  const step=(t,texs,why,extra='')=>`<div class="step"><h4>${t}</h4>${texs.map(x=>`<div class="eq">${ED.tex(x)}</div>`).join('')}${why?`<div class="why"><b class="q">ليش؟</b> ${why}</div>`:''}${extra}</div>`;
  function run(){
    const i={}; box.querySelectorAll('[data-k]').forEach(x=>i[x.dataset.k]= x.dataset.k==='ds'? x.value : +x.value);
    const out=$('[data-out]');
    const ds=String(i.ds).split(/[,\s،]+/).map(Number).filter(x=>x>0).sort((a,b)=>a-b);
    if(!(i.Qg>0&&i.S>0&&i.Ql>0&&i.P>0&&i.Z>0&&i.mu>0&&i.dm>0&&i.tr>0&&ds.length)){ out.innerHTML='<div class="note trap"><span class="t">⚠️</span>دخّل أرقام موجبة.</div>'; return; }
    const p=SEP.props(i); if(!(p.rl>p.rg)){ out.innerHTML='<div class="note trap"><span class="t">⚠️</span>كثافة الغاز طلعت أكبر من السائل. تأكد من الأرقام.</div>'; return; }
    const it=SEP.iterate(p.rl,p.rg,i.dm,i.mu), cd=it[it.length-1].cdn, K=SEP.K(i,p,cd), tzq=p.T*i.Z*i.Qg/i.P, br=Math.sqrt((p.rg/(p.rl-p.rg))*cd/i.dm);
    let h='<div class="steps">';
    h+=step('الحرارة والكثافات',[`\\begin{aligned}T&=${F(i.T)}+460=${F(p.T)}\\ ^\\circ\\text{R}\\\\\\rho_l&=62.4\\left[\\tfrac{141.5}{131.5+${F(i.API)}}\\right]=${F(p.rl,2)}\\\\\\rho_g&=2.70\\,\\tfrac{(${F(i.S)})(${F(i.P)})}{(${F(p.T)})(${F(i.Z)})}=${F(p.rg,3)}\\end{aligned}`],'حرارة مطلقة، وكثافات بـ lb/ft³.');
    h+=step('تكرار C<sub>D</sub>',[],'' ,`<div class="tbl-wrap"><table class="num"><tr><th>#</th><th>C<sub>D</sub></th><th>V<sub>t</sub></th><th>Re</th><th>C<sub>D</sub> جديد</th></tr>${it.map((r,k)=>`<tr class="${k===it.length-1?'pick':''}"><td>${k+1}</td><td>${F(r.cd,3)}</td><td>${F(r.Vt,3)}</td><td>${F(r.Re,1)}</td><td>${F(r.cdn,3)}</td></tr>`).join('')}</table></div><p class="muted" style="font-size:13.5px">ثبت على <b class="en">C<sub>D</sub> = ${F(cd,3)}</b>. ${type&&i.dm===140&&i.P===1000?'(الكتاب وقف على 0.851، والفرق تقريب.)':''}</p>`);
    if(type==='v'){
      const d2=5040*K, dmin=Math.sqrt(d2), liq=i.tr*i.Ql/0.12;
      h+=step('سعة الغاز: أقل قطر',[`\\begin{aligned}d^2&=5040\\,[${F(tzq,3)}]\\,[${F(br,5)}]\\\\&=${F(d2,1)}\\\\d_{min}&=${F(dmin,2)}\\ \\text{in}\\end{aligned}`],'الغاز الصاعد لازم يكون أبطأ من نزول القطرة.');
      h+=step('سعة السائل',[`\\begin{aligned}d^2h&=\\frac{${F(i.tr)}\\times${F(i.Ql)}}{0.12}=${F(liq,0)}\\\\h&=\\frac{${F(liq,0)}}{d^2}\\end{aligned}`],'');
      const rows=ds.map(d=>{ const hh=liq/(d*d), a=(hh+76)/12, b=(hh+dmin+40)/12, L=Math.max(a,b); return {d,h:hh,L,SR:12*L/d,ok:d>=dmin}; });
      const pk=pickRow(rows);
      h+=step('الطول والنحافة لكل قطر',[`\\begin{aligned}L_{ss}&=\\max\\Big(\\tfrac{h+76}{12},\\\\&\\qquad\\tfrac{h+${F(dmin,1)}+40}{12}\\Big)\\\\SR&=\\frac{12L_{ss}}{d}\\end{aligned}`],'','<div class="tbl-wrap"><table class="num"><tr><th>d</th><th>h (in)</th><th>L<sub>ss</sub> (ft)</th><th>SR</th></tr>'+rows.map(r=>`<tr class="${r===pk?'pick':(r.ok&&r.SR>=2.95&&r.SR<=4.05?'good':'')}"><td>${r.d}${r.ok?'':' ✗'}</td><td>${F(r.h,1)}</td><td>${F(r.L,1)}</td><td>${F(r.SR,1)}${r===pk?' ✓':''}</td></tr>`).join('')+'</table></div>');
      h+='</div>';
      h+= pk? `<div class="note aha"><span class="t">✅ الاختيار</span><b class="en">${pk.d} in × ${Math.ceil(pk.L)} ft</b> (L<sub>ss</sub> = ${F(pk.L,1)} → ${Math.ceil(pk.L)}، SR = ${F(pk.SR,1)}). الشروط: d ≥ ${F(dmin,1)} ✓ والنحافة ${pk.SR>=2.95&&pk.SR<=4.05?'بين 3 و 4 ✓':'أقرب وحدة لـ 3–4 (جرّب أقطار ثانية)'}</div>` : '<div class="note trap"><span class="t">⚠️</span>ولا قطر أكبر من القطر الأدنى. ضيف أقطار أكبر.</div>';
      out.innerHTML=h+'<figure><svg data-ch></svg></figure>';
      ED.sepChart(out.querySelector('[data-ch]'),{xmin:Math.max(6,Math.min(ds[0],dmin)-4),xmax:ds[ds.length-1]+2,ymax:Math.max(12,Math.ceil(Math.min(30,Math.max(...rows.map(r=>r.L)))/2)*2+2),dmin,cstart:dmin,
        curve:d=>vLss(liq/(d*d),dmin), points:rows.filter(r=>r.ok).map(r=>({d:r.d,L:r.L,pick:r===pk}))});
    } else {
      const dL=420*K, liq=i.tr*i.Ql/0.7;
      h+=step('سعة الغاز',[`\\begin{aligned}dL_{eff}&=420\\,[${F(tzq,3)}]\\,[${F(br,5)}]\\\\&=${F(dL,2)}\\end{aligned}`],'لكل قطر: L<sub>eff</sub> = هذا الرقم ÷ d.');
      h+=step('سعة السائل',[`d^2L_{eff}=\\frac{${F(i.tr)}\\times${F(i.Ql)}}{0.7}=${F(liq,0)}`],'');
      const rows=ds.map(d=>{ const r=hLss(dL,liq,d); return {d,g:r.g,l:r.l,L:r.Lss,gov:r.gov,SR:12*r.Lss/d}; });
      const pk=pickRow(rows);
      h+=step('الطول الحاكم والنحافة',[`\\begin{aligned}L_{ss}=\\max\\Big(&L_{eff,g}+\\tfrac{d}{12},\\\\&\\tfrac43L_{eff,l},\\ L_{eff,l}+2.5\\Big)\\\\SR=&\\ \\frac{12L_{ss}}{d}\\end{aligned}`],'نحسب الطول للغاز وللسائل وناخذ الأكبر.','<div class="tbl-wrap"><table class="num"><tr><th>d</th><th>Gas L<sub>eff</sub></th><th>Liq L<sub>eff</sub></th><th>L<sub>ss</sub></th><th>SR</th></tr>'+rows.map(r=>`<tr class="${r===pk?'pick':(r.SR>=2.95&&r.SR<=4.05?'good':'')}"><td>${r.d}</td><td>${F(r.g,2)}</td><td>${F(r.l,1)}</td><td>${F(r.L,1)}${r.gov==='+2.5'?'*':r.gov==='gas'?'ᵍ':''}</td><td>${F(r.SR,1)}${r===pk?' ✓':''}</td></tr>`).join('')+'</table></div><p class="muted" style="font-size:13px">* حكم L<sub>eff</sub> + 2.5 · ᵍ حكم الغاز</p>');
      h+='</div>';
      h+= pk? `<div class="note aha"><span class="t">✅ الاختيار</span><b class="en">${pk.d} in × ${Math.ceil(pk.L)} ft</b> (L<sub>ss</sub> = ${F(pk.L,1)} → ${Math.ceil(pk.L)}، SR = ${F(pk.SR,1)}). النحافة ${pk.SR>=2.95&&pk.SR<=4.05?'بين 3 و 4 ✓':'أقرب وحدة لـ 3–4 (جرّب أقطار ثانية)'}.</div>`:'';
      out.innerHTML=h+'<figure><svg data-ch></svg></figure>';
      ED.sepChart(out.querySelector('[data-ch]'),{xmin:Math.max(6,ds[0]-2),xmax:ds[ds.length-1]+2,ymax:Math.min(40,Math.max(12,Math.ceil(rows[Math.min(2,rows.length-1)].L/5)*5+5)),
        curve:d=>hLss(dL,liq,d).Lss, points:rows.map(r=>({d:r.d,L:r.L,pick:r===pk}))});
    }
  }
  run();
}

/* ---------- quiz ---------- */
ED.QUIZ.ch2 = [
  {q:'القوانين الأفقية مبنية على عازلة مليانة سائل بنسبة:', o:['25%','50%','75%','100%'], a:1, why:'«50% full» من الأرقام المفتاحية.'},
  {q:'زمن المكوث بالأمثلة (وبملاحظة الدكتورة):', o:['1 min','2 min','3 min','5 min'], a:2, why:'3 دقايق حتى ينفصل الغاز عن النفط.'},
  {q:'60 °F بالرانكن:', o:['60 °R','333 °R','520 °R','420 °R'], a:2, why:'°R = °F + 460.'},
  {q:'نسبة النحافة (Slenderness ratio) تنحسب:', o:['\\(L_{ss}/d\\)','\\(12L_{ss}/d\\)','\\(d/12L_{ss}\\)','\\(L_{eff}/d\\)'], a:1, why:'d بالإنج و L بالقدم، فنضرب L بـ 12.'},
  {q:'نسبة النحافة الشائعة:', o:['1–2','3–4','5–6','8–10'], a:1, why:'3 to 4، ولا تتجاوز 5.'},
  {q:'ليش نكرر حساب C<sub>D</sub>؟', o:['لأن الجدول ناقص','لأن C<sub>D</sub> يعتمد على Re اللي يعتمد على V<sub>t</sub> اللي يعتمد على C<sub>D</sub>','لأن الضغط يتغير','حتى نلقى Z'], a:1, why:'دائرة مغلقة، فنفرض ونصحح لحد ما يثبت.'},
  {q:'بالعازلة العمودية، قانون سعة الغاز يعطينا:', o:['الطول','أقل قطر','ارتفاع السائل','زمن المكوث'], a:1, why:'d² = …، يعني أقل قطر، وأي قطر أكبر ينفع.'},
  {q:'بمثال 4-2، القيمة الصحيحة لـ dL<sub>eff</sub>:', o:['55.04','39.85','21.8','8571'], a:1, why:'الكتاب كاتب 55.04 بالغلط، والجدول مبني على 39.85.'},
  {q:'كثافة نفط 40° API:', o:['62.4','51.5','3.71','45.0'], a:1, why:'62.4 × 141.5 / (131.5 + 40) = 51.5 lb/ft³.'},
  {q:'الحجم المختار بالمثالين 4-1 و 4-2:', o:['24 in × 14 ft','30 in × 12 ft','36 in × 10 ft','48 in × 8 ft'], a:2, why:'36 × 10 بنسبة نحافة 3.2 (عمودي) و 3.0 (أفقي).'}
];
})();
