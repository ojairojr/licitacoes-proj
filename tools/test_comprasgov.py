import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_comprasgov():
    url = os.getenv("COMPRASGOV_API_URL", "https://compras.dados.gov.br/")
    test_url = f"{url}licitacoes/v1/licitacoes.json"
    print(f"Testando conexao com Compras.gov.br: {test_url}")
    try:
        response = requests.get(test_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Sucesso! API do Compras.gov.br esta viva e respondendo.")
        else:
            print(f"Erro: Resposta inesperada da API do Compras.gov.br. ({response.text[:100]})")
    except Exception as e:
        print(f"Falha ao conectar no Compras.gov.br: {e}")

if __name__ == "__main__":
    test_comprasgov()
