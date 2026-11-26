/* ===== calculation engine: worked examples, calculators, practice ===== */
(function(){
const ED = window.ED; ED.onView = ED.onView || {};
const F = (x,d=2)=> (x==null||!isFinite(x)) ? '—' : (+x.toFixed(d)).toString();
const lg = Math.log10;
const rnd=(a,b,d=0)=>{ const v=a+Math.random()*(b-a); return +v.toFixed(d); };
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- classification ---------- */
const CL = ED.CL = {
  kw(k){ if(k>=12.15&&k<=12.9) return ['par','Paraffinic (light) based','بارافيني (خفيف)'];
    if(k>=11.5&&k<=12.1) return ['mix','Mixed (intermediate) based','مختلط (متوسط)'];
    if(k>=10.5&&k<=11.45) return ['nap','Naphthenic (asphaltic / heavy) based','نفثيني (أسفلتي / ثقيل)'];
    if(k>12.1&&k<12.15) return ['par','between mixed and paraffinic → closest: paraffinic','بين المختلط والبارافيني (أقرب للبارافيني)'];
    if(k>11.45&&k<11.5) return ['mix','between naphthenic and mixed → closest: mixed','بين النفثيني والمختلط (أقرب للمختلط)'];
    return k>12.9 ? ['par','above paraffinic range → highly paraffinic','فوق مدى البارافيني (بارافيني جداً)'] : ['nap','below naphthenic range → highly naphthenic','تحت مدى النفثيني (نفثيني جداً)']; },
  apiAtm(a){ return a>40?['par','Paraffinic (light)','بارافيني (خفيف)']:a>=33?['mix','Mixed (intermediate)','مختلط (متوسط)']:['nap','Naphthenic (heavy)','نفثيني (ثقيل)']; },
  apiVac(a){ return a>30?['par','Paraffinic (light)','بارافيني (خفيف)']:a>=20?['mix','Mixed (intermediate)','مختلط (متوسط)']:['nap','Naphthenic (heavy)','نفثيني (ثقيل)']; },
  sul(s){ return s<0.5?['sw','Sweet crude oil','نفط حلو']:s<=2.5?['mid','Intermediate','متوسط']:['so','Sour crude oil','نفط حامض']; },
  ci(c){ if(Math.abs(c)<0.5) return ['par','Normal paraffinic based','بارافيني عادي'];
    if(c<0) return ['par','≈ 0 → normal paraffinic','قريب من الصفر: بارافيني عادي'];
    if(c<=15) return ['par','Predominance of n-paraffinic','غالبيته بارافينات عادية'];
    if(c<=50) return ['mix','Paraffinic and aromatic mixture','خليط بارافيني وأروماتي'];
    if(c<99.5) return ['nap','Predominance of aromatic','غالبيته أروماتي'];
    return ['nap','≈ 100 → benzene (aromatic)','≈ 100: بنزين (أروماتي)']; }
};
const verdict = c => `<div class="verdict"><span class="tag t-${c[0]==='par'?'giv':c[0]==='mix'?'key':'mem'}">${c[2]}</span><span class="en muted">${c[1]}</span></div>`;

/* ---------- specs ---------- */
const S = ED.SPECS = {};

S.temp = { title:'تحويل الحرارة', fields:[['v','الحرارة',100],['u','من وحدة','C',['C','F','K','R']]],
  gen:()=>({v:rnd(20,400),u:pick(['C','F'])}), ask:'الحرارة بالرانكن °R', key:r=>r.R,
  run(i){ const C = i.u==='C'?i.v: i.u==='F'?(i.v-32)/1.8 : i.u==='K'? i.v-273.15 : (i.v-459.67-32)/1.8;
    const Fh=C*1.8+32, K=C+273.15, R=Fh+459.67;
    return {res:{R}, steps:[
      ['حوّل لسيليزي أولاً (إذا مو سيليزي)', [`C=${F(C,2)}\\ ^\\circ\\text{C}`], 'السيليزي هو «المحطة المركزية»: منه تروح لأي وحدة بقانون واحد.'],
      ['من السيليزي لكل الوحدات', [`\\begin{aligned}F&=C\\times1.8+32=${F(Fh,2)}\\ ^\\circ\\text{F}\\\\K&=C+273.15=${F(K,2)}\\ \\text{K}\\\\R&=C\\times1.8+32+459.67=${F(R,2)}\\ ^\\circ\\text{R}\\end{aligned}`], 'الرانكن = فهرنهايت + 459.67، مثل ما الكلفن = سيليزي + 273.15.']
    ], final:`<div class="bigres"><b>${F(R,2)} °R</b><span class="muted">= ${F(K,2)} K = ${F(Fh,2)} °F</span></div>`}; } };

S.kw = { title:'عامل واتسون Kw', fields:[['u','وحدة الحرارة','F',['F','C']],['t10','T10',250],['t20','T20',300],['t30','T30',345],['t40','T40',390],['t50','T50',440],['t60','T60',490],['t70','T70',545],['t80','T80',600],['t90','T90',660],['sg','Sp.Gr 60/60',0.82]],
  gen(){ const s=rnd(180,320), step=rnd(35,60); const o={u:'F',sg:rnd(0.78,0.95,3)}; [10,20,30,40,50,60,70,80,90].forEach((p,k)=>o['t'+p]=Math.round(s+step*k+rnd(-6,6))); return o; },
  ask:'قيمة Kw', key:r=>r.kw,
  run(i){ let T=[10,20,30,40,50,60,70,80,90].map(p=>+i['t'+p]); const st=[];
    if(i.u==='C'){ const Tf=T.map(c=>c*1.8+32); st.push(['حوّل حرارات التقطير لفهرنهايت',[`F=C\\times1.8+32`],`الملزمة تشتغل بالفهرنهايت وبعدها الرانكن. الحرارات صارت: <span class="en">${Tf.map(x=>F(x,1)).join(', ')}</span> °F`]); T=Tf; }
    const tav=T.reduce((a,b)=>a+b,0)/9, dt=(T[8]-T[0])/80, tb=tav-dt, R=tb+459.67, kw=Math.cbrt(R)/i.sg, c=CL.kw(kw);
    st.push(['معدل الحرارة الحجمي T<sub>av, volume</sub>',[`\\begin{aligned}T_{av,vol}&=\\frac{T_{10}+T_{20}+\\dots+T_{90}}{9}\\\\&=\\frac{${F(T.reduce((a,b)=>a+b,0),2)}}{9}=${F(tav,2)}\\ ^\\circ\\text{F}\\end{aligned}`],'نجمع الحرارات التسع (من 10% لـ 90%) ونقسم على 9. ما نحسب IBP ولا FBP.']);
    st.push(['ميل منحني التقطير Δt',[`\\begin{aligned}\\Delta t&=\\frac{T_{90}-T_{10}}{90-10}=\\frac{${F(T[8],2)}-${F(T[0],2)}}{80}\\\\&=${F(dt,4)}\\end{aligned}`],'Δt هو «عامل التصحيح»: ميل المنحني بين 10% و 90%.']);
    st.push(['معدل درجة الغليان T<sub>av, bo.po.</sub>',[`\\begin{aligned}T_{av.bo.po.}&=T_{av,vol}-\\Delta t\\\\&=${F(tav,2)}-${F(dt,4)}=${F(tb,2)}\\ ^\\circ\\text{F}\\end{aligned}`],'نطرح التصحيح من المعدل الحجمي حتى نوصل لمعدل درجة الغليان.']);
    st.push(['حوّل للرانكن',[`T=${F(tb,2)}+459.67=${F(R,2)}\\ ^\\circ\\text{R}`],'قانون واتسون يشتغل <b>بالرانكن</b> بس. هذا أكثر فخ يضيّع الدرجة.']);
    st.push(['عوّض بقانون واتسون',[`\\begin{aligned}K_w&=\\frac{\\sqrt[3]{T_{av.bo.po.}}}{Sp.Gr_{60/60}}=\\frac{\\sqrt[3]{${F(R,2)}}}{${i.sg}}\\\\&=\\frac{${F(Math.cbrt(R),4)}}{${i.sg}}=${F(kw,2)}\\end{aligned}`],'جذر تكعيبي للحرارة المطلقة، تقسيم الوزن النوعي.']);
    st.push(['صنّف',[],`حسب جدول التصنيف بالشيت: Kw = ${F(kw,2)}`+verdict(c)]);
    return {res:{kw,tav,dt,tb,R}, steps:st, final:`<div class="bigres"><b>K<sub>w</sub> = ${F(kw,2)}</b></div>`+verdict(c)}; } };

S.api = { title:'جاذبية API', fields:[['sg','Sp.Gr 60/60',0.85]],
  gen:()=>({sg:rnd(0.75,0.98,3)}), ask:'قيمة API', key:r=>r.api,
  run(i){ const api=141.5/i.sg-131.5, a=CL.apiAtm(api), v=CL.apiVac(api);
    return {res:{api}, steps:[
      ['عوّض بقانون API',[`\\begin{aligned}API&=\\frac{141.5}{Sp.Gr_{60/60}}-131.5\\\\&=\\frac{141.5}{${i.sg}}-131.5=${F(141.5/i.sg,3)}-131.5\\\\&=${F(api,2)}\\end{aligned}`],'العلاقة عكسية: كل ما يقل الوزن النوعي (نفط أخف) يزيد API.'],
      ['صنّف عند الضغط الجوي (1 atm)',[],'الحدود: أكثر من 40 بارافيني · 33–40 مختلط · أقل من 33 نفثيني'+verdict(a)],
      ['صنّف عند ضغط مخلخل (40 mmHg)',[],'الحدود تنزل 10: أكثر من 30 بارافيني · 20–30 مختلط · أقل من 20 نفثيني'+verdict(v)]
    ], final:`<div class="bigres"><b>API = ${F(api,2)}</b></div>`}; } };

S.ci = { title:'معامل الارتباط C.I.', fields:[['t','T av.bo.po.',500],['u','وحدتها','K',['K','C','F','R']],['sg','Sp.Gr 60/60',0.82]],
  gen:()=>({t:rnd(380,700),u:pick(['K','C','F']),sg:rnd(0.75,0.95,3)}), ask:'قيمة C.I.', key:r=>r.ci,
  run(i){ const K = i.u==='K'?i.t: i.u==='C'?i.t+273.15: i.u==='F'?(i.t-32)/1.8+273.15 : (i.t-459.67-32)/1.8+273.15;
    const ci=48640/K+473.3*i.sg-456.8, c=CL.ci(ci); const st=[];
    if(i.u!=='K') st.push(['حوّل الحرارة للكلفن',[`T=${F(K,2)}\\ \\text{K}`],'قانون C.I. يشتغل <b>بالكلفن</b> (مو رانكن مثل واتسون).']);
    st.push(['عوّض (القانون #10 بالشيت)',[`\\begin{aligned}C.I.&=\\frac{48640}{T}+473.3\\,(SG)-456.8\\\\&=\\frac{48640}{${F(K,2)}}+473.3(${i.sg})-456.8\\\\&=${F(48640/K,2)}+${F(473.3*i.sg,2)}-456.8\\\\&=${F(ci,2)}\\end{aligned}`],'ثلاث حدود: قسمة، ضرب، طرح. احسب كل حد لحاله.']);
    st.push(['صنّف',[],'0 بارافيني عادي · 0–15 غالبيته بارافين عادي · 15–50 خليط · أكثر من 50 أروماتي · 100 بنزين'+verdict(c)]);
    return {res:{ci}, steps:st, final:`<div class="bigres"><b>C.I. = ${F(ci,2)}</b></div>`+verdict(c)}; } };

S.sgt = { title:'الوزن النوعي عند أي حرارة', fields:[['sg','SG (60/60 °F)',0.876],['g','γ',0.0006],['t','T',200],['u','وحدتها','F',['F','C']]],
  gen:()=>({sg:rnd(0.78,0.95,3),g:rnd(0.00052,0.00089,5),t:rnd(80,300),u:pick(['F','C'])}), ask:'SG عند T', key:r=>r.sgT,
  run(i){ const Tf = i.u==='F'?i.t:i.t*1.8+32; const sgT=i.sg-i.g*(Tf-60); const st=[];
    if(i.u==='C') st.push(['حوّل الحرارة لفهرنهايت',[`T=${i.t}\\times1.8+32=${F(Tf,2)}\\ ^\\circ\\text{F}`],'القانون مكتوب بالفهرنهايت لأن الحرارة القياسية 60 °F.']);
    st.push(['عوّض بقانون التمدد الحراري',[`\\begin{aligned}SG_{T}&=SG_{60/60}-\\gamma\\,(T-60)\\\\&=${i.sg}-${i.g}\\,(${F(Tf,2)}-60)\\\\&=${F(sgT,4)}\\end{aligned}`],'الحرارة تمدد النفط فتقل كثافته، لهذا نطرح. γ بين 0.000517 و 0.000897.']);
    return {res:{sgT}, steps:st, final:`<div class="bigres"><b>SG = ${F(sgT,4)}</b><span class="muted">عند ${F(Tf,1)} °F</span></div>`}; } };

S.visc = { title:'اللزوجة من مقياس U-tube', fields:[['c','c (mm²/s²)',0.04],['t','t (s)',350],['rho','ρ (g/cm³)',0.85]],
  gen:()=>({c:rnd(0.01,0.1,3),t:rnd(120,600),rho:rnd(0.78,0.95,3)}), ask:'ν بالسنتي ستوك cSt', key:r=>r.cst,
  run(i){ const cst=i.c*i.t, st_=cst/100, mu=st_*i.rho;
    return {res:{cst}, steps:[
      ['اللزوجة الكينماتيكية',[`\\nu=c\\cdot t=${i.c}\\times${i.t}=${F(cst,3)}\\ \\text{mm}^2/\\text{s}=${F(cst,3)}\\ \\text{cSt}`],'1 mm²/s = 1 cSt (سنتي ستوك).'],
      ['حوّل للستوك',[`\\nu=\\frac{${F(cst,3)}}{100}=${F(st_,5)}\\ \\text{St}\\ (\\text{cm}^2/\\text{s})`],'1 St = 100 cSt.'],
      ['اللزوجة الديناميكية',[`\\begin{aligned}\\nu&=\\frac{\\mu}{\\rho}\\Rightarrow\\mu=\\nu\\,\\rho\\\\&=${F(st_,5)}\\times${i.rho}=${F(mu,5)}\\ \\text{P}=${F(mu*100,3)}\\ \\text{cP}\\end{aligned}`],'St × g/cm³ = g/(cm·s) = poise.']
    ], final:`<div class="bigres"><b>ν = ${F(cst,3)} cSt</b><span class="muted">μ = ${F(mu*100,3)} cP</span></div>`}; } };

S.interp = { title:'الاستيفاء من جدول L و H', fields:[['y1','Y₁',20.4],['l1','L₁',510.8],['h1','H₁',236.4],['y2','Y₂',20.6],['l2','L₂',519.9],['h2','H₂',240.1],['y','Y (قيمتك)',20.5]],
  gen(){ const y1=rnd(8,60,1), y2=+(y1+0.2).toFixed(1), l1=rnd(100,2000,1), h1=+(l1*rnd(0.4,0.6,2)).toFixed(1); return {y1,l1,h1,y2,l2:+(l1*1.018).toFixed(1),h2:+(h1*1.016).toFixed(1),y:+(y1+0.1).toFixed(2)}; },
  ask:'قيمة L', key:r=>r.L,
  run(i){ const f=(i.y-i.y1)/(i.y2-i.y1), L=i.l1+f*(i.l2-i.l1), H=i.h1+f*(i.h2-i.h1);
    return {res:{L,H}, steps:[
      ['حدد الصفين اللي قيمتك بيناتهم',[`Y_1=${i.y1}<Y=${i.y}<Y_2=${i.y2}`],'دوّر بعمود Y (اللزوجة عند 100 °C) على أقرب قيمتين.'],
      ['احسب «نسبة المسافة» f',[`f=\\frac{Y-Y_1}{Y_2-Y_1}=\\frac{${i.y}-${i.y1}}{${i.y2}-${i.y1}}=${F(f,4)}`],'شكد قيمتك قريبة من الصف الأول؟ 0.5 يعني بالنص بالضبط.'],
      ['استوفِ L و H',[`\\begin{aligned}L&=L_1+f\\,(L_2-L_1)\\\\&=${i.l1}+${F(f,4)}(${i.l2}-${i.l1})\\\\&=${F(L,2)}\\end{aligned}`,`\\begin{aligned}H&=H_1+f\\,(H_2-H_1)\\\\&=${i.h1}+${F(f,4)}(${i.h2}-${i.h1})\\\\&=${F(H,2)}\\end{aligned}`],'نفس النسبة نطبقها على L وعلى H.']
    ], final:`<div class="bigres"><b>L = ${F(L,2)}</b><b>H = ${F(H,2)}</b></div>`}; } };

S.vi = { title:'مؤشر اللزوجة VI', fields:[['y','Y (cSt @100°C)',20.5],['u','U (cSt @40°C)',300],['l','L (من الجدول، فارغ إذا Y>70)',515.35],['h','H (من الجدول، فارغ إذا Y>70)',238.25]],
  gen(){ const y=pick([rnd(72,95,1),rnd(72,95,1),rnd(8,60,1)]); let l='',h='';
    const Lf=0.8353*y*y+14.67*y-216.25, Hf=0.1684*y*y+11.85*y-96.95;
    if(y<=70){ l=+(Lf*rnd(0.95,1.05,3)).toFixed(1); h=+(Hf*rnd(0.95,1.05,3)).toFixed(1); }
    const LL=l||Lf, HH=h||Hf; const u=pick([+(HH+(LL-HH)*rnd(0.1,0.9,2)).toFixed(1), +(HH*rnd(0.85,0.97,3)).toFixed(1)]); return {y,u,l,h}; },
  ask:'قيمة VI', key:r=>r.vi,
  run(i){ const st=[]; let L=+i.l, H=+i.h;
    if(i.y>70 || !(L>0) || !(H>0)){ L=0.8353*i.y*i.y+14.67*i.y-216.25; H=0.1684*i.y*i.y+11.85*i.y-96.95;
      st.push(['L و H من القوانين (#3 و #4 بالشيت)',[`\\begin{aligned}L&=0.8353Y^2+14.67Y-216.25\\\\&=0.8353(${i.y})^2+14.67(${i.y})-216.25\\\\&=${F(L,2)}\\end{aligned}`,`\\begin{aligned}H&=0.1684Y^2+11.85Y-96.95\\\\&=0.1684(${i.y})^2+11.85(${i.y})-96.95\\\\&=${F(H,2)}\\end{aligned}`], i.y>70?'Y أكبر من 70 cSt، فما نستخدم الجدول بل القوانين.':'ما دخلت L و H، فاستخدمنا القوانين كتقريب. بالامتحان خذهن من الجدول إذا Y ≤ 70.']); }
    else st.push(['L و H من الجدول',[`L=${L},\\quad H=${H}`],'Y ≤ 70، فناخذهن من جدول ASTM D2270 (وإذا بين صفين نستوفي).']);
    let vi;
    if(i.u>=H){ vi=(L-i.u)/(L-H)*100;
      st.push(['حدد الحالة',[`U=${i.u}\\ \\ge\\ H=${F(H,2)}`],'U أكبر من H، يعني الزيت «أسوأ» من زيت الـ 100، فـ VI بين 0 و 100 ← القانون #1.']);
      st.push(['عوّض بالقانون #1',[`\\begin{aligned}VI&=\\frac{L-U}{L-H}\\times100\\\\&=\\frac{${F(L,2)}-${i.u}}{${F(L,2)}-${F(H,2)}}\\times100=${F(vi,2)}\\end{aligned}`],'البسط: شكد زيتك أحسن من زيت الصفر. المقام: الفرق الكامل بين زيت الصفر وزيت المية.']);
    } else { const N=(lg(H)-lg(i.u))/lg(i.y); vi=(Math.pow(10,N)-1)/0.00715+100;
      st.push(['حدد الحالة',[`U=${i.u}\\ <\\ H=${F(H,2)}`],'U أصغر من H، يعني الزيت أحسن من زيت الـ 100، فـ VI أكبر من 100 ← القانون #2.']);
      st.push(['احسب N',[`\\begin{aligned}N&=\\frac{\\log H-\\log U}{\\log Y}=\\frac{${F(lg(H),5)}-${F(lg(i.u),5)}}{${F(lg(i.y),5)}}\\\\&=${F(N,5)}\\end{aligned}`],'احتفظ بـ 5 مراتب عشرية، لأن N رقم صغير وأي تقريب يأثر.']);
      st.push(['احسب VI',[`\\begin{aligned}VI&=\\frac{\\text{antilog}\\,N-1}{0.00715}+100\\\\&=\\frac{10^{${F(N,5)}}-1}{0.00715}+100\\\\&=\\frac{${F(Math.pow(10,N),5)}-1}{0.00715}+100\\\\&=${F(vi,2)}\\end{aligned}`],'antilog N = 10<sup>N</sup> (زر 10ˣ بالحاسبة).']); }
    st.push(['فسّر',[],vi>=100?'VI عالي: اللزوجة تتغير قليل مع الحرارة، وهذا صفة الزيوت البارافينية (الأحسن).':vi<=0?'VI واطي جداً: صفة الزيوت النفثينية.':`VI = ${F(vi,1)}: كل ما يقرب من 100 يصير الزيت أحسن وأقرب للبارافيني.`]);
    return {res:{vi,L,H}, steps:st, final:`<div class="bigres"><b>VI = ${F(vi,2)}</b></div>`}; } };

S.tp = { title:'نقطة الانسكاب Tp', fields:[['sg','SG',0.85],['m','M (وزن جزيئي)',300],['v','ν38 (cSt)',25]],
  gen:()=>({sg:rnd(0.7,0.95,2),m:rnd(150,450),v:rnd(5,40)}), ask:'Tp بالكلفن', key:r=>r.tp,
  run(i){ const e1=0.61-0.47*i.sg, e2=0.31-0.33*i.sg, a=Math.pow(i.sg,2.97), b=Math.pow(i.m,e1), c=Math.pow(i.v,e2), tp=130.47*a*b*c;
    return {res:{tp}, steps:[
      ['احسب الأسين أولاً',[`\\begin{aligned}0.61-0.47SG&=0.61-0.47(${i.sg})\\\\&=${F(e1,4)}\\\\0.31-0.33SG&=0.31-0.33(${i.sg})\\\\&=${F(e2,4)}\\end{aligned}`],'أصعب جزء بالقانون هو الأسس، فاحسبها لحالها قبل لا تبدي.'],
      ['احسب الأقواس الثلاثة',[`\\begin{aligned}SG^{2.97}&=${i.sg}^{2.97}=${F(a,4)}\\\\M^{${F(e1,4)}}&=${i.m}^{${F(e1,4)}}=${F(b,4)}\\\\\\nu^{${F(e2,4)}}&=${i.v}^{${F(e2,4)}}=${F(c,4)}\\end{aligned}`],'استخدم زر xʸ بالحاسبة لكل قوس.'],
      ['اضرب (القانون #5)',[`\\begin{aligned}T_p&=130.47\\times${F(a,4)}\\times${F(b,4)}\\times${F(c,4)}\\\\&=${F(tp,2)}\\ \\text{K}=${F(tp-273.15,2)}\\ ^\\circ\\text{C}\\end{aligned}`],'الناتج بالكلفن مباشرة.']
    ], final:`<div class="bigres"><b>T<sub>p</sub> = ${F(tp,2)} K</b><span class="muted">= ${F(tp-273.15,2)} °C</span></div>`}; } };

S.tf = { title:'نقطة الوميض TF', fields:[['p','P vap @37.8°C (bar)',0.05]],
  gen:()=>({p:rnd(0.005,0.6,3)}), ask:'TF بالكلفن', key:r=>r.tf,
  run(i){ const tf=231.2-40*lg(i.p);
    return {res:{tf}, steps:[
      ['عوّض (القانون #6)',[`\\begin{aligned}T_F&=231.2-40\\log P^{vap}\\\\&=231.2-40\\log(${i.p})\\\\&=231.2-40(${F(lg(i.p),4)})\\\\&=${F(tf,2)}\\ \\text{K}\\end{aligned}`],'ضغط البخار بالبار عند 37.8 °C (100 °F). الـ log سالب لأن P أقل من 1، فالطرح يصير جمع.'],
      ['حوّل إذا مطلوب',[`T_F=${F(tf,2)}-273.15=${F(tf-273.15,2)}\\ ^\\circ\\text{C}`],'كل ما يزيد ضغط البخار (مادة متطايرة) تقل نقطة الوميض، فتصير أخطر.']
    ], final:`<div class="bigres"><b>T<sub>F</sub> = ${F(tf,2)} K</b><span class="muted">= ${F(tf-273.15,2)} °C</span></div>`}; } };

S.arom = { title:'نسبة الأروماتيات %A', fields:[['sg','SG',0.80],['ap','AP (°C)',65]],
  gen(){ for(let k=0;k<200;k++){ const sg=rnd(0.75,0.95,3), ap=rnd(30,85,1), A=692.4+12.15*sg*ap-794*sg-10.4*ap; if(A>3&&A<60) return {sg,ap}; } return {sg:0.8,ap:65}; }, ask:'%A', key:r=>r.a,
  run(i){ const t1=12.15*i.sg*i.ap, t2=794*i.sg, t3=10.4*i.ap, a=692.4+t1-t2-t3;
    return {res:{a}, steps:[
      ['احسب كل حد لحاله',[`\\begin{aligned}12.15(SG)(AP)&=12.15(${i.sg})(${i.ap})=${F(t1,2)}\\\\794(SG)&=794(${i.sg})=${F(t2,2)}\\\\10.4(AP)&=10.4(${i.ap})=${F(t3,2)}\\end{aligned}`],'AP بالسيليزي كما هو، بدون تحويل.'],
      ['اجمع (القانون #7)',[`\\begin{aligned}\\%A&=692.4+${F(t1,2)}-${F(t2,2)}-${F(t3,2)}\\\\&=${F(a,2)}\\%\\end{aligned}`],'نقطة أنيلين عالية تعني أروماتيات أقل (والبارافين أكثر).']
    ], final:`<div class="bigres"><b>%A = ${F(a,2)}%</b></div>`}; } };

S.di = { title:'مؤشر الديزل DI', fields:[['api','API',40],['ap','AP (°C)',65]],
  gen:()=>({api:rnd(25,50,1),ap:rnd(40,90,1)}), ask:'DI', key:r=>r.di,
  run(i){ const apf=1.8*i.ap+32, di=i.api*apf/100;
    return {res:{di}, steps:[
      ['حوّل نقطة الأنيلين داخل القانون',[`1.8\\,AP+32=1.8(${i.ap})+32=${F(apf,2)}`],'هذا الجزء هو نقطة الأنيلين بالفهرنهايت. القانون يحوّلها إلك.'],
      ['عوّض (القانون #8)',[`\\begin{aligned}DI&=\\frac{API\\times(1.8AP+32)}{100}\\\\&=\\frac{${i.api}\\times${F(apf,2)}}{100}=${F(di,2)}\\end{aligned}`],'DI أعلى يعني ديزل أحسن (يشتعل ذاتياً بسهولة).']
    ], final:`<div class="bigres"><b>DI = ${F(di,2)}</b></div>`}; } };

S.sph = { title:'الحرارة النوعية', fields:[['sg','SG (60/60 °F)',0.80],['t','T (°C)',100]],
  gen:()=>({sg:rnd(0.7,0.95,3),t:rnd(20,300)}), ask:'Sp.heat (kJ/kg·°C)', key:r=>r.cp,
  run(i){ const cp=(0.4024+0.00081*i.t)/i.sg;
    return {res:{cp}, steps:[
      ['عوّض (القانون #9)',[`\\begin{aligned}Sp.heat&=\\frac{1}{SG}(0.4024+0.00081\\,T)\\\\&=\\frac{0.4024+0.00081\\times${i.t}}{${i.sg}}\\\\&=\\frac{${F(0.4024+0.00081*i.t,5)}}{${i.sg}}=${F(cp,4)}\\end{aligned}`],'T بالسيليزي. لاحظ: الأخف (SG أقل) حرارته النوعية أعلى.']
    ], final:`<div class="bigres"><b>${F(cp,4)}</b><span class="muted">kJ/kg·°C</span></div>`}; } };

/* ---------- render ---------- */
const ALL_FIELD = (f,v)=>{ const [k,l,def,opts]=f; const val = v!==undefined?v:def;
  if(opts) return `<label><span>${l}</span><select data-k="${k}">${opts.map(o=>`<option value="${o}"${o==val?' selected':''}>°${o==='K'?'':''}${o}</option>`).join('').replace(/°K/g,'K')}</select></label>`;
  return `<label><span>${l}</span><input type="number" step="any" inputmode="decimal" data-k="${k}" value="${val}"></label>`; };
function stepsHTML(r){ return '<div class="steps">'+r.steps.map(([t,texs,why])=>`<div class="step"><h4>${t}</h4>${texs.map(x=>`<div class="eq">${ED.tex(x)}</div>`).join('')}${why?`<div class="why">${texs.length?'<b class="q">ليش؟</b> ':''}${why}</div>`:''}</div>`).join('')+'</div>'; }
const read = (box,spec)=>{ const i={}; spec.fields.forEach(f=>{ const el=box.querySelector(`[data-k="${f[0]}"]`); i[f[0]] = f[3]? el.value : (el.value===''?'':+el.value); }); return i; };
ED.stepsHTML = stepsHTML;

function mountSolver(box){
  const spec=S[box.dataset.solver]; if(!spec) return;
  box.innerHTML = `<div class="form">${spec.fields.map(f=>ALL_FIELD(f)).join('')}</div><div class="row" style="margin-top:12px"><button class="btn small ghost" data-reset>↺ أرقام المثال</button></div><div data-out style="margin-top:6px"></div>`;
  const run=()=>{ const i=read(box,spec); const bad=spec.fields.some(f=>!f[3] && i[f[0]]!=='' && !isFinite(i[f[0]]));
    if(bad){ box.querySelector('[data-out]').innerHTML='<div class="note trap"><span class="t"></span>دخّل أرقام صحيحة.</div>'; return; }
    const r=spec.run(i); box.querySelector('[data-out]').innerHTML=stepsHTML(r)+r.final; };
  box.addEventListener('input',run); box.addEventListener('change',run);
  box.querySelector('[data-reset]').addEventListener('click',()=>{ spec.fields.forEach(f=>{ box.querySelector(`[data-k="${f[0]}"]`).value=f[2]; }); run(); });
  run();
}
function mountWorked(box){
  const spec=S[box.dataset.worked]; if(!spec) return; const i={}; spec.fields.forEach(f=>i[f[0]]=f[2]);
  Object.assign(i, JSON.parse(box.dataset.in||'{}')); const r=spec.run(i); box.innerHTML=stepsHTML(r)+r.final;
}
ED.mountCalc = function(v){ v.querySelectorAll('[data-solver]').forEach(mountSolver); v.querySelectorAll('[data-worked]').forEach(mountWorked); v.querySelectorAll('[data-classify]').forEach(mountClassifier); v.querySelectorAll('[data-tpq]').forEach(mountTpQ); };

/* ---------- classifier gauges ---------- */
function gauge(segs,min,max,val){ const w=s=>100*(s[1]-s[0])/(max-min); const pos=Math.max(0,Math.min(100,100*(val-min)/(max-min)));
  return `<div class="gauge">${segs.map(s=>`<div class="c-${s[2]}" style="width:${w(s)}%">${s[3]}</div>`).join('')}<i class="mk" style="left:calc(${pos}% - 1.5px)"></i></div><div class="gscale"><span>${min}</span><span>${max}</span></div>`; }
function mountClassifier(box){
  box.innerHTML=`<div class="form" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr))">
   <label><span>Kw</span><input type="number" step="any" data-c="kw" value="11.8"></label>
   <label><span>API</span><input type="number" step="any" data-c="api" value="35"></label>
   <label><span>Sulfur %</span><input type="number" step="any" data-c="s" value="1.9"></label>
   <label><span>C.I.</span><input type="number" step="any" data-c="ci" value="28.6"></label></div><div data-o></div>`;
  const run=()=>{ const g=k=>+box.querySelector(`[data-c=${k}]`).value; const kw=g('kw'),api=g('api'),s=g('s'),ci=g('ci');
    box.querySelector('[data-o]').innerHTML=`
    <h3>Watson K<sub>w</sub> = ${kw}</h3>${gauge([[10.5,11.45,'nap','نفثيني'],[11.45,11.5,'gap',''],[11.5,12.1,'mix','مختلط'],[12.1,12.15,'gap',''],[12.15,12.9,'par','بارافيني']],10.5,12.9,kw)}${verdict(CL.kw(kw))}
    <h3>API = ${api} · عند 1 atm</h3>${gauge([[10,33,'nap','نفثيني'],[33,40,'mix','مختلط'],[40,55,'par','بارافيني']],10,55,api)}${verdict(CL.apiAtm(api))}
    <h3>API = ${api} · عند 40 mmHg</h3>${gauge([[10,20,'nap','نفثيني'],[20,30,'mix','مختلط'],[30,55,'par','بارافيني']],10,55,api)}${verdict(CL.apiVac(api))}
    <h3>الكبريت = ${s}%</h3>${gauge([[0,0.5,'sw','حلو'],[0.5,2.5,'mid','متوسط'],[2.5,5,'so','حامض']],0,5,s)}${verdict(CL.sul(s))}
    <h3>C.I. = ${ci}</h3>${gauge([[0,15,'par','n-P'],[15,50,'mix','خليط'],[50,100,'nap','أروماتي']],0,100,ci)}${verdict(CL.ci(ci))}`; };
  box.addEventListener('input',run); run();
}

/* ---------- pour-point exam question (table + chart) ---------- */
function mountTpQ(box){
  const rows=[[0.47,150,10],[0.61,200,15],[0.75,250,20],[0.85,300,25],[0.97,350,30]].map(([sg,m,v])=>{ const r=S.tp.run({sg,m,v}).res.tp; return {sg,m,v,tp:r}; });
  const W=420,H=240,L=50,R=14,T=16,B=40, x=s=>L+(s-0.4)/(1.0-0.4)*(W-L-R), y=t=>H-B-(t-100)/(320-100)*(H-T-B);
  let g=''; for(let t=100;t<=320;t+=50){ g+=`<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)"/><text x="${L-6}" y="${y(t)+4}" text-anchor="end" class="lab-en">${t}</text>`; }
  for(let s=0.4;s<=1.001;s+=0.1){ g+=`<text x="${x(s)}" y="${H-B+16}" text-anchor="middle" class="lab-en">${s.toFixed(1)}</text>`; }
  const pts=rows.map(r=>`${x(r.sg)},${y(r.tp)}`).join(' ');
  box.innerHTML=`<div class="tbl-wrap"><table class="num"><tr><th>SG</th><th>M</th><th>ν38 (cSt)</th><th>0.61−0.47SG</th><th>0.31−0.33SG</th><th>T<sub>p</sub> (K)</th></tr>
   ${rows.map(r=>`<tr><td>${r.sg}</td><td>${r.m}</td><td>${r.v}</td><td>${F(0.61-0.47*r.sg,4)}</td><td>${F(0.31-0.33*r.sg,4)}</td><td><b>${F(r.tp,1)}</b></td></tr>`).join('')}</table></div>
   <figure><svg viewBox="0 0 ${W} ${H}">${g}<line x1="${L}" x2="${L}" y1="${T}" y2="${H-B}" stroke="var(--muted)"/><line x1="${L}" x2="${W-R}" y1="${H-B}" y2="${H-B}" stroke="var(--muted)"/>
   <polyline points="${pts}" fill="none" stroke="var(--cyan)" stroke-width="2.5"/>${rows.map(r=>`<circle cx="${x(r.sg)}" cy="${y(r.tp)}" r="5" fill="var(--amber)"/><text x="${x(r.sg)}" y="${y(r.tp)-10}" text-anchor="middle" class="lab-en" style="font-weight:700">${F(r.tp,0)}</text>`).join('')}
   <text x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle" class="lab-en">SG</text><text x="8" y="12" class="lab-en">Tp (K)</text></svg><figcaption>العلاقة بين T<sub>p</sub> و SG</figcaption></figure>`;
}

/* ---------- practice generator ---------- */
ED.PRACTICE = [['kw','عامل واتسون Kw'],['api','API والتصنيف'],['ci','C.I.'],['sgt','SG عند حرارة'],['visc','اللزوجة ν = c·t'],['vi','مؤشر اللزوجة VI'],['interp','الاستيفاء L و H'],['tp','نقطة الانسكاب'],['tf','نقطة الوميض'],['arom','%A أروماتيات'],['di','مؤشر الديزل'],['sph','الحرارة النوعية'],['temp','تحويل الحرارة']];
const LABEL = {C:'°C',F:'°F',K:'K',R:'°R'};
function problemText(k,i){
  const u=x=>LABEL[x]||x;
  switch(k){
    case 'kw': return `A crude oil sample (Sp.Gr 60/60 °F = <b>${i.sg}</b>) gave the following ASTM distillation data (°F):<br>10%: ${i.t10}, 20%: ${i.t20}, 30%: ${i.t30}, 40%: ${i.t40}, 50%: ${i.t50}, 60%: ${i.t60}, 70%: ${i.t70}, 80%: ${i.t80}, 90%: ${i.t90}.<br>Calculate the Watson characterization factor and classify the crude.`;
    case 'api': return `A crude oil has Sp.Gr (60/60 °F) = <b>${i.sg}</b>. Calculate its API gravity and classify it at atmospheric and vacuum (40 mmHg) pressure.`;
    case 'ci': return `Calculate the correlation index of a crude with T<sub>av.bo.po.</sub> = <b>${i.t} ${u(i.u)}</b> and Sp.Gr = <b>${i.sg}</b>, then classify it.`;
    case 'sgt': return `A petroleum fraction has SG (60/60 °F) = <b>${i.sg}</b> and γ = <b>${i.g}</b>. Find its SG at <b>${i.t} ${u(i.u)}</b>.`;
    case 'visc': return `An oil takes <b>${i.t} s</b> to pass between the marks of a U-tube viscometer of constant c = <b>${i.c} mm²/s²</b>. Its density is <b>${i.rho} g/cm³</b>. Find the kinematic and dynamic viscosity.`;
    case 'vi': return `An oil has kinematic viscosity <b>${i.y} cSt at 100 °C</b> and <b>${i.u} cSt at 40 °C</b>.${i.l!==''?` From the table: L = ${i.l}, H = ${i.h}.`:''} Calculate its viscosity index.`;
    case 'interp': return `From the ASTM D2270 table: Y = ${i.y1} → L = ${i.l1}, H = ${i.h1} ; Y = ${i.y2} → L = ${i.l2}, H = ${i.h2}. Find L and H for <b>Y = ${i.y}</b>.`;
    case 'tp': return `Estimate the pour point of a fraction with SG = <b>${i.sg}</b>, M = <b>${i.m}</b> and ν<sub>38(100)</sub> = <b>${i.v} cSt</b>.`;
    case 'tf': return `The vapour pressure of a fuel at 37.8 °C is <b>${i.p} bar</b>. Estimate its flash point.`;
    case 'arom': return `A fraction has SG = <b>${i.sg}</b> and aniline point = <b>${i.ap} °C</b>. Calculate its aromatic content.`;
    case 'di': return `A diesel fuel has API = <b>${i.api}</b> and aniline point = <b>${i.ap} °C</b>. Calculate the diesel index.`;
    case 'sph': return `Calculate the specific heat of a fraction with SG = <b>${i.sg}</b> at <b>${i.t} °C</b>.`;
    case 'temp': return `Convert <b>${i.v} ${u(i.u)}</b> to °C, °F, K and °R.`;
  }
}
ED.mountPractice = function(root){
  const chips=root.querySelector('#pg-type'), q=root.querySelector('#pg-q'), ask=root.querySelector('#pg-ask'), ans=root.querySelector('#pg-ans'), fb=root.querySelector('#pg-fb'), sol=root.querySelector('#pg-sol');
  let k='kw', cur=null, shown=0;
  chips.innerHTML=ED.PRACTICE.map(([id,n],j)=>`<button class="chip${j===0?' on':''}" data-p="${id}">${n}</button>`).join('');
  function make(){ const spec=S[k]; const i=Object.assign({}, ...spec.fields.map(f=>({[f[0]]:f[2]})), spec.gen());
    const r=spec.run(i); cur={key:spec.key(r.res)}; shown=0;
    q.innerHTML=`<div class="problem">${problemText(k,i)}</div>`; ask.innerHTML=spec.ask; ans.value=''; fb.innerHTML='';
    sol.innerHTML=stepsHTML(r)+`<div class="pg-final hide">${r.final}</div>`; paint(); }
  function paint(){ const st=[...sol.querySelectorAll('.step')]; st.forEach((x,j)=>x.classList.toggle('hide',j>=shown)); sol.querySelector('.pg-final').classList.toggle('hide',shown<st.length); }
  chips.addEventListener('click',e=>{ const b=e.target.closest('[data-p]'); if(!b) return; chips.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b)); k=b.dataset.p; make(); });
  root.querySelector('#pg-next').addEventListener('click',()=>{ shown++; paint(); });
  root.querySelector('#pg-all').addEventListener('click',()=>{ shown=99; paint(); });
  root.querySelector('#pg-new').addEventListener('click',make);
  root.querySelector('#pg-check').addEventListener('click',()=>{ const v=+ans.value; if(ans.value==='') return; const err=Math.abs(v-cur.key)/Math.max(1e-9,Math.abs(cur.key));
    fb.innerHTML= err<=0.02 ? `<div class="note aha"><span class="t">صح!</span>الجواب ${F(cur.key,3)}.</div>` : `<div class="note trap"><span class="t">مو مضبوط</span>جوابك ${v}، والصح ${F(cur.key,3)}. اكشف الخطوات وشوف وين الفرق (الوحدات؟ الحالة؟).</div>`; });
  make();
};
})();
