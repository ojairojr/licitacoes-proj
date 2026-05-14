import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    // Lista usuários da empresa mockada
    const result = await client.query(`
      SELECT cpf, nome, email, whatsapp, role 
      FROM usuarios 
      WHERE empresa_id = 'mock_tech_01'
    `);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, nome, email, whatsapp, role } = body;
    
    // Hash mockado por simplificacao (em prod usar bcrypt)
    const mockHash = "$2b$12$Z0D/y8y3hWdYVn7j6eXUveoUfA5Y3Dk9V.X.Lg1J1GzTf8x9kP1Fm";
    const empresa_id = 'mock_tech_01';

    const client = await pool.connect();
    
    await client.query(`
      INSERT INTO usuarios (cpf, empresa_id, nome, senha_hash, role, email, whatsapp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [cpf, empresa_id, nome, mockHash, role || 'USER', email, whatsapp]);
    
    client.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');
    
    if (!cpf) return NextResponse.json({ error: "CPF obrigatorio" }, { status: 400 });

    const client = await pool.connect();
    await client.query("DELETE FROM usuarios WHERE cpf = $1 AND empresa_id = 'mock_tech_01'", [cpf]);
    client.release();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
