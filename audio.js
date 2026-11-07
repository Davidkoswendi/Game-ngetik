/* audio.js: semua suara dibuat langsung dengan Web Audio API, tanpa file mp3 */
const SFX=(()=>{
let C,M,SB,MB,FX,RV,NZ,NB,OUT,mg=null,want="lobby",cur=null,tim=0,st=0,nx=0,inten=0,wr=-1,sc="s-menu",muted=false,sfxOn=true,mv=.7,btn;const lt={};
try{sfxOn=localStorage.getItem("mnSfx")!=="0";const v=localStorage.getItem("mnMv");if(v!=null)mv=Math.max(0,Math.min(1,+v/100))}catch(e){}
const R=(a,b)=>a+Math.random()*(b-a),F=n=>440*2**((n-69)/12),th=(k,ms)=>{const n=performance.now();if(n-(lt[k]||0)<ms)return 0;lt[k]=n;return 1};
function init(){if(C)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;C=new A();
  const cp=C.createDynamicsCompressor();cp.threshold.value=-12;cp.ratio.value=5;M=C.createGain();M.gain.value=.85;M.connect(cp);cp.connect(C.destination);
  FX=C.createGain();FX.gain.value=sfxOn?1:0;FX.connect(M);SB=C.createGain();SB.gain.value=1.5;SB.connect(FX);C.onstatechange=()=>{if(C.state==="running"){if(want!==cur){cur=want;startM()}hint()}};MB=C.createGain();MB.gain.value=mv*.8;MB.connect(M);
  const n=C.sampleRate*3;NZ=C.createBuffer(1,n,C.sampleRate);NB=C.createBuffer(1,n,C.sampleRate);const a=NZ.getChannelData(0),b=NB.getChannelData(0);let l=0;
  for(let i=0;i<n;i++){const w=Math.random()*2-1;a[i]=w;l=(l+.02*w)/1.02;b[i]=l*3.5}
  const len=C.sampleRate*2.4,ir=C.createBuffer(2,len,C.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
  RV=C.createConvolver();RV.buffer=ir;const rg=C.createGain();rg.gain.value=.45;RV.connect(rg);rg.connect(FX);OUT=SB}
/* pembangun suara */
function osc(ty,f,t,d,v,o){o=o||{};const x=C.createOscillator(),g=C.createGain(),a=o.a||.004,h=o.h||0,e=t+a+h+d;x.type=ty;x.frequency.setValueAtTime(f,t);if(o.to)x.frequency.exponentialRampToValueAtTime(o.to,e);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);if(h)g.gain.setValueAtTime(v,t+a+h);g.gain.exponentialRampToValueAtTime(.0001,e);
  if(o.lp){const q=C.createBiquadFilter();q.frequency.value=o.lp;x.connect(q);q.connect(g)}else x.connect(g);
  if(o.vr){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=o.vr;lg.gain.value=o.vd||20;l.connect(lg);lg.connect(x.frequency);l.start(t);l.stop(e+.05)}
  g.connect(OUT);x.start(t);x.stop(e+.05)}
function nz(t,d,v,o){o=o||{};const s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain(),a=o.a||.004,h=o.h||0,e=t+a+h+d;s.buffer=o.b?NB:NZ;s.loop=true;f.type=o.ty||"lowpass";
  f.frequency.setValueAtTime(o.f||1000,t);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,e);f.Q.value=o.q||1;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);if(h)g.gain.setValueAtTime(v,t+a+h);g.gain.exponentialRampToValueAtTime(.0001,e);
  if(o.lf){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=o.lf[0];lg.gain.value=o.lf[1];l.connect(lg);lg.connect(f.frequency);l.start(t);l.stop(e+.05)}s.connect(f);f.connect(g);g.connect(OUT);s.start(t,R(0,2));s.stop(e+.05)}
function run(v,f,pan){const p=OUT,g=C.createGain(),s=C.createGain();g.gain.value=v;s.gain.value=.4;if(pan&&C.createStereoPanner){const q=C.createStereoPanner();q.pan.value=pan;g.connect(q);q.connect(SB)}else g.connect(SB);g.connect(s);s.connect(RV);OUT=g;try{f()}catch(e){}OUT=p}
const go=(v,fn,...a)=>{if(!C||C.state!=="running"||!sfxOn)return;run(v,()=>fn(C.currentTime+.01,...a))};
function duck(d){const n=C.currentTime;MB.gain.cancelScheduledValues(n);MB.gain.setTargetAtTime(mv*.26,n,.05);MB.gain.setTargetAtTime(mv*.8,n+d,.5)}
/* efek dasar */
const crack=(t,v)=>{nz(t,.06,v,{ty:"highpass",f:2500});nz(t,.25,v*.7,{ty:"bandpass",f:3500,to:800,q:.6})};
const boom=(t,z)=>{crack(t,.9);osc("sine",100,t,z,1.1,{to:24});osc("sine",52,t,1.6*z,.8,{to:20});nz(t,.5*z,.9,{f:6000,to:200,q:.7});nz(t,1.6*z,1,{b:1,f:2000,to:60,q:.7});nz(t+.12,2.6*z,.6,{b:1,f:450,to:45,a:.15});
  for(let i=0;i<10;i++)nz(t+.3+R(0,1.4)*z,.07,.25,{ty:"bandpass",f:R(500,3000),q:2});osc("sine",R(5200,6200),t+.2,1.5,.025,{a:.05})};
