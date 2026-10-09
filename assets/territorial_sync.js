/* BI Hidrovias — sincronizacao territorial v1
   Estado único de região, UF, município e hidrovia nos módulos compatíveis.
   Nenhum módulo é aberto automaticamente; filtros são aplicados em segundo plano. */
(function(){
"use strict";
var MAP={
 "Norte":["AC","AP","AM","PA","RO","RR","TO"],
 "Nordeste":["AL","BA","CE","MA","PB","PE","PI","RN","SE"],
 "Centro-Oeste":["DF","GO","MT","MS"],
 "Sudeste":["ES","MG","RJ","SP"],
 "Sul":["PR","RS","SC"]
}, ALL="TODOS";
var state={regiao:ALL,uf:ALL,municipio:ALL,hidrovia:ALL};
var syncing=false,started=false,policySelect=null,riSelect=null;
function el(id){return document.getElementById(id)}
function trim(v){return String(v==null?"":v).trim()}
function norm(v){return trim(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()}
function regionFor(uf){return Object.keys(MAP).find(function(r){return MAP[r].indexOf(uf)>=0})||ALL}
function copy(){return Object.assign({},state)}
function applyVal(id,value,allowAbsent){
 var e=el(id);if(!e||e.tagName!=="SELECT")return false;
 var val=value||ALL;
 if(!Array.from(e.options).some(function(o){return o.value===val})){
  if(!allowAbsent||val===ALL)return false;
  var missing=document.createElement("option");
  missing.value=val;missing.textContent=val+" (sem registros nesta base)";
  missing.setAttribute("data-bi-missing","1");e.add(missing);
 }
 if(e.value===val)return false;
 e.value=val;
 e.dispatchEvent(new Event("change",{bubbles:true}));
 return true;
}
function updateSharedUi(){
 var region=el("biShareRegion"),uf=el("biShareUF"),context=el("biShareCurrent");
 if(!region||!uf)return;
 var currentRegion=state.regiao;
 if(region.value!==currentRegion)region.value=currentRegion;
 var allowed=currentRegion===ALL?[].concat.apply([],Object.keys(MAP).map(function(r){return MAP[r]})):MAP[currentRegion]||[];
 var old=uf.value;
 uf.innerHTML='<option value="TODOS">Todas as UFs</option>'+allowed.map(function(u){return '<option value="'+u+'">'+u+'</option>'}).join("");
 if(allowed.indexOf(state.uf)>=0)uf.value=state.uf;
 else uf.value=ALL;
 if(context)context.textContent="Recorte compartilhado: "+(state.regiao===ALL?"Brasil":state.regiao)+(state.uf!==ALL?" • "+state.uf:"")+(state.municipio!==ALL?" • "+state.municipio:"")+(state.hidrovia!==ALL?" • "+state.hidrovia:"");
}
function syncMain(){
 var region=el("regiao"),uf=el("uf");
 if(!region||!uf)return;
 applyVal("regiao",state.regiao,true);
 applyVal("uf",state.uf,true);
 // Cascatas legadas podem selecionar automaticamente uma opção única.
 if(state.regiao===ALL && region.value!==ALL)applyVal("regiao",ALL,true);
 if(state.uf===ALL && uf.value!==ALL)applyVal("uf",ALL,true);
 if(el("municipio"))applyVal("municipio",state.municipio,true);
 if(el("hidrovia"))applyVal("hidrovia",state.hidrovia,true);
}
function syncPolicy(){
 var reg=el("polRegiao"),uf=el("polUF");
 if(!reg||!uf||!reg.options.length)return;
 applyVal("polRegiao",state.regiao,true);
 applyVal("polUF",state.uf,true);
 applyVal("polMunicipio",state.municipio,true);
 applyVal("polHidrovia",state.hidrovia,true);
}
function syncRI(){
 var region=el("riRegiao"),uf=el("riUF");
 if(!region||!uf||region.options.length<2)return;
 applyVal("riRegiao",state.regiao,true);
 applyVal("riUF",state.uf,true);
}
function broadcast(origin){
 if(syncing)return;
 syncing=true;
 try{
  updateSharedUi();
  if(origin!=="main")syncMain();
  if(origin!=="policy")syncPolicy();
  if(origin!=="ri")syncRI();
  updateSharedUi();
 }finally{syncing=false}
 window.dispatchEvent(new CustomEvent("bi:territorial-change",{detail:{state:copy(),origin:origin}}));
}
function set(partial,origin){
 var prev=copy(),next=Object.assign({},state,partial);
 next.regiao=next.regiao||ALL;next.uf=next.uf||ALL;next.municipio=next.municipio||ALL;next.hidrovia=next.hidrovia||ALL;
 if(next.uf!==ALL){
  var actualRegion=regionFor(next.uf);
  if(actualRegion!==ALL)next.regiao=actualRegion;
 }
 if(prev.regiao!==next.regiao && !Object.prototype.hasOwnProperty.call(partial,"uf"))next.uf=ALL;
 if(prev.uf!==next.uf){
  if(!Object.prototype.hasOwnProperty.call(partial,"municipio"))next.municipio=ALL;
  if(!Object.prototype.hasOwnProperty.call(partial,"hidrovia"))next.hidrovia=ALL;
 }
 if(Object.keys(state).every(function(k){return state[k]===next[k]})){broadcast(origin||"manual");return;}
 state=next;
 broadcast(origin||"manual");
}
function fromSource(source,id){
 if(syncing)return;
 var fields=source==="main"?{regiao:"regiao",uf:"uf",municipio:"municipio",hidrovia:"hidrovia"}:
  source==="policy"?{polRegiao:"regiao",polUF:"uf",polMunicipio:"municipio",polHidrovia:"hidrovia"}:
  {riRegiao:"regiao",riUF:"uf"};
 var key=fields[id];
 if(!key)return;
 var node=el(id);if(!node)return;
 var p={},v=node.value||ALL;
 p[key]=v;
 if(key==="regiao"){p.uf=ALL;p.municipio=ALL;p.hidrovia=ALL}
 else if(key==="uf"){p.municipio=ALL;p.hidrovia=ALL}
 set(p,source);
}
function addBar(){
 if(el("biTerritorialShared"))return;
 var home=el("comando"),grid=home&&home.querySelector(".command-grid");
 if(!home||!grid)return;
 var bar=document.createElement("div");bar.id="biTerritorialShared";
 bar.innerHTML='<div class="bi-share-title"><b>Recorte territorial integrado</b><span id="biShareCurrent">Recorte compartilhado: Brasil</span></div>'+
  '<div class="bi-share-controls"><label>Região<select id="biShareRegion"><option value="TODOS">Todas as regiões</option>'+
  Object.keys(MAP).map(function(r){return '<option value="'+r+'">'+r+'</option>'}).join("")+'</select></label>'+
  '<label>UF<select id="biShareUF"><option value="TODOS">Todas as UFs</option></select></label>'+
  '<button type="button" id="biShareClear">Limpar recorte</button></div>'+
  '<p class="bi-share-help">Alterações são aplicadas automaticamente a Recorte Territorial, Sugestões de Investimentos Hidroviários e Representação Institucional; cada painel conserva seus filtros próprios.</p>';
 grid.parentNode.insertBefore(bar,grid);
 var style=document.createElement("style");style.id="bi-territorial-shared-style";
 style.textContent='#biTerritorialShared{border:1px solid #cbd9dd;border-radius:12px;background:#f6f9fc;padding:12px;margin:12px 0 16px}'+
 '#biTerritorialShared .bi-share-title{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline;color:#173d63}'+
 '#biTerritorialShared .bi-share-title b{font-size:14px}#biShareCurrent{font-size:12px;color:#4b647b}'+
 '#biTerritorialShared .bi-share-controls{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:10px;align-items:end;margin-top:8px}'+
 '#biTerritorialShared label{font-size:12px;font-weight:800}#biTerritorialShared select{width:100%;margin:4px 0 0;font-size:14px;padding:9px 10px;border:1px solid #98b6c4;border-radius:9px;min-width:0}'+
 '#biShareClear{font-size:12px;padding:11px 12px;white-space:nowrap}#biTerritorialShared .bi-share-help{font-size:11px;color:#59718a;margin:8px 0 0;line-height:1.35}'+
 '@media(max-width:680px){#biTerritorialShared .bi-share-controls{grid-template-columns:repeat(2,minmax(0,1fr))}#biShareClear{grid-column:1/-1;width:100%}}';
 document.head.appendChild(style);
 el("biShareRegion").addEventListener("change",function(){set({regiao:this.value,uf:ALL,municipio:ALL,hidrovia:ALL},"shared")});
 el("biShareUF").addEventListener("change",function(){set({uf:this.value,municipio:ALL,hidrovia:ALL},"shared")});
 el("biShareClear").addEventListener("click",function(){set({regiao:ALL,uf:ALL,municipio:ALL,hidrovia:ALL},"shared")});
 updateSharedUi();
}
function onChange(e){
 var id=e.target&&e.target.id||"";
 if(["regiao","uf","municipio","hidrovia"].indexOf(id)>=0)fromSource("main",id);
 else if(["polRegiao","polUF","polMunicipio","polHidrovia"].indexOf(id)>=0)fromSource("policy",id);
 else if(["riRegiao","riUF"].indexOf(id)>=0)fromSource("ri",id);
}
function onClick(e){
 var id=e.target&&e.target.id||"";
 if(id==="polClear")set({regiao:ALL,uf:ALL,municipio:ALL,hidrovia:ALL},"policy");
 if(id==="riClear")set({regiao:ALL,uf:ALL,municipio:ALL,hidrovia:ALL},"ri");
 var target=e.target&&e.target.closest&&e.target.closest('button[onclick*="limparFiltrosMainV78"]');
 if(target)set({regiao:ALL,uf:ALL,municipio:ALL,hidrovia:ALL},"main");
}
function init(){
 if(started)return;started=true;
 addBar();document.addEventListener("change",onChange);
 document.addEventListener("click",onClick);
 var observer=new MutationObserver(function(){
  var pol=el("polRegiao"),ri=el("riRegiao");
  if(pol&&pol!==policySelect&&pol.options.length>0){
   policySelect=pol;
   setTimeout(function(){if(pol.isConnected){syncing=true;try{syncPolicy()}finally{syncing=false}}},0);
  }
  if(ri&&ri!==riSelect&&ri.options.length>1){
   riSelect=ri;setTimeout(function(){if(ri.isConnected){syncing=true;try{syncRI()}finally{syncing=false}}},0);
  }
 });
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener("bi:main-data-updated",function(){broadcast("external")});
 window.BI_TERRITORIAL={
  get:copy,
  set:function(partial){set(partial||{},"api")},
  reset:function(){set({regiao:ALL,uf:ALL,municipio:ALL,hidrovia:ALL},"api")},
  apply: function(){broadcast("api")}
 };
 var mainReg=el("regiao"),mainUf=el("uf");
 if(mainReg&&mainReg.value!==ALL||mainUf&&mainUf.value!==ALL){
  set({regiao:mainReg&&mainReg.value||ALL,uf:mainUf&&mainUf.value||ALL},"main");
 }else broadcast("initial");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
