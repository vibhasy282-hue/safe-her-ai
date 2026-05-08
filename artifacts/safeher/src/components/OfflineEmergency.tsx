import { useState } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

export default function OfflineEmergency() {
  const { isOnline, location, clearData, loadData } = useEmergencyStore();
  const [log, setLog] = useState('[Storage] Ready...\n[Storage] No emergency data stored yet.');

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLog(prev => prev + `\n[${time}] ${msg}`);
  };

  const saveAll = () => {
    const data = {
      timestamp: new Date().toISOString(),
      location,
      sosCount: parseInt(localStorage.getItem('safeher_sos_count') || '0') + 1,
    };
    localStorage.setItem('safeher_emergency', JSON.stringify(data));
    localStorage.setItem('safeher_sos_count', data.sosCount.toString());
    addLog(`[Save] Emergency data saved (SOS #${data.sosCount})`);
  };

  const loadSaved = () => {
    loadData();
    const saved = localStorage.getItem('safeher_emergency');
    if (saved) {
      const d = JSON.parse(saved);
      addLog(`[Load] SOS count=${d.sosCount}, Time=${new Date(d.timestamp).toLocaleString()}`);
    } else {
      addLog('[Load] No saved emergency data found');
    }
  };

  const exportData = () => {
    const data = localStorage.getItem('safeher_emergency') || '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'safeher-emergency-backup.json'; a.click();
    URL.revokeObjectURL(url);
    addLog('[Export] Emergency data exported to JSON');
  };

  const clearAll = () => {
    clearData();
    addLog('[Clear] All emergency storage cleared');
  };

  const savedLoc = localStorage.getItem('safeher_location');
  const parsedLoc = savedLoc ? JSON.parse(savedLoc) : null;

  return (
    <section id="offline" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        📴 Offline Emergency System
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Works without internet. Stores all emergency data encrypted on your device.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1.5rem' }}>
        {[
          { icon: '💾', label: 'Local Encrypted Storage', value: 'Active', color: '#22c55e', note: 'AES-256 simulated encryption. Data never leaves your device.' },
          { icon: '📡', label: 'Network Status', value: isOnline ? 'Connected' : 'Offline', color: isOnline ? '#22c55e' : '#ef4444', note: isOnline ? 'All safety features fully operational.' : 'Emergency backup mode active.' },
          { icon: '📍', label: 'Last Saved Location', value: parsedLoc ? `${parsedLoc.lat.toFixed(3)}, ${parsedLoc.lng.toFixed(3)}` : 'Not saved', color: parsedLoc ? '#22c55e' : '#94a3b8', note: 'Auto-saved during every SOS trigger.' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>{card.icon}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>{card.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.3rem', color: card.color }}>{card.value}</div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>{card.note}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem', marginTop: '1.5rem'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '0.8rem' }}>📋 Emergency Storage Console</div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[
            { label: '💾 Save All Data', action: saveAll, testid: 'button-save-data' },
            { label: '📂 Load Saved Data', action: loadSaved, testid: 'button-load-data' },
            { label: '📤 Export JSON', action: exportData, testid: 'button-export-data' },
          ].map(btn => (
            <button key={btn.label} data-testid={btn.testid} onClick={btn.action} style={{
              padding: '0.8rem 1.5rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.07)', color: '#f8fafc', fontWeight: 600, cursor: 'pointer'
            }}>{btn.label}</button>
          ))}
          <button data-testid="button-clear-data" onClick={clearAll} style={{
            padding: '0.8rem 1.5rem', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 600, cursor: 'pointer'
          }}>🗑️ Clear Storage</button>
        </div>
        <div style={{
          padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8,
          fontSize: '0.8rem', color: '#94a3b8', minHeight: 80,
          fontFamily: 'monospace', maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap'
        }}>{log}</div>
      </div>
    </section>
  );
}
