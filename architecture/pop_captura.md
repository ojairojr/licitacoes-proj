# POP: Captura de Editais

Este Procedimento Operacional Padrão (POP) define as regras determinísticas para a extração diária de dados de licitações das fontes oficiais e sua transformação para o banco de dados interno.

## 1. Fontes de Dados
### 1.1 PNCP (Portal Nacional de Contratações Públicas)
- **API Base:** `https://pncp.gov.br/api/pncp/v1`
- **Endpoint de Busca de Contratações:** `/contratacoes` (Geralmente usando parâmetros como `dataInicial` e `dataFinal` no formato `YYYYMMDD` ou consultando as listagens mais recentes).
- **Rate Limit:** Máximo de tolerância aceitável; implementar requisições paginadas (e.g., limit 50, page 1).
- **Endpoint de Itens:** Para cada `id` de contratação obtido, os itens podem ser obtidos via `/orgaos/{cnpjOrgao}/compras/{anoCompra}/{sequencialCompra}/itens`.

### 1.2 Compras.gov.br
- **Nota Estratégica:** A maior parte dos editais atuais do Compras.gov migram para o PNCP. Esta captura atuará como backup/suplemento.
- **API Base:** `https://compras.dados.gov.br` (Ou api da versão 2.0 caso aplicável no futuro)
- **Endpoint:** `/licitacoes/doc/licitacao.json` ou similares em operação.

## 2. Lógica de Execução (Ferramentas Python)
O script de captura (`tools/fetch_pncp.py` e `tools/fetch_comprasgov.py`) deve executar estritamente o seguinte fluxo:

1. **Definição da Janela de Tempo:**
   - Buscar apenas licitações publicadas nas últimas 24 a 48 horas, ou que tenham `data_limite` (data de abertura) no futuro.
   - Licitações passadas (vencidas) DEVEM ser sumariamente ignoradas/descartadas em memória, não gerando gravação no banco de dados.

2. **Mapeamento de Schema (Transformação):**
   - Os dados JSON recebidos das APIs devem ser convertidos para o Schema `EditalBruto` antes da inserção.
   - Campos nulos ou não numéricos no valor estimado devem ser tratados de forma resiliente (convertidos para `0.0` ou extraídos limpos).

3. **Inserção com Upsert (Idempotência):**
   - O campo `edital_id` (que é a concatenação única da origem, ex: `PNCP-12345`) é a chave primária de negócio.
   - O SQL executado na tabela `edital_bruto` deve usar `ON CONFLICT (edital_id) DO UPDATE`. Assim, a ferramenta pode rodar repetidas vezes ao dia sem duplicar dados.

4. **Busca e Inserção de Itens (Lazy Load ou Eager):**
   - A tabela `edital_itens` será populada no mesmo momento. Como as APIs de itens costumam ser separadas no PNCP, para cada edital capturado, buscar seus itens e salvar referenciando o `edital_id`.

## 3. Tratamento de Erros
- Timings out ou status HTTP 5xx: Registrar erro silencioso no log ou no painel do n8n (caso o gatilho seja externo).
- Formatos de data inesperados: O parser (ex: `datetime.strptime`) deve prever variações ou fazer fallback (se a data for lixo, descartar a licitação).
