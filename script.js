const COL=["#ff7a30","#38c6a1","#ffc21a","#8a6bff","#ff5c97","#3b9bff"];
const POOL=[
"api air bata kayu batu cat tali lampu pintu atap besi tiang kunci pagar awan angin bukit candi bambu teman dunia senja fajar roda kapal bumi hujan darat laut pasir tanah daun buah bunga rumah meja kursi buku".split(" "),
"menara jendela tangga semen pondasi dinding lantai balok kubah gerbang genteng bendera puncak tinggi kokoh megah cepat bangun susun rapi benteng istana gapura jembatan semangat juara lomba cahaya langit sekolah kampus komputer keyboard layanan program".split(" "),
"arsitektur konstruksi pembangunan kemenangan perlombaan keberanian kesempatan kebersamaan pengetikan ketangguhan kecepatan ketelitian pencakarlangit bertingkat perkembangan penyelesaian pengalaman persahabatan tantangan kesungguhan pertandingan pengetahuan".split(" ")];
const FLS=[10,15,20],DN=["Mudah","Normal","Susah"],DEF={m:"race",d:1,t:60,s:0,bl:1,mp:0},SK_EVERY=5;
const SK=[{id:"wind",r:2,n:"ANGIN BELIUNG",ic:"🌪️",d:2,t:"a",ds:"Musuh -2 lantai"},{id:"birds",r:3,n:"KAWANAN BURUNG",ic:"🐦",d:3,t:"a",ds:"Musuh -3 lantai"},{id:"plane",r:1,n:"PESAWAT NABRAK",ic:"✈️",d:1,t:"a",ds:"Musuh -1 lantai"},{id:"storm",r:1,n:"BADAI PETIR",ic:"⚡",d:1,t:"a",ds:"Musuh -1 lantai"},{id:"quake",r:2,n:"GEMPA",ic:"🌋",d:2,t:"a",ds:"Musuh -2 lantai"},{id:"bomb",r:1,n:"BOM PESAWAT",ic:"💣",d:1,t:"a",ds:"Musuh -1 lantai"},{id:"shield",r:1,n:"PELINDUNG",ic:"🛡️",d:0,t:"s",ds:"Tangkis 1 serangan"},{id:"triple",r:2,n:"LANTAI ×3",ic:"🏗️",d:0,t:"s",ds:"2 kata berikut +3 lantai"},{id:"fog",r:3,n:"KABUT TEBAL",ic:"🌫️",d:0,x:1,t:"a",ds:"3 kata musuh: 2 huruf buram"},{id:"dizzy",r:3,n:"HURUF PUSING",ic:"🌀",d:0,x:1,t:"a",ds:"3 kata musuh diacak hurufnya"},{id:"octo",r:4,n:"CENGKERAMAN GURITA",ic:"🐙",d:0,x:1,lk:5,t:"a",ds:"Lawan tak bisa bangun 5 detik"},{id:"freeze",r:4,n:"BEKU TOTAL",ic:"🧊",d:0,x:1,lk:7,t:"a",ds:"Menara lawan beku 7 detik"},{id:"turbo",r:3,n:"TURBO BOOST",ic:"🚀",d:0,t:"s",c:"tbo",ds:"Bangun 2× lebih cepat, 7 detik"},{id:"luck",r:4,n:"KEBERUNTUNGAN",ic:"🍀",d:0,t:"s",c:"lky",ds:"2 skill berikut cukup 2 kata benar"},{id:"hole",r:5,n:"LUBANG HITAM",ic:"🕳️",d:0,t:"a",ar:1,tk:8,c:"bh",ds:"Semua musuh -1 lantai tiap detik, 8 detik"},{id:"roots",r:5,n:"AKAR MERAMBAT",ic:"🌳",d:0,t:"a",ar:1,tk:6,c:"rts",ds:"Semua musuh -1 lantai tiap detik dan tak bisa nambah lantai, 6 detik"},{id:"bet",r:5,n:"LAST BET",ic:"🎲",d:0,t:"s",lg:1,c:"bet",ds:"4 kata beruntun tanpa salah: +10 lantai. Gagal: -8 lantai"},{id:"dragon",r:5,n:"DRAGON GUARDIAN",ic:"🐉",d:0,t:"s",lg:1,c:"drg",ds:"Kebal semua efek skill lawan 15 detik"}],BUF=2,PICK_MS=8000,TB_MS=7000,LK_NEED=2,LK_N=2,K_TB=12,K_LK=13,K_BET=16,K_DRG=17,BET_N=4,BET_UP=10,BET_DN=8,BET_MIN=9,DRG_MS=15000;
/* tingkat kelangkaan skill: 1 Biasa, 2 Bagus, 3 Langka, 4 Epik, 5 Legendaris. SK_W = bobot muncul di pilihan (makin kecil makin jarang) */
const SK_RAR=["","BIASA","BAGUS","LANGKA","EPIK","LEGENDARIS"],SK_RD=["","skill dasar","lumayan kuat","efek besar","mengubah jalannya permainan","efek dahsyat yang mengubah jalannya pertandingan, sangat jarang muncul"],SK_W=[0,10,8,6,4,1.5];
function rollSet(fl,nb){const p=SK.map((_,i)=>i).filter(k=>k!==K_BET||(fl>=BET_MIN&&!nb)),o=[];while(o.length<3){let t=0;p.forEach(k=>t+=SK_W[SK[k].r]);let x=Math.random()*t,j=0;for(;j<p.length-1;j++){x-=SK_W[SK[p[j]].r];if(x<0)break}o.push(p.splice(j,1)[0])}return o}
const $=id=>document.getElementById(id);
const ST={far:1,txu:1,txr:1,lite:null};try{Object.assign(ST,JSON.parse(localStorage.getItem("mnP")||"{}"))}catch(e){}
if(ST.lite==null)ST.lite=((navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4)&&innerWidth<800?1:0;
const put=(id,h)=>{const e=$(id);if(e.innerHTML!==h)e.innerHTML=h},nop=()=>{};
function ambient(on){on=!!on;if(on===ambient.on)return;ambient.on=on;if(on)siteInit();else{(siteInit.iv||[]).forEach(clearInterval);siteInit.iv=[]}}ambient.on=true;
const me={id:Math.random().toString(36).slice(2,8),jt:Date.now(),host:false,name:"",av:0,ready:false,floors:0,fin:0,lastAt:0,round:0,cfg:{...DEF}};
let room=null,code="",solo=false,off=null,offC=null,connOk=false,scr="menu",started=false,over=false,ended=false,startAt=0,list=[],idx=0,combo=0,t0=0,tick=null,typed=0,okc=0,prevLen=0,lastSig="",myWpm=0,G={m:"race",d:1,t:60,fl:15,s:0},fc=0,seen={},lastSk=-1;
let dz=null;const tws={},dws={};let skq=0,pickOn=false,pickTo=0,pickSet=[];
let ck=0,lkC=0,tbEnd=0;const tbOn=()=>tbEnd>Date.now();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ab=(p,s)=>{const n=String(p.bot?String(p.name||"?").replace(/^Bot\s+/,""):(p.name||"?"));return `<i class="ab${p.bot?" bt":""}" style="--c:${COL[p.av%6]};--s:${s||44}px">${esc((n[0]||"?").toUpperCase())}${p.bot?"<u>🤖</u>":""}</i>`};
function seedRng(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%100000)/100000}}
function mkList(){const r=seedRng(code+me.round+G.d+G.m),p=POOL[G.d],n=G.m==="race"&&!G.s?G.fl+4:300,a=[];let last="";for(let i=0;i<n;i++){let w;do{w=p[Math.floor(r()*p.length)]}while(w===last);a.push(w);last=w}return a}
function mkCode(){const A="ABCDEFGHJKLMNPQRSTUVWXYZ";let s="";for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s}
function show(id){SFX.scene(id);scr=id.slice(2);document.body.classList.toggle("res",id==="s-res");document.body.classList.toggle("playing",id==="s-game");ambient(id==="s-menu"||id==="s-lobby");document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));window.scrollTo(0,0)}
(function(){const b=$("bg");for(let i=0;i<16;i++){const e=document.createElement("i"),s=20+Math.random()*60;e.style.cssText=`left:${Math.random()*100}%;width:${s}px;height:${s}px;animation-duration:${14+Math.random()*20}s;animation-delay:-${Math.random()*30}s`;b.appendChild(e)}
let h="";"TYPING TOWER".split(" ").forEach((w,k)=>{h+='<span class="wd">'+[...w].map((c,i)=>`<b style="--i:${i+k*6};--sh:${k?"#1b63c2":"#d9381e"}">${c}</b>`).join("")+"</span>"});$("ttl").innerHTML=h;
let m="";COL.slice(0,5).forEach((c,i)=>m+=`<i style="--c:${c};--n:${i}"></i>`);$("mt").innerHTML=m+`<i style="--c:#ff5c4d;--n:5"></i>`;
let a="";COL.forEach((c,i)=>a+=`<button data-i="${i}" style="--c:${c}"></button>`);$("sw").innerHTML=a;
try{const s=JSON.parse(localStorage.getItem("mn")||"{}");if(s.n)$("nm").value=s.n;me.av=s.a|0}catch(e){}
pick(me.av);$("sw").onclick=e=>{const b=e.target.closest("button");if(b)pick(+b.dataset.i)}})();
function pick(i){me.av=i;document.querySelectorAll("#sw button").forEach((b,k)=>b.classList.toggle("on",k===i))}
/* connect */
const FAIL="Online belum bisa tersambung di claude.ai. Pastikan kamu login dan temanmu diberi akses (Share). Sementara itu pakai Latihan Solo.";
/* ===== KONFIGURASI JARINGAN (main lintas internet / global) =====
   Pemain tidak perlu satu WiFi. Alurnya: (1) signaling lewat server PeerJS di internet,
   (2) koneksi langsung antar pemain lewat WebRTC, (3) bila jaringan memblokir koneksi langsung
   (NAT ketat / data seluler / kantor / kampus), lalu lintas dilewatkan server TURN.
   Server TURN publik gratis bisa penuh atau lambat. Untuk jaminan stabil, isi TURN milikmu sendiri di bawah. */
const NET={
  prefix:"mnr-ngetik-",
  /* Server signaling dicoba berurutan. {} = server cloud PeerJS bawaan.
     Server sendiri (disarankan untuk produksi): {host:"peer.domainmu.com",port:443,path:"/",secure:true,key:"peerjs"} */
  servers:[{}],
  stun:["stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun.cloudflare.com:3478","stun:global.stun.twilio.com:3478"],
  turn:[
    {urls:["turn:openrelay.metered.ca:80","turn:openrelay.metered.ca:443","turn:openrelay.metered.ca:80?transport=tcp","turn:openrelay.metered.ca:443?transport=tcp","turns:openrelay.metered.ca:443?transport=tcp"],username:"openrelayproject",credential:"openrelayproject"}
    /* Tambahkan TURN milikmu di sini, contoh:
       ,{urls:["turn:turn.domainmu.com:3478","turns:turn.domainmu.com:443?transport=tcp"],username:"user",credential:"pass"} */
  ],
  /* Opsional: akun gratis metered.ca (20 GB/bulan). Isi dua nilai ini agar kredensial TURN diambil otomatis dan lebih andal. */
  /* TURN dari dashboard Metered (Credentials): tempel Username dan Password di sini */
  meteredUser:"b5ea99ba19bdcb73e1fcfe2e",  /* contoh: "b5ea99ba19bdcb73e1fcfe2e" */
  meteredPass:"1WSdBcSlMUIFVpvZ",  /* password dari tombol REVEAL / salin di dashboard */
  meteredApp:"",   /* contoh: "namaapp" (dari namaapp.metered.live) */
  meteredKey:"",   /* API key dari dashboard Metered */
  sigTimeout:10000,   /* batas waktu terhubung ke server signaling */
  p2pTimeout:20000    /* batas waktu terhubung ke host setelah signaling */
};
const P2P_FAIL="Server online terhubung, tapi koneksi ke host gagal. Jaringan salah satu pemain mungkin memblokir koneksi. Coba ganti jaringan (WiFi atau data seluler) lalu ulangi.";
const P2P_NORELAY="Koneksi langsung ke host gagal, dan server relay (TURN) tidak bisa dijangkau, jadi pemain di jaringan berbeda tidak bisa tersambung. Isi TURN milikmu (akun gratis metered.ca) di blok NET pada script.js.";
/* uji jenis kandidat ICE: relay=0 berarti TURN mati. Bisa juga dipanggil manual dari Console: netDiag().then(console.log) */
async function netDiag(){const o={host:0,srflx:0,relay:0};let pc=null;
  await new Promise(async ok=>{const end=()=>{try{pc&&pc.close()}catch(e){}ok()};setTimeout(end,6000);
    try{pc=new RTCPeerConnection({iceServers:await getIce()});pc.createDataChannel("d");
      pc.onicecandidate=e=>{if(!e.candidate){end();return}const m=/ typ (\w+)/.exec(e.candidate.candidate);if(m&&o[m[1]]!=null)o[m[1]]++};
      await pc.setLocalDescription(await pc.createOffer())}catch(e){end()}});
  console.log("[netDiag] kandidat ICE:",o);return o}
let iceCache=null;
async function getIce(){
  if(iceCache)return iceCache;
  let l=NET.stun.map(u=>({urls:u}));
  if(NET.meteredApp&&NET.meteredKey){try{const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),4000);
    const r=await fetch("https://"+NET.meteredApp+".metered.live/api/v1/turn/credentials?apiKey="+encodeURIComponent(NET.meteredKey),{signal:ctl.signal});clearTimeout(to);
    if(r.ok){const j=await r.json();if(Array.isArray(j))l=l.concat(j)}}catch(e){}}
  if(NET.meteredUser&&NET.meteredPass)l=l.concat([{urls:"stun:stun.relay.metered.ca:80"},{urls:["turn:global.relay.metered.ca:80","turn:global.relay.metered.ca:80?transport=tcp","turn:global.relay.metered.ca:443","turns:global.relay.metered.ca:443?transport=tcp"],username:NET.meteredUser,credential:NET.meteredPass}]);
  return iceCache=l.concat(NET.turn)}
const inClaude=()=>!!(window.claude&&window.claude.use);
function gone(m){connOk=false;$("lmsg").textContent=m;$("err").textContent=m;setTimeout(leave,2500)}
async function peerNet(c,hostMode){
  const ice=await getIce();let best=null;
  for(const srv of NET.servers){
    try{return await peerNet1(c,hostMode,ice,srv)}
    catch(e){if(e==="ID"||e===P2P_FAIL||e===P2P_NORELAY)throw e;if(!best||/tidak ditemukan/.test(String(e)))best=e}}
  throw best||"Tidak bisa terhubung ke server online. Cek internet lalu coba lagi."}
function peerNet1(c,hostMode,ice,srv){return new Promise((res,rej)=>{
  if(!window.Peer){rej("Library online gagal dimuat. Cek koneksi internet lalu muat ulang halaman.");return}
  const hostId=NET.prefix+c.toLowerCase(),roster={};let list=[],conns=[],peer=null,hconn=null,settled=false,t=null;
  const fail=m=>{if(settled)return;settled=true;clearTimeout(t);try{peer&&peer.destroy()}catch(e){}rej(m)};
  const p2pFail=async()=>{if(settled)return;clearTimeout(t);let d={relay:1};try{d=await netDiag()}catch(e){}fail(d.relay?P2P_FAIL:P2P_NORELAY)};
  const bcast=()=>{const l=Object.values(roster);conns.forEach(cn=>{if(cn.open)cn.send({t:"s",l})});sync()};
  const api={
    presence(p){Object.assign(me,p);if(hostMode){roster[me.id]={...me};bcast()}else if(hconn&&hconn.open){hconn.send({t:"p",d:{...me}});sync()}return Promise.resolve()},
    peers(){const a=hostMode?Object.values(roster):list.filter(x=>x.id!==me.id).concat([me]);return a.map(d=>({presence:d}))},
    leave(){try{peer&&peer.destroy()}catch(e){}}};
  const opts={...srv,config:{iceServers:ice,iceCandidatePoolSize:4}};
  t=setTimeout(()=>fail("Server online tidak merespons. Coba lagi."),NET.sigTimeout);
  if(hostMode){
    peer=new Peer(hostId,opts);
    peer.on("open",()=>{if(settled){connOk=true;stLine();return}settled=true;clearTimeout(t);roster[me.id]={...me};connOk=true;res(api)});
    /* putus dari server signaling: sambung ulang otomatis (pemain yang sudah terhubung tetap jalan) */
    peer.on("disconnected",()=>{if(!settled||peer.destroyed)return;connOk=false;stLine();setTimeout(()=>{try{if(!peer.destroyed)peer.reconnect()}catch(e){}},1500)});
    peer.on("connection",cn=>{
      if(conns.filter(x=>x.open).length>=5){cn.on("open",()=>{cn.send({t:"full"});setTimeout(()=>cn.close(),400)});return}
      conns.push(cn);
      cn.on("open",()=>cn.send({t:"s",l:Object.values(roster)}));
      cn.on("data",m=>{if(m&&m.t==="p"&&m.d&&m.d.id){cn._pid=m.d.id;roster[m.d.id]=m.d;bcast()}});
      cn.on("error",()=>{});
      cn.on("close",()=>{conns=conns.filter(x=>x!==cn);if(cn._pid)delete roster[cn._pid];bcast()})});
    peer.on("error",e=>{if(!settled)fail(e.type==="unavailable-id"?"ID":"Tidak bisa terhubung ke server online ("+e.type+").");else{if(e.type==="network"||e.type==="server-error"||e.type==="socket-error"||e.type==="socket-closed"){connOk=false;stLine()}}});
  }else{
    peer=new Peer(opts);
    peer.on("open",()=>{
      clearTimeout(t);t=setTimeout(p2pFail,NET.p2pTimeout);
      hconn=peer.connect(hostId,{reliable:true});
      hconn.on("open",()=>{if(settled)return;settled=true;clearTimeout(t);connOk=true;hconn.send({t:"p",d:{...me}});res(api)});
      hconn.on("data",m=>{if(m.t==="s"){list=m.l;sync()}else if(m.t==="full")gone("Room penuh (maksimal 6 pemain).")});
      hconn.on("error",()=>{if(!settled)p2pFail()});
      hconn.on("close",()=>{if(settled)gone("Host keluar dari room.")})});
    peer.on("error",e=>{if(settled)return;if(e.type==="peer-unavailable")fail("Room tidak ditemukan. Cek kodenya, atau minta host membuat room dulu.");else if(e.type==="webrtc")p2pFail();else fail("Tidak bisa terhubung ("+e.type+"). Cek internet lalu coba lagi.")});
  }})}
