# Consulta SIOP BI — integração Google Drive

## Regra

Os campos orçamentários e financeiros do Relatório Executivo são alimentados pela base **Consulta SIOP BI** do Google Drive.

O fluxo é:

1. Google Sheets `Consulta SIOP BI`.
2. Apps Script público somente-leitura da consulta.
3. GitHub Actions baixa os 156 registros.
4. `data/siop_relacionamentos.json` define quais chaves Ano + Ação + PO + Grupo podem alimentar cada investimento.
5. O workflow gera `data/siop_hidrovias_public.json`.
6. O frontend usa esse snapshot para Ação, PO, LOA/Dotação Atual, Empenhado, Liquidado, Pago e Saldo a Empenhar.

Quando um investimento não possui relacionamento habilitado, o BI informa explicitamente que a Consulta SIOP BI foi consultada, mas não atribui valores por aproximação.

## Atualização

O workflow executa diariamente e também quando a matriz `data/siop_relacionamentos.json` é alterada.
