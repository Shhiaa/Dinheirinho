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

