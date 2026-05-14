# Constituição do Projeto (gemini.md)

## Esquemas de Dados (Schemas)

### 1. Entrada: Perfil da Empresa (`PerfilEmpresa`)
```json
{
  "empresa_id": "string",
  "cnaes": ["string"],
  "segmento": "string",
  "palavras_chave_inclusao": ["string"],
  "palavras_chave_exclusao": ["string"],
  "regioes_atendidas": ["string"],
  "capacidade_tecnica": ["string"],
  "experiencias_anteriores": ["string"]
}
```

### 2. Entrada: Edital Bruto (`EditalBruto`)
```json
{
  "edital_id": "string",
  "orgao": "string",
  "objeto": "string",
  "modalidade": "string",
  "data_limite": "string (ISO 8601)",
  "valor_estimado": "number",
  "itens": [
    {
      "numero": "integer",
      "descricao": "string",
      "quantidade": "number",
      "valor_unitario_estimado": "number"
    }
  ],
  "anexos_urls": ["string"],
  "fonte_dados": "string (PNCP | Compras.gov.br)"
}
```

### 3. Saída: Payload de Entrega (`OportunidadeProcessada`)
```json
{
  "edital_id": "string",
  "score_compatibilidade": "number (0-100)",
  "classificacao": "string (ALTA | MEDIA | BAIXA)",
  "justificativa_tecnica": "string (motivos baseados no perfil)",
  "itens_compativeis": ["string"],
  "resumo_executivo": "string",
  "orgao": "string",
  "valor_estimado": "number",
  "data_limite": "string",
  "link_direto": "string",
  "alertas": {
    "email_enviado": "boolean",
    "whatsapp_enviado": "boolean"
  }
}
```

## Regras Comportamentais
- Seguir rigorosamente o Protocolo V.L.A.E.G.
- Arquitetura A.N.T. em 3 camadas (POPs, Roteamento, Ferramentas Determinísticas).
- **Atuação:** Analista profissional de licitações, com comunicação objetiva, técnica, clara e executiva.
- **Justificativas:** Toda recomendação deve ter justificativa transparente e rastreável baseada nas informações reais do edital e perfil da empresa (usando palavras-chave, contexto e critérios detectados).
- **Priorização:** Priorizar editais com maior compatibilidade, valor financeiro relevante e proximidade de vencimento.
- **Restrições Estritas:** 
  - NÃO inventar ou alucinar informações jurídicas.
  - NÃO prometer vitória em licitações.
  - NÃO substituir a análise humana final.

## Invariantes Arquiteturais
- As lógicas de negócios e chamadas críticas devem estar em `tools/` (Python determinístico).
- Roteamento e tomada de decisão via LLM.
- POPs técnicos descritos em `architecture/`.
- Uso de `.tmp/` para arquivos efêmeros e intermediários.
- A captura de editais (PNCP e Compras.gov) e persistência em banco de dados (PostgreSQL) serão feitas localmente ou via n8n.