const thunder=(t,z)=>{crack(t,z);nz(t+.03,.5,.8*z,{ty:"bandpass",f:1800,to:300,q:.5,lf:[40,500]});osc("sawtooth",2600,t,.12,.3*z,{to:70});
  nz(t+.05,4*z,1.4*z,{b:1,f:1100,to:40,q:.8,a:.06,lf:[3,250]});osc("sine",64,t+.06,3*z,.9*z,{to:24});
  for(let i=0;i<7;i++)nz(t+.35+i*.4+R(0,.25),R(.8,1.5),(.75-i*.08)*z,{b:1,f:R(220,520),to:45,a:.2});nz(t+.6,3.5*z,.3*z,{ty:"bandpass",f:140,q:.6,a:1})};
const clang=t=>{[[540,1],[1130,.7],[1770,.5],[2610,.35],[3720,.25]].forEach(([f,a],i)=>osc("sine",f,t,1.1-i*.15,.3*a));nz(t,.05,.7,{ty:"highpass",f:3500});osc("triangle",150,t,.25,.6,{to:70});for(let i=0;i<6;i++)nz(t+.02+i*.03,.03,.25,{ty:"highpass",f:R(4000,8000)})};
/* suara tiap skill. t = awal, I = detik sampai benturan, H = benturan (diganti dentang kalau diblok pelindung) */
const K={
wind:(t,I,H)=>{nz(t,2,.6,{ty:"bandpass",f:300,to:1100,q:3,a:.6,h:.5});nz(t+.3,1.8,.4,{ty:"bandpass",f:700,to:250,q:5,a:.5,h:.4});osc("sine",240,t,1.9,.12,{to:420,a:.6,vr:6,vd:30});nz(t,2,.25,{ty:"highpass",f:2500,a:.5,h:.6});
  H(u=>{osc("sawtooth",110,u,.5,.25,{to:55,lp:500});for(let i=0;i<7;i++)nz(u+i*.07,.06,.3,{ty:"bandpass",f:R(600,1800),q:2})})},
birds:(t,I,H)=>{for(let b=0;b<8;b++)for(let c=0;c<3;c++){const f=R(2200,3200);osc("sine",f,t+R(0,I-.05)+c*.12,.07,.1,{to:f*1.5})}
  for(let i=0;i<16;i++)nz(t+i*(I+.4)/16,.05,.2,{ty:"bandpass",f:600,q:1});
  H(u=>{osc("sawtooth",1100,u,.18,.2,{to:500,lp:2500});osc("sawtooth",1400,u+.08,.15,.15,{to:600,lp:2500});nz(u,.2,.4,{ty:"bandpass",f:1200,q:.8});osc("sine",100,u,.15,.5,{to:50})})},
plane:(t,I,H)=>{osc("sine",1900,t,I,.12,{to:380,a:.1});osc("sawtooth",70,t,I+.2,.22,{to:140,lp:380,a:.2,vr:28,vd:15});nz(t,I,.28,{f:300,to:900,a:I*.8});
  H(u=>{boom(u,1);nz(u,.9,.5,{ty:"bandpass",f:1500,q:.5});for(let i=0;i<6;i++)osc("triangle",R(300,900),u+.1+i*.08,.1,.15,{to:R(80,200)})})},
storm:(t,I,H)=>{nz(t,2.4,.35,{ty:"highpass",f:3500,q:.5,a:.5,h:1.2});nz(t,2.2,.4,{b:1,f:200,a:1,h:.3});nz(t,2.2,.3,{ty:"bandpass",f:1500,q:.4,a:.4,h:1.4});
  const u=t+Math.max(0,I-.08);thunder(u);nz(u+.38,.25,.5,{ty:"highpass",f:2500,to:7000});H(w=>{nz(w,.6,.5,{ty:"highpass",f:2500});osc("sawtooth",900,w,.3,.2,{to:60})})},
quake:(t,I,H)=>{nz(t,1.7,1,{b:1,f:140,a:.25,h:1});osc("sine",36,t,1.7,.9,{a:.3,h:.9,vr:9,vd:6});osc("sawtooth",48,t,1.7,.3,{lp:200,a:.3,h:.9,vr:11,vd:4});nz(t,1.5,.35,{ty:"bandpass",f:400,q:1,a:.3,h:.9});
  for(let i=0;i<14;i++)nz(t+R(.1,1.5),.05,.3,{ty:"bandpass",f:R(500,2500),q:3});
  for(let i=0;i<8;i++){const u=t+I-.1+i*.07;nz(u,.12,.35,{ty:"bandpass",f:R(300,900),q:2});osc("sine",R(80,130),u,.1,.4,{to:45})}H(u=>boom(u,.6))},
bomb:(t,I,H)=>{osc("sawtooth",95,t,1.5,.18,{lp:420,a:.2,h:.6,vr:30,vd:12});osc("sine",2400,t+.3,I-.3,.09,{to:650,a:.05});
  H(u=>{boom(u,1.5);nz(u,1.6,.7,{ty:"bandpass",f:900,to:200,q:.5});for(let i=0;i<8;i++)nz(u+.2+R(0,.9),.08,.3,{ty:"bandpass",f:R(400,2000),q:2})})},
shield:t=>{[523,659,784,1047,1319].forEach((f,i)=>osc("sine",f,t+i*.07,.5,.2,{a:.01}));nz(t,.8,.25,{ty:"highpass",f:4000,to:9000,a:.3});osc("sine",220,t+.3,1.2,.2,{a:.3,vr:5,vd:3});osc("sine",224,t+.3,1.2,.15,{a:.3});osc("triangle",1568,t+.4,.6,.1)},
triple:t=>{[523,659,784,1047].forEach((f,i)=>osc("square",f,t+i*.08,.18,.1,{lp:3000}));for(let i=0;i<4;i++){osc("sine",130,t+.35+i*.1,.1,.7,{to:60});nz(t+.35+i*.1,.05,.3,{ty:"bandpass",f:900,q:1})}osc("sine",1568,t+.75,.5,.18);osc("sine",2093,t+.8,.6,.12)},
fog:(t,I,H)=>{nz(t,2.2,.4,{ty:"bandpass",f:500,to:900,q:.7,a:.8,h:.7});osc("sine",196,t,2,.12,{a:.8,h:.5});osc("sine",207,t,2,.1,{a:.8,h:.5});osc("sine",294,t+.2,1.8,.06,{a:.8,h:.4,vr:.5,vd:6});H(u=>osc("sine",120,u,.5,.4,{to:60}))},
dizzy:(t,I,H)=>{osc("sine",500,t,1.8,.2,{to:300,a:.15,h:.9,vr:6,vd:120});osc("triangle",250,t+.2,1.5,.12,{a:.1,h:.8,vr:4,vd:60});for(let i=0;i<7;i++)osc("sine",1200+((i*3)%5)*140,t+i*.2,.2,.1,{to:900});H(u=>osc("sine",300,u,.4,.3,{to:150}))}};
/* efek umum */
const S={
click:t=>{osc("sine",720,t,.05,.22,{to:980});nz(t,.02,.12,{ty:"highpass",f:4000})},
key:t=>{nz(t,.025,.22,{ty:"highpass",f:3200});osc("sine",R(1500,2100),t,.025,.06)},
err:t=>{osc("sawtooth",120,t,.18,.28,{to:80,lp:700});osc("square",90,t,.18,.15,{to:70,lp:500})},
word:(t,c)=>{const n=[72,74,76,79,81,84,86,88][Math.max(0,c-1)%8];osc("triangle",F(n),t,.16,.22);osc("sine",F(n+12),t,.12,.08);if(c>=5)osc("sine",F(n+19),t+.05,.2,.06)},
land:t=>{osc("sine",R(120,160),t,.13,.9,{to:50});nz(t,.07,.4,{ty:"bandpass",f:R(700,1100),q:1.2});nz(t,.03,.25,{ty:"highpass",f:3500})},
hurt:t=>{osc("sine",150,t,.4,1,{to:38});nz(t,.25,.7,{f:900,to:150});osc("sawtooth",220,t,.3,.2,{to:70,lp:600})},
horn:t=>{[[196,0],[262,.32]].forEach(([f,d])=>{osc("sawtooth",f,t+d,.5,.22,{lp:1200,a:.05});osc("sawtooth",f*1.01,t+d,.5,.18,{lp:1200,a:.05})})},
beep:t=>{osc("sine",660,t,.22,.4,{a:.01});osc("triangle",660,t,.22,.2)},
go:t=>{[784,988,1175].forEach(f=>osc("sawtooth",f,t,.7,.16,{lp:2500,a:.01}));osc("sine",1568,t,.8,.2);nz(t,.5,.3,{ty:"bandpass",f:800,to:4000,q:.6,a:.05})},
pick:t=>{nz(t,.3,.2,{ty:"bandpass",f:800,to:5000,q:1,a:.1});[784,988,1319].forEach((f,i)=>osc("sine",f,t+.05+i*.07,.3,.2))},
choose:t=>{osc("sine",880,t,.3,.3);osc("sine",1320,t+.06,.35,.25);nz(t,.2,.2,{ty:"highpass",f:3000})},
join:t=>{osc("sine",660,t,.3,.25);osc("sine",880,t+.1,.4,.25)},
ready:(t,r)=>{(r?[523,659,784]:[784,659]).forEach((f,i)=>osc("triangle",f,t+i*.07,.2,.25))},
win:t=>{[[523,0],[659,.14],[784,.28],[1047,.42]].forEach(([f,d])=>{osc("sawtooth",f,t+d,.5,.2,{lp:2200,a:.02});osc("square",f,t+d,.4,.06,{lp:1800})});[1047,1319,1568].forEach(f=>osc("sawtooth",f,t+.6,1.4,.15,{lp:2400,a:.03}));
  nz(t+.6,3,.2,{ty:"bandpass",f:2200,q:.5,a:.4,h:2});for(let i=0;i<40;i++)nz(t+.6+R(0,3),.04,.2,{ty:"highpass",f:R(1500,3500)})},
lose:t=>{[392,349,330].forEach((f,i)=>osc("triangle",f,t+i*.28,.45,.28,{vr:5,vd:6}));osc("sawtooth",196,t+.9,.9,.2,{to:150,lp:700,vr:6,vd:5})},
whistle:t=>{osc("sine",2900,t,.9,.2,{vr:38,vd:300,a:.01,h:.5});[110,177,233,292].forEach((f,i)=>osc("sine",f,t+1.3,2.2-i*.3,.3/(i+1)));nz(t+1.3,.1,.4,{ty:"bandpass",f:600,q:1})},
fw:t=>{nz(t,.4,.4,{f:3000,to:300});osc("sine",120,t,.2,.4,{to:50});for(let i=0;i<10;i++)nz(t+.1+R(0,.5),.03,.15,{ty:"highpass",f:R(3000,7000)})},
hammer:t=>{osc("sine",R(2000,2600),t,.12,.15);osc("sine",R(3300,3900),t,.08,.08);nz(t,.03,.25,{ty:"bandpass",f:3500,q:2});osc("sine",200,t,.06,.3,{to:120})},
warn:(t,r)=>{osc("square",r<=3?1500:1000,t,.06,.18,{lp:3000});if(r<=5)osc("sine",90,t,.2,.5,{to:50})}};
Object.assign(S,{
thaw:t=>{for(let i=0;i<6;i++)nz(t+i*.1,.03,.2+i*.04,{ty:"bandpass",f:R(3000,6000),q:3});osc("sine",R(900,1200),t+.55,.05,.1);nz(t+.62,.5,.8,{ty:"highpass",f:3500,a:.002});nz(t+.62,.35,.5,{ty:"bandpass",f:1800,to:500,q:.7});osc("sine",110,t+.62,.3,.7,{to:50});for(let i=0;i<12;i++)osc("sine",R(2200,5200),t+.66+R(0,.6),.12,.07,{to:R(1500,3000)})},
release:t=>{nz(t,.55,.4,{ty:"bandpass",f:700,to:200,q:3,a:.05,lf:[8,200]});osc("sine",R(300,400),t+.05,.1,.12,{to:R(800,1000)});osc("sine",150,t+.35,.2,.3,{to:60});nz(t+.35,.1,.25,{ty:"bandpass",f:900,q:2})}});
Object.assign(K,{
octo:(t,I,H)=>{nz(t,I+.5,.5,{ty:"bandpass",f:180,to:420,q:2.5,a:.5,h:I*.6,lf:[2.2,90]});nz(t+.1,I,.28,{ty:"bandpass",f:900,to:350,q:4,a:.4,h:I*.5,lf:[7,300]});osc("sine",70,t,I+.4,.3,{to:48,a:.5,h:I*.5});for(let i=0;i<9;i++){const u=t+R(0,I);osc("sine",R(260,420),u,.09,.13,{to:R(700,1100)});nz(u,.04,.12,{ty:"bandpass",f:R(1500,2500),q:2})}
  H(u=>{osc("sawtooth",62,u,.9,.32,{to:40,lp:420,vr:8,vd:10});nz(u,.8,.5,{ty:"bandpass",f:520,to:220,q:3,lf:[11,160]});osc("sine",110,u,.35,.7,{to:48});nz(u,.07,.5,{ty:"bandpass",f:700,q:1.5});for(let i=0;i<4;i++)nz(u+.1+i*.13,.05,.18,{ty:"bandpass",f:R(180,320),q:5})})},
freeze:(t,I,H)=>{nz(t,I+.3,.45,{ty:"bandpass",f:3200,to:900,q:1.2,a:.25,h:I*.5});nz(t,I+.3,.22,{ty:"highpass",f:5000,a:.3,h:I*.4});[2093,2637,3136,3951].forEach((f,i)=>osc("sine",f,t+.05+i*.11,.55,.07,{a:.01,vr:6,vd:f*.01}));
  H(u=>{for(let i=0;i<14;i++)nz(u+i*.035,.03,.28,{ty:"highpass",f:R(3500,7500)});[1568,2093,2637].forEach((f,i)=>osc("sine",f,u+i*.04,.7-i*.1,.2,{a:.004}));osc("sine",95,u,.5,.6,{to:46});nz(u,.2,.4,{ty:"bandpass",f:2600,to:600,q:.8})})}});
