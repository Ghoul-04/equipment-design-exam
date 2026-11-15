/* ===== 3D lab (Three.js, loaded on demand) ===== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ED = window.ED, $ = s=>document.querySelector(s), $$ = s=>[...document.querySelectorAll(s)];
let started=false;
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#66d6ec';

function makeStage(host, camPos){
  host.querySelector('.lab-msg')?.remove();
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100); camera.position.set(...camPos);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping=true; controls.enablePan=false; controls.minDistance=2.5; controls.maxDistance=14;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.4));
  const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(4,6,5); scene.add(dl);
  const fit=()=>{ const w=host.clientWidth, h=host.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); };
  new ResizeObserver(fit).observe(host); fit();
  let visible=true; new IntersectionObserver(es=>{ visible=es[0].isIntersecting; }).observe(host);
  return {renderer, scene, camera, controls, isLive:()=>visible && document.getElementById('v-lab').classList.contains('on')};
}

/* ---------------- vessel builder ---------------- */
function headCurve(type, R, H){            // outer profile of the TOP head, from shell junction to the axis
  const pts=[], n=40, top=H/2;
  if(type==='hemi') for(let k=0;k<=n;k++){ const t=k/n*Math.PI/2; pts.push([R*Math.cos(t), top+R*Math.sin(t)]); }
  if(type==='ellip') for(let k=0;k<=n;k++){ const t=k/n*Math.PI/2; pts.push([R*Math.cos(t), top+R/2*Math.sin(t)]); }
  if(type==='tori'){ const Rc=2*R, Rk=0.06*Rc, kx=R-Rk, cy=top-Math.sqrt((Rc-Rk)**2-kx**2), p1=Math.atan2(top-cy,kx);
    for(let k=0;k<=12;k++){ const a=k/12*p1; pts.push([kx+Rk*Math.cos(a), top+Rk*Math.sin(a)]); }
    for(let k=1;k<=n;k++){ const a=p1+(Math.PI/2-p1)*k/n; pts.push([Rc*Math.cos(a), cy+Rc*Math.sin(a)]); } }
  return pts;
}
function offsetIn(pts, t){                  // move each point inward along the curve normal
  return pts.map((p,i)=>{ const a=pts[Math.max(0,i-1)], b=pts[Math.min(pts.length-1,i+1)]; let tx=b[0]-a[0], ty=b[1]-a[1]; const L=Math.hypot(tx,ty)||1; tx/=L; ty/=L;
    let nx=ty, ny=-tx; return [Math.max(0,p[0]-nx*t), p[1]-ny*t]; });
}
function vesselProfiles(type, R, H, tS, tH){
  let outT, inT;
  if(type==='flat'){ outT=[[R,H/2],[R,H/2+tH],[0,H/2+tH]]; inT=[[R-tS,H/2],[0,H/2]]; }
  else { outT=headCurve(type,R,H); inT=offsetIn(outT,tH); inT[0]=[R-tS, inT[0][1]]; inT[inT.length-1][0]=0; outT[outT.length-1][0]=0; }
  const mir=a=>a.map(([x,y])=>[x,-y]).reverse();
  const outer=[...mir(outT), ...outT], inner=[...mir(inT), ...inT];
  return {outer, inner};
}
function vessel(){
  const st = makeStage($('#lab-vessel'), [3.1,1.9,3.9]);
  const group = new THREE.Group(); st.scene.add(group);
  const mSteel = new THREE.MeshStandardMaterial({color:0x9fb3c8, metalness:.55, roughness:.38, side:THREE.DoubleSide});
  const mIn = new THREE.MeshStandardMaterial({color:0x5c6f86, metalness:.3, roughness:.6, side:THREE.DoubleSide});
  const mCut = new THREE.MeshStandardMaterial({color:new THREE.Color(css('--amber')||'#ffb84d'), roughness:.5, side:THREE.DoubleSide});
  let head='ellip';
  const P=$('#lv-P'), D=$('#lv-D'), F=$('#lv-f');
  function thick(){ const p=+P.value, d=+D.value*1000, f=+F.value, c=2;
    const eS=p*d/(2*f-p), Cs=0.25*(3+Math.sqrt(1/0.06));
    return {shell:eS+c, ellip:p*d/(2*f-0.2*p)+c, tori:p*d*Cs/(2*f+p*(Cs-0.2))+c, hemi:0.6*eS+c, flat:0.4*(d+200)*Math.sqrt(p/f)+c}; }
  function build(){
    group.clear();
    const E=thick(), Rmm=+D.value*500, R=1, H=2.4, k=3*R/Rmm;              // wall drawn 3× thicker than real (same factor everywhere)
    const tS=Math.min(0.45,E.shell*k), tH=Math.min(0.6,E[head]*k);
    const {outer,inner}=vesselProfiles(head,R,H,tS,tH);
    const v2=a=>a.map(([x,y])=>new THREE.Vector2(x,y));
    const ps=0.35*Math.PI, pl=1.5*Math.PI;
    group.add(new THREE.Mesh(new THREE.LatheGeometry(v2(outer),72,ps,pl), mSteel));
    group.add(new THREE.Mesh(new THREE.LatheGeometry(v2(inner),72,ps,pl), mIn));
    const shape=new THREE.Shape(v2([...outer, ...inner.slice().reverse()]));
    [ps, ps+pl].forEach(phi=>{ const m=new THREE.Mesh(new THREE.ShapeGeometry(shape), mCut); m.rotation.y=phi-Math.PI/2; group.add(m); });
    $('#lv-Pv').textContent=(+P.value).toFixed(2)+' N/mm²'; $('#lv-Dv').textContent=(+D.value).toFixed(2)+' m'; $('#lv-fv').textContent=F.value+' N/mm²';
    const nm={ellip:'بيضوي',tori:'تورِي',hemi:'نصف كروي',flat:'مسطح'};
    $('#lv-out').innerHTML = `<span>الجسم: <b>${E.shell.toFixed(1)} mm</b></span>` + Object.keys(nm).map(h=>`<span style="${h===head?'outline:2px solid var(--amber)':''}">${nm[h]}: <b>${E[h].toFixed(1)} mm</b></span>`).join('');
  }
  $('#lv-heads').addEventListener('click',e=>{ const b=e.target.closest('[data-h]'); if(!b) return; $$('#lv-heads .chip').forEach(x=>x.classList.toggle('on',x===b)); head=b.dataset.h; build(); });
  [P,D,F].forEach(x=>x.addEventListener('input',build)); build();
  (function loop(){ requestAnimationFrame(loop); if(!st.isLive()) return; group.rotation.y+=0.0025; st.controls.update(); st.renderer.render(st.scene,st.camera); })();
}

