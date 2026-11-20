/* ---------- navegação ---------- */
const NAV=[['dashboard','Dashboard','home'],['lancamentos','Lançamentos','list'],['rendas','Rendas','wallet'],['categorias','Categorias','tag'],['metas','Metas','target'],['investimentos','Investimentos','trend'],['relatorios','Relatórios','chart'],['config','Configurações','cog']];
function renderNav(){
  document.getElementById('side').innerHTML=`<div class="brand"><i></i>Finanças</div>`+
    NAV.map(([k,t,ic])=>`<button class="nav-btn ${view===k?'on':''}" data-go="${k}">${I[ic]}${t}</button>`).join('')+
    `<button class="btn pri" data-new="gasto">${I.plus}Novo lançamento</button><div style="margin-top:auto;padding:0 12px">${syncBadge()}</div>`;
  const mob=[['dashboard','Início','home'],['lancamentos','Lançamentos','list'],null,['rendas','Rendas','wallet'],['mais','Mais','cog']];
  document.getElementById('bnav').innerHTML=mob.map(x=>x?`<button class="nav-btn ${(view===x[0]||(x[0]==='mais'&&['categorias','metas','investimentos','relatorios','config'].includes(view)))?'on':''}" data-go="${x[0]}">${I[x[2]]}${x[1]}</button>`:`<button class="plus" data-new="gasto" aria-label="Novo lançamento">${I.plus}</button>`).join('');
}
function go(v){
  if(v==='mais'){openMais();return}
  view=v;if(location.hash!=='#'+v)history.replaceState(null,'','#'+v);render();window.scrollTo(0,0);
}
function monthPicker(){return `<div class="month"><button class="icon-btn" data-mes="-1" aria-label="Mês anterior">${I.l}</button><span>${mesNome(mes)}</span><button class="icon-btn" data-mes="1" aria-label="Próximo mês">${I.r}</button></div>`}

/* ---------- telas ---------- */
function render(){
  renderNav();
  const M=document.getElementById('main');
  M.innerHTML=(view==='dashboard'?loginBanner():'')+({dashboard,lancamentos,rendas,categorias,metas,investimentos,relatorios,config}[view]||dashboard)();
}

function delta(cur,prev,invert){
  if(!prev)return `<span class="delta muted">sem dados do mês anterior</span>`;
  const p=(cur-prev)/Math.abs(prev)*100;const up=p>=0;
  const good=invert?!up:up;
  return `<span class="delta" style="color:${good?'var(--pos)':'var(--neg)'}">${up?'▲':'▼'} ${Math.abs(p).toFixed(0)}% <span class="muted">vs. mês anterior</span></span>`;
}

