/* BI Hidrovias | janela executiva da Representação Institucional.
   Mantém os relatórios existentes e usa o mesmo recorte da seleção. */
(function(){
"use strict";
var ready=false,request=0,lastFocus=null,lastOverflow="",refreshTimer=null;
function q(id){return document.getElementById(id)}
function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,function(s){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]})}
function modal(){return q("riInstitutionalModal")}
function visible(){var m=modal();return Boolean(m&&!m.hidden)}
function territory(s){
 var out=[];
 if(s.regiao&&s.regiao!=="TODOS")out.push("Região: "+s.regiao);
 if(s.uf&&s.uf!=="TODOS")out.push("UF: "+s.uf);
 if(s.municipio&&s.municipio!=="TODOS")out.push("Município: "+s.municipio);
 if(s.hidrovia&&s.hidrovia!=="TODOS")out.push("Hidrovia: "+s.hidrovia);
 return out.length?out.join(" | "):"Abrangência nacional";
}
function enrich(report){
 var rows=report.rows,stats=report.stats,proposals=report.context.propostas;
 var territoryCount=report.context.investimentos.length;
 var proposeCount=proposals?proposals.total:"consulta pendente";
 var geo=territory(report.scope);
 var gov=rows.filter(function(r){return r.cargo==="Governador(a)"}).length;
 var sen=rows.filter(function(r){return r.cargo==="Senador(a)"}).length;
 var deputy=rows.filter(function(r){return r.cargo==="Deputado(a) federal"}).length;
 var changed=stats.transicao;
 var synth='<div class="ri-doc-summary">'+
  '<b>SÍNTESE EXECUTIVA</b>'+
  '<p>O recorte <strong>'+esc(geo)+'</strong> apresenta <strong>'+gov+' registro(s) de governadores</strong>, '+
  '<strong>'+sen+' de senadores</strong> e <strong>'+deputy+' registro(s) de cotejo de deputados</strong>. '+
  'A análise compara mandatos e representações documentadas na base V13, identificando <strong>'+changed+
  ' diferença(s) nominais</strong>, sem pressupor substituição individual por cadeira parlamentar.</p></div>';
 var points='<section class="ri-decision"><h2>PONTOS PARA DECISÃO E ACOMPANHAMENTO</h2>'+
  '<div class="ri-decision-grid">'+
  point("Mandatos e transição","Conferir sucessão dos governos, titulares, suplentes e mandatos vigentes nas fontes oficiais.")+
  point("Bancadas federais",deputy+" registro(s) comparativos no recorte; a eleição proporcional não possui sucessão individual.")+
  point("Investimentos hidroviários",territoryCount+" empreendimento(s) da base de investimentos do BI no mesmo território.")+
  point("Sugestões de investimentos",esc(proposeCount)+" proposta(s) do módulo de Sugestões, conforme sua própria data de corte.")+
  '</div></section>';
 var coverage='<section class="ri-read"><h2>LEITURA TERRITORIAL E INSTITUCIONAL</h2>'+
  '<div class="ri-read-grid"><div><b>Representação federativa</b><p>'+gov+' governador(es) e '+sen+' senador(es) presentes no recorte nominal.</p></div>'+
  '<div><b>Recorte aplicado</b><p>'+esc(geo)+'</p></div></div>'+
  '<p class="ri-note">O cruzamento com investimentos e sugestões é exclusivamente territorial. Não representa autoria, indicação, apoio, influência ou destinação de recursos por agentes políticos.</p></section>';
 var css=[
  'body{background:#fff!important;color:#193750;font-size:13px}main{max-width:none!important;margin:0!important;border:0!important;box-shadow:none!important;padding:16px 22px 30px!important}',
  '.tool{display:none!important}.topline{border:1px solid #cbd9e5;border-top:5px solid #193e63;border-radius:9px;padding:17px 19px;margin:0 0 16px}',
  '.topline .tag{font-size:10px;font-weight:bold;color:#173d63;background:#eef4f8;border:1px solid #d5e1eb}',
  '.topline h1{font-size:21px;margin:7px 0 4px}.topline .subtitle{font-size:12px}',
  'h2{border:0!important;border-left:4px solid #2b9163!important;padding:3px 0 3px 10px!important;font-size:14px!important;letter-spacing:.015em}',
  '.metrics{grid-template-columns:repeat(4,minmax(0,1fr));margin:12px 0}',
  '.metric{background:#f8fafc;border:1px solid #d4e0eb;border-radius:9px}.metric b{font-size:19px}',
  '.ri-doc-summary{border:1px solid #d5e3ec;background:#f2f8fc;border-radius:10px;padding:13px 15px;margin:10px 0 14px}',
  '.ri-doc-summary>b{font-size:12px;color:#173d63}.ri-doc-summary p{line-height:1.6;margin:6px 0 0}',
  '.ri-decision-grid,.ri-read-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0 18px}',
  '.ri-decision-grid>div,.ri-read-grid>div{border:1px solid #d0dfe8;border-left:3px solid #2b9163;padding:11px 13px;border-radius:8px;min-width:0}',
  '.ri-decision-grid b,.ri-read-grid b{display:block;color:#173d63;margin-bottom:6px}',
  '.ri-decision-grid p,.ri-read-grid p{color:#465e75;margin:0}',
  '.ri-note{background:#fff8ec;border-left:3px solid #b38738;padding:9px}',
  '.report-table{border-color:#c9d8e6}.report-table th{background:#dbe9f5!important}.report-table tbody tr:nth-child(even){background:#eff6fa}',
  '@media(max-width:670px){main{padding:12px!important}.metrics,.ri-decision-grid,.ri-read-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.topline h1{font-size:17px}}',
  '@media print{main{padding:0!important}.ri-decision-grid,.ri-read-grid{break-inside:avoid}.ri-doc-summary,.ri-decision-grid>div,.ri-read-grid>div{-webkit-print-color-adjust:exact;print-color-adjust:exact}.report-table{font-size:9pt}}'
 ].join('');
 var html=report.html.replace("</style>",css+"</style>");
 html=html.replace('<section><h2>1. Síntese do recorte</h2>','<section><h2>1. Síntese do recorte</h2>'+synth);
 html=html.replace('<section><h2>2. Representação estadual e federal</h2>',points+coverage+'<section><h2>2. Representação estadual e federal</h2>');
 return html;
}
function point(title,detail){return '<div><b>'+esc(title)+'</b><p>'+detail+'</p></div>'}
function setLoading(value){
 var status=q("riModalStatus"),print=q("riModalPrint");
 if(status)status.textContent=value?"Preparando relatório com dados do recorte...":"";
 if(print)print.disabled=Boolean(value);
}
async function refresh(){
 if(!visible()||!window.BI_RI_EXECUTIVE)return;
 var id=++request,frame=q("riModalFrame");
 setLoading(true);
 try{
  var report=await window.BI_RI_EXECUTIVE.build("executivo");
  if(!visible()||id!==request)return;
  frame.srcdoc=enrich(report);
  q("riModalScope").textContent=territory(report.scope)+" · Corte: "+report.cut;
  frame.addEventListener("load",function onLoad(){
   frame.removeEventListener("load",onLoad);
   if(!visible()||id!==request)return;
   setLoading(false);
  });
 }catch(e){
  if(!visible()||id!==request)return;
  setLoading(false);
  q("riModalStatus").textContent="Não foi possível carregar o relatório: "+String(e&&e.message||e);
 }
}
function open(){
 if(!window.BI_RI_EXECUTIVE)return;
 var m=modal();
 if(!m)return;
 lastFocus=document.activeElement;lastOverflow=document.body.style.overflow;
 m.hidden=false;document.body.style.overflow="hidden";
 q("riModalClose").focus();
 refresh();
}
function close(){
 var m=modal();if(!m||m.hidden)return;
 m.hidden=true;request++;document.body.style.overflow=lastOverflow;
 q("riModalFrame").removeAttribute("srcdoc");
 if(lastFocus&&typeof lastFocus.focus==="function")lastFocus.focus();
}
function buildModal(){
 if(modal())return;
 var sheet=document.createElement("div");
 sheet.id="riInstitutionalModal";sheet.className="ri-overlay";sheet.hidden=true;
 sheet.innerHTML='<section class="ri-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="riModalTitle">'+
 '<header class="ri-modal-head">'+
 '<div class="ri-modal-head-text"><h2 id="riModalTitle">Relatório Executivo — Representação Institucional</h2>'+
 '<p id="riModalScope">Região e UF do recorte selecionado</p></div>'+
 '<div class="ri-modal-actions"><button id="riModalPrint" type="button" aria-label="Imprimir ou salvar relatório em PDF">🖨 Imprimir / PDF</button>'+
 '<button id="riModalClose" type="button">Fechar ✕</button></div>'+
 '</header><div class="ri-modal-body"><div id="riModalStatus" role="status" aria-live="polite"></div>'+
 '<iframe id="riModalFrame" title="Relatório executivo institucional completo"></iframe></div></section>';
 document.body.appendChild(sheet);
 sheet.addEventListener("click",function(e){if(e.target===sheet)close()});
 q("riModalClose").onclick=close;
 q("riModalPrint").onclick=function(){
  var w=q("riModalFrame").contentWindow;
  if(w){w.focus();w.print()}
 };
 document.addEventListener("keydown",function(e){
  if(!visible())return;
  if(e.key==="Escape"){e.preventDefault();close();return}
  if(e.key==="Tab"){
   var a=[q("riModalPrint"),q("riModalClose")],idx=a.indexOf(document.activeElement);
   if(e.shiftKey&&idx===0){e.preventDefault();a[1].focus()}
   else if(!e.shiftKey&&idx===1){e.preventDefault();a[0].focus()}
  }
 });
}
function css(){
 if(q("ri-modal-style"))return;
 var style=document.createElement("style");style.id="ri-modal-style";
 style.textContent=[
 '.ri-overlay{position:fixed;inset:0;z-index:1000000;background:rgba(12,32,55,.72);padding:18px;display:flex;align-items:center;justify-content:center}',
 '.ri-overlay[hidden]{display:none!important}',
 '.ri-modal-dialog{width:min(1210px,98vw);height:min(94vh,1030px);display:flex;flex-direction:column;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #d8e1e8;box-shadow:0 18px 48px #05152466}',
 '.ri-modal-head{flex:0 0 auto;background:#193d62;color:#fff;min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 17px}',
 '.ri-modal-head-text{flex:1;min-width:0}',
 '.ri-modal-head h2{font-size:16px!important;line-height:1.25;color:#fff!important;margin:0 0 4px!important;border:0!important;padding:0!important}',
 '.ri-modal-head p{margin:0;font-size:12px;color:#dceaf7;line-height:1.35}',
 '.ri-modal-actions{display:flex;align-items:center;gap:7px;flex:none;flex-wrap:wrap}',
 '.ri-modal-actions button{background:#fff;color:#173d63;border:1px solid #d9e7f3;border-radius:7px;padding:11px 13px;font-weight:800;font-size:12px;cursor:pointer}',
 '.ri-modal-actions button:disabled{opacity:.55;cursor:wait}',
 '.ri-modal-body{position:relative;flex:1;min-height:0;display:flex;flex-direction:column;background:#f4f7fb;padding:12px}',
 '#riModalStatus{font-size:12px;color:#36546c;padding:4px 8px}#riModalStatus:empty{display:none}',
 '#riModalFrame{display:block;border:1px solid #d3e0ea;border-radius:9px;width:100%;flex:1;min-height:0;background:#fff}',
 '#riModalOpenButton{font-weight:800;border:1px solid #2d6a91;background:#173e63;color:#fff}',
 '#riModalOpenButton:hover{background:#24577e}',
 '@media(max-width:640px){.ri-overlay{padding:0}.ri-modal-dialog{height:100dvh;width:100vw;border:0;border-radius:0}.ri-modal-head{padding:10px;flex-wrap:wrap}.ri-modal-head h2{font-size:14px!important}.ri-modal-actions{width:100%;justify-content:flex-end}.ri-modal-actions button{padding:9px}.ri-modal-body{padding:5px}}'
 ].join("");
 document.head.appendChild(style);
}
function install(){
 if(ready)return;
 if(!window.BI_RI_EXECUTIVE||!q("riReport"))return;
 ready=true;css();buildModal();
 var btn=document.createElement("button");btn.id="riModalOpenButton";btn.type="button";
 btn.textContent="📑 Abrir Página Executiva";
 btn.title="Visualizar o relatório institucional no mesmo formato executivo das Sugestões de Investimentos Hidroviários";
 q("riReport").parentNode.insertBefore(btn,q("riReport").nextSibling);
 btn.onclick=open;
 window.addEventListener("bi:territorial-change",function(){if(visible()){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,100)}});
 ["riCargo","riGrupo","riSituacao","riVisao","riBusca","riRegiao","riUF"].forEach(function(id){
  var e=q(id);if(e)e.addEventListener(id==="riBusca"?"input":"change",function(){if(visible()){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,120)}});
 });
}
window.addEventListener("bi:ri-executive-ready",install);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
else install();
})();
