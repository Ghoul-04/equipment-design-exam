/* ===== practice: flashcards, random problems, mixed quiz ===== */
(function(){
const ED = window.ED; ED.onView = ED.onView || {};
const rnd=(a)=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

/* mixed quiz (defined at load so the quiz widget finds it) */
ED.QUIZ.all = shuffle([...(ED.QUIZ.ch1||[]), ...(ED.QUIZ.ch2||[])]).slice(0,20);

/* flashcards */
const CARDS = {
 ch1:[
  ['سُمك الأسطوانة','Cylindrical shell','e=\\dfrac{P_iD_i}{2Jf-P_i}+c','«2 للأنبوب»'],
  ['سُمك الكرة','Sphere','e=\\dfrac{P_iD_i}{4Jf-1.2P_i}+c','«4 للكرة، و1.2 وياها»'],
  ['الرأس نصف الكروي','Hemispherical head','e=0.6\\,e_{shell}','«نص كرة = 60%»'],
  ['الرأس البيضوي 2:1','Ellipsoidal head','e=\\dfrac{P_iD_i}{2Jf-0.2P_i}','«توأم الأسطوانة بخصم 0.2»'],
  ['الرأس التورِي','Torispherical head','e=\\dfrac{P_iR_cC_s}{2fJ+P_i(C_s-0.2)}','مقامه «+» · البسط Rc×Cs'],
  ['معامل تركيز الإجهاد','Stress concentration factor','C_s=\\tfrac14\\left(3+\\sqrt{R_c/R_k}\\right)','«ربع (ثلاثة + جذر التاج على المفصل)»'],
  ['الغطاء المسطح','Flat plate','e=C_pD_e\\sqrt{P_i/f}','«سي دي تحت الجذر»'],
  ['قيم Cp','Flat-end constants','\\begin{aligned}&\\text{full-face gasket: }0.4\\\\&\\text{flanged-only: }0.45\\\\&\\text{welded / narrow gasket: }0.55\\end{aligned}','«Full = Four»'],
  ['خزان السوائل','Storage tank','e_s=\\dfrac{\\rho_LH_Lg}{2f_tJ}\\,\\dfrac{D_t}{10^3}','= أسطوانة بـ P = ρgH'],
  ['قطر الأنبوب الأمثل','Optimum pipe diameter','\\begin{aligned}\\text{CS: }&d=282\\,G^{0.52}\\rho^{-0.37}\\\\\\text{SS: }&d=226\\,G^{0.50}\\rho^{-0.35}\\end{aligned}','G kg/s · ρ kg/m³ · d mm'],
  ['ضغط التصميم','Design pressure','P_{design}=1.2\\,P_{op}\\quad(\\text{Ex: }1.1\\times(P-1))','اتبع اللي مكتوب بالسؤال'],
  ['كفاءة اللحام J','Joint efficiency','\\begin{aligned}&\\text{Double: }1.0\\,/\\,0.85\\,/\\,0.7\\\\&\\text{Single: }0.9\\,/\\,0.80\\,/\\,0.65\\end{aligned}','100% · spot · none']
 ],
 key:[
  ['سماحية التآكل','Corrosion allowance','\\text{dry }1\\ \\cdot\\ \\text{wet }2\\ \\cdot\\ \\text{aqueous}\\ge3\\ \\text{mm}','«جاف 1 · رطب 2 · ماء 3»'],
  ['أقل سُمك عملي','Minimum thickness','5\\text{–}7\\text{–}9\\text{–}10\\text{–}12\\ \\text{mm}','للأقطار 1، 1–2، 2–2.5، 2.5–3، 3–3.5 m'],
  ['المفصل والتاج','Knuckle & crown','R_k\\ge0.06\\,R_c,\\quad R_c\\le D','«6 للمفصل»'],
  ['إجهاد الكاربون ستيل','Carbon steel f','300^\\circ\\text{C}\\Rightarrow f=85\\ \\text{N/mm}^2','135 → 125 → … → 85'],
  ['وحدة الضغط','Pressure units','1\\ \\text{bar}=0.1\\ \\text{N/mm}^2','abs → gauge: −1'],
  ['أرقام العازلة','Separator key numbers','50\\%\\ \\text{full}\\cdot100\\,\\mu m\\cdot3\\ \\text{min}','ملاحظات الدكتورة'],
  ['نسبة النحافة','Slenderness ratio','SR=\\dfrac{12L_{ss}}{d}=3\\text{ to }4','لا تتجاوز 5'],
  ['الحرارة المطلقة','Rankine','T(^\\circ R)=T(^\\circ F)+460','أول خطوة دائماً']
 ],
 ch2:[
  ['كثافة السائل','Liquid density','\\rho_l=62.4\\left[\\dfrac{141.5}{131.5+API}\\right]','lb/ft³'],
  ['كثافة الغاز','Gas density','\\rho_g=2.70\\,\\dfrac{SP}{TZ}','«2.7 SP على TZ»'],
  ['معامل السحب','Drag coefficient','C_D=\\dfrac{24}{Re}+\\dfrac{3}{Re^{1/2}}+0.34','«24 / 3 / 0.34»'],
  ['السرعة النهائية','Terminal velocity','V_t=0.0119\\left[\\left(\\dfrac{\\rho_l-\\rho_g}{\\rho_g}\\right)\\dfrac{d_m}{C_D}\\right]^{1/2}','البداية: 0.0204 = 0.0119/√0.34'],
  ['رينولدز','Reynolds number','Re=0.0049\\,\\dfrac{\\rho_gd_mV_t}{\\mu}',''],
  ['غاز أفقي','Horizontal gas capacity','dL_{eff}=420\\left[\\tfrac{TZQ_g}{P}\\right]\\left[\\left(\\tfrac{\\rho_g}{\\rho_l-\\rho_g}\\right)\\tfrac{C_D}{d_m}\\right]^{1/2}','d × L = ثابت'],
  ['سائل أفقي','Horizontal liquid capacity','d^2L_{eff}=\\dfrac{t_rQ_l}{0.7}',''],
  ['طول أفقي','Horizontal Lss','L_{ss}=L_{eff}+\\tfrac{d}{12}\\ (\\text{gas}),\\quad\\tfrac43L_{eff}\\ (\\text{liq})','وخذ الأكبر'],
  ['غاز عمودي','Vertical gas capacity','d^2=5040\\left[\\tfrac{TZQ_g}{P}\\right]\\left[\\left(\\tfrac{\\rho_g}{\\rho_l-\\rho_g}\\right)\\tfrac{C_D}{d_m}\\right]^{1/2}','5040 = 12 × 420'],
  ['سائل عمودي','Vertical liquid capacity','d^2h=\\dfrac{t_rQ_l}{0.12}',''],
  ['طول عمودي','Vertical Lss','L_{ss}=\\dfrac{h+76}{12}\\ \\text{or}\\ \\dfrac{h+d+40}{12}','خذ الأكبر']
 ]
};
function initCards(){
  const box=ED.$('#fc'); let set='ch1', deck=[], i=0, flipped=false, known=0;
  function load(s){ set=s; deck=shuffle(CARDS[s].map((c,k)=>k)); i=0; known=0; draw(); }
  function draw(){
    if(!deck.length){ box.innerHTML=`<div style="text-align:center;padding:20px"><div class="trophy">✓</div><b>خلصت كل البطاقات!</b><p class="muted">حفظت ${known} من أول مرة.</p><button class="btn small" data-fc="again">↺ من جديد</button></div>`; return; }
    const c=CARDS[set][deck[i%deck.length]]; flipped=false;
    box.innerHTML=`<div class="muted" style="font-size:13px">باقي ${deck.length} بطاقة</div>
      <div class="fc-face"><div style="font-size:21px;font-weight:700">${c[0]}</div><div class="en muted">${c[1]}</div>
      <div class="fc-back hide"><div class="eq">${ED.tex(c[2])}</div>${c[3]?`<div class="note hook" style="margin:6px 0 0"><span class="t"></span>${c[3]}</div>`:''}</div></div>
      <div class="row" style="justify-content:center;margin-top:12px" data-pre><button class="btn" data-fc="flip">اقلب البطاقة</button></div>
      <div class="row hide" style="justify-content:center;margin-top:12px" data-post><button class="btn small" data-fc="yes" style="background:var(--green);color:#03140c">✓ كنت أعرفه</button><button class="btn small ghost" data-fc="no">✗ رجّعه بعدين</button></div>`;
  }
  box.addEventListener('click',e=>{ const b=e.target.closest('[data-fc]'); if(!b) return; const a=b.dataset.fc;
    if(a==='flip'){ ED.$('.fc-back',box).classList.remove('hide'); ED.$('[data-pre]',box).classList.add('hide'); ED.$('[data-post]',box).classList.remove('hide'); }
    if(a==='yes'){ deck.splice(i%deck.length,1); known++; draw(); }
    if(a==='no'){ i++; draw(); }
    if(a==='again') load(set); });
  ED.$('#fc-set').addEventListener('click',e=>{ const b=e.target.closest('[data-s]'); if(!b) return; ED.$$('#fc-set .chip').forEach(x=>x.classList.toggle('on',x===b)); load(b.dataset.s); });
  load('ch1');
}

/* random problems */
const MATS={cs:'plain carbon steel',cmn:'carbon-manganese steel','304':'stainless steel 304'};
const RADS=['fully radiographed','spot radiographed','not radiographed'];
const CPS={d:['bolted cover with a full-face gasket','bolt circle'],e:['bolted cover with a narrow-face gasket','mean gasket diameter'],bc:['flat plate welded to the shell','—']};
function genVessel(){
  const P=rnd([8,10,12,14,16,18,20,22,25,28,30]), T=rnd([100,150,200,250,300,350]), mat=rnd(['cs','cs','cmn','304']), rad=rnd([0,0,1,2]), D=rnd([1.0,1.2,1.5,1.8,2.0,2.5]), c=rnd([1,2,2,3]), cpk=rnd(['d','d','e','bc']), De=+(D+0.2).toFixed(2);
  const inp={P,Tc:T,mat,jt:0,rad,Dm:D,c,rkPct:6,RcIn:'',cpk,DeIn:De,abs:true,fac:1.1,jhSame:false};
  const q=`<div class="problem">A vessel of internal diameter <b>${D} m</b> operates at <b>${P} bar (abs)</b> and <b>${T} °C</b>. Material: <b>${MATS[mat]}</b>. Welds: <b>${RADS[rad]}</b> (double-welded butt). Corrosion allowance: <b>${c} mm</b>. Take the design pressure <b>10 % above the operating (gauge) pressure</b>.<br>Find the thickness of: (a) the cylindrical shell, (b) a standard 2:1 ellipsoidal head, (c) a standard torispherical head (R<sub>c</sub> = D<sub>i</sub>, R<sub>k</sub> = 6 % R<sub>c</sub>), (d) a flat end: ${CPS[cpk][0]}${cpk!=='bc'?`, D<sub>e</sub> = ${De} m`:''}.</div>`;
  const r=ED.vesselSolve(inp);
  return {q, ask:'سُمك الجسم e قبل إضافة c (mm):', key:r.res.eC, html:r.html, bars:r.bars};
}
function genSep(type){
  const pr={Qg:rnd([5,8,10,12,15,20]),S:rnd([0.6,0.65,0.7]),Ql:rnd([1000,1500,2000,3000,4000,5000]),API:rnd([30,35,40,45]),P:rnd([500,600,800,1000,1200,1500]),T:rnd([60,80,100,120]),Z:rnd([0.84,0.86,0.88,0.9]),mu:rnd([0.012,0.013,0.014]),dm:rnd([100,140]),tr:3};
  const q=`<div class="problem">Size a <b>${type==='v'?'vertical':'horizontal'}</b> two-phase separator for: gas <b>${pr.Qg} MMscfd</b> (S = ${pr.S}), oil <b>${pr.Ql} bopd</b> at <b>${pr.API}° API</b>, P = <b>${pr.P} psia</b>, T = <b>${pr.T} °F</b>. Given: Z = ${pr.Z}, μ = ${pr.mu} cp, d<sub>m</sub> = ${pr.dm} micron, t<sub>r</sub> = 3 min.</div>`;
  return {q, ask: type==='v'?'أقل قطر للغاز d (in):':'قيمة d·L<sub>eff</sub> للغاز:', pr, type};
}
function initGen(){
  const $=ED.$; let type='vessel', cur=null, shown=0;
  function make(){
    cur = type==='vessel'? genVessel() : genSep(type); shown=0;
    $('#pg-q').innerHTML=cur.q; $('#pg-ask').innerHTML=cur.ask; $('#pg-ans').value=''; $('#pg-fb').innerHTML='';
    const sol=$('#pg-sol');
    if(type==='vessel'){ sol.innerHTML=cur.html; if(cur.bars) ED.bars(sol.querySelector('[data-bars]'),cur.bars); }
    else { sol.innerHTML='<div class="solver-host"></div>'; const host=sol.firstChild; ED.initSepSolver(host,cur.type,Object.assign({},cur.pr,{ds: cur.type==='v'?'24,30,36,42,48,54':'16,20,24,30,36,42,48,54,60'}),{hideForm:true}); cur.key=+host.dataset.key; }
    paint();
  }
  function parts(){ const sol=$('#pg-sol'); const st=[...sol.querySelectorAll('.step')]; const rest=[...sol.querySelectorAll('h3,.tbl-wrap:not(.step .tbl-wrap),figure,.note,p.muted')].filter(x=>!x.closest('.step')); return {st,rest}; }
  function paint(){ const {st,rest}=parts(); st.forEach((x,k)=>x.classList.toggle('hide',k>=shown)); rest.forEach(x=>x.classList.toggle('hide',shown<st.length)); $('#pg-next').disabled = shown>=st.length; }
  $('#pg-next').addEventListener('click',()=>{ shown++; paint(); const st=parts().st; st[Math.min(shown,st.length)-1]?.scrollIntoView({behavior:'smooth',block:'center'}); });
  $('#pg-all').addEventListener('click',()=>{ shown=999; paint(); });
  $('#pg-new').addEventListener('click',make);
  $('#pg-check').addEventListener('click',()=>{ const v=+$('#pg-ans').value; if(!v){ return; } const err=Math.abs(v-cur.key)/cur.key;
    $('#pg-fb').innerHTML = err<=0.02 ? `<div class="note aha"><span class="t">صح!</span>الجواب ${ED.fmt(cur.key,2)}. ممتاز، كمّل للخطوات الباقية أو جرّب مسألة ثانية.</div>` : `<div class="note trap"><span class="t">مو مضبوط</span>جوابك ${v}، والصح ${ED.fmt(cur.key,2)}. اكشف الخطوات وشوف وين الفرق (وحدات؟ −1؟ 460؟).</div>`; });
  $('#pg-type').addEventListener('click',e=>{ const b=e.target.closest('[data-p]'); if(!b) return; ED.$$('#pg-type .chip').forEach(x=>x.classList.toggle('on',x===b)); type=b.dataset.p; make(); });
  make();
}
ED.onView.practice = function(){ initCards(); initGen(); };

/* 3D lab: lazy-load the module */
ED.onView.lab = function(){
  import('./lab3d.js').then(m=>m.start()).catch(err=>{ console.warn(err); ED.$$('.lab-msg').forEach(x=>x.textContent='ما كدر يحمّل المجسمات (تحتاج إنترنت ومتصفح يدعم WebGL).'); });
};
})();
