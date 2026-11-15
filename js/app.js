/* ===== core app ===== */
(function(){
const ED = window.ED;
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
ED.$=$; ED.$$=$$;
ED.fmt = (x,d=2)=> (x==null||!isFinite(x)) ? '—' : (+x.toFixed(d)).toString();
ED.fix = (x,d=2)=> (x==null||!isFinite(x)) ? '—' : x.toFixed(d);
ED.tex = (s,display=true)=>{ try{ return MathJax.tex2svg(s,{display}).outerHTML; }catch(e){ return '<code class="ltr">'+s+'</code>'; } };
ED.store = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
function renderMath(el){
  if (!(window.MathJax && MathJax.typesetPromise)) return Promise.resolve();
  return MathJax.typesetPromise([el]).catch(err=>console.warn('math',err));
}
ED.renderMath = renderMath;

/* ---------- views & router ---------- */
const views = {}; $$('.view').forEach(v=>views[v.dataset.view]=v);
// hide links to views that are not built yet
$$('a[href^="#"]').forEach(a=>{ const n=a.getAttribute('href').slice(1); if(n && !views[n]) a.classList.add('hide'); });
const inited = {};
ED.onView = ED.onView || {};
function route(){
  let name = (location.hash||'#home').slice(1);
  if (!views[name]) name='home';
  Object.values(views).forEach(v=>v.classList.remove('on'));
  const v = views[name]; v.classList.add('on');
  if (!inited[name]){ inited[name]=true; renderMath(v); $$('[data-quiz]',v).forEach(q=>initQuiz(q)); if (ED.onView[name]) ED.onView[name](v); }
  $$('nav.side a').forEach(a=>a.classList.toggle('active', a.dataset.nav===name));
  closeNav(); window.scrollTo(0,0);
  document.title = (v.querySelector('h1')?.textContent.replace(/\s+/g,' ').trim()||'') + ' · تصميم المعدات';
}
window.addEventListener('hashchange',route);

/* ---------- nav drawer ---------- */
const side=$('#side'), scrim=$('#scrim');
function closeNav(){ side.classList.remove('open'); scrim.classList.remove('show'); }
$('#menuBtn').addEventListener('click',()=>{ side.classList.add('open'); scrim.classList.add('show'); });
scrim.addEventListener('click',closeNav);

/* ---------- theme ---------- */
$('#themeBtn').addEventListener('click',()=>{
  const t = document.documentElement.dataset.theme==='light'?'dark':'light';
  document.documentElement.dataset.theme=t; try{localStorage.setItem('ed-theme',t);}catch(e){}
});

/* ---------- chips scroll ---------- */
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-go]'); if(!c) return;
  const t=document.getElementById(c.dataset.go); if(t){ const y=t.getBoundingClientRect().top+scrollY-74; scrollTo({top:y,behavior:'smooth'}); }
  $$('.chip',c.parentElement).forEach(x=>x.classList.toggle('on',x===c));
});

/* ---------- layers tabs ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('.ltabs button'); if(!b) return;
  const box=b.closest('.layers'); const btns=$$('.ltabs button',box); const i=btns.indexOf(b);
  btns.forEach((x,j)=>x.classList.toggle('on',j===i));
  $$('.lpanel',box).forEach((p,j)=>p.classList.toggle('on',j===i));
});

/* ---------- done / progress ---------- */
let done = ED.store.get('ed-done',{});
function paintDone(){
  const ids = $$('[data-done]').map(b=>b.dataset.done);
  $$('[data-done]').forEach(b=>{ const on=!!done[b.dataset.done]; b.classList.toggle('on',on); if(!b.dataset.label) b.dataset.label=b.textContent; b.textContent = on ? '✅ تم! (اضغط للإلغاء)' : b.dataset.label; });
  $$('[data-ok]').forEach(s=>s.textContent = done[s.dataset.ok] ? '✓' : '');
  $$('[data-road]').forEach(s=>{ const on=!!done[s.dataset.road]; s.textContent = on?'✓ خلصت':'ابدأ'; s.classList.toggle('ok',on); });
  const n = ids.filter(i=>done[i]).length; $('#progBar').style.width = (ids.length? (100*n/ids.length):0)+'%';
}
document.addEventListener('click',e=>{ const b=e.target.closest('[data-done]'); if(!b) return; done[b.dataset.done]=!done[b.dataset.done]; ED.store.set('ed-done',done); paintDone(); });

