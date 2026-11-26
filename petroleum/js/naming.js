/* ===== interactive naming lab ===== */
(function(){
const ED=window.ED; ED.onView=ED.onView||{};
const STEM={3:'prop',4:'but',5:'pent',6:'hex'}, AR={3:'ثلاث',4:'أربع',5:'خمس',6:'ست'};
const MULT=['','','di','tri','tetra'];
const P=(c,t)=>`<span class="nm-part ${c}">${t}</span>`;
const lex=(a,b)=>{ for(let i=0;i<Math.max(a.length,b.length);i++){ if((a[i]??99)!==(b[i]??99)) return (a[i]??99)-(b[i]??99);} return 0; };

/* ---------- naming core ---------- */
function name(cfg){
  const {ring,n,func}=cfg, subs=cfg.subs.filter(s=>s.g);
  // candidate numberings: map original atom -> locant
  const cands=[];
  if(ring){ for(let s=0;s<n;s++) for(const d of [1,-1]) cands.push(k=>((d*(k-1-s))%n+n)%n+1); }
  else { cands.push(k=>k); cands.push(k=>n+1-k); }
  let best=null;
  for(const m of cands){
    const fl= func&&!ring ? m(1) : 0;
    const locs=subs.map(s=>m(s.p)).sort((a,b)=>a-b);
    const alpha=[...subs].sort((a,b)=>a.g.localeCompare(b.g)).map(s=>m(s.p));
    const key=[fl,locs,alpha];
    if(!best || fl<best.key[0] || (fl===best.key[0] && (lex(locs,best.key[1])<0 || (lex(locs,best.key[1])===0 && lex(alpha,best.key[2])<0)))) best={m,key};
  }
  const m=best.m, groups={};
  subs.forEach(s=>(groups[s.g]=groups[s.g]||[]).push(m(s.p)));
  const gnames=Object.keys(groups).sort();
  const onlyOneRing = ring && subs.length===1;
  const parts=[];
  gnames.forEach((g,i)=>{ const L=groups[g].sort((a,b)=>a-b);
    if(i>0) parts.push(['','-']);
    if(!onlyOneRing) parts.push(['nm-loc',L.join(',')+'-']);
    parts.push(['nm-sub',MULT[L.length]+g]); });
  let plain=parts.map(p=>p[1]).join('');
  const stem=STEM[n];
  if(ring){ parts.push(['nm-par','cyclo'+stem]); parts.push(['nm-suf','ane']); }
  else if(func==='ene'){ const fl=m(1); if(subs.length) parts.push(['','-']); parts.push(['nm-loc',(fl===n?n-1:fl)+'-']); parts.push(['nm-par',stem]); parts.push(['nm-suf','ene']); }
  else if(func==='thiol'){ if(subs.length) parts.push(['','-']); parts.push(['nm-loc',m(1)+'-']); parts.push(['nm-par',stem+'ane']); parts.push(['nm-suf','thiol']); }
  else { parts.push(['nm-par',stem]); parts.push(['nm-suf','ane']); }
  const full=parts.map(p=>p[1]).join('');
  return {m, parts, full, groups, gnames, onlyOneRing};
}
const family=c=> c.func==='thiol' ? ['مركابتان (كبريتي)','غير هيدروكاربون','بيه S'] : c.func==='ene' ? ['أوليفين (غير مشبع)','هيدروكاربون','C و H بس'] : c.ring ? ['نفثين (حلقي مشبع)','هيدروكاربون','C و H بس'] : c.subs.some(s=>s.g) ? ['بارافين متفرع (iso)','هيدروكاربون','C و H بس'] : ['بارافين عادي (n-)','هيدروكاربون','C و H بس'];

/* ---------- drawing ---------- */
function draw(cfg,m){
  const {ring,n,func}=cfg, subs=cfg.subs.filter(s=>s.g); let pts=[], g='', out=[];
  if(ring){ const cx=170,cy=95,r=46; for(let k=0;k<n;k++){ const a=(-90+360*k/n)*Math.PI/180; pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]); out.push([Math.cos(a),Math.sin(a)]); }
    g+=`<polygon points="${pts.map(p=>p.join(',')).join(' ')}"/>`; }
  else { const x0=170-(n-1)*22; for(let k=0;k<n;k++){ const up=k%2===0; pts.push([x0+k*44, up?80:105]); out.push([0, up?-1:1]); }
    g+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}"/>`;
    if(func==='ene'){ const [a,b]=[pts[0],pts[1]]; g+=`<line x1="${a[0]+4}" y1="${a[1]+7}" x2="${b[0]-2}" y2="${b[1]-1}"/>`; }
    if(func==='thiol'){ const a=pts[0]; g+=`<line x1="${a[0]}" y1="${a[1]}" x2="${a[0]-30}" y2="${a[1]+14}"/><text x="${a[0]-46}" y="${a[1]+22}" class="nmS">SH</text>`; } }
  const used={};
  subs.forEach(s=>{ const k=s.p-1, p=pts[k]; let [dx,dy]=out[k]; const c=(used[k]=(used[k]||0)+1);
    if(ring&&c===2){ const t=dx; dx=dx*0.6-dy*0.8; dy=dy*0.6+t*0.8; } if(!ring&&c===2){ dx=0.9*(k%2?1:-1); dy=dy*0.4; }
    const q=[p[0]+dx*30,p[1]+dy*30]; g+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" class="nmB"/>`;
    if(s.g==='ethyl'){ const q2=[q[0]+(dx||1)*0.5*26+ (ring?0:22), q[1]+dy*0.5*26]; g+=`<line x1="${q[0]}" y1="${q[1]}" x2="${q2[0]}" y2="${q2[1]}" class="nmB"/>`; } });
  pts.forEach((p,k)=>{ const L=m(k+1), [dx,dy]=out[k]; g+=`<circle cx="${p[0]-dx*16}" cy="${p[1]-dy*16}" r="9" class="nmC"/><text x="${p[0]-dx*16}" y="${p[1]-dy*16+4}" class="nmN">${L}</text>`; });
  return `<svg viewBox="0 0 340 190" class="nmsvg">${g}</svg>`;
}

