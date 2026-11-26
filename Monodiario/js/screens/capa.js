import * as api from '../api.js';
import * as clock from '../clock.js';
import { createBook, getTex, TEXNAMES, METAIS } from '../livro3d.js';

const T = window.THREE;
const TEMPLATE = `
<div id="stage">
  <button class="back c" id="bk">← Voltar</button>
  <div class="fab"><button class="c go" id="sv">Salvar</button></div>
  <div class="fab baixo"><button class="c" id="sp">Girar 360°</button><button class="c" id="tg">Abrir / fechar</button></div>
</div>
<div id="ui">
  <div id="tabs"></div>
  <div class="pane" data-k="m"><div id="rm" class="r"></div></div>
  <div class="pane" data-k="t"><div id="rt" class="r"></div></div>
  <div class="pane" data-k="c"><div id="rc" class="r"></div></div>
  <div class="pane" data-k="a"><div class="r"><small>Fosco</small><input type="range" id="gl" min="0" max="100" value="0"><small>Brilho</small></div></div>
  <div class="pane" data-k="l"><div id="rl" class="r"></div></div>
  <div class="pane" data-k="g"><div id="rg" class="r"></div></div>
  <div class="pane" data-k="e"><div id="re" class="r"></div></div>
  <div class="pane" data-k="n"><div class="r" id="rtx"><input id="tx" maxlength="24" placeholder="Seu nome ou título (opcional)"></div><div id="rp" class="r"></div></div>
</div>
<div id="wh"><div class="sheet"><b>Escolha a cor</b>
  <canvas id="wc" width="220" height="220"></canvas>
  <div class="r"><small>Claridade</small><input type="range" id="wv" min="0" max="100" value="60"></div>
  <div class="r"><span id="wp" class="sw"></span><button class="c go" id="wok">Pronto</button></div>
</div></div>`;

export async function mount(root, ctx) {
  root.innerHTML = TEMPLATE;
  const $ = (id) => root.querySelector('#' + id);
  const cover = await api.getCover();
  const book = createBook($('stage'), { cfg: cover || {} });
  book.setDay(clock.today());
  const { cfg, build, paint, drawFoil } = book;

  // salva a capa sozinho (com um pequeno atraso para não gravar a cada toque na roda de cores)
  let st = 0;
  const flush = () => { clearTimeout(st); st = 0; api.saveCover({ ...cfg }); };
  const save = () => { clearTimeout(st); st = setTimeout(flush, 250); };

function chips(id,items,key,swatch){
  const root=$(id), sl=root.scrollLeft; root.innerHTML='';
  items.forEach(it=>{const v=Array.isArray(it)?it[0]:it, l=Array.isArray(it)?it[1]:it, b=document.createElement('button');
    b.className=(swatch?'dot':'c')+(cfg[key]===v?' on':''); if(swatch){b.style.background=v;b.setAttribute('aria-label',v);} else b.textContent=l;
    b.onclick=()=>{cfg[key]=v;build();ui();save();}; root.append(b);});
  root.scrollLeft=sl;
}
const MODELOS=[['trinco','Trinco'],['combinacao','Combinação'],['envolvente','Envolvente'],['antigo','Antigo'],['executivo','Executivo'],['fivela','Fivela'],['ima','Ímã'],['elastico','Elástico'],['cadeado','Cadeado'],['chave','Chave'],['giratorio','Giratório'],['ziper','Zíper'],['cordao','Cordão']];
const PAGS=['#f6eedb','#ffffff','#f7e7a1','#f6dce0','#dbe7f5','#dcecd8','#e4e4e2'];
const NPOSL=[['topo','Topo'],['meio','Meio'],['baixo','Embaixo'],['se','Sup. esq.'],['sd','Sup. dir.'],['ie','Inf. esq.'],['id','Inf. dir.']];
const METAL=[['ouro','Ouro'],['prata','Prata'],['bronze','Bronze'],['cobre','Cobre']];
const EMBL=[['nenhum','Liso'],['luas','Luas'],['arvore','Árvore'],['solua','Sol e lua'],['mandala','Mandala'],['flor','Flor-de-lis'],['bussola','Bússola'],['brasao','Brasão'],['coroa','Coroa'],['moldura','Moldura']];
let tab='n';
const TABS=[['n','Nome'],['m','Modelo'],['t','Textura'],['c','Cor'],['a','Acabamento'],['l','Metal'],['g','Páginas'],['e','Emblema']];
function cards(id,items,key,draw,round){ // cartões com miniatura (textura, metal)
  const root=$(id), sl=root.scrollLeft; root.innerHTML='';
  items.forEach(([v,l])=>{const b=document.createElement('button'), i=document.createElement('i'), t=document.createElement('span');
    b.className='card'+(cfg[key]===v?' on':''); if(round)i.className='round'; draw(i,v); t.textContent=l; b.append(i,t);
    b.onclick=()=>{cfg[key]=v;build();ui();save();}; root.append(b);});
  root.scrollLeft=sl;
}
function ui(){
  const tb=$('tabs'), tl=tb.scrollLeft; tb.innerHTML='';
  TABS.forEach(([k,l])=>{const b=document.createElement('button'); b.className='tab'+(tab===k?' on':''); b.textContent=l; b.onclick=()=>{tab=k;ui();const on=tb.querySelector('.on'); if(on) tb.scrollLeft=(on.offsetLeft||0)-(tb.clientWidth-(on.offsetWidth||0))/2;}; tb.append(b);});
  tb.scrollLeft=tl;
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.dataset.k===tab));
  if(tab==='m') chips('rm',MODELOS,'m');
  if(tab==='t'){ const cc=new T.Color(cfg.cor), base=(cc.r*.3+cc.g*.59+cc.b*.11)<.12?'#6b6b6b':cfg.cor;
    cards('rt',TEXNAMES,'t',(i,n)=>{const c=document.createElement('canvas'); c.width=c.height=56; const x=c.getContext('2d'); x.drawImage(getTex(n).image,0,0,128,128,0,0,56,56); x.globalCompositeOperation='multiply'; x.fillStyle=base; x.fillRect(0,0,56,56); i.append(c);}); }
  if(tab==='l') cards('rl',METAL,'metal',(i,n)=>{const q=METAIS[n].g; i.style.background='linear-gradient(135deg,'+q[0]+','+q[1]+' 55%,'+q[2]+')';},true);
  if(tab==='g') chips('rg',PAGS,'pg',true);
  if(tab==='e') chips('re',EMBL,'e');
  if(tab==='n') chips('rp',NPOSL,'np');
  if(tab==='c'){ const rc=$('rc'); rc.innerHTML=''; const wb=document.createElement('button'); wb.className='dot wheelb'; wb.setAttribute('aria-label','Roda de cores'); wb.onclick=openWheel;
    const sw=document.createElement('span'); sw.className='sw'; sw.style.background=cfg.cor; sw.onclick=openWheel; const lb=document.createElement('small'); lb.textContent=cfg.cor+' · toque para mudar'; rc.append(wb,sw,lb); }
}
$('gl').oninput=e=>{cfg.gl=e.target.value/100; paint(); save();};
$('tx').oninput=e=>{cfg.txt=e.target.value; drawFoil(); save();};

