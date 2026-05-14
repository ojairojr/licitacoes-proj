import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def test_db():
    print("Testando conexao com PostgreSQL...")
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("DB_NAME", "licitacoes")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    
    try:
        conn = psycopg.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            connect_timeout=5
        )
        print("✅ Sucesso! Conexao com banco de dados estabelecida.")
        conn.close()
    except Exception as e:
        print(f"❌ Falha ao conectar no banco de dados: {e}")
        print("Por favor, verifique se o PostgreSQL esta rodando, o database 'licitacoes' existe, e se as credenciais no .env estao corretas.")

if __name__ == "__main__":
    test_db()
