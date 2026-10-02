# BI Executivo de Hidrovias — v88 FINAL

## Hierarquia de fontes do Relatório Executivo

1. **BI_DPP_SNHN_v36_ATUALIZACAO_DIARIA_28-09-2026.xlsx**
   - Base de cobertura territorial, cadastral e contratual dos 19 investimentos.
   - Usada como fallback para todas as UFs/empreendimentos da carteira.
2. **Consulta SIOP BI**
   - Substitui o fallback v36 nos valores monetários quando existe relacionamento SIOP direto ou compartilhado validado.
3. **PLOA 2027**
   - Usado quando existe vínculo governado; sem vínculo, o relatório informa a condição registrada na base v36 sem inventar valores.
4. **Base SEI local**
   - Execução física, repasse e término quando os pacotes SEI são importados.

## Correção principal

Empreendimentos sem vínculo SIOP (por exemplo concessões e outros itens de UFs fora do núcleo SIOP atual) não exibem mais repetidamente “Consulta SIOP sem relacionamento” como se fosse falha do relatório. O relatório usa a base v36 e informa exatamente o que a v36 possui e o que ela não individualiza.

## Cobertura

- 19/19 investimentos da carteira com correspondência na projeção v36.
- Cobertura UF preservada a partir da própria carteira v36.
- Dados SIOP já funcionais permanecem prioritários e não foram removidos.