/* ---------- roda de cores ---------- */
const wc=$('wc'), wx=wc.getContext('2d'), WS=wc.width, WR=WS/2, hsv={h:0,s:0,v:.6};
function hsv2rgb(h,s,v){const f=n=>{const k=(n+h*6)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1));};return [f(5),f(3),f(1)];}
const toHex=rgb=>'#'+rgb.map(z=>Math.round(z*255).toString(16).padStart(2,'0')).join('');
function hex2hsv(hex){const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  let h=0; if(d){h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4; h/=6;} return {h,s:mx?d/mx:0,v:mx};}
function drawWheel(){
  const im=wx.createImageData(WS,WS), d=im.data;
  for(let y=0;y<WS;y++)for(let x=0;x<WS;x++){const dx=x+.5-WR,dy=y+.5-WR,r=Math.hypot(dx,dy),i=(y*WS+x)*4; if(r>WR)continue;
    const c=hsv2rgb((Math.atan2(dy,dx)/(2*Math.PI)+1)%1,r/WR,1); d[i]=c[0]*255; d[i+1]=c[1]*255; d[i+2]=c[2]*255; d[i+3]=255;}
  wx.putImageData(im,0,0);
  const a=hsv.h*2*Math.PI, mx=WR+Math.cos(a)*hsv.s*(WR-2), my=WR+Math.sin(a)*hsv.s*(WR-2);
  wx.lineWidth=4; wx.strokeStyle='#000'; wx.beginPath(); wx.arc(mx,my,10,0,6.3); wx.stroke();
  wx.lineWidth=2.5; wx.strokeStyle='#fff'; wx.beginPath(); wx.arc(mx,my,10,0,6.3); wx.stroke();
}
function applyWheel(){
  cfg.cor=toHex(hsv2rgb(hsv.h,hsv.s,hsv.v)); $('wp').style.background=cfg.cor;
  $('wv').style.background='linear-gradient(90deg,#000,'+toHex(hsv2rgb(hsv.h,hsv.s,1))+')';
  paint(); drawWheel();
}
function pick(e){const r=wc.getBoundingClientRect(), dx=(e.clientX-r.left)*WS/r.width-WR, dy=(e.clientY-r.top)*WS/r.height-WR;
  hsv.h=(Math.atan2(dy,dx)/(2*Math.PI)+1)%1; hsv.s=Math.min(1,Math.hypot(dx,dy)/(WR-2)); applyWheel();}
let wdrag=false;
wc.addEventListener('pointerdown',e=>{wdrag=true;wc.setPointerCapture(e.pointerId);pick(e);});
wc.addEventListener('pointermove',e=>{if(wdrag)pick(e);});
wc.addEventListener('pointerup',()=>wdrag=false);
$('wv').oninput=e=>{hsv.v=e.target.value/100; applyWheel();};
function openWheel(){Object.assign(hsv,hex2hsv(cfg.cor)); $('wv').value=Math.round(hsv.v*100); $('wh').classList.add('on'); applyWheel();}
function closeWheel(){$('wh').classList.remove('on'); ui(); save();}
$('wok').onclick=closeWheel; $('wh').onclick=e=>{if(e.target.id==='wh')closeWheel();};

  $('tx').value = cfg.txt || '';
  $('gl').value = Math.round((cfg.gl || 0) * 100);
  $('sp').onclick = () => book.spin();
  $('tg').onclick = () => book.setOpen(!book.isOpen());
  $('bk').onclick = () => { location.hash = '#/'; };
  $('sv').onclick = () => { flush(); $('sv').textContent = 'Salvo ✓'; setTimeout(() => { location.hash = '#/'; }, 700); };
  ui();
  return () => { if (st) flush(); try { api.saveCoverThumb(book.snapshot()); } catch (e) { console.error(e); } book.destroy(); };
}
