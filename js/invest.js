/* ---------- investimentos ---------- */
const TIPOS=['CDB','LCI','LCA','Tesouro Direto','Poupança','Fundo','Ações','FII','Cripto','Outro'];
const IDX={cdi:'% do CDI',pre:'% a.a. (pré)',prem:'% a.m.',ipca:'IPCA + % a.a.',manual:'Atualizo o saldo na mão'};
const ISENTOS=['LCI','LCA','Poupança'];
function taxaAnual(a){const I=S.invest;
  if(a.indexador==='cdi')return I.cdi/100*a.taxa/100;
  if(a.indexador==='pre')return a.taxa/100;
  if(a.indexador==='prem')return Math.pow(1+a.taxa/100,12)-1;
  if(a.indexador==='ipca')return (1+I.ipca/100)*(1+a.taxa/100)-1;
  return null;}
const dias=(d1,d2)=>Math.max(0,Math.round((new Date(d2+'T12:00')-new Date(d1+'T12:00'))/864e5));
const aliqIR=d=>d<=180?.225:d<=360?.20:d<=720?.175:.15;
function avaliar(a,ate){
  ate=ate||today();const r=taxaAnual(a);let aplicado=0,bruto=0,ir=0;
  for(const m of a.movs){if(m.data>ate)continue;aplicado+=m.valor;
    if(r===null){bruto+=m.valor;continue}
    const d=dias(m.data,ate),v=m.valor*Math.pow(1+r,d/365),g=v-m.valor;bruto+=v;if(!a.isento&&g>0)ir+=g*aliqIR(d)}
  if(r===null&&a.saldoManual!=null&&a.saldoManual!=='')bruto=+a.saldoManual;
  const liquido=bruto-ir;
  const mensal=r===null?null:liquido*(Math.pow(1+r,1/12)-1)*(a.isento?1:1-aliqIR(365));
  return {aplicado,bruto,ir,liquido,rend:liquido-aplicado,r,mensal};}
