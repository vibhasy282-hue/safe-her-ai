import { useEmergencyStore } from '@/hooks/useEmergencyStore';

export default function Navbar() {
  const isOnline = useEmergencyStore(s => s.isOnline);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(15,12,41,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.12)'
    }}>
      <div className="nav-logo" style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🛡️ SafeHer
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <a href="#hero" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Home</a>
        <a href="#voice" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>AI Voice</a>
        <a href="#route" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Safe Route</a>
        <a href="#triggers" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>SOS Triggers</a>
        <a href="#privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy</a>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: isOnline ? '#22c55e' : '#ef4444' }}>
        <span className={isOnline ? 'online-dot' : ''} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isOnline ? '#22c55e' : '#ef4444',
          display: 'inline-block'
        }} />
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </nav>
  );
}
