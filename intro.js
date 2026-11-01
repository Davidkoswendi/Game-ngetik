/* intro.js: animasi pembuka Typing Tower (motion graphic + efek suara) */
(function(){
const el=document.getElementById("intro");if(!el)return;
let reduce=false;try{reduce=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
if(reduce){el.remove();return}
el.classList.add("ok");
const root=document.documentElement,COLS=["#ff7a30","#38c6a1","#ffc21a","#8a6bff","#ff5c97","#3b9bff"],R=(a,b)=>a+Math.random()*(b-a);
let started=false,done=false,t0=0;const tm=[];
const T=(ms,f)=>tm.push(setTimeout(f,ms));
const S=(n,a)=>{try{SFX.intro(n,a)}catch(e){}};
root.style.overflow="hidden";
/* tahan musik menu sampai intro selesai */
try{SFX.music(null)}catch(e){}
/* isi elemen */
(function(){let h="";for(let i=0;i<60;i++)h+=`<i style="left:${R(0,100).toFixed(1)}%;top:${R(0,62).toFixed(1)}%;--z:${R(1.5,3.2).toFixed(1)}px;animation-delay:-${R(0,2).toFixed(2)}s"></i>`;
  el.querySelector(".in-stars").innerHTML=h;
  let b="";COLS.forEach((c,i)=>b+=`<i class="in-b" style="--c:${c};--n:${i}"></i>`);b+=`<i class="in-b in-roof" style="--c:#ff5c4d;--n:6"></i>`;
  el.querySelector(".in-tw").innerHTML=b;
  const w=(t,k,base)=>`<span class="in-w" style="--sh:${k?"#1b63c2":"#d9381e"}">`+[...t].map((c,i)=>`<b style="--d:${(base+i*.06).toFixed(2)}s;--r:${(R(-24,24)|0)}deg">${c}</b>`).join("")+"</span>";
  el.querySelector(".in-h").innerHTML=w("TYPING",0,3.1)+w("TOWER",1,3.6)})();
function burst(){const r=el.querySelector(".in-title").getBoundingClientRect(),cx=innerWidth/2,cy=r.top+r.height*.4,box=el.querySelector(".in-cfx");
  el.querySelector(".in-ring").style.top=cy+"px";
  for(let i=0;i<70;i++){const e=document.createElement("i");e.className="in-cf";e.style.background=COLS[i%6];e.style.left=cx+"px";e.style.top=cy+"px";box.appendChild(e);
    const a=R(0,Math.PI*2),d=R(90,Math.min(innerWidth,520)*.7),x=Math.cos(a)*d,y=Math.sin(a)*d*.7-R(30,110),rot=R(-720,720);
    e.animate([{transform:"translate(0,0) rotate(0) scale(1)",opacity:1},{transform:`translate(${x}px,${y}px) rotate(${rot/2}deg) scale(1)`,opacity:1,offset:.45},{transform:`translate(${x*1.15}px,${y+R(180,320)}px) rotate(${rot}deg) scale(.8)`,opacity:0}],{duration:R(1300,2100),easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>e.remove()}}
function reveal(){try{SFX.scene("s-menu")}catch(e){}
  const m=document.getElementById("s-menu");if(m&&m.classList.contains("on")){m.classList.remove("on");void m.offsetWidth;m.classList.add("on")}}
function exit(){if(done)return;done=true;tm.forEach(clearTimeout);try{sessionStorage.setItem("mnI","1")}catch(e){}
  removeEventListener("keydown",key,true);S("whoosh");el.classList.add("out");
  setTimeout(reveal,260);setTimeout(()=>{el.remove();root.style.overflow=""},1000)}
function run(){t0=performance.now();el.classList.add("run");
  S("hum");S("whoosh");
  [920,1260,1600,1940,2280,2620,2960].forEach((ms,i)=>T(ms,()=>S("stack",i)));
  T(2300,()=>S("riser"));
  T(3520,()=>S("slam",0));
  T(4100,()=>{S("slam",1);el.classList.add("hit");burst()});
  T(4250,()=>S("sting"));
  T(4750,()=>S("choose"));
  T(6100,exit)}
function start(){if(started)return;started=true;try{SFX.unlock()}catch(e){}
  try{document.activeElement&&document.activeElement.blur()}catch(e){}
  el.querySelector(".in-start").classList.add("go");setTimeout(run,180)}
function key(e){if(e.key==="Enter"||e.key===" "||e.key==="Escape"){e.preventDefault();e.stopPropagation();if(!started)start();else if(performance.now()-t0>500)exit()}}
el.addEventListener("pointerdown",()=>{if(!started)start();else if(t0&&performance.now()-t0>900)exit()});
addEventListener("keydown",key,true);
})();