# Plano de Tarefas (Task Plan)

## Fases
- [x] Fase V: Visão
- [x] Fase L: Link
- [x] Fase A: Arquitetura
- [ ] Fase E: Estilo
- [ ] Fase G: Gatilho

## Blueprint (Objetivos e Checklists)

### Fase V: Visão
- [x] Levantar requisitos (5 Perguntas)
- [x] Definir Schemas de Entrada (PerfilEmpresa, EditalBruto)
- [x] Definir Schema de Saída (OportunidadeProcessada)
- [x] Aprovação do Blueprint e Schemas pelo usuário

### Fase L: Link
- [x] Construir script básico para testar API do PNCP (`tools/test_pncp.py`)
- [x] Construir script básico para testar API do Compras.gov.br (`tools/test_comprasgov.py`)
- [x] Validar conexão com banco de dados PostgreSQL (`tools/test_db.py`)
- [ ] (Opcional) Testar webhook/integração inicial com n8n

### Fase A: Arquitetura
- [x] Definir POP de Captura de Editais (`architecture/pop_captura.md`)
- [x] Definir POP de Match/Classificação (`architecture/pop_match.md`)
- [x] Criar ferramenta de extração de dados PNCP (`tools/fetch_pncp.py`)
- [x] Criar ferramenta de extração de dados Compras.gov (`tools/fetch_comprasgov.py`)
- [x] Criar ferramenta de cálculo de Score (`tools/calculate_score.py`)

### Fase E: Estilo
- [ ] Formatar o Payload para o Dashboard (JSON final)
- [ ] Formatar texto executivo para alertas de WhatsApp/Email

### Fase G: Gatilho
- [ ] Orquestração da esteira no n8n (Gatilho e Fluxo de execução)
- [ ] Atualização final da documentação
