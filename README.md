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


## Representação Institucional — base político-federativa (V13, corte 09/10/2026)

O ícone **Representação Institucional** da Navegação Executiva oferece filtros por região, UF, cargo e período eleitoral, além de relatório executivo e briefing para impressão. A base deriva da planilha `BI_Hidrovias_Base_Politico_Institucional_V13_Bancadas_Completas_2022_2027.xlsx`, com:

- **27 governadores e 81 senadores** cadastrados no recorte de 09/10/2026;
- **513 deputados federais eleitos em 2022** e **513 eleitos em 2026 para posse em 2027**, consolidados em 735 correspondências/registros comparativos;
- recorte territorial por região e UF, sem atribuição automática de projetos ou recursos a autoridades.

**Limites metodológicos:** a lista de eleitos em 2022 não representa necessariamente os 513 deputados em exercício na data de corte, devido a afastamentos, suplências e mudanças partidárias. A representação proporcional não tem sucessor individual por deputado. As correspondências nominais entre as duas eleições devem ser validadas com os identificadores oficiais; a classificação não deve ser usada como resultado definitivo de reeleição.

**Arquivos:** `assets/representacao_institucional.js` (módulo), `data/representacao_institucional_v13.json.gz.b64` (snapshot público comprimido em gzip + base64), e `docs/REPRESENTACAO_INSTITUCIONAL.md` (documentação). O módulo exporta o JSON aberto pelo navegador. A aplicação requer navegador moderno com `DecompressionStream` para abrir a base compactada.

**Integração facultativa nos relatórios tradicionais:** marque “Incluir representação institucional no relatório” nos painéis de documentos ou produtos executivos, selecione uma UF no filtro principal e gere o relatório. A inclusão é **contextual e territorial**, sem inferir apoio político ou vinculação a investimentos e concessões. As demais visões executivas permanecem independentes.

Fontes de referência: [Câmara — eleitos em 2022](https://www.camara.leg.br/internet/agencia/infograficos-html5/tabelasEleicoes/deputados-eleitos-estado/index.html), [Câmara — eleitos em 2026](https://www.camara.leg.br/internet/agencia/infograficos-html5/eleicoes2026/deputados-eleitos-estado.html) e [Senado — senadores em exercício](https://www25.senado.leg.br/web/senadores/em-exercicio/-/e/por-nome).


### Filtros territoriais compartilhados e Relatório Institucional V2

Os módulos **Recorte Territorial**, **Sugestões de Investimentos Hidroviários** e **Representação Institucional** compartilham Região/UF de forma bidirecional. Um seletor compacto no topo permite modificar o recorte sem reabrir os módulos. Município e hidrovia são sincronizados somente entre bases que contêm essas dimensões; cargo, partido e prioridade continuam filtros específicos.

- \`assets/territorial_sync.js\` — estado territorial compartilhado e faixa de seleção.
- \`assets/representacao_relatorios.js\` — relatório executivo, briefing e prévia institucional com contexto de investimentos e sugestões consultadas em segundo plano.
- A ligação geográfica **não** é evidência de responsabilidade política por investimentos, concessões ou dotações.
- As datas de corte e as fontes de cada base permanecem independentes.

Teste visual: \`tests/representacao-smoke.cjs\`, via workflow \`.github/workflows/validar-representacao.yml\`.


### Página Executiva de Representação Institucional

O ícone **Representação Institucional** inclui o botão **📑 Abrir Página Executiva**. Ele abre uma janela sobre o BI no padrão visual dos relatórios do módulo **Sugestões de Investimentos Hidroviários**, com cabeçalho azul, síntese executiva, indicadores, pontos de acompanhamento, composição federativa e partidária, quadro de investimentos e propostas (apenas cruzamento geográfico) e botões **Imprimir / PDF** e **Fechar**. A janela preserva os filtros e é responsiva em dispositivos móveis.

Arquivo: `assets/representacao_modal_executivo.js`. A janela usa as rotinas do relatório existente em `assets/representacao_relatorios.js`; não substitui o relatório em nova aba, briefing ou prévia anteriores. A impressão usa A4 paisagem.
