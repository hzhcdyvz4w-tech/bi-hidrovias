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
