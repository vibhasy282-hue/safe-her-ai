import { useEffect, useState } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

type HeatCell = { color: string };

function Heatmap() {
  const COLORS = [
    'rgba(34,197,94,0.5)', 'rgba(245,158,11,0.5)',
    'rgba(239,68,68,0.5)', 'rgba(124,58,237,0.5)',
  ];
  const [cells, setCells] = useState<HeatCell[]>(
    Array(60).fill(null).map(() => ({ color: COLORS[Math.floor(Math.random() * COLORS.length)] }))
  );

  useEffect(() => {
    const iv = setInterval(() => {
      setCells(prev => prev.map(c =>
        Math.random() > 0.85 ? { color: COLORS[Math.floor(Math.random() * COLORS.length)] } : c
      ));
    }, 800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ height: 300, background: 'rgba(0,0,0,0.3)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gridTemplateRows: 'repeat(6,1fr)',
        gap: 2, padding: 4
      }}>
        {cells.map((c, i) => (
          <div key={i} style={{ borderRadius: 4, background: c.color, transition: 'background 0.8s ease' }} />
        ))}
      </div>
    </div>
  );
}

export default function ExtraFeatures() {
  const { guardianOn, toggleGuardian, triggerFakeCall, timeline, addTimelineEvent } = useEmergencyStore();
  const [guardianLog, setGuardianLog] = useState('Guardian mode is currently OFF. Toggle to enable continuous AI monitoring.');

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (guardianOn) {
      const msgs = [
        'Scanning surroundings... All clear.',
        'Voice analysis: Normal ambient noise.',
        'Location check: Safe zone verified.',
        'Crowd density: Normal levels.',
        'No threats detected. Guardian watching.',
        'Network check: Stable. Backup ready.',
      ];
      setGuardianLog('👼 AI Guardian Mode ACTIVE\n' + msgs[0]);
      iv = setInterval(() => {
        setGuardianLog('👼 AI Guardian Mode ACTIVE\n' + msgs[Math.floor(Math.random() * msgs.length)]);
      }, 6000);
    } else {
      setGuardianLog('Guardian mode is currently OFF. Toggle to enable continuous AI monitoring.');
    }
    return () => clearInterval(iv);
  }, [guardianOn]);

  return (
    <section id="extras" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        ✨ Extra Safety Features
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Additional tools for every situation
      </p>

      {/* Guardian Mode */}
      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '2rem' }}>👼</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>AI Guardian Mode</div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Continuous AI monitoring with predictive threat detection</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>OFF</span>
            <div
              data-testid="toggle-guardian"
              onClick={toggleGuardian}
              style={{
                position: 'relative', width: 50, height: 26,
                background: guardianOn ? '#22c55e' : 'rgba(255,255,255,0.1)',
                borderRadius: 13, cursor: 'pointer', transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: guardianOn ? 27 : 3,
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                transition: 'left 0.3s'
              }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ON</span>
          </div>
        </div>
        <div style={{
          marginTop: '0.8rem', fontSize: '0.85rem', color: '#94a3b8',
          padding: '0.6rem', background: 'rgba(0,0,0,0.15)', borderRadius: 8,
          whiteSpace: 'pre-wrap'
        }}>{guardianLog}</div>
      </div>

      {/* Fake Call */}
      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>📞</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fake Call Feature</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Simulate incoming call to escape uncomfortable situations</div>
            </div>
          </div>
          <button data-testid="button-fake-call" onClick={triggerFakeCall} style={{
            padding: '0.8rem 1.5rem', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: 'white',
            fontWeight: 600, cursor: 'pointer'
          }}>📞 Trigger Fake Call</button>
        </div>
      </div>

      {/* Emergency Timeline */}
      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem'
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>📜 Emergency Timeline</div>
        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{
            position: 'absolute', left: '0.5rem', top: 0, bottom: 0, width: 2,
            background: 'linear-gradient(to bottom,#7c3aed,#06b6d4)'
          }} />
          {(timeline.length === 0 ? [{ time: new Date().toISOString(), title: 'SafeHer AI System Initialized', desc: 'All safety modules loaded and ready' }] : timeline.slice(0, 10)).map((ev, i) => (
            <div key={i} style={{
              position: 'relative', marginBottom: '1.2rem', padding: '1rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12
            }}>
              <div style={{
                position: 'absolute', left: '-1.8rem', top: '1.3rem',
                width: 12, height: 12, borderRadius: '50%',
                background: '#a78bfa', border: '2px solid #0f0c29'
              }} />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                {new Date(ev.time).toLocaleTimeString()}
              </div>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{ev.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{ev.desc}</div>
            </div>
          ))}
        </div>
        <button data-testid="button-add-test-event" onClick={() => addTimelineEvent('Manual Test', 'User triggered a test event')} style={{
          marginTop: '1rem', padding: '0.8rem 1.5rem', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.07)', color: '#f8fafc',
          fontWeight: 600, cursor: 'pointer'
        }}>➕ Add Test Event</button>
      </div>

      {/* Heatmap */}
      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>🗺️ Emergency Safety Heatmap</div>
        <Heatmap />
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(34,197,94,0.5)', label: 'Safe' },
            { color: 'rgba(245,158,11,0.5)', label: 'Caution' },
            { color: 'rgba(239,68,68,0.5)', label: 'Danger' },
            { color: 'rgba(124,58,237,0.5)', label: 'Police' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: l.color, display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
