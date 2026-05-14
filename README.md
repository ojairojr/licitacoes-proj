# Sistema Automatizado de Captura e Match de Licitações

Este projeto captura editais diários de fontes do governo (como o PNCP) e cruza as informações com o perfil da empresa para sugerir licitações altamente compatíveis. O sistema conta com uma infraestrutura de backend (Python/PostgreSQL) para as rotinas de extração, e uma interface web moderna (Next.js) para o gerenciamento de perfis e visualização de editais.

## 🚀 Como instalar e rodar em um novo computador

O projeto é dividido em **Backend** (scripts de captura/banco de dados) e **Frontend** (painel web).

### Pré-requisitos
- Ter o [Git](https://git-scm.com/) instalado.
- Ter o [Node.js](https://nodejs.org/) instalado.
- (Recomendado) Ter o [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando.
- (Alternativa) [Python](https://www.python.org/) 3.10+ caso não utilize Docker para o backend.

---

### Passo 1: Clone o projeto e configure as variáveis
Abra o terminal e clone o projeto:
```bash
git clone https://github.com/ojairojr/licitacoes-proj.git
cd licitacoes-proj
```

Por motivos de segurança, o arquivo de senhas e acessos não vai para o GitHub. 
1. Faça uma cópia do arquivo `.env.example` e renomeie-a para **`.env`** (na raiz do projeto).
2. Opcional: Altere as credenciais (como senha do banco de dados) caso necessário.

---

### Passo 2: Inicialize a Interface Web (Frontend)
As dependências do Next.js/React (`node_modules`) não são versionadas. Para instalar e rodar a interface:
```bash
cd web
npm install
npm run dev
```
O painel administrativo estará acessível em `http://localhost:3000`.

---

### Passo 3: Inicialize o Banco de Dados e Backend

#### Opção A: Usando Docker (Muito mais fácil)
Essa opção prepara o ambiente do banco de dados (PostgreSQL) e o Python automaticamente, garantindo que vai rodar sem erros na nova máquina. Volte para a pasta raiz do projeto (`cd ..`) e rode:
```bash
docker-compose up --build -d
```
Se for a primeira vez rodando, será preciso inicializar as tabelas do banco de dados:
```bash
docker exec licitacoes_app python tools/init_db.py
```

#### Opção B: Sem Docker (Localmente)
Caso prefira não usar Docker, você deverá ter um banco PostgreSQL local, editar o `.env` com os dados dele e configurar o ambiente Python:
```bash
# Criar e ativar um ambiente virtual
python -m venv venv
venv\Scripts\activate      # no Windows
# source venv/bin/activate # no Linux/Mac

# Instalar as bibliotecas Python
pip install -r requirements.txt
```

---

## 🛠️ Comandos Úteis do Backend
Com o ambiente (Docker) rodando, você pode rodar as captações e cálculos de nota:
- **Capturar Editais do PNCP:** `docker exec licitacoes_app python tools/fetch_pncp.py`
- **Rodar Algoritmo de Match (Notas):** `docker exec licitacoes_app python tools/calculate_score.py`
