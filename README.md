# BI Executivo de Hidrovias e Navegação Interior

Painel executivo da DPP/SNHN para acompanhamento da carteira de investimentos, execução físico-orçamentária, contratos, concessões, fontes e produtos de assessoramento.

**Acesso:** https://hzhcdyvz4w-tech.github.io/bi-hidrovias/

## Estrutura

- `index.html` — aplicação publicada no GitHub Pages.
- `data/bi_hidrovias_public.json` — snapshot da base principal.
- `data/siop_hidrovias_public.json` — snapshot SIOP homologado e matriz de relacionamentos habilitados.
- `data/ploa_2027_raw.json` — base PLOA 2027 estruturada da Unidade 68101.
- `data/ploa_2027_relacionamentos.json` — governança dos vínculos PLOA 2027.
- `data/ploa_2027_public.json` — camada PLOA 2027 consumida pela aplicação.
- `data/politica_hidroviaria_regional_2026.json` — manifesto da base exclusiva do módulo Sugestões de Investimentos Hidroviários, derivada da aba `Carteira_Governadores`; os dados compactados estão em `data/carteira_governadores_2026/`.
- `data/concessoes_matriz_consultas_povos_2026.json` — matriz de AIR, EVTEA/modelagem, participação social, consulta pública, audiência, CLPI e povos originários por sistema hidroviário.
- `releases/BI_Executivo_Hidrovias_v74_PRODUCAO.html` — cópia nominada da aplicação publicada.
- `docs/ARQUITETURA.md` — arquitetura, regras de integração e manutenção.
- `.github/workflows/update-data.yml` — rotina de atualização/validação dos snapshots.

## Regras de integridade

A aplicação não associa valores orçamentários por semelhança nominal. Somente relacionamentos habilitados entram na execução SIOP. Ausências permanecem identificadas como **DADO NÃO LOCALIZADO / NECESSITA VALIDAÇÃO**.

A interface possui snapshot embarcado para contingência local; no ambiente online, os snapshots em `data/` são consultados no mesmo domínio do GitHub Pages.


## Módulo integrado — Concessões Hidroviárias
O BI Executivo de Concessões Hidroviárias foi incorporado a este repositório em `/concessoes/` e permanece sincronizado com o espelho `/concessoes-v10/`. O botão **Concessões** da Navegação Executiva abre o módulo internamente, mantendo este repositório como projeto principal.

**Segurança:** este repositório é público. Não versionar documentos SEI, dados pessoais, credenciais ou informação interna/restrita. O importador SEI do módulo processa os arquivos localmente no navegador; os documentos importados não devem ser enviados ao GitHub.


## Sugestões de Investimentos Hidroviários\n\nA Central de Comando do BI principal carrega exclusivamente a aba `Carteira_Governadores` da planilha `Carteira_Propositiva_Hidrovias_Governadores_2026_FINAL_v3_SIOP_PO.xlsx`. A base vigente contém 63 propostas e 35 campos por registro, incluindo território, investimento, instrumento, factibilidade de celebração pela SNHN, valores estimados, situação de efetivação, ação SIOP e viabilidade de criação de PO. A antiga carteira de política pública não é mais usada por este módulo.\n

### Camada de inteligência da Carteira_Governadores

O módulo **Sugestões de Investimentos Hidroviários** preserva a base original e calcula dinamicamente indicadores de apoio à decisão: índice indicativo de prontidão (0–100), semáforo de decisão, classificação da proposta, trilha de estruturação, pendências para avanço, responsável pela próxima providência, prazo estimado de estruturação, matriz de riscos, ranking executivo e comparação entre até cinco investimentos. Esses indicadores são analíticos e não substituem análise técnica, jurídica, orçamentária ou decisão administrativa. Registros que deixem de ser classificados como não efetivados são automaticamente ocultados do módulo de Sugestões, sem exclusão da base histórica.

## Consultas, AIR/EVTEA e povos originários

O módulo de Concessões v10.4 carrega `data/concessoes_matriz_consultas_povos_2026.json` e mantém separados: AIR, EVTEA/modelagem, tomada de subsídios/reunião participativa, consulta pública, audiência pública e consulta às comunidades/CLPI. A presença territorial de povos originários é exibida separadamente da comprovação de consulta específica ao empreendimento.
