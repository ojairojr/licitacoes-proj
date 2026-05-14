'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Editais', href: '/editais', icon: FileText },
    { name: 'Usuários (Admin)', href: '/admin', icon: Users },
    { name: 'Alertas', href: '/alertas', icon: ShieldAlert },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: 32, height: 32, backgroundColor: 'var(--primary-accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          RL
        </div>
        <span>RadarLicita</span>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '1rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Assinatura Ativa</p>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Renovar
        </button>
      </div>
    </div>
  );
}
