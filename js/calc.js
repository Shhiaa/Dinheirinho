let view='dashboard', mes=ym(today()), filt={q:'',cat:'',orig:'',tipo:''};

/* ---------- cálculos ---------- */
const cat=id=>S.categorias.find(c=>c.id===id)||{nome:'Sem categoria',icone:'•',cor:'#6B6B6B',orcamento:0};
// rendas do mês: recorrentes (a partir do início, até o fim se houver) + extras do mês
function rendasMes(m){
  const out=[];
  for(const r of S.rendas){
    if(r.recorrente){
      if(mdiff(r.inicio,m)<0||(r.fim&&mdiff(m,r.fim)<0))continue;
      const dia=Math.min(r.dia||1,28);
      out.push({...r,data:`${m}-${String(dia).padStart(2,'0')}`,virtual:true});
    }else if(ym(r.data)===m)out.push(r);
  }
  return out;
}
// gastos do mês: pontuais, recorrentes (todo mês a partir da data) e parcelas
function gastosMes(m){
  const out=[];
  for(const g of S.gastos){
    const gm=ym(g.data), d=mdiff(gm,m);
    if(g.parcelas>1){
      if(d>=0&&d<g.parcelas)out.push({...g,valor:+(g.valor/g.parcelas).toFixed(2),parcela:d+1,data:`${m}-${g.data.slice(8)}`});
    }else if(g.recorrente){
      if(d>=0&&!(g.fim&&mdiff(m,g.fim)<0))out.push({...g,data:`${m}-${g.data.slice(8)}`});
    }else if(d===0)out.push(g);
  }
  return out.sort((a,b)=>b.data.localeCompare(a.data));
}
function resumo(m){
  const R=rendasMes(m),G=gastosMes(m);
  const sum=(a,f)=>a.filter(f).reduce((s,x)=>s+x.valor,0);
  const entConta=sum(R,r=>r.carteira!=='va'),entVA=sum(R,r=>r.carteira==='va');
  const gConta=sum(G,g=>g.carteira!=='va'),gVA=sum(G,g=>g.carteira==='va');
  const guardado=(S.metas||[]).flatMap(x=>x.movs).filter(d=>ym(d.data)===m).reduce((s,d)=>s+d.valor,0);
  const investido=(S.invest?.ativos||[]).flatMap(x=>x.movs).filter(d=>!d.inicial&&ym(d.data)===m).reduce((s,d)=>s+d.valor,0);
  return {R,G,entConta,entVA,ent:entConta,gConta,gVA,gastos:gConta,guardado,investido,saldo:entConta-gConta-guardado-investido,saldoVA:entVA-gVA};
}
const fmt=(v,sign)=>{const s=Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});return (sign?(v<0?'−':'+'):(v<0?'−':''))+s};
const money=(v,sign,cls='')=>`<span class="num ${cls}"><span class="cur">R$</span>${fmt(v,sign)}</span>`;
const brl=v=>'R$ '+fmt(v);
const mesNome=m=>{const[y,mo]=m.split('-');return new Date(y,mo-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})};
const mesCurto=m=>{const[y,mo]=m.split('-');return new Date(y,mo-1,1).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')};
const dataBR=s=>{const[y,m,d]=s.split('-');return `${d}/${m}`};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

