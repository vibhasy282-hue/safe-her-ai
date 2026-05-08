import { useState, useEffect, useRef } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

const TRIGGER_NAMES: Record<string, string> = {
  shake: '📳 Shake Detection',
  power: '🔌 Triple Power Press',
  volume: '🔊 Long Volume Press',
  watch: '⌚ Smartwatch Trigger',
};

export default function SOSHiddenTriggers() {
  const { triggerCountdown, addTimelineEvent } = useEmergencyStore();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [logItems, setLogItems] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogItems(prev => [`🚨 [${time}] ${msg}`, ...prev].slice(0, 20));
  };

  const activateTrigger = (type: string) => {
    setActiveCard(type);
    addLog(`${TRIGGER_NAMES[type]} activated!`);
    addTimelineEvent(TRIGGER_NAMES[type], 'Hidden SOS trigger activated');
    triggerCountdown(type);
    setTimeout(() => setActiveCard(null), 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    let powerPresses = 0;
    let powerTimer: ReturnType<typeof setTimeout> | null = null;
    let volumeHeld = false;
    let volumeTimer: ReturnType<typeof setTimeout> | null = null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        powerPresses++;
        if (powerTimer) clearTimeout(powerTimer);
        powerTimer = setTimeout(() => { powerPresses = 0; }, 800);
        if (powerPresses >= 3) { powerPresses = 0; activateTrigger('power'); }
      }
      if ((e.key === 'v' || e.key === 'V') && !volumeHeld) {
        volumeHeld = true;
        volumeTimer = setTimeout(() => { volumeHeld = false; activateTrigger('volume'); }, 1500);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') {
        volumeHeld = false;
        if (volumeTimer) clearTimeout(volumeTimer);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const triggers = [
    { id: 'shake', icon: '📳', name: 'Shake Detection', desc: 'Shake phone vigorously 3 times', hint: 'Click to test' },
    { id: 'power', icon: '🔌', name: 'Triple Power Press', desc: 'Press power button 3 times fast', hint: 'Press "P" key x3' },
    { id: 'volume', icon: '🔊', name: 'Long Volume Press', desc: 'Hold volume down 3 seconds', hint: 'Hold "V" key' },
    { id: 'watch', icon: '⌚', name: 'Smartwatch Trigger', desc: 'Double-tap smartwatch face', hint: 'Click to test' },
  ];

  return (
    <section id="triggers" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        📳 Smart Hidden SOS Triggers
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Discrete emergency activation when you can't press SOS directly
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {triggers.map(t => (
          <div
            key={t.id}
            data-testid={`card-trigger-${t.id}`}
            className={`trigger-card ${activeCard === t.id ? 'trigger-active' : ''}`}
            onClick={() => activateTrigger(t.id)}
            style={{
              background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
              border: `1px solid ${activeCard === t.id ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 16, padding: '1.5rem', textAlign: 'center', cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{t.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{t.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.desc}</div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#a78bfa' }}>{t.hint}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📊 Trigger Log</div>
        <div data-testid="status-trigger-log" style={{ fontSize: '0.85rem', color: '#94a3b8', maxHeight: 150, overflowY: 'auto' }}>
          {logItems.length === 0
            ? 'No triggers activated yet. Try clicking a card above or use keyboard shortcuts.'
            : logItems.map((item, i) => <div key={i} style={{ marginBottom: '0.3rem', color: '#ef4444' }}>{item}</div>)}
        </div>
      </div>
    </section>
  );
}
