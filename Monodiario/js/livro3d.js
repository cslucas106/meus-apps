// Livro 3D (Three.js r128, carregado por <script> em index.html).
// createBook(stage, {cfg, onWant}) monta o livro dentro do elemento `stage` e devolve uma API.
const T = window.THREE;

export const DEFAULT_COVER = {m:'trinco',cor:'#000000',e:'nenhum',t:'liso',metal:'prata',txt:'',np:'ie',pg:'#f6eedb',gl:0};

/* ---------- texturas procedurais ---------- */
const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const tex=(c,rep)=>{const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;};
const rnd=Math.random;
const tile=(x,y,r,fn)=>{for(const dx of[-256,0,256])for(const dy of[-256,0,256]){const a=x+dx,b=y+dy;if(a>-r&&a<256+r&&b>-r&&b<256+r)fn(a,b);}};
function speckle(x,n,a){for(let i=0;i<n;i++){x.fillStyle=(rnd()<.5?'rgba(0,0,0,':'rgba(255,255,255,')+rnd()*a+')';x.fillRect(rnd()*256,rnd()*256,1+rnd(),1+rnd());}}
const TEXG={
  couro(x){ x.fillStyle='#e4e4e4'; x.fillRect(0,0,256,256);
    for(let i=0;i<650;i++){const px=rnd()*256,py=rnd()*256,r=5+rnd()*6;
      tile(px,py,r,(a,b)=>{const g=x.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,'rgba(255,255,255,.5)');g.addColorStop(.6,'rgba(190,190,190,.15)');g.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=g;x.beginPath();x.arc(a,b,r,0,6.3);x.fill();});}
    speckle(x,1500,.08); },
  liso(x){ x.fillStyle='#dedede'; x.fillRect(0,0,256,256);
    for(let i=0;i<14;i++){const px=rnd()*256,py=rnd()*256,r=50+rnd()*60,d=rnd()<.5;
      tile(px,py,r,(a,b)=>{const g=x.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,d?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(a-r,b-r,2*r,2*r);});}
    speckle(x,2500,.035); },
  enrugado(x){ x.fillStyle='#dedede'; x.fillRect(0,0,256,256);
    for(let i=0;i<46;i++){const px=rnd()*256,py=rnd()*256,l=30+rnd()*70,an=rnd()*Math.PI,st=rnd()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.09)',w=1+rnd()*2;
      tile(px,py,l,(a,b)=>{x.strokeStyle=st;x.lineWidth=w;x.beginPath();x.moveTo(a,b);x.quadraticCurveTo(a+Math.cos(an)*l*.5+8,b+Math.sin(an)*l*.5-8,a+Math.cos(an)*l,b+Math.sin(an)*l);x.stroke();});}
    speckle(x,2500,.05); },
  saffiano(x){ x.fillStyle='#d6d6d6'; x.fillRect(0,0,256,256);
    for(let i=0;i<256;i+=8){x.fillStyle='rgba(0,0,0,.22)';x.fillRect(i,0,2,256);x.fillRect(0,i,256,2);x.fillStyle='rgba(255,255,255,.16)';x.fillRect(i+2,0,1,256);x.fillRect(0,i+2,256,1);}
    speckle(x,800,.04); },
  cortica(x){ x.fillStyle='#cfcfcf'; x.fillRect(0,0,256,256);
    for(let i=0;i<1100;i++){const px=rnd()*256,py=rnd()*256,r=1.5+rnd()*4.5,g=(150+rnd()*95)|0,al=.5+rnd()*.5,rot=rnd()*3;
      tile(px,py,r,(a,b)=>{x.fillStyle='rgba('+g+','+g+','+g+','+al+')';x.beginPath();x.ellipse(a,b,r,r*.65,rot,0,6.3);x.fill();});}
    for(let i=0;i<260;i++){const px=rnd()*256,py=rnd()*256,r=1+rnd()*1.8; tile(px,py,r,(a,b)=>{x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.arc(a,b,r,0,6.3);x.fill();});}
    speckle(x,1500,.1); },
  madeira(x){ x.fillStyle='#d9d9d9'; x.fillRect(0,0,256,256);
    for(let k=0;k<70;k++){const y0=rnd()*256,A=2+rnd()*7,n=1+((rnd()*3)|0),ph=rnd()*6.3,al=.09+rnd()*.2,lw=.8+rnd()*2.2,dk=rnd()<.7;
      for(const dy of[-256,0,256]){x.strokeStyle=dk?'rgba(30,20,10,'+al+')':'rgba(255,255,255,'+al*.6+')';x.lineWidth=lw;x.beginPath();
        for(let px=0;px<=256;px+=4){const yy=y0+dy+A*Math.sin(px/256*6.283*n+ph)+A*.4*Math.sin(px/256*6.283*(n+2)); px?x.lineTo(px,yy):x.moveTo(px,yy);} x.stroke();}}
    speckle(x,900,.05); },
  veludo(x){ x.fillStyle='#cdcdcd'; x.fillRect(0,0,256,256);
    for(let i=0;i<24;i++){const px=rnd()*256,py=rnd()*256,r=25+rnd()*50,d=rnd()<.5;
      tile(px,py,r,(a,b)=>{const g=x.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,d?'rgba(0,0,0,.1)':'rgba(255,255,255,.09)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(a-r,b-r,2*r,2*r);});}
    speckle(x,22000,.12); },
  avestruz(x){ x.fillStyle='#a8a8a8'; x.fillRect(0,0,256,256); const C=32;
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){const cx=c*C+C/2+(r%2?C/2:0)+(rnd()-.5)*4,cy=r*C+C/2+(rnd()-.5)*4,rad=13+rnd()*3;
      tile(cx,cy,C,(a,b)=>{const g=x.createRadialGradient(a-2,b-3,1,a,b,rad);g.addColorStop(0,'#f4f4f4');g.addColorStop(1,'#bdbdbd');x.fillStyle=g;x.beginPath();x.arc(a,b,rad,0,6.3);x.fill();x.fillStyle='rgba(0,0,0,.55)';x.beginPath();x.arc(a,b,2.6,0,6.3);x.fill();});}
    speckle(x,1000,.06); },
  croco(x){ x.fillStyle='#6a6a6a'; x.fillRect(0,0,256,256); const W=32,H=25.6;
    for(let r=0;r<10;r++)for(let c=0;c<8;c++){const cx=c*W+W/2+(r%2?W/2:0),cy=r*H+H/2,sh=.8+rnd()*.2,hi=(250*sh)|0,lo=(150*sh)|0;
      tile(cx,cy,W,(a,b)=>{const g=x.createRadialGradient(a-3,b-3,2,a,b,W*.6);g.addColorStop(0,'rgb('+hi+','+hi+','+hi+')');g.addColorStop(1,'rgb('+lo+','+lo+','+lo+')');x.fillStyle=g;x.beginPath();x.ellipse(a,b,W/2-1.6,H/2-1.4,0,0,6.3);x.fill();});}
    speckle(x,1200,.06); },
  linho(x){ x.fillStyle='#d2d2d2'; x.fillRect(0,0,256,256);
    for(let i=0;i<256;i+=8)for(let j=0;j<256;j+=8){const v=((i+j)/8)%2===0;
      x.fillStyle=v?'rgba(0,0,0,'+(.1+rnd()*.12)+')':'rgba(255,255,255,'+(.06+rnd()*.1)+')'; v?x.fillRect(i,j,4,8):x.fillRect(i,j,8,4);}
    for(let i=0;i<40;i++){x.fillStyle='rgba(0,0,0,.05)';x.fillRect(rnd()*256,0,1+rnd()*2,256);x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,rnd()*256,256,1+rnd()*2);}
    speckle(x,800,.06); },
  camurca(x){ x.fillStyle='#d0d0d0'; x.fillRect(0,0,256,256); speckle(x,14000,.16);
    for(let i=0;i<30;i++){x.fillStyle='rgba(255,255,255,.04)';x.fillRect(0,rnd()*256,256,2+rnd()*6);} },
  craquelado(x){ x.fillStyle='#d6d6d6'; x.fillRect(0,0,256,256);
    for(let i=0;i<26;i++){const px=rnd()*256,py=rnd()*256,r=30+rnd()*50,d=rnd()<.5;
      tile(px,py,r,(a,b)=>{const g=x.createRadialGradient(a,b,0,a,b,r);g.addColorStop(0,d?'rgba(0,0,0,.12)':'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(a-r,b-r,2*r,2*r);});}
    x.lineCap='round'; x.strokeStyle='rgba(0,0,0,.32)';
    const crack=(px,py,an,n,w)=>{ if(n<=0)return; const pts=[[px,py]]; let ax=px,ay=py,aa=an;
      for(let k=0;k<n;k++){aa+=(rnd()-.5)*.9; ax+=Math.cos(aa)*(5+rnd()*6); ay+=Math.sin(aa)*(5+rnd()*6); pts.push([ax,ay]); if(rnd()<.18) crack(ax,ay,aa+(rnd()<.5?1:-1)*(.7+rnd()*.6),n-k-4,w*.7);}
      for(const dx of[-256,0,256])for(const dy of[-256,0,256]){x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0]+dx,q[1]+dy):x.moveTo(q[0]+dx,q[1]+dy));x.lineWidth=w;x.stroke();} };
    for(let i=0;i<7;i++) crack(rnd()*256,rnd()*256,rnd()*6.3,18+rnd()*14,1.6);
    speckle(x,1800,.07); }
};
// r = brilho, b = relevo, cc = verniz, rep = repetições por unidade
const TEXCFG={couro:{rep:1,r:.62,b:1.4,cc:.04},liso:{rep:1,r:.5,b:.12,cc:.12},enrugado:{rep:1,r:.45,b:.5,cc:.12},saffiano:{rep:1.5,r:.4,b:1.3,cc:.22},cortica:{rep:1.5,r:.95,b:2.2,cc:.02},madeira:{rep:1,r:.5,b:.7,cc:.3},veludo:{rep:2,r:1,b:.3,cc:.02},avestruz:{rep:1.5,r:.5,b:2.4,cc:.2},croco:{rep:1.5,r:.38,b:2.4,cc:.35},linho:{rep:2,r:.95,b:1.6,cc:.02},camurca:{rep:2,r:1,b:.9,cc:.02},craquelado:{rep:1,r:.7,b:1.9,cc:.12}};
const TEXNAMES=[['couro','Couro'],['liso','Liso'],['enrugado','Enrugado'],['croco','Crocodilo'],['avestruz','Avestruz'],['saffiano','Saffiano'],['cortica','Cortiça'],['madeira','Madeira'],['veludo','Veludo'],['linho','Linho'],['camurca','Camurça'],['craquelado','Craquelado']];
const texCache={};
const getTex=n=>texCache[n]||(texCache[n]=(()=>{const c=cv(256,256);TEXG[n](c.getContext('2d'));const t=tex(c,[TEXCFG[n].rep,TEXCFG[n].rep]);t.anisotropy=4;return t;})());
function brushed(){ const c=cv(128,128),x=c.getContext('2d'); x.fillStyle='#bbb'; x.fillRect(0,0,128,128);
  for(let i=0;i<500;i++){x.fillStyle=(rnd()<.5?'rgba(0,0,0,':'rgba(255,255,255,')+rnd()*.25+')'; x.fillRect(0,rnd()*128,128,1);} return tex(c); }
const brushT=brushed();
const METAIS={ouro:{c:0xc9a24a,g:['#f6dd9e','#c9a24e','#f0d58a']},prata:{c:0xc9ced4,g:['#ffffff','#aab0b8','#eef1f5']},bronze:{c:0xa8743c,g:['#e0b080','#9c6a38','#d6a572']},cobre:{c:0xc7683e,g:['#f0a47e','#b4562f','#e8946c']}};
function stripes(vert,aged,pal){
  const c=cv(vert?64:8,vert?8:64),x=c.getContext('2d'), a=pal||(aged?['#d9b873','#b38a45']:['#efe4cb','#d8c9a6']);
  for(let i=0;i<64;i+=2){x.fillStyle=a[(i%4)?1:0]; vert?x.fillRect(i,0,2,8):x.fillRect(0,i,8,2);}
  return tex(c);
}


export { TEXNAMES, METAIS, getTex };

export function createBook(stage, opts = {}) {
const cfg = Object.assign({}, DEFAULT_COVER, opts.cfg || {});
let frase = '', alive = true, raf = 0, pageDate = new Date();

/* ---------- cena ---------- */

const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputEncoding=T.sRGBEncoding;
stage.prepend(renderer.domElement);
const scene=new T.Scene(), camera=new T.PerspectiveCamera(32,1,.1,50);
scene.add(new T.HemisphereLight(0xfff0d8,0x2a1c10,.85));
const key=new T.DirectionalLight(0xffe2b8,1.15); key.position.set(2.5,3.5,4); scene.add(key);
const fill=new T.DirectionalLight(0xa8b8ff,.25); fill.position.set(-3,1,2); scene.add(fill);
const flash=new T.PointLight(0xffc88a,0,3.5); flash.position.set(.8,0,.7); scene.add(flash);
function fit(){
  const w=stage.clientWidth,h=stage.clientHeight; renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
  place();
}
let ext=1.3;
function place(){ const t=Math.tan(camera.fov*Math.PI/360), d=Math.max(ext/(t*camera.aspect),1.6/t); camera.position.set(0,.45,d); camera.lookAt(0,0,0); }


/* ---------- reflexos (sem isso o metal fica fosco e feio) ---------- */
(function(){ try{
  const c=document.createElement('canvas'); c.width=1024; c.height=512; const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,512); g.addColorStop(0,'#6b5a48'); g.addColorStop(.45,'#3a2b1d'); g.addColorStop(.5,'#1a120b'); g.addColorStop(1,'#0c0805');
  x.fillStyle=g; x.fillRect(0,0,1024,512);
  [[150,90,300,130,'#fff1d6'],[600,70,220,100,'#ffe0b0'],[860,150,110,220,'#8a8f98'],[380,300,320,26,'#ffd9a8'],[40,260,90,160,'#ffe9c8']].forEach(([px,py,w,h,col])=>{
    x.shadowColor=col; x.shadowBlur=40; x.fillStyle=col; x.fillRect(px,py,w,h); });
  const et=new T.CanvasTexture(c); et.encoding=T.sRGBEncoding; et.mapping=T.EquirectangularReflectionMapping;
  const pm=new T.PMREMGenerator(renderer); scene.environment=pm.fromEquirectangular(et).texture; et.dispose(); pm.dispose();
}catch(err){ console.warn('sem reflexos',err); } })();

/* ---------- materiais ---------- */
const coverMat=new T.MeshPhysicalMaterial({roughness:.62,bumpScale:1.2,clearcoat:.04,clearcoatRoughness:.35});
const strapMat=new T.MeshStandardMaterial({roughness:.6,bumpScale:1});
const goldMat=new T.MeshStandardMaterial({color:0xc9a24a,metalness:.95,roughness:.28,bumpMap:brushT,bumpScale:.4});
const paper=new T.MeshStandardMaterial({color:0xf4ecd8,roughness:.9}), paperDk=new T.MeshStandardMaterial({color:0xcbbd9d,roughness:.9});
const edgeV=new T.MeshStandardMaterial({map:stripes(true),roughness:.9}), edgeH=new T.MeshStandardMaterial({map:stripes(false),roughness:.9});
const pgR=cv(512,720), pgL=cv(512,720);
const pgRT=tex(pgR), pgLT=tex(pgL);
const pageR=new T.MeshStandardMaterial({map:pgRT,roughness:.85}), pageL=new T.MeshStandardMaterial({map:pgLT,roughness:.85});
const foilC=cv(512,717), foilT=tex(foilC);
const foilMat=new T.MeshStandardMaterial({map:foilT,transparent:true,roughness:.4,metalness:.25,envMapIntensity:.8});
[paper,paperDk,edgeV,edgeH,pageR,pageL].forEach(m=>m.envMapIntensity=.3);

/* ---------- livro ---------- */
const rr=(w,h,r)=>{const s=new T.Shape();s.moveTo(r,0);s.lineTo(w-r,0);s.quadraticCurveTo(w,0,w,r);s.lineTo(w,h-r);s.quadraticCurveTo(w,h,w-r,h);s.lineTo(r,h);s.quadraticCurveTo(0,h,0,h-r);s.lineTo(0,r);s.quadraticCurveTo(0,0,r,0);return s;};
function plate(w,h,d,r,m,x,y,z){const g=new T.ExtrudeGeometry(rr(w,h,r),{depth:d,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:6});g.translate(-w/2,-h/2,-d/2);const o=new T.Mesh(g,m);o.position.set(x,y,z);return o;}
const rig=new T.Group(); scene.add(rig); const book=new T.Group(); rig.add(book);
const box=(w,h,d,m,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return o;};
book.add(plate(1.5,2.1,.05,.06,coverMat,.75,0,-.135));
book.add(box(1.44,2.04,.22,[edgeV,paperDk,edgeH,edgeH,pageR,paper],.77,0,0));       // folhas (página direita)
book.add(box(.07,2.1,.32,coverMat,-.02,0,0));                                       // lombada

const pivot=new T.Group(); pivot.position.set(0,0,.135); book.add(pivot);          // capa frontal (dobradiça na lombada)
pivot.add(plate(1.5,2.1,.05,.06,coverMat,.75,0,0));
pivot.add(box(1.44,2.04,.07,[edgeV,paperDk,edgeH,edgeH,paper,pageL],.72,0,-.06));  // folhas coladas na capa (página esquerda)
const foil=new T.Mesh(new T.PlaneGeometry(1.5,2.1),foilMat); foil.position.set(.75,0,.0365); pivot.add(foil);
const statics=new T.Group(), strapG=new T.Group(), strapB=new T.Group(), spineG=new T.Group(), wrapG=new T.Group(), flap=new T.Group();
const HX=1.525, HZ=-.18;                       // dobradiça da cinta: borda da capa de trás
flap.position.set(HX,0,HZ); strapG.position.set(-HX,0,.135-HZ);   // strapG mantém as coordenadas antigas (capa da frente)
pivot.add(statics); flap.add(strapG); book.add(strapB,spineG,wrapG,flap);
const shadowC=cv(256,256),sx=shadowC.getContext('2d'),sg=sx.createRadialGradient(128,128,0,128,128,128);
sg.addColorStop(0,'rgba(0,0,0,.6)'); sg.addColorStop(1,'rgba(0,0,0,0)'); sx.fillStyle=sg; sx.fillRect(0,0,256,256);
const shadow=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowC),transparent:true,depthWrite:false}));
shadow.rotation.x=-Math.PI/2; shadow.position.set(0,-1.2,0); scene.add(shadow);