async function enter(c,isSolo,hostMode){
  const nm=$("nm").value.trim();$("err").textContent="";
  if(!nm){$("err").textContent="Isi nama dulu ya.";$("nm").focus();return}
  if(!isSolo&&!hostMode&&!/^[A-Z]{4}$/.test(c)){$("err").textContent="Kode room harus 4 huruf.";return}
  try{localStorage.setItem("mn",JSON.stringify({n:nm,a:me.av}))}catch(e){}
  me.name=nm;solo=isSolo;code=c;room=null;connOk=false;me.jt=Date.now();me.host=!!hostMode;
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
      await room.presence({id:me.id,jt:me.jt,host:me.host,name:nm,av:me.av,ready:false,floors:0,fin:0,lastAt:0,round:0,cfg:me.cfg});
    }catch(e){$("err").textContent=typeof e==="string"?e:"Gagal masuk room ("+(e&&e.code||"error")+"). Coba lagi.";lock(false);room=null;return}
    lock(false);$("err").textContent=""}
  reset(0);
  $("tk").classList.toggle("hide",isSolo);$("slots").classList.toggle("hide",false);$("st").classList.toggle("hide",isSolo);$("bRdy").textContent=isSolo?"MULAI":"SIAP";
  $("bLink").classList.toggle("hide",isSolo||inClaude());
  $("rc").textContent=code;show("s-lobby");stLine();sync()}
function stLine(){const n=peersNow().length;$("st").textContent=connOk?"Online, "+n+" pemain di room":"Menyambung ke room…";$("st").classList.toggle("ok",connOk)}
function push(p){Object.assign(me,p);if(room)room.presence(p)}
function reset(r0){if(typeof lgStop==="function")lgStop(true);if(typeof warOff==="function")warOff();if(typeof bnOff==="function")bnOff();if(typeof dmOff==="function")dmOff();dz=null;frzEnd(true);ck=0;lkC=0;tbEnd=0;tbcRm();me.round=r0;skq=0;pickOn=false;clearTimeout(pickTo);$("pick").classList.add("hide");idx=0;fc=0;seen={};lastSk=-1;over=false;ended=false;started=false;startAt=0;combo=0;typed=0;okc=0;prevLen=0;clearInterval(tick);clearInterval(crew.iv);lastSig="";
  push({ready:false,floors:0,fin:0,lastAt:0,round:r0,av:me.av,name:me.name,atk:null,sh:0,bf:0,lk:0,dg:0,bt:0,btn:0,bots:(stopBots(),BOTS.forEach(b=>Object.assign(b,{floors:0,fin:0,lastAt:0,atk:null,sh:0,bf:0,cb:0,i:0,dis:0,tb:0,lk:0,dg:0,bt:0,btn:0})),botCopy())});
  for(const k in tws){tws[k].el.remove();delete tws[k]}
  $("conf").innerHTML="";$("bRdy").textContent=solo?"MULAI":"SIAP";$("bRdy").classList.remove("b");$("typ").value="";$("typ").disabled=true;$("lmsg").textContent=""}
