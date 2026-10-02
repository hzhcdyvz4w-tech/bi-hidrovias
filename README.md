# BI Executivo de Hidrovias e Navegação Interior

Painel executivo da DPP/SNHN para acompanhamento da carteira de investimentos, execução físico-orçamentária, contratos, concessões, fontes e produtos de assessoramento.

**Acesso:** https://hzhcdyvz4w-tech.github.io/bi-hidrovias/

## Estrutura

- `index.html` — aplicação publicada no GitHub Pages.
- `data/bi_hidrovias_public.json` — snapshot da base principal.
- `data/siop_hidrovias_public.json` — snapshot SIOP homologado e matriz de relacionamentos habilitados.
- `releases/BI_Executivo_Hidrovias_v74_PRODUCAO.html` — cópia nominada da aplicação publicada.
- `docs/ARQUITETURA.md` — arquitetura, regras de integração e manutenção.
- `.github/workflows/update-data.yml` — rotina de atualização/validação dos snapshots.

## Regras de integridade

A aplicação não associa valores orçamentários por semelhança nominal. Somente relacionamentos habilitados entram na execução SIOP. Ausências permanecem identificadas como **DADO NÃO LOCALIZADO / NECESSITA VALIDAÇÃO**.

A interface possui snapshot embarcado para contingência local; no ambiente online, os snapshots em `data/` são consultados no mesmo domínio do GitHub Pages.
