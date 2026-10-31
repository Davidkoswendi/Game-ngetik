const COL=["#ff7a30","#38c6a1","#ffc21a","#8a6bff","#ff5c97","#3b9bff"];
const POOL=[
"api air bata kayu batu cat tali lampu pintu atap besi tiang kunci pagar awan angin bukit candi bambu teman dunia senja fajar roda kapal bumi hujan darat laut pasir tanah daun buah bunga rumah meja kursi buku".split(" "),
"menara jendela tangga semen pondasi dinding lantai balok kubah gerbang genteng bendera puncak tinggi kokoh megah cepat bangun susun rapi benteng istana gapura jembatan semangat juara lomba cahaya langit sekolah kampus komputer keyboard layanan program".split(" "),
"arsitektur konstruksi pembangunan kemenangan perlombaan keberanian kesempatan kebersamaan pengetikan ketangguhan kecepatan ketelitian pencakarlangit bertingkat perkembangan penyelesaian pengalaman persahabatan tantangan kesungguhan pertandingan pengetahuan".split(" ")];
const FLS=[10,15,20],DN=["Mudah","Normal","Susah"],DEF={m:"race",d:1,t:60};
const $=id=>document.getElementById(id);
const me={id:Math.random().toString(36).slice(2,8),jt:Date.now(),name:"",av:0,ready:false,floors:0,fin:0,lastAt:0,round:0,cfg:{...DEF}};
let room=null,code="",solo=false,off=null,offC=null,connOk=false,scr="menu",started=false,over=false,ended=false,startAt=0,list=[],idx=0,combo=0,t0=0,tick=null,typed=0,okc=0,prevLen=0,lastSig="",myWpm=0,G={m:"race",d:1,t:60,fl:15};
const tws={},dws={};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ab=(p,s)=>`<i class="ab" style="--c:${COL[p.av%6]};--s:${s||44}px">${esc((p.name||"?")[0].toUpperCase())}</i>`;
function seedRng(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%100000)/100000}}
function mkList(){const r=seedRng(code+me.round+G.d+G.m),p=POOL[G.d],n=G.m==="race"?G.fl+4:300,a=[];let last="";for(let i=0;i<n;i++){let w;do{w=p[Math.floor(r()*p.length)]}while(w===last);a.push(w);last=w}return a}
function mkCode(){const A="ABCDEFGHJKLMNPQRSTUVWXYZ";let s="";for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s}
function show(id){scr=id.slice(2);document.body.classList.toggle("res",id==="s-res");document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));window.scrollTo(0,0)}
(function(){const b=$("bg");for(let i=0;i<16;i++){const e=document.createElement("i"),s=20+Math.random()*60;e.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;animation-duration:${14+Math.random()*20}s;animation-delay:-${Math.random()*30}s`;b.appendChild(e)}
let h="";"MENARA NGETIK".split(" ").forEach((w,k)=>{h+='<span class="wd">'+[...w].map((c,i)=>`<b style="--i:${i+k*6};--sh:${k?"#1b63c2":"#d9381e"}">${c}</b>`).join("")+"</span>"});$("ttl").innerHTML=h;
let m="";COL.slice(0,5).forEach((c,i)=>m+=`<i style="--c:${c};--n:${i}"></i>`);$("mt").innerHTML=m+`<i style="--c:#ff5c4d;--n:5"></i>`;
let a="";COL.forEach((c,i)=>a+=`<button data-i="${i}" style="--c:${c}"></button>`);$("sw").innerHTML=a;
try{const s=JSON.parse(localStorage.getItem("mn")||"{}");if(s.n)$("nm").value=s.n;me.av=s.a|0}catch(e){}
pick(me.av);$("sw").onclick=e=>{const b=e.target.closest("button");if(b)pick(+b.dataset.i)}})();
function pick(i){me.av=i;document.querySelectorAll("#sw button").forEach((b,k)=>b.classList.toggle("on",k===i))}
/* connect */
const FAIL="Online belum bisa tersambung di claude.ai. Pastikan kamu login dan temanmu diberi akses (Share). Sementara itu pakai Latihan Solo.";
const ICE=[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478"},{urls:["turn:openrelay.metered.ca:80","turn:openrelay.metered.ca:443","turn:openrelay.metered.ca:443?transport=tcp"],username:"openrelayproject",credential:"openrelayproject"}];
const inClaude=()=>!!(window.claude&&window.claude.use);
function gone(m){connOk=false;$("lmsg").textContent=m;$("err").textContent=m;setTimeout(leave,2500)}
function peerNet(c,hostMode){return new Promise((res,rej)=>{
  if(!window.Peer){rej("Library online gagal dimuat. Cek koneksi internet lalu muat ulang halaman.");return}
  const hostId="mnr-ngetik-"+c.toLowerCase(),roster={};let list=[],conns=[],peer=null,hconn=null,settled=false;
  const fail=m=>{if(settled)return;settled=true;clearTimeout(t);try{peer&&peer.destroy()}catch(e){}rej(m)};
  const bcast=()=>{const l=Object.values(roster);conns.forEach(cn=>{if(cn.open)cn.send({t:"s",l})});sync()};
  const api={
    presence(p){Object.assign(me,p);if(hostMode){roster[me.id]={...me};bcast()}else if(hconn&&hconn.open){hconn.send({t:"p",d:{...me}});sync()}return Promise.resolve()},
    peers(){const a=hostMode?Object.values(roster):list.filter(x=>x.id!==me.id).concat([me]);return a.map(d=>({presence:d}))},
    leave(){try{peer&&peer.destroy()}catch(e){}}};
  const t=setTimeout(()=>fail("Server online tidak merespons. Coba lagi."),12000);
  if(hostMode){
    peer=new Peer(hostId,{config:{iceServers:ICE}});
    peer.on("open",()=>{if(settled)return;settled=true;clearTimeout(t);roster[me.id]={...me};connOk=true;res(api)});
    peer.on("connection",cn=>{
      if(conns.filter(x=>x.open).length>=5){cn.on("open",()=>{cn.send({t:"full"});setTimeout(()=>cn.close(),400)});return}
      conns.push(cn);
      cn.on("open",()=>cn.send({t:"s",l:Object.values(roster)}));
      cn.on("data",m=>{if(m&&m.t==="p"&&m.d&&m.d.id){cn._pid=m.d.id;roster[m.d.id]=m.d;bcast()}});
      cn.on("close",()=>{conns=conns.filter(x=>x!==cn);if(cn._pid)delete roster[cn._pid];bcast()})});
    peer.on("error",e=>{if(!settled)fail(e.type==="unavailable-id"?"ID":"Tidak bisa terhubung ke server online ("+e.type+").");else{connOk=false;stLine()}});
  }else{
    peer=new Peer({config:{iceServers:ICE}});
    peer.on("open",()=>{
      hconn=peer.connect(hostId,{reliable:true});
      hconn.on("open",()=>{if(settled)return;settled=true;clearTimeout(t);connOk=true;hconn.send({t:"p",d:{...me}});res(api)});
      hconn.on("data",m=>{if(m.t==="s"){list=m.l;sync()}else if(m.t==="full")gone("Room penuh (maksimal 6 pemain).")});
      hconn.on("close",()=>{if(settled)gone("Host keluar dari room.")})});
    peer.on("error",e=>{if(!settled)fail(e.type==="peer-unavailable"?"Room tidak ditemukan. Cek kodenya, atau minta host membuat room dulu.":"Tidak bisa terhubung ("+e.type+"). Cek internet lalu coba lagi.")});
  }})}
async function enter(c,isSolo,hostMode){
  const nm=$("nm").value.trim();$("err").textContent="";
  if(!nm){$("err").textContent="Isi nama dulu ya.";$("nm").focus();return}
  if(!isSolo&&!hostMode&&!/^[A-Z]{4}$/.test(c)){$("err").textContent="Kode room harus 4 huruf.";return}
  try{localStorage.setItem("mn",JSON.stringify({n:nm,a:me.av}))}catch(e){}
  me.name=nm;solo=isSolo;code=c;room=null;connOk=false;me.jt=Date.now();
  const lock=v=>{$("bMk").disabled=$("bJn").disabled=v};
  if(!isSolo){
    lock(true);$("err").textContent="Menyambung…";
    try{
      if(inClaude()){
        let cl=null;try{cl=await window.claude.use("room")}catch(e){}
        if(!cl)throw FAIL;
        room=await cl.join("menara-"+c.toLowerCase());
        off=room.onPeers(()=>sync(),e=>{$("lmsg").textContent="Koneksi room terputus ("+e.code+")."});
        offC=room.onConnection(v=>{connOk=v;stLine()},()=>{});
      }else if(hostMode){
        for(let k=0;k<5&&!room;k++){code=k?mkCode():c;try{room=await peerNet(code,true)}catch(e){if(e!=="ID")throw e}}
        if(!room)throw "Gagal membuat room. Coba lagi.";
      }else room=await peerNet(c,false);
      await room.presence({id:me.id,jt:me.jt,name:nm,av:me.av,ready:false,floors:0,fin:0,lastAt:0,round:0,cfg:me.cfg});
    }catch(e){$("err").textContent=typeof e==="string"?e:"Gagal masuk room ("+(e&&e.code||"error")+"). Coba lagi.";lock(false);room=null;return}
    lock(false);$("err").textContent=""}
  reset(0);
  $("tk").classList.toggle("hide",isSolo);$("slots").classList.toggle("hide",isSolo);$("st").classList.toggle("hide",isSolo);$("bRdy").textContent=isSolo?"MULAI":"SIAP";
  $("bLink").classList.toggle("hide",isSolo||inClaude());
  $("rc").textContent=code;show("s-lobby");stLine();sync()}
function stLine(){const n=peersNow().length;$("st").textContent=connOk?"Online, "+n+" pemain di room":"Menyambung ke room…";$("st").classList.toggle("ok",connOk)}
function push(p){Object.assign(me,p);if(room)room.presence(p)}
function reset(r0){me.round=r0;idx=0;over=false;ended=false;started=false;startAt=0;combo=0;typed=0;okc=0;prevLen=0;clearInterval(tick);clearInterval(crew.iv);lastSig="";
  push({ready:false,floors:0,fin:0,lastAt:0,round:r0,av:me.av,name:me.name});
  for(const k in tws){tws[k].el.remove();delete tws[k]}
  $("conf").innerHTML="";$("bRdy").textContent=solo?"MULAI":"SIAP";$("bRdy").classList.remove("b");$("typ").value="";$("typ").disabled=true;$("lmsg").textContent=""}
function peersNow(){const a=room?room.peers().filter(p=>p.presence&&p.presence.id).map(p=>p.presence):[me];return a.filter(p=>p.round===me.round).sort((a,b)=>(a.jt||0)-(b.jt||0)||(a.id<b.id?-1:1))}
const eff=ps=>({...DEF,...((ps[0]&&ps[0].cfg)||{})});
/* lobby */
function drawLobby(ps){
  const c=eff(ps),host=!ps.length||ps[0].id===me.id;
  const sig=ps.map(p=>p.id+p.name+p.av+p.ready).join("|")+JSON.stringify(c)+host;if(sig===lastSig)return;lastSig=sig;
  let h="";for(let i=0;i<6;i++){const p=ps[i];h+=p?`<div class="slot f${p.ready?" rd":""}" style="--c:${COL[p.av%6]};animation-delay:${i*.05}s">${ab(p)}<div><b>${esc(p.name)}${p.id===me.id?" (kamu)":""}</b><span>${i===0?"Host · ":""}${p.ready?"Siap":"Belum siap"}</span></div></div>`:`<div class="slot e"><div><b>Kosong</b><span>Menunggu pemain…</span></div></div>`}
  $("slots").innerHTML=h;
  document.querySelectorAll(".seg").forEach(sg=>{sg.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",String(c[sg.dataset.k])===b.dataset.v);b.disabled=!host})});
  $("tcfg").classList.toggle("hide",c.m!=="time");
  $("lmsg").textContent=host?(solo?"":"Kamu host: atur mode dan kesulitan. Game mulai saat semua pemain siap."):"Pengaturan diatur oleh host."}
document.querySelectorAll(".seg").forEach(sg=>sg.onclick=e=>{const b=e.target.closest("button");if(!b||b.disabled)return;
  const k=sg.dataset.k,v=k==="m"?b.dataset.v:+b.dataset.v;push({cfg:{...eff(peersNow()),[k]:v}});lastSig="";sync()});
function sync(){
  const ps=peersNow();
  if(scr==="lobby"){stLine();drawLobby(ps);if(me.ready&&ps.length&&ps.every(p=>p.ready)&&!startAt)launch(ps);return}
  if(scr==="game"){const ids=new Set(ps.map(p=>p.id));for(const k in tws)if(!ids.has(k)){tws[k].el.remove();delete tws[k]}
    fit(ps);ps.forEach(p=>tower(p));
    if(G.m==="race"){const w=ps.filter(p=>p.fin).sort((a,b)=>a.fin-b.fin)[0];if(w&&!ended)endGame(w)}}}
function fit(ps){const T=$("towers"),H=T.clientHeight,mx=Math.max(G.m==="race"?G.fl:15,...ps.map(p=>(p.floors||0)+2)),fh=Math.max(4,Math.min(32,(H-92-2*mx)/(mx+2.2)));T.style.setProperty("--fh",fh+"px");T.classList.toggle("xs",fh<13)}
/* game */
function launch(ps){startAt=1;const c=eff(ps);G={m:c.m,d:c.d,t:c.t,fl:FLS[c.d]};list=mkList();idx=0;
  for(const k in tws){tws[k].el.remove();delete tws[k]}
  show("s-game");$("cw").innerHTML='<span class="rdy">Bersiap…</span>';$("nx").textContent="";
  $("tm").innerHTML=G.m==="time"?"<small>WAKTU</small><b>"+G.t+"</b>":"<small>WAKTU</small><b>0:00</b>";$("wpm").innerHTML="<small>KECEPATAN</small><b>0</b>";stat();$("bar").style.width="0";sync();
  crew();cue("MARI BANGUN!",true);setTimeout(()=>{let n=3;(function step(){cue(n>0?n:"GO!");if(n>0){n--;setTimeout(step,900)}else{crewGo();begin()}})()},3700)}
function cue(t,big){const b=$("ovn");b.textContent=t;b.className=big?"t":"";b.style.color=t==="GO!"?"#ffe14d":"";
  b.animate([{transform:"scale(2.2)",opacity:0,filter:"blur(14px)"},{transform:"scale(1)",opacity:1,filter:"blur(0)",offset:.25},{transform:"scale(1.06)",opacity:1,filter:"blur(0)",offset:.7},{transform:"scale(.55)",opacity:0,filter:"blur(10px)"}],{duration:big?2400:900,easing:"cubic-bezier(.2,.8,.3,1)"});
  $("ovr").animate([{transform:"scale(.2)",opacity:.9},{transform:"scale(3.4)",opacity:0}],{duration:big?1300:850,easing:"ease-out"})}
function stat(){$("combo").innerHTML="<small>COMBO</small><b>"+combo+"</b>";$("combo").classList.toggle("on",combo>=3);$("fl").innerHTML="<small>LANTAI</small><b>"+idx+(G.m==="race"?"/"+G.fl:"")+"</b>"}
function begin(){started=true;t0=Date.now();const i=$("typ");i.disabled=false;i.value="";i.focus();drawWord();
  tick=setInterval(()=>{const el=(Date.now()-t0)/1000;
    if(G.m==="time"){const r=Math.max(0,Math.ceil(G.t-el));$("tm").innerHTML="<small>WAKTU</small><b>"+r+"</b>";$("bar").style.width=(100-el/G.t*100)+"%";if(el>=G.t)timeUp()}
    else{$("tm").innerHTML="<small>WAKTU</small><b>"+Math.floor(el/60)+":"+String(Math.floor(el%60)).padStart(2,"0")+"</b>"}
    $("wpm").innerHTML="<small>KECEPATAN</small><b>"+Math.round(idx/Math.max(el/60,.05))+"</b>"},250)}
function drawWord(){const w=list[idx]||"",v=$("typ").value;
  $("cw").innerHTML=[...w].map((c,k)=>`<b class="k ${k<v.length?(v[k]===c?"g":"x"):k===v.length?"n":""}">${c}</b>`).join("");
  $("nx").textContent=list.slice(idx+1,idx+4).join("    ·    ");if(G.m==="race")$("bar").style.width=(idx/G.fl*100)+"%"}
function popup(t){const e=document.createElement("div");e.className="cpop";e.textContent=t;$("scene").appendChild(e);
  e.animate([{transform:"translate(-50%,20px) scale(.3)",opacity:0},{transform:"translate(-50%,0) scale(1.2)",opacity:1,offset:.3},{transform:"translate(-50%,-50px) scale(1)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>e.remove()}
$("typ").addEventListener("input",e=>{
  if(!started||over)return;
  const v=e.target.value.trim().toLowerCase(),w=list[idx];e.target.value=v;
  if(v.length>prevLen){typed++;if(w.startsWith(v))okc++;else{combo=0;stat()}}
  prevLen=v.length;e.target.classList.toggle("err",!w.startsWith(v));
  if(v===w){
    const g=$("cw").cloneNode(true);g.removeAttribute("id");g.className="cw ghost";$("cwrap").appendChild(g);
    g.animate([{transform:"none",opacity:1},{transform:"translateY(-60px) scale(1.4)",opacity:0}],{duration:450,easing:"ease-out"}).onfinish=()=>g.remove();
    idx++;combo++;prevLen=0;e.target.value="";stat();if(combo>=2)cpop();
    if(G.m==="race"&&idx>=G.fl){over=true;e.target.disabled=true;push({floors:idx,lastAt:Date.now(),fin:Date.now()})}else push({floors:idx,lastAt:Date.now()});
    drawWord();$("cw").animate([{transform:"translateY(22px) scale(.7)",opacity:0},{transform:"none",opacity:1}],{duration:300,easing:"cubic-bezier(.2,1.6,.4,1)"});
    sync();return}
  drawWord()});
$("pnl").onclick=()=>{if(started)$("typ").focus()};
/* tower */
const CR=`<svg viewBox="0 0 220 300"><defs><pattern id="lt" width="8" height="12" patternUnits="userSpaceOnUse"><path d="M0 12L8 0M8 12L0 0" stroke="currentColor" stroke-width="1.4" fill="none"/></pattern></defs><rect x="96" y="56" width="14" height="244" fill="url(#lt)" stroke="currentColor" stroke-width="2"/><rect x="84" y="56" width="22" height="14" rx="2" fill="currentColor"/><rect x="88" y="59" width="9" height="7" fill="#dff3ff"/><rect x="78" y="288" width="50" height="12" rx="2" fill="currentColor"/><rect x="70" y="296" width="66" height="4" fill="currentColor"/><g stroke="currentColor" stroke-width="2.5" fill="none"><rect x="132" y="236" width="68" height="64"/><path d="M132 258H200M132 279H200M155 236V300M178 236V300"/></g><path d="M103 18L94 48H112Z" fill="currentColor"/><circle cx="103" cy="16" r="3" fill="#ff4d4d" style="animation:fk 1.2s infinite"/><g class="jb"><rect x="10" y="48" width="200" height="8" fill="currentColor"/><path d="M103 20L14 48M103 20L206 48" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="55" width="28" height="18" fill="currentColor"/><g class="tr"><rect x="146" y="56" width="8" height="5" fill="currentColor"/><line x1="150" y1="61" x2="150" y2="128" stroke="currentColor" stroke-width="1.5"/><g class="ld"><rect x="136" y="128" width="28" height="16" fill="currentColor"/><rect x="136" y="128" width="28" height="4" fill="#fff" opacity=".4"/></g></g></g></svg>`;
$("bgm2").innerHTML=$("bgm").innerHTML=[[-5,62,.32,0],[28,88,.4,-6],[62,70,.3,-12]].map(([l,h,o,d])=>CR.replace("<svg ",`<svg style="left:${l}%;height:${h}%;opacity:${o};--dl:${d}s" `)).join("");
const WKS=v=>`<div class="fz"><svg viewBox="0 0 30 46" width="30" height="46"><g class="lgL"><rect x="9" y="30" width="5" height="13" rx="2" fill="#2d3a6b"/><rect x="8" y="42" width="7" height="4" rx="2" fill="#3b2a1e"/></g><g class="lgR"><rect x="16" y="30" width="5" height="13" rx="2" fill="#2d3a6b"/><rect x="15" y="42" width="7" height="4" rx="2" fill="#3b2a1e"/></g><g class="bd"><rect x="7" y="16" width="16" height="16" rx="4" fill="${v}"/><rect x="7" y="23" width="16" height="3" fill="#fff" opacity=".85"/><circle cx="15" cy="10" r="6.5" fill="#ffcfa0"/><circle cx="17.5" cy="10.5" r="1" fill="#222"/><path d="M8 9a7 7 0 0 1 14 0z" fill="#ffd23f"/><rect x="6.5" y="8.5" width="17" height="2.5" rx="1.2" fill="#f0b400"/><g class="arm"><rect x="20" y="17" width="4" height="12" rx="2" fill="${v}"/><rect x="21.2" y="27" width="1.6" height="10" fill="#8a5a2b"/><rect x="18" y="35" width="8" height="4" rx="1" fill="#777"/></g></g></svg></div>`;
function crew(){clearInterval(crew.iv);const c=$("crew"),sb=$("scene").getBoundingClientRect(),ts=[...$("towers").querySelectorAll(".tw")],ws=[];c.innerHTML="";
  ts.forEach((el,i)=>{const r=el.getBoundingClientRect(),k=Math.max(.55,Math.min(1,r.width/100)),cx=r.left-sb.left+r.width/2,v=el.style.getPropertyValue("--c");
    [-1,1].forEach(d=>{const w=document.createElement("div");w.className="wk walk"+(d>0?" rt":"");
      w.style.cssText=`--s:${k};--d:-${(Math.random()*.5).toFixed(2)}s;left:${d<0?-40:sb.width+40}px`;w.innerHTML=WKS(v)+(d<0?'<b class="sp">'+['Ayo!','Semangat!','Siap!','Bangun!'][i%4]+'</b>':'');c.appendChild(w);ws.push([w,d,cx+d*(r.width*.39+10*k)])})});
  requestAnimationFrame(()=>requestAnimationFrame(()=>ws.forEach(([w,,x])=>w.style.left=x+"px")));
  setTimeout(()=>{ws.forEach(([w])=>w.classList.replace("walk","work"));crew.iv=setInterval(()=>setTimeout(()=>ws.forEach(([w,d])=>puff(c,w,d)),250),550)},1750);crew.ws=ws}
function puff(c,w,d){const k=parseFloat(w.style.getPropertyValue("--s"))||1,e=document.createElement("i");e.className="dust";e.style.left=(parseFloat(w.style.left)+(d<0?14:-14)*k)+"px";c.appendChild(e);
  e.animate([{transform:"translate(0,0) scale(.5)",opacity:.9},{transform:`translate(${d<0?8:-8}px,-16px) scale(1.8)`,opacity:0}],{duration:520,easing:"ease-out"}).onfinish=()=>e.remove()}
function crewGo(){clearInterval(crew.iv);document.querySelectorAll("#crew .sp").forEach(e=>e.remove());
  (crew.ws||[]).forEach(([w,d])=>{w.classList.replace("work","cheer");
    setTimeout(()=>{w.classList.remove("cheer");w.classList.add("walk");w.classList.toggle("rt",d<0);w.style.left=(d<0?-60:$("scene").clientWidth+60)+"px"},1000)})}
function add(t){if(t.roof)t.roof.remove();
  const f=document.createElement("div");f.className="fl";f.innerHTML="<s></s><s></s><s></s>";t.stack.appendChild(f);t.n++;
  const r=document.createElement("div");r.className="rw";r.innerHTML='<div class="roof"></div>'+(G.m==="race"&&t.n>=G.fl?'<div class="flag"></div>':"");
  t.stack.appendChild(r);t.roof=r;return f}
function tower(p,map=tws,host=$("towers")){
  let t=map[p.id];
  if(!t){const el=document.createElement("div");el.className="tw in";
    el.innerHTML='<div class="mast"></div><i class="bs"></i><div class="jib"></div><div class="stack"></div><div class="nm"></div><div class="hook"><i class="rope"></i><i class="blk"></i></div>';
    host.appendChild(el);
    t=map[p.id]={el,stack:el.querySelector(".stack"),hook:el.querySelector(".hook"),rope:el.querySelector(".rope"),blk:el.querySelector(".blk"),n:0,want:0,roof:null,L:4,v:0,th:0,om:0,st:"rise",ph:Math.random()*6,mine:false,sw:0,start:performance.now()+1350};
    el.animate([{transform:"translateY(60px) scale(.6)",opacity:0},{transform:"none",opacity:1}],{duration:600,easing:"cubic-bezier(.2,1.6,.4,1)"})}
  t.el.style.setProperty("--c",COL[p.av%6]);t.el.querySelector(".nm").textContent=p.name+(p.id===me.id?" (kamu)":"");t.mine=p.id===me.id;
  const n=p.floors||0;
  if(n<t.n){t.stack.innerHTML="";t.n=0;t.roof=null;t.st="rise"}
  t.want=n;while(t.want-t.n>3)add(t)}
function dropped(t){const f=add(t);t.blk.style.display="none";t.st="rise";t.om+=(Math.random()-.5)*1.4;landed(t,f,t.mine)}
let lastT=performance.now();
function loop(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  for(const M of [tws,dws])for(const k in M){const t=M[k];if(!t.el.isConnected||now<t.start)continue;const FH=parseFloat(t.el.parentNode.style.getPropertyValue("--fh"))||24;
    const top=t.stack.offsetTop,pend=t.want-t.n,rh=t.roof?t.roof.offsetHeight:0,hov=Math.max(14,top-14-FH-22),land=top+rh-2-FH-22,w=t.stack.offsetWidth||40;
    if(t.sw!==w){t.sw=w;t.blk.style.width=w+"px";t.blk.style.left=-w/2+"px"}
    let Lt=hov,rate=2.6,lock=false;
    if(t.st==="rise"){Lt=4;rate=8;lock=true;
      if(t.L<9){t.st="lower";t.blk.style.display="block";t.blk.animate([{transform:"scale(.3)",opacity:0},{transform:"none",opacity:1}],{duration:280,easing:"cubic-bezier(.2,1.6,.4,1)"})}}
    if(t.st==="lower"&&pend>0){t.st="drop";if(t.roof)t.roof.animate([{opacity:1},{opacity:0}],{duration:280,fill:"forwards"})}
    if(t.st==="drop"){Lt=land+10;rate=pend>1?13:8;lock=true;if(t.L>=land-.5)dropped(t)}
    t.v+=((Lt-t.L)*rate*rate-2*rate*t.v)*dt;t.L+=t.v*dt;
    const th0=lock?0:Math.sin(now/1900+t.ph)*.07;t.om+=(-6*(t.th-th0)-(lock?7:1.3)*t.om)*dt;t.th+=t.om*dt;
    t.hook.style.transform=`rotate(${t.th}rad)`;t.rope.style.height=t.L+"px";t.blk.style.top=t.L+"px";t.blk.style.transform=`rotate(${-t.th*.7}rad)`}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function fx(t,f,chars,n,dist){const r=f.getBoundingClientRect(),b=t.el.getBoundingClientRect();
  for(let i=0;i<n;i++){const e=document.createElement("span");e.className="pt";e.textContent=chars[i%chars.length];
    e.style.left=(r.left-b.left+r.width*Math.random())+"px";e.style.top=(r.top-b.top+r.height/2)+"px";t.el.appendChild(e);
    const a=Math.random()*Math.PI*2,d=dist*(.5+Math.random());
    e.animate([{transform:"translate(0,0) scale(.4) rotate(0)",opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-24}px) scale(1.3) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:600+Math.random()*400,easing:"ease-out"}).onfinish=()=>e.remove()}}
function landed(t,f,mine){
  if(!f.isConnected)return;
  const els=[...t.stack.querySelectorAll(".fl")].slice(-12);
  els.forEach((e,i)=>{if(e!==f)e.animate([{transform:"none"},{transform:"scale(1.05,.86)"},{transform:"scale(.98,1.04)"},{transform:"none"}],{duration:420,delay:(els.length-i)*26})});
  fx(t,f,["•","·","○"],6,38);fx(t,f,["✦","✧","★"],8,56);
  const r=f.getBoundingClientRect(),b=t.el.getBoundingClientRect(),pl=document.createElement("span");
  pl.className="pt p";pl.textContent="+1";pl.style.left=(r.left-b.left+r.width/2-10)+"px";pl.style.top=(r.top-b.top-14)+"px";t.el.appendChild(pl);
  pl.animate([{transform:"translateY(0) scale(.5)",opacity:1},{transform:"translateY(-56px) scale(1.4)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>pl.remove();
  if(mine)$("scene").animate([{transform:"translate(0,0)"},{transform:"translate(-3px,3px)"},{transform:"translate(3px,-2px)"},{transform:"translate(0,0)"}],{duration:240})}
function cpop(){const o=$("scene").querySelector(".cmbp");if(o)o.remove();const e=document.createElement("div");e.className="cmbp";e.innerHTML="<small>COMBO</small><b>x"+combo+"</b>";$("scene").appendChild(e);
  e.animate([{transform:"translate(-50%,10px) scale(.6)",opacity:0},{transform:"translate(-50%,0) scale(1.15)",opacity:.7,offset:.2},{transform:"translate(-50%,-8px) scale(1)",opacity:.6,offset:.6},{transform:"translate(-50%,-26px) scale(.95)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>e.remove()}
function siteInit(){const st=$("site");(siteInit.iv||[]).forEach(clearInterval);siteInit.iv=[];st.innerHTML="";
  const W=innerWidth,k=Math.max(.6,Math.min(1,W/520)),T=[...$("demo").querySelectorAll(".tw")].map(el=>({cx:el.offsetLeft+el.offsetWidth/2,o:el.offsetWidth*.39+10*k,v:el.style.getPropertyValue("--c")}));
  const mk=(x,cls,html,o)=>{o=o||{};const w=document.createElement("div");w.className="wk "+cls;w.style.cssText="--s:"+k+";left:"+x+"px;bottom:"+(o.b||0)+"px;--d:-"+(Math.random()*.5).toFixed(2)+"s;transition:left 3.6s ease-in-out";w.innerHTML=html;st.appendChild(w);return w};
  [W*.05,W*.95].forEach(x=>{const e=document.createElement("i");e.className="pile";e.style.cssText="left:"+x+"px;--s:"+k;st.appendChild(e)});
  const ham=[],car=[];
  T.forEach((t,i)=>{const d=i===T.length-1?-1:1;ham.push([mk(t.cx+d*t.o,"work"+(d>0?" rt":""),WKS(t.v)),d])});
  if(T.length>2){[[W*.05+26*k,T[0].cx-T[0].o,"#ff5c97",-4],[W*.95-26*k,T[2].cx+T[2].o,"#ffc21a",-4],[W*.05+26*k,T[1].cx-T[1].o,"#b36bff",-10]].forEach(([a,b,v,bt])=>car.push([mk(a,"walk carry",WKS(v)+'<i class="brk"></i>',{b:bt}),a,b]))}
  const boss=mk(W*.5,"idle",WKS("#2b2b3a").replace(/#ffd23f/g,"#fff").replace(/#f0b400/g,"#d8d8d8")+'<b class="sp" style="opacity:1;font-size:13px"></b>',{b:-20}),
    sp=boss.querySelector(".sp"),say=["Cepat!","Ayo kerja!","Jangan malas!","Bata mana?","Rapikan!","Semangat!"];let bi=0,to=0;
  const talk=()=>{sp.textContent=say[bi++%say.length];sp.animate([{transform:"translateX(-50%) scale(.4)",opacity:0},{transform:"translateX(-50%) scale(1)",opacity:1}],{duration:300,easing:"cubic-bezier(.2,1.6,.4,1)"});boss.classList.toggle("rt",bi%2===0)};
  const tick=()=>{to^=1;car.forEach(([w,a,b])=>{const tg=to?b:a,fr=to?a:b;w.classList.toggle("rt",tg<fr);w.classList.toggle("carry",!!to);w.style.left=tg+"px"})};
  setTimeout(tick,60);talk();
  siteInit.iv=[setInterval(tick,4000),setInterval(talk,2400),setInterval(()=>setTimeout(()=>ham.forEach(([w,d])=>puff(st,w,d)),250),550)]}
function demoInit(){const d=$("demo"),H=d.clientHeight||400,fh=Math.max(10,Math.min(26,(H-92-22)/13.2));d.style.setProperty("--fh",fh+"px");
  [["Raka",0],["Nina",3],["Doni",5]].forEach(([nm,av],i)=>{const p={id:"demo"+i,name:nm,av,floors:0};tower(p,dws,d);
    (function go(){setTimeout(()=>{if(scr!=="game"){p.floors=p.floors>=9?0:p.floors+1;tower(p,dws,d)}go()},p.floors>=9?2600:500+Math.random()*900+i*150)})()})}
demoInit();
siteInit();let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(siteInit,250)});
(function(){document.querySelectorAll(".wst").forEach(st=>{for(let i=0;i<45;i++){const e=document.createElement("i");e.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*50}%;animation-delay:-${Math.random()*2}s`;st.appendChild(e)}});
  let h="";for(let i=0;i<14;i++){const m=Math.abs(i-6.5);h+=`<i style="height:${30+Math.random()*40+(m<2?30:0)}%;--dl:-${(Math.random()*3).toFixed(1)}s"></i>`}$("city").innerHTML=h;
  const k=Math.max(.6,Math.min(1,innerWidth/520));for(let i=0;i<7;i++){const w=document.createElement("div");w.className="wk party"+(i%2?" rt":"");w.style.cssText=`--s:${k};--d:-${(Math.random()*.6).toFixed(2)}s;left:${(i+.5)/7*100}%`;w.innerHTML=WKS(COL[i%6]);$("party").appendChild(w)}
  const cf=$("conf2");for(let i=0;i<46;i++){const e=document.createElement("i");e.style.cssText=`--x:${Math.random()*100}%;--c:${COL[i%6]};--d:${4+Math.random()*4}s;--r:${Math.random()*900}deg;animation-delay:-${Math.random()*6}s`;cf.appendChild(e)}})();
function firework(){if(!document.body.classList.contains("res"))return;const w=$("win"),x=10+Math.random()*80,y=8+Math.random()*30,c=COL[Math.random()*6|0];
  for(let i=0;i<16;i++){const e=document.createElement("i");e.className="fwp";e.style.cssText=`left:${x}%;top:${y}%;background:${c}`;w.appendChild(e);
    const a=i/16*Math.PI*2,d=60+Math.random()*30;e.animate([{transform:"translate(0,0) scale(1)",opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+20}px) scale(.3)`,opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>e.remove()}}
setInterval(firework,700);
/* end */
function confetti(){const c=$("conf");for(let i=0;i<80;i++){const s=document.createElement("i");s.style.cssText=`--x:${Math.random()*100}%;--c:${COL[i%6]};--d:${2+Math.random()*2.5}s;--r:${Math.random()*900}deg;animation-delay:${Math.random()*.9}s`;c.appendChild(s)}}
function banner(t){cue(t,true)}
function finishAnim(win,t){ended=true;started=false;over=true;clearInterval(tick);$("typ").disabled=true;$("typ").blur();
  myWpm=Math.round(idx/Math.max((Math.min(Date.now()-t0,G.m==="time"?G.t*1000:1e9))/60000,.05));
  banner(t);if(win)confetti();setTimeout(result,2600)}
function endGame(w){if(tws[w.id])tws[w.id].el.classList.add("win");finishAnim(w.id===me.id,w.id===me.id?"KAMU MENANG!":w.name+" MENANG!")}
function timeUp(){if(ended)return;push({fin:Date.now()});finishAnim(false,"WAKTU HABIS!")}
function result(){
  const ps=peersNow().sort((a,b)=>G.m==="race"?((b.fin?1:0)-(a.fin?1:0)||(a.fin&&b.fin?a.fin-b.fin:b.floors-a.floors)):(b.floors-a.floors||(a.lastAt||0)-(b.lastAt||0)));
  const top=ps[0];$("rt").textContent=top?(top.id===me.id?"KAMU JUARA!":esc(top.name)+" JUARA!"):"HASIL";
  $("rs").textContent=(G.m==="race"?"Balapan "+G.fl+" lantai":"Mode waktu "+G.t+" detik")+" · "+DN[G.d];
  const ord=[1,0,2].filter(i=>ps[i]),hs=[190,140,100],cs=[["#ffd23f","#e09a00"],["#cfd8e3","#8e9bb0"],["#e0925a","#a85d28"]];
  $("pod").innerHTML=ord.map(i=>`<div class="pc">${ab(ps[i],54)}<div class="n">${esc(ps[i].name)}</div><div class="stp" style="--h:${hs[i]}px;--c:${cs[i][0]};--d:${cs[i][1]};--w:${[.6,.3,0][i]}s">${i+1}</div></div>`).join("");
  $("rl").innerHTML=ps.slice(3).map((p,i)=>`<div class="li" style="animation-delay:${.8+i*.1}s"><span>${i+4}. ${esc(p.name)}</span><span>${p.floors} lantai</span></div>`).join("");
  $("sts").innerHTML=`<span>${myWpm} kata/menit</span><span>Akurasi ${typed?Math.round(okc/typed*100):100}%</span><span>${idx} lantai</span>`;
  show("s-res")}
/* ui */
$("bMk").onclick=()=>enter(mkCode(),false,true);
$("bJn").onclick=()=>enter($("cd").value.trim().toUpperCase(),false,false);
$("bSolo").onclick=()=>enter(mkCode(),true,true);
$("bLink").onclick=()=>{const u=location.href.split("?")[0].split("#")[0]+"?r="+code;try{navigator.clipboard.writeText(u);$("cpy").textContent="Link undangan disalin"}catch(e){$("cpy").textContent=u}};
try{const r=new URLSearchParams(location.search).get("r");if(r){$("cd").value=r.toUpperCase().slice(0,4);$("nm").focus()}}catch(e){}
$("bHow").onclick=()=>$("how").classList.toggle("hide");
$("bRdy").onclick=()=>{const r=!me.ready;push({ready:r});if(!solo){$("bRdy").textContent=r?"BATAL SIAP":"SIAP";$("bRdy").classList.toggle("b",r)}lastSig="";sync()};
$("rc").onclick=()=>{try{navigator.clipboard.writeText(code);$("cpy").textContent="Kode disalin"}catch(e){}};
function leave(){clearInterval(tick);if(off)off();if(offC)offC();if(room)room.leave();room=null;location.reload()}
$("bBack").onclick=leave;$("bMenu").onclick=leave;$("bQuit").onclick=leave;
$("bAgain").onclick=()=>{reset(me.round+1);show("s-lobby");sync()};
function theme(t){document.body.classList.toggle("night",t==="night");document.querySelectorAll("#thm button").forEach(b=>b.classList.toggle("on",b.dataset.th===t));try{localStorage.setItem("mnT",t)}catch(e){}}
$("thm").onclick=e=>{const b=e.target.closest("button");if(b)theme(b.dataset.th)};
let th0="day";try{th0=localStorage.getItem("mnT")||"day"}catch(e){}theme(th0);