/* ---------- aparência (muda com a configuração) ---------- */
let lockG=null, hook=null, fade=[];
const brass=new T.MeshStandardMaterial({color:0xc9a24a,metalness:.95,roughness:.28,bumpMap:brushT,bumpScale:.4});
const laceMat=new T.MeshStandardMaterial({roughness:.85});
const dark=new T.MeshStandardMaterial({color:0x17100a,roughness:.9,envMapIntensity:.3});
let pV=null,pH=null;
const sV=stripes(true), sVa=stripes(true,1), sH=stripes(false), sHa=stripes(false,1);
const cyl=(r,h,m,x,y,z)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,28),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);return o;};
const tor=(r,t,m,x,y,z)=>{const o=new T.Mesh(new T.TorusGeometry(r,t,8,28),m);o.position.set(x,y,z);return o;};
const sph=(r,m,x,y,z)=>{const o=new T.Mesh(new T.SphereGeometry(r,16,12),m);o.position.set(x,y,z);return o;};
const clear=g=>{while(g.children.length)g.remove(g.children[0]);};
const tmp=cv(512,717);
const GOLD=x=>{const q=METAIS[cfg.metal].g,g=x.createLinearGradient(0,150,0,560);g.addColorStop(0,q[0]);g.addColorStop(.5,q[1]);g.addColorStop(1,q[2]);return g;};
function br(x,px,py,len,ang,w,d){ if(d<0)return; const nx=px+Math.cos(ang)*len, ny=py-Math.sin(ang)*len; x.lineWidth=Math.max(w,1.2); x.beginPath(); x.moveTo(px,py); x.lineTo(nx,ny); x.stroke(); br(x,nx,ny,len*.75,ang+.42,w*.66,d-1); br(x,nx,ny,len*.75,ang-.4+Math.sin(d*2.3)*.12,w*.66,d-1); }
function dots(x,n,s){ for(let i=0;i<n;i++){ x.beginPath(); x.arc(50+((i*97+s)%410),60+((i*151+s)%600),(i%3)+1.4,0,6.3); x.fill(); } }
function emblem(x){
  const e=cfg.e, cx=250, cy=340; x.lineCap='round'; x.fillStyle=x.strokeStyle=GOLD(x);
  if(e==='luas'){
    [[.55,1],[1.3,1],[0,0],[1.3,-1],[.55,-1]].forEach((p,i)=>{ const r=40, px=cx+(i-2)*26, py=140+i*100;
      x.beginPath(); x.arc(px,py,r,0,6.3); x.fill();
      if(p[0]){ x.globalCompositeOperation='destination-out'; x.beginPath(); x.arc(px+p[1]*p[0]*r,py,r,0,6.3); x.fill(); x.globalCompositeOperation='source-over'; } });
    dots(x,30,17);
  } else if(e==='arvore'){
    x.lineWidth=4; x.beginPath(); x.arc(cx,cy,200,0,6.3); x.stroke();
    br(x,cx,470,92,Math.PI/2,16,7); br(x,cx,470,58,-Math.PI/2,8,5); dots(x,22,5);
  } else if(e==='solua'){
    x.beginPath(); x.arc(cx-20,cy,150,0,6.3); x.fill(); x.globalCompositeOperation='destination-out'; x.beginPath(); x.arc(cx+4,cy+8,136,0,6.3); x.fill(); x.globalCompositeOperation='source-over';
    x.beginPath(); x.arc(cx-20,cy,62,0,6.3); x.fill();
    for(let i=0;i<28;i++){ const a=i*Math.PI/14, r2=i%2?112:138; x.beginPath(); x.moveTo(cx-20+Math.cos(a-.08)*76,cy+Math.sin(a-.08)*76); x.lineTo(cx-20+Math.cos(a)*r2,cy+Math.sin(a)*r2); x.lineTo(cx-20+Math.cos(a+.08)*76,cy+Math.sin(a+.08)*76); x.fill(); }
    dots(x,18,3);
  } else if(e==='mandala'){
    [['rgba(255,225,180,.25)',1.5],['rgba(0,0,0,.38)',0]].forEach(([c,o])=>{ x.strokeStyle=x.fillStyle=c; x.lineWidth=2.5;
      [196,176,146,118,92].forEach(r=>{x.beginPath();x.arc(cx+o,cy+o,r,0,6.3);x.stroke();});
      for(let i=0;i<36;i++){const a=i*Math.PI/18; x.beginPath(); x.moveTo(cx+o+Math.cos(a)*118,cy+o+Math.sin(a)*118); x.lineTo(cx+o+Math.cos(a)*146,cy+o+Math.sin(a)*146); x.stroke(); x.beginPath(); x.arc(cx+o+Math.cos(a)*186,cy+o+Math.sin(a)*186,3,0,6.3); x.fill();} });
    x.strokeStyle='#a9482a'; x.lineWidth=9; for(let i=0;i<22;i++){const a=i*Math.PI/11; x.beginPath(); x.moveTo(cx+Math.cos(a)*50,cy+Math.sin(a)*50); x.lineTo(cx+Math.cos(a+.35)*76,cy+Math.sin(a+.35)*76); x.stroke();}
    const g=x.createRadialGradient(cx-10,cy-10,4,cx,cy,42); g.addColorStop(0,'#8fb0ff'); g.addColorStop(.6,'#3a53a8'); g.addColorStop(1,'#1c2a66'); x.fillStyle=g; x.beginPath(); x.arc(cx,cy,42,0,6.3); x.fill();
  } else if(e==='flor'){
    const pet=s=>{x.save();x.translate(cx,cy);x.scale(s,1);x.beginPath();x.moveTo(8,20);x.bezierCurveTo(60,-60,150,-70,135,10);x.bezierCurveTo(128,55,70,60,28,38);x.bezierCurveTo(58,20,70,-20,45,-40);x.bezierCurveTo(30,-20,15,0,8,20);x.fill();x.restore();};
    const tail=s=>{x.save();x.translate(cx,cy);x.scale(s,1);x.beginPath();x.moveTo(-6,75);x.bezierCurveTo(-4,125,-50,150,-95,140);x.bezierCurveTo(-55,128,-28,108,-26,75);x.fill();x.restore();};
    x.beginPath();x.moveTo(cx,cy-170);x.bezierCurveTo(cx+60,cy-95,cx+45,cy-20,cx,cy+30);x.bezierCurveTo(cx-45,cy-20,cx-60,cy-95,cx,cy-170);x.fill();
    pet(1);pet(-1);tail(1);tail(-1);
    x.fillRect(cx-85,cy+48,170,22); [-1,1].forEach(q=>{x.beginPath();x.arc(cx+q*85,cy+59,11,0,6.3);x.fill();});
    x.beginPath();x.moveTo(cx-18,cy+75);x.lineTo(cx+18,cy+75);x.lineTo(cx,cy+150);x.closePath();x.fill();
  } else if(e==='bussola'){
    x.lineWidth=5;x.beginPath();x.arc(cx,cy,185,0,6.3);x.stroke();x.lineWidth=2.5;x.beginPath();x.arc(cx,cy,172,0,6.3);x.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,L=i%2?95:160,w=i%2?16:22;
      [-1,1].forEach(q=>{x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);x.lineTo(cx+Math.cos(a+q*Math.PI/4)*w*1.4,cy+Math.sin(a+q*Math.PI/4)*w*1.4);x.closePath();q>0?x.fill():x.stroke();});}
    x.font='bold 44px Georgia,serif';x.textAlign='center';x.fillText('N',cx,cy-198);x.textAlign='start';
  } else if(e==='brasao'){
    const sh=k=>{x.beginPath();x.moveTo(cx-100*k,cy-140*k);x.lineTo(cx+100*k,cy-140*k);x.lineTo(cx+100*k,cy+10*k);x.quadraticCurveTo(cx+100*k,cy+100*k,cx,cy+160*k);x.quadraticCurveTo(cx-100*k,cy+100*k,cx-100*k,cy+10*k);x.closePath();};
    x.lineWidth=8;sh(1);x.stroke();x.lineWidth=3;sh(.86);x.stroke();
    x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?24:58;x.lineTo(cx+Math.cos(a)*r,cy-5+Math.sin(a)*r);}x.closePath();x.fill();
    x.fillRect(cx-80,cy-95,160,5);x.fillRect(cx-60,cy+70,120,5);
  } else if(e==='coroa'){
    x.beginPath();x.moveTo(cx-110,cy+60);x.lineTo(cx-120,cy-60);x.lineTo(cx-60,cy-10);x.lineTo(cx,cy-90);x.lineTo(cx+60,cy-10);x.lineTo(cx+120,cy-60);x.lineTo(cx+110,cy+60);x.closePath();x.fill();
    x.fillRect(cx-118,cy+72,236,32);[[-120,-60],[0,-90],[120,-60]].forEach(p=>{x.beginPath();x.arc(cx+p[0],cy+p[1]-14,13,0,6.3);x.fill();});
  } else if(e==='moldura'){
    x.lineWidth=3;x.strokeRect(46,46,420,625);x.lineWidth=1.5;x.strokeRect(60,60,392,597);
    [[46,46],[466,46],[46,671],[466,671]].forEach(p=>{x.beginPath();x.arc(p[0],p[1],20,0,6.3);x.stroke();x.beginPath();x.arc(p[0],p[1],7,0,6.3);x.fill();});
    x.lineWidth=2;x.beginPath();x.arc(cx,cy,70,0,6.3);x.stroke();x.beginPath();x.arc(cx,cy,10,0,6.3);x.fill();
  }
}
const NPOS={topo:[256,100,'center',400,66],meio:[256,358,'center',400,66],baixo:[256,622,'center',400,66],se:[62,100,'left',210,46],sd:[450,100,'right',210,46],ie:[62,622,'left',210,46],id:[450,622,'right',210,46]};
function nameText(t){
  const s=(cfg.txt||'').trim(); if(!s)return; const [px,py,al,mw,fs0]=NPOS[cfg.np]; let fs=fs0;
  t.textAlign=al; t.textBaseline='middle'; t.font='italic '+fs+'px Georgia,serif';
  while(t.measureText(s).width>mw&&fs>16){fs-=2;t.font='italic '+fs+'px Georgia,serif';}
  const w=t.measureText(s).width, q=METAIS[cfg.metal].g, g=t.createLinearGradient(0,py-40,0,py+40);
  g.addColorStop(0,q[0]); g.addColorStop(.5,q[1]); g.addColorStop(1,q[2]); t.fillStyle=g; t.fillText(s,px,py);
  if(al==='center'){ t.fillRect(px-w/2-10,py-fs*.85,w+20,3); t.fillRect(px-w/2-10,py+fs*.85,w+20,3); }
  t.textAlign='start'; t.textBaseline='alphabetic';
}
function drawFoil(){
  const x=foilC.getContext('2d'), m=cfg.m, cc0=new T.Color(cfg.cor), dst=(cc0.r*.3+cc0.g*.59+cc0.b*.11)<.15?'rgba(255,255,255,.14)':null; x.clearRect(0,0,512,717);
  const sp=x.createLinearGradient(0,0,48,0); sp.addColorStop(0,'rgba(0,0,0,.5)'); sp.addColorStop(.5,'rgba(255,255,255,.1)'); sp.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=sp; x.fillRect(0,0,48,717);
  if(m==='combinacao'||m==='executivo'){ x.strokeStyle='rgba(0,0,0,.25)'; x.lineWidth=6; x.strokeRect(24,24,464,669); x.setLineDash([12,8]); x.lineWidth=3; x.strokeStyle=dst||(m==='executivo'?'rgba(225,225,225,.35)':'rgba(240,215,160,.5)'); x.strokeRect(34,34,444,649); x.setLineDash([]); }
  else if(m==='trinco'){ x.setLineDash([10,8]); x.lineWidth=2.5; x.strokeStyle=dst||'rgba(240,215,160,.5)'; x.strokeRect(22,22,468,673); x.setLineDash([]); }
  else if(m==='antigo'){ [['rgba(255,225,180,.22)',1.5],['rgba(0,0,0,.42)',0]].forEach(([c,o])=>{ x.strokeStyle=c; x.lineWidth=3; x.strokeRect(38+o,38+o,436,641); x.strokeRect(50+o,50+o,412,617); [[62,62],[450,62],[62,655],[450,655]].forEach(p=>{x.beginPath();x.arc(p[0]+o,p[1]+o,8,0,6.3);x.stroke();}); }); }
  const t=tmp.getContext('2d'); t.clearRect(0,0,512,717); emblem(t); nameText(t);
  x.save(); x.shadowColor='rgba(0,0,0,.6)'; x.shadowBlur=3; x.shadowOffsetY=2; x.drawImage(tmp,0,0); x.restore();
  foilT.needsUpdate=true;
}
function corners(xl,xr,cy,w,t,d,z){
  [[xl,cy,1,-1],[xr,cy,-1,-1],[xl,-cy,1,1],[xr,-cy,-1,1]].forEach(([cx,y,dx,dy])=>{ statics.add(box(w,t,d,brass,cx+dx*w/2,y,z)); statics.add(box(t,w,d,brass,cx,y+dy*w/2,z)); });
}
function lift(c,min){const l=c.r*.3+c.g*.59+c.b*.11; if(l<min) c.lerp(new T.Color(min,min*.97,min*.94),(min-l)/min); return c;}
function darken(c){const l=c.r*.3+c.g*.59+c.b*.11; if(l<.25) c.multiplyScalar(Math.pow(l/.25,3)); return c;} // cores escuras ficam realmente escuras
function paint(){ // cor, textura e metal (leve: pode rodar a cada toque na roda de cores)
  const m=cfg.m, k=TEXCFG[cfg.t], col=new T.Color(cfg.cor), lum=col.r*.3+col.g*.59+col.b*.11;
  const dk=Math.max(0,1-lum/.25);                       // 0 = cor clara, 1 = preto
  const sc=new T.Color(cfg.cor).multiplyScalar(.6); darken(sc); darken(col); lift(sc,.006); lift(col,.008);  // preto nunca fica chapado
  coverMat.color.copy(col); strapMat.color.copy(sc); laceMat.color.set(lum>.12?0xc89a63:0x2a2623);
  const T0=getTex(cfg.t); coverMat.map=coverMat.bumpMap=strapMat.map=strapMat.bumpMap=T0;
  const rm=m==='executivo'?.75:m==='envolvente'?1.2:1, bm=m==='executivo'?.5:m==='envolvente'?1.6:1, mate=(cfg.t==='camurca'||cfg.t==='linho')?0:1;
  const gl=cfg.gl, gs=Math.max(0,.5-gl)*.9-Math.max(0,gl-.5)*.9; coverMat.roughness=Math.max(.12,Math.min(1,k.r*rm-dk*.12+gs)); coverMat.bumpScale=k.b*bm*(1+dk*.8);
  coverMat.clearcoat=Math.max(.001,(k.cc+dk*.1*mate)*gl*2); coverMat.clearcoatRoughness=.35; coverMat.envMapIntensity=(.3+dk*.1)*(.25+gl*1.5);
  strapMat.roughness=Math.max(.12,Math.min(1,k.r*rm+gs)); strapMat.bumpScale=k.b*bm*.8; strapMat.envMapIntensity=(.5+dk*.3)*(.25+gl*1.5);
  const M=METAIS[cfg.metal]; goldMat.color.setHex(M.c); brass.color.setHex(M.c);
}
function build(){
  const m=cfg.m; paint();
  const aged=m!=='executivo'; pages(); const cu=cfg.pg!=='#f6eedb'; edgeV.map=cu?pV:(aged?sVa:sV); edgeH.map=cu?pH:(aged?sHa:sH); edgeV.needsUpdate=edgeH.needsUpdate=true;
  [statics,strapG,strapB,spineG,wrapG,flap].forEach(g=>{ if(g!==strapG&&g!==flap) clear(g); }); clear(strapG); while(flap.children.length>1) flap.remove(flap.children[1]); fade=[strapMat,goldMat,dark]; hook=null; lockG=new T.Group(); const L=lockG;
  if(m==='trinco'||m==='envolvente'){ [-.55,.55].forEach(y=>{ [.82,-.82].forEach(a=>{const b=box(.01,.44,.012,laceMat,-.058,y,0);b.rotation.x=a;spineG.add(b);}); [-.15,.15].forEach(d=>spineG.add(box(.01,.012,.34,laceMat,-.058,y+d,0))); }); }
  if(m==='antigo') [-.8,-.55,.55,.8].forEach(y=>spineG.add(box(.095,.05,.34,coverMat,-.028,y,0)));
  if(m==='trinco'){            // trinco de latão: gancho que cai sobre a lingueta de couro
    strapG.add(box(.24,.2,.06,strapMat,1.38,.3,0)); L.position.set(1.42,.3,0);
    L.add(box(.19,.26,.02,goldMat,0,0,.045)); [[-.06,.09],[.06,.09],[-.06,-.09],[.06,-.09]].forEach(p=>L.add(cyl(.014,.02,goldMat,p[0],p[1],.06)));
    hook=new T.Group(); hook.position.set(0,-.02,.07); hook.add(box(.15,.032,.025,goldMat,0,0,0)); hook.add(sph(.03,goldMat,.075,0,0)); L.add(hook);
  } else if(m==='combinacao'){ // lingueta larga + placa com segredo de 3 rodas
    strapG.add(box(.62,.3,.06,strapMat,1.19,0,0)); L.position.set(1.2,0,0);
    L.add(box(.46,.23,.03,goldMat,0,0,.05)); L.add(box(.1,.24,.035,goldMat,.19,0,.055)); L.add(cyl(.052,.04,goldMat,-.13,0,.075));
    [-.02,.05,.12].forEach(px=>L.add(box(.05,.085,.012,dark,px,0,.068)));
  } else if(m==='envolvente'){ // tira de couro que dá a volta, com nó e pontas soltas
    strapG.add(box(.62,.09,.07,strapMat,1.19,-.12,0)); L.position.set(1.28,-.12,0); L.add(sph(.05,strapMat,0,0,.05));
    const t1=box(.028,.3,.014,strapMat,.03,-.17,.045); t1.rotation.z=.15; const t2=box(.028,.22,.014,strapMat,-.03,-.14,.045); t2.rotation.z=-.12; L.add(t1,t2);
  } else if(m==='antigo'){     // placa ornamentada de latão sobre lingueta
    strapG.add(box(.62,.2,.06,strapMat,1.19,0,0)); L.position.set(1.2,0,0);
    L.add(cyl(.13,.03,goldMat,0,0,.05)); L.add(tor(.13,.012,goldMat,0,0,.065)); L.add(cyl(.04,.02,dark,0,0,.068));
    [[0,.13],[0,-.13],[.13,0],[-.13,0]].forEach(p=>L.add(sph(.022,goldMat,p[0],p[1],.07)));
    corners(.07,1.43,.98,.12,.018,.02,.04);
  } else if(m==='fivela'){    // cinta de couro com fivela de metal
    strapG.add(box(.62,.17,.06,strapMat,1.19,0,0)); L.position.set(1.22,0,0);
    L.add(box(.2,.025,.025,goldMat,0,.075,.055)); L.add(box(.2,.025,.025,goldMat,0,-.075,.055));
    L.add(box(.025,.175,.025,goldMat,.1,0,.055)); L.add(box(.025,.175,.025,goldMat,-.1,0,.055)); L.add(box(.14,.016,.02,goldMat,.02,0,.062));
    [.17,.25].forEach(px=>L.add(cyl(.012,.02,dark,px,0,.035)));
  } else if(m==='ima'){        // aba com botão magnético
    strapG.add(box(.5,.3,.06,strapMat,1.25,0,0)); L.position.set(1.28,0,0);
    L.add(cyl(.095,.025,goldMat,0,0,.05)); L.add(tor(.095,.01,goldMat,0,0,.063)); L.add(cyl(.045,.02,dark,0,0,.066));
  } else if(m==='elastico'){   // elástico de fecho ao longo da borda
    strapG.add(box(.045,2.08,.07,dark,1.43,0,0)); L.position.set(1.43,0,0);
    L.add(box(.13,.22,.02,goldMat,0,0,.05)); L.add(sph(.022,goldMat,0,.06,.062)); L.add(sph(.022,goldMat,0,-.06,.062));
  } else if(m==='cadeado'){    // cadeado de latão
    strapG.add(box(.5,.22,.06,strapMat,1.25,0,0)); L.position.set(1.3,0,0);
    L.add(tor(.055,.014,goldMat,0,.075,.06)); L.add(box(.17,.15,.05,goldMat,0,-.02,.065)); L.add(box(.19,.018,.056,goldMat,0,.058,.065));
    L.add(cyl(.013,.02,dark,0,-.015,.094)); L.add(box(.008,.035,.02,dark,0,-.04,.094));
  } else if(m==='chave'){      // fechadura de latão com chavinha
    strapG.add(box(.5,.26,.06,strapMat,1.25,0,0)); L.position.set(1.28,0,0);
    L.add(box(.18,.26,.025,goldMat,0,0,.05)); [[-.06,.1],[.06,.1],[-.06,-.1],[.06,-.1]].forEach(p=>L.add(sph(.012,goldMat,p[0],p[1],.066)));
    L.add(cyl(.024,.02,dark,0,.035,.065)); L.add(box(.014,.07,.02,dark,0,-.02,.065));
    L.add(cyl(.009,.1,goldMat,0,.035,.115)); L.add(tor(.04,.01,goldMat,0,.035,.17));
  } else if(m==='giratorio'){  // fecho giratório de metal
    strapG.add(box(.4,.2,.06,strapMat,1.3,0,0)); L.position.set(1.3,0,0);
    L.add(box(.22,.22,.02,goldMat,0,0,.045)); L.add(tor(.075,.012,goldMat,0,0,.062)); L.add(cyl(.05,.03,goldMat,0,0,.07));
    const bar=box(.2,.04,.03,goldMat,0,0,.095); bar.rotation.z=.75; L.add(bar);
  } else if(m==='ziper'){      // zíper na borda
    strapG.add(box(.05,2.0,.05,dark,1.45,0,0)); L.position.set(1.45,.75,0);
    for(let y=-.95;y<=.95;y+=.075) strapG.add(box(.04,.014,.02,goldMat,1.45,y,.04));
    L.add(box(.08,.11,.03,goldMat,0,0,.06)); L.add(box(.04,.15,.014,goldMat,0,-.12,.07));
  } else if(m==='cordao'){     // botão com cordão de couro
    strapG.add(box(.35,.014,.014,strapMat,1.325,0,.04)); L.position.set(1.15,0,0);
    L.add(cyl(.05,.03,goldMat,0,0,.05)); L.add(tor(.07,.01,strapMat,0,0,.045)); L.add(tor(.05,.008,goldMat,0,0,.066));
  } else {                     // executivo: cantoneiras de latão e fita marcadora
    corners(.005,1.495,1.045,.16,.035,.075,0);
    const rm=new T.MeshStandardMaterial({color:0xa82f3c,roughness:.7}); fade.push(rm); strapB.add(box(.07,.7,.012,rm,1.05,-1.25,0));
  }
  const WR={trinco:[.3,.2,.5],combinacao:[0,.3,.5],envolvente:[-.12,.09,1.5],antigo:[0,.2,.5],fivela:[0,.17,.5],ima:[0,.3,.5],elastico:[0,2.08,.09],cadeado:[0,.22,.5],chave:[0,.26,.5],giratorio:[0,.2,.4],ziper:[0,2.0,.1],cordao:[0,.03,.35]}[m];
  if(WR){ const [wy,wh,wd]=WR;
    flap.add(box(.028,wh,.35,strapMat,0,wy,.175));                  // trecho que contorna a borda (gira junto com a cinta)
    wrapG.add(box(wd,wh,.022,strapMat,HX-wd/2,wy,HZ)); }            // trecho colado na capa de trás (fixo)
  strapG.add(L); drawFoil();
}

