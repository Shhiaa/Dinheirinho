/* ---------- dados de exemplo ---------- */
function demo(){
  const prev=JSON.stringify(S);const m=ym(today()),c=n=>S.categorias.find(x=>x.nome===n)?.id;
  S.rendas.push({id:uid(),descricao:'Salário',valor:6500,tipo:'salario',carteira:'conta',recorrente:true,dia:5,inicio:addM(m,-5)},
    {id:uid(),descricao:'Vale-alimentação',valor:900,tipo:'beneficio',carteira:'va',recorrente:true,dia:1,inicio:addM(m,-5)},
    {id:uid(),descricao:'Freela de design',valor:1200,tipo:'extra',carteira:'conta',recorrente:false,data:addM(m,-1)+'-18'});
  S.gastos.push({id:uid(),valor:2100,categoria:c('Moradia'),carteira:'conta',data:addM(m,-5)+'-10',descricao:'Aluguel',recorrente:true,parcelas:1},
    {id:uid(),valor:120,categoria:c('Moradia'),carteira:'conta',data:addM(m,-5)+'-15',descricao:'Internet',recorrente:true,parcelas:1},
    {id:uid(),valor:55.9,categoria:c('Assinaturas'),carteira:'conta',data:addM(m,-5)+'-08',descricao:'Streaming',recorrente:true,parcelas:1},
    {id:uid(),valor:2400,categoria:c('Compras'),carteira:'conta',data:addM(m,-2)+'-20',descricao:'Notebook',parcelas:10});
  const d=+today().slice(8);
  for(let k=0;k<6;k++){const mm=addM(m,-k),lim=k===0?d:28;
    [[c('Mercado'),'va',[180,95,210,140,160]],[c('Restaurantes'),'conta',[62,48,120,35]],[c('Transporte'),'conta',[28,19,45,22,31]],[c('Lazer'),'conta',[90,150]],[c('Saúde'),'conta',[80]]].forEach(([cid,cart,vals])=>vals.forEach((v,j)=>{const day=Math.min(lim,1+Math.floor((j+1)*lim/(vals.length+1)));if(day<1)return;
      S.gastos.push({id:uid(),valor:+(v*(0.85+((k*7+j*3)%10)/30)).toFixed(2),categoria:cid,carteira:cart,data:`${mm}-${String(day).padStart(2,'0')}`,descricao:'',recorrente:false,parcelas:1})}));}
  [['Mercado',900],['Restaurantes',350],['Transporte',200],['Lazer',300]].forEach(([n,v])=>{const x=S.categorias.find(y=>y.nome===n);if(x)x.orcamento=v});
  save();render();toast('Dados de exemplo carregados',prev);
}

/* ---------- export ---------- */
async function copiar(txt,msg){try{await navigator.clipboard.writeText(txt);toast(msg)}catch(e){document.getElementById('impTxt').value=txt;toast('Copie o texto da caixa abaixo')}}
function csv(){const rows=[['data','tipo','descricao','categoria','origem','valor']];
  S.gastos.forEach(g=>rows.push([g.data,'gasto',g.descricao,cat(g.categoria).nome,g.carteira==='va'?'VA':'Conta',(-g.valor).toFixed(2)+(g.parcelas>1?` (${g.parcelas}x)`:'')]));
  S.rendas.forEach(r=>rows.push([r.data||r.inicio,'renda',r.descricao,'',r.carteira==='va'?'VA':'Conta',r.valor.toFixed(2)]));
  return rows.map(r=>r.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(';')).join('\n')}
function importar(txt){try{const d=JSON.parse(txt);if(!d.categorias||!d.gastos||!d.rendas)throw 0;const prev=JSON.stringify(S);S=d;if(!S.metas)S.metas=[];if(!S.invest)S.invest={cdi:13.65,ipca:4.4,metaMensal:0,ativos:[]};save();render();toast('Backup restaurado',prev)}catch(e){toast('Backup inválido')}}

/* ---------- importar CSV (Notion etc.) ---------- */
function parseCSV(t){
  t=t.replace(/^﻿/,'');const sep=(t.split('\n')[0].match(/;/g)||[]).length>(t.split('\n')[0].match(/,/g)||[]).length?';':',';
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===sep){row.push(f);f=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);f='';if(row.some(x=>x.trim()))rows.push(row);row=[]}
    else f+=c}
  row.push(f);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
