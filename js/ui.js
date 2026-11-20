/* ---------- modais ---------- */
const scrim=document.getElementById('scrim'),modal=document.getElementById('modal');
function openModal(html){modal.innerHTML=html;scrim.classList.add('open');setTimeout(()=>{const f=modal.querySelector('[autofocus]')||modal.querySelector('input,button');f&&f.focus()},50)}
function closeModal(){scrim.classList.remove('open')}
scrim.addEventListener('click',e=>{if(e.target===scrim)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
const mh=t=>`<div class="modal-h"><h2>${t}</h2><button class="icon-btn" data-close aria-label="Fechar">${I.x}</button></div>`;
const parseVal=s=>{const d=String(s).replace(/\D/g,'');return d?parseInt(d,10)/100:0};
const maskVal=v=>v?v.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';

function openMais(){
  openModal(mh('Mais')+[['metas','Metas','target'],['investimentos','Investimentos','trend'],['categorias','Categorias','tag'],['relatorios','Relatórios','chart'],['config','Configurações','cog']].map(([k,t,ic])=>`<button class="nav-btn" style="width:100%;padding:14px 12px" data-go="${k}" data-close>${I[ic]}${t}</button>`).join(''));
}

function gastoForm(g){
  const novo=!g;g=g||{valor:0,categoria:S.categorias[0]?.id,data:mes===ym(today())?today():mes+'-01',carteira:'conta',descricao:'',recorrente:false,parcelas:1};
  window._gf={...g};
  openModal(mh(novo?'Novo lançamento':'Editar gasto')+`
   ${novo?`<div class="seg" style="margin-bottom:20px"><button class="on">Gasto</button><button data-new="renda">Renda</button></div>`:''}
   <div style="text-align:center;margin-bottom:20px"><div class="cap">Valor${g.parcelas>1?' total':''}</div><div style="display:flex;align-items:baseline;justify-content:center;gap:6px"><span style="color:var(--t2);font-size:20px">R$</span><input class="amount-inp" id="gVal" inputmode="numeric" placeholder="0,00" value="${maskVal(g.valor)}" autofocus style="width:auto;max-width:260px"></div></div>
   <div class="field"><label>Pago com</label><div class="seg" id="gOrig"><button data-o="conta" class="${g.carteira!=='va'?'on':''}">Conta</button><button data-o="va" class="va ${g.carteira==='va'?'on':''}">VA</button></div></div>
   <div class="field"><label>Categoria</label><div class="chips" id="gCats">${S.categorias.map(c=>`<button class="chip ${g.categoria===c.id?'on':''}" data-c="${c.id}"><span style="color:${c.cor}">${c.icone}</span>${esc(c.nome)}</button>`).join('')}</div></div>
   <div class="row"><div class="field"><label>Data</label><input class="inp" type="date" id="gData" value="${g.data}"></div>
   <div class="field"><label>Parcelas</label><input class="inp num" type="number" min="1" max="48" id="gParc" value="${g.parcelas||1}"></div></div>
   <div class="field"><label>Descrição (opcional)</label><input class="inp" id="gDesc" value="${esc(g.descricao)}" placeholder="Ex.: Feira, Uber, Netflix"></div>
   <label style="display:flex;gap:8px;align-items:center;margin-bottom:20px;cursor:pointer" class="small"><input type="checkbox" id="gRec" ${g.recorrente?'checked':''}> Gasto fixo — repetir todo mês</label>
   <button class="btn pri" style="width:100%" data-saveg="${g.id||''}">${novo?'Adicionar gasto':'Salvar'}</button>`);
  const vi=document.getElementById('gVal');
  vi.addEventListener('input',()=>{const v=parseVal(vi.value);vi.value=maskVal(v)});
  // VA sugere Mercado
  document.getElementById('gOrig').onclick=e=>{const b=e.target.closest('[data-o]');if(!b)return;_gf.carteira=b.dataset.o;[...e.currentTarget.children].forEach(x=>x.classList.toggle('on',x===b));
    if(_gf.carteira==='va'){const m=S.categorias.find(c=>/mercado/i.test(c.nome));if(m){_gf.categoria=m.id;document.querySelectorAll('#gCats .chip').forEach(x=>x.classList.toggle('on',x.dataset.c===m.id))}}};
  document.getElementById('gCats').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;_gf.categoria=b.dataset.c;document.querySelectorAll('#gCats .chip').forEach(x=>x.classList.toggle('on',x===b))};
}
function saveGasto(id){
  const valor=parseVal(document.getElementById('gVal').value);
  if(!valor){document.getElementById('gVal').focus();toast('Informe o valor');return}
  const data=document.getElementById('gData').value||today();
  const parc=Math.max(1,parseInt(document.getElementById('gParc').value)||1);
  const g={id:id||uid(),valor,categoria:_gf.categoria,carteira:_gf.carteira,data,descricao:document.getElementById('gDesc').value.trim(),recorrente:document.getElementById('gRec').checked&&parc===1,parcelas:parc};
  const prev=JSON.stringify(S);
  if(id){const i=S.gastos.findIndex(x=>x.id===id);S.gastos[i]={...S.gastos[i],...g}}else S.gastos.push(g);
  save();closeModal();mes=ym(data);render();toast(id?'Gasto atualizado':`Gasto de ${brl(valor)} adicionado`,prev);
}

function rendaForm(r){
  const novo=!r;r=r||{descricao:'Salário',valor:0,tipo:'salario',carteira:'conta',recorrente:true,dia:5,data:today(),inicio:mes};
  window._rf={...r};
  openModal(mh(novo?'Nova renda':'Editar renda')+`
   ${novo?`<div class="seg" style="margin-bottom:20px"><button data-new="gasto">Gasto</button><button class="on">Renda</button></div>`:''}
   <div style="text-align:center;margin-bottom:20px"><div class="cap">Valor líquido</div><div style="display:flex;align-items:baseline;justify-content:center;gap:6px"><span style="color:var(--t2);font-size:20px">R$</span><input class="amount-inp" id="rVal" inputmode="numeric" placeholder="0,00" value="${maskVal(r.valor)}" autofocus style="width:auto;max-width:260px;color:var(--pos)"></div></div>
   <div class="field"><label>Tipo</label><div class="seg" id="rTipo"><button data-t="salario" class="${r.tipo==='salario'?'on':''}">Salário</button><button data-t="beneficio" class="va ${r.tipo==='beneficio'?'on':''}">VA / VR</button><button data-t="extra" class="${r.tipo==='extra'?'on':''}">Extra</button></div></div>
   <div class="field"><label>Descrição</label><input class="inp" id="rDesc" value="${esc(r.descricao)}"></div>
   <div id="rRecBox" style="${r.tipo==='extra'?'display:none':''}"><div class="row"><div class="field"><label>Dia do crédito</label><input class="inp num" type="number" min="1" max="31" id="rDia" value="${r.dia||5}"></div>
    <div class="field"><label>A partir de</label><input class="inp" type="month" id="rIni" value="${r.inicio||mes}"></div></div>
    ${!novo&&r.recorrente?`<label class="small" style="display:flex;gap:8px;align-items:center;margin-bottom:16px;cursor:pointer"><input type="checkbox" id="rReaj" checked> Mudou de valor? Registrar como reajuste a partir de ${mesNome(mes)}</label>`:''}</div>
   <div id="rExtBox" style="${r.tipo==='extra'?'':'display:none'}"><div class="field"><label>Data</label><input class="inp" type="date" id="rData" value="${r.data||today()}"></div></div>
   <button class="btn pri" style="width:100%" data-saver="${r.id||''}">${novo?'Adicionar renda':'Salvar'}</button>`);
  const vi=document.getElementById('rVal');vi.addEventListener('input',()=>{vi.value=maskVal(parseVal(vi.value))});
  document.getElementById('rTipo').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;_rf.tipo=b.dataset.t;[...e.currentTarget.children].forEach(x=>x.classList.toggle('on',x===b));
    const ext=_rf.tipo==='extra';document.getElementById('rRecBox').style.display=ext?'none':'';document.getElementById('rExtBox').style.display=ext?'':'none';
    const d=document.getElementById('rDesc');if(novo)d.value={salario:'Salário',beneficio:'Vale-alimentação',extra:''}[_rf.tipo];vi.style.color=_rf.tipo==='beneficio'?'var(--va)':'var(--pos)'};
}
function saveRenda(id){
  const valor=parseVal(document.getElementById('rVal').value);
  if(!valor){toast('Informe o valor');return}
  const tipo=_rf.tipo,rec=tipo!=='extra';
  const desc=document.getElementById('rDesc').value.trim()||({salario:'Salário',beneficio:'Benefício',extra:'Renda extra'})[tipo];
  const prev=JSON.stringify(S);
  const base={descricao:desc,valor,tipo,carteira:tipo==='beneficio'?'va':'conta',recorrente:rec};
  if(rec){base.dia=Math.min(31,Math.max(1,parseInt(document.getElementById('rDia').value)||1));base.inicio=document.getElementById('rIni').value||mes}
  else base.data=document.getElementById('rData').value||today();
  if(id){
    const old=S.rendas.find(x=>x.id===id);const reaj=document.getElementById('rReaj');
    if(reaj&&reaj.checked&&old.recorrente&&rec&&old.valor!==valor&&mdiff(old.inicio,mes)>0){
      // encerra a antiga no mês anterior e cria nova a partir do mês atual, com histórico
      old.fim=addM(mes,-1);
      S.rendas.push({...base,id:uid(),inicio:mes,historico:[...(old.historico||[]),{mes,de:old.valor,para:valor}]});
      old.oculta=true;
    }else Object.assign(old,base);
  }else S.rendas.push({id:uid(),...base});
  save();closeModal();render();toast(id?'Renda atualizada':'Renda adicionada',prev);
}

