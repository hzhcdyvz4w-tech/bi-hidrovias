# BI Executivo de Hidrovias e Navegação

Página principal: https://hzhcdyvz4w-tech.github.io/bi-hidrovias/

## Arquitetura atual

- `index.html` — BI v74 com módulo SIOP autônomo e fallback embutido.
- `BI_Executivo_Hidrovias_v74_SIOP_AUTONOMO.html` — mesma versão autônoma para homologação.
- `bi_hidrovias_public.json` — snapshot da base principal, atualizado a partir do Google Drive por GitHub Actions.
- `siop_hidrovias_public.json` — snapshot SIOP homologado.
- `.github/workflows/update-siop.yml` — rotina diária de atualização e validação.

A interface mantém dados embutidos de contingência para continuar operando quando a rede, o GitHub Pages ou a fonte externa estiverem indisponíveis. Relações SIOP marcadas como “SIM - PROVISÓRIO” continuam sujeitas à validação documental.