/* ---------------- separator simulator ---------------- */
function separator(){
  const st = makeStage($('#lab-sep'), [0,1.7,5.4]);
  const world = new THREE.Group(); st.scene.add(world);
  const N=180, drops=new THREE.InstancedMesh(new THREE.SphereGeometry(0.035,8,6), new THREE.MeshStandardMaterial({color:new THREE.Color('#ffb84d'), emissive:0x442200}), N);
  const shellMat=new THREE.MeshPhysicalMaterial({color:0x9fb3c8, transparent:true, opacity:.16, roughness:.2, side:THREE.DoubleSide, depthWrite:false});
  const liqMat=new THREE.MeshStandardMaterial({color:new THREE.Color('#2fb6d3'), transparent:true, opacity:.55, side:THREE.DoubleSide});
  const partMat=new THREE.MeshStandardMaterial({color:0xe8f0fa, roughness:.6});
  const meshMat=new THREE.MeshStandardMaterial({color:0xffffff, wireframe:true});
  let type='h'; const q=$('#ls-q'), dS=$('#ls-d'), LS=$('#ls-L');
  let geo={}, P=[], ok=0, bad=0, hist=[];
  const dummy=new THREE.Object3D();
  function build(){
    world.clear(); world.add(drops); hist=[]; ok=bad=0;
    const d=+dS.value, L=+LS.value;
    if(type==='h'){
      const r=0.65*d, len=3.4*L; geo={r,len};
      const body=new THREE.CapsuleGeometry(r,len,8,32); body.rotateZ(Math.PI/2);
      world.add(new THREE.Mesh(body,shellMat));
      const lq=new THREE.CylinderGeometry(r*0.98,r*0.98,len,32,1,false,Math.PI/2,Math.PI); lq.rotateZ(Math.PI/2); world.add(new THREE.Mesh(lq,liqMat));
      const top=new THREE.Mesh(new THREE.PlaneGeometry(len,2*r*0.98),liqMat); top.rotation.x=-Math.PI/2; world.add(top);
      const dv=new THREE.Mesh(new THREE.BoxGeometry(0.04,r*0.9,r*1.1),partMat); dv.position.set(-len/2+0.18,r*0.3,0); world.add(dv);
      const me=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.14,0.5),meshMat); me.position.set(len/2-0.35,r*0.8,0); world.add(me);
      st.controls.target.set(0,0,0);
    } else {
      const r=0.55*d, hgt=3.6; geo={r,hgt};
      world.add(new THREE.Mesh(new THREE.CapsuleGeometry(r,hgt,8,32),shellMat));
      const lq=new THREE.CylinderGeometry(r*0.98,r*0.98,1.0,32); lq.translate(0,-hgt/2+0.5,0); world.add(new THREE.Mesh(lq,liqMat));
      const dv=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.5,r),partMat); dv.position.set(-r+0.2,0,0); world.add(dv);
      const me=new THREE.Mesh(new THREE.CylinderGeometry(r*0.6,r*0.6,0.14,20),meshMat); me.position.set(0,hgt/2-0.1,0); world.add(me);
    }
    P=Array.from({length:N},()=>spawn(true));
    label();
  }
  function spawn(stagger){
    const s={vt:0.26*(0.55+Math.random()*0.9)};
    if(type==='h'){ const {r,len}=geo; s.x=-len/2+0.25+(stagger?Math.random()*len*0.8:0); s.y=0.05+Math.random()*r*0.85; const zr=Math.sqrt(Math.max(0,r*r-s.y*s.y))*0.85; s.z=(Math.random()*2-1)*zr; }
    else { const {r}=geo; s.x=(Math.random()*2-1)*r*0.6; s.z=(Math.random()*2-1)*r*0.6; s.y=(stagger?(Math.random()*2-1)*1.2:0); }
    return s;
  }
  function gasV(){ const d=+dS.value, Q=+q.value; return type==='h' ? 0.42*Q/(d*d) : 0.26*Q/(d*d); }
  function label(){
    $('#ls-qv').textContent=(+q.value).toFixed(2)+'×'; $('#ls-dv').textContent=(+dS.value).toFixed(2)+'×'; $('#ls-Lv').textContent=(+LS.value).toFixed(2)+'×';
    $('#ls-Lrow').classList.toggle('hide', type!=='h');
    $('#ls-msg').innerHTML = type==='h'
      ? '<b>الأفقية:</b> القطرة لازم توصل للسائل قبل لا يوصل الغاز لنهاية العازلة. كبّر <b>الطول</b> أو <b>القطر</b> (يبطّئ الغاز) وشوف النسبة تتحسّن. هذا هو قانون <b class="en">d·L<sub>eff</sub> = const</b>.'
      : '<b>العمودية:</b> الغاز يصعد والقطرة تنزل. إذا <b>سرعة الغاز أكبر من V<sub>t</sub></b> القطرات تطير لفوك. كبّر <b>القطر</b> (سرعة الغاز ∝ 1/d²). هذا هو <b>القطر الأدنى</b> من قانون <b class="en">d²</b>.';
  }
  function tick(dt){
    const vg=gasV();
    P.forEach((s,i)=>{
      if(type==='h'){ s.x+=vg*dt; s.y-=s.vt*dt; if(s.y<=0){ hist.push(1); P[i]=spawn(false); } else if(s.x>=geo.len/2-0.1){ hist.push(0); P[i]=spawn(false); } }
      else { s.y+=(vg-s.vt)*dt; const bot=-geo.hgt/2+1.0; if(s.y<=bot){ hist.push(1); P[i]=spawn(false); } else if(s.y>=geo.hgt/2-0.15){ hist.push(0); P[i]=spawn(false); } }
      const p=P[i]; dummy.position.set(p.x,p.y,p.z); dummy.updateMatrix(); drops.setMatrixAt(i,dummy.matrix);
    });
    drops.instanceMatrix.needsUpdate=true;
    if(hist.length>300) hist=hist.slice(-300);
    const good=hist.filter(x=>x).length, pct=hist.length? Math.round(100*good/hist.length):100;
    $('#ls-ok').textContent=`✓ انفصلت ${pct}%`; $('#ls-bad').textContent=`✗ طارت ويا الغاز ${100-pct}%`;
  }
  $('#ls-type').addEventListener('click',e=>{ const b=e.target.closest('[data-t]'); if(!b) return; $$('#ls-type .chip').forEach(x=>x.classList.toggle('on',x===b)); type=b.dataset.t; st.camera.position.set(type==='h'?0:3.6, type==='h'?1.7:1.2, type==='h'?5.4:4.4); build(); });
  [dS,LS].forEach(x=>x.addEventListener('input',build)); q.addEventListener('input',()=>{ hist=[]; label(); });
  build();
  let last=performance.now();
  (function loop(t){ requestAnimationFrame(loop); const dt=Math.min(0.05,(t-last)/1000); last=t; if(!st.isLive()) return; tick(dt); st.controls.update(); st.renderer.render(st.scene,st.camera); })(last);
}

export function start(){
  if(started) return; started=true;
  try{ const c=document.createElement('canvas'); if(!(c.getContext('webgl2')||c.getContext('webgl'))) throw new Error('no webgl'); }
  catch(e){ $$('.lab-msg').forEach(x=>x.textContent='⚠️ جهازك ما يدعم WebGL، فالمجسمات ثلاثية الأبعاد ما تشتغل عليه. باقي الموقع يشتغل عادي.'); return; }
  vessel(); separator();
}
