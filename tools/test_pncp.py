import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_pncp():
    url = os.getenv("PNCP_API_URL", "https://pncp.gov.br/api/pncp/v1")
    test_url = f"{url}/orgaos?cnpj=00000000000000"
    print(f"Testando conexao com PNCP: {test_url}")
    try:
        response = requests.get(test_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code in [200, 404, 400]:
            print("Sucesso! API do PNCP esta viva e respondendo.")
        else:
            print(f"Erro: Resposta inesperada da API do PNCP. ({response.text[:100]})")
    except Exception as e:
        print(f"Falha ao conectar no PNCP: {e}")

if __name__ == "__main__":
    test_pncp()
