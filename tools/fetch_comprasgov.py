import os
import requests
import psycopg
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "licitacoes")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

# API v1 do Compras.gov.br que as vezes sofre instabilidade
COMPRASGOV_API_URL = "http://compras.dados.gov.br/licitacoes/v1/licitacoes.json"

def fetch_comprasgov_data():
    print("Iniciando captura do Compras.gov.br (Secundario)...")
    try:
        response = requests.get(COMPRASGOV_API_URL, timeout=10)
        if response.status_code == 200:
            data = response.json()
            items = data.get('_embedded', {}).get('licitacoes', [])
            print(f"Encontrados {len(items)} editais via API antiga do Compras.gov.br.")
            return items
        else:
            print(f"Aviso: Compras.gov.br retornou status {response.status_code}. Utilizando apenas dados do PNCP (que ja integra o compras.gov).")
            return []
    except Exception as e:
        print(f"Erro ao acessar Compras.gov.br: {e}")
        return []

def save_to_db(editais):
    if not editais:
        return
        
    conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"
    try:
        with psycopg.connect(conninfo) as conn:
            with conn.cursor() as cur:
                for item in editais:
                    orgao_id = item.get('uasg', '000000')
                    numero_aviso = item.get('numero_aviso', '0000')
                    edital_id = f"CGOV-{orgao_id}-{numero_aviso}"
                    
                    objeto = item.get('objeto', '')
                    modalidade = "Pregao" if item.get('modalidade') == 5 else f"Modalidade {item.get('modalidade')}"
                    
                    try:
                        data_limite = datetime.strptime(item.get('data_entrega_proposta'), "%Y-%m-%dT%H:%M:%S")
                    except:
                        data_limite = None
                        
                    cur.execute("""
                        INSERT INTO edital_bruto (
                            edital_id, orgao, objeto, modalidade, data_limite, valor_estimado, fonte_dados
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (edital_id) DO NOTHING;
                    """, (edital_id, f"UASG {orgao_id}", objeto, modalidade, data_limite, 0.0, "Compras.gov.br"))
                    
            conn.commit()
            print("Editais do Compras.gov.br salvos no banco de dados!")
    except Exception as e:
        print(f"Erro ao salvar no banco (Compras.gov): {e}")

if __name__ == "__main__":
    dados = fetch_comprasgov_data()
    save_to_db(dados)
