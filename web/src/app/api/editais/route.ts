import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Traz os editais processados (Alta e Média primeiro)
    const result = await client.query(`
      SELECT 
        o.edital_id,
        o.score_compatibilidade,
        o.classificacao,
        o.justificativa_tecnica,
        e.orgao,
        e.objeto,
        e.data_limite,
        e.valor_estimado
      FROM oportunidade_processada o
      JOIN edital_bruto e ON o.edital_id = e.edital_id
      WHERE o.empresa_id = 'mock_tech_01'
      ORDER BY 
        CASE o.classificacao 
          WHEN 'ALTA' THEN 1 
          WHEN 'MEDIA' THEN 2 
          ELSE 3 
        END,
        o.score_compatibilidade DESC
      LIMIT 50
    `);

    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar editais:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
