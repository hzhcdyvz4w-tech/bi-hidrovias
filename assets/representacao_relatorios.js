/* BI Hidrovias — Relatórios Executivos da Representação Institucional V2.
   Cruzamentos apenas territoriais, sem atribuição de responsabilidade política. */
(function(){
"use strict";
var api=null, lastContext=null, lastKey="", serial=0;
function el(id){return document.getElementById(id)}
function str(v){return String(v==null?"":v).trim()}
function esc(v){return str(v).replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]})}
function norm(v){return str(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()}
function fmt(v){var s=str(v);if(/^\d{4}-\d\d-\d\d$/.test(s)){var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}return s||"—"}
function scope(){return api&&api.getScope?api.getScope():{regiao:"TODOS",uf:"TODOS",municipio:"TODOS",hidrovia:"TODOS"}}
function scopeKey(s){return JSON.stringify([s.regiao,s.uf,s.municipio,s.hidrovia])}
function mainTerritory(s){
 var all=Array.isArray(window.DATA)?window.DATA:(Array.isArray(window.FALLBACK_DATA)?window.FALLBACK_DATA:[]);
 return all.filter(function(r){
  if(s.uf!=="TODOS"&&(!Array.isArray(r.ufs)||r.ufs.indexOf(s.uf)<0))return false;
  if(s.regiao!=="TODOS"&&(!Array.isArray(r.regioes)||r.regioes.indexOf(s.regiao)<0))return false;
  if(s.municipio!=="TODOS"&&(!Array.isArray(r.municipios)||r.municipios.some(function(x){return norm(x)===norm(s.municipio)})===false))return false;
  if(s.hidrovia!=="TODOS"&&(!Array.isArray(r.hidrovias)||r.hidrovias.some(function(x){return norm(x)===norm(s.hidrovia)})===false))return false;
  return true;
 }).map(function(r){return{nome:str(r.nome||"—"),uf:(r.ufs||[]).join(", "),hidrovia:(r.hidrovias||[]).join(", "),situacao:str(r.situacao||"Não informada"),fonte:str(r.fonte||"Base principal do BI")}});
}
async function getContext(s){
 var key=scopeKey(s);
 if(lastContext&&lastKey===key)return lastContext;
 var data={scope:Object.assign({},s),investimentos:mainTerritory(s),propostas:null,propostasErro:null};
 try{
  if(window.BI_POLICY_PUBLIC&&typeof window.BI_POLICY_PUBLIC.query==="function")
   data.propostas=await window.BI_POLICY_PUBLIC.query(s);
  else data.propostasErro="Ponte de consulta às sugestões indisponível.";
 }catch(e){data.propostasErro=str(e&&e.message||e)}
 lastKey=key;lastContext=data;
 return data;
}
function rowsByCargo(rows,name){return rows.filter(function(r){return r.cargo===name})}
function countParty(rows){
 var m={};
 rows.forEach(function(r){
  if(r.cargo!=="Deputado(a) federal"||!r.partido_2027||/^—/.test(str(r.substituto_2027_nome_partido)))return;
  var p=r.partido_2027;m[p]=(m[p]||0)+1;
 });
 return Object.keys(m).sort(function(a,b){return m[b]-m[a]||a.localeCompare(b,"pt-BR")}).map(function(k){return[k,m[k]]});
}
function caption(s){
 var parts=[];
 if(s.regiao!=="TODOS")parts.push("Região "+s.regiao);
 if(s.uf!=="TODOS")parts.push("UF "+s.uf);
 if(s.municipio!=="TODOS")parts.push("Município "+s.municipio);
 if(s.hidrovia!=="TODOS")parts.push("Hidrovia "+s.hidrovia);
 return parts.length?parts.join(" · "):"Brasil — todas as regiões e unidades federativas";
}
function table(head,body){
 return '<div class="table-responsive"><table class="report-table"><thead><tr>'+head.map(function(h){return'<th>'+esc(h)+'</th>'}).join("")+'</tr></thead><tbody>'+body.join("")+'</tbody></table></div>';
}
function row(cells){return'<tr>'+cells.map(function(v){return'<td>'+esc(v==null||v===""?"—":v)+'</td>'}).join("")+'</tr>'}
function composeList(records,label,currentKey,nextKey,brief){
 var max=brief?20:Infinity,used=records.slice(0,max);
 var b=used.map(function(r){return row([r.uf||"—",r[currentKey]||"—",r[nextKey]||"—",r.situacao_comparativa||r.situacao_pos_2026||"Cotejo nominal",fmt(r.mandato_atual_inicio)+" – "+fmt(r.mandato_atual_fim)])});
 var labelText=records.length>max?'<p class="muted">Exibidos '+used.length+' de '+records.length+' registros; o Relatório Executivo contém a relação completa.</p>':"";
 return '<h3>'+esc(label)+' <small>('+records.length+' registros)</small></h3>'+
  (records.length?table(["UF","Eleitos em 2022 / ocupante registrado","Eleitos em 2026 / mandato de 2027","Situação na base","Mandato registrado"],b):'<p class="muted">Nenhum registro deste cargo no recorte.</p>')+labelText;
}
function printableHtml(mode,ctx){
 var rows=api.filteredRows(), s=api.stats(rows),sc=ctx.scope,brief=(mode==="briefing"),cut=api.metadata().data_corte||"09/10/2026";
 var gov=rowsByCargo(rows,"Governador(a)"),sen=rowsByCargo(rows,"Senador(a)"),dep=rowsByCargo(rows,"Deputado(a) federal");
 var title=brief?"BRIEFING EXECUTIVO":"RELATÓRIO EXECUTIVO";
 var pro=ctx.propostas, proj=ctx.investimentos||[],party=countParty(rows),parties=party.slice(0,20);
 var sheet=['<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' — Representação Institucional</title>',
 '<style>*{box-sizing:border-box}body{margin:0;background:#eef2f5;color:#20354b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.45}main{max-width:1250px;margin:20px auto;background:#fff;padding:28px 34px;border:1px solid #d1dce5;border-radius:10px;box-shadow:0 4px 22px #152a3a12}h1{font-size:22px;letter-spacing:.025em;color:#173d63;margin:6px 0}h2{font-size:15px;border-bottom:2px solid #173d63;padding-bottom:5px;margin:25px 0 12px;color:#173d63}h3{font-size:13px;margin:17px 0 8px;color:#173d63}h3 small{font-weight:normal;color:#65798d}p{margin:7px 0}.muted,.meta{color:#607488;font-size:11px}.topline{border-bottom:5px solid #38a96e;padding-bottom:12px;margin-bottom:15px}.subtitle{font-size:13px;color:#36556d}.tag{display:inline-block;border:1px solid #b9cad7;border-radius:7px;padding:4px 8px;background:#edf4f9}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:15px 0}.metric{border:1px solid #ccd9e4;border-radius:9px;padding:10px 12px}.metric b{display:block;font-size:21px;color:#173d63}.metric small{font-size:10px;color:#536a80}.note{background:#f0f6fc;border-left:4px solid #32698d;padding:10px 13px;margin:12px 0}.warn{background:#fff7e9;border-left-color:#b68020}.table-responsive{overflow:auto}.report-table{width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:11px}.report-table th,.report-table td{border:1px solid #c9d5df;padding:7px 8px;vertical-align:top;text-align:left;overflow-wrap:anywhere}.report-table th{background:#dce9f3;color:#173d63;font-weight:700}.report-table tbody tr:nth-child(even){background:#f0f7fc}.report-table tr{break-inside:avoid}.tool{position:sticky;top:0;z-index:5;background:#173d63;color:#fff;padding:8px 16px;display:flex;gap:10px;align-items:center;justify-content:space-between}.tool button{border:1px solid #d3e7f3;background:#fff;color:#173d63;border-radius:6px;padding:9px 14px;font-weight:700;cursor:pointer}.links a{color:#235d91;overflow-wrap:anywhere}.footer{font-size:10px;color:#607488;border-top:1px solid #cbd5df;padding-top:10px;margin-top:25px}@page{size:A4 landscape;margin:12mm}@media print{body{background:#fff}main{max-width:none;padding:0;margin:0;border:0;box-shadow:none}.tool{display:none}.table-responsive{overflow:visible}.report-table{font-size:9pt}.report-table th,.report-table td{padding:4pt}.metrics{gap:6px}.metric{padding:6px}h2{break-after:avoid}h3{break-after:avoid}.note{print-color-adjust:exact;-webkit-print-color-adjust:exact}.report-table th{print-color-adjust:exact;-webkit-print-color-adjust:exact}tr{page-break-inside:avoid}}@media(max-width:650px){main{padding:15px;margin:0;border:0}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.tool{flex-wrap:wrap}}</style></head><body>',
 '<div class="tool"><strong>Representação Institucional • '+(brief?'Briefing':'Relatório Executivo')+'</strong><div><button onclick="window.print()">Imprimir / salvar PDF</button> <button onclick="window.close()">Fechar</button></div></div><main><div class="topline"><p class="tag">DPP/SNHN • BI Executivo de Hidrovias</p><h1>'+title+' — REPRESENTAÇÃO INSTITUCIONAL</h1><p class="subtitle">Composição federativa, mandatos, transição de legislaturas e contexto territorial</p><p class="meta">Data de corte político-institucional: '+esc(cut)+' · Emissão: '+esc(new Date().toLocaleString("pt-BR"))+'</p></div>',
 '<section><h2>1. Síntese do recorte</h2><p><strong>Território:</strong> '+esc(caption(sc))+'</p><p><strong>Filtros institucionais:</strong> '+api.context()+'</p>',
 '<div class="metrics">'+metric("Registros comparativos",s.total)+metric("Unidades federativas",s.ufs)+metric("Governadores / senadores",s.gov+" / "+s.sen)+metric("Deputados — cotejo nominal",s.dep)+'</div>',
 '<div class="note">A apresentação de deputados compara os 513 eleitos em 2022 com os 513 eleitos em 2026, registrados em 735 linhas consolidadas na base nacional. Esses registros não equivalem à composição integral da Câmara em exercício em 09/10/2026 nem a sucessores individuais de mandatos proporcionais. Identificações por nome podem exigir confirmação por código parlamentar oficial.</div></section>',
 '<section><h2>2. Representação estadual e federal</h2>',composeList(gov,"Poder Executivo estadual","atual_nome_partido","substituto_2027_nome_partido",brief),composeList(sen,"Senado Federal","atual_nome_partido","substituto_2027_nome_partido",brief),composeList(dep,"Câmara dos Deputados — duas eleições","atual_nome_partido","substituto_2027_nome_partido",brief),'</section>',
 '<section><h2>3. Composição partidária dos deputados eleitos para 2027 no recorte</h2>',
 parties.length?table(["Sigla partidária na eleição de 2026","Registros de eleitos para 2027"],parties.map(function(p){return row(p)})):'<p class="muted">Nenhuma composição partidária de deputados no recorte.</p>',
 party.length>20?'<p class="muted">Exibidos os primeiros 20 partidos por número de registros.</p>':"","</section>",
 '<section><h2>4. Contexto hidroviário territorial (sem associação política)</h2>',
 '<div class="metrics">'+metric("Investimentos do BI no território",proj.length)+metric("Sugestões de investimentos hidroviários",pro?pro.total:"A validar")+metric("Recorte territorial",sc.uf!=="TODOS"?sc.uf:sc.regiao!=="TODOS"?sc.regiao:"Brasil")+metric("Base propositiva",pro?pro.data_corte:"Indisponível")+'</div>',
 '<div class="note">As informações a seguir são estritamente geográficas. Nenhum investimento, recurso, concessão ou sugestão é atribuído a um representante político pela coincidência territorial.</div>',
 proj.length?table(["Investimento registrado","UF de abrangência","Hidrovia / rio","Situação informada"],proj.slice(0,brief?8:40).map(function(x){return row([x.nome,x.uf,x.hidrovia,x.situacao])})):'<p class="muted">Nenhum investimento correspondente no snapshot consultado do BI.</p>',
 proj.length>(brief?8:40)?'<p class="muted">Foram exibidos '+(brief?8:40)+' de '+proj.length+' investimentos do território.</p>':"",
 pro&&pro.rows&&pro.rows.length?table(["Proposta hidroviária","UF / município","Hidrovia","Tipo","Status"],pro.rows.slice(0,brief?8:40).map(function(x){return row([x.investimento,x.uf+" / "+x.municipio,x.hidrovia,x.tipo,x.status])})):'<p class="muted">'+(ctx.propostasErro?'A consulta à base de sugestões não pôde ser realizada: '+esc(ctx.propostasErro):'Nenhuma sugestão cadastrada para o recorte territorial na base consultada.')+'</p>',
 pro&&pro.total>(brief?8:40)?'<p class="muted">Foram exibidas '+(brief?8:40)+' de '+pro.total+' sugestões do território.</p>':"","</section>",
 '<section><h2>5. Fontes, datas e cuidados metodológicos</h2><p>Base político-institucional V13, corte 09/10/2026. As informações sobre propostas e investimentos são snapshots separados, sujeitos a atualização própria.</p>',
 '<div class="links"><p><a href="https://www25.senado.leg.br/web/senadores/em-exercicio/-/e/por-nome">Senado — exercício parlamentar</a></p><p><a href="https://www.camara.leg.br/internet/agencia/infograficos-html5/tabelasEleicoes/deputados-eleitos-estado/index.html">Câmara — eleitos de 2022</a></p><p><a href="https://www.camara.leg.br/internet/agencia/infograficos-html5/eleicoes2026/deputados-eleitos-estado.html">Câmara — eleitos de 2026</a></p><p>Fontes específicas de projetos: consultar o módulo Investimentos e a Carteira_Governadores no BI.</p></div>',
 '<p class="note warn"><b>Limites:</b> a eleição proporcional não define sucessor individual. Governadores que dependam do segundo turno de 2026 aparecem conforme o estágio e a ressalva presentes na base V13. Divergências de suplência, mandato e filiação exigem atualização documental antes de utilização oficial.</p></section>',
 '<div class="footer">BI Executivo de Hidrovias e Navegação Interior · Documento informativo com fontes e data de corte · Não substitui ato oficial, decisão administrativa ou conferência nos portais dos Poderes Legislativo e Executivo.</div></main></body></html>'];
 return sheet.join("");
}
function metric(name,value){return'<div class="metric"><b>'+esc(value)+'</b><small>'+esc(name)+'</small></div>'}
function putPreview(mode,ctx){
 var pane=el("riExecutivePreview");if(!pane)return;
 var html=printableHtml(mode,ctx);
 pane.hidden=false;
 pane.innerHTML='<div class="ri-preview-head"><b>'+(mode==="briefing"?"Prévia do briefing":"Prévia do relatório executivo")+'</b><button type="button" id="riPreviewClose">Fechar prévia</button></div>'+
  '<iframe title="Pré-visualização da representação institucional" class="ri-preview-frame" sandbox="allow-same-origin" referrerpolicy="no-referrer"></iframe>';
 pane.querySelector("iframe").srcdoc=html;
 pane.querySelector("#riPreviewClose").onclick=function(){pane.hidden=true;pane.innerHTML=""};
 pane.scrollIntoView({behavior:"smooth",block:"start"});
}
function popup(mode){
 var w=window.open("","_blank");
 if(!w){alert("O navegador bloqueou a janela do relatório. Permita pop-ups para imprimir.");return}
 w.document.write('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Preparando relatório institucional...</title></head><body><p>Preparando relatório institucional com dados territoriais...</p></body></html>');
 w.document.close();
 var s=scope();
 getContext(s).then(function(ctx){
  if(w.closed)return;
  w.document.open();w.document.write(printableHtml(mode,ctx));w.document.close();w.focus();
 }).catch(function(e){
  if(w.closed)return;
  w.document.open();w.document.write('<!doctype html><html><body><h1>Relatório indisponível</h1><p>'+esc(e&&e.message||e)+'</p></body></html>');w.document.close();
 });
}
async function preview(mode){
 var pane=el("riExecutivePreview");if(!pane)return;
 pane.hidden=false;pane.textContent="Montando prévia do relatório...";
 var ctx=await getContext(scope());
 putPreview(mode,ctx);
}
function refreshContext(){
 if(!api)return;
 var box=el("riIntegratedReportContext");if(!box)return;
 var n=++serial,s=scope();
 box.textContent="Atualizando contexto de investimentos e sugestões no recorte territorial...";
 getContext(s).then(function(ctx){
  if(serial!==n)return;
  var c=ctx.propostas,proj=ctx.investimentos||[];
  box.innerHTML='<b>Contexto executivo compartilhado:</b> '+esc(caption(s))+' · '+proj.length+' investimento(s) do BI · '+
   (c?c.total+" sugestão(ões) hidroviárias":'sugestões a validar')+
   '. Este é apenas um recorte territorial, sem atribuição política.'+
   (ctx.propostasErro?'<br><small>Base de sugestões não disponível: '+esc(ctx.propostasErro)+'</small>':'');
 }).catch(function(e){if(serial===n)box.textContent="Contexto territorial não disponível: "+str(e&&e.message||e)});
}
function setup(){
 if(api)return;
 api=window.BI_RI_PUBLIC;
 if(!api)return;
 var report=el("riReport"),brief=el("riBriefing");
 if(report)report.onclick=function(){popup("executivo")};
 if(brief)brief.onclick=function(){popup("briefing")};
 if(report&& !el("riPreviewButton")){
  var btn=document.createElement("button");btn.type="button";btn.className="secondary";btn.id="riPreviewButton";btn.textContent="👁 Prévia do Relatório";
  report.parentNode.insertBefore(btn,report.nextSibling);
  btn.onclick=function(){preview("executivo")};
 }
 if(!el("riExecutivePreview")){
  var pane=document.createElement("div");pane.id="riExecutivePreview";pane.hidden=true;
  var results=el("riResults");if(results&&results.parentNode)results.parentNode.insertBefore(pane,results);
 }
 var style=document.createElement("style");style.id="ri-report-enhanced-style";
 style.textContent='#riExecutivePreview{margin:14px 0;border:1px solid #cbd9e1;border-radius:11px;overflow:hidden;background:#f6f9fb}'+
 '#riExecutivePreview[hidden]{display:none!important}.ri-preview-head{padding:10px 13px;display:flex;justify-content:space-between;align-items:center;gap:10px;background:#eaf2f8}'+
 '.ri-preview-head b{color:#173d63}.ri-preview-head button{padding:8px 10px;font-size:12px}'+
 '.ri-preview-frame{width:100%;height:min(75vh,800px);border:0;background:white}'+
 '@media(max-width:650px){.ri-preview-frame{height:70vh}.ri-preview-head{flex-wrap:wrap}}';
 document.head.appendChild(style);
 window.addEventListener("bi:territorial-change",function(){lastKey="";lastContext=null;refreshContext()});
 // Compartilhamento direto também após buscas e filtros específicos.
 ["riCargo","riGrupo","riSituacao","riVisao","riBusca"].forEach(function(id){var x=el(id);if(x)x.addEventListener(id==="riBusca"?"input":"change",function(){if(el("riExecutivePreview")&&!el("riExecutivePreview").hidden)preview("executivo")})});
 refreshContext();
 window.BI_RI_EXECUTIVE={
  build:async function(mode){
   var s=scope(),ctx=await getContext(s),list=api.filteredRows();
   return {html:printableHtml(mode||"executivo",ctx),context:ctx,rows:list,stats:api.stats(list),
     scope:s,cut:api.metadata().data_corte||"09/10/2026"};
  }
 };
 window.dispatchEvent(new CustomEvent("bi:ri-executive-ready"));
}
window.addEventListener("bi:ri-ready",setup);
if(window.BI_RI_PUBLIC)setup();
})();
