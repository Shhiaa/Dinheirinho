/* ---------- gráficos: tooltips ao passar o mouse ---------- */
// uso: <elemento ${dtip('Título','linha 2','linha 3')}> — a 1ª linha aparece em destaque
const dtip=(...l)=>`data-tip="${esc(l.join('\n'))}"`;
let tipEl=null,guideEl=null,dotEl=null,chartLine=null;
function chartEls(){
  if(tipEl)return;
  tipEl=document.createElement('div');tipEl.className='tip';
  guideEl=document.createElement('div');guideEl.className='guide';
  dotEl=document.createElement('div');dotEl.className='gdot';
  document.body.append(tipEl,guideEl,dotEl);
}
function showTip(txt,x,y){
  chartEls();
  const [t,...rest]=txt.split('\n');
  tipEl.innerHTML=`<b>${esc(t)}</b>${rest.map(l=>`<span>${esc(l)}</span>`).join('')}`;
  tipEl.classList.add('show');
  const w=tipEl.offsetWidth,h=tipEl.offsetHeight;
  let l=x+14,tp=y+14;
  if(l+w>window.innerWidth-8)l=x-w-14;
  if(tp+h>window.innerHeight-8)tp=y-h-14;
  tipEl.style.left=Math.max(8,l)+'px';tipEl.style.top=Math.max(8,tp)+'px';
}
function hideTip(){if(tipEl)tipEl.classList.remove('show')}
function hideLine(){if(guideEl){guideEl.classList.remove('show');dotEl.classList.remove('show')}}
function hideAllCharts(){hideTip();hideLine()}
// gráfico de linha (gasto acumulado): mostra o valor do dia sob o mouse
function lineHover(svg,e){
  const c=chartLine;if(!c)return;chartEls();
  const r=svg.getBoundingClientRect();
  const fx=(e.clientX-r.left)/r.width*c.W;
  const i=Math.max(0,Math.min(c.fim-1,Math.round((fx-c.pad)/(c.W-2*c.pad)*(c.fim-1))));
  const X=i=>c.pad+i/(c.fim-1)*(c.W-2*c.pad),Y=v=>c.H-c.pad-v/c.maxY*(c.H-2*c.pad);
  const ideal=c.ideal*i/(c.fim-1),temReal=i<c.limite;
  const linhas=[`Dia ${i+1}`];
  if(temReal)linhas.push('Gasto acumulado '+brl(c.cum[i]));
  if(c.ideal>0)linhas.push((c.rotulo||'Ritmo ideal')+' '+brl(ideal));
  showTip(linhas.join('\n'),e.clientX,e.clientY);
  const gx=r.left+X(i)/c.W*r.width;
  guideEl.style.left=gx+'px';guideEl.style.top=r.top+'px';guideEl.style.height=r.height+'px';guideEl.classList.add('show');
  if(temReal){dotEl.style.left=gx+'px';dotEl.style.top=(r.top+Y(c.cum[i])/c.H*r.height)+'px';dotEl.classList.add('show')}
  else dotEl.classList.remove('show');
}
document.addEventListener('mousemove',e=>{
  const el=e.target;if(!el.closest)return;
  const lc=el.closest('svg[data-linechart]');
  if(lc){lineHover(lc,e);return}
  hideLine();
  const t=el.closest('[data-tip]');
  if(t)showTip(t.getAttribute('data-tip'),e.clientX,e.clientY);else hideTip();
});
document.addEventListener('mouseout',e=>{if(!e.relatedTarget)hideAllCharts()});
window.addEventListener('scroll',hideAllCharts,true);