Object.assign(K,{
wind:(t,I,H)=>{nz(t,2.2,.7,{ty:"bandpass",f:500,q:2.5,a:.7,h:.6,lf:[1.6,260]});nz(t+.1,2.1,.45,{ty:"bandpass",f:1100,q:3,a:.6,h:.6,lf:[2.3,420]});nz(t,2.2,.35,{ty:"highpass",f:3000,a:.7,h:.7});nz(t,2.2,.5,{b:1,f:300,a:.6,h:.8,lf:[.9,120]});osc("sine",300,t,2,.1,{to:520,a:.7,h:.3,vr:5,vd:40});
  for(let i=0;i<10;i++)nz(t+I*.4+R(0,1),.05,.2,{ty:"bandpass",f:R(2000,4500),q:3});
  H(u=>{osc("sawtooth",95,u,.7,.28,{to:45,lp:420,vr:14,vd:8});nz(u,.5,.4,{ty:"bandpass",f:700,to:300,q:4,lf:[18,200]});for(let i=0;i<9;i++){const w=u+i*.06;osc("triangle",R(250,600),w,.09,.18,{to:R(90,180)});nz(w,.05,.3,{ty:"bandpass",f:R(500,2000),q:2})}})},
birds:(t,I,H)=>{for(let b=0;b<9;b++){const s=t+R(0,I-.25);for(let c=0;c<(R(2,5)|0);c++){const f=R(2400,3600);osc("sine",f,s+c*R(.07,.13),.06,.09,{to:f*R(.7,1.5),vr:40,vd:80})}}
  for(let i=0;i<22;i++){const u=t+i*(I+.3)/22;nz(u,.07,.22,{ty:"bandpass",f:R(350,700),q:1.2});nz(u,.05,.1,{ty:"highpass",f:2500})}
  H(u=>{for(let i=0;i<4;i++){osc("sawtooth",R(1100,1600),u+i*.05,.16,.15,{to:R(450,700),lp:2800,vr:30,vd:100});nz(u+i*.04,.08,.35,{ty:"bandpass",f:900,q:1})}osc("sine",100,u,.18,.55,{to:48});for(let i=0;i<10;i++)nz(u+i*.05,.06,.25,{ty:"bandpass",f:R(500,900),q:1})})},
plane:(t,I,H)=>{osc("sine",2000,t,I,.13,{to:420,a:.15});osc("sawtooth",72,t,I+.25,.26,{to:150,lp:420,a:.25,vr:26,vd:16});osc("sawtooth",144,t,I+.25,.1,{to:280,lp:900,a:.25,vr:26,vd:30});nz(t,I,.3,{f:350,to:1100,a:I*.8});
  for(let i=0;i<6;i++)nz(t+I*.2+i*I*.12,.15,.2,{ty:"bandpass",f:R(300,800),q:2});
  H(u=>{boom(u,1);for(let i=0;i<7;i++){osc("triangle",R(300,1100),u+.1+i*.07,.14,.18,{to:R(80,250)});nz(u+.05+i*.07,.06,.3,{ty:"bandpass",f:R(1000,3500),q:3})}nz(u+.2,1.2,.4,{ty:"bandpass",f:1800,to:600,q:4,lf:[14,400]})})},
storm:(t,I,H)=>{nz(t,2.6,.5,{ty:"highpass",f:3000,q:.4,a:.6,h:1.3});nz(t,2.6,.45,{ty:"bandpass",f:1400,q:.4,a:.5,h:1.5});nz(t,2.6,.5,{b:1,f:220,a:1.1,h:.4,lf:[.7,80]});nz(t,I,.18,{b:1,f:200,to:90,a:I*.9});
  for(let i=0;i<5;i++)nz(t+R(.2,I),.03,.16,{ty:"highpass",f:R(4000,8000)});
  const u=t+Math.max(0,I-.08);thunder(u,1);nz(u+.4,.3,.6,{ty:"highpass",f:2500,to:7000});thunder(u+1.1,.5);
  H(w=>{nz(w,.7,.5,{ty:"bandpass",f:3000,q:.5,lf:[60,1500]});osc("sawtooth",1200,w,.25,.2,{to:60})})},
quake:(t,I,H)=>{nz(t,1.9,1,{b:1,f:150,a:.3,h:1.1,lf:[7,60]});osc("sine",34,t,1.9,.9,{a:.35,h:1,vr:8,vd:5});osc("sawtooth",46,t,1.9,.32,{lp:190,a:.35,h:1,vr:12,vd:5});nz(t,1.8,.4,{ty:"bandpass",f:420,q:1,a:.3,h:1,lf:[11,120]});
  for(let i=0;i<3;i++)osc("sawtooth",R(90,160),t+i*.4,.9,.1,{to:R(55,100),lp:500,a:.1,vr:7,vd:12});
  for(let i=0;i<18;i++)nz(t+R(.1,1.7),.06,.3,{ty:"bandpass",f:R(500,3000),q:3});
  for(let i=0;i<10;i++){const u=t+I-.12+i*.07;nz(u,.14,.35,{ty:"bandpass",f:R(300,1000),q:2});osc("sine",R(70,140),u,.12,.45,{to:42})}H(u=>boom(u,.7))},
bomb:(t,I,H)=>{osc("sawtooth",92,t,1.6,.2,{lp:400,a:.25,h:.5,vr:28,vd:12});osc("sawtooth",184,t,1.6,.07,{lp:800,a:.25,h:.5,vr:28,vd:20});nz(t,1.5,.2,{f:300,to:900,a:.6});
  osc("sine",2600,t+.3,I-.3,.1,{to:600,a:.05});osc("sine",2630,t+.3,I-.3,.05,{to:620,a:.05});
  H(u=>{boom(u,1.6);nz(u+.1,1.8,.7,{ty:"bandpass",f:1000,to:180,q:.5});osc("sine",100,u+.05,2.2,.4,{to:28})})},
shield:t=>{[523,659,784,1047,1319,1568].forEach((f,i)=>{osc("sine",f,t+i*.06,.6,.16,{a:.01});osc("triangle",f*2,t+i*.06,.3,.04)});nz(t,.9,.25,{ty:"highpass",f:4000,to:10000,a:.35});osc("sine",110,t+.25,1.4,.3,{a:.3,vr:5,vd:3});osc("sine",113,t+.25,1.4,.25,{a:.3});osc("sawtooth",220,t+.3,1.1,.06,{lp:900,a:.3,vr:50,vd:8});for(let i=0;i<5;i++)nz(t+.1+i*.1,.04,.25,{ty:"highpass",f:R(5000,9000)})}});
Object.assign(S,{
key:t=>{const f=R(.9,1.1);nz(t,.02,.3,{ty:"highpass",f:2800*f});osc("square",1800*f,t,.012,.07,{lp:4000});osc("sine",R(150,220),t+.012,.04,.25,{to:90});nz(t+.045,.02,.15,{ty:"bandpass",f:2200,q:2})},
word:(t,c)=>{const n=[72,74,76,79,81,84,86,88][Math.max(0,c-1)%8],f=F(n);osc("sine",f,t,.45,.2);osc("sine",f*2.76,t,.25,.07);osc("sine",f*5.4,t,.12,.03);osc("triangle",f*.5,t,.2,.1);if(c>=5)osc("sine",F(n+19),t+.05,.3,.07)},
land:t=>{osc("sine",R(110,150),t,.18,1,{to:42});osc("triangle",R(200,300),t,.06,.4,{to:90});nz(t,.08,.5,{ty:"bandpass",f:R(600,1000),q:1.2});nz(t,.025,.3,{ty:"highpass",f:3500});nz(t+.03,.25,.12,{ty:"bandpass",f:2500,q:.6});osc("sine",R(900,1400),t,.06,.04)},
hammer:t=>{const f=R(.9,1.15);[[2100,.16],[3300,.1],[5100,.05]].forEach(([h,v],i)=>osc("sine",h*f,t,.22-i*.05,v));nz(t,.03,.3,{ty:"bandpass",f:3800,q:2});osc("sine",180,t,.07,.35,{to:110})}});
/* suara skill bantu: turbo boost & keberuntungan */
Object.assign(K,{
turbo:t=>{osc("sine",90,t,.35,.8,{to:38});nz(t,.18,.6,{f:2200,to:200,q:.7});
  osc("sawtooth",62,t+.05,1.5,.2,{to:230,lp:520,a:.1,vr:16,vd:10});osc("sawtooth",124,t+.05,1.5,.07,{to:460,lp:900,a:.1,vr:16,vd:20});
  osc("sine",900,t+.1,1.1,.1,{to:3400,a:.4,vr:9,vd:60});nz(t+.1,1.2,.3,{ty:"bandpass",f:500,to:5200,q:1.5,a:.9});
  for(let i=0;i<5;i++)osc("sine",1800+i*260,t+.2+i*.1,.1,.04);
  nz(t+1.25,.5,.5,{ty:"highpass",f:3500,a:.002});nz(t+1.25,.45,.35,{ty:"bandpass",f:2200,to:900,q:.6})},
luck:t=>{[784,988,1175,1568,1976,2349].forEach((f,i)=>{osc("sine",f,t+i*.07,.7-i*.05,.16,{a:.004});osc("sine",f*2.01,t+i*.07,.35,.04)});
  nz(t,.9,.18,{ty:"highpass",f:6000,to:10000,a:.2});[1319,1760].forEach((f,i)=>osc("triangle",f,t+.5+i*.09,.5,.12));
  for(let i=0;i<10;i++)osc("sine",R(3000,5500),t+.1+R(0,.9),.15,.04,{to:R(2000,4000)})}});