function catForm(c){
  const novo=!c;c=c||{nome:'',icone:'•',cor:PAL[S.categorias.length%PAL.length],orcamento:0};
  window._cf={...c};
  const ems=['🏠','🛒','🍽️','🚌','💊','🎮','📺','📚','🛍️','•','☕','🐶','✈️','🎁','💡','⛽','👶','💪','💼','🍺'];
  openModal(mh(novo?'Nova categoria':'Editar categoria')+`
   <div class="field"><label>Nome</label><input class="inp" id="cNome" value="${esc(c.nome)}" autofocus></div>
   <div class="field"><label>Ícone</label><div class="chips" id="cIco" style="grid-template-columns:repeat(10,1fr)">${ems.map(e=>`<button class="chip ${c.icone===e?'on':''}" data-e="${e}" style="justify-content:center;padding:6px 0">${e}</button>`).join('')}</div></div>
   <div class="field"><label>Cor</label><div style="display:flex;gap:8px;flex-wrap:wrap" id="cCor">${PAL.map(p=>`<button data-p="${p}" aria-label="Cor ${p}" style="width:32px;height:32px;border-radius:999px;background:${p};border:2px solid ${c.cor===p?'#FAFAFA':'transparent'};cursor:pointer"></button>`).join('')}</div></div>
   <div class="field"><label>Orçamento mensal (opcional)</label><input class="inp num" id="cOrc" inputmode="numeric" placeholder="R$ 0,00" value="${maskVal(c.orcamento)}"><span class="small">Alerta em 80% e 100%.</span></div>
   <button class="btn pri" style="width:100%" data-savec="${c.id||''}">${novo?'Criar categoria':'Salvar'}</button>`);
  const oi=document.getElementById('cOrc');oi.addEventListener('input',()=>{oi.value=maskVal(parseVal(oi.value))});
  document.getElementById('cIco').onclick=e=>{const b=e.target.closest('[data-e]');if(!b)return;_cf.icone=b.dataset.e;document.querySelectorAll('#cIco .chip').forEach(x=>x.classList.toggle('on',x===b))};
  document.getElementById('cCor').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;_cf.cor=b.dataset.p;document.querySelectorAll('#cCor button').forEach(x=>x.style.borderColor=x===b?'#FAFAFA':'transparent')};
}
function saveCat(id){
  const nome=document.getElementById('cNome').value.trim();if(!nome){toast('Dê um nome');return}
  const prev=JSON.stringify(S);
  const c={nome,icone:_cf.icone,cor:_cf.cor,orcamento:parseVal(document.getElementById('cOrc').value)};
  if(id)Object.assign(S.categorias.find(x=>x.id===id),c);else S.categorias.push({id:uid(),...c});
  save();closeModal();render();toast('Categoria salva',prev);
}

/* ---------- toast com desfazer ---------- */
let tTimer,undoSnap=null;
function toast(msg,snap){
  const t=document.getElementById('toast');document.getElementById('toastMsg').textContent=msg;
  undoSnap=snap||null;document.getElementById('toastUndo').style.display=snap?'':'none';
  t.classList.add('open');clearTimeout(tTimer);tTimer=setTimeout(()=>t.classList.remove('open'),5000);
}
document.getElementById('toastUndo').onclick=()=>{if(undoSnap){S=JSON.parse(undoSnap);save();render()}document.getElementById('toast').classList.remove('open')};

/* ---------- confirmação ---------- */
function confirmar(msg,ok){openModal(mh('Tem certeza?')+`<p class="small" style="margin-bottom:20px">${msg}</p><div class="row"><button class="btn sec" data-close>Cancelar</button><button class="btn danger" id="okBtn">Confirmar</button></div>`);document.getElementById('okBtn').onclick=()=>{closeModal();ok()}}

