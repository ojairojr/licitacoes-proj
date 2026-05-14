import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "licitacoes")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# Nota: Em producao o bcrypt seria feito via API. Vamos colocar um hash bcrypt pre-computado para a senha "!Admin123Test@2026"
# Isso evita depender do passlib neste script basico
PRECOMPUTED_HASH = "$2b$12$Z0D/y8y3hWdYVn7j6eXUveoUfA5Y3Dk9V.X.Lg1J1GzTf8x9kP1Fm" # Equals !Admin123Test@2026

def create_tables(conn):
    with conn.cursor() as cur:
        # ATENCAO: Apagando tudo para recriar o schema limpo com a nova regra de tenant
        print("Apagando tabelas antigas se existirem...")
        cur.execute("DROP TABLE IF EXISTS oportunidade_processada CASCADE;")
        cur.execute("DROP TABLE IF EXISTS edital_itens CASCADE;")
        cur.execute("DROP TABLE IF EXISTS edital_bruto CASCADE;")
        cur.execute("DROP TABLE IF EXISTS usuarios CASCADE;")
        cur.execute("DROP TABLE IF EXISTS perfil_empresa CASCADE;")

        print("Criando tabela: perfil_empresa")
        cur.execute("""
            CREATE TABLE perfil_empresa (
                empresa_id VARCHAR(50) PRIMARY KEY,
                segmento VARCHAR(100),
                cnaes TEXT[],
                palavras_chave_inclusao TEXT[],
                palavras_chave_exclusao TEXT[],
                regioes_atendidas TEXT[],
                capacidade_tecnica TEXT[],
                experiencias_anteriores TEXT[]
            );
        """)

        print("Criando tabela: usuarios")
        cur.execute("""
            CREATE TABLE usuarios (
                cpf VARCHAR(20) PRIMARY KEY,
                empresa_id VARCHAR(50) REFERENCES perfil_empresa(empresa_id) ON DELETE CASCADE,
                nome VARCHAR(100) NOT NULL,
                senha_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'USER',
                email VARCHAR(100),
                whatsapp VARCHAR(20)
            );
        """)

        print("Criando tabela: edital_bruto")
        cur.execute("""
            CREATE TABLE edital_bruto (
                edital_id VARCHAR(100) PRIMARY KEY,
                orgao VARCHAR(255),
                objeto TEXT,
                modalidade VARCHAR(100),
                data_limite TIMESTAMP,
                valor_estimado NUMERIC(15, 2),
                anexos_urls TEXT[],
                fonte_dados VARCHAR(50)
            );
        """)

        print("Criando tabela: edital_itens")
        cur.execute("""
            CREATE TABLE edital_itens (
                id SERIAL PRIMARY KEY,
                edital_id VARCHAR(100) REFERENCES edital_bruto(edital_id) ON DELETE CASCADE,
                numero INTEGER,
                descricao TEXT,
                quantidade NUMERIC(15, 2),
                valor_unitario_estimado NUMERIC(15, 2)
            );
        """)

        print("Criando tabela: oportunidade_processada")
        cur.execute("""
            CREATE TABLE oportunidade_processada (
                edital_id VARCHAR(100) REFERENCES edital_bruto(edital_id) ON DELETE CASCADE,
                empresa_id VARCHAR(50) REFERENCES perfil_empresa(empresa_id) ON DELETE CASCADE,
                score_compatibilidade NUMERIC(5, 2),
                classificacao VARCHAR(20),
                justificativa_tecnica TEXT,
                resumo_executivo TEXT,
                orgao VARCHAR(255),
                valor_estimado NUMERIC(15, 2),
                data_limite TIMESTAMP,
                link_direto TEXT,
                email_enviado BOOLEAN DEFAULT FALSE,
                whatsapp_enviado BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (edital_id, empresa_id)
            );
        """)
        conn.commit()
        print("Tabelas criadas com sucesso!")

def insert_mock_data(conn):
    with conn.cursor() as cur:
        print("Inserindo dados Mock da Empresa de Tecnologia...")
        
        cur.execute("""
            INSERT INTO perfil_empresa (
                empresa_id, segmento, cnaes, palavras_chave_inclusao, palavras_chave_exclusao, regioes_atendidas
            ) VALUES (
                'mock_tech_01',
                'Tecnologia da Informacao',
                ARRAY['6201-5/01', '6202-3/00', '6203-1/00', '6204-0/00', '6209-1/00'],
                ARRAY['software', 'desenvolvimento', 'sistema', 'aplicativo', 'cloud', 'nuvem', 'servidor', 'TI', 'manutencao de software', 'licenca', 'tecnologia'],
                ARRAY['limpeza', 'obra', 'engenharia civil', 'asfalto', 'alimentacao', 'marmita', 'vigilancia armada', 'seguranca patrimonial'],
                ARRAY['DF', 'SP', 'RJ', 'MG', 'Nacional', 'Qualquer']
            ) ON CONFLICT (empresa_id) DO NOTHING;
        """)

        print("Inserindo Usuario Administrador da Empresa...")
        
        cur.execute("""
            INSERT INTO usuarios (
                cpf, empresa_id, nome, senha_hash, role, email, whatsapp
            ) VALUES (
                '00000000000',
                'mock_tech_01',
                'Administrador Master',
                %s,
                'ADMIN',
                'admin@mock.com',
                '+5511999999999'
            ) ON CONFLICT (cpf) DO NOTHING;
        """, (PRECOMPUTED_HASH,))
        
        conn.commit()
        print("Mock inserido com sucesso!")

def main():
    try:
        conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"
        with psycopg.connect(conninfo) as conn:
            create_tables(conn)
            insert_mock_data(conn)
            
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {e}")

if __name__ == "__main__":
    main()
