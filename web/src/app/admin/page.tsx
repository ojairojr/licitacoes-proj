'use client';

import { useState, useEffect } from 'react';
import { Trash2, UserPlus, Shield, User, Edit3, X, Bell, Search, Activity, Users, FileText } from 'lucide-react';

export default function AdminPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState('USER');

  const fetchData = async () => {
    try {
      const [perfilRes, usersRes] = await Promise.all([
        fetch('/api/perfil'),
        fetch('/api/users')
      ]);
      setPerfil(await perfilRes.json());
      setUsers(await usersRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !nome) return alert('CPF e Nome são obrigatórios');
    
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, nome, email, whatsapp, role })
    });
    
    // Clear form and close modal
    setCpf(''); setNome(''); setEmail(''); setWhatsapp(''); setRole('USER');
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (cpfToDelete: string) => {
    if (!confirm('Deseja realmente remover este usuário?')) return;
    await fetch(`/api/users?cpf=${cpfToDelete}`, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando painel corporativo...</div>;

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">Perfil e Configurações</h1>
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            <span>Empresa</span> &gt; <span>{perfil?.empresa?.id}</span> &gt; <span style={{ color: 'var(--primary)', fontWeight: 500 }}>Administrador</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ padding: '0.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '0.5rem' }}>
            <Bell size={20} color="var(--text-muted)" />
          </button>
        </div>
      </div>

      {/* Cartão de Perfil Principal */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="profile-card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '150px' }}>
            <div className="avatar">
              {perfil?.admin?.nome?.charAt(0) || 'A'}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{perfil?.admin?.nome}</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{perfil?.admin?.email}</div>
            </div>
            <button className="btn" style={{ border: '1px solid var(--primary-accent)', color: 'var(--primary-accent)', fontSize: '0.875rem', padding: '0.25rem 1rem', borderRadius: '999px' }}>
              Editar Perfil
            </button>
          </div>

          <div className="profile-info">
            <div className="info-group">
              <div className="info-label">Segmento (CNAE)</div>
              <div className="info-value">{perfil?.empresa?.segmento || 'Não informado'}</div>
            </div>
            <div className="info-group">
              <div className="info-label">Assinatura</div>
              <div className="info-value" style={{ color: 'var(--success)' }}>Plano Pro Ativo</div>
            </div>
            <div className="info-group">
              <div className="info-label">Regiões Atendidas</div>
              <div className="info-value">{perfil?.empresa?.regioes?.join(', ') || 'Nacional'}</div>
            </div>
            <div className="info-group">
              <div className="info-label">Status da Conta</div>
              <div className="info-value">Regular</div>
            </div>
            <div className="info-group">
              <div className="info-label">Telefone (WhatsApp)</div>
              <div className="info-value">{perfil?.admin?.whatsapp || 'Não informado'}</div>
            </div>
            <div className="info-group">
              <div className="info-label">Data de Registro</div>
              <div className="info-value">10 Jan, 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Cards */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Métricas da Empresa</h3>
      </div>
      <div className="vital-cards">
        <div className="vital-card">
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}><FileText size={24} /></div>
          <div className="vital-value">{perfil?.empresa?.termos?.length || 0}</div>
          <div className="vital-label">Termos Monitorados</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem' }}>Operando em tempo real</div>
        </div>
        <div className="vital-card">
          <div style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}><Activity size={24} /></div>
          <div className="vital-value">100%</div>
          <div className="vital-label">Saúde das Integrações</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem' }}>Nenhum erro relatado</div>
        </div>
        <div className="vital-card">
          <div style={{ color: 'var(--primary-accent)', marginBottom: '0.5rem' }}><Users size={24} /></div>
          <div className="vital-value">{perfil?.empresa?.totalUsuarios || 0}</div>
          <div className="vital-label">Membros na Equipe</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Plano permite até 10</div>
        </div>
      </div>

      {/* Tabela de Usuários (Substituindo Histórico) */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0' }}>
          <h3 className="card-title">Equipe Cadastrada</h3>
          <button 
            className="btn btn-primary" 
            style={{ borderRadius: '999px', fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            + Adicionar Membro
          </button>
        </div>
        
        <table className="table-container" style={{ marginTop: '1.5rem' }}>
          <thead>
            <tr>
              <th>Data de Acesso</th>
              <th>Nome Completo</th>
              <th>Permissão</th>
              <th>Contato (E-mail / Whats)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.cpf} className="table-row">
                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>12 Mai, 2026</td>
                <td style={{ fontWeight: 500 }}>{u.nome}</td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: u.role === 'ADMIN' ? '#dbeafe' : '#f1f5f9',
                    color: u.role === 'ADMIN' ? '#1e40af' : '#475569',
                    fontWeight: 500
                  }}>
                    {u.role === 'ADMIN' ? 'Administrador' : 'Visualizador'}
                  </span>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{u.email}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Pendente</span>
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(u.cpf)}
                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                  >
                    <Trash2 size={16} /> Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Novo Usuário */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Convidar Novo Membro</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <label className="info-label">Nome Completo</label>
                <input type="text" className="input-field" style={{ marginBottom: 0 }} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Maria Souza" required />
              </div>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <label className="info-label">CPF</label>
                <input type="text" className="input-field" style={{ marginBottom: 0 }} value={cpf} onChange={e => setCpf(e.target.value)} placeholder="Somente números" required />
              </div>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <label className="info-label">Email</label>
                <input type="email" className="input-field" style={{ marginBottom: 0 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com" required />
              </div>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <label className="info-label">WhatsApp</label>
                <input type="text" className="input-field" style={{ marginBottom: 0 }} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="info-group" style={{ marginBottom: 0 }}>
                <label className="info-label">Nível de Acesso</label>
                <select className="input-field" style={{ marginBottom: 0 }} value={role} onChange={e => setRole(e.target.value)}>
                  <option value="USER">Visualizador (USER)</option>
                  <option value="ADMIN">Administrador (ADMIN)</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn" style={{ flex: 1, border: '1px solid var(--card-border)' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Enviar Convite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