Object.assign(S,{
vent:t=>{nz(t,.5,.5,{ty:"highpass",f:3000,to:6500,a:.003});nz(t,.55,.35,{ty:"bandpass",f:2000,to:800,q:.7});osc("sine",R(900,1100),t,.12,.05,{to:500})},
ping:t=>{[1319,1760,2349].forEach((f,i)=>osc("sine",f,t+i*.06,.4,.16,{a:.004}))}});
/* suara intro */
Object.assign(S,{
whoosh:t=>{nz(t,.9,.4,{ty:"bandpass",f:250,to:4200,q:1.4,a:.35,h:.1});nz(t,.6,.2,{ty:"highpass",f:3000,to:9000,a:.3});osc("sine",180,t,.7,.12,{to:900,a:.3})},
hum:t=>{[48,55,60,64,67].forEach(n=>{osc("sine",F(n),t,2.2,.07,{a:1.2,h:.6});osc("triangle",F(n)*1.004,t,2.2,.03,{a:1.2,h:.6,lp:900})});nz(t,2.4,.12,{ty:"bandpass",f:500,to:1400,q:.7,a:1.4,h:.5});for(let i=0;i<8;i++)osc("sine",R(2600,4200),t+.4+i*.35,.5,.025,{a:.05})},
stack:(t,c)=>{const n=[60,62,64,67,69,72,76][Math.min(c,6)];osc("sine",R(120,150),t,.2,1,{to:42});nz(t,.07,.45,{ty:"bandpass",f:R(700,1000),q:1.2});nz(t,.025,.3,{ty:"highpass",f:3500});osc("triangle",F(n),t+.02,.4,.22);osc("sine",F(n+12),t+.02,.3,.09);osc("sine",F(n)*2.76,t+.02,.15,.03);if(c===6){osc("sine",F(n+7),t+.06,.6,.1);for(let i=0;i<4;i++)osc("sine",R(3000,5000),t+.05+i*.05,.2,.05)}},
riser:t=>{nz(t,1.25,.38,{ty:"bandpass",f:300,to:6000,q:1.6,a:1.15});osc("sawtooth",98,t,1.25,.1,{to:392,lp:1400,a:1.1});osc("sine",196,t,1.25,.12,{to:1568,a:1.1});for(let i=0;i<10;i++)nz(t+i*.12,.04,.16,{ty:"highpass",f:3500+i*400})},
slam:(t,k)=>{crack(t,k?.9:.6);osc("sine",110,t,k?.8:.5,1,{to:30});nz(t,.35,.7,{f:5000,to:200,q:.7});osc("triangle",F(k?48:55),t,.5,.35,{to:F(k?36:43)});[540,1130,1770].forEach((f,i)=>osc("sine",f*(k?.8:1),t,.7-i*.15,.12/(i+1)));if(k)nz(t+.05,1.2,.5,{b:1,f:900,to:60,q:.7})},
sting:t=>{[[523,0],[659,.1],[784,.2],[1047,.3]].forEach(([f,d])=>{osc("sawtooth",f,t+d,.4,.15,{lp:2400,a:.02});osc("square",f/2,t+d,.35,.05,{lp:1200})});[523,659,784,1047,1319].forEach(f=>{osc("sawtooth",f,t+.5,1.5,.1,{lp:2600,a:.03});osc("sawtooth",f*1.006,t+.5,1.5,.06,{lp:2600,a:.03})});osc("sine",65,t+.5,1.2,.5,{to:50});nz(t+.45,1.4,.2,{ty:"highpass",f:5000,to:9000,a:.1});for(let i=0;i<14;i++)osc("sine",R(2200,4600),t+.5+R(0,1.1),.18,.05)}});
/* musik */
const CL=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]],CG=[[57,60,64],[53,57,60],[55,59,62],[52,56,59]],
ML=[0,76,0,79,0,76,74,0, 0,72,0,76,0,79,76,0, 0,77,0,81,0,79,77,0, 0,79,0,83,0,81,79,0],LD={0:81,3:84,6:83,8:81,11:76,14:77};
const T={
lobby:{sd:()=>60/100/4,step(i,t,sd){const s=i%16,b=(i>>4)%4,c=CL[b];
  if(s===0)c.forEach(n=>osc("sine",F(n),t,sd*12,.05,{a:.5,h:sd*5}));
  if(s===0||s===6||s===8||s===11)osc("triangle",F(c[0]-24),t,.5,.32);
  if(s%2){osc("triangle",F(c[(s>>1)%3]+12),t,.2,.05)}else{const n=ML[b*8+(s>>1)];if(n){osc("sine",F(n),t,.5,.14);osc("triangle",F(n)*2,t,.2,.03)}}
  if(s===0||s===8)osc("sine",120,t,.14,.22,{to:50});if(s%4===2)nz(t,.03,.04,{ty:"highpass",f:8000})}},
game:{sd:()=>60/(138+inten*22)/4,step(i,t,sd){const s=i%16,b=(i>>4)%4,c=CG[b],x=inten;if(s===0&&b===0)nz(t,sd*50,.05,{ty:"bandpass",f:400,q:.7,a:3,h:sd*40,lf:[.3,150]});
  if(s%4===0)osc("sine",160,t,.16,.55,{to:42});
  if(s%2===0)osc("sawtooth",F(c[0]-24+(s===6||s===14?12:0)),t,sd*1.6,.2,{lp:420+x*500});
  nz(t,.03,s%2?.05:.08,{ty:"highpass",f:7000});if(s===14)nz(t,.15,.06,{ty:"highpass",f:6000});
  if((s===4||s===12)&&x>.15){nz(t,.14,.22,{ty:"bandpass",f:1900,q:.8});osc("triangle",190,t,.1,.3,{to:110})}
  osc("square",F(c[[0,1,2,1][s&3]]+12),t,sd*.9,.035+x*.03,{lp:1500+x*1500});
  if(s===0){c.forEach(n=>{osc("sawtooth",F(n),t,sd*14,.045,{lp:650,a:.5,h:sd*8});osc("sawtooth",F(n)*1.006,t,sd*14,.03,{lp:650,a:.5,h:sd*8})});
    if(b===1||b===3)osc("sawtooth",F(c[0]+1),t,sd*10,.025,{lp:600,a:.6,h:sd*6});if(b===3)nz(t,sd*16,.08+x*.1,{ty:"highpass",f:800,to:7000,a:sd*15})}
  if(x>.45&&LD[s])osc("sawtooth",F(LD[s]+[0,-4,-2,-5][b]),t,sd*2.4,.06,{lp:2600,vr:5,vd:6})}}};
