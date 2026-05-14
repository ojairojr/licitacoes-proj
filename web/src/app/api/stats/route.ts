import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // 1. Total Editais Processados (para empresa mockada mock_tech_01)
    const resultTotal = await client.query(`
      SELECT COUNT(*) as total FROM oportunidade_processada WHERE empresa_id = 'mock_tech_01'
    `);
    
    // 2. Oportunidades Alta e Média
    const resultOportunidades = await client.query(`
      SELECT COUNT(*) as total FROM oportunidade_processada 
      WHERE empresa_id = 'mock_tech_01' AND classificacao IN ('ALTA', 'MEDIA')
    `);
    
    // 3. Valor Total de Oportunidades (Soma de valor_estimado das oportunidades Alta/Media)
    const resultValor = await client.query(`
      SELECT SUM(valor_estimado) as total FROM oportunidade_processada
      WHERE empresa_id = 'mock_tech_01' AND classificacao IN ('ALTA', 'MEDIA')
    `);

    // 4. Editais Vencendo em 7 dias
    const resultVencendo = await client.query(`
      SELECT COUNT(*) as total FROM oportunidade_processada
      WHERE empresa_id = 'mock_tech_01' 
        AND classificacao IN ('ALTA', 'MEDIA')
        AND data_limite BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    `);

    client.release();

    return NextResponse.json({
      totalEditais: parseInt(resultTotal.rows[0].total),
      oportunidades: parseInt(resultOportunidades.rows[0].total),
      valorTotal: parseFloat(resultValor.rows[0].total || 0),
      vencendo7Dias: parseInt(resultVencendo.rows[0].total)
    });
  } catch (error) {
    console.error("Erro ao buscar stats:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
