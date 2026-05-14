import os
import requests
import psycopg
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Carrega variaveis de ambiente
load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "licitacoes")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

PNCP_API_URL = "https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao"

def fetch_pncp_data():
    print("Iniciando captura do PNCP...")
    
    # Busca da data de hoje ate 2 dias atras para garantir captura
    hoje = datetime.now()
    inicio = (hoje - timedelta(days=2)).strftime("%Y%m%d")
    fim = hoje.strftime("%Y%m%d")
    
    params = {
        "dataInicial": inicio,
        "dataFinal": fim,
        "codigoModalidadeContratacao": 8,  # Pregao Eletronico
        "pagina": 1,
        "tamanhoPagina": 10  # PNCP exige minimo de 10
    }
    
    response = requests.get(PNCP_API_URL, params=params, timeout=10)
    
    if response.status_code != 200:
        print(f"Erro na API do PNCP: {response.status_code}")
        print(response.text)
        return []
        
    data = response.json()
    
    # O payload pode retornar uma lista em "data"
    items = data.get('data', []) if isinstance(data, dict) else data
    print(f"Encontrados {len(items)} editais na pagina 1.")
    return items

def fetch_pncp_items(cnpj, ano, sequencial):
    # Endpoint de itens do PNCP
    url = f"https://pncp.gov.br/api/pncp/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/itens"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        print(f"Aviso: Nao foi possivel buscar itens para {cnpj}/{ano}/{sequencial} - {e}")
    return []

def save_to_db(editais):
    conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"
    try:
        with psycopg.connect(conninfo) as conn:
            with conn.cursor() as cur:
                for item in editais:
                    # Montando a chave primaria: Origem + ID do PNCP
                    orgao_cnpj = item.get('orgaoEntidade', {}).get('cnpj', '')
                    ano = item.get('anoCompra', '')
                    sequencial = item.get('sequencialCompra', '')
                    
                    if not orgao_cnpj or not ano or not sequencial:
                        continue
                        
                    edital_id = f"PNCP-{orgao_cnpj}-{ano}-{sequencial}"
                    
                    orgao = item.get('orgaoEntidade', {}).get('razaoSocial', 'Orgao Desconhecido')
                    objeto = item.get('objetoCompra', '')
                    modalidade = item.get('modalidadeNome', 'N/A')
                    
                    data_str = item.get('dataAberturaProposta', item.get('dataPublicacaoPncp'))
                    try:
                        data_limite = datetime.fromisoformat(data_str.replace("Z", "+00:00")) if data_str else None
                    except:
                        data_limite = None
                        
                    valor_estimado = item.get('valorTotalEstimado', 0.0)
                    if valor_estimado is None:
                        valor_estimado = 0.0
                        
                    # 1. Inserir na edital_bruto
                    cur.execute("""
                        INSERT INTO edital_bruto (
                            edital_id, orgao, objeto, modalidade, data_limite, valor_estimado, fonte_dados
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (edital_id) DO UPDATE SET
                            objeto = EXCLUDED.objeto,
                            data_limite = EXCLUDED.data_limite,
                            valor_estimado = EXCLUDED.valor_estimado;
                    """, (edital_id, orgao, objeto, modalidade, data_limite, valor_estimado, "PNCP"))
                    
                    # 2. Buscar e inserir Itens
                    itens_compras = fetch_pncp_items(orgao_cnpj, ano, sequencial)
                    
                    # Remove os itens antigos para evitar duplicidade em reexecuções
                    cur.execute("DELETE FROM edital_itens WHERE edital_id = %s", (edital_id,))
                    
                    for i, proc_item in enumerate(itens_compras):
                        desc = proc_item.get('descricao', f"Item {i+1}")
                        qtd = proc_item.get('quantidade', 1)
                        val_unit = proc_item.get('valorUnitarioEstimado', 0.0)
                        
                        # Inserir usando INSERT puro pois o ID do item é serial
                        cur.execute("""
                            INSERT INTO edital_itens (edital_id, numero, descricao, quantidade, valor_unitario_estimado)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (edital_id, i+1, desc, qtd, val_unit))
                        
            conn.commit()
            print("Editais salvos com sucesso no banco de dados!")
    except Exception as e:
        print(f"Erro ao salvar no banco: {e}")

if __name__ == "__main__":
    dados = fetch_pncp_data()
    if dados:
        save_to_db(dados)
