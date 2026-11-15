/* ===== data: tables, cases, quizzes ===== */
window.ED = window.ED || {};

/* Table 13.2 — typical design stresses for plate (N/mm2) */
ED.TEMPS = [50,100,150,200,250,300,350,400,450,500];
ED.TEMP_LABELS = ['0–50','100','150','200','250','300','350','400','450','500'];
ED.STRESS = [
  {id:'cs',  ar:'كاربون ستيل (Carbon steel)', en:'Carbon steel (semi-killed or silicon killed)', ts:360, v:[135,125,115,105,95,85,80,70,null,null]},
  {id:'cmn', ar:'كاربون-منغنيز (C-Mn steel)', en:'Carbon-manganese steel (semi-killed or silicon killed)', ts:460, v:[180,170,150,140,130,115,105,100,null,null]},
  {id:'cmo', ar:'كاربون-موليبدنيوم 0.5% Mo', en:'Carbon-molybdenum steel, 0.5 per cent Mo', ts:450, v:[180,170,145,140,130,120,110,110,null,null]},
  {id:'la',  ar:'سبيكة منخفضة (Ni, Cr, Mo, V)', en:'Low alloy steel (Ni, Cr, Mo, V)', ts:550, v:[240,240,240,240,240,235,230,220,190,170]},
  {id:'304', ar:'ستانلس 304 (18Cr/8Ni unstabilised)', en:'Stainless steel 18Cr/8Ni unstabilised (304)', ts:510, v:[165,145,130,115,110,105,100,100,95,90]},
  {id:'321', ar:'ستانلس 321 (Ti stabilised)', en:'Stainless steel 18Cr/8Ni Ti stabilised (321)', ts:540, v:[165,150,140,135,130,130,125,120,120,115]},
  {id:'316', ar:'ستانلس 316 (Mo 2½%)', en:'Stainless steel 18Cr/8Ni Mo 2½ per cent (316)', ts:520, v:[175,150,135,120,115,110,105,105,100,95]}
];
/* returns {f, note, exact, idx} */
ED.stressAt = function(matId, T){
  const m = ED.STRESS.find(x=>x.id===matId) || ED.STRESS[0];
  const t = ED.TEMPS;
  if (T <= 50) return {f:m.v[0], exact:true, idx:0, note:'عمود 0–50'};
  for (let i=0;i<t.length;i++){
    if (T===t[i]) { if(m.v[i]==null) return {f:null,note:'خارج مدى الجدول لهذي المادة'}; return {f:m.v[i],exact:true,idx:i,note:'عمود '+ED.TEMP_LABELS[i]}; }
    if (i>0 && T>t[i-1] && T<t[i]){
      if (m.v[i]==null||m.v[i-1]==null) return {f:null,note:'خارج مدى الجدول لهذي المادة'};
      const f = m.v[i-1] + (m.v[i]-m.v[i-1])*(T-t[i-1])/(t[i]-t[i-1]);
      return {f:Math.round(f*10)/10, exact:false, idx:i, lo:i-1, note:'بين عمودين، فاستخدمنا استيفاء خطي بين '+t[i-1]+' و '+t[i]};
    }
  }
  return {f:null,note:'أعلى من 500 °C: خارج الجدول'};
};

/* Table 13.3 — joint efficiency [jointType][radiography] */
ED.JTAB = [[1.0,0.85,0.7],[0.9,0.80,0.65]];
ED.JOINT_NAMES = ['Double-welded butt','Single-weld butt + bonding strips'];
ED.RAD_NAMES = ['100% radiography','spot radiography','no radiography'];

/* Minimum practical wall thickness (incl. 2 mm CA) */
ED.minThk = function(Dm){
  if (Dm<=1) return 5; if (Dm<=2) return 7; if (Dm<=2.5) return 9; if (Dm<=3) return 10; if (Dm<=3.5) return 12; return null;
};

