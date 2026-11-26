/* ===== bank toggles, sheet readers, flashcards, practice ===== */
(function(){
const ED = window.ED; ED.onView = ED.onView || {};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

/* Q&A answer tabs (toggle) */
document.addEventListener('click',e=>{
  const b=e.target.closest('.qa .qt button'); if(!b) return;
  const qa=b.closest('.qa'), btns=$$('.qt button',qa), ps=$$('.qp',qa), k=+b.dataset.p, was=b.classList.contains('on');
  btns.forEach(x=>x.classList.remove('on')); ps.forEach(p=>p.classList.remove('on'));
  if(!was){ b.classList.add('on'); ps[k].classList.add('on'); }
});

ED.onView.bank = function(v){
  const items=$$('.qa',v), n=$('#bk-n',v);
  const show=f=>{ let c=0; items.forEach(q=>{ const on=f==='all'||q.dataset.tag===f; q.classList.toggle('hide',!on); if(on) c++; }); n.textContent=c+' سؤال'; };
  $('#bk-f',v).addEventListener('click',e=>{ const b=e.target.closest('[data-f]'); if(!b) return; $$('#bk-f .chip',v).forEach(x=>x.classList.toggle('on',x===b)); show(b.dataset.f); });
  $('#bk-open',v).addEventListener('click',()=>items.forEach(q=>{ $$('.qt button',q).forEach((x,j)=>x.classList.toggle('on',j===0)); $$('.qp',q).forEach((p,j)=>p.classList.toggle('on',j===0)); }));
  $('#bk-close',v).addEventListener('click',()=>items.forEach(q=>{ $$('.qt button,.qp',q).forEach(x=>x.classList.remove('on')); }));
  show('all');
};

/* ---------- sheet page ---------- */
const LH=[[17.0,369.4,180.2],[17.1,373.3,181.7],[17.2,377.1,183.3],[17.3,381.0,184.9],[17.4,384.9,186.5],[17.5,388.9,188.1],[17.6,392.7,189.7]];
ED.onView.sheet = function(v){
  $('#sheetx',v).addEventListener('click',e=>{ const r=e.target.closest('.row1'); if(!r||e.target.closest('a')) return; r.classList.toggle('on'); });
  // L/H reader
  const sl=$('#lh-y',v), t=$('#lh-t',v), o=$('#lh-out',v);
  const draw=()=>{ const y=+sl.value; $('#lh-yv',v).textContent=y.toFixed(2)+' cSt';
    let i=LH.findIndex(r=>Math.abs(r[0]-y)<1e-9); let html='<tr><th>Y (cSt @100 °C)</th><th>L</th><th>H</th></tr>';
    if(i>=0){ LH.forEach((r,k)=>html+=`<tr class="${k===i?'hit':''}"><td>${r[0].toFixed(1)}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`);
      o.innerHTML=`<b>Y = ${y.toFixed(1)} موجودة بالجدول بالضبط</b> ← خذ من نفس الصف: <span class="en"><b>L = ${LH[i][1]}</b>, <b>H = ${LH[i][2]}</b></span>`; }
    else { const k=LH.findIndex(r=>r[0]>y)-1, a=LH[k], b=LH[k+1], f=(y-a[0])/(b[0]-a[0]), L=a[1]+f*(b[1]-a[1]), H=a[2]+f*(b[2]-a[2]);
      LH.forEach((r,j)=>{ html+=`<tr class="${j===k||j===k+1?'hit':''}"><td>${r[0].toFixed(1)}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`; if(j===k) html+=`<tr class="mid"><td>${y.toFixed(2)}</td><td>${L.toFixed(2)}</td><td>${H.toFixed(2)}</td></tr>`; });
      o.innerHTML=`<b>Y = ${y.toFixed(2)} مو موجودة</b>، فهي بين ${a[0].toFixed(1)} و ${b[0].toFixed(1)}. نستوفي:<br><span class="en">f = (${y.toFixed(2)} − ${a[0].toFixed(1)}) / (${b[0].toFixed(1)} − ${a[0].toFixed(1)}) = ${f.toFixed(2)}</span><br><span class="en">L = ${a[1]} + ${f.toFixed(2)}(${b[1]} − ${a[1]}) = <b>${L.toFixed(2)}</b> · H = ${a[2]} + ${f.toFixed(2)}(${b[2]} − ${a[2]}) = <b>${H.toFixed(2)}</b></span>`; }
    t.innerHTML=html; };
  sl.addEventListener('input',draw); draw();
  // Nelson-style chart reader (schematic)
  const svg=$('#nl-svg',v), W=440,H=300,L=46,R=60,T=14,B=38;
  const X=tf=>L+(tf-0)/(1000-0)*(W-L-R), Y=sg=>H-B-(sg-0.2)/(1.0-0.2)*(H-T-B);
  const curve=(s0,tf)=>{ const g=0.00028+0.0004*(1-s0); return s0-g*(tf-60)-(0.0000004*(1.1-s0))*Math.pow(Math.max(0,tf-60),2); };
  const crit=s0=>150+(s0-0.5)*1700; // where curve ends (schematic)
  const API=s=>141.5/s-131.5;
  let step=0;
  const TXT=['اضغط «الخطوة الجاية» حتى نقرا المخطط سوا.',
   '<b>1.</b> لاقي منحني نفطك: المنحنيات مكتوب عليها SG عند 60 °F (وعلى اليمين API المقابل). هنا المنحني المعلّم هو منحنيك.',
   '<b>2.</b> على المحور الأفقي لاقي الحرارة المطلوبة (بالفهرنهايت). إذا عندك سيليزي حوّلها أول: F = 1.8C + 32.',
   '<b>3.</b> اطلع من الحرارة <b>لفوك بخط عمودي</b> لحد ما تضرب منحنيك.',
   '<b>4.</b> من نقطة التقاطع روح <b>يسار بخط أفقي</b> لحد المحور العمودي، واقرا SG عند تلك الحرارة.'];
  function draw2(){
    const s0=+$('#nl-sg',v).value, tf=Math.min(+$('#nl-t',v).value||60, crit(s0)-5), sgT=curve(s0,tf);
    let g='';
    for(let s=0.2;s<=1.0001;s+=0.1) g+=`<line x1="${L}" x2="${W-R}" y1="${Y(s)}" y2="${Y(s)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(s)+4}" text-anchor="end" class="lab-en">${s.toFixed(1)}</text>`;
    for(let t=0;t<=1000;t+=200) g+=`<line x1="${X(t)}" x2="${X(t)}" y1="${T}" y2="${H-B}" stroke="var(--line)"/><text x="${X(t)}" y="${H-B+15}" text-anchor="middle" class="lab-en">${t}</text>`;
    [0.6,0.7,0.8,0.9,1.0].forEach(s=>{ const pts=[]; for(let t=60;t<=crit(s);t+=10){ const y=curve(s,t); if(y<0.22) break; pts.push(`${X(t)},${Y(y)}`);} const me=Math.abs(s-s0)<1e-6;
      g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${me&&step>=1?'var(--cyan)':'var(--muted)'}" stroke-width="${me&&step>=1?3:1.3}"/><text x="${X(60)-4}" y="${Y(s)-3}" text-anchor="end" class="lab-en">${s.toFixed(2)}</text><text x="${W-R+4}" y="${Y(s)+4}" class="lab-en" style="font-size:10px">API ${API(s).toFixed(0)}</text>`; });
    if(step>=2) g+=`<circle cx="${X(tf)}" cy="${H-B}" r="5" fill="var(--amber)"/><text x="${X(tf)}" y="${H-B-8}" text-anchor="middle" class="lab" style="font-weight:700;fill:var(--amber)">${tf} °F</text>`;
    if(step>=3) g+=`<line x1="${X(tf)}" y1="${H-B}" x2="${X(tf)}" y2="${Y(sgT)}" stroke="var(--amber)" stroke-width="2" stroke-dasharray="5 4"/><circle cx="${X(tf)}" cy="${Y(sgT)}" r="5" fill="var(--amber)"/>`;
    if(step>=4) g+=`<line x1="${X(tf)}" y1="${Y(sgT)}" x2="${L}" y2="${Y(sgT)}" stroke="var(--green)" stroke-width="2" stroke-dasharray="5 4"/><rect x="${L+4}" y="${Y(sgT)-22}" width="92" height="18" rx="5" fill="var(--green)"/><text x="${L+50}" y="${Y(sgT)-9}" text-anchor="middle" style="fill:#fff;font:700 12px var(--mono)">SG ≈ ${sgT.toFixed(3)}</text>`;
    g+=`<text x="${(L+W-R)/2}" y="${H-4}" text-anchor="middle" class="lab-en">Temperature, °F</text><text x="6" y="10" class="lab-en">SG at any T</text>`;
    svg.innerHTML=g; $('#nl-txt',v).innerHTML=TXT[step]; $('#nl-n',v).textContent=`خطوة ${step} من 4`;
  }
  $('#nl-step',v).addEventListener('click',()=>{ step=Math.min(4,step+1); draw2(); });
  $('#nl-reset',v).addEventListener('click',()=>{ step=0; draw2(); });
  $('#nl-sg',v).addEventListener('change',draw2); $('#nl-t',v).addEventListener('input',draw2);
  draw2();
};

/* ---------- flashcards ---------- */
const CARDS={
 mem:[['عامل واتسون','Watson factor','K_w=\\dfrac{\\sqrt[3]{T_{av.bo.po.}(^\\circ R)}}{Sp.Gr_{60/60}}','«معدّل، ميل، طرح، رانكن، جذر»'],
  ['ميل التقطير','Slope Δt','\\Delta t=\\dfrac{T_9-T_1}{80}','من 10% لـ 90%'],
  ['معدل درجة الغليان','Average boiling point','T_{av.bo.po.}=T_{av.vol}-\\Delta t','T<sub>av.vol</sub> = مجموع التسعة ÷ 9'],
  ['API','API gravity','API=\\dfrac{141.5}{Sp.Gr}-131.5','الفرق 10'],
  ['الرانكن','Rankine','R=C\\times1.8+32+459.67',''],
  ['SG عند أي حرارة','SG at T','SG_T=SG_{60}-\\gamma(T_F-60)','γ = 0.000517–0.000897'],
  ['اللزوجة','Viscosity','\\nu=\\dfrac{\\mu}{\\rho},\\qquad \\nu=c\\cdot t',''],
  ['الاستيفاء','Interpolation','L=L_1+\\dfrac{Y-Y_1}{Y_2-Y_1}(L_2-L_1)','']],
 sheet:[['مؤشر اللزوجة 0–100','#1','\\text{لما } U\\ge H','VI = (L − U)/(L − H) × 100'],
  ['مؤشر اللزوجة > 100','#2','\\text{لما } U<H','احسب N أولاً'],
  ['L و H بالقوانين','#3 و #4','Y>70\\ \\text{cSt}','وإلا من الجدول'],
  ['نقطة الانسكاب','#5','\\text{SG, M, }\\nu_{38}\\Rightarrow T_p\\ (K)','احسب الأسس أول'],
  ['نقطة الوميض','#6','P^{vap}\\ (bar,\\ 37.8^\\circ C)\\Rightarrow T_F\\ (K)',''],
  ['نسبة الأروماتيات','#7','SG,\\ AP\\ (^\\circ C)\\Rightarrow\\%A',''],
  ['مؤشر الديزل','#8','API,\\ AP\\ (^\\circ C)\\Rightarrow DI','SG ← API أول'],
  ['الحرارة النوعية','#9','SG,\\ T\\ (^\\circ C)\\Rightarrow Sp.heat',''],
  ['معامل الارتباط','#10','T\\ (K),\\ SG\\Rightarrow C.I.','وصنّف من ص2']],
 theory:[['عيوب الكبريت','Sulphur','\\text{corrosion, }\\downarrow ON,\\ \\downarrow\\text{oxidation res., solids}','«الكبريت ياكل المحرك»'],
  ['عيوب النتروجين','Nitrogen','\\text{poison catalyst, }\\uparrow\\text{carbon residue, }\\downarrow API','«يسمّ العامل»'],
  ['عيوب المعادن','Metals','\\text{catalyst, coke, }\\downarrow\\text{gasoline, ash, corrosion}','خمسة'],
  ['البارافين العادي','n-paraffin','\\uparrow MW,\\ \\uparrow b.p.,\\ \\downarrow ON','«عالي عالي واطي»'],
  ['البارافين المتفرع','iso-paraffin','\\downarrow b.p.,\\ \\uparrow ON','مفضل بالوقود'],
  ['ترتيب الأوكتان','Octane order','A>N>O>Iso\\,P>P',''],
  ['سُلّم الحرارات','Temperatures','Autoignition>Fire>Flash',''],
  ['حدود واتسون','Kw ranges','12.15\\text{–}12.9\\ P,\\ 11.5\\text{–}12.1\\ M,\\ 10.5\\text{–}11.45\\ N','']]
};
function initCards(root){
  const box=$('#fc',root); let set='mem', deck=[], i=0, known=0;
  const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
  function load(s){ set=s; deck=shuffle(CARDS[s].map((c,k)=>k)); i=0; known=0; draw(); }
  function draw(){
    if(!deck.length){ box.innerHTML=`<div style="text-align:center;padding:20px"><div class="trophy">✓</div><b>خلصت كل البطاقات!</b><p class="muted">حفظت ${known} من أول مرة.</p><button class="btn small" data-fc="again">↺ من جديد</button></div>`; return; }
    const c=CARDS[set][deck[i%deck.length]];
    box.innerHTML=`<div class="muted" style="font-size:13px">باقي ${deck.length} بطاقة</div><div class="fc-face"><div style="font-size:21px;font-weight:700">${c[0]}</div><div class="en muted">${c[1]}</div>
      <div class="fc-back hide"><div class="eq">${ED.tex(c[2])}</div>${c[3]?`<div class="note hook" style="margin:6px 0 0"><span class="t"></span>${c[3]}</div>`:''}</div></div>
      <div class="row" style="justify-content:center;margin-top:12px" data-pre><button class="btn" data-fc="flip">اقلب البطاقة</button></div>
      <div class="row hide" style="justify-content:center;margin-top:12px" data-post><button class="btn small" data-fc="yes" style="background:var(--green)">✓ كنت أعرفه</button><button class="btn small ghost" data-fc="no">رجّعه بعدين</button></div>`; }
  box.addEventListener('click',e=>{ const b=e.target.closest('[data-fc]'); if(!b) return; const a=b.dataset.fc;
    if(a==='flip'){ $('.fc-back',box).classList.remove('hide'); $('[data-pre]',box).classList.add('hide'); $('[data-post]',box).classList.remove('hide'); }
    if(a==='yes'){ deck.splice(i%deck.length,1); known++; draw(); } if(a==='no'){ i++; draw(); } if(a==='again') load(set); });
  $('#fc-set',root).addEventListener('click',e=>{ const b=e.target.closest('[data-s]'); if(!b) return; $$('#fc-set .chip',root).forEach(x=>x.classList.toggle('on',x===b)); load(b.dataset.s); });
  load('mem');
}
ED.onView.practice = function(v){ ED.mountPractice(v); initCards(v); };
})();
