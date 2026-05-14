# Utilizando a imagem base do Python recomendada (Debian Bookworm - versão 12, que é a mais estável e suportada atualmente para Python 3.11/3.12)
FROM python:3.11-slim-bookworm

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar os arquivos de dependência
COPY requirements.txt .

# Instalar as dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código da aplicação
COPY . .

# Criar a pasta .tmp caso não exista
RUN mkdir -p .tmp

# Comando padrão para manter o container rodando (assim podemos executar scripts nele quando quisermos)
CMD ["tail", "-f", "/dev/null"]
