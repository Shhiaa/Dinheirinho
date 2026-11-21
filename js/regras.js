/* ---------- regras de importação: se o nome combina com o padrão (regex), usa esta categoria ---------- */
// S.regras = [{id, padrao, categoria, nome?}] — vale a primeira que combinar
function regraPara(desc){
  for(const r of S.regras||[]){
    let re;try{re=new RegExp(r.padrao,'i')}catch(e){continue}
    if(re.test(desc||'')||re.test(normTxt(desc)))return r;
  }
  return null;
}
function regrasCard(){
  const L=S.regras||[];
  const row=r=>{const c=S.categorias.find(x=>x.id===r.categoria);
    return `<div class="item"><div class="dot" style="background:rgba(139,124,246,.15);color:var(--va)">⚙</div>
     <div class="meta"><b><code style="font-family:ui-monospace,monospace;font-size:13px">${esc(r.padrao)}</code></b>
      <span class="small">→ ${c?`${c.icone} ${esc(c.nome)}`:'<span style="color:var(--neg)">categoria apagada</span>'}${r.nome?` · nome “${esc(r.nome)}”`:''}</span></div>
     <div class="acts"><button class="icon-btn" data-edit-regra="${r.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-del-regra="${r.id}" aria-label="Excluir">${I.trash}</button></div></div>`};
  return `<div class="card c12"><div class="card-h"><h2>Regras de importação</h2><div style="display:flex;gap:8px;flex-wrap:wrap">${L.length&&qtdOutros()?`<button class="btn sec" data-aplicar-regras>Aplicar aos ${qtdOutros()} em Outros</button>`:''}<button class="btn pri" data-new-regra>${I.plus}Nova regra</button></div></div>
   <p class="small" style="margin-bottom:12px">Se o nome do lançamento combinar com o padrão (expressão regular, sem diferenciar maiúsculas nem acentos), ele recebe a categoria escolhida ao importar. Vale a primeira regra da lista, e as suas regras têm prioridade sobre as automáticas.</p>
   ${L.length?L.map(row).join(''):'<div class="empty" style="padding:16px">Nenhuma regra ainda. Exemplo: <code>uber|99 ?pop</code> → Transporte.</div>'}</div>`;
}
function regraForm(r){
  const novo=!r;r=r||{padrao:'',categoria:S.categorias[0]?.id,nome:''};
  openModal(mh(novo?'Nova regra':'Editar regra')+`
   <div class="field"><label>Se o nome combinar com</label><input class="inp" id="rgPad" value="${esc(r.padrao)}" placeholder="ex.: uber|99 ?pop" autofocus style="font-family:ui-monospace,monospace"><span class="small" id="rgInfo"></span></div>
   <div class="field"><label>Categoria</label><select class="inp" id="rgCat">${S.categorias.map(c=>`<option value="${c.id}" ${r.categoria===c.id?'selected':''}>${c.icone} ${esc(c.nome)}</option>`).join('')}</select></div>
   <div class="field"><label>Renomear para (opcional)</label><input class="inp" id="rgNome" value="${esc(r.nome||'')}" placeholder="ex.: Uber"></div>
   <button class="btn pri" style="width:100%" data-saveregra="${r.id||''}">${novo?'Criar regra':'Salvar'}</button>`);
  const inp=document.getElementById('rgPad'),info=document.getElementById('rgInfo');
  const testa=()=>{
    if(!inp.value){info.textContent='';return}
    let re;try{re=new RegExp(inp.value,'i')}catch(e){info.style.color='var(--neg)';info.textContent='Expressão inválida';return}
    const n=S.gastos.filter(g=>re.test(g.descricao||'')||re.test(normTxt(g.descricao))).length;
    info.style.color='';info.textContent=`Combina com ${n} lançamento${n===1?'':'s'} que você já tem`;
  };
  inp.addEventListener('input',testa);testa();
}
function saveRegra(id){
  const padrao=document.getElementById('rgPad').value.trim(),nome=document.getElementById('rgNome').value.trim();
  if(!padrao){toast('Informe o padrão');return}
  try{new RegExp(padrao,'i')}catch(e){toast('Expressão inválida');return}
  const base={padrao,categoria:document.getElementById('rgCat').value,nome};
  if(!S.regras)S.regras=[];
  if(id)Object.assign(S.regras.find(x=>x.id===id),base);else S.regras.push({id:uid(),...base});
  save();closeModal();render();toast(id?'Regra atualizada':'Regra criada');
}
function delRegra(id){
  const r=S.regras.find(x=>x.id===id);
  confirmar(`Excluir a regra <b>${esc(r.padrao)}</b>? Lançamentos já importados não mudam.`,()=>{S.regras=S.regras.filter(x=>x.id!==id);save();render();toast('Regra excluída')});
}
// aplica as regras aos gastos que hoje estão em Outros
function aplicarRegras(){
  let n=0;const prev=JSON.stringify(S);
  S.gastos.filter(semCat).forEach(g=>{const r=regraPara(g.descricao);const c=r&&S.categorias.find(x=>x.id===r.categoria);
    if(c&&normTxt(c.nome)!=='outros'){g.categoria=c.id;if(r.nome)g.descricao=r.nome;n++}});
  save();render();toast(n?`${n} lançamento${n>1?'s':''} categorizado${n>1?'s':''} pelas regras`:'Nenhuma regra combinou com o que está em Outros',n?prev:null);
}