/* ---------- páginas ---------- */
function pages(){ // cor das folhas (creme = original)
  const hex=cfg.pg, orig=hex==='#f6eedb';
  if(orig){ paper.color.set(0xf4ecd8); paperDk.color.set(0xcbbd9d); pV=pH=null; }
  else{ const c=new T.Color(hex), d='#'+new T.Color(hex).multiplyScalar(.86).getHexString(); paper.color.copy(c); paperDk.color.copy(c).multiplyScalar(.82); pV=stripes(true,0,[hex,d]); pH=stripes(false,0,[hex,d]); }
  drawPages(frase&&!typing?frase:'');
}
function paperBase(c,side){
  const x=c.getContext('2d'); x.fillStyle=cfg.pg; x.fillRect(0,0,512,720);
  const g=x.createLinearGradient(side?512:0,0,side?440:72,0); g.addColorStop(0,'rgba(0,0,0,.22)'); g.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=g; x.fillRect(0,0,512,720);
  x.fillStyle='rgba(120,90,50,.12)'; for(let y=150;y<690;y+=46) x.fillRect(48,y,416,1.5);
  return x;
}
function wrap(x,t,px,py,mw,lh){let l='',y=py;t.split(' ').forEach(w=>{const s=l?l+' '+w:w;if(x.measureText(s).width>mw&&l){x.fillText(l,px,y);l=w;y+=lh;}else l=s;});x.fillText(l,px,y);}
function drawPages(text,g=0){
  const d=pageDate, L=paperBase(pgL,1);
  L.fillStyle='#7a4524'; L.font='150px Georgia,serif'; L.textAlign='left'; L.fillText(String(d.getDate()),56,230);
  L.fillStyle='#8a7a66'; L.font='italic 34px Georgia,serif'; L.fillText(d.toLocaleDateString('pt-BR',{weekday:'long',month:'long'}),58,290);
  pgLT.needsUpdate=true;
  const R=paperBase(pgR,0); R.fillStyle='#2b2118'; R.font='italic 46px Georgia,serif'; R.textAlign='left';
  if(text){
    if(g>0){ // só as letras brilham (halo dourado) e depois assentam na cor da tinta
      const mx=(a,b)=>Math.round(a+(b-a)*g);
      R.save(); R.shadowColor='rgba(255,185,80,'+Math.min(1,g*1.1)+')'; R.shadowBlur=34*g;
      R.fillStyle='rgb('+mx(43,255)+','+mx(33,208)+','+mx(24,120)+')';
      wrap(R,text,64,230,390,66); wrap(R,text,64,230,390,66); R.restore(); }
    else wrap(R,text,64,230,390,66);
  }
  pgRT.needsUpdate=true;
}

