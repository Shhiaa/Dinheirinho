const SB_URL='https://koocqvoyrwxntvllidkf.supabase.co',SB_KEY='sb_publishable_YdxfINxga2KTSvhKGeasLQ_DljhkX7B';
let sb=null,sbUser=null,pushing=false,pendente=false;
async function pushCloud(){if(!sbUser)return;if(pushing){pendente=true;return}pushing=true;
  const {error}=await sb.from('estado').upsert({user_id:sbUser.id,dados:S,atualizado_em:new Date().toISOString()});
  setSync(error?'erro':'ok');if(error)console.error(error);
  pushing=false;if(pendente){pendente=false;pushCloud()}}
async function carregarNuvem(){
  setSync('conectando');
  const {data,error}=await sb.from('estado').select('dados').eq('user_id',sbUser.id).maybeSingle();
  if(error){console.error(error);setSync('erro');toast('Erro ao ler a nuvem: '+error.message);return}
  cloud=true;
  const temLocal=S.gastos.length||S.rendas.length||(S.metas||[]).length||(S.invest?.ativos||[]).length;
  const remoto=data&&data.dados;
  if(remoto&&(!temLocal||(remoto.at||0)>=(S.at||0))){
    S=remoto;if(!S.metas)S.metas=[];if(!S.invest)S.invest={cdi:13.65,ipca:4.4,metaMensal:0,ativos:[]};
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
    setSync('ok');render();
  }else if(temLocal){setSync('salvando');await pushCloud();render()}
  else{setSync('ok');render()}
}
async function initCloud(){
  if(!window.supabase){setSync('local');return}
  sb=window.supabase.createClient(SB_URL,SB_KEY);
  sb.auth.onAuthStateChange((ev,session)=>{
    const u=session?.user||null;const mudou=(u?.id)!==(sbUser?.id);sbUser=u;
    if(u&&mudou)setTimeout(carregarNuvem,0);
    if(!u&&mudou){cloud=null;setSync('local');render()}
  });
  const {data}=await sb.auth.getSession();
  if(!data.session){setSync('local');render()}
}
async function entrar(){
  const email=(document.getElementById('loginEmail')||{}).value?.trim();
  if(!email||!email.includes('@')){toast('Digite seu e-mail');return}
  const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
  if(error){toast('Erro: '+error.message);return}
  toast('Link enviado! Abra seu e-mail neste aparelho e toque no link.');
}
async function sair(){await sb.auth.signOut();toast('Você saiu. Os dados continuam neste aparelho.')}
