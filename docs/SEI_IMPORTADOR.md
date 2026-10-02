# Importador de Pacotes SEI

## Objetivo

O módulo **Processos SEI** permite importar arquivos ZIP exportados do SEI diretamente no navegador.

## Privacidade

O processamento é local. Os documentos do ZIP não são enviados ao GitHub e não são incorporados às bases JSON públicas do BI.

## Persistência

A base é armazenada em **IndexedDB** no navegador. Cada ZIP recebe um hash SHA-256 e importações repetidas do mesmo pacote são ignoradas.

Quando um novo ZIP contém documentos de um processo já existente, os novos documentos são mesclados ao processo.

## Indexação

- Todos os arquivos são cadastrados por nome, extensão, tamanho e data.
- TXT, HTML, HTM, XML, CSV, JSON, Markdown e LOG têm o conteúdo textual indexado.
- PDFs são cadastrados e classificados pelo nome do arquivo nesta versão.
- O importador procura números de processo no padrão `50020.000593/2026-91` e variantes com sublinhado/hífen.

## Backup

O botão **Exportar base SEI (JSON)** gera uma cópia da base local. O botão **Restaurar base JSON** permite mover essa base para outro navegador/computador.

## Sincronização compartilhada

A versão atual é **local-first**. Para compartilhar automaticamente a base SEI entre dispositivos, será necessário conectar posteriormente um armazenamento privado/autenticado. Não deve ser usado um endpoint público para documentos internos ou restritos.
