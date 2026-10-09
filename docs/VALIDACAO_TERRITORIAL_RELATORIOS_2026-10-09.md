# Conferência visual — integração territorial e relatórios institucionais

**Data:** 09/10/2026  
**Resultado:** APROVADO em teste automatizado no Google Chrome (Playwright), servindo localmente a mesma aplicação do repositório.

**Execução aprovada:** https://github.com/hzhcdyvz4w-tech/bi-hidrovias/actions/runs/37990773287  
**Código testado:** `c449e2a63344270a6ec94b01c320c8251961a9a3`  
**Capturas:** artefato `capturas-bi-representacao-institucional` da execução, disponível por sete dias.

## Itens verificados

- O painel inicial mantém seus ícones e apresenta a faixa **Recorte territorial integrado**.
- Seleção Norte → RR pela faixa principal atualiza o filtro original e a Representação Institucional.
- Limpar o recorte faz o módulo institucional voltar a TODAS as UFs.
- Representação Institucional mantém 843 registros comparativos da base V13 (não são 843 cadeiras).
- Marcos Jorge (REPUBLICANOS) aparece no recorte de Roraima para a legislatura de 2027.
- O Relatório Executivo próprio abre e traz composição de mandatos e contexto técnico da carteira de investimentos e sugestões.
- O Briefing Executivo abre.
- A **Prévia do Relatório** é apresentada dentro do ícone e pode ser fechada.
- Ao selecionar outra UF no ícone institucional, o filtro territorial principal é sincronizado.
- Ao selecionar Sul → RS no Recorte Territorial, a Representação Institucional herda o recorte.
- O módulo Sugestões de Investimentos recebe Sul → RS automaticamente quando aberto.
- Ao selecionar Norte → AM nas Sugestões, o recorte é transmitido ao BI principal e à Representação Institucional.
- O botão Limpar Filtros nas Sugestões propaga a limpeza.
- A navegação para os ícones Investimentos e Relatório Executivo legados permanece funcional.
- O relatório legado mantém o campo opcional de inclusão da representação institucional.
- O novo módulo é utilizável em viewport móvel de 390 px.
- Não houve exceções JavaScript não tratadas na execução aprovada.

## Correções históricas preservadas

A função `formatValidation`, utilizada no recorte principal para apresentar estados dos sistemas estruturantes (SIOP, SIAFI e correlatos), estava ausente. Foi restaurada com representação textual de status, data de consulta e ressalvas, evitando quebra da interface quando filtros provocam re-renderização.

## Limites

A conferência valida interações e geração de documentos em Chrome automatizado, não certifica individualmente filiações, resultados e suplências, nem avalia todos os módulos de concessões. A correspondência entre representante e investimentos é exclusivamente **territorial**, não causal ou partidária. A base histórica de eleitos de 2022 não comprova a relação completa de deputados em exercício em outubro de 2026.