const fmtN=v=>String(+(+v).toFixed(2)).replace('.',',');
const pNum=s=>parseFloat(String(s).replace(/\./g,'').replace(',','.'))||0;
const fmtTaxa=a=>a.indexador==='manual'?'Saldo manual':a.indexador==='cdi'?`${fmtN(a.taxa)}% do CDI`:a.indexador==='pre'?`${fmtN(a.taxa)}% a.a.`:a.indexador==='prem'?`${fmtN(a.taxa)}% a.m.`:`IPCA + ${fmtN(a.taxa)}%`;
function investimentos(){
  const IV=S.invest,A=IV.ativos.map(a=>({a,...avaliar(a)}));
  const tot=A.reduce((s,x)=>s+x.liquido,0),apl=A.reduce((s,x)=>s+x.aplicado,0),rend=tot-apl,mens=A.reduce((s,x)=>s+(x.mensal||0),0);
  const aporteMes=IV.ativos.flatMap(a=>a.movs).filter(d=>!d.inicial&&ym(d.data)===mes&&d.valor>0).reduce((s,d)=>s+d.valor,0);
  const pm=IV.metaMensal?aporteMes/IV.metaMensal*100:0;
  const porTipo={};A.forEach(x=>porTipo[x.a.tipo]=(porTipo[x.a.tipo]||0)+x.liquido);
  const tipos=Object.entries(porTipo).sort((a,b)=>b[1]-a[1]);const cor=i=>PAL[i%PAL.length];
  let donut='';if(tot>0){let acc=0;const R=60,C=2*Math.PI*R;
    donut=`<div class="donut-wrap"><svg width="160" height="160" viewBox="0 0 160 160"><circle r="${R}" cx="80" cy="80" fill="none" stroke="#262626" stroke-width="18"/>${tipos.map(([t,v],i)=>{const len=v/tot*C;const c=`<circle r="${R}" cx="80" cy="80" fill="none" stroke="${cor(i)}" stroke-width="18" stroke-dasharray="${Math.max(len-2,.5)} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 80 80)" ${dtip(t,brl(v)+' · '+(v/tot*100).toFixed(1)+'%')}/>`;acc+=len;return c}).join('')}</svg>
    <div class="legend">${tipos.map(([t,v],i)=>`<div><i style="background:${cor(i)}"></i><span>${t}</span><span class="num">${(v/tot*100).toFixed(0)}%</span></div>`).join('')}</div></div>`}
  const card=x=>{const a=x.a;const venc=a.vencimento?` · vence ${dataBR(a.vencimento)}/${a.vencimento.slice(2,4)}`:'';
    return `<div class="card c6"><div class="card-h" style="margin-bottom:12px"><div style="min-width:0"><b style="font-weight:600;display:block">${esc(a.nome)}</b><span class="small">${a.tipo}${a.instituicao?' · '+esc(a.instituicao):''}${venc}</span></div>
     <div style="display:flex"><button class="icon-btn" data-edit-a="${a.id}" aria-label="Editar">${I.edit}</button><button class="icon-btn" data-del-a="${a.id}" aria-label="Excluir">${I.trash}</button></div></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"><span class="tag" style="margin:0;background:rgba(198,244,50,.12);color:var(--accent)">${fmtTaxa(a)}</span>${x.r!==null?`<span class="tag" style="margin:0;background:var(--bg);color:var(--t2)">≈ ${(x.r*100).toFixed(2).replace('.',',')}% a.a.</span>`:''}${a.isento?`<span class="tag" style="margin:0;background:rgba(34,197,94,.12);color:var(--pos)">Isento de IR</span>`:''}</div>
     <div class="num" style="font-size:28px;font-weight:600;line-height:36px">${money(x.liquido)}</div>
     <div class="small num" style="display:flex;gap:16px;flex-wrap:wrap;margin-top:4px"><span>Aplicado ${fmt(x.aplicado)}</span><span style="color:${x.rend>=0?'var(--pos)':'var(--neg)'}">Rendeu ${fmt(x.rend,true)}</span>${x.mensal!=null?`<span>≈ ${fmt(x.mensal)}/mês</span>`:''}</div>
     <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn pri" style="flex:1" data-aporte="${a.id}" data-sinal="1">${I.plus}Aportar</button><button class="btn sec" data-aporte="${a.id}" data-sinal="-1">Resgatar</button>${a.indexador==='manual'?`<button class="btn sec" data-saldo-a="${a.id}">Atualizar saldo</button>`:''}</div></div>`};
  return `<div class="top"><h1>Investimentos</h1><div style="display:flex;gap:8px;flex-wrap:wrap">${monthPicker()}<button class="btn pri" data-new="ativo">${I.plus}Novo investimento</button></div></div>
  <div class="grid">
   <div class="card stat c4"><div class="cap">Patrimônio investido</div><div class="val">${money(tot)}</div><span class="small">líquido de IR estimado</span></div>
   <div class="card stat c4"><div class="cap">Rendimento acumulado</div><div class="val" style="color:${rend>=0?'var(--pos)':'var(--neg)'}">${money(rend,true)}</div><span class="small num">sobre ${brl(apl)} aplicados</span></div>
   <div class="card stat c4"><div class="cap">Rende por mês (estim.)</div><div class="val">${money(mens)}</div><span class="small">no ritmo atual, já sem IR</span></div>
   <div class="card c6"><div class="card-h"><h2>Meta de aporte do mês</h2><button class="link" data-meta-inv>${IV.metaMensal?'Editar':'Definir'}</button></div>
    ${IV.metaMensal?`<div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span class="num" style="font-size:28px;font-weight:600">${money(aporteMes)}</span><span class="small num">de ${brl(IV.metaMensal)} em ${mesNome(mes)}</span><span class="num" style="margin-left:auto;font-weight:600;color:${pm>=100?'var(--pos)':'var(--accent)'}">${pm.toFixed(0)}%</span></div><div class="bar" style="height:10px"><i style="width:${Math.min(pm,100)}%;background:${pm>=100?'var(--pos)':'var(--accent)'}"></i></div><p class="small" style="margin-top:10px">${pm>=100?'🎉 Meta do mês batida!':`Faltam ${brl(IV.metaMensal-aporteMes)} para bater a meta`}</p>`
    :`<p class="small">Quanto você quer investir todo mês? Os aportes do mês contam para a meta e saem do saldo disponível.</p><button class="btn sec" style="margin-top:12px" data-meta-inv>Definir meta mensal</button>`}</div>
   <div class="card c6"><div class="card-h"><h2>Onde está o dinheiro</h2></div>${donut||'<div class="empty" style="padding:16px">Sem investimentos ainda.</div>'}</div>
   ${A.length?A.sort((x,y)=>y.liquido-x.liquido).map(card).join(''):`<div class="card c12 empty"><h2>Cadastre seu primeiro investimento</h2><p class="hint">Ex.: “R$ 10.000 numa LCI a 121% do CDI”. O app estima quanto rende e já desconta o IR quando houver.</p><button class="btn pri" data-new="ativo">${I.plus}Novo investimento</button></div>`}
   <div class="card c12"><div class="card-h"><h2>Taxas de referência</h2><button class="link" data-taxas>Editar</button></div><p class="small num">CDI ${fmtN(IV.cdi)}% a.a. · IPCA ${fmtN(IV.ipca)}% a.a. — usadas nas estimativas. Rendimentos são aproximados (juros compostos por dias corridos, IR pela tabela regressiva) e podem diferir do extrato do banco.</p></div>
  </div>`;
}
function ativoForm(a){
  const novo=!a;a=a||{nome:'',tipo:'CDB',instituicao:'',indexador:'cdi',taxa:100,isento:false,vencimento:'',movs:[]};
  openModal(mh(novo?'Novo investimento':'Editar investimento')+`
   <div class="field"><label>Tipo</label><select class="inp" id="aTipo">${TIPOS.map(t=>`<option ${a.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
   <div class="row"><div class="field"><label>Nome</label><input class="inp" id="aNome" value="${esc(a.nome)}" placeholder="Ex.: LCI Inter 2028" autofocus></div>
   <div class="field"><label>Banco/corretora</label><input class="inp" id="aInst" value="${esc(a.instituicao||'')}" placeholder="Opcional"></div></div>
   <div class="field"><label>Como rende</label><select class="inp" id="aIdx">${Object.entries(IDX).map(([k,t])=>`<option value="${k}" ${a.indexador===k?'selected':''}>${t}</option>`).join('')}</select></div>
   <div class="field" id="aTaxaBox"><label id="aTaxaLbl">Taxa</label><input class="inp num" id="aTaxa" inputmode="decimal" value="${fmtN(a.taxa)}"><span class="small" id="aTaxaHint"></span></div>
   ${novo?`<div class="row"><div class="field"><label>Valor aplicado</label><input class="inp num" id="aVal" inputmode="numeric" placeholder="R$ 0,00"></div><div class="field"><label>Data da aplicação</label><input class="inp" type="date" id="aData" value="${today()}"></div></div>
   <label class="small" style="display:flex;gap:8px;align-items:center;margin:-4px 0 16px;cursor:pointer"><input type="checkbox" id="aIni" checked> Dinheiro que já estava investido (não desconta do saldo do mês)</label>`:''}
   <div class="row"><div class="field"><label>Vencimento (opcional)</label><input class="inp" type="date" id="aVenc" value="${a.vencimento||''}"></div>
   <div class="field"><label>Imposto de renda</label><label class="small" style="display:flex;gap:8px;align-items:center;height:40px;cursor:pointer"><input type="checkbox" id="aIsento" ${a.isento?'checked':''}> Isento de IR</label></div></div>
   <button class="btn pri" style="width:100%" data-savea="${a.id||''}">${novo?'Adicionar':'Salvar'}</button>`);
  const v=document.getElementById('aVal');v&&v.addEventListener('input',()=>{v.value=maskVal(parseVal(v.value))});
  const upd=()=>{const k=document.getElementById('aIdx').value;document.getElementById('aTaxaBox').style.display=k==='manual'?'none':'';
    document.getElementById('aTaxaLbl').textContent={cdi:'Percentual do CDI (%)',pre:'Taxa ao ano (%)',prem:'Taxa ao mês (%)',ipca:'Taxa acima do IPCA (% a.a.)'}[k]||'Taxa';
    const r=taxaAnual({indexador:k,taxa:pNum(document.getElementById('aTaxa').value)});
    document.getElementById('aTaxaHint').textContent=r!=null?`≈ ${(r*100).toFixed(2).replace('.',',')}% ao ano hoje`:''};
  ['aIdx','aTaxa'].forEach(i=>document.getElementById(i).addEventListener('input',upd));document.getElementById('aIdx').addEventListener('change',upd);upd();
  document.getElementById('aTipo').addEventListener('change',e=>{document.getElementById('aIsento').checked=ISENTOS.includes(e.target.value);
    if(['Ações','FII','Cripto','Fundo'].includes(e.target.value)){document.getElementById('aIdx').value='manual';upd()}});
  if(novo)document.getElementById('aIsento').checked=ISENTOS.includes(a.tipo);
}
function saveAtivo(id){
  const tipo=document.getElementById('aTipo').value;
  const base={nome:document.getElementById('aNome').value.trim()||tipo,tipo,instituicao:document.getElementById('aInst').value.trim(),indexador:document.getElementById('aIdx').value,taxa:pNum(document.getElementById('aTaxa').value),isento:document.getElementById('aIsento').checked,vencimento:document.getElementById('aVenc').value};
  const prev=JSON.stringify(S);
  if(id)Object.assign(S.invest.ativos.find(x=>x.id===id),base);
  else{const v=parseVal(document.getElementById('aVal').value);if(!v){toast('Informe o valor aplicado');return}
    const a={id:uid(),...base,movs:[{valor:v,data:document.getElementById('aData').value||today(),inicial:document.getElementById('aIni').checked}]};
    if(base.indexador==='manual')a.saldoManual=v;S.invest.ativos.push(a)}
  save();closeModal();render();toast(id?'Investimento atualizado':'Investimento adicionado',prev);
}
function aporteForm(id,sinal){
  const a=S.invest.ativos.find(x=>x.id===id);
  openModal(mh(`${sinal>0?'Aportar em':'Resgatar de'} ${esc(a.nome)}`)+`
   <div style="text-align:center;margin-bottom:20px"><div style="display:flex;align-items:baseline;justify-content:center;gap:6px"><span style="color:var(--t2);font-size:20px">R$</span><input class="amount-inp" id="apVal" inputmode="numeric" placeholder="0,00" autofocus style="width:auto;max-width:260px;color:${sinal>0?'var(--accent)':'var(--neg)'}"></div>
   <p class="small">${sinal>0?'Conta para a meta de aporte e sai do saldo disponível':'Volta para o saldo disponível do mês'}</p></div>
   <div class="field"><label>Data</label><input class="inp" type="date" id="apData" value="${mes===ym(today())?today():mes+'-01'}"></div>
   <button class="btn pri" style="width:100%" data-saveap="${id}" data-sinal="${sinal}">${sinal>0?'Aportar':'Resgatar'}</button>`);
  const el=document.getElementById('apVal');el.addEventListener('input',()=>{el.value=maskVal(parseVal(el.value))});
}
function saveAporte(id,sinal){
  const v=parseVal(document.getElementById('apVal').value);if(!v){toast('Informe o valor');return}
  const a=S.invest.ativos.find(x=>x.id===id),ev=avaliar(a);
  if(sinal<0&&v>ev.liquido+0.01){toast('Valor maior que o saldo');return}
  const prev=JSON.stringify(S);
  // resgate: abate o principal na proporção do saldo (aproximação)
  const val=sinal>0?v:-(ev.liquido>0?v*ev.aplicado/ev.liquido:v);
  a.movs.push({valor:val,data:document.getElementById('apData').value||today()});
  if(a.indexador==='manual'&&a.saldoManual!=null)a.saldoManual=Math.max(0,(+a.saldoManual)+(sinal>0?v:-v));
  save();closeModal();render();toast(`${sinal>0?'Aporte':'Resgate'} de ${brl(v)} registrado`,prev);
}
const maskInput=id=>{const el=document.getElementById(id);el.addEventListener('input',()=>{el.value=maskVal(parseVal(el.value))})};
function saldoForm(id){const a=S.invest.ativos.find(x=>x.id===id);
  openModal(mh(`Saldo atual de ${esc(a.nome)}`)+`<p class="small" style="margin-bottom:16px">Copie o valor que aparece hoje na corretora.</p><div class="field"><input class="inp num" id="sdVal" inputmode="numeric" value="${maskVal(+a.saldoManual||0)}" autofocus></div><button class="btn pri" style="width:100%" data-savesd="${id}">Salvar</button>`);maskInput('sdVal')}
function metaInvForm(){openModal(mh('Meta de aporte mensal')+`<div class="field"><label>Quanto quero investir por mês</label><input class="inp num" id="miVal" inputmode="numeric" value="${maskVal(S.invest.metaMensal)}" placeholder="R$ 0,00" autofocus></div><button class="btn pri" style="width:100%" data-savemi>Salvar</button>`);maskInput('miVal')}
function taxasForm(){openModal(mh('Taxas de referência')+`<div class="row"><div class="field"><label>CDI (% a.a.)</label><input class="inp num" id="txCdi" inputmode="decimal" value="${fmtN(S.invest.cdi)}"></div><div class="field"><label>IPCA 12 meses (%)</label><input class="inp num" id="txIpca" inputmode="decimal" value="${fmtN(S.invest.ipca)}"></div></div><p class="small" style="margin-bottom:16px">O CDI fica cerca de 0,10 ponto abaixo da Selic. Atualize quando o Copom mudar a taxa.</p><button class="btn pri" style="width:100%" data-savetx>Salvar</button>`)}

function config(){
  return `<div class="top"><h1>Configurações</h1></div>
  <div class="grid">
   <div class="card c6"><h2 style="margin-bottom:16px">Perfil</h2>
    <div class="field"><label>Seu nome</label><input class="inp" id="cfgNome" value="${esc(S.usuario.nome)}" placeholder="Opcional"></div>
    <div class="field"><label>Dia de virada do mês</label><input class="inp num" id="cfgDia" type="number" min="1" max="28" value="${S.usuario.diaVirada}"><span class="small">Usado como referência; o mês do app segue o calendário.</span></div>
    <button class="btn pri" data-savecfg>Salvar</button></div>
   <div class="card c6"><h2 style="margin-bottom:8px">Dados</h2><div style="margin-bottom:8px">${syncBadge()}</div>${sbUser?`<p class="small" style="margin-bottom:12px">Conectado como <b style="color:var(--t1)">${esc(sbUser.email)}</b>. Seus dados ficam salvos no Supabase e aparecem em qualquer aparelho onde você entrar. Só você tem acesso.</p><button class="btn sec" data-sair style="margin-bottom:16px">Sair</button>`
 :`<p class="small" style="margin-bottom:12px">Entre com seu e-mail para salvar na nuvem e usar em vários aparelhos. Você recebe um link de acesso, sem senha.</p><div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap"><input class="inp" id="loginEmail" type="email" placeholder="seu@email.com" style="flex:1;min-width:180px"><button class="btn pri" data-entrar>Entrar</button></div>`}
 <p class="small" style="margin-bottom:16px">O backup abaixo é uma cópia extra de segurança.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn sec" data-copy="json">Copiar backup (JSON)</button><button class="btn sec" data-copy="csv">Copiar gastos (CSV)</button></div>
    <textarea class="inp" id="impTxt" placeholder="Cole aqui um backup JSON para restaurar"></textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn sec" data-import>Restaurar backup</button><label class="btn ghost" style="cursor:pointer">Abrir arquivo…<input type="file" id="impFile" accept=".json,.txt" hidden></label></div></div>
   <div class="card c12"><h2 style="margin-bottom:8px">Importar planilha (Notion, Excel, PicPay, CSV)</h2><p class="small" style="margin-bottom:16px">Extrato do PicPay (.csv) é reconhecido sozinho: compras, Pix e pagamentos viram gastos, Pix/transferências recebidos viram rendas extras e movimentos do cofrinho são ignorados. Para outras planilhas, use um .csv com colunas como Descrição, Custo/Valor, Data e Categoria. Categorias novas são criadas e lançamentos repetidos são ignorados. Todos entram como pagos com a Conta.</p>
    <label class="btn pri" style="cursor:pointer">Escolher arquivo CSV…<input type="file" id="csvFile" accept=".csv,text/csv" hidden></label></div>
   <div class="card c12"><h2 style="margin-bottom:8px">Zona de perigo</h2><p class="small" style="margin-bottom:16px">Apaga todos os lançamentos, rendas e categorias personalizadas.</p><button class="btn danger" data-reset>Apagar tudo</button></div>
  </div>`;
}

