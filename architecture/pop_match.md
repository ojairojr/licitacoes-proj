# POP: Match e Classificação (Scoring)

Este Procedimento Operacional Padrão (POP) define a matemática determinística para avaliar a aderência de um `EditalBruto` em relação a um `PerfilEmpresa`.

## 1. Regras de Pontuação (Score de 0 a 100)

A pontuação base começa em **0 pontos**. Cada licitação é avaliada contra as regras do perfil da empresa em três níveis: Exclusão, Inclusão (Keywords) e Contexto (CNAE e Região).

### 1.1 Critério de Eliminação Sumária (Morte Súbita)
- **Regra:** Se o `objeto` do edital ou a `descricao` de **qualquer um de seus itens** contiver qualquer palavra-chave definida na lista `palavras_chave_exclusao` da empresa.
- **Ação:** O score é fixado em `0` (ou forçado a ser ignorado). A classificação automática passa a ser **NÃO COMPATÍVEL / DESCARTADO**.

### 1.2 Filtros de Compatibilidade Base
- **CNAE (Teto de +30 pontos):** 
  - Se o segmento/modalidade/categoria do edital bater com os CNAEs da empresa: `+30 pontos`.
- **Região (Teto de +20 pontos):**
  - Se a região/UF do órgão bater com `regioes_atendidas`: `+20 pontos`.
  - *Nota:* Para editais 100% eletrônicos que aceitem concorrência nacional e se a empresa possuir região nacional/qualquer, aplica-se a nota máxima deste critério.

### 1.3 Análise de Palavras-Chave de Inclusão (Teto de +50 pontos)
- **Mapeamento:** O texto combinado do `objeto` do edital e a lista das descrições dos `itens`.
- **Regra:** Para cada palavra-chave listada em `palavras_chave_inclusao` que for encontrada no texto combinado, adiciona-se **10 pontos**, limitado a um máximo de 50 pontos.
- Exemplo: Se a empresa quer "Manutenção" e "Ar condicionado", e o edital possui as duas palavras, a nota aqui será 20.

## 2. Classificação Final (Categorização)

O `score_compatibilidade` final é a soma aritmética dos pontos positivos (podendo variar de 0 a 100).
A propriedade `classificacao` no schema de saída será populada conforme a escala:

| Score Final | Classificação | Ação Estratégica Esperada |
| :--- | :--- | :--- |
| **0 a 49** | `BAIXA` | Fica no banco de dados, mas não aciona alerta push/email. Mostrado apenas em filtros avançados no dashboard. |
| **50 a 74** | `MEDIA` | Potencial. Pode requerer leitura humana dos anexos. Aparece na lista prioritária diária. |
| **75 a 100** | `ALTA` | Totalmente enquadrado. Disparo imediato de Alerta Crítico (WhatsApp/E-mail) pela esteira do n8n. |

## 3. Geração de Justificativa
O algoritmo (`tools/calculate_score.py`) deverá montar o campo string `justificativa_tecnica` com base nos pontos positivos que ele ativou.
- Exemplo de output: `"Atingiu 80 pontos: CNAE Compatível (+30), Região Atendida (+20), Palavras-chave encontradas: [Servidor, Nuvem, Licença] (+30)."`