let dashModo='mes';
const modoToggle=()=>`<div class="seg" style="width:150px"><button class="${dashModo==='mes'?'on':''}" data-modo="mes">Mês</button><button class="${dashModo==='ano'?'on':''}" data-modo="ano">Ano</button></div>`;
const anoPicker=()=>`<div class="month"><button class="icon-btn" data-ano="-1" aria-label="Ano anterior">${I.l}</button><span>${mes.slice(0,4)}</span><button class="icon-btn" data-ano="1" aria-label="Próximo ano">${I.r}</button></div>`;
function dashAno(){
  const y=mes.slice(0,4),hojeM=ym(today());
  const meses=Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`);
  const rs=meses.map(m=>({m,futuro:m>hojeM,...resumo(m)}));
  const passados=rs.filter(x=>!x.futuro);
  const sum=k=>passados.reduce((s,x)=>s+x[k],0);
  const ent=sum('ent'),gas=sum('gastos'),saldo=sum('saldo'),va=sum('saldoVA'),entC=sum('entConta'),guard=sum('guardado')+sum('investido');
  const nM=passados.filter(x=>x.ent||x.gastos).length||1;
  const head=`<div class="top"><h1>Visão do ano</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${modoToggle()}${anoPicker()}</div></div>`;
  if(!passados.some(x=>x.ent||x.gastos))return head+`<div class="card empty"><h2>Sem lançamentos em ${y}</h2></div>`;
  // barras por mês
  const maxV=Math.max(1,...rs.map(x=>Math.max(x.ent,x.gastos)));const W=720,H=180,bw=W/12*0.3;
  const bars=rs.map((x,i)=>{const cx=(i+.5)*W/12;const o=x.futuro?.25:1;return `<g opacity="${o}"><rect x="${cx-bw-1}" y="${H-x.ent/maxV*H}" width="${bw}" height="${x.ent/maxV*H}" rx="3" fill="#22C55E"><title>${mesCurto(x.m)} · entradas ${brl(x.ent)}</title></rect><rect x="${cx+1}" y="${H-x.gastos/maxV*H}" width="${bw}" height="${x.gastos/maxV*H}" rx="3" fill="#F04444"><title>${mesCurto(x.m)} · gastos ${brl(x.gastos)}</title></rect></g>`}).join('');
  // categorias do ano
  const porCat={};passados.forEach(x=>x.G.filter(g=>g.carteira!=='va').forEach(g=>porCat[g.categoria]=(porCat[g.categoria]||0)+g.valor));
  const cats=Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  let acc=0;const R=60,C=2*Math.PI*R;
  const donut=cats.length?`<div class="donut-wrap"><svg width="160" height="160" viewBox="0 0 160 160"><circle r="${R}" cx="80" cy="80" fill="none" stroke="#262626" stroke-width="18"/>${cats.map(([id,v])=>{const c=cat(id),len=v/gas*C;const s=`<circle r="${R}" cx="80" cy="80" fill="none" stroke="${c.cor}" stroke-width="18" stroke-dasharray="${Math.max(len-2,.5)} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 80 80)"><title>${esc(c.nome)}: ${brl(v)}</title></circle>`;acc+=len;return s}).join('')}<text x="80" y="76" text-anchor="middle" fill="#A1A1A1" font-size="11">TOTAL</text><text x="80" y="96" text-anchor="middle" fill="#FAFAFA" font-size="15" font-weight="600">${fmt(gas)}</text></svg>
   <div class="legend">${cats.slice(0,8).map(([id,v])=>{const c=cat(id);return `<div><i style="background:${c.cor}"></i><span>${esc(c.nome)}</span><span class="num">${fmt(v)}</span></div>`}).join('')}</div></div>`:'<div class="empty">Sem gastos.</div>';
  const maiorMes=passados.reduce((a,b)=>b.gastos>a.gastos?b:a);
  const tx=entC?saldo/entC*100:0;
  const tabela=`<table class="tbl num"><tr><th>Mês</th><th class="r">Entradas</th><th class="r">Gastos</th><th class="r">Saldo</th></tr>${rs.map(x=>`<tr style="${x.futuro?'opacity:.35':''}"><td style="text-transform:capitalize"><button class="link" style="color:var(--t1);font-size:14px" data-vermes="${x.m}">${mesCurto(x.m)}</button></td><td class="r">${x.ent?fmt(x.ent):'—'}</td><td class="r">${x.gastos?fmt(x.gastos):'—'}</td><td class="r" style="color:${x.saldo<0?'var(--neg)':'var(--t1)'}">${x.ent||x.gastos?fmt(x.saldo):'—'}</td></tr>`).join('')}<tr style="font-weight:600"><td>Total</td><td class="r">${fmt(ent)}</td><td class="r">${fmt(gas)}</td><td class="r" style="color:${saldo<0?'var(--neg)':'var(--pos)'}">${fmt(saldo)}</td></tr></table>`;
  return head+`<div class="grid">
   <div class="card stat c3"><div class="cap">Entradas · salário</div><div class="val">${money(ent)}</div><span class="small">média ${brl(ent/nM)}/mês</span></div>
   <div class="card stat c3"><div class="cap">Gastos · salário</div><div class="val">${money(gas)}</div><span class="small">média ${brl(gas/nM)}/mês</span></div>
   <div class="card stat c3"><div class="cap">Sobrou no ano</div><div class="val" style="color:${saldo<0?'var(--neg)':'var(--t1)'}">${money(saldo)}</div><span class="small">${entC?`taxa de poupança ${tx.toFixed(0)}%`:'Conta'}${guard?` · ${brl(guard)} guardados/investidos`:''}</span></div>
   <div class="card stat c3" style="border-color:rgba(139,124,246,.3)"><div class="cap" style="color:var(--va)">VA no ano</div><div class="val">${money(sum('gVA'))}</div><span class="small">gastos de ${brl(sum('entVA'))} creditados · sobra ${brl(va)}</span></div>
   <div class="card c12"><div class="card-h"><h2>Mês a mês</h2><span class="small"><span style="color:var(--pos)">■</span> entradas &nbsp;<span style="color:var(--neg)">■</span> gastos</span></div>
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="180" preserveAspectRatio="none">${bars}</svg>
    <div class="small" style="display:flex;margin-top:8px;text-transform:capitalize">${rs.map(x=>`<span style="flex:1;text-align:center">${mesCurto(x.m)}</span>`).join('')}</div>
    <p class="small" style="margin-top:12px">Mês com mais gastos: <b style="color:var(--t1);text-transform:capitalize">${mesNome(maiorMes.m)}</b> (${brl(maiorMes.gastos)})</p></div>
   <div class="card c6"><div class="card-h"><h2>Gastos do salário</h2><span class="small">por categoria</span></div>${donut}</div>
   <div class="card c6" style="overflow-x:auto"><div class="card-h"><h2>Resumo por mês</h2><span class="small">toque no mês para abrir</span></div>${tabela}</div>
  </div>`;
}
const loginBanner=()=>sb&&!sbUser?`<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-color:rgba(198,244,50,.3)"><span class="small" style="flex:1;min-width:200px">☁️ Seus dados estão só neste aparelho. Entre para salvar na nuvem e acessar de qualquer lugar.</span><button class="btn pri" data-go="config">Entrar</button></div>`:'';
function dashboard(){
  if(dashModo==='ano')return dashAno();
  const r=resumo(mes),p=resumo(addM(mes,-1));
  const semDados=!S.rendas.length&&!S.gastos.length;
  // por dia até o próximo salário
  const hoje=today(),noMes=ym(hoje)===mes;
  const sal=S.rendas.find(x=>x.recorrente&&x.tipo==='salario');
  let diasRest;
  const [y,mo]=mes.split('-').map(Number);const fimMes=new Date(y,mo,0).getDate();
  if(noMes){
    const d=+hoje.slice(8);
    if(sal){const dp=sal.dia;diasRest=dp>d?dp-d:(fimMes-d)+dp}else diasRest=fimMes-d+1;
  }
  const porDia=noMes&&diasRest>0?r.saldo/diasRest:null;

  const cards=`
   <div class="card stat c3"><div class="cap">Entradas · salário</div><div class="val">${money(r.ent)}</div>${delta(r.ent,p.ent)}</div>
   <div class="card stat c3"><div class="cap">Gastos · salário</div><div class="val">${money(r.gastos)}</div>${delta(r.gastos,p.gastos,true)}</div>
   <div class="card stat c3"><div class="cap">Saldo disponível</div><div class="val" style="color:${r.saldo<0?'var(--neg)':'var(--t1)'}">${money(r.saldo)}</div><span class="small">Conta: entradas − gastos${r.guardado?' − guardado':''}${r.investido?' − investido':''}</span></div>
   <div class="card stat c3" style="border-color:rgba(139,124,246,.3)"><div class="cap" style="color:var(--va)">Saldo do VA</div><div class="val">${money(r.saldoVA)}</div><span class="small">gastou ${brl(r.gVA)} de ${brl(r.entVA)}</span></div>`;

  if(semDados)return `<div class="top"><h1>Visão geral</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${modoToggle()}${monthPicker()}</div></div>
   <div class="grid">${cards}<div class="card c12 empty"><h2>Comece cadastrando sua renda</h2><p class="hint">Salário e VA entram sozinhos todo mês. Depois é só lançar os gastos pelo botão “+”.</p>
   <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="btn pri" data-new="renda">Cadastrar salário/VA</button><button class="btn sec" data-demo>Ver com dados de exemplo</button></div></div></div>`;

  // rosca por categoria
  const porCat={},porCatAll={},porCatVA={};r.G.forEach(g=>{porCatAll[g.categoria]=(porCatAll[g.categoria]||0)+g.valor;const t=g.carteira==='va'?porCatVA:porCat;t[g.categoria]=(t[g.categoria]||0)+g.valor});
  const cats=Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  const total=r.gastos;
  let donut;
  if(!cats.length)donut=`<div class="empty">Nenhum gasto neste mês.</div>`;
  else{
    let acc=0;const R=60,C=2*Math.PI*R;
    const segs=cats.map(([id,v])=>{const c=cat(id);const len=v/total*C;const s=`<circle r="${R}" cx="80" cy="80" fill="none" stroke="${c.cor}" stroke-width="18" stroke-dasharray="${Math.max(len-2,0.5)} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 80 80)"><title>${esc(c.nome)}: ${brl(v)}</title></circle>`;acc+=len;return s}).join('');
    donut=`<div class="donut-wrap"><svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Gastos por categoria"><circle r="${R}" cx="80" cy="80" fill="none" stroke="#262626" stroke-width="18"/>${segs}<text x="80" y="76" text-anchor="middle" fill="#A1A1A1" font-size="11" letter-spacing=".5">TOTAL</text><text x="80" y="96" text-anchor="middle" fill="#FAFAFA" font-size="16" font-weight="600" class="num">${fmt(total)}</text></svg>
    <div class="legend">${cats.slice(0,7).map(([id,v])=>{const c=cat(id);return `<div><i style="background:${c.cor}"></i><span>${esc(c.nome)}</span><span class="num">${(v/total*100).toFixed(0)}%</span></div>`}).join('')}</div></div>`;
  }

  // linha acumulada vs ritmo ideal
  const W=560,H=160,pad=4;
  const diario=Array(fimMes).fill(0);r.G.filter(g=>g.carteira!=='va').forEach(g=>diario[+g.data.slice(8)-1]+=g.valor);
  let a=0;const cum=diario.map(v=>a+=v);
  const limite=noMes?+hoje.slice(8):(mdiff(mes,ym(hoje))>0?fimMes:0);
  const maxY=Math.max(r.entConta,a,1);
  const X=i=>pad+i/(fimMes-1)*(W-2*pad),Y=v=>H-pad-v/maxY*(H-2*pad);
  const pts=cum.slice(0,limite).map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const linha=`<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" role="img" aria-label="Gasto acumulado por dia">
   <line x1="${X(0)}" y1="${Y(0)}" x2="${X(fimMes-1)}" y2="${Y(r.entConta)}" stroke="#6B6B6B" stroke-dasharray="4 4" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
   ${limite?`<polyline points="${pts}" fill="none" stroke="#C6F432" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`:''}</svg>
   <div class="small" style="display:flex;justify-content:space-between;margin-top:8px"><span>dia 1</span><span><span style="color:var(--accent)">━</span> gasto acumulado &nbsp; <span class="muted">┅</span> ritmo ideal</span><span>dia ${fimMes}</span></div>`;

  // orçamentos
  const orc=S.categorias.filter(c=>c.orcamento>0).map(c=>({c,v:porCatAll[c.id]||0})).sort((a,b)=>b.v/b.c.orcamento-a.v/a.c.orcamento).slice(0,5);
  const bars=orc.length?orc.map(budgetRow).join(''):`<div class="empty" style="padding:16px">Defina orçamentos em <button class="link" data-go="categorias">Categorias</button>.</div>`;

  return `<div class="top"><h1>Visão geral</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${modoToggle()}${monthPicker()}</div></div>
  <div class="grid">
   ${cards}
   ${porDia!==null?`<div class="card c12"><div class="daily"><span class="cap">Você pode gastar</span><span class="num" style="font-size:28px;font-weight:600;color:${porDia<0?'var(--neg)':'var(--accent)'}"><span class="cur">R$</span>${fmt(porDia)}</span><span class="small">por dia nos próximos ${diasRest} dias${sal?' até o próximo salário':''}</span></div></div>`:''}
   <div class="card c5"><div class="card-h"><h2>Gastos do salário</h2><span class="small">por categoria</span></div>${donut}</div>
   <div class="card c7"><div class="card-h"><h2>Ritmo do mês</h2><span class="small">só Conta</span></div>${linha}</div>
   ${r.entVA||r.gVA?(()=>{const pv=r.entVA?Math.min(r.gVA/r.entVA*100,100):100;const vc=Object.entries(porCatVA).sort((a,b)=>b[1]-a[1]);
    return `<div class="card c12" style="border-color:rgba(139,124,246,.3)"><div class="card-h"><h2 style="color:var(--va)">🍎 Vale-alimentação / refeição</h2><button class="link" style="color:var(--va)" data-filtro-va>Ver gastos do VA</button></div>
     <div class="grid"><div class="c4"><div class="cap">Creditado</div><div class="num" style="font-size:22px;font-weight:600;margin-top:4px">${money(r.entVA)}</div></div>
     <div class="c4"><div class="cap">Gasto</div><div class="num" style="font-size:22px;font-weight:600;margin-top:4px">${money(r.gVA)}</div></div>
     <div class="c4"><div class="cap">Sobra</div><div class="num" style="font-size:22px;font-weight:600;margin-top:4px;color:${r.saldoVA<0?'var(--neg)':'var(--va)'}">${money(r.saldoVA)}</div></div></div>
     <div class="bar" style="height:10px;margin-top:16px"><i style="width:${pv}%;background:${r.saldoVA<0?'var(--neg)':'var(--va)'}"></i></div>
     ${vc.length?`<div class="small" style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px">${vc.map(([id,v])=>`<span>${cat(id).icone} ${esc(cat(id).nome)} <b class="num" style="color:var(--t1);font-weight:500">${fmt(v)}</b></span>`).join('')}</div>`:''}
     ${noMes&&diasRest>0&&r.saldoVA>0?`<p class="small" style="margin-top:8px">Dá para gastar <b style="color:var(--va)">${brl(r.saldoVA/diasRest)}</b> por dia no VA</p>`:''}</div>`})():''}
   <div class="card c5"><div class="card-h"><h2>Orçamentos</h2><button class="link" data-go="categorias">Editar</button></div>${bars}</div>
   ${S.metas.length?`<div class="card c12"><div class="card-h"><h2>Metas</h2><button class="link" data-go="metas">Ver todas</button></div><div class="grid">${S.metas.slice(0,3).map(x=>{const t=metaTotal(x),p=Math.min(t/x.alvo*100,100);return `<div class="c4" style="min-width:0"><div class="l small" style="display:flex;justify-content:space-between;gap:8px"><span style="color:var(--t1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${x.icone} ${esc(x.nome)}</span><span class="num">${p.toFixed(0)}%</span></div><div class="bar"><i style="width:${p}%;background:${p>=100?'var(--pos)':'var(--accent)'}"></i></div></div>`}).join('')}</div></div>`:''}
   <div class="card c7"><div class="card-h"><h2>Últimos lançamentos</h2><button class="link" data-go="lancamentos">Ver todos</button></div>
    ${r.G.length?r.G.slice(0,7).map(gItem).join(''):`<div class="empty" style="padding:16px">Sem gastos neste mês. <button class="link" data-new="gasto">Lançar gasto</button></div>`}</div>
  </div>`;
}
function budgetRow({c,v}){
  const p=v/c.orcamento*100;const cor=p>=100?'var(--neg)':p>=80?'var(--warn)':c.cor;
  return `<div class="brow"><div class="l"><span>${c.icone} ${esc(c.nome)}</span><span class="num"><span style="color:${p>=80?cor:'var(--t1)'}">${fmt(v)}</span> <span class="muted">/ ${fmt(c.orcamento)}</span></span></div><div class="bar"><i style="width:${Math.min(p,100)}%;background:${cor}"></i></div></div>`;
}
function gItem(g){
  const c=cat(g.categoria);
  const extra=g.parcelas>1?` · ${g.parcela}/${g.parcelas}`:g.recorrente?' · fixo':'';
  return `<div class="item"><div class="dot" style="background:${c.cor}22;color:${c.cor}">${c.icone}</div>
   <div class="meta"><b>${esc(g.descricao||c.nome)}${g.carteira==='va'?'<span class="tag">VA</span>':''}</b><span class="small">${esc(c.nome)} · ${dataBR(g.data)}${extra}</span></div>
   <span class="amt num" style="color:${g.carteira==='va'?'var(--va)':'var(--t1)'}">−${fmt(g.valor)}</span>
   <div class="acts"><button class="icon-btn" data-edit-g="${g.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-dup-g="${g.id}" aria-label="Duplicar">${I.copy}</button><button class="icon-btn" data-del-g="${g.id}" aria-label="Excluir">${I.trash}</button></div></div>`;
}
function rItem(r){
  return `<div class="item"><div class="dot" style="background:${r.carteira==='va'?'rgba(139,124,246,.15)':'rgba(34,197,94,.12)'};color:${r.carteira==='va'?'var(--va)':'var(--pos)'}">${r.carteira==='va'?'🍎':'＋'}</div>
   <div class="meta"><b>${esc(r.descricao)}${r.carteira==='va'?'<span class="tag">VA</span>':''}</b><span class="small">${({salario:'Salário',beneficio:'Benefício',extra:'Extra'})[r.tipo]} · ${dataBR(r.data)}${r.recorrente?' · todo mês':''}</span></div>
   <span class="amt num" style="color:var(--pos)">+${fmt(r.valor)}</span>
   <div class="acts"><button class="icon-btn" data-edit-r="${r.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-del-r="${r.id}" aria-label="Excluir">${I.trash}</button></div></div>`;
}

function lancamentos(){
  const r=resumo(mes);
  let items=[...r.G.map(g=>({...g,_t:'g'})),...r.R.map(x=>({...x,_t:'r'}))];
  const q=filt.q.toLowerCase();
  items=items.filter(x=>(!filt.tipo||x._t===filt.tipo)&&(!filt.orig||(x.carteira==='va'?'va':'conta')===filt.orig)&&(!filt.cat||x.categoria===filt.cat)&&(!q||(x.descricao||'').toLowerCase().includes(q)||(x._t==='g'&&cat(x.categoria).nome.toLowerCase().includes(q))||fmt(x.valor).includes(q)));
  items.sort((a,b)=>b.data.localeCompare(a.data));
  const tot=items.reduce((s,x)=>s+(x._t==='r'?x.valor:-x.valor),0);
  return `<div class="top"><h1>Lançamentos</h1>${monthPicker()}</div>
  <div class="filters">
   <input class="inp" id="fq" placeholder="Buscar descrição, categoria ou valor" value="${esc(filt.q)}">
   <select class="inp" id="ft"><option value="">Entradas e gastos</option><option value="g" ${filt.tipo==='g'?'selected':''}>Só gastos</option><option value="r" ${filt.tipo==='r'?'selected':''}>Só entradas</option></select>
   <select class="inp" id="fc"><option value="">Todas as categorias</option>${S.categorias.map(c=>`<option value="${c.id}" ${filt.cat===c.id?'selected':''}>${esc(c.nome)}</option>`).join('')}</select>
   <select class="inp" id="fo"><option value="">Conta e VA</option><option value="conta" ${filt.orig==='conta'?'selected':''}>Conta</option><option value="va" ${filt.orig==='va'?'selected':''}>VA</option></select>
  </div>
  <div class="card">
   <div class="card-h"><span class="small">${items.length} lançamento${items.length===1?'':'s'}</span><span class="num" style="font-weight:600;color:${tot<0?'var(--neg)':'var(--pos)'}">${fmt(tot,true)}</span></div>
   ${items.length?items.map(x=>x._t==='g'?gItem(x):rItem(x)).join(''):`<div class="empty">Nada encontrado.<br><button class="btn pri" data-new="gasto">${I.plus}Novo lançamento</button></div>`}
  </div>`;
}

function rendas(){
  const rec=S.rendas.filter(r=>r.recorrente),ext=S.rendas.filter(r=>!r.recorrente).sort((a,b)=>b.data.localeCompare(a.data));
  const row=r=>`<div class="item"><div class="dot" style="background:${r.carteira==='va'?'rgba(139,124,246,.15)':'rgba(34,197,94,.12)'};color:${r.carteira==='va'?'var(--va)':'var(--pos)'}">${r.carteira==='va'?'🍎':'＋'}</div>
   <div class="meta"><b>${esc(r.descricao)}${r.carteira==='va'?'<span class="tag">VA</span>':''}</b><span class="small">${r.recorrente?`Todo dia ${r.dia} · desde ${mesCurto(r.inicio)}/${r.inicio.slice(2,4)}${r.fim?` · até ${mesCurto(r.fim)}/${r.fim.slice(2,4)}`:''}`:dataBR(r.data)+'/'+r.data.slice(2,4)}</span>
   ${r.historico&&r.historico.length?`<span class="small muted">Reajustes: ${r.historico.map(h=>`${mesCurto(h.mes)}/${h.mes.slice(2,4)} ${brl(h.de)}→${brl(h.para)}`).join(' · ')}</span>`:''}</div>
   <span class="amt num" style="color:var(--pos)">+${fmt(r.valor)}</span>
   <div class="acts"><button class="icon-btn" data-edit-r="${r.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-del-r="${r.id}" aria-label="Excluir">${I.trash}</button></div></div>`;
  const totRec=rec.filter(r=>!r.fim).reduce((s,r)=>s+(r.carteira==='va'?0:r.valor),0),totVA=rec.filter(r=>!r.fim&&r.carteira==='va').reduce((s,r)=>s+r.valor,0);
  return `<div class="top"><h1>Rendas</h1><button class="btn pri" data-new="renda">${I.plus}Nova renda</button></div>
  <div class="grid">
   <div class="card stat c6"><div class="cap">Renda fixa mensal (Conta)</div><div class="val">${money(totRec)}</div></div>
   <div class="card stat c6"><div class="cap" style="color:var(--va)">Benefícios mensais</div><div class="val">${money(totVA)}</div><span class="small">Só pagam alimentação — saldo separado</span></div>
   <div class="card c12"><div class="card-h"><h2>Recorrentes</h2><span class="small">entram sozinhas todo mês</span></div>${rec.length?rec.map(row).join(''):`<div class="empty">Cadastre seu salário e VA.<br><button class="btn pri" data-new="renda">Cadastrar</button></div>`}</div>
   <div class="card c12"><div class="card-h"><h2>Extras</h2><span class="small">freela, 13º, reembolso</span></div>${ext.length?ext.map(row).join(''):`<div class="empty" style="padding:16px">Nenhuma renda extra.</div>`}</div>
  </div>`;
}

function categorias(){
  const r=resumo(mes);const porCat={};r.G.forEach(g=>porCat[g.categoria]=(porCat[g.categoria]||0)+g.valor);
  return `<div class="top"><h1>Categorias</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${monthPicker()}<button class="btn pri" data-new="categoria">${I.plus}Nova</button></div></div>
  <div class="card">${S.categorias.map(c=>{const v=porCat[c.id]||0;const p=c.orcamento?v/c.orcamento*100:0;const cor=p>=100?'var(--neg)':p>=80?'var(--warn)':c.cor;
   return `<div class="item" style="flex-wrap:wrap"><div class="dot" style="background:${c.cor}22;color:${c.cor}">${c.icone}</div>
    <div class="meta"><b>${esc(c.nome)}</b><span class="small num">${fmt(v)} gastos${c.orcamento?` de ${fmt(c.orcamento)} · ${p.toFixed(0)}%`:' · sem orçamento'}</span>
    ${c.orcamento?`<div class="bar" style="max-width:360px"><i style="width:${Math.min(p,100)}%;background:${cor}"></i></div>`:''}</div>
    <div class="acts" style="opacity:1"><button class="icon-btn" data-edit-c="${c.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-del-c="${c.id}" aria-label="Excluir">${I.trash}</button></div></div>`}).join('')}</div>`;
}

function relatorios(){
  const n=window._rel||6;
  const meses=Array.from({length:n},(_,i)=>addM(mes,i-n+1));
  const rs=meses.map(m=>({m,...resumo(m)}));
  const maxV=Math.max(1,...rs.map(x=>Math.max(x.ent,x.gastos)));
  const W=600,H=200,bw=(W/n)*0.32;
  const bars=rs.map((x,i)=>{const cx=(i+.5)*W/n;return `<rect x="${cx-bw-2}" y="${H-x.ent/maxV*H}" width="${bw}" height="${x.ent/maxV*H}" rx="3" fill="#22C55E"><title>Entradas ${brl(x.ent)}</title></rect><rect x="${cx+2}" y="${H-x.gastos/maxV*H}" width="${bw}" height="${x.gastos/maxV*H}" rx="3" fill="#F04444"><title>Gastos ${brl(x.gastos)}</title></rect>`}).join('');
  const labels=rs.map(x=>`<span style="flex:1;text-align:center">${mesCurto(x.m)}</span>`).join('');
  const tbl=`<table class="tbl num"><tr><th>Mês</th><th class="r">Entradas</th><th class="r">Gastos</th><th class="r">Saldo</th><th class="r">Poupança</th></tr>${rs.slice().reverse().map(x=>{const tx=x.entConta?x.saldo/x.entConta*100:0;return `<tr><td style="text-transform:capitalize">${mesCurto(x.m)}/${x.m.slice(2,4)}</td><td class="r">${fmt(x.ent)}</td><td class="r">${fmt(x.gastos)}</td><td class="r" style="color:${x.saldo<0?'var(--neg)':'var(--t1)'}">${fmt(x.saldo)}</td><td class="r" style="color:${tx<0?'var(--neg)':tx>=20?'var(--pos)':'var(--t2)'}">${x.entConta?tx.toFixed(0)+'%':'—'}</td></tr>`}).join('')}</table>`;
  // categorias no tempo
  const usadas=S.categorias.filter(c=>rs.some(x=>x.G.some(g=>g.categoria===c.id)));
  const catTbl=usadas.length?`<table class="tbl num"><tr><th>Categoria</th>${rs.map(x=>`<th class="r" style="text-transform:capitalize">${mesCurto(x.m)}</th>`).join('')}</tr>${usadas.map(c=>`<tr><td><span style="color:${c.cor}">●</span> ${esc(c.nome)}</td>${rs.map(x=>{const v=x.G.filter(g=>g.categoria===c.id).reduce((s,g)=>s+g.valor,0);return `<td class="r ${v?'':'muted'}">${v?fmt(v):'—'}</td>`}).join('')}</tr>`).join('')}</table>`:`<div class="empty">Sem gastos no período.</div>`;
  const totE=rs.reduce((s,x)=>s+x.entConta,0),totS=rs.reduce((s,x)=>s+x.saldo,0);
  return `<div class="top"><h1>Relatórios</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${monthPicker()}<div class="seg" style="width:160px"><button class="${n===6?'on':''}" data-rel="6">6 meses</button><button class="${n===12?'on':''}" data-rel="12">12 meses</button></div></div></div>
  <div class="grid">
   <div class="card stat c4"><div class="cap">Entradas · salário</div><div class="val">${money(rs.reduce((s,x)=>s+x.ent,0))}</div></div>
   <div class="card stat c4"><div class="cap">Gastos · salário</div><div class="val">${money(rs.reduce((s,x)=>s+x.gastos,0))}</div></div>
   <div class="card stat c4"><div class="cap">Taxa de poupança</div><div class="val num">${totE?(totS/totE*100).toFixed(0)+'%':'—'}</div><span class="small">do salário que sobrou</span></div>
   <div class="card c12"><div class="card-h"><h2>Entradas × gastos</h2><span class="small"><span style="color:var(--pos)">■</span> entradas &nbsp;<span style="color:var(--neg)">■</span> gastos</span></div>
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="200" preserveAspectRatio="none">${bars}</svg><div class="small" style="display:flex;margin-top:8px;text-transform:capitalize">${labels}</div></div>
   <div class="card c12" style="overflow-x:auto"><h2 style="margin-bottom:8px">Por mês</h2>${tbl}</div>
   <div class="card c12" style="overflow-x:auto"><h2 style="margin-bottom:8px">Categorias no tempo</h2>${catTbl}</div>
  </div>`;
}

const metaTotal=x=>x.movs.reduce((s,d)=>s+d.valor,0);
function metas(){
  const tot=S.metas.reduce((s,x)=>s+metaTotal(x),0),alvo=S.metas.reduce((s,x)=>s+x.alvo,0);
  const card=x=>{const t=metaTotal(x),p=t/x.alvo*100,falta=Math.max(x.alvo-t,0);
    let ritmo='';if(x.prazo&&falta>0){const n=mdiff(ym(today()),x.prazo)+1;ritmo=n>0?`Guarde ${brl(falta/n)}/mês para chegar até ${mesCurto(x.prazo)}/${x.prazo.slice(2,4)}`:`<span style="color:var(--warn)">Prazo vencido em ${mesCurto(x.prazo)}/${x.prazo.slice(2,4)}</span>`}
    return `<div class="card c6"><div class="card-h" style="margin-bottom:12px"><div style="display:flex;gap:12px;align-items:center;min-width:0"><div class="dot" style="background:rgba(198,244,50,.12)">${x.icone}</div><div style="min-width:0"><b style="font-weight:600;display:block">${esc(x.nome)}</b><span class="small">${x.tipo==='guardar'?'Reserva':'Juntar para'}${x.prazo?` · até ${mesCurto(x.prazo)}/${x.prazo.slice(2,4)}`:''}</span></div></div>
     <div style="display:flex"><button class="icon-btn" data-edit-m="${x.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-del-m="${x.id}" aria-label="Excluir">${I.trash}</button></div></div>
     <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span class="num" style="font-size:28px;font-weight:600">${money(t)}</span><span class="small num">de ${brl(x.alvo)}</span><span class="num" style="margin-left:auto;font-weight:600;color:${p>=100?'var(--pos)':'var(--accent)'}">${Math.min(p,999).toFixed(0)}%</span></div>
     <div class="bar" style="height:10px"><i style="width:${Math.min(p,100)}%;background:${p>=100?'var(--pos)':'var(--accent)'}"></i></div>
     <p class="small" style="margin-top:10px">${p>=100?'🎉 Meta alcançada!':`Faltam ${brl(falta)}`}${ritmo?' · '+ritmo:''}</p>
     <div style="display:flex;gap:8px;margin-top:16px"><button class="btn pri" style="flex:1" data-mov="${x.id}" data-sinal="1">${I.plus}Guardar</button><button class="btn sec" data-mov="${x.id}" data-sinal="-1">Retirar</button></div>
     ${x.movs.length?`<details style="margin-top:12px"><summary class="small" style="cursor:pointer">Histórico (${x.movs.length})</summary>${x.movs.slice().reverse().slice(0,10).map(d=>`<div class="small num" style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--border)"><span>${d.inicial?'Saldo inicial':dataBR(d.data)+'/'+d.data.slice(2,4)}</span><span style="color:${d.valor<0?'var(--neg)':'var(--pos)'}">${fmt(d.valor,true)}</span></div>`).join('')}</details>`:''}</div>`};
  return `<div class="top"><h1>Metas</h1><button class="btn pri" data-new="meta">${I.plus}Nova meta</button></div>
  ${S.metas.length?`<div class="grid"><div class="card stat c12"><div class="cap">Total guardado</div><div class="val">${money(tot)}</div><span class="small num">de ${brl(alvo)} em ${S.metas.length} meta${S.metas.length>1?'s':''}. O que você guarda sai do saldo disponível do mês.</span></div>${S.metas.map(card).join('')}</div>`
  :`<div class="card empty"><h2>Defina sua primeira meta</h2><p class="hint">Uma reserva para guardar (ex.: “guardar R$ 5.000 de reserva”) ou algo para juntar (ex.: “juntar R$ 3.000 para a viagem”).</p><button class="btn pri" data-new="meta">${I.plus}Criar meta</button></div>`}`;
}
function metaForm(x){
  const novo=!x;x=x||{nome:'',icone:'🎯',tipo:'juntar',alvo:0,prazo:'',movs:[]};window._mf={...x};
  const ems=['🎯','🛟','✈️','🏠','🚗','💻','📱','🎓','💍','🎁','🏖️','💰'];
  openModal(mh(novo?'Nova meta':'Editar meta')+`
   <div class="field"><label>Tipo</label><div class="seg" id="mTipo"><button data-t="guardar" class="${x.tipo==='guardar'?'on':''}">Guardar (reserva)</button><button data-t="juntar" class="${x.tipo==='juntar'?'on':''}">Juntar para algo</button></div></div>
   <div class="field"><label>Nome</label><input class="inp" id="mNome" value="${esc(x.nome)}" placeholder="${x.tipo==='guardar'?'Reserva de emergência':'Viagem, notebook…'}" autofocus></div>
   <div class="field"><label>Ícone</label><div class="chips" id="mIco" style="grid-template-columns:repeat(6,1fr)">${ems.map(e=>`<button class="chip ${x.icone===e?'on':''}" data-e="${e}" style="justify-content:center">${e}</button>`).join('')}</div></div>
   <div class="row"><div class="field"><label>Valor da meta</label><input class="inp num" id="mAlvo" inputmode="numeric" placeholder="R$ 0,00" value="${maskVal(x.alvo)}"></div>
   <div class="field"><label>Prazo (opcional)</label><input class="inp" type="month" id="mPrazo" value="${x.prazo||''}"></div></div>
   ${novo?`<div class="field"><label>Já tem algo guardado? (opcional)</label><input class="inp num" id="mIni" inputmode="numeric" placeholder="R$ 0,00"><span class="small">Entra como saldo inicial, sem descontar do mês.</span></div>`:''}
   <button class="btn pri" style="width:100%" data-savem="${x.id||''}">${novo?'Criar meta':'Salvar'}</button>`);
  ['mAlvo','mIni'].forEach(i=>{const el=document.getElementById(i);el&&el.addEventListener('input',()=>{el.value=maskVal(parseVal(el.value))})});
  document.getElementById('mTipo').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;_mf.tipo=b.dataset.t;[...e.currentTarget.children].forEach(y=>y.classList.toggle('on',y===b));if(_mf.tipo==='guardar'&&_mf.icone==='🎯'){_mf.icone='🛟';document.querySelectorAll('#mIco .chip').forEach(y=>y.classList.toggle('on',y.dataset.e==='🛟'))}};
  document.getElementById('mIco').onclick=e=>{const b=e.target.closest('[data-e]');if(!b)return;_mf.icone=b.dataset.e;document.querySelectorAll('#mIco .chip').forEach(y=>y.classList.toggle('on',y===b))};
}
function saveMeta(id){
  const nome=document.getElementById('mNome').value.trim(),alvo=parseVal(document.getElementById('mAlvo').value);
  if(!nome){toast('Dê um nome à meta');return}if(!alvo){toast('Informe o valor da meta');return}
  const prev=JSON.stringify(S);const base={nome,alvo,tipo:_mf.tipo,icone:_mf.icone,prazo:document.getElementById('mPrazo').value||''};
  if(id)Object.assign(S.metas.find(y=>y.id===id),base);
  else{const ini=parseVal((document.getElementById('mIni')||{}).value||'');S.metas.push({id:uid(),...base,movs:ini?[{valor:ini,data:'0000-01-01',inicial:true}]:[]})}
  save();closeModal();render();toast(id?'Meta atualizada':'Meta criada',prev);
}
function movForm(id,sinal){
  const x=S.metas.find(y=>y.id===id);
  openModal(mh(sinal>0?`Guardar em ${esc(x.nome)}`:`Retirar de ${esc(x.nome)}`)+`
   <div style="text-align:center;margin-bottom:20px"><div style="display:flex;align-items:baseline;justify-content:center;gap:6px"><span style="color:var(--t2);font-size:20px">R$</span><input class="amount-inp" id="mvVal" inputmode="numeric" placeholder="0,00" autofocus style="width:auto;max-width:260px;color:${sinal>0?'var(--accent)':'var(--neg)'}"></div>
   <p class="small">${sinal>0?'Sai do saldo disponível do mês':'Volta para o saldo disponível do mês'}</p></div>
   <div class="field"><label>Data</label><input class="inp" type="date" id="mvData" value="${mes===ym(today())?today():mes+'-01'}"></div>
   <button class="btn pri" style="width:100%" data-savemov="${id}" data-sinal="${sinal}">${sinal>0?'Guardar':'Retirar'}</button>`);
  const el=document.getElementById('mvVal');el.addEventListener('input',()=>{el.value=maskVal(parseVal(el.value))});
}
function saveMov(id,sinal){
  const v=parseVal(document.getElementById('mvVal').value);if(!v){toast('Informe o valor');return}
  const x=S.metas.find(y=>y.id===id);if(sinal<0&&v>metaTotal(x)){toast('Valor maior que o guardado');return}
  const prev=JSON.stringify(S);x.movs.push({valor:v*sinal,data:document.getElementById('mvData').value||today()});
  save();closeModal();render();const t=metaTotal(x);toast(t>=x.alvo&&sinal>0?`🎉 Meta “${x.nome}” alcançada!`:`${sinal>0?'Guardado':'Retirado'}: ${brl(v)}`,prev);
}