/* ---------- animação ---------- */
let want=false, openT=0, strapT=1, typing=0, flashV=0, kick=0, prevStrap=1;
const ap=(v,t,s)=>v<t?Math.min(t,v+s):Math.max(t,v-s), ease=t=>t*t*(3-2*t);
const off={x:0,y:0}; let drag=null, vy=0, lastMove=0, spinT=1;
let aligned=true;
function setOpen(v){ const mudou=want!==v; want=v; if(v&&openT<.02) aligned=false; if(mudou&&opts.onWant) opts.onWant(v); }   // antes de abrir, o livro gira para ficar de frente
function escrever(text){ // abre o livro e escreve o texto na página, com brilho só nas letras
  frase=text; flashV=0; setOpen(true); typing=performance.now()+1400; drawPages('');
}
function showText(text){ frase=text; typing=0; flashV=0; drawPages(text); } // texto já assentado, sem animação
let last=performance.now();
function loop(now){
  if(!alive) return; raf=requestAnimationFrame(loop);
  const dt=Math.min((now-last)/1000,.05); last=now;
  if(want&&!aligned){ const P2=Math.PI*2, tg=Math.round(off.y/P2)*P2, k=1-Math.exp(-dt*7); vy=0; spinT=1;
    off.y+=(tg-off.y)*k; off.x+=(0-off.x)*k;
    if(Math.abs(tg-off.y)<.01&&Math.abs(off.x)<.01){off.y=tg;off.x=0;aligned=true;} }
  else if(want){strapT=ap(strapT,0,dt*1.5); if(strapT<.03) openT=ap(openT,1,dt*.85);}
  else {openT=ap(openT,0,dt*.85); if(openT<.02) strapT=ap(strapT,1,dt*1.4);}
  if(strapT>=.99&&prevStrap<.99) kick=1; prevStrap=strapT;
  kick=Math.max(0,kick-dt*1.2);
  const e=ease(openT), s=ease(strapT);
  pivot.rotation.y=-e*Math.PI*.985;
  book.position.set(-.75*(1-e),Math.sin(now/1600)*.015,0);
  rig.rotation.y=.42*(1-e)+off.y; rig.rotation.x=.08*(1-e)+off.x;
  const q=1-s; flap.rotation.y=ease(Math.max(0,(q-.2)/.8))*1.9;     // destrava o gancho e a cinta abre pela borda
  if(hook) hook.rotation.z=Math.min(1,q*4)*1.1;
  ext=1.3+.7*e; place();
  lockG.scale.setScalar(1+kick*.18); lockG.rotation.z=Math.sin(now/70)*kick*.06;
  shadow.scale.set(1.9+e*1.9,1.4,1); shadow.material.opacity=.9-e*.2;
  if(!drag){ off.x*=Math.exp(-dt*1.8); off.y+=vy*dt; vy*=Math.exp(-dt*2.2); }
  if(spinT<1){ const t1=Math.min(1,spinT+dt/2.2); off.y+=Math.PI*2*(ease(t1)-ease(spinT)); spinT=t1; }
  if(frase&&typing){
    if(openT<.9) typing=now+1400;
    else{ const k=Math.max(0,Math.min(1,(now-(typing-1400))/1400)); drawPages(frase.slice(0,Math.ceil(frase.length*k)),1); if(k>=1){typing=0;flashV=1;} }
  }
  if(flashV>0&&!typing){ flashV=Math.max(0,flashV-dt*.55); drawPages(frase,ease(flashV)); }   // brilho das letras assenta na página
  flash.intensity=0;
  renderer.render(scene,camera);
}

