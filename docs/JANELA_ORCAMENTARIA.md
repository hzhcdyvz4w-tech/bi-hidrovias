# Janela Orçamentária

O módulo cruza três dimensões:

- **Base SEI local**: execução física, valor de repasse e data de término.
- **Consulta SIOP BI**: execução financeira, definida como Pago / Dotação Atual.
- **Carteira do BI**: filtros territoriais e identificação do investimento.

## Regra

1. Determina o valor correspondente à execução física:
   - usa valor monetário físico explícito no SEI; ou
   - Repasse × % execução física.
2. Calcula excedente = Repasse − valor físico considerado.
3. Se excedente > 0, busca destino elegível.
4. Destino elegível: físico >= financeiro e término futuro conhecido.
5. Prioridade: término mais próximo; desempate pela maior folga físico − financeiro.

A saída é uma proposta técnica de remanejamento, não uma alteração orçamentária automática.

## Privacidade

Os indicadores SEI são lidos do IndexedDB local do navegador. Nada é enviado ao GitHub.