/* Flat-end cases — Figure 13.9 */
const CL = '<line x1="205" y1="10" x2="205" y2="148" stroke="var(--muted)" stroke-dasharray="6 4"/><text x="196" y="146" font-size="11" fill="var(--muted)">℄</text>';
ED.CP = {
  a:{key:'a', chip:'(a) مشفّه فقط', cp:0.45, de:'Di', en:'Flanged-only end',
     ar:'طرف مشفّه (اللوح نفسه منحني وملتحم بالجسم بانحناءة)', cond:'للأقطار أقل من 0.6 m، ونصف قطر الزاوية ≥ 0.25e',
     svg: CL+'<path d="M32,148 V62 Q32,38 56,38 H205" stroke="var(--amber)" stroke-width="12" fill="none"/><text x="120" y="26" font-size="13" fill="var(--text)">e</text><line x1="110" y1="32" x2="110" y2="44" stroke="var(--text)"/><text x="60" y="100" font-size="12" fill="var(--muted)">shell</text><text x="96" y="78" font-size="13" fill="var(--cyan)">De = Di</text>'},
  bc:{key:'bc', chip:'(b,c) ملحوم', cp:0.55, de:'Di', en:'Plate welded to the shell',
     ar:'لوح ملحوم بنهاية الجسم بلحام زاوية (fillet) 45° وعمقه = سُمك اللوح', cond:'',
     svg: CL+'<rect x="26" y="52" width="12" height="96" fill="var(--cyan)" opacity=".8"/><rect x="14" y="34" width="191" height="18" fill="var(--amber)"/><path d="M38,52 L38,66 L52,52 Z" fill="var(--red)"/><text x="58" y="72" font-size="11" fill="var(--red)">fillet 45°</text><text x="96" y="100" font-size="13" fill="var(--cyan)">De = Di</text>'},
  d:{key:'d', chip:'(d) براغي + حشوة كاملة', cp:0.4, de:'bolt-circle', en:'Bolted cover, full-face gasket',
     ar:'غطاء مربوط ببراغي، والحشوة تغطي وجه الفلنج كله', cond:'',
     svg: CL+'<rect x="34" y="64" width="12" height="84" fill="var(--cyan)" opacity=".8"/><rect x="4" y="52" width="42" height="12" fill="var(--cyan)" opacity=".8"/><rect x="4" y="47" width="42" height="5" fill="var(--muted)"/><rect x="4" y="29" width="201" height="18" fill="var(--amber)"/><rect x="16" y="20" width="5" height="52" fill="var(--text)"/><line x1="18" y1="90" x2="18" y2="110" stroke="var(--text)"/><text x="24" y="122" font-size="12" fill="var(--text)">bolt</text><text x="84" y="100" font-size="12" fill="var(--cyan)">De = bolt circle</text><text x="50" y="58" font-size="10" fill="var(--muted)">full gasket</text>'},
  e:{key:'e', chip:'(e) براغي + حشوة ضيقة', cp:0.55, de:'gasket-mean', en:'Bolted cover, narrow-face gasket',
     ar:'غطاء مربوط ببراغي، والحشوة شريط ضيق بس', cond:'',
     svg: CL+'<rect x="34" y="64" width="12" height="84" fill="var(--cyan)" opacity=".8"/><rect x="4" y="52" width="42" height="12" fill="var(--cyan)" opacity=".8"/><rect x="31" y="47" width="15" height="5" fill="var(--muted)"/><rect x="4" y="29" width="201" height="18" fill="var(--amber)"/><rect x="12" y="20" width="5" height="52" fill="var(--text)"/><text x="66" y="100" font-size="12" fill="var(--cyan)">De = mean gasket dia.</text><text x="52" y="60" font-size="10" fill="var(--muted)">narrow gasket</text>'}
};
ED.CP_ORDER = ['a','bc','d','e'];

/* Quizzes */
ED.QUIZ = {
  ch1: [
    {q:'قانون سُمك الجسم الأسطواني هو:', o:['\\(e=\\dfrac{P_iD_i}{2Jf-P_i}+c\\)','\\(e=\\dfrac{P_iD_i}{4Jf-1.2P_i}+c\\)','\\(e=\\dfrac{P_iD_i}{2Jf-0.2P_i}\\)','\\(e=\\dfrac{P_iD_i}{2Jf+P_i}+c\\)'], a:0, why:'«2 للأنبوب»: 2Jf − P. والثاني للكرة، والثالث للبيضوي.'},
    {q:'لحام مزدوج مع spot radiography. شكد J؟', o:['1.0','0.85','0.80','0.7'], a:1, why:'صف المزدوج: 1.0 / 0.85 / 0.7.'},
    {q:'سماحية التآكل للهيدروكاربونات الرطبة (wet):', o:['1 mm','2 mm','3 mm','5 mm'], a:1, why:'«جاف 1 · رطب 2 · ماء 3».'},
    {q:'معامل تركيز الإجهاد Cs للرأس التورِي:', o:['\\(\\tfrac14(3+\\sqrt{R_c/R_k})\\)','\\(\\tfrac14(3+\\sqrt{R_k/R_c})\\)','\\(\\tfrac13(4+\\sqrt{R_c/R_k})\\)','\\(3+\\tfrac14\\sqrt{R_c/R_k}\\)'], a:0, why:'«ربع (ثلاثة + جذر التاج على المفصل)».'},
    {q:'غطاء مسطح مربوط ببراغي مع حشوة كاملة الوجه (full-face). Cp = ؟', o:['0.45','0.55','0.4','0.6'], a:2, why:'«Full = Four» يعني 0.4، و De = قطر دائرة البراغي.'},
    {q:'ضغط تشغيل 14 bar (abs). الضغط المقياسي:', o:['14 bar','15 bar','13 bar','1.4 bar'], a:2, why:'abs → gauge: نطرح 1 bar.'},
    {q:'14.3 bar تساوي:', o:['143 N/mm²','1.43 N/mm²','0.143 N/mm²','14.3 N/mm²'], a:1, why:'1 bar = 0.1 N/mm²، يعني نقسم على 10.'},
    {q:'بمثال 13.1، أي رأس طلع الأكثر اقتصاداً؟', o:['المسطح','التورِي','البيضوي','ما يفرق'], a:2, why:'البيضوي 12.7 mm (يعني 15 مثل الجسم)، والتورِي 22، والمسطح 90.'},
    {q:'سُمك الرأس نصف الكروي حسب المحاضرة:', o:['\\(e_{shell}\\)','\\(0.5\\,e_{shell}\\)','\\(0.6\\,e_{shell}\\)','\\(1.2\\,e_{shell}\\)'], a:2, why:'«نص كرة = 60%».'},
    {q:'أقل سُمك عملي لوعاء قطره 1.5 m:', o:['5 mm','7 mm','9 mm','10 mm'], a:1, why:'السُلّم 5-7-9-10-12، و 1–2 m تقابل 7 mm.'}
  ]
};
