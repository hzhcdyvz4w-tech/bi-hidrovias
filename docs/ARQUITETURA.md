# Arquitetura do BI Executivo de Hidrovias

## Fluxo de dados

1. **Google Sheets / bases autorizadas** — origem da base principal e das tabelas SIOP.
2. **Validação** — chaves, quantidade de investimentos e relacionamentos habilitados são checados antes da publicação.
3. **Snapshots públicos** — arquivos JSON em `data/`.
4. **Aplicação** — `index.html` consome os snapshots no mesmo domínio e mantém dados embarcados de contingência.
5. **GitHub Pages** — publicação estática da interface.

## Filtros

A carteira usa: Região → UF → Município/Abrangência → Hidrovia/Rio → Tipo → Empreendimento.

A execução SIOP usa o recorte da carteira e permite refinamento adicional por: Região → UF → Município/Abrangência → Hidrovia/Rio → Tipo → Ação → Plano Orçamentário → Grupo de Despesa → Investimento → Exercício.

## Orçamento

- **LOA** e **PLOA** são apresentados separadamente.
- Exercícios não são tratados como equivalentes.
- O relatório executivo só exibe valores SIOP quando o investimento possui relacionamento habilitado.
- Relações “SIM - PROVISÓRIO” continuam sujeitas à validação documental.

## Publicação

A versão visível fica em `index.html`. Cópias de referência ficam em `releases/`. Arquivos de teste não devem permanecer na raiz.


## PLOA 2027

A camada PLOA 2027 é independente da LOA/execução 2026.

- `data/ploa_2027_raw.json` — transcrição estruturada da Unidade 68101, Programa 3105.
- `data/ploa_2027_relacionamentos.json` — governança dos vínculos investimento ↔ ação/localizador.
- `data/ploa_2027_public.json` — camada consumida pelo frontend.

Regra de precedência: a Unidade **68101 - Administração Direta** prevalece por ser mais específica e detalhada; o Órgão **68000** é mantido apenas para controle consolidado.

Relações PLOA podem ser CONFIRMADO, COMPATÍVEL, COMPARTILHADO ou NÃO RELACIONADO. Valores não exclusivos são exibidos como **orçamento relacionado à fonte**, nunca como valor exclusivo do empreendimento.
