# Descobertas (Findings)

## Pesquisas e Requisitos (Fase V)
- **Estrela Guia:** Identificar editais compatíveis, gerar alertas, reduzir tempo de análise manual.
- **Fontes de Dados (Integrações):** APIs do [PNCP](https://www.gov.br/pncp) e [Compras.gov.br](https://www.gov.br/compras/pt-br).
- **Orquestração:** PostgreSQL (Banco de dados) e [n8n](https://n8n.io).
- **Sem Inteligência Artificial externa:** Inicialmente o processamento e "match" será feito através de captura, estruturação e classificação básica determinística (palavras-chave, regras).
- **Fonte da Verdade:** Dados públicos dos editais vs. Perfil da Empresa (CNAE, segmento, regiões, etc.).
- **Payload de Entrega:** Dashboard (score, resumo, detalhes, itens compatíveis) e Alertas (e-mail, WhatsApp, painel interno).
- **Campos adicionais detectados:** Incluída listagem de `itens` no `EditalBruto` e `itens_compativeis` em `OportunidadeProcessada` para aumentar a precisão do match determinístico.

## Restrições
- Não usar LLMs externos (OpenAI, etc.) para o "core" de processamento nesta etapa; usar processamento e classificação baseados em regras/palavras-chave.
- Não inventar informações jurídicas (sem alucinações).
- Não garantir vitórias.
- Não substituir análise humana (atuar como filtro inicial/recomendador).