/* ---------- interação ---------- */
const el=renderer.domElement; let moved=0;
el.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};moved=0;vy=0;spinT=1;aligned=true;lastMove=performance.now();el.setPointerCapture(e.pointerId);});
el.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};moved+=Math.abs(dx)+Math.abs(dy);
  const n=performance.now(), h=Math.max(.008,(n-lastMove)/1000); lastMove=n;
  off.y+=dx*.009; vy=Math.max(-14,Math.min(14,vy*.5+.5*dx*.009/h));
  off.x=Math.max(-1.3,Math.min(1.3,off.x+dy*.006));});
el.addEventListener('pointerup',()=>{if(moved<6){setOpen(!want);vy=0;} else if(performance.now()-lastMove>90) vy=0; drag=null;});


const ro = new ResizeObserver(() => fit()); ro.observe(stage);
fit(); build(); drawPages(''); raf = requestAnimationFrame(loop);

return {
  cfg, build, paint, drawFoil,
  setOpen, isOpen: () => want, escrever, showText,
  // Foto do livro FECHADO e de frente, fundo transparente, recortada rente ao livro (para a estante).
  snapshot(w = 600, h = 800){
    const pr = renderer.getPixelRatio(), sv = shadow.visible, fov0 = camera.fov;
    try {
      shadow.visible = false;
      renderer.setPixelRatio(1); renderer.setSize(w, h, false);
      camera.fov = 9; camera.aspect = w / h; camera.updateProjectionMatrix(); // lente longa: capa reta, sem as laterais
      pivot.rotation.y = 0; book.position.set(-.75, 0, 0); rig.rotation.set(0, 0, 0);
      flap.rotation.y = 0; if (hook) hook.rotation.z = 0;
      ext = 1.3; place();
      renderer.render(scene, camera);
      const src = renderer.domElement, c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d'); g.drawImage(src, 0, 0);
      const d = g.getImageData(0, 0, w, h).data;
      let x0 = w, y0 = h, x1 = 0, y1 = 0;
      for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 24) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 <= x0 || y1 <= y0) return c.toDataURL('image/webp', .9);
      x0 = Math.max(0, x0 - 6); y0 = Math.max(0, y0 - 6); x1 = Math.min(w - 1, x1 + 6); y1 = Math.min(h - 1, y1 + 6);
      const o = document.createElement('canvas'); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
      o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
      return o.toDataURL('image/webp', .9);
    } finally { shadow.visible = sv; camera.fov = fov0; camera.updateProjectionMatrix(); renderer.setPixelRatio(pr); fit(); }
  },
  spin(){ vy = 0; spinT = 0; },
  setDay(iso){ const [y,m,d] = iso.split('-').map(Number); pageDate = new Date(y, m-1, d); drawPages(frase && !typing ? frase : ''); },
  destroy(){ alive = false; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); try { renderer.forceContextLoss(); } catch (e) {} el.remove(); },
};
}
