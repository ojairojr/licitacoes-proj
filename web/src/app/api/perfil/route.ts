import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Busca dados da empresa
    const resultEmpresa = await client.query(`
      SELECT empresa_id, segmento, cnaes, regioes_atendidas, palavras_chave_inclusao
      FROM perfil_empresa 
      WHERE empresa_id = 'mock_tech_01'
    `);
    
    // Busca dados do admin
    const resultAdmin = await client.query(`
      SELECT nome, email, whatsapp 
      FROM usuarios 
      WHERE empresa_id = 'mock_tech_01' AND role = 'ADMIN'
      LIMIT 1
    `);

    // Conta total de usuarios
    const resultUsuarios = await client.query(`
      SELECT COUNT(*) as total FROM usuarios WHERE empresa_id = 'mock_tech_01'
    `);

    client.release();

    if (resultEmpresa.rows.length === 0) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const empresa = resultEmpresa.rows[0];
    const admin = resultAdmin.rows[0] || { nome: 'Admin', email: '' };

    return NextResponse.json({
      admin: {
        nome: admin.nome,
        email: admin.email,
        whatsapp: admin.whatsapp
      },
      empresa: {
        id: empresa.empresa_id,
        segmento: empresa.segmento,
        cnaes: empresa.cnaes || [],
        regioes: empresa.regioes_atendidas || [],
        termos: empresa.palavras_chave_inclusao || [],
        totalUsuarios: parseInt(resultUsuarios.rows[0].total)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