/* ---------- quiz ---------- */
function initQuiz(box){
  const set = ED.QUIZ[box.dataset.quiz]; if(!set) return;
  let i=0, score=0, answered=false;
  function draw(){
    if (i>=set.length){
      box.innerHTML = `<div class="q">النتيجة: ${score} / ${set.length} ${score===set.length?'🏆 ممتاز!':score>=set.length*0.7?'👏 زين جداً':'💪 راجع الفخاخ وعيد'}</div><div class="bar"><button class="btn small" data-act="again">↺ أعد الاختبار</button></div>`;
      return;
    }
    const it=set[i]; answered=false;
    box.innerHTML = `<div class="muted" style="font-size:13px">سؤال ${i+1} من ${set.length}</div><div class="q">${it.q}</div>
      <div class="opts">${it.o.map((o,k)=>`<button class="opt" data-k="${k}">${o}</button>`).join('')}</div>
      <div class="note aha fb"><span class="t"></span><span class="w"></span></div>
      <div class="bar"><span class="muted" style="font-size:13px">النقاط: ${score}</span><button class="btn small hide" data-act="next">التالي ←</button></div>`;
    renderMath(box);
  }
  box.addEventListener('click',e=>{
    const o=e.target.closest('.opt'); const act=e.target.closest('[data-act]');
    if (o && !answered){
      answered=true; const k=+o.dataset.k, it=set[i]; const ok=k===it.a; if(ok) score++;
      $$('.opt',box).forEach((b,j)=>{ if(j===it.a) b.classList.add('right'); else if(j===k) b.classList.add('wrong'); });
      const fb=$('.fb',box); fb.style.display='block'; fb.classList.toggle('trap',!ok); fb.classList.toggle('aha',ok);
      $('.t',fb).textContent = ok?'✅ صح!':'❌ مو هيج'; $('.w',fb).innerHTML=' '+it.why; renderMath(fb);
      $('[data-act=next]',box).classList.remove('hide');
    }
    if (act){ if(act.dataset.act==='next'){ i++; draw(); } else { i=0; score=0; draw(); } }
  });
  draw();
}

/* ---------- bar chart helper ---------- */
ED.bars = function(svg, items){
  const W=420, H=Math.max(120, 36*items.length+30), max=Math.max(...items.map(x=>x.v))||1, x0=150, w=W-x0-60;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML = items.map((it,k)=>{ const y=14+k*36, bw=Math.max(4,w*it.v/max);
    return `<text x="${x0-10}" y="${y+18}" text-anchor="end" class="lab">${it.label}</text>
      <rect x="${x0}" y="${y+4}" width="${bw}" height="22" rx="6" fill="${it.color||'var(--cyan)'}" opacity=".85"/>
      <text x="${x0+bw+6}" y="${y+20}" class="lab" style="font-family:var(--mono);font-weight:700">${it.text||it.v}</text>`; }).join('');
};

