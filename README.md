# Sistema Automatizado de Captura e Match de Licitações

Este projeto captura editais diários de fontes do governo (como o PNCP) e cruza as informações com o perfil da empresa para sugerir licitações altamente compatíveis, operando através de containers Docker e em vias de implementar um WebApp com painel administrativo e disparos via n8n.

## 🚀 Como instalar e rodar em um novo computador

Por utilizar **Docker**, o projeto garante que a configuração funcionará de forma idêntica em qualquer sistema operacional (Windows, Linux, macOS).

### Pré-requisitos
1. Ter o [Git](https://git-scm.com/) instalado.
2. Ter o [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando.

### Passo a Passo

**1. Clone o repositório**
Abra o terminal/cmd e rode:
```bash
git clone https://github.com/ojairojr/licitacoes-proj.git
cd licitacoes-proj
```

**2. Configure o arquivo de variáveis de ambiente (.env)**
O arquivo de senhas não vem no GitHub por segurança. Você precisa criar um arquivo chamado `.env` baseado no arquivo de exemplo.
No Windows (PowerShell):
```powershell
cp .env.example .env
```
No Linux/Mac:
```bash
cp .env.example .env
```

**3. Inicie os containers (Magia do Docker)**
Esse comando vai baixar o Python, o Banco de Dados (PostgreSQL) e subir toda a estrutura magicamente em segundo plano:
```bash
docker compose up -d
```

**4. Execute as inicializações do banco de dados (se for a primeira vez no PC)**
```bash
docker exec licitacoes_app python tools/init_db.py
```

Pronto! Seu ambiente local está perfeitamente idêntico ao original e com o banco de dados inicializado.

## 🛠️ Comandos Úteis do Projeto

Para acionar os workers de extração no ambiente local (sandbox):
- **Capturar do PNCP:** `docker exec licitacoes_app python tools/fetch_pncp.py`
- **Rodar algoritmo de Match:** `docker exec licitacoes_app python tools/calculate_score.py`
