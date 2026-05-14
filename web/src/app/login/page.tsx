'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulando login
    router.push('/');
  };

  return (
    <div className="auth-container">
      {/* Lado Esquerdo - Arte/Branding */}
      <div className="auth-image-side">
        <Briefcase size={80} style={{ marginBottom: '2rem', opacity: 0.9 }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
          Radar de<br />Licitações
        </h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.8, maxWidth: '400px' }}>
          O seu assistente inteligente para captação de oportunidades governamentais.
        </p>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="auth-form-side">
        <div className="auth-box">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Faça login na sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>E-mail corporativo</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="nome@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>Senha</label>
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary-accent)', fontWeight: 500 }}>Esqueceu a senha?</a>
              </div>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem' }}>
              Acessar Painel <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