/* ---------- chapter 1 widgets ---------- */
ED.onView.ch1 = function(){
  // stress table
  const sel=$('#st-mat'), temps=$('#st-temps'), tbl=$('#st-table'), out=$('#st-out');
  sel.innerHTML = ED.STRESS.map(m=>`<option value="${m.id}">${m.ar}</option>`).join('');
  temps.innerHTML = ED.TEMP_LABELS.map((t,i)=>`<button class="chip${i===5?' on':''}" data-ti="${i}"><span class="en">${t} °C</span></button>`).join('');
  let ti=5;
  function drawT(){
    const m=sel.value;
    tbl.innerHTML = `<tr><th>Material</th><th>TS</th>${ED.TEMP_LABELS.map((t,i)=>`<th class="${i===ti?'hl':''}">${t}</th>`).join('')}</tr>` +
      ED.STRESS.map(r=>`<tr class="${r.id===m?'hlr':''}"><td style="font-size:13px;min-width:120px">${r.ar}</td><td>${r.ts}</td>${r.v.map((v,i)=>`<td class="${r.id===m&&i===ti?'hl':(i===ti||r.id===m?'hlc':'')}">${v==null?'–':v}</td>`).join('')}</tr>`).join('');
    const v=ED.STRESS.find(r=>r.id===m).v[ti];
    out.textContent = v==null ? 'خارج مدى الجدول' : `f = ${v} N/mm²`;
  }
  sel.addEventListener('change',drawT);
  temps.addEventListener('click',e=>{ const b=e.target.closest('[data-ti]'); if(!b) return; ti=+b.dataset.ti; $$('.chip',temps).forEach(x=>x.classList.toggle('on',x===b)); drawT(); });
  drawT();
  // J table
  const jt=$('#j-table'), jo=$('#j-out');
  jt.addEventListener('click',e=>{ const td=e.target.closest('[data-j]'); if(!td) return; $$('[data-j]',jt).forEach(x=>x.classList.remove('hl')); td.classList.add('hl'); jo.innerHTML=`<b>J = ${td.dataset.j}</b>. ${td.dataset.why}`; });
  $('[data-j="1.0"]',jt).classList.add('hl');
  // Cp picker
  const cc=$('#cp-chips'), csvg=$('#cp-svg'), cout=$('#cp-out');
  cc.innerHTML = ED.CP_ORDER.map(k=>`<button class="chip${k==='d'?' on':''}" data-cp="${k}">${ED.CP[k].chip}</button>`).join('');
  function drawCp(k){ const c=ED.CP[k]; csvg.innerHTML=c.svg;
    const de = c.de==='Di' ? 'D<sub>e</sub> = D<sub>i</sub> (القطر الداخلي)' : c.de==='bolt-circle' ? 'D<sub>e</sub> = قطر دائرة البراغي (bolt circle)' : 'D<sub>e</sub> = متوسط قطر الحشوة (mean gasket diameter)';
    cout.innerHTML = `<div class="res big">Cp = ${c.cp}</div><p style="margin:8px 0 4px"><b>${c.ar}</b><br><span class="en muted">${c.en}</span></p><p style="margin:4px 0">${de}</p>${c.cond?`<p class="muted" style="margin:4px 0">الشرط: ${c.cond}</p>`:''}`; }
  cc.addEventListener('click',e=>{ const b=e.target.closest('[data-cp]'); if(!b) return; $$('.chip',cc).forEach(x=>x.classList.toggle('on',x===b)); drawCp(b.dataset.cp); });
  drawCp('d');
  // balloon lab
  const P=$('#bl-P'),D=$('#bl-D'),F=$('#bl-f'),J=$('#bl-J'),eq=$('#bl-eq'),svg=$('#bl-svg');
  function drawB(){
    const p=+P.value,d=+D.value,f=+F.value,j=+J.value; const e=p*d*1000/(2*j*f-p);
    $('#bl-Pv').textContent=p.toFixed(2)+' N/mm²'; $('#bl-Dv').textContent=d.toFixed(2)+' m'; $('#bl-fv').textContent=f+' N/mm²'; $('#bl-Jv').textContent=j.toFixed(2);
    eq.innerHTML = ED.tex(`e=\\frac{${p.toFixed(2)}\\times ${(d*1000).toFixed(0)}}{2\\times${j.toFixed(2)}\\times${f}-${p.toFixed(2)}}=\\mathbf{${e.toFixed(1)}\\ mm}`);
    const R = 40+ (d-0.5)/(3.5)*55, t = Math.min(R-8, 2+e*0.55);
    const arrows = Array.from({length:8},(_,k)=>{const a=k*Math.PI/4, r1=12, r2=R-t-6, s=Math.min(1,p/2.5);
      return `<line x1="${120+r1*Math.cos(a)}" y1="${120+r1*Math.sin(a)}" x2="${120+(r1+(r2-r1)*(.45+.55*s))*Math.cos(a)}" y2="${120+(r1+(r2-r1)*(.45+.55*s))*Math.sin(a)}" stroke="var(--amber)" stroke-width="${1.5+p}" marker-end="url(#blar)"/>`;}).join('');
    svg.innerHTML = `<defs><marker id="blar" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6z" fill="var(--amber)"/></marker></defs>
      <circle cx="120" cy="120" r="${R-t/2}" fill="none" stroke="var(--cyan)" stroke-width="${t}" opacity=".85"/>
      ${arrows}<text x="120" y="232" text-anchor="middle" class="lab">e ≈ ${e.toFixed(1)} mm (مكبّر)</text>`;
  }
  [P,D,F,J].forEach(x=>x.addEventListener('input',drawB)); drawB();
};

/* ---------- boot (after all deferred scripts) ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  paintDone();
  let booted=false; const boot=()=>{ if(booted) return; booted=true; route(); };
  if (window.MathJax && MathJax.startup && MathJax.startup.promise) MathJax.startup.promise.then(boot,boot);
  setTimeout(boot,4000); // never block the page if the math library is slow
});
})();