function peersNow(){let a=room?room.peers().filter(p=>p.presence&&p.presence.id).map(p=>p.presence):[me];a=a.flatMap(p=>[p].concat((p.bots||[]).map(b=>({...b,round:p.round,bot:1}))));return a.filter(p=>p.round===me.round).sort((a,b)=>(b.host?1:0)-(a.host?1:0)||(a.jt||0)-(b.jt||0)||(a.id<b.id?-1:1))}
const eff=ps=>({...DEF,...((ps[0]&&ps[0].cfg)||{})});
/* lobby */
function drawLobby(ps){
  const c=eff(ps),host=!ps.length||ps[0].id===me.id,nb=ps.filter(p=>p.bot).length;
  const sig=ps.map(p=>p.id+p.name+p.av+p.ready+(p.lv|0)).join("|")+JSON.stringify(c)+host;if(sig===lastSig)return;lastSig=sig;if(drawLobby.n!=null&&ps.length>drawLobby.n)SFX.join();drawLobby.n=ps.length;
  let h="";ps.forEach((p,i)=>{const sub=p.bot?"Bot · "+BL[p.lv|0].n:i===0?"Host":"Pemain";
    h+=`<div class="slot f${p.ready?" isr":""}${p.bot?" isbot":""}" style="--c:${COL[p.av%6]}">${ab(p)}<div class="si"><b>${esc(p.name)}${p.id===me.id?" (kamu)":""}</b><span class="sub">${sub}</span></div><em class="t ${p.ready?"ok":"wt"}">${p.ready?"Siap":"Belum siap"}</em>${p.bot&&host?`<button class="bx" data-id="${p.id}" aria-label="Hapus ${esc(p.name)}">✕</button>`:""}</div>`});
  if(host&&ps.length<6)h+=`<div class="slot add" data-add="1" role="button" tabindex="0"><i class="pl">+</i><div class="si"><b>Tambah bot</b><span class="sub">Level ${BL[c.bl|0].n}</span></div></div>`;
  else if(!host&&ps.length<6)h+=`<div class="slot e"><i class="pl">…</i><div class="si"><span class="sub">Menunggu pemain lain…</span></div></div>`;
  $("slots").innerHTML=h;$("pc").textContent=ps.length+"/6";
  document.querySelectorAll(".seg").forEach(sg=>{const lock=!host||(sg.dataset.k==="bl"&&!nb);sg.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",String(c[sg.dataset.k])===b.dataset.v);b.disabled=lock})});
  $("tcfg").classList.toggle("hide",c.m!=="time");
  $("bcfg").classList.toggle("off",!nb);
  $("bhint").textContent=nb?(host?"Berlaku untuk semua bot di room.":"Diatur oleh host."):"Aktif setelah kamu menambah bot.";
  $("hn").textContent=host?"Kamu host":"Diatur host";$("mhint").textContent=["Klasik: latar cerah tanpa gangguan dari luar.","Perang: pesawat jatuh, pembomanan, dan kawanan burung dari medan perang bisa menimpa menara siapa saja.","Bencana: gunung meletus, badai petir, gempa, dan tornado menerjang semua menara sekaligus.","Dermaga: musim salju di pelabuhan. Gurita raksasa melilit 2 menara lalu bikin pusing, 2 menara membeku, dan badai kabut menyelimuti semua kata."][c.mp|0]||"";
  $("lmsg").textContent=host?(solo?"Aturan Skill aktif kalau main bersama teman atau bot.":"Game mulai saat semua pemain siap."):"Menunggu host dan pemain lain siap."}
document.querySelectorAll(".seg").forEach(sg=>sg.onclick=e=>{const b=e.target.closest("button");if(!b||b.disabled)return;
  const k=sg.dataset.k,v=k==="m"?b.dataset.v:+b.dataset.v;if(k==="bl"&&BOTS.length){BOTS.forEach(x=>x.lv=v);push({bots:botCopy()})}push({cfg:{...eff(peersNow()),[k]:v}});lastSig="";sync()});
function sync(){
  const ps=peersNow();
  if(scr==="lobby"){stLine();drawLobby(ps);if(me.ready&&ps.length&&ps.every(p=>p.ready)&&!startAt)launch(ps);return}
  if(scr==="game"){const ids=new Set(ps.map(p=>p.id));for(const k in tws)if(!ids.has(k)){tws[k].el.remove();delete tws[k]}
    fit(ps);hits(ps);ps.forEach(p=>tower(p));
    if(G.m==="race"){const w=ps.filter(p=>p.fin).sort((a,b)=>a.fin-b.fin)[0];if(w&&!ended)endGame(w)}}}
function fit(ps){const T=$("towers"),H=T.clientHeight,mx=Math.max(G.m==="race"?G.fl:15,...ps.map(p=>(p.floors||0)+2)),fh=Math.max(4,Math.min(32,(H-92-2*mx)/(mx+2.2)));T.style.setProperty("--fh",fh+"px");T.classList.toggle("xs",fh<13)}
/* game */
function launch(ps){startAt=1;const c=eff(ps);G={m:c.m,d:c.d,t:c.t,s:c.s|0,mp:c.mp|0,fl:FLS[c.d]};G.sk=!!(G.s&&ps.length>1);list=mkList();idx=0;fc=0;seen={};lastSk=-1;
  for(const k in tws){tws[k].el.remove();delete tws[k]}
  show("s-game");if(typeof warOn==="function")warOn(G.mp|0,ps.filter(p=>!p.fin).map(p=>p.id));if(typeof bnOn==="function")bnOn(G.mp|0,ps.filter(p=>!p.fin).map(p=>p.id));if(typeof dmOn==="function")dmOn(G.mp|0);$("cw").innerHTML='<span class="rdy">Bersiap…</span>';$("nx").textContent="";
  $("tm").innerHTML=G.m==="time"?"<small>WAKTU</small><b>"+G.t+"</b>":"<small>WAKTU</small><b>0:00</b>";$("wpm").innerHTML="<small>KECEPATAN</small><b>0</b>";stat();$("bar").style.width="0";$("skm").classList.toggle("hide",!G.sk);sync();
  crew();cue("MARI BANGUN!",true);setTimeout(()=>{let n=3;(function step(){cue(n>0?n:"GO!");if(n>0){n--;setTimeout(step,900)}else{crewGo();begin()}})()},3700)}
function cue(t,big){SFX.cue(t,big);const b=$("ovn");b.textContent=t;b.className=big?"t":"";b.style.color=t==="GO!"?"#ffe14d":"";
  b.animate([{transform:"scale(2.2)",opacity:0,filter:"blur(14px)"},{transform:"scale(1)",opacity:1,filter:"blur(0)",offset:.25},{transform:"scale(1.06)",opacity:1,filter:"blur(0)",offset:.7},{transform:"scale(.55)",opacity:0,filter:"blur(10px)"}],{duration:big?2400:900,easing:"cubic-bezier(.2,.8,.3,1)"});
  $("ovr").animate([{transform:"scale(.2)",opacity:.9},{transform:"scale(3.4)",opacity:0}],{duration:big?1300:850,easing:"ease-out"})}
function stat(){$("combo").innerHTML="<small>COMBO</small><b>"+combo+"</b>";$("combo").classList.toggle("on",combo>=3);$("fl").innerHTML="<small>LANTAI</small><b>"+fc+(G.m==="race"?"/"+G.fl:"")+"</b>";
  const nd=lkC>0?LK_NEED:SK_EVERY,m=Math.min(ck,nd);$("skf").style.width=(m/nd*100)+"%";$("skn").textContent=m+"/"+nd+(lkC>0?" 🍀"+lkC:"");$("skm").classList.toggle("lucky",lkC>0);$("fl").classList.toggle("x3",(me.bf|0)>0);$("fl").classList.toggle("tb",tbOn())}
function begin(){SFX.music("game");started=true;t0=Date.now();startBots();if(typeof warHaz==="function")warHaz();if(typeof bnHaz==="function")bnHaz();if(typeof dmHaz==="function")dmHaz();const i=$("typ");i.disabled=false;i.value="";i.focus();drawWord();
  tick=setInterval(()=>{const el=(Date.now()-t0)/1000;SFX.inten(G.m==="race"?fc/G.fl:el/G.t);
    if(G.m==="time"){const r=Math.max(0,Math.ceil(G.t-el));if(r>0&&r<=10)SFX.warn(r);put("tm","<small>WAKTU</small><b>"+r+"</b>");$("bar").style.width=(100-el/G.t*100)+"%";if(el>=G.t)timeUp()}
    else{put("tm","<small>WAKTU</small><b>"+Math.floor(el/60)+":"+String(Math.floor(el%60)).padStart(2,"0")+"</b>")}
    put("wpm","<small>KECEPATAN</small><b>"+Math.round(idx/Math.max(el/60,.05))+"</b>")},250)}
function scr9(w,n){const a=[...w],r=seedRng(w+n);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}let o=a.join("");if(o===w)o=w.slice(1)+w[0];return o}
function drawWord(){const w=list[idx]||"",v=$("typ").value;
  const sc=dz&&dz.k===9&&w.length>1?scr9(w,idx):null,hd=new Set();if(dz&&dz.k===8&&w.length>1){const n=2;for(let j=0;hd.size<n&&j<60;j++)hd.add((idx*5+j*j+2*j+2)%w.length)}
  $("cw").innerHTML=[...w].map((c,k)=>{let cl=k<v.length?(v[k]===c?"g":"x"):k===v.length?"n":"",st="";
    if(dz&&k>=v.length){if(dz.k===8){if(hd.has(k))cl+=" fg"}}
    return `<b class="k ${cl}"${st}>${sc&&k>=v.length?sc[k]:c}</b>`}).join("");$("cwrap").dataset.dz=dz?dz.n:"";
  $("nx").textContent=list.slice(idx+1,idx+4).join("    ·    ");if(G.m==="race")$("bar").style.width=(fc/G.fl*100)+"%"}
function popup(t){const e=document.createElement("div");e.className="cpop";e.textContent=t;$("scene").appendChild(e);
  e.animate([{transform:"translate(-50%,20px) scale(.3)",opacity:0},{transform:"translate(-50%,0) scale(1.2)",opacity:1,offset:.3},{transform:"translate(-50%,-50px) scale(1)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>e.remove()}
$("typ").addEventListener("input",e=>{
  if(!started||over)return;
  if(pickOn&&/[1-3]/.test(e.target.value)){const d=+/[1-3]/.exec(e.target.value)[0];e.target.value=e.target.value.replace(/[1-3]/g,"");prevLen=e.target.value.length;choose(pickSet[d-1]);drawWord();return}
  if(frz){e.target.value="";prevLen=0;lkTap();return}
  const v=e.target.value.trim().toLowerCase(),w=list[idx];if(e.target.value!==v)e.target.value=v;
  if(v.length>prevLen){typed++;if(w.startsWith(v)){okc++;SFX.key()}else{combo=0;ck=0;stat();SFX.err();if(typeof lgBetMiss==="function")lgBetMiss()}}
  prevLen=v.length;e.target.classList.toggle("bad",!w.startsWith(v));
  if(v===w){
    const g=$("cw").cloneNode(true);g.removeAttribute("id");g.className="cw ghost";$("cwrap").appendChild(g);
    g.animate([{transform:"none",opacity:1},{transform:"translateY(-60px) scale(1.4)",opacity:0}],{duration:450,easing:"ease-out"}).onfinish=()=>g.remove();
    const g3=me.bf>0,gx=(g3?3:1)*(tbOn()?2:1);if(g3){push({bf:me.bf-1});if(ST.txu)popup("×3! +"+gx+" LANTAI")}idx++;if(dz&&--dz.n<=0)dz=null;fc=G.m==="race"?Math.min(G.fl,fc+gx):fc+gx;combo++;ck++;let aw=false;if(G.sk&&ck>=(lkC>0?LK_NEED:SK_EVERY)){aw=true;ck=0;if(lkC>0){lkC--;fc=G.m==="race"?Math.min(G.fl,fc+1):fc+1;luckBonus()}}SFX.word(combo);prevLen=0;e.target.value="";stat();if(combo>=2)cpop();
    if(typeof lgBetWord==="function")lgBetWord();
    if(G.m==="race"&&fc>=G.fl){over=true;pickHide();e.target.disabled=true;push({floors:fc,lastAt:Date.now(),fin:Date.now()})}else push({floors:fc,lastAt:Date.now()});
    if(aw&&!over){skq++;if(!pickOn)openPick()}
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
  setTimeout(()=>{ws.forEach(([w])=>w.classList.replace("walk","work"));crew.iv=setInterval(()=>setTimeout(()=>{SFX.hammer();ws.forEach(([w,d])=>puff(c,w,d))},250),550)},1750);crew.ws=ws}
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
  const cc=COL[p.av%6],lb=p.name+(p.id===me.id?" (kamu)":"");if(t.cc!==cc){t.cc=cc;t.el.style.setProperty("--c",cc)}if(t.lb!==lb){t.lb=lb;t.el.querySelector(".nm").textContent=lb}t.mine=p.id===me.id;t.el.classList.toggle("me",t.mine);t.el.classList.toggle("bf",(p.bf|0)>0);lkBadge(t,p.lk|0);
  if(p.sh)ensureShield(t,false);else if(t.shd)shieldBreak(t,!(t.sk&&performance.now()-t.sk.at<4500));
  const n=p.floors||0;
  if(n<t.n)cut(t,t.n-n,map===dws&&!(t.sk&&performance.now()-t.sk.at<(t.sk.dur||5000)));
  t.want=n;while(t.want-t.n>3)add(t)}
function dropped(t){const f=add(t);t.blk.style.display="none";t.st="rise";t.om+=(Math.random()-.5)*1.4;landed(t,f,t.mine)}
let lastT=performance.now();
function loop(now){const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  for(const M of (ambient.on?[tws,dws]:[tws]))for(const k in M){const t=M[k];if(!t.el.isConnected||now<t.start)continue;const FH=parseFloat(t.el.parentNode.style.getPropertyValue("--fh"))||24;
    const top=t.stack.offsetTop,pend=t.want-t.n,rh=t.roof?t.roof.offsetHeight:0,hov=Math.max(14,top-14-FH-22),land=top+rh-2-FH-22,w=t.stack.offsetWidth||40;
    if(t.sw!==w){t.sw=w;t.blk.style.width=w+"px";t.blk.style.left=-w/2+"px"}
    if(t.shd)shpos(t);if(t.lk)t.lk.tick(now);if(t.tbo)t.tbo.tick(now);if(t.lkb)lkbPos(t);let Lt=hov,rate=2.6,lock=false;
    if(t.st==="rise"){Lt=4;rate=8;lock=true;
      if(t.L<9){t.st="lower";t.blk.style.display="block";t.blk.animate([{transform:"scale(.3)",opacity:0},{transform:"none",opacity:1}],{duration:280,easing:"cubic-bezier(.2,1.6,.4,1)"})}}
    if(t.st==="drop"&&pend<=0){t.st="rise";if(t.roof)t.roof.getAnimations().forEach(a=>a.cancel())}
    if(t.st==="lower"&&pend>0){t.st="drop";if(t.roof)t.roof.animate([{opacity:1},{opacity:0}],{duration:280,fill:"forwards"})}
    if(t.st==="drop"){Lt=land+10;rate=pend>1?13:8;lock=true;if(t.L>=land-.5)dropped(t)}
    if(t.tbo)rate*=1.7;t.v+=((Lt-t.L)*rate*rate-2*rate*t.v)*dt;t.L+=t.v*dt;
    const hold=lock||(t.lk&&!t.lk.blk),th0=hold?0:Math.sin(now/1900+t.ph)*.07;t.om+=(-6*(t.th-th0)-(hold?7:1.3)*t.om)*dt;t.th+=t.om*dt;
    t.hook.style.transform=`rotate(${t.th}rad)`;t.rope.style.height=t.L+"px";t.blk.style.top=t.L+"px";t.blk.style.transform=`rotate(${-t.th*.7}rad)`}
  requestAnimationFrame(loop)}
requestAnimationFrame(loop);
function fx(t,f,chars,n,dist){const r=f.getBoundingClientRect(),b=t.el.getBoundingClientRect();
  for(let i=0;i<n;i++){const e=document.createElement("span");e.className="pt";e.textContent=chars[i%chars.length];
    e.style.left=(r.left-b.left+r.width*Math.random())+"px";e.style.top=(r.top-b.top+r.height/2)+"px";t.el.appendChild(e);
    const a=Math.random()*Math.PI*2,d=dist*(.5+Math.random());
    e.animate([{transform:"translate(0,0) scale(.4) rotate(0)",opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-24}px) scale(1.3) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:600+Math.random()*400,easing:"ease-out"}).onfinish=()=>e.remove()}}
function landed(t,f,mine){
  if(!f.isConnected)return;SFX.land(mine,scr==="game");
  const els=[...t.stack.querySelectorAll(".fl")].slice(mine?-8:-3);
  els.forEach((e,i)=>{if(e!==f)e.animate([{transform:"none"},{transform:"scale(1.05,.86)"},{transform:"scale(.98,1.04)"},{transform:"none"}],{duration:420,delay:(els.length-i)*26})});
  if(mine){fx(t,f,["•","·","○"],ST.lite?3:6,38);if(!ST.lite)fx(t,f,["✦","✧","★"],8,56)}else if(!ST.lite)fx(t,f,["•","✦"],3,40);if(t.tbo)tbLand(t,f);
  const r=f.getBoundingClientRect(),b=t.el.getBoundingClientRect(),pl=document.createElement("span");
  pl.className="pt p";pl.textContent="+1";pl.style.left=(r.left-b.left+r.width/2-10)+"px";pl.style.top=(r.top-b.top-14)+"px";t.el.appendChild(pl);
  pl.animate([{transform:"translateY(0) scale(.5)",opacity:1},{transform:"translateY(-56px) scale(1.4)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>pl.remove();
  if(mine)$("scene").animate([{transform:"translate(0,0)"},{transform:"translate(-3px,3px)"},{transform:"translate(3px,-2px)"},{transform:"translate(0,0)"}],{duration:240})}
function cpop(){const o=$("scene").querySelector(".cmbp");if(o)o.remove();const e=document.createElement("div");e.className="cmbp";e.innerHTML="<small>COMBO</small><b>x"+combo+"</b>";$("scene").appendChild(e);
  e.animate([{transform:"translate(-50%,10px) scale(.6)",opacity:0},{transform:"translate(-50%,0) scale(1.15)",opacity:.7,offset:.2},{transform:"translate(-50%,-8px) scale(1)",opacity:.6,offset:.6},{transform:"translate(-50%,-26px) scale(.95)",opacity:0}],{duration:900,easing:"ease-out"}).onfinish=()=>e.remove()}
/* skills */
const emo=(el,ch,x,y,sz)=>{const e=document.createElement("span");e.className="sk";e.textContent=ch;e.style.cssText="left:"+x+"px;top:"+y+"px;font-size:"+sz+"px";el.appendChild(e);return e};
const run=(e,kf,o)=>{e.animate(kf,{easing:"linear",fill:"forwards",...o}).onfinish=()=>e.remove()};
const SHK=[{transform:"translate(0,0)"},{transform:"translate(-6px,4px)"},{transform:"translate(6px,-4px)"},{transform:"translate(-5px,-3px)"},{transform:"translate(5px,3px)"},{transform:"translate(0,0)"}];
const WOB=[{transform:"rotate(0)"},{transform:"rotate(-7deg)"},{transform:"rotate(6deg)"},{transform:"rotate(-4deg)"},{transform:"rotate(2deg)"},{transform:"rotate(0)"}];
function boom(el,x,y){run(emo(el,"💥",x,y,40),[{transform:"scale(.3)",opacity:0},{transform:"scale(1.5)",opacity:1,offset:.35},{transform:"scale(1.9)",opacity:0}],{duration:500,easing:"ease-out"})}
function flash(sc){const f=document.createElement("div");f.className="flash";(sc||$("scene")).appendChild(f);f.animate([{opacity:0},{opacity:.85,offset:.15},{opacity:0},{opacity:.6,offset:.45},{opacity:0}],{duration:600}).onfinish=()=>f.remove()}
function cut(t,k,q){const fs=[...t.stack.querySelectorAll(".fl")];k=Math.min(k,fs.length);if(t.roof){t.roof.remove();t.roof=null}
  const sk=!q&&t.sk&&performance.now()-t.sk.at<(t.sk.dur||5000)?t.sk.k:-1,b=t.el.getBoundingClientRect(),gone=[];
  if(!q)for(let i=0;i<k;i++){const f=fs[fs.length-1-i],r=f.getBoundingClientRect(),o={i,r:{x:r.left-b.left,y:r.top-b.top,w:r.width,h:r.height}},c=f.cloneNode(true);
    c.classList.add("deb");c.style.cssText="left:"+o.r.x+"px;top:"+o.r.y+"px;width:"+o.r.w+"px;height:"+o.r.h+"px";o.c=c;gone.push(o)}
  for(let i=0;i<k;i++)fs[fs.length-1-i].remove();
  t.n-=k;t.want=t.n;
  if(t.n>0){const r=document.createElement("div");r.className="rw";r.style.animationDelay=".15s";r.innerHTML='<div class="roof"></div>';t.stack.appendChild(r);t.roof=r}
  if(q||!gone.length)return;
  gone.forEach(o=>t.el.appendChild(o.c));
  /* penanda lantai yang hilang */
  gone.forEach(o=>{const g=document.createElement("i");g.className="gh";g.style.cssText="left:"+o.r.x+"px;top:"+o.r.y+"px;width:"+o.r.w+"px;height:"+o.r.h+"px";t.el.appendChild(g);
    g.animate([{opacity:0},{opacity:1,offset:.15},{opacity:.2,offset:.4},{opacity:.9,offset:.55},{opacity:0}],{duration:1500,delay:300}).onfinish=()=>g.remove()});
  debris(t,gone,sk);
  const top=gone[gone.length-1].r,l=document.createElement("span");l.className="pt p neg";l.textContent="-"+k;l.style.left=(top.x+top.w/2-14)+"px";l.style.top=(top.y-10)+"px";t.el.appendChild(l);
  l.animate([{transform:"translateY(10px) scale(.4)",opacity:0},{transform:"translateY(-10px) scale(1.5)",opacity:1,offset:.25},{transform:"translateY(-70px) scale(1.2)",opacity:0}],{duration:1300,delay:200,easing:"ease-out",fill:"both"}).onfinish=()=>l.remove();
  const nm=t.el.querySelector(".nm");nm.animate([{background:"#e0301e",transform:"scale(1.25)"},{transform:"scale(1)"}],{duration:700});
  t.stack.animate([{transform:"translateY(-8px) scale(1.03,.97)"},{transform:"translateY(3px) scale(.98,1.02)"},{transform:"none"}],{duration:520,easing:"ease-out"})}
const IMP=[650,520,1300,600,450,1700,0,0,800,700,1100,780,0,0,1700,1900,700,2300];
function debris(t,gone,sk){const H=t.el.clientHeight,e=t.el;
  const shat=(o,n,vx,up,fall,dur,del,rot)=>{for(let j=0;j<n;j++){const p=o.c.cloneNode(true),w=100/n,m=j-(n-1)/2,r=Math.random()-.5;
    p.style.clipPath="inset(0 "+(100-j*w-w)+"% 0 "+j*w+"%)";e.appendChild(p);
    p.animate([{transform:"none",opacity:1},{transform:"translate("+m*vx*.5+"px,"+-up*(.7+Math.random()*.6)+"px) rotate("+(m*rot*.4+r*20)+"deg)",opacity:1,offset:.38},
      {transform:"translate("+(m*vx+r*30)+"px,"+fall+"px) rotate("+(m*rot+r*60)+"deg)",opacity:0}],{duration:dur,delay:del,easing:"cubic-bezier(.3,.1,.6,1)",fill:"both"}).onfinish=()=>p.remove()}
    o.c.remove()};
  gone.forEach(o=>{const i=o.i,r=o.r,c=o.c,gy=Math.max(60,H-r.y-r.h-34),dir=i%2?1:-1,cx=r.x+r.w/2,cy=r.y+r.h/2;
    const go=(kf,d,ez,dl)=>c.animate(kf,{duration:d,delay:dl,easing:ez||"ease-in",fill:"both"}).onfinish=()=>c.remove();
    if(sk===0){const dl=i*110;go([{transform:"none",opacity:1},{transform:"translate(-10px,-6px) rotate(-6deg)",offset:.12},{transform:"translate(60px,"+(-30-i*14)+"px) rotate(130deg)",opacity:1,offset:.4},{transform:"translate("+(260+i*40)+"px,"+(-110-i*30)+"px) rotate(560deg) scale(.5)",opacity:0}],1200,"ease-in",dl);
      for(let j=0;j<3;j++)run(emo(e,"💨",cx-20,cy+(j-1)*10,20),[{transform:"translateX(0) scale(.6)",opacity:.9},{transform:"translateX("+(120+j*30)+"px) scale(1.6)",opacity:0}],{duration:700,delay:dl+j*80,easing:"ease-out"})}
    else if(sk===1){const dl=i*140;go([{transform:"none",opacity:1},{transform:"translateY(-6px) rotate("+dir*2+"deg)",offset:.12},{transform:"translate("+dir*20+"px,"+(-H*.35)+"px) rotate("+dir*10+"deg) scale(.85)",opacity:1,offset:.6},{transform:"translate("+(90+i*30)+"px,"+(-H*.9)+"px) rotate("+dir*18+"deg) scale(.5)",opacity:0}],1400,"cubic-bezier(.5,0,.8,.4)",dl);
      [-.38,.38].forEach(s=>{const b=emo(e,"🐦",cx+r.w*s,r.y-8,22);run(b,[{transform:"none",opacity:0},{transform:"translateY(-6px)",opacity:1,offset:.12},{transform:"translate("+dir*20+"px,"+(-H*.35-10)+"px)",opacity:1,offset:.6},{transform:"translate("+(90+i*30)+"px,"+(-H*.9)+"px) scale(.8)",opacity:0}],{duration:1400,delay:dl,easing:"cubic-bezier(.5,0,.8,.4)"})})}
    else if(sk===2){fx(t,c,["🔥","✦","▪"],7,60);shat(o,4,70,40,gy,1100,i*90,150)}
    else if(sk===3){const dl=i*100;c.style.filter="brightness(.3) sepia(.5)";
      go([{filter:"brightness(3)",transform:"none",opacity:1},{filter:"brightness(.25) sepia(.6)",offset:.12},{filter:"brightness(2.2)",offset:.2},{filter:"brightness(.25) sepia(.6)",transform:"translate("+dir*2+"px,0)",offset:.3},{filter:"brightness(.25) sepia(.6)",transform:"translate("+-dir*2+"px,0)",offset:.5},{filter:"brightness(.2)",transform:"translateY("+gy*.25+"px) scaleY(.12) scaleX(1.2)",opacity:0}],1100,"ease-in",dl);
      setTimeout(()=>fx(t,c,["⚡","✦","💨"],5,40),dl+60)}
    else if(sk===4){const dl=i*120;go([{transform:"none",opacity:1},{transform:"translateX("+dir*6+"px) rotate("+dir*2+"deg)",offset:.12},{transform:"translateX("+-dir*6+"px) rotate("+-dir*2+"deg)",offset:.24},{transform:"translateX("+dir*16+"px) rotate("+dir*5+"deg)",offset:.38},{transform:"translate("+dir*(50+i*14)+"px,"+gy+"px) rotate("+dir*(45+i*12)+"deg)",opacity:.95,offset:.88},{transform:"translate("+dir*(56+i*14)+"px,"+gy+"px) rotate("+dir*(50+i*12)+"deg)",opacity:0}],1200,"ease-in",dl);
      setTimeout(()=>{for(let j=0;j<3;j++)run(emo(e,"💨",cx+dir*(50+i*14)+(j-1)*16,r.y+gy+r.h,24),[{transform:"translateY(0) scale(.5)",opacity:.9},{transform:"translateY(-30px) scale(1.7)",opacity:0}],{duration:700,easing:"ease-out"})},dl+1000)}
    else if(sk===5){fx(t,c,["🔥","💥","✦"],8,70);if(i===0){const w=document.createElement("i");w.className="ring";w.style.left=cx+"px";w.style.top=cy+"px";e.appendChild(w);w.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(5)",opacity:0}],{duration:600,easing:"ease-out"}).onfinish=()=>w.remove()}
      boom(e,cx,cy);shat(o,5,110,90,gy,1200,i*70,260)}
    else if(sk===14)lgSuck(t,e,c,r,i,dir,cx,cy)
    else if(sk===15)lgCrush(t,e,c,r,i,dir,cx,cy,gy)
    else shat(o,3,50,30,gy,900,i*80,100)
  })}
/* ===== skill system v2 ===== */
const mk=(el,c,css,h)=>{const e=document.createElement("div");e.className=c;e.style.cssText=css||"";if(h)e.innerHTML=h;el.appendChild(e);return e};
const rnd=(a,b)=>a+Math.random()*(b-a);
function shake(n,amp,dur,sc){const f=[{transform:"translate(0,0)"}];for(let i=1;i<=n;i++){const m=amp*(i/n);f.push({transform:"translate("+rnd(-m,m)+"px,"+rnd(-m,m)+"px)"})}f.push({transform:"translate(0,0)"});(sc||$("scene")).animate(f,{duration:dur})}
function dim(a,dur,col,sc){const d=mk(sc||$("scene"),"dimm","background:"+(col||"rgba(8,6,40,.6)"));d.animate([{opacity:0},{opacity:a,offset:.2},{opacity:a,offset:.8},{opacity:0}],{duration:dur}).onfinish=()=>d.remove()}
function orbit(h,ch,x0,y0,rx,ry,dur,dl,sz){const e=emo(h,ch,x0,y0,sz),n=14,kf=[];for(let a=0;a<=n;a++){const r=a/n*Math.PI*4;kf.push({transform:"translate("+Math.cos(r)*rx+"px,"+(Math.sin(r)*ry-a*3)+"px) rotate("+a*40+"deg)",opacity:a===0||a===n?0:1})}run(e,kf,{duration:dur,delay:dl})}
function ringAt(el,x,y,cls,sc,dur,dl){const g=mk(el,"ring "+(cls||""),"left:"+x+"px;top:"+y+"px");run(g,[{transform:"translate(-50%,-50%) scale(.2)",opacity:.95},{transform:"translate(-50%,-50%) scale("+sc+")",opacity:0}],{duration:dur,delay:dl||0,easing:"ease-out"})}
function blast(el,x,y,r){const f=mk(el,"fb","left:"+(x-r)+"px;top:"+(y-r)+"px;width:"+2*r+"px;height:"+2*r+"px");
  run(f,[{transform:"scale(.1)",opacity:1},{transform:"scale(1)",opacity:1,offset:.3},{transform:"scale(1.4)",opacity:0}],{duration:700,easing:"ease-out"});
  ringAt(el,x,y,"",4,650);boom(el,x,y);
  for(let i=0;i<6;i++)run(emo(el,"☁️",x+rnd(-r*.5,r*.5),y,rnd(22,34)),[{transform:"translateY(0) scale(.4)",opacity:.9,filter:"brightness(.3)"},{transform:"translate("+rnd(-30,30)+"px,"+-rnd(50,100)+"px) scale(1.6)",opacity:0,filter:"brightness(.5)"}],{duration:1300,delay:150+i*70,easing:"ease-out"});
  for(let i=0;i<10;i++){const a=rnd(0,6.28),d=rnd(r*.8,r*2);run(emo(el,i%2?"🔥":"✦",x,y,rnd(12,20)),[{transform:"translate(0,0)",opacity:1},{transform:"translate("+Math.cos(a)*d+"px,"+(Math.sin(a)*d+30)+"px) scale(.4)",opacity:0}],{duration:rnd(600,1000),easing:"ease-out"})}}
function bolt(el,x,y0,y1){const w=90,h=y1-y0,p=[[w/2,0]],n=8;for(let i=1;i<n;i++)p.push([w/2+rnd(-18,18),h*i/n]);p.push([w/2,h]);
  const d=p.map(q=>q.join(",")).join(" "),b=mk(el,"bolt","left:"+(x-w/2)+"px;top:"+y0+"px;width:"+w+"px;height:"+h+"px");
  b.innerHTML='<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><polyline points="'+d+'" fill="none" stroke="#bfe9ff" stroke-width="9" opacity=".5"/><polyline points="'+d+'" fill="none" stroke="#fff" stroke-width="3"/></svg>';
  run(b,[{opacity:0},{opacity:1,offset:.1},{opacity:.3,offset:.3},{opacity:1,offset:.45},{opacity:0}],{duration:420})}
/* pelindung */
function shpos(t){const s=t.stack,d=t.shd.style;d.left=(s.offsetLeft-18)+"px";d.top=(s.offsetTop-40)+"px";d.width=(s.offsetWidth+36)+"px";d.height=(s.offsetHeight+62)+"px"}
function ensureShield(t,anim){if(t.shd)return;t.shd=mk(t.el,"shd","","<i></i>");shpos(t);
  if(anim)t.shd.animate([{opacity:0,transform:"scale(.3)",filter:"brightness(3)"},{opacity:1,transform:"scale(1.1)",offset:.6},{transform:"scale(1)",filter:"brightness(1)"}],{duration:750,easing:"cubic-bezier(.2,1.4,.4,1)"})}
function shieldHit(t,x,y){const el=t.el;if(t.dgA&&t.dgA.hit)t.dgA.hit(x,y);if(t.shd)t.shd.animate([{filter:"brightness(2.8)"},{filter:"none"}],{duration:520});ringAt(el,x,y,"cy",2.8,520);
  for(let i=0;i<8;i++){const a=rnd(0,6.28),d=rnd(30,60);run(emo(el,"✦",x,y,rnd(12,18)),[{transform:"translate(0,0)",opacity:1},{transform:"translate("+Math.cos(a)*d+"px,"+Math.sin(a)*d+"px) scale(.3)",opacity:0}],{duration:600,easing:"ease-out"})}
  if((t.mine&&ST.txr)||(!t.mine&&t.sk&&t.sk.by&&ST.txu)){const b=mk(el,"blk2","left:"+x+"px;top:"+(y-30)+"px","🛡️ BLOK!");run(b,[{transform:"translate(-50%,10px) scale(.4)",opacity:0},{transform:"translate(-50%,-6px) scale(1.2)",opacity:1,offset:.25},{transform:"translate(-50%,-44px) scale(1)",opacity:0}],{duration:1100,easing:"ease-out"})}
  if(t.mine)shake(6,4,350)}
function shieldBreak(t,quiet){const d=t.shd;if(!d)return;t.shd=null;if(quiet){d.animate([{opacity:1},{opacity:0}],{duration:300}).onfinish=()=>d.remove();return}
  const r=d.getBoundingClientRect(),b=t.el.getBoundingClientRect(),cx=r.left-b.left+r.width/2,cy=r.top-b.top+r.height/2;d.remove();
  for(let i=0;i<16;i++){const a=i/16*6.283,dd=rnd(50,110),sh=mk(t.el,"shard","left:"+(cx+Math.cos(a)*r.width*.4)+"px;top:"+(cy+Math.sin(a)*r.height*.4)+"px");
    run(sh,[{transform:"translate(0,0) rotate(0)",opacity:1},{transform:"translate("+Math.cos(a)*dd+"px,"+(Math.sin(a)*dd+30)+"px) rotate("+rnd(-300,300)+"deg)",opacity:0}],{duration:rnd(700,1000),easing:"ease-out"})}}
const _fl=flash,_sh=shake,_dm=dim;
function skfx(id,k,blk,M,SC,BG){M=M||tws;const t=M[id];if(!t)return;const far=!!ST.far&&id!==me.id&&!(t.sk&&t.sk.by),lo=far||!!ST.lite,flash=far?nop:_fl,shake=far?nop:_sh,dim=far?nop:_dm;SFX.skill(SK[k].id,{blk,I:IMP[k],demo:M===dws,mine:id===me.id,far,pan:Math.max(-.8,Math.min(.8,((t.el.getBoundingClientRect().left+t.el.offsetWidth/2)/innerWidth-.5)*1.6))});const el=t.el,W=el.clientWidth,H=el.clientHeight,st=t.stack,top=st.offsetTop+8,cx=st.offsetLeft+st.offsetWidth/2,sw=st.offsetWidth,gy0=st.offsetTop+st.offsetHeight,s=SK[k].id,I=IMP[k],sc=SC||$("scene"),bg=BG||sc;
  const impact=(x,y,fn)=>setTimeout(()=>{if(blk)shieldHit(t,x,y);else fn()},I);
  const sway=(a,d)=>st.animate([{transform:"rotate(0)"},{transform:"rotate("+a+"deg)",offset:.18},{transform:"rotate("+-a*.8+"deg)",offset:.4},{transform:"rotate("+a*.6+"deg)",offset:.62},{transform:"rotate("+-a*.3+"deg)",offset:.82},{transform:"rotate(0)"}],{duration:d,delay:Math.max(0,I-200),easing:"ease-in-out"});
  if(s==="wind"){const tor=mk(el,"tor","left:"+(cx-80)+"px;top:"+(top-40)+"px");
    for(let i=0;i<7;i++){const w=92-i*11;mk(tor,"tl","left:"+-w/2+"px;top:"+i*14+"px;width:"+w+"px;height:"+(12+i)+"px;animation-duration:"+(.3+i*.04)+"s;opacity:"+(.95-i*.07))}
    run(tor,[{transform:"translateX(0) scale(.5)",opacity:0},{transform:"translateX(80px) scale(1)",opacity:1,offset:I/2000},{transform:"translateX(80px) scale(1.1)",opacity:1,offset:.7},{transform:"translateX("+(W+160)+"px) scale(.8)",opacity:0}],{duration:2000,easing:"ease-in-out"});
    for(let j=0;j<(lo?5:14);j++)orbit(tor,["🍃","🍂","🪵","▪️"][j%4],0,rnd(10,80),rnd(26,50),rnd(6,14),rnd(900,1500),j*60,rnd(12,20));
    for(let j=0;j<(far?0:9);j++){const l=mk(sc,"wst2","top:"+rnd(8,70)+"%;width:"+rnd(120,260)+"px");run(l,[{transform:"translateX(0)",opacity:0},{opacity:1,offset:.2},{transform:"translateX("+(sc.clientWidth+520)+"px)",opacity:0}],{duration:rnd(500,800),delay:j*120})}
    sway(blk?2:8,1800);impact(cx,top+20,()=>shake(10,6,600,bg))}
  else if(s==="birds"){const fl=mk(el,"","position:absolute;left:-30px;top:"+(top-80)+"px;z-index:6;width:0;height:0");
    [[0,0],[-22,-14],[-22,14],[-44,-28],[-44,28],[-66,-42],[-66,42]].forEach(([x,y])=>mk(fl,"bd2","left:"+x+"px;top:"+y+"px",'<span class="fp" style="animation-delay:-'+Math.random().toFixed(2)+'s">🐦</span>'));
    run(fl,[{transform:"translate(0,0)",opacity:0},{opacity:1,offset:.08},{transform:"translate("+(cx+36)+"px,46px)",offset:I/1900},{transform:"translate("+(cx+40)+"px,40px)",offset:I/1900+.05},{transform:"translate("+(W+150)+"px,"+-H*.9+"px)",opacity:0}],{duration:1900,easing:"ease-in-out"});
    impact(cx,top+10,()=>{shake(6,3,400,bg);for(let i=0;i<9;i++)run(emo(el,"🪶",cx+rnd(-30,30),top+rnd(-10,10),rnd(14,20)),[{transform:"translate(0,0) rotate(0)",opacity:1},{transform:"translate("+rnd(-50,50)+"px,"+rnd(60,120)+"px) rotate("+rnd(-200,200)+"deg)",opacity:0}],{duration:rnd(900,1400),easing:"ease-out"})})}
  else if(s==="plane")airPlane({el,W,H,st,cx,top,sw,gy0,I,blk,lo,far,bg,flash,shake,dim,impact,sway});
  else if(s==="storm"){dim(.6,2000,null,bg);
    [[-46,-78,60],[0,-92,72],[46,-76,56]].forEach(([dx,dy,z],i)=>{const c=emo(el,"☁️",cx+dx,top+dy,z);c.style.filter="brightness(.22) contrast(1.2)";run(c,[{transform:"scale(.2)",opacity:0},{transform:"scale(1)",opacity:1,offset:.22},{transform:"scale(1.08)",opacity:1,offset:.85},{transform:"scale(.6)",opacity:0}],{duration:2000,delay:i*80,easing:"ease-out"})});
    for(let i=0;i<(lo?10:26);i++){const d=mk(el,"rd","left:"+(cx+rnd(-70,70))+"px;top:"+(top-60)+"px");run(d,[{transform:"translate(0,0)",opacity:0},{opacity:.9,offset:.15},{transform:"translate(-10px,"+(gy0-top+90)+"px)",opacity:0}],{duration:rnd(380,560),delay:rnd(100,1500),easing:"linear"})}
    setTimeout(()=>{bolt(el,cx,top-70,blk?top-30:top+16);flash(bg)},I-80);setTimeout(()=>flash(bg),I+300);
    if(!blk)st.animate([{filter:"brightness(2.4) drop-shadow(0 0 14px #9df)"},{filter:"none"}],{duration:700,delay:I});
    impact(cx,top-30,()=>{shake(8,6,500,bg);blast(el,cx,top+10,34)})}
  else if(s==="quake"){shake(18,blk?3:11,1300,bg);const cw=sw*1.4,cr=mk(el,"crk","left:"+(cx-cw/2)+"px;top:"+(gy0-6)+"px;width:"+cw+"px;height:34px");let d="M0 6 ";for(let i=1;i<=9;i++)d+="L"+(i*cw/9)+" "+(6+rnd(-9,14))+" ";
    cr.innerHTML='<svg width="100%" height="34" viewBox="0 0 '+cw+' 34" preserveAspectRatio="none"><path d="'+d+'" stroke="#ff7a30" stroke-width="9" fill="none" opacity=".6"/><path d="'+d+'" stroke="#1c0f08" stroke-width="4" fill="none"/></svg>';
    run(cr,[{transform:"scaleX(0)",opacity:1},{transform:"scaleX(1)",opacity:1,offset:.25},{opacity:1,offset:.8},{opacity:0}],{duration:1700});
    for(let i=0;i<(lo?4:9);i++)run(emo(el,"💨",cx-sw*.6+i*sw*.15,gy0,rnd(20,30)),[{transform:"translateY(0) scale(.5)",opacity:.9},{transform:"translateY(-34px) scale(1.8)",opacity:0}],{duration:900,delay:150+i*90,easing:"ease-out"});
    for(let i=0;i<(lo?3:8);i++)run(emo(el,"🪨",cx+rnd(-sw*.5,sw*.5),top-30,rnd(10,16)),[{transform:"translateY(0) rotate(0)",opacity:1},{transform:"translateY("+(gy0-top+28)+"px) rotate(240deg)",opacity:1,offset:.8},{transform:"translateY("+(gy0-top+28)+"px) rotate(260deg)",opacity:0}],{duration:900,delay:I-100+i*70,easing:"ease-in"});
    sway(blk?1:4,1300);impact(cx,gy0-6,()=>{ringAt(el,cx,gy0,"",5,700);boom(el,cx,gy0-14)})}
  else if(s==="bomb"){const ret=mk(el,"ret","left:"+cx+"px;top:"+(top+2)+"px");
    run(ret,[{transform:"translate(-50%,-50%) scale(2.2) rotate(0)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(90deg)",opacity:1,offset:.3},{transform:"translate(-50%,-50%) scale(.8) rotate(180deg)",opacity:1,offset:.9},{transform:"translate(-50%,-50%) scale(.8) rotate(200deg)",opacity:0}],{duration:I+200});
    airBomb({el,W,H,st,cx,top,sw,gy0,I,blk,lo,far,bg,flash,shake,dim,impact,sway})}
  else if(s==="octo"){if(!far)dim(.34,I+900,"rgba(6,30,52,.7)",bg);
    octoFx(t,{blk,I,ms:5000,lo,far,sc});
    [-.8,.8].forEach((d,i)=>ringAt(el,cx+d*sw,gy0,"cy",3.4,720,i*130));
    for(let i=0;i<(lo?5:13);i++){const x=cx+rnd(-sw*.95,sw*.95),y=gy0-4;run(emo(el,"💧",x,y,rnd(10,16)),[{transform:"translate(0,0) scale(.5)",opacity:0},{transform:"translate("+rnd(-14,14)+"px,"+-rnd(34,80)+"px) scale(1)",opacity:1,offset:.45},{transform:"translate("+rnd(-26,26)+"px,"+rnd(4,16)+"px) scale(.7)",opacity:0}],{duration:rnd(650,1050),delay:rnd(0,700),easing:"ease-out"})}
    impact(cx,top+sw*.2,()=>shake(8,5,520,bg))}
  else if(s==="freeze"){if(!far)dim(.3,I+1100,"rgba(110,185,255,.55)",bg);
    const wv=mk(el,"cld","left:"+(-W*.9)+"px;top:"+(top-34)+"px;width:"+W*1.8+"px;height:"+(gy0-top+70)+"px");
    run(wv,[{transform:"translateX(0)",opacity:0},{opacity:1,offset:.35},{transform:"translateX("+(W*.95)+"px)",opacity:.85,offset:.8},{transform:"translateX("+(W*1.2)+"px)",opacity:0}],{duration:I+700,easing:"ease-in-out"});
    for(let i=0;i<(lo?7:18);i++){const x=cx+rnd(-sw*1.2,sw*1.2),y=top-rnd(40,110),dr=rnd(-40,50);run(emo(el,"❄️",x,y,rnd(10,19)),[{transform:"translate(0,0) rotate(0)",opacity:0},{opacity:.95,offset:.2},{transform:"translate("+dr+"px,"+(gy0-y+rnd(-10,10))+"px) rotate("+rnd(-180,180)+"deg)",opacity:0}],{duration:rnd(900,1500),delay:rnd(0,I),easing:"ease-in"})}
    for(let j=0;j<(far?0:7);j++){const l=mk(sc,"wst2 ic","top:"+rnd(8,70)+"%;width:"+rnd(120,260)+"px");run(l,[{transform:"translateX(0)",opacity:0},{opacity:1,offset:.2},{transform:"translateX("+(sc.clientWidth+520)+"px)",opacity:0}],{duration:rnd(500,800),delay:j*110})}
    if(blk)setTimeout(()=>{for(let i=0;i<8;i++){const a=rnd(-2.6,-.5),d=rnd(26,60);run(emo(el,"❄️",cx,top+sw*.25,rnd(12,18)),[{transform:"translate(0,0)",opacity:1},{transform:"translate("+Math.cos(a)*d+"px,"+Math.sin(a)*d+"px) scale(.4)",opacity:0}],{duration:rnd(600,900),easing:"ease-out"})}},I);
    impact(cx,top,()=>iceFx(t,{ms:7000,lo,far,bg,sc}))}
  else if(s==="shield"){ensureShield(t,true);const y=top+sw*.3;for(let i=0;i<3;i++)ringAt(el,cx,y,"cy",5,800,i*180);
    for(let i=0;i<10;i++){const a=i/10*6.283;run(emo(el,"✨",cx,y,rnd(14,22)),[{transform:"translate(0,0) scale(.3)",opacity:0},{transform:"translate("+Math.cos(a)*sw*.7+"px,"+Math.sin(a)*sw*.7+"px) scale(1.2)",opacity:1,offset:.5},{transform:"translate("+Math.cos(a+1)*sw*.8+"px,"+(Math.sin(a+1)*sw*.8-30)+"px) scale(.4)",opacity:0}],{duration:1100,delay:i*40,easing:"ease-out"})}}
  else if(s==="turbo"){turboFx(t,{ms:t.mine?Math.max(1200,tbEnd-Date.now()):TB_MS,lo,far,sc,bg})}else if(s==="luck"){luckFx(t,{lo,far,sc})}else if(s==="fog"){dim(.45,2300,"rgba(205,215,230,.75)",bg);
    for(let i=0;i<7;i++)run(emo(el,"🌫️",cx+rnd(-sw*.7,sw*.7),top+rnd(-30,60),rnd(44,70)),[{transform:"translateX(-40px) scale(.4)",opacity:0},{transform:"translateX(0) scale(1)",opacity:.95,offset:.3},{transform:"translateX(30px) scale(1.15)",opacity:.9,offset:.8},{transform:"translateX(60px) scale(1.2)",opacity:0}],{duration:2300,delay:i*80});
    if(!blk)st.animate([{filter:"blur(0)"},{filter:"blur(5px)",offset:.25},{filter:"blur(5px)",offset:.75},{filter:"blur(0)"}],{duration:2300,delay:Math.max(0,I-300)});
    impact(cx,top,()=>ringAt(el,cx,top,"cy",4,700))}
  else if(s==="dizzy"){
    for(let i=0;i<3;i++)orbit(el,i%2?"💫":"🌀",cx,top-8,sw*.6,14,1700,i*200,rnd(22,30));
    for(let i=0;i<5;i++)orbit(el,"❓",cx,top-14,sw*.5,10,1500,300+i*150,rnd(16,22));
    run(emo(el,"🌀",cx,top-50,50),[{transform:"scale(.2) rotate(0)",opacity:0},{transform:"scale(1.1) rotate(360deg)",opacity:1,offset:.3},{transform:"scale(1) rotate(900deg)",opacity:1,offset:.8},{transform:"scale(.3) rotate(1200deg)",opacity:0}],{duration:1900});
    sway(blk?2:7,1800);impact(cx,top,()=>{ringAt(el,cx,top,"gd",4,700);shake(8,4,500,bg)})}
  else{const y=top+10;for(let i=0;i<3;i++)ringAt(el,cx,y,"gd",5,800,i*150);
    const x3=mk(ST.txu&&!far?el:document.createElement("i"),"x3t","left:"+cx+"px;top:"+top+"px","×3");run(x3,[{transform:"translate(-50%,0) scale(.3)",opacity:0},{transform:"translate(-50%,-20px) scale(1.5)",opacity:1,offset:.3},{transform:"translate(-50%,-90px) scale(1.2)",opacity:0}],{duration:1400,easing:"ease-out"});
    for(let i=0;i<9;i++)run(emo(el,"🧱",cx+rnd(-sw*.5,sw*.5),top-90,rnd(16,22)),[{transform:"translateY(0) rotate(0)",opacity:0},{opacity:1,offset:.2},{transform:"translateY("+(90+rnd(0,20))+"px) rotate("+rnd(-90,90)+"deg)",opacity:0}],{duration:900,delay:i*90,easing:"ease-in"});
    st.animate([{filter:"brightness(1)"},{filter:"brightness(1.8) drop-shadow(0 0 16px #ffd23f)",offset:.3},{filter:"none"}],{duration:900})}}
/* ===== skill gangguan: Cengkeraman Gurita & Beku Total ===== */
const eo=u=>1-Math.pow(1-u,3),ei=u=>u*u*u,sm=u=>u*u*(3-2*u),clp=(v,a,b)=>Math.max(a,Math.min(b,v)),f1=n=>Math.round(n*10)/10,SVGN="http://www.w3.org/2000/svg";
let frz=null,lkTapAt=0;
const stackGeo=t=>{const s=t.stack;return{x:s.offsetLeft,y:s.offsetTop,w:s.offsetWidth,h:s.offsetHeight}};
function lkEnd(t,quick){const L=t&&t.lk;if(!L)return;t.lk=null;clearInterval(L.iv);try{L.stop(!!quick)}catch(e){}}
function lkLabel(t,cls,ic){const b=mk(t.el,"lkl "+cls,"","<em>"+ic+"</em><b></b>");b.animate([{transform:"translateX(-50%) scale(.3)",opacity:0},{transform:"translateX(-50%) scale(1.2)",opacity:1,offset:.5},{transform:"translateX(-50%) scale(1)",opacity:1}],{duration:420,easing:"ease-out"});return b}
function lkPlace(t,b,rem){const s=stackGeo(t);b.style.left=(s.x+s.w/2)+"px";b.style.top=Math.max(2,s.y-34)+"px";b.lastChild.textContent=Math.max(1,Math.ceil(rem/1000))+" dtk"}
function lkVig(sc,cls){const v=mk(sc,"lkv "+cls);v.animate([{opacity:0},{opacity:1}],{duration:500,fill:"forwards"});return v}

/* tentakel: tiap tentakel melilit menara dalam bentuk spiral; bagian depan dan belakang digambar di dua lapisan */
function octoPath(g,prog,tm,sq){
  const F=[],B=[],H=[],S=[],ar=(x,y,r)=>"M"+f1(x-r)+" "+f1(y)+"a"+f1(r)+" "+f1(r)+" 0 1 0 "+f1(2*r)+" 0a"+f1(r)+" "+f1(r)+" 0 1 0 "+f1(-2*r)+" 0";
  for(const T of g.tn){
    const N=g.lo?38:68,P=[];
    for(let i=0;i<=N;i++){const u=i/N*prog,th=T.th0+T.dir*T.turns*6.2832*u,ap=1-sm(Math.min(1,u/.2)),
      rho=g.R*(1-.05*sq)+T.w0*.32+ap*g.w*.5+Math.sin(tm/420+T.ph+u*8)*(.8+u*2);
      P.push({x:g.cx+rho*Math.sin(th),y:g.y0-T.H*Math.pow(u,.78)+Math.cos(tm/560+T.ph+u*6)*1.3,f:Math.cos(th)>0,q:i/N})}
    const hw=P.map(p=>T.w0/2*Math.pow(1-p.q*.92,.8)+.8),
      nr=P.map((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(N,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;return[-dy/l,dx/l]});
    let a=0;
    while(a<N){let b=a;while(b<N&&P[b+1].f===P[a].f)b++;
      const e=Math.min(b+1,N),fr=P[a].f,L=[],R2=[],h=[];
      for(let i=a;i<=e;i++){const nx=nr[i][0],ny=nr[i][1],w=hw[i];
        L.push(f1(P[i].x+nx*w)+" "+f1(P[i].y+ny*w));R2.push(f1(P[i].x-nx*w)+" "+f1(P[i].y-ny*w));
        if(fr){const sg=ny<0?1:-1;h.push(f1(P[i].x+sg*nx*w*.45)+" "+f1(P[i].y+sg*ny*w*.45));
          if(i%5===2&&P[i].q<.82)S.push(ar(P[i].x+nx*w*.1,P[i].y+ny*w*.1,w*.36))}}
      (fr?F:B).push("M"+L.join("L")+"L"+R2.reverse().join("L")+"Z");
      if(fr&&h.length>1)H.push("M"+h.join("L"));
      a=b+1}
    const p=P[N];(p.f?F:B).push(ar(p.x,p.y,hw[N]+.4))}
  return{f:F.join(""),b:B.join(""),h:H.join(""),s:S.join("")}}

function octoFx(t,o){lkEnd(t,true);
  const el=t.el,id="og"+(octoFx.n=(octoFx.n||0)+1),
    NS=(c,h)=>{const s=document.createElementNS(SVGN,"svg");s.setAttribute("class","oct "+c);s.innerHTML=h;return s},
    bk=NS("bk",'<defs><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2250"/><stop offset="1" stop-color="#3a0f2b"/></linearGradient></defs><path fill="url(#'+id+'b)" stroke="#2a0a1d" stroke-width="1"/>'),
    fr=NS("fr",'<defs><linearGradient id="'+id+'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0647f"/><stop offset=".5" stop-color="#b0305a"/><stop offset="1" stop-color="#7a2250"/></linearGradient></defs><path fill="url(#'+id+'f)" stroke="#4a1030" stroke-width="1.2" stroke-linejoin="round"/><path fill="none" stroke="rgba(255,226,236,.62)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path fill="rgba(255,214,226,.92)" stroke="#8e2a4a" stroke-width=".8"/>');
  el.insertBefore(bk,t.stack);el.appendChild(fr);
  const pb=bk.querySelector("path"),ps=fr.querySelectorAll("path"),pm=o.blk?.46:1,L={blk:!!o.blk,t0:performance.now(),lb:null,vg:null,hit:0};
  L.end=L.t0+o.I+o.ms;
  const sz=()=>{const W=el.clientWidth,H=el.clientHeight,k=W+"x"+H;if(sz.k!==k){sz.k=k;[bk,fr].forEach(s=>{s.setAttribute("width",W);s.setAttribute("height",H);s.setAttribute("viewBox","0 0 "+W+" "+H)})}},
    geo=()=>{const s=stackGeo(t),h=Math.max(s.h,56),w=Math.max(s.w,34),w0=clp(w*.27,9,26);
      return{lo:!!o.lo,cx:s.x+w/2,y0:s.y+s.h+4,R:w/2+1,w,tn:[{dir:1,th0:-1.5707,turns:1.2,H:h*.62,w0,ph:0},{dir:-1,th0:1.5707,turns:1.35,H:h*.88,w0:w0*1.05,ph:2.1},{dir:1,th0:1.5707,turns:.9,H:h*.46,w0:w0*.9,ph:4.2}].slice(0,o.lo?2:3)}},
    onHit=()=>{const s=stackGeo(t);
      t.stack.animate([{transform:"scale(1,1)"},{transform:"scale(.92,1.03)"},{transform:"scale(1.025,.99)"},{transform:"none"}],{duration:560,easing:"ease-out"});
      fx(t,t.stack,["•","·","▪"],o.lo?4:9,34);
      L.lb=lkLabel(t,"o","🐙");
      if(t.mine&&!o.far)L.vg=lkVig(o.sc,"octo")};
  L.stop=q=>{bk.remove();fr.remove();if(L.lb)L.lb.remove();if(L.vg)L.vg.remove();t.stack.style.scale="";if(!q&&!L.blk)SFX.lockEnd("octo",o.far)};
  L.tick=now=>{const a=now-L.t0;if(a<0)return;sz();let p,sq=0;
    if(a<o.I)p=eo(a/o.I)*pm;
    else if(L.blk){const b=(a-o.I)/560;if(b>=1)return lkEnd(t,true);p=pm*(1-ei(b))}
    else{if(!L.hit){L.hit=1;onHit()}
      const rem=L.end-now;if(rem<=0)return lkEnd(t);
      p=rem<520?Math.pow(rem/520,1.6):1;const c=a-o.I;
      sq=Math.max(0,1-c/450)*.9+.35*(.5+.5*Math.sin(c/380));
      t.stack.style.scale=(1-.03*sq)+" 1";lkPlace(t,L.lb,rem)}
    const q=octoPath(geo(),p,now,sq);pb.setAttribute("d",q.b);ps[0].setAttribute("d",q.f);ps[1].setAttribute("d",q.h);ps[2].setAttribute("d",q.s)};
  t.lk=L;sz();return L}

/* es: balok es kristal membungkus menara, retak, lalu pecah berkeping-keping */
function iceFx(t,o){lkEnd(t,true);
  const el=t.el,L={blk:false,t0:performance.now(),lb:null,vg:null,cr:0,k:""},
    wr=mk(el,"ice","",'<div class="ib"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 34L38 0M100 22L58 100M16 100L100 46M0 72L62 52M30 0L24 64M78 8L70 70" stroke="rgba(255,255,255,.55)" stroke-width="1" fill="none" vector-effect="non-scaling-stroke"/><path d="M0 34L24 64L16 100ZM100 22L70 70L58 100ZM38 0L24 64L62 52Z" fill="rgba(255,255,255,.2)"/><path class="ck" d="M50 0L44 14L54 26L42 40L52 54L40 70L50 84L46 100M44 14L28 22L22 36M54 26L70 30L78 44M42 40L30 52M52 54L68 62L74 78" stroke="#eaffff" stroke-width="1.6" fill="none" vector-effect="non-scaling-stroke" opacity="0"/></svg></div>'),
    ib=wr.firstChild,ck=wr.querySelector(".ck"),jb=el.querySelector(".jib"),ic=[];
  L.end=L.t0+o.ms;
  const place=()=>{const s=stackGeo(t),k=s.x+"|"+s.y+"|"+s.w+"|"+s.h;if(L.k===k)return;L.k=k;
      const bt=s.y+s.h+4,h=Math.max(s.h+16,46),st=wr.style;st.left=(s.x-7)+"px";st.top=(bt-h)+"px";st.width=(s.w+14)+"px";st.height=h+"px"},
    shatter=()=>{const s=stackGeo(t),cx=s.x+s.w/2,cy=s.y+s.h*.5,gy=s.y+s.h,n=o.lo?10:22;
      t.stack.animate([{filter:"brightness(2.2) saturate(.2)"},{filter:"none"}],{duration:520});
      ringAt(el,cx,cy,"cy",5,650);
      for(let i=0;i<n;i++){const w=rnd(9,26),h=rnd(9,26),x=s.x+rnd(0,s.w)-w/2,y=s.y-6+rnd(0,s.h+10)-h/2,
          d=mk(el,"ish","left:"+x+"px;top:"+y+"px;width:"+w+"px;height:"+h+"px;clip-path:polygon(50% 0,100% "+f1(rnd(70,100))+"%,"+f1(rnd(0,30))+"% 100%)"),
          dx=(x+w/2-cx)*rnd(.9,1.8)+rnd(-18,18),up=rnd(20,60),fall=Math.max(10,gy-(y+h/2)+rnd(-6,6)),rot=rnd(-420,420);
        run(d,[{transform:"translate(0,0) rotate(0)",opacity:1},{transform:"translate("+dx*.5+"px,"+-up+"px) rotate("+rot*.4+"deg)",opacity:1,offset:.35},{transform:"translate("+dx+"px,"+fall+"px) rotate("+rot+"deg)",opacity:1,offset:.8},{transform:"translate("+dx*1.05+"px,"+fall+"px) rotate("+rot+"deg)",opacity:0}],{duration:rnd(900,1400),easing:"cubic-bezier(.3,.1,.6,1)"})}
      for(let i=0;i<(o.lo?4:10);i++)run(emo(el,"💧",cx+rnd(-s.w*.5,s.w*.5),cy+rnd(-s.h*.4,s.h*.3),rnd(10,16)),[{transform:"translate(0,0)",opacity:1},{transform:"translate("+rnd(-20,20)+"px,"+(gy-cy+8)+"px)",opacity:0}],{duration:rnd(700,1100),delay:rnd(0,300),easing:"ease-in"});
      for(let i=0;i<(o.lo?2:5);i++){const m=emo(el,"☁️",cx+rnd(-s.w*.5,s.w*.5),gy-rnd(0,s.h*.6),rnd(26,40));m.style.filter="brightness(2) saturate(0)";run(m,[{transform:"translateY(0) scale(.5)",opacity:.8},{transform:"translateY("+-rnd(40,80)+"px) scale(1.6)",opacity:0}],{duration:rnd(900,1400),delay:i*60,easing:"ease-out"})}};
  el.classList.add("frozen");t.stack.style.filter="saturate(.4) brightness(1.15)";
  if(jb)for(let i=0;i<7;i++){const c=document.createElement("i");c.className="icl";c.style.cssText="left:"+(8+i*13)+"%;height:"+f1(rnd(7,16))+"px";jb.appendChild(c);ic.push(c);c.animate([{transform:"scaleY(0)"},{transform:"none"}],{duration:500,delay:300+i*60,fill:"backwards"})}
  place();
  ib.animate([{transform:"scaleY(.05)",opacity:.2,filter:"brightness(2.5)"},{transform:"scaleY(1.06)",opacity:1,filter:"brightness(1.6)",offset:.6},{transform:"none",filter:"none"}],{duration:760,easing:"cubic-bezier(.2,.8,.3,1)"});
  if(!o.far)flash(o.bg);
  {const s=stackGeo(t),cx=s.x+s.w/2,gy=s.y+s.h;ringAt(el,cx,gy,"cy",6,800);ringAt(el,cx,gy,"cy",9,1000,160);
    for(let i=0;i<(o.lo?6:14);i++){const a=rnd(0,6.28),d=rnd(30,70);run(emo(el,i%3?"✦":"❄️",cx,gy-s.h*.5,rnd(12,20)),[{transform:"translate(0,0) scale(.3)",opacity:1},{transform:"translate("+Math.cos(a)*d+"px,"+(Math.sin(a)*d-20)+"px) scale(1)",opacity:0}],{duration:rnd(700,1100),easing:"ease-out"})}}
  L.iv=setInterval(()=>{if(!el.isConnected)return lkEnd(t,true);const s=stackGeo(t);
    run(mk(wr,"vp","left:"+rnd(0,Math.max(4,s.w-20))+"px"),[{transform:"translate(0,0) scale(.5)",opacity:0},{opacity:.9,offset:.25},{transform:"translate("+rnd(-18,18)+"px,"+-rnd(34,70)+"px) scale(1.7)",opacity:0}],{duration:rnd(1100,1700),easing:"ease-out"});
    if(!o.lo&&Math.random()<.6)run(emo(wr,"✦",rnd(0,s.w),rnd(0,s.h),rnd(10,15)),[{transform:"scale(0)",opacity:0},{transform:"scale(1.2)",opacity:1,offset:.4},{transform:"scale(0)",opacity:0}],{duration:900})},o.lo?600:300);
  L.stop=q=>{wr.remove();ic.forEach(c=>c.remove());el.classList.remove("frozen");t.stack.style.filter="";if(L.lb)L.lb.remove();if(L.vg)L.vg.remove()};
  L.tick=now=>{const rem=L.end-now;place();
    if(!L.lb&&now-L.t0>380){L.lb=lkLabel(t,"i","❄️");if(t.mine&&!o.far)L.vg=lkVig(o.sc,"freeze")}
    if(L.lb)lkPlace(t,L.lb,rem);
    if(!L.cr&&rem<700){L.cr=1;ck.animate([{opacity:0},{opacity:1}],{duration:320,fill:"forwards"});wr.animate([{transform:"translateX(0)"},{transform:"translateX(-1.6px)"},{transform:"translateX(1.6px)"},{transform:"translateX(0)"}],{duration:110,iterations:6});SFX.lockEnd("freeze",o.far)}
    if(rem<=0){shatter();lkEnd(t,true)}};
  t.lk=L;return L}

/* sisi korban: pengetikan terkunci selama skill aktif */
function lockMe(k){const s=SK[k],now=Date.now(),end=Math.max(now+(s.lk||s.tk)*1000,frz?frz.until:0);
  if(frz){clearTimeout(frz.to);clearInterval(frz.iv)}
  const P=$("pnl"),ty=$("typ");ty.value="";prevLen=0;ty.classList.remove("bad");ty.placeholder=s.id==="octo"?"Tertangkap gurita…":s.id==="roots"?"Terjerat akar…":"Menara membeku…";
  P.classList.remove("lk-octo","lk-freeze","lk-roots");P.classList.add("lk","lk-"+s.id);
  let c=$("lkc");if(!c){c=document.createElement("div");c.id="lkc";c.innerHTML="<em></em><span></span><u><b></b></u>";P.appendChild(c)}
  c.className="lkc "+s.id;c.querySelector("em").textContent=s.ic;
  const tx=c.querySelector("span"),bar=c.querySelector("b");
  bar.getAnimations().forEach(x=>x.cancel());bar.animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:end-now,easing:"linear",fill:"forwards"});
  c.animate([{transform:"translateX(-50%) scale(.6)",opacity:0},{transform:"translateX(-50%) scale(1.08)",opacity:1,offset:.5},{transform:"translateX(-50%) scale(1)",opacity:1}],{duration:380,easing:"ease-out"});
  frz={k,until:end};
  const label=()=>{tx.textContent=(s.id==="octo"?"TERCENGKRAM ":s.id==="roots"?"TERJERAT ":"BEKU ")+(Math.max(0,frz.until-Date.now())/1000).toFixed(1)+" dtk"};
  label();frz.iv=setInterval(label,100);frz.to=setTimeout(()=>frzEnd(),end-now);drawWord()}
function frzEnd(q){if(!frz)return;clearTimeout(frz.to);clearInterval(frz.iv);frz=null;
  const P=$("pnl"),ty=$("typ"),c=$("lkc");P.classList.remove("lk","lk-octo","lk-freeze","lk-roots");ty.placeholder="Ketik di sini…";
  if(c){if(q)c.remove();else{c.removeAttribute("id");c.animate([{opacity:1},{opacity:0,transform:"translateX(-50%) scale(.7)"}],{duration:260}).onfinish=()=>c.remove()}}
  if(q)return;ty.value="";prevLen=0;
  if(started&&!over){ty.focus();drawWord();if(ST.txr)popup("BEBAS! LANJUT KETIK")}}
function lkTap(){const n=performance.now();if(n-lkTapAt<260)return;lkTapAt=n;const c=$("lkc");
  if(c)c.animate([{transform:"translateX(-50%)"},{transform:"translateX(calc(-50% - 5px))"},{transform:"translateX(calc(-50% + 5px))"},{transform:"translateX(-50%)"}],{duration:200});
  SFX.err()}
/* ===== skill bantu: TURBO BOOST & KEBERUNTUNGAN ===== */
function tbcRm(){const c=$("tbc");if(c)c.remove()}
function tbcSet(rem){let c=$("tbc");
  if(!c){c=document.createElement("div");c.id="tbc";c.className="tbc";c.innerHTML="<em>🚀</em><span></span><u><b></b></u>";$("pnl").appendChild(c);
    c.animate([{transform:"scale(.5)",opacity:0},{transform:"scale(1.12)",opacity:1,offset:.5},{transform:"scale(1)",opacity:1}],{duration:380,easing:"ease-out"});
    c.querySelector("b").animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:Math.max(200,rem),easing:"linear",fill:"forwards"})}
  c.querySelector("span").textContent="TURBO "+(Math.max(0,rem)/1000).toFixed(1)}
function tbStop(t,quick){const L=t&&t.tbo;if(!L)return;t.tbo=null;try{L.stop(!!quick)}catch(e){}}
/* percikan api: titik bercahaya dengan lintasan parabola (gravitasi g) */
function tbSpark(el,x,y,n,sp,g){for(let i=0;i<n;i++){
  const d=mk(el,"tbp","left:"+f1(x)+"px;top:"+f1(y)+"px"),z=rnd(2.5,5),a=rnd(-Math.PI*.96,-Math.PI*.04),v=rnd(.45,1)*sp,vx=Math.cos(a)*v,vy=Math.sin(a)*v,T=rnd(.5,.95),kf=[];
  d.style.width=d.style.height=f1(z)+"px";
  for(let j=0;j<=6;j++){const u=j/6,q=u*T;kf.push({transform:"translate("+f1(vx*q)+"px,"+f1(vy*q+.5*g*q*q)+"px) scale("+f1(1-u*.65)+")",opacity:u<.7?1:Math.max(0,1-(u-.7)*3.4)})}
  run(d,kf,{duration:T*1000})}}
function tbLand(t,f){if(!f.isConnected)return;const r=f.getBoundingClientRect(),b=t.el.getBoundingClientRect();
  tbSpark(t.el,r.left-b.left+r.width/2,r.top-b.top+r.height,ST.lite?3:7,150,520)}
function turboFx(t,o){tbStop(t,true);
  const el=t.el,lo=o.lo||o.far,n0=performance.now(),L={t0:n0,end:n0+o.ms,lb:null,vg:null,k:"",nx:0,mine:!!t.mine},
    au=mk(el,"tba"),fa=mk(el,"tbf l"),fb=mk(el,"tbf r"),
    place=()=>{const s=stackGeo(t),k=s.x+"|"+s.y+"|"+s.w+"|"+s.h;if(L.k===k)return;L.k=k;
      const gy=s.y+s.h,h=s.h+46,a=au.style;a.left=(s.x-14)+"px";a.top=(gy-h+8)+"px";a.width=(s.w+28)+"px";a.height=h+"px";
      fa.style.left=(s.x-5)+"px";fb.style.left=(s.x+s.w+5)+"px";fa.style.top=fb.style.top=(gy-28)+"px"};
  el.classList.add("tbo");place();
  /* ledakan aktivasi: gelombang kejut, kolom cahaya naik, percikan, asap */
  {const s=stackGeo(t),cx=s.x+s.w/2,gy=s.y+s.h;
    ringAt(el,cx,gy,"or",6,800);ringAt(el,cx,gy,"or",9.5,1000,150);
    const col=mk(el,"tbl","left:"+(s.x-4)+"px;top:"+(s.y-34)+"px;width:"+(s.w+8)+"px;height:"+(s.h+34)+"px");
    run(col,[{transform:"scaleY(.05)",opacity:0},{transform:"scaleY(1)",opacity:.95,offset:.35},{transform:"scaleY(1)",opacity:0}],{duration:900,easing:"ease-out"});
    t.stack.animate([{filter:"brightness(1)"},{filter:"brightness(1.6) saturate(1.3) drop-shadow(0 0 14px #ff9a1f)",offset:.25},{filter:"none"}],{duration:900});
    tbSpark(el,cx,gy-6,lo?10:26,260,640);
    for(let i=0;i<(lo?2:4);i++){const m=emo(el,"☁️",cx+rnd(-s.w*.6,s.w*.6),gy-rnd(0,8),rnd(20,30));m.style.filter="grayscale(1) brightness(.8)";
      run(m,[{transform:"translateY(0) scale(.5)",opacity:.85},{transform:"translate("+f1(rnd(-16,16))+"px,"+f1(-rnd(36,76))+"px) scale(1.6)",opacity:0}],{duration:rnd(800,1300),delay:i*60,fill:"both",easing:"ease-out"})}
    [fa,fb].forEach(e=>e.animate([{opacity:0},{opacity:1}],{duration:320}));
    if(L.mine&&!o.far){L.vg=lkVig(o.sc,"turbo");shake(4,3,320,o.bg);stat()}}
  L.stop=q=>{[au,fa,fb].forEach(e=>e.remove());el.classList.remove("tbo");if(L.lb)L.lb.remove();
    if(L.vg){const v=L.vg;if(q)v.remove();else v.animate([{opacity:1},{opacity:0}],{duration:450,fill:"forwards"}).onfinish=()=>v.remove()}
    if(L.mine){tbcRm();if(!q)tbEnd=0;stat()}
    if(!q){/* turbo habis: uap pendingin keluar */
      const s=stackGeo(t),cx=s.x+s.w/2,gy=s.y+s.h;
      for(let i=0;i<(lo?2:5);i++){const m=emo(el,"☁️",cx+rnd(-s.w*.6,s.w*.6),gy-rnd(0,s.h*.5),rnd(18,30));m.style.filter="grayscale(1) brightness(1.5)";
        run(m,[{transform:"translateY(0) scale(.5)",opacity:.8},{transform:"translate("+f1(rnd(-16,16))+"px,"+f1(-rnd(30,70))+"px) scale(1.5)",opacity:0}],{duration:rnd(800,1300),delay:i*70,fill:"both",easing:"ease-out"})}
      SFX.vent(o.far)}};
  L.tick=now=>{if(!el.isConnected)return tbStop(t,true);const rem=L.end-now;place();
    if(!L.lb&&now-L.t0>300)L.lb=lkLabel(t,"t","🚀");
    if(L.lb){lkPlace(t,L.lb,rem);if(rem<1100)L.lb.style.opacity=(Math.floor(rem/110)&1)?.4:1}
    if(rem<1100)au.style.opacity=(Math.floor(rem/90)&1)?.35:1;
    if(L.mine)tbcSet(rem);
    if(now>=L.nx){L.nx=now+(lo?230:100);const s=stackGeo(t),gy=s.y+s.h,
        ln=mk(el,"tbs","left:"+f1(s.x-5+rnd(0,s.w+10))+"px;top:"+f1(gy-rnd(6,26))+"px;height:"+f1(rnd(22,54))+"px");
      run(ln,[{transform:"translateY(0)",opacity:0},{opacity:.95,offset:.2},{transform:"translateY("+f1(-(s.h+28))+"px)",opacity:0}],{duration:rnd(360,620),easing:"cubic-bezier(.3,.1,.4,1)"});
      if(Math.random()<(lo?.3:.65))tbSpark(el,Math.random()<.5?s.x-3:s.x+s.w+3,gy-rnd(2,24),lo?1:2,rnd(60,120),rnd(140,260))}
    if(rem<=0)tbStop(t,false)};
  t.tbo=L;return L}

/* keberuntungan: lencana 🍀 di menara selama masih ada sisa kesempatan */
function lkbPos(t){const b=t.lkb;if(!b)return;const s=stackGeo(t),y=Math.max(0,s.y-18);b.style.left=(s.x+s.w-6)+"px";b.style.top=y+"px";
  const n=performance.now();if(!ST.lite&&n>(t.lkS||0)){t.lkS=n+rnd(450,800);
    run(mk(t.el,"lkst","left:"+f1(s.x+s.w-6+rnd(-10,14))+"px;top:"+f1(y+rnd(-6,16))+"px"),[{transform:"translate(0,0) scale(0)",opacity:0},{transform:"translate("+f1(rnd(-6,6))+"px,"+f1(-rnd(10,24))+"px) scale("+f1(rnd(.7,1.2))+") rotate(90deg)",opacity:1,offset:.45},{transform:"translate("+f1(rnd(-8,8))+"px,"+f1(-rnd(24,40))+"px) scale(0) rotate(180deg)",opacity:0}],{duration:900,easing:"ease-out"})}}
function lkBadge(t,n){
  if(n>0){
    if(!t.lkb){const b=mk(t.el,"lkb","","<em>🍀</em><b>"+n+"</b>");t.lkb=b;t.lkn=n;lkbPos(t);
      b.animate([{transform:"scale(.2)",opacity:0},{transform:"scale(1.3)",opacity:1,offset:.6},{transform:"scale(1)"}],{duration:520,easing:"cubic-bezier(.2,1.6,.4,1)"})}
    else if(n!==t.lkn){if(n<t.lkn)luckPing(t);t.lkn=n;t.lkb.lastChild.textContent=n;
      t.lkb.animate([{transform:"scale(1)"},{transform:"scale(1.4)"},{transform:"scale(1)"}],{duration:380,easing:"ease-out"})}}
  else if(t.lkb){const b=t.lkb;if(t.lkn>0)luckPing(t);t.lkb=null;t.lkn=0;
    b.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(.3) translateY(-20px)"}],{duration:420,fill:"forwards"}).onfinish=()=>b.remove()}}
function luckBonus(){push({lk:lkC});SFX.ping();if(ST.txu)popup("🍀 BONUS +1 LANTAI")}
/* kesempatan terpakai: semburan bintang emas + tulisan +1 */
function luckPing(t){const s=stackGeo(t),cx=s.x+s.w/2,y=Math.max(0,s.y-8);
  ringAt(t.el,cx,y+10,"gd",3.4,650);ringAt(t.el,cx,y+10,"lk",5,800,120);
  for(let i=0;i<(ST.lite?5:12);i++){const a=rnd(-Math.PI,0),d=rnd(24,64);
    run(mk(t.el,"lkst","left:"+f1(cx)+"px;top:"+f1(y)+"px"),[{transform:"translate(0,0) scale(.4) rotate(0)",opacity:1},{transform:"translate("+f1(Math.cos(a)*d)+"px,"+f1(Math.sin(a)*d)+"px) scale("+f1(rnd(.8,1.4))+") rotate(160deg)",opacity:1,offset:.45},{transform:"translate("+f1(Math.cos(a)*d*1.2)+"px,"+f1(Math.sin(a)*d+30)+"px) scale(0) rotate(240deg)",opacity:0}],{duration:rnd(700,1100),easing:"ease-out"})}
  const b=mk(t.el,"lkbn","left:"+f1(cx)+"px;top:"+f1(y-8)+"px","+1 🍀");
  run(b,[{transform:"translate(-50%,10px) scale(.4)",opacity:0},{transform:"translate(-50%,-6px) scale(1.25)",opacity:1,offset:.25},{transform:"translate(-50%,-46px) scale(1)",opacity:0}],{duration:1100,easing:"ease-out"})}
function lorb(el,ch,x0,y0,rx,ry,dur,dl,sz){const e=emo(el,ch,x0,y0,sz),n=16,kf=[];
  for(let a=0;a<=n;a++){const r=a/n*Math.PI*3;kf.push({transform:"translate("+f1(Math.cos(r)*rx)+"px,"+f1(Math.sin(r)*ry-a*4)+"px) rotate("+a*35+"deg) scale("+f1(Math.sin(a/n*Math.PI))+")",opacity:a===0||a===n?0:1})}
  run(e,kf,{duration:dur,delay:dl,fill:"both"})}
function luckFx(t,o){
  const el=t.el,s=stackGeo(t),cx=s.x+s.w/2,top=s.y,gy=s.y+s.h,lo=o.lo;
  ringAt(el,cx,top+s.h*.4,"lk",4.5,850);ringAt(el,cx,top+s.h*.4,"gd",6.5,1050,170);ringAt(el,cx,gy,"lk",6,900,320);
  /* lambang semanggi berputar dengan sinar emas */
  const hl=mk(el,"lkh","left:"+cx+"px;top:"+(top-42)+"px","<i></i><em>🍀</em>");
  run(hl,[{transform:"translateY(14px) scale(.2)",opacity:0},{transform:"translateY(0) scale(1.2)",opacity:1,offset:.25},{transform:"translateY(-6px) scale(1)",opacity:1,offset:.7},{transform:"translateY(-34px) scale(.7)",opacity:0}],{duration:1900,easing:"ease-out"});
  hl.lastChild.animate([{transform:"rotate(-200deg)"},{transform:"rotate(0)"}],{duration:800,easing:"cubic-bezier(.2,1.3,.4,1)"});
  /* kilau emas menyapu badan menara */
  const sweep=d=>{const c=stackGeo(t),sh=mk(el,"lksh","left:"+c.x+"px;top:"+c.y+"px;width:"+c.w+"px;height:"+c.h+"px"),bd=mk(sh,"lksb");
    run(bd,[{transform:"translateX(-130%) skewX(-20deg)"},{transform:"translateX(430%) skewX(-20deg)"}],{duration:1000,delay:d,fill:"both",easing:"ease-in-out"});setTimeout(()=>sh.remove(),d+1200)};
  sweep(150);if(!lo)sweep(750);
  t.stack.animate([{filter:"brightness(1)"},{filter:"brightness(1.5) drop-shadow(0 0 14px #ffe27a)",offset:.3},{filter:"none"}],{duration:1000});
  for(let i=0;i<(lo?9:22);i++){const x=cx+rnd(-s.w*.62,s.w*.62),y=top+rnd(-8,s.h+4);
    run(mk(el,"lkst","left:"+f1(x)+"px;top:"+f1(y)+"px"),[{transform:"translate(0,0) scale(0) rotate(0)",opacity:0},{transform:"translate("+f1(rnd(-8,8))+"px,"+f1(-rnd(8,24))+"px) scale("+f1(rnd(.8,1.5))+") rotate(90deg)",opacity:1,offset:.4},{transform:"translate("+f1(rnd(-14,14))+"px,"+f1(-rnd(30,70))+"px) scale(0) rotate(200deg)",opacity:0}],{duration:rnd(800,1400),delay:rnd(0,1100),fill:"both",easing:"ease-out"})}
  for(let i=0;i<(lo?2:5);i++)lorb(el,"🍀",cx,top+s.h*.45,s.w*.8,Math.max(8,s.h*.12),1900,i*170,rnd(15,22));
  for(let i=0;i<(lo?3:6);i++){const x=cx+rnd(-s.w*.4,s.w*.4),dx=rnd(-40,40),c=emo(el,"🪙",x,top-4,rnd(14,19));
    run(c,[{transform:"translate(0,0) rotate(0)",opacity:0},{transform:"translate("+f1(dx*.5)+"px,"+f1(-rnd(46,80))+"px) rotate(180deg)",opacity:1,offset:.4},{transform:"translate("+f1(dx)+"px,"+f1(gy-top+8)+"px) rotate(420deg)",opacity:1,offset:.85},{transform:"translate("+f1(dx)+"px,"+f1(gy-top+8)+"px) rotate(440deg)",opacity:0}],{duration:rnd(1000,1400),delay:200+i*90,fill:"both",easing:"ease-in-out"})}}
function skBanner(att,vic,s,sc){const e=document.createElement("div");e.className="skb2 "+s.t;e.innerHTML="<em>"+s.ic+"</em><b>"+s.n+"!</b><small>"+esc(att.name)+(vic?" → "+esc(vic.name):" mengaktifkan skill")+"</small>";(sc||$("scene")).appendChild(e);
  e.animate([{transform:"translateX(-50%) scale(.3)",opacity:0},{transform:"translateX(-50%) scale(1.15)",opacity:1,offset:.15},{transform:"translateX(-50%) scale(1)",opacity:1,offset:.75},{transform:"translateX(-50%) translateY(-24px)",opacity:0}],{duration:1700}).onfinish=()=>e.remove()}
function play(att,a,ps){const s=SK[a.k];if(!s)return;if(s.ar){lgPlay(att,a,ps);return}if(s.lg){lgSelf(att,a,ps);return}const atk=s.t==="a",t=tws[a.to];if(atk&&t)t.sk={k:a.k,at:performance.now(),by:att.id===me.id};
  if(att.id===me.id?ST.txu:(atk&&a.to===me.id&&ST.txr))skBanner(att,atk?ps.find(x=>x.id===a.to):null,s);skfx(a.to,a.k,atk&&a.b);if(atk&&a.to===me.id)$("scene").animate(SHK.concat(SHK),{duration:700,delay:IMP[a.k]-200})}
function hit(a){const s=SK[a.k];if(!s)return;setTimeout(()=>{if(over||ended)return;
    if(me.dg>Date.now()){lgDgBlock();return}
    if(me.sh){push({sh:0});if(ST.txr)popup("🛡️ SERANGAN DITANGKIS!");return}
    if(s.lk){lockMe(a.k);if(ST.txr)popup(s.ic+" "+s.n+"!");return}if(s.x){dz={k:a.k,n:3};drawWord();if(ST.txr)popup(s.ic+" "+s.n+"!");return}
    if(!fc){if(ST.txr)popup("AMAN! Lantai masih kosong");return}
    fc=Math.max(0,fc-s.d);SFX.hurt();push({floors:fc});stat();drawWord();sync();
    const v=document.createElement("div");v.className="flash";v.style.background="radial-gradient(circle,transparent 35%,rgba(255,40,30,.7))";$("scene").appendChild(v);v.animate([{opacity:0},{opacity:1,offset:.2},{opacity:0}],{duration:700}).onfinish=()=>v.remove();
    $("fl").animate([{transform:"scale(1.3)",background:"#c8261a"},{transform:"none"}],{duration:600,easing:"ease-out"})},IMP[a.k]+40)}
function hits(ps){ps.forEach(p=>{const a=p.atk;if(!a||p.id===me.id||seen[p.id]===a.s)return;seen[p.id]=a.s;play(p,a,ps);if(SK[a.k]&&SK[a.k].t==="a"){if(SK[a.k].ar){lgIncoming(p,a);BOTS.forEach(b=>botArea(b,a,p.id))}else if(a.to===me.id)hit(a);else if(BOTS.some(x=>x.id===a.to))botHit(a)}})}
/* pilih skill */
function pickHide(){clearTimeout(pickTo);pickOn=false;$("pick").classList.add("hide")}
function openPick(){if(skq<=0||over||ended){return}skq--;pickOn=true;pickSet=rollSet(fc,!!(typeof LG!=="undefined"&&LG.bet));
  const P=$("pick");P.innerHTML=pickSet.map((k,i)=>'<button data-k="'+k+'" class="'+SK[k].t+(SK[k].x?" x":"")+(SK[k].c?" "+SK[k].c:"")+' r'+SK[k].r+'"><em>'+(i+1)+'</em><i>'+SK[k].ic+'</i><b>'+SK[k].n+'</b><u class="rtg">'+SK_RAR[SK[k].r]+'</u><small>'+SK[k].ds+'</small></button>').join("")+'<div class="ph">Pilih 1 skill: ketuk kartu atau tekan 1, 2, 3</div>';
  P.classList.remove("hide");SFX.pick();P.animate([{transform:"translateX(-50%) translateY(-30px) scale(.8)",opacity:0},{transform:"translateX(-50%) scale(1)",opacity:1}],{duration:320,easing:"cubic-bezier(.2,1.5,.4,1)"});
  clearTimeout(pickTo)}
function choose(k){SFX.choose();clearTimeout(pickTo);pickOn=false;$("pick").classList.add("hide");if(!over&&!ended)use(k);if(skq>0)setTimeout(openPick,600);if(started&&!over)$("typ").focus()}
function use(k){const s=SK[k],now=Date.now();let a;
  if(s.t==="a"){const ps=peersNow().filter(p=>p.id!==me.id&&!p.fin);if(!ps.length){popup("Belum ada lawan untuk diserang");return}
    if(s.ar){a={s:me.id+now,k,to:"*",n:0,b:0};seen[me.id]=a.s;push({atk:a});BOTS.forEach(b=>botArea(b,a,me.id))}else{ps.sort((x,y)=>(y.floors||0)-(x.floors||0));a={s:me.id+now,k,to:ps[0].id,n:s.d,b:(ps[0].sh||ps[0].dg>Date.now())?1:0};seen[me.id]=a.s;push({atk:a});if(BOTS.some(x=>x.id===a.to))botHit(a)}}
  else{a={s:me.id+now,k,to:me.id,n:0};seen[me.id]=a.s;let pp;if(k===6)pp={atk:a,sh:1};else if(k===K_TB){tbEnd=now+TB_MS;pp={atk:a}}else if(k===K_LK){lkC=LK_N;pp={atk:a,lk:lkC}}else if(k===K_BET){pp={atk:a,bt:1,btn:0};lgBetStart()}else if(k===K_DRG){pp={atk:a,dg:now+DRG_MS};lgDgStart()}else pp={atk:a,bf:BUF};push(pp);stat();sync()}
  play(me,a,peersNow())}
if(!$("pick")){const d=document.createElement("div");d.id="pick";d.className="pick hide";$("s-game").appendChild(d)}
$("pick").addEventListener("pointerdown",e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();choose(+b.dataset.k)});
/* ===== BOT ===== */
const BL=[{n:"Mudah",wpm:16,err:.12,rt:2000},{n:"Normal",wpm:30,err:.07,rt:1200},{n:"Susah",wpm:48,err:.035,rt:600},{n:"Ahli",wpm:72,err:.015,rt:300}],BN=["Budi","Sari","Dimas","Rani","Agus","Putri","Joko","Maya","Eko","Dewi","Rizky","Nina","Bayu","Tia"];
let BOTS=[],botsOn=false;const botTm={};
const botCopy=()=>BOTS.map(b=>({...b}));
function pubBots(){push({bots:botCopy()});sync()}
function addBot(lv){const ps=peersNow();if(ps.length>=6)return;const used=new Set(ps.map(p=>p.name));let nm;do nm="Bot "+BN[Math.random()*BN.length|0];while(used.has(nm)&&used.size<BN.length+ps.length);
  BOTS.push({id:"bot"+Math.random().toString(36).slice(2,7),name:nm,av:Math.random()*6|0,lv:lv|0,ready:true,floors:0,fin:0,lastAt:0,atk:null,sh:0,bf:0,cb:0,i:0,jt:Date.now()+BOTS.length});lastSig="";pubBots()}
function delBot(id){BOTS=BOTS.filter(b=>b.id!==id);lastSig="";pubBots()}
function stopBots(){botsOn=false;for(const k in botTm){clearTimeout(botTm[k]);delete botTm[k]}}
function startBots(){if(!BOTS.length)return;botsOn=true;BOTS.forEach(b=>{b.i=0;b.cb=0;b.fz=0;b.tb=0;b.lk=0;b.dg=0;b.bt=0;b.btn=0;botGo(b,rnd(300,1200))})}
function botGo(b,pre){if(!botsOn||ended)return;const L=BL[b.lv|0],w=list[b.i]||"kata",bad=Math.random()<L.err*Math.max(.6,w.length/5);
  const d=(pre||0)+(b.dis>0?rnd(900,1600):0)+(w.length+1)/(L.wpm*5/60)*1000*rnd(.75,1.3)+(bad?rnd(500,1100):0);
  botTm[b.id]=setTimeout(()=>{if(!botsOn||ended)return;if(G.m==="time"&&Date.now()-t0>=G.t*1000)return;
    if(b.fz&&Date.now()<b.fz){botGo(b,b.fz-Date.now());return}if(b.dis>0)b.dis--;if(bad)b.cb=0;const g=(b.bf>0?3:1)*(b.tb>Date.now()?2:1);if(b.bf>0)b.bf--;b.i++;b.floors=G.m==="race"?Math.min(G.fl,b.floors+g):b.floors+g;b.cb++;b.lastAt=Date.now();
    if(b.bt){if(bad){b.bt=0;b.btn=0;b.floors=Math.max(0,b.floors-BET_DN);if(typeof lgBotBet==="function")lgBotBet(b,0)}else if(++b.btn>=BET_N){b.bt=0;b.btn=0;b.floors=G.m==="race"?Math.min(G.fl,b.floors+BET_UP):b.floors+BET_UP;if(typeof lgBotBet==="function")lgBotBet(b,1)}else pubBots()}
    if(G.m==="race"&&b.floors>=G.fl)b.fin=Date.now();
    let sk=false;if(G.sk&&!b.fin&&b.cb>=(b.lk>0?LK_NEED:SK_EVERY)){sk=true;b.cb=0;if(b.lk>0){b.lk--;b.floors=G.m==="race"?Math.min(G.fl,b.floors+1):b.floors+1;if(G.m==="race"&&b.floors>=G.fl){b.fin=Date.now();sk=false}}}pubBots();
    if(sk)botTm[b.id+"s"]=setTimeout(()=>{if(botsOn&&!ended)botSkill(b)},L.rt);
    if(!b.fin)botGo(b)},d)}
function botSkill(b){const a=rollSet(b.floors,!!b.bt),tg=peersNow().filter(p=>p.id!==b.id&&!p.fin).sort((x,y)=>(y.floors||0)-(x.floors||0))[0],lv=b.lv|0;
  const sc=k=>{const s=SK[k];let v;if(s.t==="a")v=tg?(s.ar?6.5:(s.x?3:s.d*2))+(tg.sh?-3:0)+((tg.floors||0)>=b.floors?1:0):-9;else if(k===6)v=b.sh?-5:((tg&&b.floors>=(tg.floors||0))?3:1.5);else if(k===K_TB)v=b.tb>Date.now()?-4:2.6+(tg&&b.floors<(tg.floors||0)?1.5:0);else if(k===K_LK)v=b.lk>0?-4:2.4;else if(k===K_BET)v=b.bt?-6:2.2+(b.lv|0)*.55;else if(k===K_DRG)v=b.dg>Date.now()?-6:2.4+((tg&&(tg.floors||0)>=b.floors)?.9:0);else v=b.bf>0?-3:2.5+(tg&&b.floors<(tg.floors||0)?1:0);
    return lv===0?Math.random():v+Math.random()*(lv===1?2.5:.6)};
  const k=a.map(k=>[k,sc(k)]).sort((x,y)=>y[1]-x[1])[0][0],s=SK[k],now=Date.now();let at;
  if(s.t==="a"){if(!tg)return;at={s:b.id+now,k,to:s.ar?"*":tg.id,n:s.d,b:(tg.sh||tg.dg>Date.now())?1:0}}
  else{at={s:b.id+now,k,to:b.id,n:0};if(k===6)b.sh=1;else if(k===K_TB)b.tb=now+TB_MS;else if(k===K_LK)b.lk=LK_N;else if(k===K_BET){b.bt=1;b.btn=0}else if(k===K_DRG){b.dg=now+DRG_MS;b.fz=0;b.dis=0}else b.bf=BUF}
  b.atk=at;pubBots()}
function botArea(b,a,attId){const s=SK[a.k];if(!s||b.id===attId||b.fin)return;
  botTm[b.id+"a"+a.s]=setTimeout(()=>{if(ended)return;if(b.dg>Date.now())return;if(b.sh){b.sh=0;pubBots();return}if(s.id==="roots")b.fz=Date.now()+s.tk*1000;let n=0;(function tk(){if(ended||!botsOn||n>=s.tk)return;botTm[b.id+"a"+a.s+n]=setTimeout(()=>{if(ended||!botsOn)return;n++;if(b.floors>0&&!(b.dg>Date.now())){b.floors--;pubBots()}tk()},1000)})()},IMP[a.k])}
function botHit(a){const s=SK[a.k],b=BOTS.find(x=>x.id===a.to);if(!b)return;setTimeout(()=>{if(ended)return;if(b.dg>Date.now())return;if(b.sh){b.sh=0;pubBots();return}if(s.lk){b.fz=Date.now()+s.lk*1000;return}if(s.x){b.dis=3;return}if(!b.floors)return;b.floors=Math.max(0,b.floors-s.d);pubBots()},IMP[a.k]+40)}
function siteInit(){const st=$("site");(siteInit.iv||[]).forEach(clearInterval);siteInit.iv=[];st.innerHTML="";
  const D=$("demo"),L=D.offsetLeft,W=D.offsetWidth,k=Math.max(.6,Math.min(1,W/520)),T=[...D.querySelectorAll(".tw")].map(el=>({cx:L+el.offsetLeft+el.offsetWidth/2,o:el.offsetWidth*.39+10*k,v:el.style.getPropertyValue("--c")}));
  const mk=(x,cls,html,o)=>{o=o||{};const w=document.createElement("div");w.className="wk "+cls;w.style.cssText="--s:"+k+";left:"+x+"px;bottom:"+(o.b||0)+"px;--d:-"+(Math.random()*.5).toFixed(2)+"s;transition:left 3.6s ease-in-out";w.innerHTML=html;st.appendChild(w);return w};
  [L+W*.04,L+W*.96].forEach(x=>{const e=document.createElement("i");e.className="pile";e.style.cssText="left:"+x+"px;--s:"+k;st.appendChild(e)});
  const ham=[],car=[];
  T.forEach((t,i)=>{const d=i===T.length-1?-1:1;ham.push([mk(t.cx+d*t.o,"work"+(d>0?" rt":""),WKS(t.v)),d])});
  if(T.length>2){[[L+W*.04+26*k,T[0].cx-T[0].o,"#ff5c97",-4],[L+W*.96-26*k,T[2].cx+T[2].o,"#ffc21a",-4],[L+W*.04+26*k,T[1].cx-T[1].o,"#b36bff",-10]].forEach(([a,b,v,bt])=>car.push([mk(a,"walk carry",WKS(v)+'<i class="brk"></i>',{b:bt}),a,b]))}
  const boss=mk(L+W*.5,"idle",WKS("#2b2b3a").replace(/#ffd23f/g,"#fff").replace(/#f0b400/g,"#d8d8d8")+'<b class="sp" style="opacity:1;font-size:13px"></b>',{b:-20}),
    sp=boss.querySelector(".sp"),say=["Cepat!","Ayo kerja!","Jangan malas!","Bata mana?","Rapikan!","Semangat!"];let bi=0,to=0;
  const talk=()=>{sp.textContent=say[bi++%say.length];sp.animate([{transform:"translateX(-50%) scale(.4)",opacity:0},{transform:"translateX(-50%) scale(1)",opacity:1}],{duration:300,easing:"cubic-bezier(.2,1.6,.4,1)"});boss.classList.toggle("rt",bi%2===0)};
  const tick=()=>{to^=1;car.forEach(([w,a,b])=>{const tg=to?b:a,fr=to?a:b;w.classList.toggle("rt",tg<fr);w.classList.toggle("carry",!!to);w.style.left=tg+"px"})};
  setTimeout(tick,60);talk();
  siteInit.iv=[setInterval(tick,4000),setInterval(talk,2400),setInterval(()=>setTimeout(()=>ham.forEach(([w,d])=>puff(st,w,d)),250),550)]}
function demoInit(){const d=$("demo"),sky=$("sky"),H=d.clientHeight||400,fh=Math.max(10,Math.min(26,(H-92-22)/13.2));d.style.setProperty("--fh",fh+"px");
  const P=[["Raka",0],["Nina",3],["Doni",5],["Sari",1]].map(([nm,av],i)=>({id:"demo"+i,name:nm,av,floors:0,bf:0,sh:0}));
  const live=()=>ambient.on&&!document.hidden;
  P.forEach((p,i)=>{
    (function go(){setTimeout(()=>{if(ambient.on&&!document.hidden){
      if(p.floors>=9){p.floors=0;p.bf=0;p.sh=0;p.frz=0;p.tbU=0;p.lk=0;if(dws[p.id]){dws[p.id].sk=null;tbStop(dws[p.id],true)}}
      else if(p.frz>Date.now()){}else{const g=(p.bf>0?3:1)*(p.tbU>Date.now()?2:1);if(p.bf>0)p.bf--;p.floors=Math.min(11,p.floors+g);if(p.lk>0&&Math.random()<.3){p.lk--;p.floors=Math.min(11,p.floors+1)}}
      tower(p,dws,d)}go()},p.floors>=9?2600:500+Math.random()*900+i*150)})()});
  /* tiap beberapa detik ada pemain yang memakai skill, seperti di game */
  const land=p=>dws[p.id]?dws[p.id].n:0;
  function useSkill(){
    if(!live())return;
    const att=P[Math.random()*P.length|0],vs=P.filter(x=>x!==att&&land(x)>=3&&x.floors<9&&!(x.frz>Date.now()));
    if(vs.length>1&&Math.random()<.16&&!LG.act.size){lgDemo(att,P.filter(x=>x!==att),d);return}
    let k;
    const AP=[0,1,2,3,4,5,8,9,10,11];if(vs.length&&Math.random()<.75)k=AP[Math.random()*AP.length|0];
    else if(!att.sh&&Math.random()<.5)k=6;
    else if(!att.bf||!(att.tbU>Date.now())||!att.lk)k=[7,12,13][Math.random()*3|0];
    else if(vs.length)k=AP[Math.random()*AP.length|0];
    else return setTimeout(useSkill,1200);
    const s=SK[k];
    if(s.t==="a"){
      const vic=vs[Math.random()*vs.length|0],t=dws[vic.id],blk=!!vic.sh;
      t.sk={k,at:performance.now()};
      if(ST.txu||ST.txr)skBanner(att,vic,s,d);skfx(vic.id,k,blk,dws,d,sky);
      setTimeout(()=>{if(blk)vic.sh=0;else if(s.lk)vic.frz=Date.now()+s.lk*1000;else if(!s.x)vic.floors=Math.max(0,Math.min(vic.floors,t.n)-s.d);tower(vic,dws,d)},IMP[k]+40)}
    else{
      if(ST.txu||ST.txr)skBanner(att,null,s,d);
      if(k===6)att.sh=1;else if(k===12)att.tbU=Date.now()+TB_MS;else if(k===13)att.lk=LK_N;else att.bf=BUF;
      skfx(att.id,k,false,dws,d,sky);tower(att,dws,d)}}
  (function loopSk(){setTimeout(()=>{useSkill();loopSk()},3200+Math.random()*1800)})();
  setTimeout(useSkill,3000)}
demoInit();
siteInit();let rz;addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{if(ambient.on)siteInit()},250)});
(function(){document.querySelectorAll(".wst").forEach(st=>{for(let i=0;i<45;i++){const e=document.createElement("i");e.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*50}%;animation-delay:-${Math.random()*2}s`;st.appendChild(e)}});
  let h="";for(let i=0;i<14;i++){const m=Math.abs(i-6.5);h+=`<i style="height:${30+Math.random()*40+(m<2?30:0)}%;--dl:-${(Math.random()*3).toFixed(1)}s"></i>`}$("city").innerHTML=h;
  const k=Math.max(.6,Math.min(1,innerWidth/520));for(let i=0;i<7;i++){const w=document.createElement("div");w.className="wk party"+(i%2?" rt":"");w.style.cssText=`--s:${k};--d:-${(Math.random()*.6).toFixed(2)}s;left:${(i+.5)/7*100}%`;w.innerHTML=WKS(COL[i%6]);$("party").appendChild(w)}
  const cf=$("conf2");for(let i=0;i<46;i++){const e=document.createElement("i");e.style.cssText=`--x:${Math.random()*100}%;--c:${COL[i%6]};--d:${4+Math.random()*4}s;--r:${Math.random()*900}deg;animation-delay:-${Math.random()*6}s`;cf.appendChild(e)}})();
function firework(){if(!document.body.classList.contains("res"))return;SFX.fw();const w=$("win"),x=10+Math.random()*80,y=8+Math.random()*30,c=COL[Math.random()*6|0];
  for(let i=0;i<16;i++){const e=document.createElement("i");e.className="fwp";e.style.cssText=`left:${x}%;top:${y}%;background:${c}`;w.appendChild(e);
    const a=i/16*Math.PI*2,d=60+Math.random()*30;e.animate([{transform:"translate(0,0) scale(1)",opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d+20}px) scale(.3)`,opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=()=>e.remove()}}
setInterval(firework,700);
/* end */
function confetti(){const c=$("conf");for(let i=0;i<80;i++){const s=document.createElement("i");s.style.cssText=`--x:${Math.random()*100}%;--c:${COL[i%6]};--d:${2+Math.random()*2.5}s;--r:${Math.random()*900}deg;animation-delay:${Math.random()*.9}s`;c.appendChild(s)}}
function banner(t){cue(t,true)}
function finishAnim(win,t){if(typeof warHazStop==="function")warHazStop();if(typeof bnHazStop==="function")bnHazStop();if(typeof dmHazStop==="function")dmHazStop();frzEnd(true);tbEnd=0;tbcRm();for(const k in tws)tbStop(tws[k],true);SFX.music(null);SFX.end(win,t);stopBots();pickHide();ended=true;started=false;over=true;clearInterval(tick);$("typ").disabled=true;$("typ").blur();
  myWpm=Math.round(idx/Math.max((Math.min(Date.now()-t0,G.m==="time"?G.t*1000:1e9))/60000,.05));
  banner(t);if(win)confetti();setTimeout(result,2600)}
function endGame(w){if(typeof lgStop==="function")lgStop(true);if(tws[w.id])tws[w.id].el.classList.add("win");finishAnim(w.id===me.id,w.id===me.id?"KAMU MENANG!":w.name+" MENANG!")}
function timeUp(){if(ended)return;if(typeof lgStop==="function")lgStop(true);push({fin:Date.now()});finishAnim(false,"WAKTU HABIS!")}
function result(){if(typeof warOff==="function")warOff();if(typeof bnOff==="function")bnOff();if(typeof dmOff==="function")dmOff();
  const ps=peersNow().sort((a,b)=>G.m==="race"?((b.fin?1:0)-(a.fin?1:0)||(a.fin&&b.fin?a.fin-b.fin:b.floors-a.floors)):(b.floors-a.floors||(a.lastAt||0)-(b.lastAt||0)));
  const top=ps[0];$("rt").textContent=top?(top.id===me.id?"KAMU JUARA!":esc(top.name)+" JUARA!"):"HASIL";
  $("rs").textContent=(G.m==="race"?"Balapan "+G.fl+" lantai":"Mode waktu "+G.t+" detik")+" · "+DN[G.d];
  const ord=[1,0,2].filter(i=>ps[i]),hs=[190,140,100],cs=[["#ffd23f","#e09a00"],["#cfd8e3","#8e9bb0"],["#e0925a","#a85d28"]];
  $("pod").innerHTML=ord.map(i=>`<div class="pc">${ab(ps[i],54)}<div class="n">${esc(ps[i].name)}</div><div class="stp" style="--h:${hs[i]}px;--c:${cs[i][0]};--d:${cs[i][1]};--w:${[.6,.3,0][i]}s">${i+1}</div></div>`).join("");
  $("rl").innerHTML=ps.slice(3).map((p,i)=>`<div class="li" style="animation-delay:${.8+i*.1}s"><span>${i+4}. ${esc(p.name)}</span><span>${p.floors} lantai</span></div>`).join("");
  $("sts").innerHTML=`<span>${myWpm} kata/menit</span><span>Akurasi ${typed?Math.round(okc/typed*100):100}%</span><span>${fc} lantai</span>`;
  show("s-res")}
/* ui */
$("slots").addEventListener("click",e=>{const x=e.target.closest(".bx");if(x){delBot(x.dataset.id);return}if(e.target.closest(".add")){const ps=peersNow();if(ps.length&&ps[0].id===me.id)addBot(eff(ps).bl)}});
$("bMk").onclick=()=>enter(mkCode(),false,true);
$("bJn").onclick=()=>enter($("cd").value.trim().toUpperCase(),false,false);
$("bSolo").onclick=()=>enter(mkCode(),true,true);
$("bLink").onclick=()=>{const u=location.href.split("?")[0].split("#")[0]+"?r="+code;try{navigator.clipboard.writeText(u);$("cpy").textContent="Link undangan disalin"}catch(e){$("cpy").textContent=u}};
try{const r=new URLSearchParams(location.search).get("r");if(r){$("cd").value=r.toUpperCase().slice(0,4);$("nm").focus()}}catch(e){}

$("bRdy").onclick=()=>{const r=!me.ready;SFX.ready(r);push({ready:r});if(!solo){$("bRdy").textContent=r?"BATAL SIAP":"SIAP";$("bRdy").classList.toggle("b",r)}lastSig="";sync()};
$("rc").onclick=()=>{try{navigator.clipboard.writeText(code);$("cpy").textContent="Kode disalin"}catch(e){}};
function leave(){stopBots();clearInterval(tick);if(off)off();if(offC)offC();if(room)room.leave();room=null;location.reload()}
$("bBack").onclick=leave;$("bMenu").onclick=leave;$("bQuit").onclick=leave;
$("bAgain").onclick=()=>{reset(me.round+1);show("s-lobby");sync()};
function theme(t){document.body.classList.toggle("night",t==="night");document.querySelectorAll("#thm button").forEach(b=>b.classList.toggle("on",b.dataset.th===t));try{localStorage.setItem("mnT",t)}catch(e){}}
$("thm").onclick=e=>{const b=e.target.closest("button");if(b)theme(b.dataset.th)};
let th0="day";try{th0=localStorage.getItem("mnT")||"day"}catch(e){}theme(th0);
/* preview profil + burung & pesawat di langit menu */
(function(){const pv=$("pv"),nm=$("nm"),up=()=>{pv.textContent=((nm.value.trim()[0])||"?").toUpperCase();pv.style.setProperty("--c",COL[me.av%6])};nm.addEventListener("input",up);$("sw").addEventListener("click",()=>setTimeout(up,0));up();
  const sky=$("sky");[["🐦",14,28,-4],["🐦",22,36,-19],["🐦",9,44,-30],["✈️",6,64,-12]].forEach(([e,t,d,dl])=>{const i=document.createElement("i");i.className="fly"+(e==="✈️"?" jet":"");i.textContent=e;i.style.cssText="top:"+t+"%;--fd:"+d+"s;--dl:"+dl+"s";sky.appendChild(i)})})();
/* ===== pengaturan & cara main ===== */
(function(){
const MD=$("mdl");let cur=null;
const sv=()=>{try{localStorage.setItem("mnP",JSON.stringify(ST))}catch(e){}};
function paint(){const c=SFX.cfg();document.body.classList.toggle("lite",!!ST.lite);
  document.querySelectorAll(".tg").forEach(b=>{const k=b.dataset.k,on=k==="sfx"?c.sfx:!!ST[k];b.classList.toggle("on",on);b.setAttribute("aria-checked",on)});
  const r=$("rMv");r.value=c.mv;r.style.setProperty("--p",c.mv+"%");$("mvT").textContent=c.mv?c.mv+"%":"Mati"}
function openM(id){cur=id;MD.classList.remove("hide");$("pSet").classList.toggle("hide",id!=="pSet");$("pHow").classList.toggle("hide",id!=="pHow");paint()}
function closeM(){if(!cur)return;cur=null;MD.classList.add("hide");if(started&&!over)$("typ").focus()}
window.openSettings=()=>openM("pSet");
$("bSet").onclick=()=>openM("pSet");$("bHow").onclick=()=>openM("pHow");
MD.addEventListener("click",e=>{if(e.target.closest("[data-x]"))closeM()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&cur)closeM()});
document.querySelectorAll(".tg").forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==="sfx"){SFX.setSfx(!SFX.cfg().sfx);if(SFX.cfg().sfx)SFX.choose()}else{ST[k]=ST[k]?0:1;sv()}paint()});
$("rMv").oninput=e=>{SFX.setMusic(+e.target.value);paint()};
$("htab").onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll("#htab button").forEach(x=>x.classList.toggle("on",x===b));$("hA").classList.toggle("hide",b.dataset.t!=="a");$("hB").classList.toggle("hide",b.dataset.t!=="b")};
$("hB2").innerHTML='<p class="note rarn">Makin langka skill, makin meriah border kartunya dan makin dahsyat efeknya.</p>'+[5,4,3,2,1].map(r=>{const l=SK.map((s,k)=>s.r===r?'<div class="sc r'+r+' '+(s.x?"x":s.t==="s"?"s":"a")+'" style="--i:'+k+'"><i class="an">'+s.ic+"</i><b>"+s.n+"</b><small>"+s.ds+"</small></div>":"").join("");return l?'<h4 class="rh r'+r+'">'+SK_RAR[r]+" <span>"+SK_RD[r]+'</span></h4><div class="sg">'+l+"</div>":""}).join("");
paint();
})();