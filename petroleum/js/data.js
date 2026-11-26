/* ===== quiz data ===== */
window.ED = window.ED || {}; ED.QUIZ = ED.QUIZ || {};
ED.QUIZ.ch1 = [
 {q:'Which hydrocarbons have high octane number and are favourite in car fuel?<br><span class="muted">أي هيدروكاربونات أوكتانها عالي ومفضلة بالوقود؟</span>', o:['Normal paraffins','Iso-paraffins','Olefins','Naphthenes only'], a:1, why:'المتفرعة: غليان واطي وأوكتان عالي.'},
 {q:'The general formula of naphthenes is:<br><span class="muted">الصيغة العامة للنفثينات:</span>', o:['CnH2n+2','CnH2n','CnHn','CnH2n−2'], a:1, why:'النفثين مشبع حلقي C<sub>n</sub>H<sub>2n</sub> (نفس صيغة الأوليفين بس مشبع).'},
 {q:'Olefins are mainly found in:<br><span class="muted">الأوليفينات تنلقى بـ:</span>', o:['Crude oil','Cracked products','Natural gas','Brine water'], a:1, why:'الخفيفة منها مو موجودة بالخام، بس بنواتج التكسير.'},
 {q:'Which component increases as the density of crude increases?<br><span class="muted">أي مكوّن يزيد مع الكثافة؟</span>', o:['Oxygen','Sulphur','Nitrogen','Olefins'], a:1, why:'الكبريت يزيد مع الكثافة، والأوكسجين يزيد مع درجة الغليان.'},
 {q:'Corrosion of the metal parts of the engine is caused mainly by:<br><span class="muted">تآكل أجزاء المحرك سببه:</span>', o:['Sulphur compounds','Aromatics','Iso-paraffins','Naphthenes'], a:0, why:'«الكبريت ياكل المحرك».'},
 {q:'Nitrogen compounds:<br><span class="muted">مركبات النتروجين:</span>', o:['Increase API','Poison catalysts','Increase octane','Reduce carbon residue'], a:1, why:'تسمّم العامل المساعد، وتزيد المتبقي الكاربوني، وتقلل API.'},
 {q:'Reduce the yield of gasoline and coke formation are disadvantages of:<br><span class="muted">تقليل ناتج الكازولين وتكوّن الكوك من عيوب:</span>', o:['Oxygen compounds','Metallic components','Brine water','Paraffins'], a:1, why:'المعادن: عامل، كوك، كازولين، رماد، تآكل.'},
 {q:'Carbon content of crude oil (wt%) is:<br><span class="muted">نسبة الكاربون بالنفط:</span>', o:['50–60','70–75','83–88','95–99'], a:2, why:'C 83–88 و H 11–14.'},
 {q:'Mercaptans have the structure:<br><span class="muted">تركيب المركابتانات:</span>', o:['R–S–R','H–S–R','R–O–R','R–COOH'], a:1, why:'R–SH. أما R–S–R فهو كبريتيد.'},
 {q:'The inorganic hypothesis assumes petroleum formed from:<br><span class="muted">الفرضية غير العضوية تفترض:</span>', o:['Dead plants and animals','Hot water vapour reacting with carbides','Salt domes','Bacteria only'], a:1, why:'Al₄C₃ و CaC₂ مع بخار ماء حار تحت ضغط وحرارة.'}
];
ED.QUIZ.cls = [
 {q:'Watson factor uses temperature in:<br><span class="muted">واتسون يستخدم الحرارة بـ:</span>', o:['°C','K','°R','°F'], a:2, why:'«واتسون رانكن».'},
 {q:'The correlation index uses temperature in:<br><span class="muted">C.I. يستخدم الحرارة بـ:</span>', o:['°R','K','°F','°C'], a:1, why:'«C.I. كلفن».'},
 {q:'Δt (slope of distillation curve) equals:', o:['(T₉ − T₁)/80','(T₉ + T₁)/9','(FBP − IBP)/100','T₉/T₁'], a:0, why:'Δt = (T₉₀ − T₁₀)/(90 − 10).'},
 {q:'Kw = 11.8 means the crude is:', o:['Paraffinic','Mixed','Naphthenic','Aromatic'], a:1, why:'11.5–12.1 مختلط.'},
 {q:'API = 35 at 40 mmHg means:', o:['Paraffinic','Mixed','Naphthenic','Sour'], a:0, why:'بالمخلخل: أكثر من 30 بارافيني.'},
 {q:'A crude with 3% sulfur is:', o:['Sweet','Intermediate','Sour','Paraffinic'], a:2, why:'أكثر من 2.5% حامض.'},
 {q:'API of a crude with SG = 0.85 is about:', o:['25','35','45','55'], a:1, why:'141.5/0.85 − 131.5 = 34.97.'},
 {q:'C.I. = 100 corresponds to:', o:['n-paraffin','Benzene','Mixture','Naphthene'], a:1, why:'100 = بنزين.'}
];
ED.QUIZ.mech = [
 {q:'Standard conditions for SG in the petroleum industry:', o:['0 °C, 1 atm','60 °F, 1 atm','25 °C, 1 bar','100 °F, 1 atm'], a:1, why:'60 °F (15.5 °C) و 1 atm.'},
 {q:'As temperature increases, SG of a liquid:', o:['Increases','Decreases','Stays constant','Doubles'], a:1, why:'النفط يتمدد فتقل كثافته: SG<sub>T</sub> = SG<sub>60</sub> − γ(T − 60).'},
 {q:'Unit of kinematic viscosity:', o:['poise','stoke (cm²/s)','g/cm³','Pa'], a:1, why:'الكينماتيكية بالستوك، والديناميكية بالبويز.'},
 {q:'If U < H then VI is:', o:['0–100','> 100','< 0','= 0'], a:1, why:'U أصغر من H يعني الزيت أحسن من زيت الـ 100 ← القانون #2.'},
 {q:'L and H are taken from equations when Y is:', o:['< 2 cSt','> 70 cSt','between 20 and 30','always'], a:1, why:'لحد 70 من الجدول، وفوقها القوانين #3 و #4.'},
 {q:'VI increases with:', o:['Naphthenes','Paraffins','Aromatics','Sulphur'], a:1, why:'«بارافين = مية، نفثين = صفر».'}
];
ED.QUIZ.therm = [
 {q:'The lowest temperature at which wax crystals begin to form:', o:['Pour point','Cloud point','Flash point','Freezing point'], a:1, why:'الغيمة = أول شمع يبيّن.'},
 {q:'Below the ____ the product cannot be transferred through a pipeline.', o:['cloud point','pour point','flash point','fire point'], a:1, why:'نقطة الانسكاب.'},
 {q:'Autoignition temperature is always ____ the flash point.', o:['lower than','equal to','higher than','unrelated to'], a:2, why:'أعلى من الوميض (بدون شرارة).'},
 {q:'Autoignition temperature with increasing pressure:', o:['Increases','Decreases','No change','First increases then decreases'], a:1, why:'تقل لما يزيد الضغط.'},
 {q:'Octane number can be improved by adding:', o:['H₂S','TEL or MTBE','Brine','Pyridine'], a:1, why:'TEL أو MTBE.'},
 {q:'Correct octane order:', o:['P > Iso P > O > N > A','A > N > O > Iso P > P','N > A > P > O','O > A > N > P'], a:1, why:'A N O I P.'},
 {q:'Higher aniline point means:', o:['More aromatics','Less aromatics, more paraffins','More sulphur','Lower API'], a:1, why:'أنيلين عالي = أروماتي أقل.'},
 {q:'In TF = 231.2 − 40 log Pvap, the result is in:', o:['°C','°F','K','°R'], a:2, why:'الكلفن، و P بالبار عند 37.8 °C.'},
 {q:'Specific heat of lighter fractions is:', o:['Lower','Higher','Zero','Equal to heavy fractions'], a:1, why:'الأخف قيمته أعلى، ويقل مع الكثافة.'}
];
ED.QUIZ.all = [].concat(ED.QUIZ.ch1, ED.QUIZ.cls, ED.QUIZ.mech, ED.QUIZ.therm).sort(()=>Math.random()-0.5).slice(0,20);