function sched(){if(!C||!mg)return;const tr=T[cur];while(nx<C.currentTime+.18){const sd=tr.sd();OUT=mg;try{if(mv>0)tr.step(st,nx,sd)}catch(e){}OUT=SB;st++;nx+=sd}}
function stopM(){clearInterval(tim);if(mg){const g=mg;mg=null;g.gain.cancelScheduledValues(C.currentTime);g.gain.setValueAtTime(g.gain.value,C.currentTime);g.gain.linearRampToValueAtTime(0,C.currentTime+.6);setTimeout(()=>g.disconnect(),900)}}
function startM(){stopM();if(!cur||!C)return;const g=C.createGain();g.gain.setValueAtTime(.0001,C.currentTime);g.gain.linearRampToValueAtTime(1,C.currentTime+.8);g.connect(MB);mg=g;st=0;nx=C.currentTime+.1;inten=0;tim=setInterval(sched,40);sched()}
function music(n){want=n;if(n==="game")wr=-1;if(!C||cur===n)return;cur=n;startM()}
function unlock(){init();if(C&&C.state!=="running")C.resume().catch(()=>{})}
/* tombol mute */
let hn;function bs(){if(btn)btn.classList.toggle("off",!sfxOn&&mv<=0)}
function hint(){if(hn)hn.style.display=C&&C.state==="running"||(!sfxOn&&mv<=0)?"none":"flex"}
function ui(){const s=document.createElement("style");s.textContent="#sfxw{position:fixed;z-index:9999;right:calc(14px + env(safe-area-inset-right,0px));bottom:calc(14px + var(--pb,0px) + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:10px;pointer-events:none;font-family:inherit}#sfxw>*{pointer-events:auto}#sfxb{position:relative;width:52px;height:52px;border-radius:14px;border:0;padding:0;display:grid;place-items:center;cursor:pointer;color:#2a1b5e;background:#ffd23f;box-shadow:0 4px 0 #c99a00,inset 0 2px 0 rgba(255,255,255,.45),0 8px 14px rgba(0,0,0,.28);transition:transform .12s,box-shadow .12s}#sfxb:active{transform:translateY(4px);box-shadow:0 0 0 #c99a00,0 3px 6px rgba(0,0,0,.28)}#sfxb.off{color:#fff;background:#3a2a82;box-shadow:0 4px 0 #1b1050,inset 0 2px 0 rgba(255,255,255,.18),0 8px 14px rgba(0,0,0,.28)}#sfxb.off:active{box-shadow:0 0 0 #1b1050}#sfxb svg{width:30px;height:30px;}#sfxb .w{transform-origin:9px 12px;animation:sfxw 1.3s ease-in-out infinite}#sfxb .w2{animation-delay:.2s}#sfxb .x{display:none;stroke:#ff5a5f}#sfxb.off .w{display:none}#sfxb.off .x{display:block}#sfxh{display:none;align-items:center;gap:8px;padding:9px 14px;border-radius:14px;background:rgba(30,18,90,.88);color:#fff;font-size:14px;box-shadow:0 4px 0 rgba(0,0,0,.25);animation:sfxp 1.6s ease-in-out infinite}#sfxh i{display:flex;gap:2px;align-items:flex-end;height:14px}#sfxh i b{width:3px;background:#ffd23f;border-radius:2px;animation:sfxe .8s ease-in-out infinite}#sfxh i b:nth-child(2){animation-delay:.2s}#sfxh i b:nth-child(3){animation-delay:.4s}@keyframes sfxe{0%,100%{height:4px}50%{height:14px}}@keyframes sfxw{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}@keyframes sfxp{0%,100%{transform:translateX(0)}50%{transform:translateX(-4px)}}";document.head.appendChild(s);
  const w=document.createElement("div");w.id="sfxw";hn=document.createElement("div");hn.id="sfxh";hn.innerHTML="<i><b></b><b></b><b></b></i>Ketuk layar untuk menyalakan musik";
  
  w.append(hn);document.body.appendChild(w);const p=document.getElementById("pnl");if(p&&window.ResizeObserver)new ResizeObserver(()=>w.style.setProperty("--pb",p.offsetHeight+"px")).observe(p);hint()}
