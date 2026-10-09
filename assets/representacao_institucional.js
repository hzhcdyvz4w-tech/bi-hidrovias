(function(){
  "use strict";

  var DATA_URL = './data/representacao_institucional_v13.json.gz.b64';
  var VIEW_ID = 'representacaoInstitucionalView';
  var BTN_ID = 'cmdRepresentacaoInstitucional';
  var DATA = null;
  var ALL = 'TODOS';

  function q(id){ return document.getElementById(id); }
  function esc(v){ return String(v == null ? '—' : v).replace(/[&<>"']/g,function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
  function uniq(arr){ return Array.from(new Set((arr||[]).filter(Boolean))); }
  function txt(v){ return String(v == null ? '' : v).trim(); }
  function includes(hay, needle){ return txt(hay).toUpperCase().indexOf(txt(needle).toUpperCase()) >= 0; }
  function fmtDate(v){
    var s = txt(v);
    if(!s) return '—';
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)){
      var p = s.split('-');
      return p[2]+'/'+p[1]+'/'+p[0];
    }
    return s;
  }

  function injectCss(){
    if(q('ri-style')) return;
    var style = document.createElement('style');
    style.id = 'ri-style';
    style.textContent = [
      '#'+VIEW_ID+' .ri-sub{margin-top:4px;color:#60788a}',
      '#'+VIEW_ID+' .ri-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:12px 0}',
      '#'+VIEW_ID+' .ri-card{background:#fff;border:1px solid #d7e0e6;border-radius:12px;padding:11px 12px}',
      '#'+VIEW_ID+' .ri-card b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.03em;color:#36546d;margin-bottom:4px}',
      '#'+VIEW_ID+' .ri-card span{display:block;font-size:20px;font-weight:800;color:#173d63;overflow-wrap:anywhere}',
      '#'+VIEW_ID+' .ri-filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0}',
      '#'+VIEW_ID+' .ri-filters label{font-weight:800;font-size:13px}',
      '#'+VIEW_ID+' .ri-filters input,#'+VIEW_ID+' .ri-filters select{width:100%;margin-top:6px;padding:12px;border:2px solid #c7d6dd;border-radius:10px;background:#fff;font-size:15px}',
      '#'+VIEW_ID+' .ri-wide{grid-column:1/-1}',
      '#'+VIEW_ID+' .ri-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}',
      '#'+VIEW_ID+' .ri-actions .secondary{background:#e8f1f2;color:#173d63;border:1px solid #9fbdb6}',
      '#'+VIEW_ID+' .ri-actions a{display:inline-flex;align-items:center;padding:13px 16px;border-radius:9px;border:1px solid #9fbdb6;background:#fff;text-decoration:none;color:#173d63;font-weight:800}',
      '#'+VIEW_ID+' .ri-table-wrap{overflow:auto;border:1px solid #d7e0e6;border-radius:12px;background:#fff}',
      '#'+VIEW_ID+' table{width:100%;min-width:1180px;border-collapse:collapse}',
      '#'+VIEW_ID+' th,#'+VIEW_ID+' td{padding:9px 10px;border-bottom:1px solid #e5edf0;text-align:left;vertical-align:top;line-height:1.35}',
      '#'+VIEW_ID+' th{position:sticky;top:0;background:#eef4f8;color:#173d63;z-index:1}',
      '#'+VIEW_ID+' .ri-badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef7ff;color:#173d63;font-size:11px;font-weight:800}',
      '#'+VIEW_ID+' .ri-muted{color:#60788a;font-size:12px}',
      '#'+VIEW_ID+' .ri-empty{padding:18px;border:1px dashed #c7d6dd;border-radius:12px;background:#fbfdff;color:#536d82}',
      '@media (max-width:900px){#'+VIEW_ID+' .ri-filters{grid-template-columns:repeat(2,minmax(0,1fr))}}',
      '@media (max-width:640px){#'+VIEW_ID+' .ri-filters{grid-template-columns:1fr}#'+VIEW_ID+' .ri-actions{display:grid;grid-template-columns:1fr 1fr}#'+VIEW_ID+' .ri-actions a,#'+VIEW_ID+' .ri-actions button{width:100%}}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureButton(){
    if(q(BTN_ID)) return;
    var grid = document.querySelector('.command-grid');
    if(!grid) return;
    var btn = document.createElement('button');
    btn.className = 'cmd';
    btn.id = BTN_ID;
    btn.setAttribute('type','button');
    btn.setAttribute('aria-pressed','false');
    btn.innerHTML = '<span class="ico">🏛️</span><b>Representação Institucional</b><small>Composição federativa, mandatos e representação por região e UF</small>';
    btn.addEventListener('click', function(){ window.openRepresentacaoInstitucional(); });
    grid.appendChild(btn);
  }

  function ensureView(){
    if(q(VIEW_ID)) return q(VIEW_ID);
    var homeBack = q('homeBack');
    var section = document.createElement('section');
    section.className = 'box home-hidden';
    section.id = VIEW_ID;
    section.innerHTML = [
      '<h2>Representação Institucional</h2>',
      '<div class="ri-sub">Composição federativa, mandatos e representação por região e UF. Base política integrada para consulta e inclusão em relatórios executivos.</div>',
      '<div id="riMeta" class="sourcebar">Carregando base institucional...</div>',
      '<div id="riSummary" class="ri-grid"></div>',
      '<div id="riTerritorialContext" class="sourcebar"></div>',
      '<div class="ri-filters">',
        '<label>REGIÃO<select id="riRegiao"></select></label>',
        '<label>UF<select id="riUF"></select></label>',
        '<label>CARGO<select id="riCargo"></select></label>',
        '<label>GRUPO<select id="riGrupo"></select></label>',
        '<label>SITUAÇÃO<select id="riSituacao"></select></label>',
        '<label>VISÃO<select id="riVisao"><option value="TODOS">TODAS</option><option value="ATUAL">Eleitos 2022 / atuais conhecidos</option><option value="2027">Eleitos 2026 / posse 2027</option><option value="TRANSICAO">Comparativo eleitoral</option></select></label>',
        '<label class="ri-wide">BUSCAR<input id="riBusca" type="search" placeholder="nome, partido, UF, estado, situação ou mandato"></label>',
      '</div>',
      '<div class="ri-actions">',
        '<button id="riApply">FILTRAR</button>',
        '<button id="riClear" class="secondary">LIMPAR FILTROS</button>',
        '<button id="riReport" class="secondary">📊 RELATÓRIO EXECUTIVO</button>',
        '<button id="riBriefing" class="secondary">🎯 BRIEFING</button>',
        '<button id="riExportJson" class="secondary">⬇ Exportar base JSON</button>',
      '</div>',
      '<div id="riResults"></div>'
    ].join('');
    if(homeBack && homeBack.parentNode) homeBack.parentNode.insertBefore(section, homeBack.nextSibling);
    else document.querySelector('main.wrap').appendChild(section);
    return section;
  }

  function setActive(){
    document.querySelectorAll('.cmd').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    var btn=q(BTN_ID); if(btn){ btn.classList.add('active'); btn.setAttribute('aria-pressed','true'); }
    var st=q('commandStatus');
    if(st) st.innerHTML='<span class="dot"></span><span><strong>Representação Institucional</strong> • visão executiva ativa</span>';
  }

  function hideAllSections(){
    document.querySelectorAll('section.box').forEach(function(s){ if(s.id !== 'comando') s.classList.add('home-hidden'); });
    var quick=q('quickResult'); if(quick) quick.hidden=true;
  }

  function optionsFrom(rows, key){
    return uniq(rows.map(function(r){ return txt(r[key]); }).filter(Boolean)).sort(function(a,b){ return a.localeCompare(b,'pt-BR'); });
  }

  function refreshFilterOptions(preserve){
    if(!DATA) return;
    var rows = DATA.records || [];
    var reg = q('riRegiao'), uf = q('riUF'), cargo = q('riCargo'), grupo = q('riGrupo'), sit = q('riSituacao');
    var keep = preserve ? {
      regiao: reg.value, uf: uf.value, cargo: cargo.value, grupo: grupo.value, situacao: sit.value
    } : {};
    function fill(sel, values, label, keepVal){
      var old = keepVal || ALL;
      sel.innerHTML = '<option value="'+ALL+'">'+label+'</option>' + values.map(function(v){ return '<option value="'+esc(v)+'">'+esc(v)+'</option>'; }).join('');
      if(values.indexOf(old)>=0) sel.value = old; else sel.value = ALL;
    }
    var regiaoVal = keep.regiao && keep.regiao!==ALL ? keep.regiao : ALL;
    var regionRows = regiaoVal===ALL ? rows : rows.filter(function(r){ return r.regiao===regiaoVal; });
    fill(reg, optionsFrom(rows,'regiao'), 'TODAS AS REGIÕES', keep.regiao);
    fill(uf, optionsFrom(regionRows,'uf'), 'TODAS AS UFs', keep.uf);
    fill(cargo, optionsFrom(rows,'cargo'), 'TODOS OS CARGOS', keep.cargo);
    fill(grupo, optionsFrom(rows,'grupo'), 'TODOS OS GRUPOS', keep.grupo);
    var situacoes = uniq(rows.map(function(r){ return txt(r.situacao_comparativa||r.situacao_pos_2026||r.situacao_atual); }).filter(Boolean)).sort(function(a,b){return a.localeCompare(b,'pt-BR');});
    fill(sit, situacoes, 'TODAS AS SITUAÇÕES', keep.situacao);
  }

  function filteredRows(){
    if(!DATA) return [];
    var rows = (DATA.records || []).slice();
    var regiao = q('riRegiao').value;
    var uf = q('riUF').value;
    var cargo = q('riCargo').value;
    var grupo = q('riGrupo').value;
    var situacao = q('riSituacao').value;
    var visao = q('riVisao').value;
    var busca = txt(q('riBusca').value).toUpperCase();

    if(regiao !== ALL) rows = rows.filter(function(r){ return txt(r.regiao)===regiao; });
    if(uf !== ALL) rows = rows.filter(function(r){ return txt(r.uf)===uf; });
    if(cargo !== ALL) rows = rows.filter(function(r){ return txt(r.cargo)===cargo; });
    if(grupo !== ALL) rows = rows.filter(function(r){ return txt(r.grupo)===grupo; });
    if(situacao !== ALL) rows = rows.filter(function(r){ return txt(r.situacao_comparativa||r.situacao_pos_2026||r.situacao_atual)===situacao; });
    if(visao === 'ATUAL') rows = rows.filter(function(r){ return txt(r.atual_nome_partido); });
    if(visao === '2027') rows = rows.filter(function(r){ return txt(r.substituto_2027_nome_partido); });
    if(visao === 'TRANSICAO') rows = rows.filter(function(r){ return txt(r.substituto_2027_nome_partido) && txt(r.substituto_2027_nome_partido) !== txt(r.atual_nome_partido); });
    if(busca){
      rows = rows.filter(function(r){
        return includes(r.regiao,busca)||includes(r.uf,busca)||includes(r.estado,busca)||includes(r.cargo,busca)||includes(r.grupo,busca)||includes(r.atual_nome_partido,busca)||includes(r.substituto_2027_nome_partido,busca)||includes(r.partido_atual,busca)||includes(r.partido_2027,busca)||includes(r.situacao_atual,busca)||includes(r.situacao_pos_2026,busca)||includes(r.situacao_comparativa,busca);
      });
    }
    return rows;
  }

  function summaryStats(rows){
    var cargos={gov:0,sen:0,dep:0};
    rows.forEach(function(r){
      if(r.cargo==='Governador(a)') cargos.gov++;
      else if(r.cargo==='Senador(a)') cargos.sen++;
      else if(r.cargo==='Deputado(a) federal') cargos.dep++;
    });
    var ufs = uniq(rows.map(function(r){ return r.uf; })).length;
    var transicao = rows.filter(function(r){ return txt(r.substituto_2027_nome_partido) && txt(r.substituto_2027_nome_partido)!==txt(r.atual_nome_partido) && !/permanece/i.test(txt(r.substituto_2027_nome_partido)); }).length;
    return {total:rows.length,ufs:ufs,gov:cargos.gov,sen:cargos.sen,dep:cargos.dep,transicao:transicao};
  }

  function renderSummary(rows){
    var s = summaryStats(rows);
    q('riSummary').innerHTML = [
      card('Registros no recorte', s.total),
      card('UFs alcançadas', s.ufs),
      card('Governadores', s.gov),
      card('Senadores', s.sen),
      card('Deputados federais', s.dep),
      card('Registros com diferença nominal', s.transicao)
    ].join('');
  }
  function card(label, value){ return '<div class="ri-card"><b>'+esc(label)+'</b><span>'+esc(value)+'</span></div>'; }

  function renderTerritorialContext(){
    var box = q('riTerritorialContext');
    if(!box) return;
    var uf=q('riUF').value, reg=q('riRegiao').value;
    var all=(Array.isArray(window.DATA)?window.DATA:(Array.isArray(window.FALLBACK_DATA)?window.FALLBACK_DATA:[]));
    if(uf===ALL && reg===ALL){
      box.innerHTML='<b>Integração territorial:</b> selecione Região ou UF para consultar a quantidade de investimentos do BI com a mesma abrangência. Associação territorial não representa vínculo político com projetos, contratos ou decisões.';
      return;
    }
    var match=all.filter(function(x){
      if(uf!==ALL) return Array.isArray(x.ufs)&&x.ufs.indexOf(uf)>=0;
      return Array.isArray(x.regioes)&&x.regioes.indexOf(reg)>=0;
    });
    box.innerHTML='<b>Recorte territorial do BI:</b> '+esc(match.length)+' investimento(s) na mesma '+(uf!==ALL?'UF '+esc(uf):'região '+esc(reg))+'. Este é apenas um cruzamento geográfico, sem atribuição de responsabilidade por empreendimentos ou recursos.';
  }

  function renderResults(){
    if(!DATA) return;
    var rows = filteredRows();
    renderSummary(rows);
    renderTerritorialContext();
    var out = q('riResults');
    if(!rows.length){
      out.innerHTML = '<div class="ri-empty">Nenhum registro encontrado para o recorte selecionado.</div>';
      return;
    }
    out.innerHTML = '<div class="ri-table-wrap"><table><thead><tr>'+
      '<th>Região</th><th>UF</th><th>Estado</th><th>Cargo</th><th>Eleitos 2022 / autoridades 2026</th><th>Eleitos 2026 / posse 2027</th><th>Situação</th><th>Mandato em curso</th><th>Novo mandato</th><th>Fonte</th>'+
      '</tr></thead><tbody>'+
      rows.map(function(r){
        var sit = txt(r.situacao_comparativa||r.situacao_pos_2026||r.situacao_atual||'—');
        var m1 = (fmtDate(r.mandato_atual_inicio)||'—')+' → '+(fmtDate(r.mandato_atual_fim)||'—');
        var m2 = (fmtDate(r.mandato_2027_inicio)||'—')+' → '+(fmtDate(r.mandato_2027_fim)||'—');
        var fonte = txt(r.fonte_oficial||'Base consolidada V13');
        return '<tr>'+
          '<td>'+esc(r.regiao)+'</td>'+
          '<td><span class="ri-badge">'+esc(r.uf)+'</span></td>'+
          '<td>'+esc(r.estado)+'</td>'+
          '<td>'+esc(r.cargo)+'</td>'+
          '<td><strong>'+esc(r.atual_nome_partido||'—')+'</strong><div class="ri-muted">'+esc(r.partido_atual||r.origem_atual||'—')+'</div></td>'+
          '<td><strong>'+esc(r.substituto_2027_nome_partido||'—')+'</strong><div class="ri-muted">'+esc(r.partido_2027||r.resultado_2026||'—')+'</div></td>'+
          '<td>'+esc(sit)+'</td>'+
          '<td>'+esc(m1)+'</td>'+
          '<td>'+esc(m2)+'</td>'+
          '<td><div class="ri-muted">'+esc(fonte)+'</div></td>'+
        '</tr>';
      }).join('')+
      '</tbody></table></div>';
  }

  function filterContext(){
    var pairs=[];
    [['Região','riRegiao'],['UF','riUF'],['Cargo','riCargo'],['Grupo','riGrupo'],['Situação','riSituacao'],['Visão','riVisao']].forEach(function(p){
      var el=q(p[1]);
      if(el && el.value && el.value!==ALL && el.value!=='TODAS') pairs.push('<b>'+esc(p[0])+':</b> '+esc(el.value));
    });
    var busca=txt(q('riBusca').value); if(busca) pairs.push('<b>Busca:</b> '+esc(busca));
    return pairs.length ? pairs.join(' · ') : 'Sem filtros adicionais.';
  }

  function reportHtml(mode){
    var rows = filteredRows();
    var s = summaryStats(rows);
    var title = mode==='briefing' ? 'BRIEFING — REPRESENTAÇÃO INSTITUCIONAL' : 'RELATÓRIO EXECUTIVO — REPRESENTAÇÃO INSTITUCIONAL';
    var intro = mode==='briefing'
      ? 'Síntese institucional do recorte selecionado, com foco em composição federativa, mandatos em curso e transição para 2027.'
      : 'Relatório consolidado do recorte selecionado, com foco em composição federativa, mandatos e representação por região e UF.';
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+
      'body{font-family:Arial,sans-serif;margin:24px;color:#13273f}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:18px 0 8px;border-bottom:1px solid #cbd5e1;padding-bottom:4px}.meta{font-size:12px;color:#5b7084}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}.card{border:1px solid #d7e0e6;border-radius:10px;padding:10px}.card b{display:block;font-size:11px;text-transform:uppercase;color:#36546d;margin-bottom:4px}.card span{font-size:18px;font-weight:800}.ctx{background:#eef7ff;border-left:4px solid #173d63;padding:10px 12px;margin:14px 0}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #ccd9dd;padding:6px;vertical-align:top;text-align:left}th{background:#eef4f8}@media print{body{margin:0.6cm}button{display:none}}' +
      '</style></head><body>'+
      '<h1>'+esc(title)+'</h1>'+
      '<div class="meta">BI Executivo de Hidrovias e Navegação Interior · DPP/SNHN · Base política institucional v13-ri · Corte: '+esc((DATA.metadata&&DATA.metadata.data_corte)||'09/10/2026')+' · Emitido em: '+esc(new Date().toLocaleString('pt-BR'))+'</div>'+
      '<p>'+intro+'</p><p><b>Nota metodológica:</b> para deputados, a coluna 2022 contém os eleitos em 2022, não necessariamente a composição em exercício em outubro de 2026; a coluna 2027 apresenta os eleitos em 2026. Não há sucessão individual por cadeira proporcional.</p>'+
      '<div class="ctx"><b>Filtros aplicados:</b> '+filterContext()+'</div>'+
      '<div class="grid">'+
        '<div class="card"><b>Registros</b><span>'+esc(s.total)+'</span></div>'+
        '<div class="card"><b>UFs</b><span>'+esc(s.ufs)+'</span></div>'+
        '<div class="card"><b>Governadores</b><span>'+esc(s.gov)+'</span></div>'+
        '<div class="card"><b>Senadores</b><span>'+esc(s.sen)+'</span></div>'+
      '</div>'+
      '<div class="grid">'+
        '<div class="card"><b>Deputados federais</b><span>'+esc(s.dep)+'</span></div>'+
        '<div class="card"><b>Transições</b><span>'+esc(s.transicao)+'</span></div>'+
        '<div class="card"><b>Fonte-base</b><span>V13</span></div>'+
        '<div class="card"><b>Escopo</b><span>Região/UF</span></div>'+
      '</div>'+
      '<h2>Relação nominal — dois recortes eleitorais distintos</h2>'+
      '<table><thead><tr><th>Região</th><th>UF</th><th>Estado</th><th>Cargo</th><th>Atual</th><th>2027</th><th>Situação</th><th>Mandato atual</th><th>Mandato 2027</th></tr></thead><tbody>'+
      rows.map(function(r){
        return '<tr><td>'+esc(r.regiao)+'</td><td>'+esc(r.uf)+'</td><td>'+esc(r.estado)+'</td><td>'+esc(r.cargo)+'</td><td>'+esc(r.atual_nome_partido||'—')+'</td><td>'+esc(r.substituto_2027_nome_partido||'—')+'</td><td>'+esc(r.situacao_comparativa||r.situacao_pos_2026||r.situacao_atual||'—')+'</td><td>'+esc(fmtDate(r.mandato_atual_inicio)+' → '+fmtDate(r.mandato_atual_fim))+'</td><td>'+esc(fmtDate(r.mandato_2027_inicio)+' → '+fmtDate(r.mandato_2027_fim))+'</td></tr>';
      }).join('')+
      '</tbody></table></body></html>';
  }

  function openReport(mode){
    var w = window.open('', '_blank');
    if(!w) return;
    w.document.write(reportHtml(mode));
    w.document.close();
  }

  function bindEvents(){
    q('riApply').onclick = renderResults;
    q('riClear').onclick = function(){
      ['riRegiao','riUF','riCargo','riGrupo','riSituacao','riVisao'].forEach(function(id){ var el=q(id); if(el) el.value = id==='riVisao' ? 'TODOS' : ALL; });
      q('riBusca').value='';
      refreshFilterOptions(false);
      renderResults();
    };
    q('riReport').onclick = function(){ openReport('relatorio'); };
    q('riBriefing').onclick = function(){ openReport('briefing'); };
    q('riExportJson').onclick = function(){ var blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json;charset=utf-8'}); var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url;a.download='representacao_institucional_v13.json';a.click();setTimeout(function(){URL.revokeObjectURL(url)},1500); };
    q('riRegiao').onchange = function(){ refreshFilterOptions(true); renderResults(); };
    ['riUF','riCargo','riGrupo','riSituacao','riVisao'].forEach(function(id){ var el=q(id); if(el) el.onchange=renderResults; });
    q('riBusca').addEventListener('input', renderResults);
  }

  function updateMeta(){
    if(!DATA) return;
    var md = DATA.metadata || {};
    var meta = q('riMeta');
    if(meta){
      meta.innerHTML = '<b>Base técnica:</b> '+esc(md.titulo||'Representação Institucional')+' · <b>Versão:</b> '+esc(md.versao||'v13-ri')+' · <b>Data de corte:</b> '+esc(md.data_corte||'09/10/2026')+' · <b>Origem:</b> '+esc(md.base_origem||'Planilha V13')+'.';
    }
    var footer = q('biFooter');
    if(footer && footer.innerHTML.indexOf('Representação Institucional')<0){
      footer.innerHTML = footer.innerHTML.replace('dados sujeitos à validação das fontes oficiais','Representação Institucional v13 · dados sujeitos à validação das fontes oficiais');
    }
  }

  function bootView(){
    injectCss();
    ensureButton();
    ensureView();
    refreshFilterOptions(false);
    bindEvents();
    updateMeta();
    renderResults();
    addMainReportIntegration();
  }

  window.openRepresentacaoInstitucional = function(){
    hideAllSections();
    var section = q(VIEW_ID) || ensureView();
    section.classList.remove('home-hidden');
    var back=q('homeBack'); if(back) back.style.display='block';
    setActive();
    if(!DATA){
      q('riResults').innerHTML = '<div class="ri-empty">Carregando base institucional...</div>';
      loadData().then(function(){ renderResults(); }).catch(function(err){ q('riResults').innerHTML='<div class="ri-empty">Não foi possível carregar a base institucional: '+esc(err&&err.message||err)+'</div>'; });
    } else {
      renderResults();
    }
    section.scrollIntoView({behavior:'smooth', block:'start'});
    return false;
  };

  function inflatePackedText(text){
    if(typeof DecompressionStream!=='function'){
      return Promise.reject(new Error('Este navegador não suporta a leitura local da base compactada. Atualize o Chrome, Edge, Firefox ou Safari.'));
    }
    var bytes=Uint8Array.from(atob(text.replace(/\s+/g,'')),function(c){return c.charCodeAt(0)});
    var stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  }

  function normalizedRecord(row, info){
    var uf=row[0], cargo=row[1], meta=(info.ufs||{})[uf]||['—','—'];
    return {
      regiao:meta[0],uf:uf,estado:meta[1],cargo:cargo,
      grupo:cargo==='Governador(a)'?'Executivo estadual':'Legislativo federal',
      atual_nome_partido:row[2],substituto_2027_nome_partido:row[3],
      situacao_comparativa:row[4],situacao_pos_2026:row[5],
      mandato_atual_inicio:row[6],mandato_atual_fim:row[7],
      mandato_2027_inicio:row[8],mandato_2027_fim:row[9],
      partido_atual:row[10],partido_2027:row[11],
      fonte_oficial:cargo==='Deputado(a) federal'?info.fontes.camara_2026:(cargo==='Senador(a)'?info.fontes.senado:'Base V13 — conferir portais estaduais'),
      data_referencia:info.data_corte
    };
  }

  function loadData(){
    if(DATA) return Promise.resolve(DATA);
    return fetch(DATA_URL,{cache:'no-store'})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
      .then(inflatePackedText)
      .then(function(text){
        var packed=JSON.parse(text);
        if(packed.schema!=='ri-1'||!Array.isArray(packed.records)) throw new Error('Esquema de dados não reconhecido.');
        DATA={metadata:{titulo:'Representação Institucional',versao:'v13-ri',data_corte:'09/10/2026',base_origem:packed.fonte_planilha,observacao:packed.observacao},sources:packed.fontes,records:packed.records.map(function(r){return normalizedRecord(r,packed)})};
        return DATA;
      });
  }

  function addMainReportIntegration(){
    function buildBox(targetId,checkboxId){
      var parent=q(targetId); if(!parent||q(checkboxId))return;
      var wrap=document.createElement('div');wrap.className='sourcebar';
      wrap.innerHTML='<label style="display:flex;gap:9px;align-items:flex-start;cursor:pointer"><input type="checkbox" id="'+checkboxId+'" style="width:18px;height:18px;flex:none;margin:1px 0 0"><span><b>Incluir representação institucional no relatório</b><br><small>Apenas para a UF selecionada no filtro principal. Sem vínculo causal entre parlamentares e investimentos.</small></span></label>';
      var actions=parent.querySelector('.actions,.exec-actions'); if(actions)parent.insertBefore(wrap,actions);
      else parent.appendChild(wrap);
    }
    buildBox('docs','riIncludeDocs');
    buildBox('produtos-executivos','riIncludeProduto');
    function attach(id,checkboxId){
      var c=q(checkboxId),target=q(id);
      if(!c||!c.checked||!target||!DATA)return;
      var ufSel=q('uf'), uf=ufSel&&ufSel.value;
      if(!uf||uf===ALL){
        var note=document.createElement('p');note.className='sourcebar';note.textContent='Representação Institucional: selecione uma UF no filtro territorial principal para incluir a relação nominal. Nenhum dado político foi associado automaticamente ao empreendimento.';
        target.appendChild(note);return;
      }
      var rows=DATA.records.filter(function(r){return r.uf===uf});
      if(!rows.length)return;
      var div=document.createElement('div');div.className='reportsection';div.setAttribute('data-ri-report','1');
      div.innerHTML='<h3>Representação Institucional — '+esc(uf)+'</h3><p><small>Corte 09/10/2026. Para deputados: comparação de eleitos 2022 com eleitos 2026; não comprova exercício em outubro de 2026 nem sucessão individual. Informação apenas contextual.</small></p>'+
        '<table class="rtable"><thead><tr><th>Cargo</th><th>Eleitos 2022 / atual</th><th>Eleitos 2026 / 2027</th><th>Situação</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+esc(r.cargo)+'</td><td>'+esc(r.atual_nome_partido||'—')+'</td><td>'+esc(r.substituto_2027_nome_partido||'—')+'</td><td>'+esc(r.situacao_comparativa||r.situacao_pos_2026||'—')+'</td></tr>'}).join('')+'</tbody></table>';
      target.appendChild(div);
    }
    if(typeof window.doc==='function'&&!window.doc.__riWrapped){
      var oldDoc=window.doc;
      window.doc=function(){var res=oldDoc.apply(this,arguments);attach('doc','riIncludeDocs');return res;};
      window.doc.__riWrapped=true;
    }
    if(typeof window.gerarProdutoV51==='function'&&!window.gerarProdutoV51.__riWrapped){
      var oldProduct=window.gerarProdutoV51;
      window.gerarProdutoV51=function(){var res=oldProduct.apply(this,arguments);attach('produtoV51','riIncludeProduto');return res;};
      window.gerarProdutoV51.__riWrapped=true;
    }
  }

  function init(){
    injectCss();
    ensureButton();
    ensureView();
    loadData().then(bootView).catch(function(err){
      var meta = q('riMeta');
      if(meta) meta.innerHTML = '<b>Base técnica:</b> indisponível no momento. Motivo: '+esc(err&&err.message||err)+'.';
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();