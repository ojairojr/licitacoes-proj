'use client';

import { useState, useEffect } from 'react';
import { Database, Users, MessageSquare, DollarSign, X, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [editais, setEditais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdital, setSelectedEdital] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, editaisRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/editais')
        ]);
        
        setStats(await statsRes.json());
        setEditais(await editaisRes.json());
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  };

  if (loading) {
    return <div>Carregando dashboard...</div>;
  }

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">Olá, Administrador</h1>
          <p className="subtitle">Confira as licitações diárias e gerencie suas oportunidades</p>
        </div>
      </div>

      <div className="hero-card">
        <div>
          <h2 className="hero-card-title">Resumo e Insights da Empresa</h2>
          <div className="hero-stats">
            <div className="hero-stat">
              <Database size={24} opacity={0.8} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalEditais || 0}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Editais Lidos</div>
              </div>
            </div>
            <div className="hero-stat">
              <Users size={24} opacity={0.8} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.oportunidades || 0}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Oportunidades (Alta/Média)</div>
              </div>
            </div>
            <div className="hero-stat">
              <DollarSign size={24} opacity={0.8} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(stats?.valorTotal || 0)}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Volume Financeiro Mapeado</div>
              </div>
            </div>
            <div className="hero-stat">
              <MessageSquare size={24} opacity={0.8} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.vencendo7Dias || 0}</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Vencendo na Semana</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Oportunidades Compatíveis</h3>
        </div>
        
        <table className="table-container">
          <thead>
            <tr>
              <th>Órgão</th>
              <th>Score</th>
              <th>Data Limite</th>
              <th>Valor Estimado</th>
              <th>Classificação</th>
            </tr>
          </thead>
          <tbody>
            {editais.map((edital) => (
              <tr key={edital.edital_id} className="table-row" onClick={() => setSelectedEdital(edital)}>
                <td>
                  <div style={{ fontWeight: 500, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {edital.orgao}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{edital.edital_id}</div>
                </td>
                <td>{edital.score_compatibilidade} pts</td>
                <td>{formatDate(edital.data_limite)}</td>
                <td>{formatCurrency(edital.valor_estimado)}</td>
                <td>
                  <span className={`badge badge-${edital.classificacao.toLowerCase()}`}>
                    {edital.classificacao}
                  </span>
                </td>
              </tr>
            ))}
            {editais.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Nenhuma oportunidade encontrada no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Edital */}
      {selectedEdital && (
        <div className="modal-overlay" onClick={() => setSelectedEdital(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="title">Detalhes do Edital</h2>
              <button onClick={() => setSelectedEdital(null)}>
                <X size={24} color="var(--text-muted)" />
              </button>
            </div>
            
            <div className="info-group">
              <div className="info-label">Órgão Responsável</div>
              <div className="info-value">{selectedEdital.orgao}</div>
            </div>
            
            <div className="info-group">
              <div className="info-label">Objeto da Compra</div>
              <div className="info-value" style={{ lineHeight: 1.6 }}>{selectedEdital.objeto}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <div className="info-label">Data Limite</div>
                <div className="info-value">{formatDate(selectedEdital.data_limite)}</div>
              </div>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <div className="info-label">Valor Estimado</div>
                <div className="info-value" style={{ color: 'var(--success)' }}>
                  {formatCurrency(selectedEdital.valor_estimado)}
                </div>
              </div>
            </div>

            <div className="info-group" style={{ backgroundColor: 'var(--sidebar-hover)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div className="info-label">Por que encontramos essa licitação para você? (Justificativa)</div>
              <div className="info-value">{selectedEdital.justificativa_tecnica}</div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <a 
                href={`https://pncp.gov.br/app/editais`} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Abrir Edital na Íntegra <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