addEventListener("pointerdown",e=>{unlock();const b=e.target.closest&&e.target.closest("button,.slot.add,.tk");if(b&&b.id!=="sfxb"&&!b.closest("#pick")&&!b.disabled&&th("c",40))go(1,S.click)},true);
["pointerup","touchstart","touchend","mousedown","click","keydown"].forEach(v=>addEventListener(v,unlock,true));
document.addEventListener("visibilitychange",()=>{if(C)document.hidden?C.suspend():C.resume()});
ui();unlock();
return{cfg:()=>({sfx:sfxOn,mv:Math.round(mv*100)}),setSfx(b){sfxOn=!!b;if(FX)FX.gain.setTargetAtTime(sfxOn?1:0,C.currentTime,.02);try{localStorage.setItem("mnSfx",sfxOn?"1":"0")}catch(e){}hint();bs()},setMusic(v){mv=Math.max(0,Math.min(1,v/100));if(MB){MB.gain.cancelScheduledValues(C.currentTime);MB.gain.setTargetAtTime(mv*.8,C.currentTime,.05)}try{localStorage.setItem("mnMv",String(Math.round(mv*100)))}catch(e){}hint();bs()},music,unlock,intro:(n,x)=>go(1,S[n],x),
  scene(id){sc=id;if(id==="s-menu"||id==="s-lobby")music("lobby");else if(id==="s-game")music(null);else if(id==="s-res"){music(null);setTimeout(()=>{if(sc==="s-res")music("lobby")},5200)}},
  key:()=>go(1,S.key),err:()=>go(1,S.err),word:c=>go(1,S.word,c),hurt:()=>go(1,S.hurt),pick:()=>go(1,S.pick),choose:()=>go(1,S.choose),join:()=>go(1,S.join),ready:r=>go(1,S.ready,r),
  land:(m,live)=>{if(live&&th("l",80))go(m?1:.3,S.land)},
  hammer:()=>go(.45,S.hammer),fw:()=>{if(th("f",250))go(.35,S.fw)},
  cue(t,big){if(typeof t==="number")go(1,S.beep);else if(t==="GO!")go(1,S.go);else if(big&&typeof t==="string"&&t.indexOf("MARI")===0)go(1,S.horn)},
  warn(r){if(wr===r)return;wr=r;go(1,S.warn,r)},
  inten(x){if(wr>0&&wr<=10)x=1;inten=Math.max(0,Math.min(1,x))},
  end(win,txt){go(1,txt&&txt.indexOf("WAKTU")===0?S.whistle:win?S.win:S.lose)},
  lockEnd(id,q){go(q?.3:.9,id==="freeze"?S.thaw:S.release)},vent(q){go(q?.3:.8,S.vent)},ping(){go(1,S.ping)},
  skill(id,o){if(!C||C.state!=="running"||!sfxOn)return;o=o||{};const fn=K[id];if(!fn)return;const I=(o.I||0)/1000;
    run(o.demo?.22:o.mine?1:o.far?.3:.8,()=>{const t=C.currentTime+.03;fn(t,I,f=>o.blk?clang(t+I):f(t+I))},o.pan);
    if(!o.demo&&!o.far&&(id==="storm"||id==="bomb"||id==="quake"))duck(2.5)}}
})();