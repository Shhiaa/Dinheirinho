const KEY='financas.v1';
const uid=()=>Math.random().toString(36).slice(2,10);
const today=()=>{const d=new Date();return iso(d)};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const ym=s=>s.slice(0,7);
const addM=(m,n)=>{let [y,mo]=m.split('-').map(Number);mo+=n;y+=Math.floor((mo-1)/12);mo=((mo-1)%12+12)%12+1;return `${y}-${String(mo).padStart(2,'0')}`};
const mdiff=(a,b)=>{const[ya,ma]=a.split('-').map(Number),[yb,mb]=b.split('-').map(Number);return (yb-ya)*12+(mb-ma)};

function seed(){
  const m=ym(today());
  const cats=[['Moradia','🏠'],['Mercado','🛒'],['Restaurantes','🍽️'],['Transporte','🚌'],['Saúde','💊'],['Lazer','🎮'],['Assinaturas','📺'],['Educação','📚'],['Compras','🛍️'],['Outros','•']]
    .map(([nome,icone],i)=>({id:uid(),nome,icone,cor:PAL[i%PAL.length],orcamento:0}));
  return {v:1,usuario:{nome:'',diaVirada:1},
    carteiras:[{id:'conta',nome:'Conta',tipo:'dinheiro'},{id:'va',nome:'VA',tipo:'beneficio'}],
    categorias:cats,rendas:[],gastos:[],criado:m};
}
let S;
try{S=JSON.parse(localStorage.getItem(KEY))||null}catch(e){S=null}
if(!S)S=seed();
if(!S.metas)S.metas=[];
if(!S.invest)S.invest={cdi:13.65,ipca:4.4,metaMensal:0,ativos:[]};
let cloud=null,cloudTimer=null,sync='local';
function save(){S.at=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  if(cloud&&sbUser){clearTimeout(cloudTimer);setSync('salvando');cloudTimer=setTimeout(pushCloud,800)}}
function setSync(st){sync=st;const el=document.getElementById('syncBadge');if(el)el.outerHTML=syncBadge()}
function syncBadge(){const m={local:['#6B6B6B','Não conectado — só neste aparelho'],conectando:['#6B6B6B','Conectando…'],salvando:['#F5A524','Salvando…'],ok:['#22C55E','Salvo na nuvem'],erro:['#F04444','Erro ao salvar — tentando de novo']}[sync];
  return `<span id="syncBadge" class="small" style="display:inline-flex;align-items:center;gap:6px"><i style="width:8px;height:8px;border-radius:9px;background:${m[0]};display:inline-block"></i>${m[1]}</span>`}