/* ---------- lab UI ---------- */
function mountLab(box){
  const st={ring:false,n:5,func:'',subs:[{g:'methyl',p:2},{g:'methyl',p:2}]};
  box.innerHTML=`<div class="form" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
   <label><span>الشكل</span><select data-x="ring"><option value="0">سلسلة</option><option value="1">حلقة</option></select></label>
   <label><span>عدد الكاربونات</span><select data-x="n"></select></label>
   <label data-fl><span>مجموعة على الطرف</span><select data-x="func"><option value="">بدون</option><option value="ene">آصرة مزدوجة (ene)</option><option value="thiol">SH (thiol)</option></select></label>
   ${[0,1].map(i=>`<label><span>فرع ${i+1}</span><select data-x="g${i}"><option value="">بدون</option><option value="methyl">methyl (CH₃)</option><option value="ethyl">ethyl (C₂H₅)</option></select></label><label><span>على الكاربون</span><select data-x="p${i}"></select></label>`).join('')}
  </div><div data-o></div>`;
  const q=s=>box.querySelector(`[data-x="${s}"]`);
  function opts(){ const ns=st.ring?[3,4,5,6]:[3,4,5,6]; q('n').innerHTML=ns.map(k=>`<option ${k===st.n?'selected':''}>${k}</option>`).join('');
    const ps=st.ring?[...Array(st.n)].map((_,k)=>k+1):[...Array(Math.max(0,st.n-2))].map((_,k)=>k+2);
    [0,1].forEach(i=>{ const cur=st.subs[i].p; q('p'+i).innerHTML=ps.map(k=>`<option ${k===cur?'selected':''}>${k}</option>`).join(''); if(!ps.includes(cur)) st.subs[i].p=ps[0]||2; });
    box.querySelector('[data-fl]').classList.toggle('hide',st.ring); }
  function render(){
    const subs=st.subs.filter(s=>s.g); let warn='';
    if(!st.ring) subs.forEach(s=>{ if(s.g==='ethyl' && (s.p<3 || s.p>st.n-2)) warn='الإيثيل هنا يطوّل السلسلة، فالسلسلة الأطول صارت هي العائلة. جرّب الإيثيل بالنص أو زيد عدد الكاربونات.'; });
    if(!st.ring && st.n<4 && subs.length>1 && subs.every(s=>s.p===2)===false) {}
    const r=name(st), f=family(st);
    const grp=r.gnames.map(gn=>{ const L=r.groups[gn]; return `<b class="en">${gn}</b> × ${L.length} ← ${L.length>1?`نكتب <b class="en">${MULT[L.length]}${gn}</b> ونكتب رقم لكل واحد (${L.join(',')})`:`رقمه ${L[0]}`}`; }).join('<br>');
    box.querySelector('[data-o]').innerHTML = draw(st,r.m) + `<div class="nm-name">${r.parts.map(p=>p[0]?P(p[0],p[1]):p[1]).join('')}</div>
     <div class="row" style="justify-content:center;gap:6px;margin:-4px 0 8px"><span class="tag t-giv">${f[1]}</span><span class="tag t-key">${f[0]}</span><span class="muted" style="font-size:13px">(${f[2]})</span></div>
     ${warn?`<div class="note trap"><span class="t">انتبه</span>${warn}</div>`:''}
     <div class="steps">
      <div class="step"><h4>العائلة (${P('nm-par',(st.ring?'cyclo':'')+STEM[st.n])})</h4><p style="margin:0">${st.ring?'حلقة':'سلسلة'} بيها ${AR[st.n]} كاربونات ← <b class="en">${STEM[st.n]}</b>${st.ring?'، وكلمة <b class="en">cyclo</b> لأنها حلقة':''}.</p></div>
      <div class="step"><h4>اللقب (${P('nm-suf',st.func||'ane')})</h4><p style="margin:0">${st.func==='ene'?'بيه آصرة مزدوجة ← <b class="en">ene</b> (أوليفين)':st.func==='thiol'?'بيه SH ← <b class="en">thiol</b> (مركابتان)':'كله أواصر مفردة ← <b class="en">ane</b>'}.</p></div>
      <div class="step"><h4>الترقيم (${P('nm-loc','الأرقام بالدوائر')})</h4><p style="margin:0">${st.func&&!st.ring?'المجموعة الطرفية لازم تاخذ أصغر رقم، فبدينا من جهتها.':r.onlyOneRing?'فرع واحد على حلقة ← ما نحتاج رقم.':'جربنا الترقيم من كل جهة، واخترنا اللي يعطي الفروع <b>أصغر أرقام</b>'+(r.gnames.length>1?'، وإذا تساوت ياخذ الأسبق أبجدياً الرقم الأصغر':'')+'.'}</p></div>
      ${subs.length?`<div class="step"><h4>الفروع (${P('nm-sub','اسم أول')})</h4><p style="margin:0">${grp}</p></div>`:''}
      ${r.gnames.length>1?`<div class="step"><h4>الترتيب الأبجدي</h4><p style="margin:0"><b class="en">${r.gnames.join(' ← ')}</b>: نرتّب حسب أول حرف (ونتجاهل di و tri).</p></div>`:''}
     </div>`; }
  box.addEventListener('change',e=>{ const x=e.target.dataset.x; if(!x) return; const v=e.target.value;
    if(x==='ring'){ st.ring=v==='1'; if(st.ring){ st.func=''; q('func').value=''; } }
    else if(x==='n') st.n=+v; else if(x==='func') st.func=v;
    else if(x[0]==='g') st.subs[+x[1]].g=v; else if(x[0]==='p') st.subs[+x[1]].p=+v;
    opts(); render(); });
  q('g0').value='methyl'; q('g1').value='methyl'; opts(); render();
}

