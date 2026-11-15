/* ===== Example 13.1 — static chart + "your number" solver ===== */
(function(){
const ED = window.ED; ED.onView = ED.onView || {};
const plate = ED.plate = x => Math.ceil(x - 0.25);   // practical plate rounding (book: 14.7→15, 90.2→90)

ED.onView.ex131 = function(){
  const $=ED.$, $$=ED.$$, F=ED.fmt, T=ED.tex;
  ED.bars($('#e1-bars'),[
    {label:'جسم Shell', v:15, text:'15 mm', color:'var(--cyan)'},
    {label:'بيضوي', v:15, text:'15 mm', color:'var(--green)'},
    {label:'تورِي', v:22, text:'22 mm', color:'var(--amber)'},
    {label:'مسطح', v:90, text:'90 mm', color:'var(--red)'}
  ]);

  const matSel=$('#s1-mat');
  matSel.innerHTML = ED.STRESS.map(m=>`<option value="${m.id}">${m.ar}</option>`).join('');
  const segs = {};
  ['s1-Ptype','s1-fac'].forEach(id=>{
    const box=$('#'+id); segs[id]=$('.on',box).dataset.v;
    box.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; $$('button',box).forEach(x=>x.classList.toggle('on',x===b)); segs[id]=b.dataset.v; solve(); });
  });
  const ids=['s1-P','s1-T','s1-mat','s1-joint','s1-rad','s1-D','s1-c','s1-rk','s1-Rc','s1-cp','s1-De','s1-jh'];
  ids.forEach(id=>{ const el=$('#'+id); el.addEventListener('input',solve); el.addEventListener('change',solve); });
  $('#s1-reset').addEventListener('click',()=>{
    const d={'s1-P':14,'s1-T':300,'s1-mat':'cs','s1-joint':'0','s1-rad':'0','s1-D':1.5,'s1-c':2,'s1-rk':6,'s1-Rc':'','s1-cp':'d','s1-De':1.7,'s1-jh':'1'};
    Object.entries(d).forEach(([k,v])=>$('#'+k).value=v);
    [['s1-Ptype','abs'],['s1-fac','1.1']].forEach(([id,v])=>{ $$('#'+id+' button').forEach(b=>b.classList.toggle('on',b.dataset.v===v)); segs[id]=v; });
    solve();
  });

  function step(title, texs, why, extra=''){
    return `<div class="step"><h4>${title}</h4>${texs.map(t=>`<div class="eq">${T(t)}</div>`).join('')}${why?`<div class="why"><b class="q">ليش؟</b> ${why}</div>`:''}${extra}</div>`;
  }
  function solve(){
    const out=$('#s1-out'); const cpk=$('#s1-cp').value; $('#s1-De').disabled=(cpk==='a'||cpk==='bc');
    const r = ED.vesselSolve({P:+$('#s1-P').value, Tc:+$('#s1-T').value, mat:$('#s1-mat').value, jt:+$('#s1-joint').value, rad:+$('#s1-rad').value,
      Dm:+$('#s1-D').value, c:+$('#s1-c').value, rkPct:+$('#s1-rk').value, RcIn:$('#s1-Rc').value, cpk, DeIn:+$('#s1-De').value,
      abs: segs['s1-Ptype']==='abs', fac:+segs['s1-fac'], jhSame: $('#s1-jh').value==='same'});
    out.innerHTML = r.html; if(r.bars) ED.bars(out.querySelector('[data-bars]'), r.bars);
  }
  solve();
};
ED.vesselSolve = function(inp){
  const T=ED.tex, F=ED.fmt;
  const step=(title, texs, why, extra='')=>`<div class="step"><h4>${title}</h4>${texs.map(t=>`<div class="eq">${T(t)}</div>`).join('')}${why?`<div class="why"><b class="q">ليش؟</b> ${why}</div>`:''}${extra}</div>`;
    const {P,Tc,mat,jt,rad,Dm,c,RcIn,cpk,DeIn,abs,fac,jhSame}=inp; const rk=inp.rkPct/100;
    const deAuto = (cpk==='a'||cpk==='bc');
    if(!(P>0&&Dm>0&&c>=0&&rk>0)) return {html:'<div class="note trap"><span class="t">⚠️</span>دخّل أرقام موجبة.</div>'};
    const st = ED.stressAt(mat,Tc); const f=st.f;
    if(f==null) return {html:`<div class="note trap"><span class="t">⚠️</span>${st.note}.</div>`};
    const Pg = abs? P-1 : P, Pd = Pg*fac, Pi = Pd/10, J = ED.JTAB[jt][rad], Di=Dm*1000;
    const Jh = jhSame ? J : 1;
    const denC = 2*J*f - Pi; if(denC<=0) return {html:'<div class="note trap"><span class="t">⚠️</span>الضغط عالي جداً على هذا الإجهاد.</div>'};
    const eC = Pi*Di/denC, eCc=eC+c, pC=plate(eCc);
    const minT = ED.minThk(Dm);
    const eH = 0.6*eC, eHc=eH+c, pH=plate(eHc);
    const eE = Pi*Di/(2*Jh*f-0.2*Pi), eEc=eE+c, pE = Math.max(pC, plate(eEc));
    const Rc = RcIn? +RcIn : Dm, Rk = rk*Rc, Cs = 0.25*(3+Math.sqrt(Rc/Rk));
    const eT = Pi*Rc*1000*Cs/(2*f*Jh + Pi*(Cs-0.2)), eTc=eT+c, pT=plate(eTc);
    const cp = ED.CP[cpk].cp, De = deAuto? Dm : DeIn;
    const eF = cp*De*1000*Math.sqrt(Pi/f), eFc=eF+c, pF=plate(eFc);

    let h = '<div class="steps">';
    // 1 pressure
    const pTex = `\\begin{aligned}P_i&=${abs?`(${F(P)}-1)`:F(P)}\\times${fac}\\\\&=${F(Pd,3)}\\ \\text{bar}\\\\&=${F(Pi,4)}\\ \\text{N/mm}^2\\end{aligned}`;
    h += step('ضغط التصميم', [pTex], `${abs?'<b>−1</b> نحوّل المطلق إلى مقياسي. ':''}<b>×${fac}</b> ${fac==1.1?'10% فوق ضغط التشغيل (طريقة المثال).':fac==1.2?'20% فوق ضغط التشغيل (سلايد المحاضرة).':'بدون زيادة.'} <b>÷10</b> لأن 1 bar = 0.1 N/mm².`);
    // 2 f & J
    h += step('إجهاد التصميم وكفاءة اللحام', [`f=${F(f)}\\ \\text{N/mm}^2\\quad(T=${F(Tc)}^\\circ\\text{C})`, `J=${J}`],
      `f من جدول 13.2 (${st.note}). و J من جدول 13.3: <span class="en">${ED.JOINT_NAMES[jt]}, ${ED.RAD_NAMES[rad]}</span>.`);
    // 3 shell
    h += step('الجسم الأسطواني', [
      `\\begin{aligned}e&=\\frac{P_iD_i}{2Jf-P_i}\\\\&=\\frac{${F(Pi,4)}\\times${F(Di,1)}}{2\\times${J}\\times${F(f)}-${F(Pi,4)}}\\\\&=\\frac{${F(Pi*Di,1)}}{${F(denC,2)}}=${F(eC,2)}\\ \\text{mm}\\end{aligned}`,
      `\\begin{aligned}e+c&=${F(eC,2)}+${F(c)}=${F(eCc,2)}\\\\&\\Rightarrow\\ \\boxed{${pC}\\ \\text{mm}}\\end{aligned}`],
      `D بالـ mm (${F(Dm)} m × 1000). ضفنا c وقرّبنا لأقرب لوح للأعلى.`,
      minT? `<div class="note ${pC>=minT?'aha':'warn'}"><span class="t">${pC>=minT?'✓':'⚠️'} فحص أقل سُمك عملي</span>لقطر ${F(Dm)} m أقل سُمك = ${minT} mm${pC>=minT?'، والحل أكبر منه.':'، فخذ '+minT+' mm.'}</div>`:'');
    // 4 hemi
    h += step('رأس نصف كروي (إضافي)', [`\\begin{aligned}e&=0.6\\,e_{shell}=0.6\\times${F(eC,2)}\\\\&=${F(eH,2)}\\ \\text{mm}\\\\e+c&=${F(eHc,2)}\\Rightarrow ${pH}\\ \\text{mm}\\end{aligned}`], 'قاعدة المحاضرة «نص كرة = 60%».');
    // 5 tori
    const warnT = (rk<0.06?'<div class="note trap"><span class="t">⚠️</span>Rk/Rc أقل من 0.06، فيصير خطر انبعاج (buckling).</div>':'') + (Rc>Dm+1e-9?'<div class="note trap"><span class="t">⚠️</span>Rc لازم يكون ≤ D.</div>':'');
    h += step('رأس تورِي', [
      `\\begin{aligned}R_c&=${F(Rc)}\\ \\text{m}\\\\R_k&=${F(rk*100)}\\%\\times${F(Rc)}=${F(Rk,4)}\\ \\text{m}\\\\J&=${Jh}\\end{aligned}`,
      `\\begin{aligned}C_s&=\\tfrac14\\left(3+\\sqrt{\\tfrac{${F(Rc)}}{${F(Rk,4)}}}\\right)\\\\&=\\tfrac14\\,(3+${F(Math.sqrt(Rc/Rk),2)})=${F(Cs,2)}\\end{aligned}`,
      `\\begin{aligned}e&=\\frac{${F(Pi,4)}\\times${F(Rc*1000,1)}\\times${F(Cs,2)}}{2\\times${F(f)}\\times${Jh}+${F(Pi,4)}\\,(${F(Cs,2)}-0.2)}\\\\&=\\boxed{${F(eT,2)}\\ \\text{mm}}\\quad(+c=${F(eTc,2)})\\end{aligned}`],
      'Rc بالـ mm حتى يطلع e بالـ mm. والمفصل يكبّر الإجهاد بالمعامل Cs.', warnT);
    // 6 ellip
    h += step('رأس بيضوي 2:1', [`\\begin{aligned}e&=\\frac{${F(Pi,4)}\\times${F(Di,1)}}{2\\times${Jh}\\times${F(f)}-0.2\\times${F(Pi,4)}}\\\\&=${F(eE,2)}\\ \\text{mm}\\quad(+c=${F(eEc,2)})\\end{aligned}`],
      plate(eEc)<=pC ? `${F(eEc,2)} ≤ ${pC}، فناخذه <b>بنفس سُمك الجسم: ${pC} mm</b>، مثل المثال.` : `أكبر من لوح الجسم، فناخذ ${pE} mm.`);
    // 7 flat
    h += step('غطاء مسطح', [
      `C_p=${cp},\\quad D_e=${F(De)}\\ \\text{m}${deAuto?'\\ (=D_i)':''}`,
      `\\begin{aligned}e&=${cp}\\times${F(De*1000,1)}\\times\\sqrt{\\frac{${F(Pi,4)}}{${F(f)}}}\\\\&=${F(cp*De*1000,1)}\\times${F(Math.sqrt(Pi/f),4)}=${F(eF,1)}\\ \\text{mm}\\end{aligned}`,
      `e+c=${F(eFc,1)}\\Rightarrow\\boxed{${pF}\\ \\text{mm}}`], `${ED.CP[cpk].ar}.`);
    h += '</div>';
    // summary
    h += `<h3>📋 الخلاصة</h3><div class="tbl-wrap"><table class="num"><tr><th>الجزء</th><th>e محسوب (mm)</th><th>+ c</th><th>اللوح المختار</th></tr>
      <tr><td>جسم أسطواني</td><td>${F(eC,2)}</td><td>${F(eCc,2)}</td><td class="hl">${pC}</td></tr>
      <tr><td>بيضوي 2:1</td><td>${F(eE,2)}</td><td>${F(eEc,2)}</td><td class="hl">${pE}</td></tr>
      <tr><td>تورِي</td><td>${F(eT,2)}</td><td>${F(eTc,2)}</td><td class="hl">${pT}</td></tr>
      <tr><td>نصف كروي</td><td>${F(eH,2)}</td><td>${F(eHc,2)}</td><td class="hl">${pH}</td></tr>
      <tr><td>مسطح</td><td>${F(eF,1)}</td><td>${F(eFc,1)}</td><td class="hl">${pF}</td></tr></table></div>
      <figure><svg data-bars></svg></figure>
      <p class="muted" style="font-size:13px">التقريب العملي: لأقرب لوح للأعلى. والكتاب قرّب المسطح 90.2 → 90.</p>`;
    return {html:h, res:{Pi,f,J,eC,pC,eE,pE,Cs,eT,eF,pF,eH}, bars:[
      {label:'جسم',v:pC,text:pC+' mm',color:'var(--cyan)'},{label:'نصف كروي',v:pH,text:pH+' mm',color:'var(--violet)'},
      {label:'بيضوي',v:pE,text:pE+' mm',color:'var(--green)'},{label:'تورِي',v:pT,text:pT+' mm',color:'var(--amber)'},{label:'مسطح',v:pF,text:pF+' mm',color:'var(--red)'}]};
};

})();
