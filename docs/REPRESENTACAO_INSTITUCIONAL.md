# Representação Institucional — BI Hidrovias

**Versão:** v13-ri · **Data de corte:** 09/10/2026 · **Fonte inicial:** planilha Base Político-Institucional V13.

## Acesso e funcionamento
Na **Navegação Executiva**, clique em **🏛️ Representação Institucional**. O novo painel permite selecionar Região → UF, Cargo, Grupo, Situação e Visão, além de pesquisar nome ou partido. Use **FILTRAR** e **LIMPAR FILTROS** para controlar o recorte. O botão **RELATÓRIO EXECUTIVO** abre um relatório imprimível; **BRIEFING** mostra a síntese; **Exportar base JSON** disponibiliza os dados abertos do módulo.

O bloco de integração territorial compara apenas Região/UF com os investimentos da carteira do BI, **sem atribuir investimento, recurso, projeto ou decisão a um agente político**.

## Inclusão nos relatórios preexistentes
1. Selecione a UF no filtro territorial principal do BI.
2. Abra **Relatório Executivo / Briefing** ou **Produtos executivos**.
3. Marque **Incluir representação institucional no relatório**.
4. Gere o documento normalmente. A seção contextual será adicionada ao final, sem remover os quadros originais.

A opção é facultativa e é restrita à UF selecionada. Sem UF selecionada, aparece aviso solicitando recorte territorial, não uma lista nacional indevida.

## Composição da base
- 27 linhas de governadores e 81 linhas de senadores (corte 09/10/2026).
- 513 eleitos em 2022 e 513 eleitos em 2026 para a Câmara, cruzados em 735 registros nominais comparativos.
- Somatório lógico: 843 registros comparativos (não representa 843 autoridades em exercício simultâneo).
- Datas e partidos mantidos da planilha recebida.

**Atenção:** a lista de eleitos em 2022 NÃO equivale à composição integral em exercício em outubro de 2026. Emendas de partidos, suplências, renúncias e licenças exigem consulta atualizada. Tampouco existe substituição individual de deputados federais entre duas legislaturas; a eleição segue o sistema proporcional.

## Estrutura e manutenção
- `assets/representacao_institucional.js`: renderização isolada e inclusão facultativa de dados nos relatórios principais.
- `data/representacao_institucional_v13.json.gz.b64`: JSON V13 comprimido com gzip e codificado em base64, um snapshot público, descompactado no navegador.
- `index.html`: uma única chamada adicional ao JS.
- `sw.js`: atualização de cache para o novo recurso.

Para atualizar a base sem modificar a interface: converter a nova planilha em JSON seguindo o esquema `ri-1`, comprimir com gzip, codificar em base64 e substituir o arquivo em `data/`; atualizar corte e versão também no script/README. Nunca publicar documentos internos SEI ou dados restritos no GitHub Pages, que é público.

## Fontes
- Câmara eleitos em 2022: https://www.camara.leg.br/internet/agencia/infograficos-html5/tabelasEleicoes/deputados-eleitos-estado/index.html
- Câmara eleitos em 2026: https://www.camara.leg.br/internet/agencia/infograficos-html5/eleicoes2026/deputados-eleitos-estado.html
- Senado em exercício: https://www25.senado.leg.br/web/senadores/em-exercicio/-/e/por-nome

## Testes recomendados após publicação
1. Iniciar a página e verificar a presença do ícone em desktop e celular.
2. Filtrar Norte → RR e procurar Marcos Jorge (REPUBLICANOS) na coluna da posse 2027.
3. Limpar filtros e confirmar 843 registros comparativos.
4. Emitir briefing e relatório com UF específica e conferir partido em cada nome.
5. Voltar à tela inicial e verificar os módulos Investimentos, Recorte Territorial, Concessões, Sugestões, Fontes e Atualização.
6. Selecionar uma UF no painel principal e testar a marcação facultativa no Relatório Executivo e nos Produtos Executivos.


## Evolução — recorte integrado e produtos executivos (09/10/2026)

O painel inicial exibe uma faixa compacta **Recorte territorial integrado** com Região e UF. A seleção é compartilhada automaticamente com os módulos **Recorte Territorial**, **Sugestões de Investimentos Hidroviários** e **Representação Institucional**, sem exigir nova abertura de módulos.

