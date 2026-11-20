/* ---------- eventos ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,label');if(!t)return;const d=t.dataset;
  if(d.close!==undefined&&!d.go)closeModal();
  if(d.go){if(d.close!==undefined)closeModal();go(d.go)}
  else if(d.new==='gasto')gastoForm();
  else if(d.new==='renda')rendaForm();
  else if(d.new==='categoria')catForm();
  else if(d.new==='meta')metaForm();
  else if(d.new==='ativo')ativoForm();
  else if(d.savea!==undefined)saveAtivo(d.savea);
  else if(d.editA)ativoForm(S.invest.ativos.find(x=>x.id===d.editA));
  else if(d.delA){const a=S.invest.ativos.find(x=>x.id===d.delA);confirmar(`Excluir “${esc(a.nome)}” e todo o histórico de aportes?`,()=>{const prev=JSON.stringify(S);S.invest.ativos=S.invest.ativos.filter(x=>x.id!==a.id);save();render();toast('Investimento excluído',prev)})}
  else if(d.saveap)saveAporte(d.saveap,+d.sinal);
  else if(d.aporte)aporteForm(d.aporte,+d.sinal);
  else if(d.saldoA)saldoForm(d.saldoA);
  else if(d.savesd){const prev=JSON.stringify(S);S.invest.ativos.find(x=>x.id===d.savesd).saldoManual=parseVal(document.getElementById('sdVal').value);save();closeModal();render();toast('Saldo atualizado',prev)}
  else if(d.metaInv!==undefined)metaInvForm();
  else if(d.savemi!==undefined){const prev=JSON.stringify(S);S.invest.metaMensal=parseVal(document.getElementById('miVal').value);save();closeModal();render();toast('Meta mensal salva',prev)}
  else if(d.taxas!==undefined)taxasForm();
  else if(d.savetx!==undefined){const prev=JSON.stringify(S);S.invest.cdi=pNum(document.getElementById('txCdi').value)||S.invest.cdi;S.invest.ipca=pNum(document.getElementById('txIpca').value);save();closeModal();render();toast('Taxas atualizadas',prev)}
  else if(d.savem!==undefined)saveMeta(d.savem);
  else if(d.savemov)saveMov(d.savemov,+d.sinal);
  else if(d.mov)movForm(d.mov,+d.sinal);
  else if(d.editM)metaForm(S.metas.find(x=>x.id===d.editM));
  else if(d.delM){const x=S.metas.find(y=>y.id===d.delM);confirmar(`Excluir a meta “${esc(x.nome)}” e todo o histórico dela?`,()=>{const prev=JSON.stringify(S);S.metas=S.metas.filter(y=>y.id!==x.id);save();render();toast('Meta excluída',prev)})}
  else if(d.mes){mes=addM(mes,+d.mes);render()}
  else if(d.ano){mes=addM(mes,12*d.ano);render()}
  else if(d.filtroVa!==undefined){filt={q:'',cat:'',orig:'va',tipo:'g'};go('lancamentos')}
  else if(d.entrar!==undefined)entrar();
  else if(d.sair!==undefined)sair();
  else if(d.modo){dashModo=d.modo;render()}
  else if(d.vermes){mes=d.vermes;dashModo='mes';render();window.scrollTo(0,0)}
  else if(d.saveg!==undefined)saveGasto(d.saveg);
  else if(d.saver!==undefined)saveRenda(d.saver);
  else if(d.savec!==undefined)saveCat(d.savec);
  else if(d.editG)gastoForm(S.gastos.find(x=>x.id===d.editG));
  else if(d.dupG){const g=S.gastos.find(x=>x.id===d.dupG);const prev=JSON.stringify(S);S.gastos.push({...g,id:uid(),recorrente:false,parcelas:1,data:mes===ym(today())?today():g.data});save();render();toast('Gasto duplicado',prev)}
  else if(d.delG){const g=S.gastos.find(x=>x.id===d.delG);const prev=JSON.stringify(S);
    if(g.recorrente&&ym(g.data)!==mes){confirmar('Este é um gasto fixo. Parar de repetir a partir deste mês? Os meses anteriores ficam como estão.',()=>{g.fim=addM(mes,-1);save();render();toast('Gasto fixo encerrado',prev)});return}
    S.gastos=S.gastos.filter(x=>x.id!==d.delG);save();render();toast(g.parcelas>1?'Parcelamento excluído (todas as parcelas)':'Gasto excluído',prev)}
  else if(d.editR)rendaForm(S.rendas.find(x=>x.id===d.editR));
  else if(d.delR){const r=S.rendas.find(x=>x.id===d.delR);const prev=JSON.stringify(S);
    if(r.recorrente&&mdiff(r.inicio,mes)>0){confirmar('Encerrar esta renda a partir deste mês? Os meses anteriores continuam com ela.',()=>{r.fim=addM(mes,-1);save();render();toast('Renda encerrada',prev)});return}
    S.rendas=S.rendas.filter(x=>x.id!==d.delR);save();render();toast('Renda excluída',prev)}
  else if(d.editC)catForm(S.categorias.find(x=>x.id===d.editC));
  else if(d.delC){const c=S.categorias.find(x=>x.id===d.delC);const n=S.gastos.filter(g=>g.categoria===c.id).length;
    if(n){toast(`${c.nome} tem ${n} gasto${n>1?'s':''}; mova-os antes de excluir`);return}
    const prev=JSON.stringify(S);S.categorias=S.categorias.filter(x=>x.id!==c.id);save();render();toast('Categoria excluída',prev)}
  else if(d.rel){window._rel=+d.rel;render()}
  else if(d.demo!==undefined)demo();
  else if(d.savecfg!==undefined){S.usuario.nome=document.getElementById('cfgNome').value.trim();S.usuario.diaVirada=Math.min(28,Math.max(1,+document.getElementById('cfgDia').value||1));save();toast('Configurações salvas')}
  else if(d.copy==='json')copiar(JSON.stringify(S),'Backup copiado');
  else if(d.copy==='csv')copiar(csv(),'CSV copiado — cole no Excel ou Planilhas');
  else if(d.import!==undefined)importar(document.getElementById('impTxt').value);
  else if(d.reset!==undefined)confirmar('Todos os dados serão apagados deste navegador.',()=>{const prev=JSON.stringify(S);S=seed();S.metas=[];S.invest={cdi:13.65,ipca:4.4,metaMensal:0,ativos:[]};save();render();toast('Tudo apagado',prev)});
});
document.addEventListener('input',e=>{
  const id=e.target.id;
  if(id==='fq'){filt.q=e.target.value;const pos=e.target.selectionStart;render();const n=document.getElementById('fq');n.focus();n.setSelectionRange(pos,pos)}
});
document.addEventListener('change',e=>{
  const id=e.target.id;
  if(id==='ft'){filt.tipo=e.target.value;render()}
  if(id==='fc'){filt.cat=e.target.value;render()}
  if(id==='fo'){filt.orig=e.target.value;render()}
  if(id==='impFile'&&e.target.files[0]){e.target.files[0].text().then(importar)}
  if(id==='csvFile'&&e.target.files[0]){e.target.files[0].text().then(importarCSV);e.target.value=''}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='loginEmail'){entrar();return}
  if(e.key==='Enter'&&scrim.classList.contains('open')&&e.target.tagName==='INPUT'){const b=modal.querySelector('.btn.pri');b&&b.click()}});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(NAV.some(n=>n[0]===h)&&h!==view){view=h;render()}});
(()=>{const h=location.hash.slice(1);if(NAV.some(n=>n[0]===h))view=h})();
render();
initCloud();
