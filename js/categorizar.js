/* ---------- categorização rápida: gastos que estão em "Outros" ---------- */
const normTxt=t=>(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
const semCat=g=>{const c=S.categorias.find(x=>x.id===g.categoria);return !c||normTxt(c.nome)==='outros'};
const qtdOutros=()=>S.gastos.filter(semCat).length;
let catPular=new Set(),catAtual=null;
// agrupa por descrição: uma decisão resolve todos os lançamentos com o mesmo nome
function filaCategorizar(){
  const grupos={};
  S.gastos.filter(semCat).forEach(g=>{const k=normTxt(g.descricao)||'#'+g.id;(grupos[k]=grupos[k]||[]).push(g)});
  return Object.entries(grupos).filter(([k])=>!catPular.has(k))
    .map(([k,L])=>({k,L:L.sort((a,b)=>b.data.localeCompare(a.data))}))
    .sort((a,b)=>b.L.length-a.L.length||b.L[0].data.localeCompare(a.L[0].data));
}
function categorizar(){
  const fila=filaCategorizar();
  if(!fila.length){
    closeModal();const n=qtdOutros();
    toast(n?`Restam ${n} em Outros que você pulou`:'Tudo categorizado 🎉');return;
  }
  const gr=fila[0],g=gr.L[0];catAtual=gr.k;
  const total=gr.L.reduce((t,x)=>t+x.valor,0);
  const sug=PP_CATS.map(([re,nome])=>re.test(normTxt(g.descricao))?S.categorias.find(c=>normTxt(c.nome)===normTxt(nome)):null).find(Boolean);
  const opcoes=S.categorias.map(c=>`<option value="${c.id}" ${sug&&sug.id===c.id?'selected':''}>${c.icone} ${esc(c.nome)}</option>`).join('');
  openModal(mh('Categorizar')+`
   <p class="small" style="margin-bottom:16px">${fila.length} nome${fila.length>1?'s':''} em Outros para revisar</p>
   <div class="small" style="margin-bottom:16px;padding:10px 12px;border:1px solid var(--border);border-radius:8px">
    <b style="color:var(--t1)">${gr.L.length} lançamento${gr.L.length>1?'s':''}</b> · <span class="num">${brl(total)}</span>
    ${gr.L.slice(0,3).map(x=>`<div class="num" style="display:flex;justify-content:space-between"><span>${dataBR(x.data)}</span><span>${fmt(x.valor)}</span></div>`).join('')}
    ${gr.L.length>3?`<div class="muted">+ ${gr.L.length-3} mais</div>`:''}</div>
   <div class="field"><label>Nome</label><input class="inp" id="ctNome" value="${esc(g.descricao)}" autofocus></div>
   <div class="field"><label>Categoria</label><select class="inp" id="ctCat">${sug?'':'<option value="">Escolha…</option>'}${opcoes}</select></div>
   ${gr.L.length>1?`<label class="small" style="display:flex;gap:8px;align-items:center;margin-bottom:16px;cursor:pointer"><input type="checkbox" id="ctTodos" checked> Aplicar aos ${gr.L.length} lançamentos com esse nome</label>`:''}
   <div class="row"><button class="btn sec" data-ctpular>Pular</button><button class="btn pri" data-ctsalvar>Salvar e próximo</button></div>`);
}
function ctSalvar(){
  const gr=filaCategorizar().find(x=>x.k===catAtual);if(!gr){categorizar();return}
  const catId=document.getElementById('ctCat').value;
  if(!catId){toast('Escolha a categoria');return}
  const nome=document.getElementById('ctNome').value.trim();
  const todos=document.getElementById('ctTodos');
  const alvo=!todos||todos.checked?gr.L:[gr.L[0]];
  alvo.forEach(g=>{g.categoria=catId;if(nome)g.descricao=nome});
  const c=S.categorias.find(x=>x.id===catId);
  if(c&&normTxt(c.nome)==='outros')catPular.add(normTxt(nome)||catAtual); // escolheu Outros de propósito: não pergunta de novo
  save();render();categorizar();
}
function ctPular(){catPular.add(catAtual);categorizar()}