Além dos filtros da faixa, alterações nos selects Região/UF dos três módulos também são propagadas aos demais. Município e Hidrovia são compartilhados apenas entre as bases que possuem esses campos; políticos não são associados indevidamente a municípios, projetos ou rios. Filtros especializados (tipo, maturidade, prioridade, partido e cargo) continuam restritos à respectiva base.

No ícone **Representação Institucional**, os botões **Relatório Executivo** e **Briefing** produzem documentos com identificação da UF/região, governadores, senadores, deputados federais, mandatos, comparação eleitoral para 2027, composição partidária, fonte e limites metodológicos. O botão **Prévia do Relatório** abre uma pré-visualização dentro do próprio ícone. O documento abre em nova janela com controle **Imprimir / salvar PDF** e folha A4 em orientação paisagem.

O relatório contextualiza também os investimentos da base principal e as sugestões da `Carteira_Governadores`, acessada em segundo plano sem abrir manualmente o módulo. Os números são recortes geográficos independentes, sem inferir apoio, destinação de verbas ou autoria política de investimentos. Se não houver correspondência na base, o sistema registra o dado como não localizado no recorte, sem criar dados fictícios.

### Teste prático
1. Na página inicial, selecione Norte → RR na faixa integrada.
2. Abra Representação Institucional e observe a seleção Norte → RR automaticamente ativa.
3. Gere Relatório Executivo e confira Marcos Jorge (REPUBLICANOS) na relação da legislatura de 2027.
4. Altere a UF para AC no próprio módulo; volte ao Recorte Territorial e verifique a atualização automática.
5. Abra Sugestões de Investimentos Hidroviários e confira a UF herdada; escolha outra região/UF e verifique retorno ao recorte dos demais módulos.
6. Abra a prévia, imprima e verifique as colunas, as fontes e a nota de não sucessão individual no sistema proporcional.
7. Teste também em celular e com o botão Limpar Recorte.

### Arquivos envolvidos
- `assets/territorial_sync.js`: distribuição de filtros sem mudança automática de tela.
- `assets/representacao_relatorios.js`: geração de relatórios, prévia e contexto hidroviário.
- `assets/representacao_institucional.js`: interface da representação e API de leitura do recorte.
- `index.html`: ponte pública para consultas territoriais à base da Carteira_Governadores.
- `sw.js`: cache das duas novas extensões no modo aplicativo.


## Página Executiva em janela integrada — atualização 09/10/2026

O novo botão **📑 Abrir Página Executiva**, dentro de **Representação Institucional**, abre uma página em janela interna ao BI, com o mesmo padrão visual de relatório executivo usado no módulo **Sugestões de Investimentos Hidroviários**: cabeçalho azul, botão **Imprimir / PDF**, botão **Fechar**, síntese executiva e quadros de apoio à decisão.

### Como utilizar
1. Escolha Região e UF na faixa de **Recorte territorial integrado**, no Recorte Territorial ou na própria Representação Institucional.
2. Entre em **Representação Institucional** e clique em **📑 Abrir Página Executiva**.
3. Confira o cabeçalho com o recorte, a síntese de governadores, senadores e deputados, os pontos para acompanhamento, os mandatos e os registros hidroviários do território.
4. Use **🖨 Imprimir / PDF** para abrir o diálogo de impressão do navegador e salvar em PDF; a saída está configurada em A4 paisagem com cores e tabelas.
5. Use **Fechar ✕** ou a tecla **Esc** para voltar à tela anterior sem perder os filtros.

O botão original **Relatório Executivo** (em nova aba), o **Briefing** e a **Prévia do Relatório** continuam disponíveis. A janela integrada responde a alterações dos filtros sincronizados enquanto estiver aberta.

**Critério de integridade:** a composição parlamentar distingue eleitos em 2022 dos eleitos para 2027; não apresenta um eleito proporcional como substituto individual. A relação com investimentos e sugestões é apenas geográfica, sem atribuição de autoria, apoio ou destinação de recursos políticos. Quando a fonte de sugestões estiver indisponível, o relatório identifica essa limitação.

**Arquivos:** \`assets/representacao_modal_executivo.js\` (janela visual), \`assets/representacao_relatorios.js\` (conteúdo do relatório), \`index.html\` (carregamento) e \`sw.js\` (cache atualizado).
