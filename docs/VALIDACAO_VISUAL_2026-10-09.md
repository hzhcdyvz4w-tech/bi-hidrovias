# Validação visual do BI Hidrovias — 09/10/2026

## Resultado
**APROVADO** — teste de navegação e impressão com Chromium (Playwright), em navegador real e em ambiente local servido pelo próprio repositório.

- Execução: https://github.com/hzhcdyvz4w-tech/bi-hidrovias/actions/runs/37988518594
- Commit testado: `a65319feca0eb3ef283254dfcc3c4fece5dfab3d`
- Artefato: **capturas-bi-representacao-institucional** (sete capturas; disponível no link da execução)
- Base: 843 registros comparativos (27 governadores, 81 senadores, 735 correspondências de deputados entre as duas eleições).

## Conferências
1. Tela inicial exibe o ícone **Representação Institucional**.
2. O código JavaScript **não** aparece como texto na página.
3. A função legada `v73Print` permanece presente.
4. O módulo carrega a base compactada com 843 registros.
5. Filtros encadeados Norte → RR funcionam.
6. Marcos Jorge (REPUBLICANOS) aparece no recorte de RR para a legislatura de 2027.
7. Relatório institucional é aberto em uma nova página, com o recorte de RR.
8. Briefing institucional abre corretamente.
9. Botão **Voltar à tela inicial** preserva o funcionamento.
10. Ícone **Investimentos** abre sua tabela rápida original.
11. Relatório Executivo legado abre, preservando a inclusão institucional como opção facultativa.
12. Não há exceções JavaScript não tratadas durante o roteiro de testes.

## Causa e correção
Uma inclusão anterior do elemento `<script defer ...>` ocorreu por engano dentro de uma string usada pela rotina de impressão. O parser HTML encontrou o fechamento de script indevido, encerrou uma rotina antecipadamente e exibiu código-fonte como texto na página. A chamada foi movida para o final real do `index.html`.

Além disso, os scripts legados buscavam a variável global `DATA` antes da sua inicialização. A base embarcada agora define `DATA` junto com `FALLBACK_DATA`, antes da execução dos módulos dependentes. O processo de sincronização da base dinâmica posterior foi preservado.

## Alcance do teste
Este teste certifica a **navegação e as saídas do módulo em Chromium** no commit indicado. Não valida materialmente a correção de cada filiação partidária, partido, mandato, suplência ou resultado eleitoral, que exigem conferência nas fontes oficiais. Não substitui testes de impressão física em impressoras locais nem uma auditoria de todas as funções do BI de Concessões.

## Registro da versão
- Fonte: planilha Base Político-Institucional V13, corte 09/10/2026.
- Arquivo de dados: `data/representacao_institucional_v13.json.gz.b64`.
- Front-end: `assets/representacao_institucional.js`.
- Teste reproduzível: `tests/representacao-smoke.cjs`, acionado por `.github/workflows/validar-representacao.yml`.