/* ---------- quiz: name this ---------- */
function mountQuiz(box){
  let score=0,tot=0;
  function rnd(){ const ring=Math.random()<0.4, n=ring?(Math.random()<.5?5:6):[4,5,6][Math.floor(Math.random()*3)], func=!ring&&Math.random()<.3?(Math.random()<.5?'ene':'thiol'):'';
    const ps=ring?[1,2,3]:[...Array(n-2)].map((_,k)=>k+2), k=Math.random()<.6?2:1, subs=[];
    for(let i=0;i<k;i++){ let g=Math.random()<.7?'methyl':'ethyl'; let p=ps[Math.floor(Math.random()*ps.length)]; if(!ring&&g==='ethyl'&&(p<3||p>n-2)) g='methyl'; subs.push({g,p}); }
    return {ring,n,func,subs}; }
  function wrongs(c,right){ const W=new Set();
    const rev=JSON.parse(JSON.stringify(c)); rev.subs.forEach(s=>s.p=c.ring?s.p:c.n+1-s.p);
    W.add(right.replace(/(\d)/g,d=>String(Math.min(c.n,(+d)%c.n+1))));
    W.add(right.replace('dimethyl','methyl').replace('diethyl','ethyl'));
    if(right.includes('ethyl-') && right.includes('methyl')) W.add(right.replace(/(\d[\d,]*-)ethyl-(\d[\d,]*-)methyl/,'$2methyl-$1ethyl'));
    W.add(right.replace('cyclo','').replace(/(pent|hex|but|prop)ane$/,'$1ene'));
    W.add(right.replace(/^(\d)/,d=>String(+d+1)));
    const st=STEM[c.n], alt=STEM[c.n===6?5:c.n+1]; W.add(right.replace(st,alt));
    if(!/^\d/.test(right)) W.add('1-'+right);
    W.add(right.replace('cyclo',''));
    W.delete(right); return [...W].filter(x=>x&&x!==right).slice(0,3); }
  function next(){ const c=rnd(), r=name(c); const opts=[r.full,...wrongs(c,r.full)].slice(0,4).sort(()=>Math.random()-.5);
    box.innerHTML=`<div class="muted" style="font-size:13px">النقاط: ${score} / ${tot}</div>${draw(c,k=>'')}<div class="opts" style="display:grid;gap:8px">${opts.map(o=>`<button class="opt en" style="direction:ltr;text-align:left" data-o="${o}">${o}</button>`).join('')}</div><div data-fb></div><div class="row" style="margin-top:10px"><button class="btn small" data-nx>سؤال ثاني</button></div>`;
    box.querySelectorAll('.nmN,.nmC').forEach(e=>e.remove());
    box.onclick=e=>{ const b=e.target.closest('[data-o]'); if(b&&!box.dataset.ans){ box.dataset.ans=1; tot++; const ok=b.dataset.o===r.full; if(ok) score++;
        box.querySelectorAll('[data-o]').forEach(x=>x.classList.add(x.dataset.o===r.full?'right':(x===b?'wrong':'x')));
        box.querySelector('[data-fb]').innerHTML=`<div class="note ${ok?'aha':'trap'}"><span class="t">${ok?'صح!':'الصح:'}</span><div class="nm-name" style="margin:4px 0">${r.parts.map(p=>p[0]?P(p[0],p[1]):p[1]).join('')}</div>${family(c)[0]} · ${family(c)[1]}</div>`; }
      if(e.target.closest('[data-nx]')){ delete box.dataset.ans; next(); } };
  }
  next();
}
const prev=ED.onView.ch1;
ED.onView.ch1=function(v){ if(prev) prev(v); const l=v.querySelector('#nmlab'), q=v.querySelector('#nmquiz'); if(l) mountLab(l); if(q) mountQuiz(q); };
ED.nameOf=name;
})();