const MESES={january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12,janeiro:1,fevereiro:2,'março':3,marco:3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};
function parseData(s){
  s=(s||'').trim().split('→')[0].trim();let m;
  if(m=s.match(/^(\d{4})-(\d{2})-(\d{2})/))return `${m[1]}-${m[2]}-${m[3]}`;
  if(m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  if(m=s.match(/^([A-Za-zçÇ]+)\s+(\d{1,2}),\s*(\d{4})/)){const mo=MESES[m[1].toLowerCase()];if(mo)return `${m[3]}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`}
  if(m=s.match(/^(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})/i)){const mo=MESES[m[2].toLowerCase()];if(mo)return `${m[3]}-${String(mo).padStart(2,'0')}-${m[1].padStart(2,'0')}`}
  return null;
}
function parseValor(s){
  s=(s||'').replace(/R\$|\s/g,'').replace(/^-/,'');if(!s)return 0;
  const lc=s.lastIndexOf(','),ld=s.lastIndexOf('.');
  if(lc>ld)s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/,/g,'');
  return Math.round(parseFloat(s)*100)/100||0;
}
function importarCSV(txt){
  const rows=parseCSV(txt);if(rows.length<2){toast('Arquivo vazio');return}
  const H=rows[0].map(h=>h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''));
  if(H.includes('hora')&&H.includes('tipo')&&H.some(h=>h.startsWith('origem'))&&H.includes('valor'))return importarPicpay(rows,H);
  const col=(...ks)=>H.findIndex(h=>ks.some(k=>h.startsWith(k)));
  const cD=col('descricao','nome','name','titulo'),cV=col('custo','valor','preco','amount'),cT=col('data','date'),cC=col('categoria'),cO=col('obs','nota'),cR=col('recorr'),cOr=col('origem','carteira','pago com');
  if(cV<0||cT<0){toast('Não achei as colunas de valor e data');return}
  const prev=JSON.stringify(S);let novos=0,dup=0,ruins=0,novasCats=0;
  const chave=g=>`${g.data}|${g.valor}|${(g.descricao||'').toLowerCase()}`;
  const existentes=new Set(S.gastos.map(chave));
  const ICON={alimentacao:'🍽️',presente:'🎁',lazer:'🎮','instituto/trabalho':'💼',trabalho:'💼',autocuidado:'💅',transporte:'🚌',roupas:'👕',mercado:'🛒',saude:'💊',moradia:'🏠',educacao:'📚',assinaturas:'📺'};
  for(const r of rows.slice(1)){
    const valor=parseValor(r[cV]),data=parseData(r[cT]);
    if(!valor||!data){ruins++;continue}
    let cn=(cC>=0?r[cC]:'').split(',')[0].replace(/\s*\(https?:[^)]*\)/g,'').trim()||'Outros';
    let c=S.categorias.find(x=>x.nome.toLowerCase()===cn.toLowerCase());
    if(!c){const k=cn.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');c={id:uid(),nome:cn,icone:ICON[k]||'•',cor:PAL[S.categorias.length%PAL.length],orcamento:0};S.categorias.push(c);novasCats++}
    let desc=(cD>=0?r[cD]:'').trim();const obs=cO>=0?r[cO].trim():'';if(obs)desc=desc?`${desc} — ${obs}`:obs;
    const rec=cR>=0&&/fix/i.test(r[cR]);const orig=cOr>=0&&/va|vale|alimenta/i.test(r[cOr])?'va':'conta';
    const g={id:uid(),valor,categoria:c.id,carteira:orig,data,descricao:desc,recorrente:rec,parcelas:1};
    if(existentes.has(chave(g))){dup++;continue}
    existentes.add(chave(g));S.gastos.push(g);novos++;
  }
  save();render();
  toast(`${novos} gasto${novos===1?'':'s'} importado${novos===1?'':'s'}${novasCats?`, ${novasCats} categoria${novasCats>1?'s':''} nova${novasCats>1?'s':''}`:''}${dup?`, ${dup} repetido${dup>1?'s':''} ignorado${dup>1?'s':''}`:''}${ruins?`, ${ruins} linha${ruins>1?'s':''} sem valor/data`:''}`,prev);
}


