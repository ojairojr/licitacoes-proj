# Progresso (Progress)

## O que foi feito
- [x] Fase 0 concluída: Criação dos arquivos de memória.
- [x] Fase V concluída: Respostas de descoberta recebidas e schemas (incluindo `itens`) aprovados. Banco de dados definido como PostgreSQL.
- [x] Fase L concluída: Scripts de Handshake criados e executados.
- [x] Fase A concluída: Criação dos POPs, modelagem de banco de dados e implementação das ferramentas Python determinísticas (captura e score).
- [x] Fase E iniciada.

## Erros e Testes
- Teste de PNCP: API exigiu parâmetro `codigoModalidadeContratacao` e limite de paginação >= 10. Corrigido com sucesso.
- Teste Compras.gov: Resposta ocasional 404/instável. Script fallback implementado e configurado para lidar com o problema de idempotência usando Postgres.
- **Ajuste Pós-Teste da Fase A:** O script `fetch_pncp.py` foi atualizado para fazer a deleção (`DELETE`) dos itens antigos antes de inserir novos para o mesmo `edital_id`, garantindo idempotência.
- **Ajuste Pós-Teste da Fase A:** O script `calculate_score.py` foi corrigido para calcular as pontuações de Região (+20) e CNAE (+30) que estavam faltando de acordo com o `pop_match.md`.

## Resultados
- Fase L (Handshake) concluída.
- Fase A (Arquitetura) testada e **corrigida**. Banco de dados populado, extração 100% idempotente e algoritmo de match executando perfeitamente todas as regras do POP de Scoring.
- Pronto para iniciar a Fase E (Estilo).
