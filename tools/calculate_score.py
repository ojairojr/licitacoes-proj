import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "licitacoes")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

def calcular_pontuacao(edital, itens, perfil):
    score = 0
    justificativas = []
    
    texto_edital = str(edital['objeto']).lower()
    for item in itens:
        texto_edital += " " + str(item['descricao']).lower()

    # 1. Morte Subita (Palavras de exclusao)
    for excl in perfil['palavras_chave_exclusao']:
        if excl.lower() in texto_edital:
            return 0, "BAIXA", f"Descartado: Contem palavra de exclusao ({excl})."

    # Filtro de CNAE / Segmento (+30 pontos)
    segmento = str(perfil.get('segmento', '')).lower()
    cnaes = [str(c).lower() for c in perfil.get('cnaes', [])]
    modalidade = str(edital.get('modalidade', '')).lower()
    
    cnae_encontrado = False
    if segmento and segmento in texto_edital:
        cnae_encontrado = True
        justificativas.append(f"Segmento Compatível (+30 pts)")
    else:
        for cnae in cnaes:
            if cnae in texto_edital or cnae in modalidade:
                cnae_encontrado = True
                justificativas.append(f"CNAE Compatível (+30 pts)")
                break
                
    if cnae_encontrado:
        score += 30

    # Filtro de Regiao (+20 pontos)
    regioes_atendidas = [str(r).lower() for r in perfil.get('regioes_atendidas', [])]
    orgao_texto = str(edital.get('orgao', '')).lower()
    
    if 'nacional' in regioes_atendidas or 'qualquer' in regioes_atendidas:
        score += 20
        justificativas.append("Região Atendida (+20 pts): Nacional/Qualquer")
    else:
        for regiao in regioes_atendidas:
            if regiao in orgao_texto or regiao in texto_edital:
                score += 20
                justificativas.append(f"Região Atendida (+20 pts): {regiao.upper()}")
                break

    # 2. Palavras de Inclusao (+10 pontos cada, max 50)
    pontos_inclusao = 0
    palavras_encontradas = []
    for incl in perfil['palavras_chave_inclusao']:
        if incl.lower() in texto_edital:
            pontos_inclusao += 10
            palavras_encontradas.append(incl)
            
    if pontos_inclusao > 50:
        pontos_inclusao = 50
        
    if pontos_inclusao > 0:
        score += pontos_inclusao
        justificativas.append(f"Palavras-chave encontradas (+{pontos_inclusao} pts): {', '.join(palavras_encontradas)}")

    # Classificacao Final
    if score >= 75:
        classificacao = "ALTA"
    elif score >= 50:
        classificacao = "MEDIA"
    else:
        classificacao = "BAIXA"
        if score == 0:
            justificativas.append("Nenhuma palavra-chave compativel.")

    justificativa_final = " | ".join(justificativas)
    return score, classificacao, justificativa_final

def processar_oportunidades():
    print("Iniciando calculo de Score e Match...")
    conninfo = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"
    try:
        with psycopg.connect(conninfo) as conn:
            with conn.cursor() as cur:
                # Pegar o perfil da empresa (vamos pegar o primeiro mock)
                cur.execute("SELECT * FROM perfil_empresa LIMIT 1;")
                row_perfil = cur.fetchone()
                if not row_perfil:
                    print("Nenhum perfil de empresa cadastrado.")
                    return
                
                # Montar dict do perfil
                cols = [desc[0] for desc in cur.description]
                perfil = dict(zip(cols, row_perfil))
                
                # Pegar editais que ainda nao foram processados
                cur.execute("""
                    SELECT e.* FROM edital_bruto e
                    LEFT JOIN oportunidade_processada o ON e.edital_id = o.edital_id
                    WHERE o.edital_id IS NULL;
                """)
                editais = cur.fetchall()
                cols_edital = [desc[0] for desc in cur.description]
                
                if not editais:
                    print("Nenhum edital novo para processar.")
                    return
                
                print(f"{len(editais)} editais novos encontrados para analise.")
                
                for row_edital in editais:
                    edital = dict(zip(cols_edital, row_edital))
                    
                    # Pegar os itens do edital
                    cur.execute("SELECT * FROM edital_itens WHERE edital_id = %s", (edital['edital_id'],))
                    itens_rows = cur.fetchall()
                    cols_itens = [desc[0] for desc in cur.description]
                    itens = [dict(zip(cols_itens, row)) for row in itens_rows]
                    
                    score, classificacao, justificativa = calcular_pontuacao(edital, itens, perfil)
                    
                    # Salvar na tabela de oportunidades processadas
                    cur.execute("""
                        INSERT INTO oportunidade_processada (
                            edital_id, empresa_id, score_compatibilidade, classificacao, justificativa_tecnica
                        ) VALUES (%s, %s, %s, %s, %s)
                    """, (edital['edital_id'], perfil['empresa_id'], score, classificacao, justificativa))
                    
                    print(f"Edital {edital['edital_id']} processado -> Score: {score} ({classificacao})")
                    
            conn.commit()
            print("Processamento concluido com sucesso!")
    except Exception as e:
        print(f"Erro durante processamento: {e}")

if __name__ == "__main__":
    processar_oportunidades()