/* ---------- importar extrato do PicPay (CSV) ---------- */
const PP_COFRINHO=['dinheiro guardado','guardado no cofrinho','dinheiro resgatado'];
const PP_SAIDA=['compra realizada','pix enviado','pagamento realizado','recarga realizada'];
const PP_ENTRADA=['pix recebido','transferencia recebida','compra estornada','pix devolvido'];
const PP_CATS=[
  [/uber|99\s?(pop|taxi)|cabify|metro|onibus|bilhete|sptrans|combust|posto|shell|ipiranga/,'Transporte','🚌'],
  [/ifood|ifd\*|keeta|rappi|restaur|lanchon|pizza|burger|padaria|cafe|sorvet|bar\b|mc ?donald|subway/,'Restaurantes','🍽️'],
  [/mercado|atacad|supermerc|assai|carrefour|extra|hortifruti|acougue|sacolao/,'Mercado','🛒'],
  [/farmac|drog|raia|pacheco|hospital|clinica|laborat/,'Saúde','💊'],
  [/netflix|spotify|youtube|disney|prime|hbo|apple\.com|google\s?\*|deezer|assinatura/,'Assinaturas','📺'],
  [/cinema|ingresso|steam|playstation|xbox|game/,'Lazer','🎮'],
  [/faculdade|escola|curso|udemy|livraria/,'Educação','📚']
];
function importarPicpay(rows,H){
  const col=k=>H.findIndex(h=>h.startsWith(k));
  const cD=col('data'),cH=col('hora'),cT=col('tipo'),cO=col('origem'),cV=col('valor');
  const norm=t=>(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
  const prev=JSON.stringify(S);let gs=0,rs=0,dup=0,intern=0,ruins=0,novasCats=0;const salarios=[],cofr=[];
  const refs=new Set([...S.gastos,...S.rendas,...(S.metas||[]).flatMap(m=>m.movs)].flatMap(x=>[x.ref,...(x.refs||[])]).filter(Boolean));
  const getCat=(nome,icone)=>{
    let c=S.categorias.find(x=>norm(x.nome)===norm(nome));
    if(!c){c={id:uid(),nome,icone,cor:PAL[S.categorias.length%PAL.length],orcamento:0};S.categorias.push(c);novasCats++}
    return c};
  // 1) lê as linhas
  const L=[];
  for(const r of rows.slice(1)){
    const tipo=norm(r[cT]),data=parseData(r[cD]),desc=(r[cO]||'').trim(),hora=(r[cH]||'').trim();
    const bruto=(r[cV]||'').trim(),valor=parseValor(bruto.replace(/^[−–+-]/,''));
    if(!data||!valor){ruins++;continue}
    if(PP_COFRINHO.includes(tipo)){
      const m=desc.match(/^(?:No|Do) cofrinho\s+(.+)$/i);
      const nome=m?m[1].trim():/^compra no cr[eé]dito/i.test(desc)?'Cofrinho do Cartão':'Cofrinho';
      const ref=`picpay|cofrinho|${data}|${hora}|${tipo}|${valor}|${norm(desc)}`;
      if(refs.has(ref)){dup++;continue}
      refs.add(ref);cofr.push({data,hora,nome,ref,valor:tipo==='dinheiro resgatado'?-valor:valor});continue}
    if(!PP_SAIDA.includes(tipo)&&!PP_ENTRADA.includes(tipo)){intern++;continue}
    if(tipo==='transferencia recebida'&&norm(desc)==='conta salario'){salarios.push({data,valor});continue}
    L.push({r,tipo,data,desc,hora,valor,k:norm(desc),ref:`picpay|${data}|${hora}|${tipo}|${valor}|${norm(desc)}`});
  }
  // 2) estorno novo + compra original (mesmo estabelecimento e valor, antes do estorno) = os dois se cancelam
  const jaTinha=new Set(refs);let pares=0;
  const chave=o=>o.data+' '+o.hora;
  for(const e of L){
    if(!(e.tipo==='compra estornada'||e.tipo==='pix devolvido')||jaTinha.has(e.ref))continue;
    const pool=L.filter(o=>PP_SAIDA.includes(o.tipo)&&!o.pareado&&o.k===e.k&&o.valor===e.valor&&chave(o)<=chave(e));
    // compras de importações anteriores que não estão neste arquivo
    S.gastos.filter(g=>g.ref&&g.valor===e.valor&&norm(g.descricao)===e.k&&!L.some(o=>o.ref===g.ref)).forEach(g=>{
      const [,data,hora]=g.ref.split('|');if(data+' '+hora<=chave(e))pool.push({data,hora,ref:g.ref,antigo:true})});
    pool.sort((x,y)=>chave(y).localeCompare(chave(x)));
    const o=pool[0];if(!o)continue;
    e.pareado=true;pares++;
    if(o.antigo||jaTinha.has(o.ref)){const i=S.gastos.findIndex(g=>g.ref===o.ref);if(i>=0)S.gastos.splice(i,1)}
    if(!o.antigo)o.pareado=true;
  }
  // 2b) gasto fixo: mesmo estabelecimento e valor exato, 1 vez por mês, em 3+ meses seguidos
  let fixos=0,cobertos=0;
  const ultimoMes=L.reduce((a,x)=>ym(x.data)>a?ym(x.data):a,'');
  const grupos={};
  L.filter(x=>!x.pareado&&(x.tipo==='compra realizada'||x.tipo==='pagamento realizado')&&!refs.has(x.ref)).forEach(x=>{(grupos[x.k+'|'+x.valor]=grupos[x.k+'|'+x.valor]||[]).push(x)});
  for(const itens of Object.values(grupos)){
    const porMes={};itens.forEach(x=>{(porMes[ym(x.data)]=porMes[ym(x.data)]||[]).push(x)});
    const ms=Object.keys(porMes).filter(m=>porMes[m].length===1).sort();
    let run=[];const runs=[];
    ms.forEach(m=>{if(run.length&&mdiff(run[run.length-1],m)===1)run.push(m);else{run=[m];runs.push(run)}});
    const best=runs.filter(u=>u.length>=3).sort((a,b)=>b.length-a.length)[0];
    if(!best)continue;
    const its=best.map(m=>porMes[m][0]),dias=its.map(x=>+x.data.slice(8));
    if(Math.max(...dias)-Math.min(...dias)>10)continue;
    const m0=its[0],mk=PP_CATS.find(([re])=>re.test(m0.k)),c=mk?getCat(mk[1],mk[2]):getCat('Outros','•');
    const g={id:uid(),valor:m0.valor,categoria:c.id,carteira:'conta',data:m0.data,descricao:m0.desc||m0.r[cT],recorrente:true,parcelas:1,origem:'picpay',k:m0.k,refs:its.map(x=>x.ref)};
    if(best[best.length-1]<ultimoMes)g.fim=best[best.length-1];
    S.gastos.push(g);fixos++;its.forEach(x=>{x.fixo=true;refs.add(x.ref)});
  }
  // 3) importa o que sobrou
  for(const x of L){
    if(x.pareado||x.fixo)continue;
    if(PP_SAIDA.includes(x.tipo)&&!refs.has(x.ref)&&S.gastos.some(g=>g.recorrente&&g.origem==='picpay'&&g.k===x.k&&g.valor===x.valor&&mdiff(ym(g.data),ym(x.data))>=0&&!(g.fim&&mdiff(ym(x.data),g.fim)<0))){refs.add(x.ref);cobertos++;continue}
    if(refs.has(x.ref)){dup++;continue}
    refs.add(x.ref);
    if(PP_SAIDA.includes(x.tipo)){
      const m=PP_CATS.find(([re])=>re.test(x.k));
      const c=m?getCat(m[1],m[2]):getCat('Outros','•');
      S.gastos.push({id:uid(),valor:x.valor,categoria:c.id,carteira:'conta',data:x.data,descricao:x.desc||x.r[cT],recorrente:false,parcelas:1,ref:x.ref});gs++;
    }else{
      const estorno=x.tipo==='compra estornada'||x.tipo==='pix devolvido';
      S.rendas.push({id:uid(),descricao:(estorno?'Estorno: ':'')+(x.desc||x.r[cT]),valor:x.valor,tipo:'extra',carteira:'conta',recorrente:false,data:x.data,ref:x.ref});rs++;
    }
  }
  const msgSal=picpaySalarios(salarios)+picpayCofrinhos(cofr);
  save();render();
  toast(`PicPay: ${gs} gasto${gs===1?'':'s'} e ${rs} entrada${rs===1?'':'s'} importados`+(novasCats?`, ${novasCats} categoria${novasCats>1?'s':''} nova${novasCats>1?'s':''}`:'')+(intern?`, ${intern} movimento${intern>1?'s':''} de cofrinho ignorado${intern>1?'s':''}`:'')+(dup?`, ${dup} repetido${dup>1?'s':''} ignorado${dup>1?'s':''}`:'')+(ruins?`, ${ruins} linha${ruins>1?'s':''} inválida${ruins>1?'s':''}`:'')+(fixos?`, ${fixos} gasto${fixos>1?'s':''} fixo${fixos>1?'s':''} detectado${fixos>1?'s':''}`:'')+(cobertos?`, ${cobertos} já coberto${cobertos>1?'s':''} por gasto fixo`:'')+(pares?`, ${pares} estorno${pares>1?'s':''} cancelado${pares>1?'s':''} com a compra original`:'')+msgSal,prev);
}

// "Conta Salário" do PicPay vira uma renda fixa (salário) com reajustes, em vez de entradas avulsas
function picpaySalarios(list){
  if(!list.length)return '';
  const porMes={},dias={};
  list.forEach(x=>{const m=ym(x.data);porMes[m]=(porMes[m]||0)+x.valor;dias[+x.data.slice(8)]=(dias[+x.data.slice(8)]||0)+1});
  const meses=Object.keys(porMes).sort();
  const ehSal=x=>x.recorrente&&x.tipo==='salario'&&x.carteira!=='va';
  const fixos=S.rendas.filter(ehSal);
  if(fixos.length&&!fixos.some(x=>x.origem==='picpay'))return ', salário do PicPay ignorado (você já tem um salário fixo)';
  if(!fixos.length){
    // remove as entradas avulsas de salário importadas antes, para não contar em dobro
    S.rendas=S.rendas.filter(x=>!(x.ref&&x.ref.startsWith('picpay|')&&x.ref.endsWith('|conta salario')));
    const dia=+Object.entries(dias).sort((a,b)=>b[1]-a[1])[0][0];
    const runs=[];
    meses.forEach(m=>{const v=Math.round(porMes[m]*100)/100,u=runs[runs.length-1];if(u&&u.valor===v)u.fim=m;else runs.push({valor:v,inicio:m,fim:m})});
    let hist=[];
    runs.forEach((u,i)=>{
      if(i>0)hist=[...hist,{mes:u.inicio,de:runs[i-1].valor,para:u.valor}];
      const x={id:uid(),descricao:'Salário',valor:u.valor,tipo:'salario',carteira:'conta',recorrente:true,dia,inicio:u.inicio,origem:'picpay',historico:hist};
      if(i<runs.length-1){x.fim=addM(runs[i+1].inicio,-1);x.oculta=true}
      S.rendas.push(x);
    });
    return `, salário fixo criado (dia ${dia}, ${runs.length-1} reajuste${runs.length-1===1?'':'s'})`;
  }
  // já existe: só registra reajuste quando um mês novo chega com valor diferente
  let reaj=0,ult=0;
  meses.forEach(m=>{
    const v=Math.round(porMes[m]*100)/100;
    const cur=S.rendas.find(x=>ehSal(x)&&x.origem==='picpay'&&!x.fim&&mdiff(x.inicio,m)>=0);
    if(!cur||cur.valor===v)return;
    if(mdiff(cur.inicio,m)===0){cur.valor=v;return}
    const nova={...cur,id:uid(),inicio:m,valor:v,historico:[...(cur.historico||[]),{mes:m,de:cur.valor,para:v}]};
    delete nova.fim;delete nova.oculta;
    cur.fim=addM(m,-1);cur.oculta=true;S.rendas.push(nova);reaj++;ult=v;
  });
  return reaj?`, salário reajustado para ${brl(ult)}`:'';
}

// cada cofrinho do PicPay vira uma meta "Guardar"; guardar/resgatar viram movimentos dela
function picpayCofrinhos(list){
  if(!list.length)return '';
  if(!S.metas)S.metas=[];
  list.sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora));
  const por={};list.forEach(x=>(por[x.nome]=por[x.nome]||[]).push(x));
  let criadas=0,movs=0;
  for(const [nome,L] of Object.entries(por)){
    let meta=S.metas.find(m=>m.origem==='picpay'&&m.cofrinho===nome);
    const novos=L.map(x=>({valor:x.valor,data:x.data,ref:x.ref}));
    if(meta)meta.movs.push(...novos);
    else{
      // o extrato pode começar com saldo já existente: entra como saldo inicial para a meta nunca ficar negativa
      let acc=0,min=0;novos.forEach(v=>{acc+=v.valor;if(acc<min)min=acc});
      const movsNovos=min<0?[{valor:Math.round(-min*100)/100,data:'0000-01-01',inicial:true},...novos]:novos;
      const saldo=movsNovos.reduce((t,v)=>t+v.valor,0);
      meta={id:uid(),nome,tipo:'guardar',icone:'🐷',alvo:Math.max(100,Math.ceil(saldo/100)*100),prazo:'',movs:movsNovos,origem:'picpay',cofrinho:nome};
      S.metas.push(meta);criadas++;
    }
    movs+=novos.length;
  }
  return `, ${movs} movimento${movs>1?'s':''} de cofrinho${criadas?` (${criadas} meta${criadas>1?'s':''} criada${criadas>1?'s':''})`:''}`;
}
