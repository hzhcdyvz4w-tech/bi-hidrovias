/* BI Hidrovias — composição partidária da Representação Institucional
   Fonte exclusiva: base V13 carregada por BI_RI_PUBLIC. Corte: metadata da base.
   Câmara 2022, Câmara 2026 e Senado no corte são universos independentes. */
(function(){
  'use strict';
  var ID='riPartyAnalysis', mounted=false, latest=null;
  function byId(id){return document.getElementById(id);}
  function str(x){return String(x==null?'':x).trim();}
  function esc(x){return str(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&#39;'}[c]||'&#39;';});}
  function canon(x){return str(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();}
  function dateLabel(x){return str(x)||'09/10/2026';}
  function isDeputy(r){return canon(r.cargo).indexOf('DEPUTADO')===0;}
  function isSenator(r){return canon(r.cargo).indexOf('SENADOR')===0;}
  function cleanPerson(value){
    var v=str(value).replace(/\s*\([^()]{1,35}\)\s*$/,'').trim();
    if(!v||/^(?:—|-|N\/A|NAO INFORMADO|NAO LOCALIZADO|A DEFINIR|AGUARDANDO|SEM REGISTRO|SEM CANDIDATO|NAO APLICAVEL|N\/D)/i.test(canon(v)))return '';
    return v;
  }
  function party(value,name){
    var v=str(value);
    if(!v||v==='—'||canon(v)==='N/D'){
      var m=str(name).match(/\(([^()]{2,40})\)\s*$/);
      v=m?m[1]:'';
    }
    var n=canon(v).replace(/^\s*PARTIDO\s+(?=LIBERAL$|DOS TRABALHADORES$)/,'PARTIDO ');
    var aliases={'UNIAO BRASIL':'UNIÃO','UNIAO':'UNIÃO','REPUBLICANOS':'REPUBLICANOS','PARTIDO LIBERAL':'PL','PARTIDO DOS TRABALHADORES':'PT','PROGRESSISTAS':'PP','PARTIDO PROGRESSISTA':'PP','SEM PARTIDO':'SEM PARTIDO','SEM FILIACAO':'SEM PARTIDO','PODEMOS':'PODE','AVANTE':'AVANTE','SOLIDARIEDADE':'SOLIDARIEDADE','CIDADANIA':'CIDADANIA'};
    if(aliases[n])return aliases[n];
    if(!n||/^(?:N\/A|N\/D|NENHUM|—|-|NAO INFORMADO|A DEFINIR|DESCONHECIDO|PENDENTE|NAO LOCALIZADO)/.test(n))return 'NÃO INFORMADO';
    return n;
  }
  function universe(rows,kind){
    var keyName=kind==='dep26'?'substituto_2027_nome_partido':'atual_nome_partido';
    var keyParty=kind==='dep26'?'partido_2027':'partido_atual';
    var entries=new Map(), duplicates=0, skipped=0;
    rows.forEach(function(r){
      if(kind==='sen'?!isSenator(r):!isDeputy(r))return;
      var raw=r[keyName], person=cleanPerson(raw);
      if(!person){skipped++;return;}
      var uf=canon(r.uf)||'SEM UF', key=uf+'|'+canon(person);
      var p=party(r[keyParty],raw);
      if(entries.has(key)){
        duplicates++;
        if(entries.get(key)==='NÃO INFORMADO'&&p!=='NÃO INFORMADO')entries.set(key,p);
      }else entries.set(key,p);
    });
    var grouped={}, notInformed=0;
    entries.forEach(function(p){grouped[p]=(grouped[p]||0)+1;if(p==='NÃO INFORMADO')notInformed++;});
    return {total:entries.size,grouped:grouped,duplicates:duplicates,skipped:skipped,unknown:notInformed};
  }
  function analyze(rows){
    return {dep22:universe(rows,'dep22'),dep26:universe(rows,'dep26'),sen:universe(rows,'sen')};
  }
  function percent(n,total){return total?(100*n/total).toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%':'—';}
  function intFmt(v){return Number(v||0).toLocaleString('pt-BR');}
  function selectedRows(){
    var api=window.BI_RI_PUBLIC, rows=api&&api.allRows?api.allRows():[];
    var reg=byId('riRegiao'), uf=byId('riUF');
    var regVal=reg&&reg.value||'TODOS',ufVal=uf&&uf.value||'TODOS';
    return rows.filter(function(r){return (regVal==='TODOS'||str(r.regiao)===regVal)&&(ufVal==='TODOS'||str(r.uf)===ufVal);});
  }
  function makeMarkup(){
    var host=byId('riResults');if(!host)return false;
    if(!byId(ID)){
      var box=document.createElement('section');
      box.id=ID;box.className='ri-party-panel';
      box.setAttribute('aria-label','Análise de distribuição partidária');
      box.innerHTML=[
        '<div class="ri-party-heading"><div><h3>Composição partidária — Câmara e Senado</h3>',
        '<p>Quantidade de parlamentares por sigla, participação percentual e comparação dos pleitos de 2022 e 2026. Atualiza conforme Região e UF.</p></div>',
        '<div class="ri-party-commands"><label for="riPartyYear">Exibir barras da Câmara</label><select id="riPartyYear"><option value="dep22">Eleitos em 2022</option><option value="dep26">Eleitos em 2026 (posse 2027)</option></select>',
        '<button type="button" id="riPartyExport">⬇ Exportar CSV</button></div></div>',
        '<div id="riPartyScope" class="ri-party-context"></div>',
        '<div id="riPartyKpis" class="ri-party-kpis"></div>',
        '<div class="ri-party-columns"><div class="ri-party-block"><h4 id="riPartyChartTitle">Distribuição por partido</h4><div id="riPartyChart"></div></div>',
        '<div class="ri-party-block"><h4>Leitura executiva</h4><div id="riPartyInsights"></div></div></div>',
        '<h4 class="ri-party-table-title">Quadro completo por partido</h4>',
        '<div class="ri-party-scroll"><table class="ri-party-table"><thead><tr>',
        '<th scope="col">Partido</th><th scope="col">Deputados eleitos 2022</th><th scope="col">Participação 2022</th>',
        '<th scope="col">Deputados eleitos 2026</th><th scope="col">Participação 2026</th>',
        '<th scope="col">Senadores da base 2026</th><th scope="col">Participação Senado</th>',
        '</tr></thead><tbody id="riPartyRows"></tbody></table></div>',
        '<p id="riPartyMethod" class="ri-party-method"></p>'
      ].join('');
      host.parentNode.insertBefore(box,host);
    }
    if(!byId('riPartyStyle')){
      var css=document.createElement('style');css.id='riPartyStyle';
      css.textContent=[
        '#'+ID+'{background:#f6fafc;border:1px solid #c8d9e4;border-radius:15px;padding:20px;margin:20px 0 16px;color:#173d63}',
        '#'+ID+' h3{font-size:21px;margin:0 0 6px;color:#173d63}',
        '#'+ID+' h4{font-size:15px;margin:0 0 12px;color:#173d63}',
        '#'+ID+' p{margin:4px 0 10px}',
        '#'+ID+' .ri-party-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}',
        '#'+ID+' .ri-party-heading p{font-size:13px;color:#546c7d;max-width:700px}',
        '#'+ID+' .ri-party-commands{display:grid;gap:5px;min-width:225px}',
        '#'+ID+' .ri-party-commands label{font-size:12px;font-weight:800}',
        '#'+ID+' select{width:100%;background:#fff;border:1px solid #9cb6c7;padding:9px;border-radius:8px}',
        '#'+ID+' button{border:1px solid #1f557b;background:#1b4b70;color:#fff;border-radius:8px;padding:9px 12px;cursor:pointer;font-weight:700}',
        '#'+ID+' .ri-party-context{font-size:12px;color:#456577;background:#e6f1f5;border-left:4px solid #167c73;padding:10px 12px;border-radius:5px;margin:14px 0}',
        '#'+ID+' .ri-party-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:16px}',
        '#'+ID+' .ri-party-kpi{background:#fff;border:1px solid #d5e3e9;border-radius:10px;padding:13px}',
        '#'+ID+' .ri-party-kpi b{font-size:11px;display:block;letter-spacing:.02em;color:#476479;text-transform:uppercase}',
        '#'+ID+' .ri-party-kpi strong{font-size:25px;display:block;color:#123a5d;margin:3px 0}',
        '#'+ID+' .ri-party-kpi span{font-size:11px;color:#617885}',
        '#'+ID+' .ri-party-columns{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:12px;margin:12px 0 18px}',
        '#'+ID+' .ri-party-block{background:#fff;border:1px solid #d5e3e9;border-radius:10px;padding:14px;min-width:0}',
        '#'+ID+' .ri-party-bar{display:grid;grid-template-columns:minmax(80px,.32fr) minmax(0,1fr) 45px;gap:9px;align-items:center;margin:8px 0;font-size:12px}',
        '#'+ID+' .ri-party-bar label{font-weight:800;overflow-wrap:anywhere}',
        '#'+ID+' .ri-party-track{height:13px;background:#e9f0f3;border-radius:8px;overflow:hidden}',
        '#'+ID+' .ri-party-fill{height:100%;border-radius:8px;background:#1d638e}',
        '#'+ID+' .ri-party-fill.sen{background:#208379}',
        '#'+ID+' .ri-party-legend{font-size:11px;color:#587486;margin:0 0 10px}',
        '#'+ID+' .ri-party-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;background:#1d638e;margin:0 3px 0 10px}',
        '#'+ID+' .ri-party-legend i.sen{background:#208379}',
        '#'+ID+' .ri-party-insight{border-bottom:1px solid #e5ecef;padding:8px 0;font-size:13px;line-height:1.45}',
        '#'+ID+' .ri-party-insight strong{color:#173d63}',
        '#'+ID+' .ri-party-table-title{margin-top:16px}',
        '#'+ID+' .ri-party-scroll{max-height:520px;overflow:auto;border-radius:9px;border:1px solid #d5e3e9;background:#fff}',
        '#'+ID+' .ri-party-table{min-width:780px;width:100%;border-collapse:collapse;font-size:12px}',
        '#'+ID+' .ri-party-table th{position:sticky;top:0;background:#e5eff4;color:#143c5b;text-align:right;border-bottom:1px solid #c0d4df;padding:10px 8px;z-index:1}',
        '#'+ID+' .ri-party-table th:first-child{text-align:left}',
        '#'+ID+' .ri-party-table td{border-bottom:1px solid #e2ebf0;text-align:right;padding:8px;white-space:nowrap}',
        '#'+ID+' .ri-party-table td:first-child{text-align:left;font-weight:800}',
        '#'+ID+' .ri-party-table tr:nth-child(2n){background:#f6f9fb}',
        '#'+ID+' .ri-party-table tfoot td{background:#deecf3;font-weight:900}',
        '#'+ID+' .ri-party-method{font-size:12px;line-height:1.55;color:#506b7e;margin-top:13px}',
        '@media(max-width:830px){#'+ID+' .ri-party-heading{display:block}#'+ID+' .ri-party-commands{min-width:0;margin-top:10px}#'+ID+' .ri-party-columns{grid-template-columns:1fr}#'+ID+' .ri-party-kpis{grid-template-columns:1fr 1fr}}',
        '@media(max-width:520px){#'+ID+'{padding:12px}#'+ID+' .ri-party-kpis{grid-template-columns:1fr}#'+ID+' .ri-party-bar{grid-template-columns:76px minmax(0,1fr) 32px}}'
      ].join('');
      document.head.appendChild(css);
    }
    return true;
  }
  function topEntry(group){
    return Object.entries(group.grouped).filter(function(e){return e[0]!=='NÃO INFORMADO';}).sort(function(a,b){return b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR');})[0]||null;
  }
  function render(){
    if(!window.BI_RI_PUBLIC||!makeMarkup())return;
    var rows=selectedRows(),stats=analyze(rows),sel=byId('riPartyYear');
    var show=sel&&sel.value==='dep26'?'dep26':'dep22',d=stats[show],s=stats.sen;
    latest=stats;
    var reg=byId('riRegiao'),uf=byId('riUF'),meta=window.BI_RI_PUBLIC.metadata();
    var scope=[reg&&reg.value!=='TODOS'?'Região '+reg.value:'Brasil',uf&&uf.value!=='TODOS'?'UF '+uf.value:null].filter(Boolean).join(' · ');
    byId('riPartyScope').textContent='Abrangência: '+scope+' · Corte da base: '+dateLabel(meta.data_corte)+'. A análise acompanha apenas Região/UF; filtros por cargo, situação, visão e texto continuam restritos à lista nominal.';
    byId('riPartyKpis').innerHTML=[
      ['Câmara — eleitos em 2022',stats.dep22.total,'Universo histórico do pleito de 2022'],
      ['Câmara — eleitos em 2026',stats.dep26.total,'Mandatos da legislatura iniciada em 2027'],
      ['Senado — registros da base',s.total,'Senadores na referência institucional de 2026']
    ].map(function(c){return '<div class="ri-party-kpi"><b>'+esc(c[0])+'</b><strong>'+intFmt(c[1])+'</strong><span>'+esc(c[2])+'</span></div>';}).join('');
    var parties=Array.from(new Set(Object.keys(stats.dep22.grouped).concat(Object.keys(stats.dep26.grouped),Object.keys(s.grouped))));
    parties.sort(function(a,b){return (d.grouped[b]||0)+(s.grouped[b]||0)-(d.grouped[a]||0)-(s.grouped[a]||0)||a.localeCompare(b,'pt-BR');});
    var max=Math.max(1,...parties.map(function(p){return Math.max(d.grouped[p]||0,s.grouped[p]||0);}));
    var bars=parties.filter(function(p){return (d.grouped[p]||0)||(s.grouped[p]||0);}).slice(0,14);
    byId('riPartyChartTitle').textContent='Principais siglas — Câmara '+(show==='dep22'?'2022':'2026')+' e Senado';
    byId('riPartyChart').innerHTML='<div class="ri-party-legend"><i></i> Deputados eleitos em '+(show==='dep22'?'2022':'2026')+' <i class="sen"></i> Senadores (base 2026)</div>'+
      (bars.length?bars.map(function(p){
        function line(num,label,cls){return '<div class="ri-party-bar"><label>'+esc(p)+'</label><div class="ri-party-track" role="img" aria-label="'+esc(label+': '+num)+'"><div class="ri-party-fill '+cls+'" style="width:'+(100*num/max).toFixed(2)+'%"></div></div><b>'+intFmt(num)+'</b></div>';}
        return line(d.grouped[p]||0,'Câmara', '')+line(s.grouped[p]||0,'Senado','sen');
      }).join(''):'<p>Não há parlamentares identificados para este recorte.</p>');
    var td=topEntry(d),ts=topEntry(s);
    byId('riPartyInsights').innerHTML=[
      '<div class="ri-party-insight"><strong>Câmara ('+(show==='dep22'?'eleitos 2022':'eleitos 2026')+'):</strong> '+(td?esc(td[0])+' lidera com '+intFmt(td[1])+' ('+percent(td[1],d.total)+')':'sem dados classificados')+'.</div>',
      '<div class="ri-party-insight"><strong>Senado (base 2026):</strong> '+(ts?esc(ts[0])+' tem '+intFmt(ts[1])+' ('+percent(ts[1],s.total)+')':'sem dados classificados')+'.</div>',
      '<div class="ri-party-insight"><strong>Siglas no recorte:</strong> '+intFmt(parties.filter(function(p){return p!=='NÃO INFORMADO';}).length)+' sigla(s) distinta(s) somando os três universos, sem misturar os totais de cadeiras.</div>',
      '<div class="ri-party-insight"><strong>Sem partido identificado:</strong> '+intFmt(stats.dep22.unknown)+' (Câmara 2022), '+intFmt(stats.dep26.unknown)+' (Câmara 2026) e '+intFmt(s.unknown)+' (Senado).</div>',
      '<div class="ri-party-insight"><strong>Interpretação:</strong> a contagem descreve a filiação registrada no snapshot, não comprova posição partidária atualizada nem alinhamento com investimentos hidroviários.</div>'
    ].join('');
    var table=parties.slice().sort(function(a,b){return (stats.dep22.grouped[b]||0)+(stats.dep26.grouped[b]||0)+(s.grouped[b]||0)-(stats.dep22.grouped[a]||0)-(stats.dep26.grouped[a]||0)-(s.grouped[a]||0)||a.localeCompare(b,'pt-BR');});
    byId('riPartyRows').innerHTML=table.map(function(p){
      var n22=stats.dep22.grouped[p]||0,n26=stats.dep26.grouped[p]||0,nSen=s.grouped[p]||0;
      return '<tr><td>'+esc(p)+'</td><td>'+intFmt(n22)+'</td><td>'+percent(n22,stats.dep22.total)+'</td><td>'+intFmt(n26)+'</td><td>'+percent(n26,stats.dep26.total)+'</td><td>'+intFmt(nSen)+'</td><td>'+percent(nSen,s.total)+'</td></tr>';
    }).join('')+'<tr><td><strong>TOTAL</strong></td><td><strong>'+intFmt(stats.dep22.total)+'</strong></td><td>100%*</td><td><strong>'+intFmt(stats.dep26.total)+'</strong></td><td>100%*</td><td><strong>'+intFmt(s.total)+'</strong></td><td>100%*</td></tr>';
    byId('riPartyMethod').innerHTML='<b>Metodologia e ressalvas:</b> a base V13 reúne eleitos à Câmara em 2022, eleitos em 2026 e senadores na referência de '+esc(dateLabel(meta.data_corte))+'. Cada pessoa é contada uma vez por UF e por universo (remoção de duplicidades nominais). Siglas são lidas dos campos partidários da base, com identificação de ausências. A Câmara de 2022 <b>não representa necessariamente a bancada em exercício em outubro de 2026</b>; a Câmara de 2026 refere-se à <b>posse em 2027</b>. A composição do Senado pode variar após a data de corte. Os percentuais usam o total de pessoas identificadas em cada universo e podem apresentar diferenças de arredondamento (*). Não se atribui projeto, verba ou decisão a parlamentar. Fonte: <code>data/representacao_institucional_v13.json.gz.b64</code>.';
  }
  function exportCsv(){
    if(!latest)return;
    var stats=latest,parties=Array.from(new Set(Object.keys(stats.dep22.grouped).concat(Object.keys(stats.dep26.grouped),Object.keys(stats.sen.grouped)))).sort(function(a,b){return a.localeCompare(b,'pt-BR');});
    var lines=[['Partido','Deputados eleitos 2022','Participação 2022','Deputados eleitos 2026','Participação 2026','Senadores base 2026','Participação Senado']];
    parties.forEach(function(p){var a=stats.dep22.grouped[p]||0,b=stats.dep26.grouped[p]||0,c=stats.sen.grouped[p]||0;lines.push([p,a,percent(a,stats.dep22.total),b,percent(b,stats.dep26.total),c,percent(c,stats.sen.total)]);});
    lines.push(['TOTAL',stats.dep22.total,'',stats.dep26.total,'',stats.sen.total,'']);
    var csv='\ufeff'+lines.map(function(cols){return cols.map(function(v){var val=str(v);if(/^[=+\-@]/.test(val))val="'"+val;return '"'+val.replace(/"/g,'""')+'"';}).join(';');}).join('\r\n');
    var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='incidencia_partidaria_representacao_2026.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function mount(){
    if(!window.BI_RI_PUBLIC||!makeMarkup())return;
    if(!mounted){
      mounted=true;
      byId('riPartyYear').addEventListener('change',render);
      byId('riPartyExport').addEventListener('click',exportCsv);
      ['riRegiao','riUF'].forEach(function(id){var el=byId(id);if(el)el.addEventListener('change',render);});
      var clear=byId('riClear');if(clear)clear.addEventListener('click',render);
      var apply=byId('riApply');if(apply)apply.addEventListener('click',render);
    }
    render();
  }
  window.addEventListener('bi:ri-ready',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
  window.BI_RI_PARTY={analyze:analyze,refresh:render,getLast:function(){return latest;}};
})();