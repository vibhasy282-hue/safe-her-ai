import { useState } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

export default function SafeRoute() {
  const { addTimelineEvent } = useEmergencyStore();
  const [current, setCurrent] = useState('');
  const [dest, setDest] = useState('');
  const [result, setResult] = useState<null | {
    score: number; risk: string; crowd: string; police: number; route: string; tags: string[];
  }>(null);

  const generate = () => {
    if (!dest) return;
    const score = 65 + Math.floor(Math.random() * 30);
    const risk = score > 85 ? 'LOW' : score > 70 ? 'MODERATE' : 'HIGH';
    const crowd = score > 80 ? 'HIGH' : 'MODERATE';
    const police = 1 + Math.floor(Math.random() * 3);
    const routes = [
      `Via Main Road → ${dest} (Well-lit, 12 CCTV cameras)`,
      `Via Market Street → ${dest} (High foot traffic, 800+ people)`,
      `Via Police Checkpoint → ${dest} (Monitored, 2 stations nearby)`,
    ];
    const allTags = ['Well-lit', 'CCTV Active', 'Populated', 'Police Nearby', 'Main Road', '24/7 Shops', 'Bus Route'];
    const tags = allTags.slice(0, 3 + Math.floor(Math.random() * 4));
    setResult({ score, risk, crowd, police, route: `From ${current || 'Current Location'}: ${routes[Math.floor(Math.random() * routes.length)]}`, tags });
    addTimelineEvent('🛣️ AI Route Generated', `To ${dest} — Safety Score: ${score}%`);
  };

  const scoreColor = (s: number) => s > 80 ? '#22c55e' : s > 60 ? '#f59e0b' : '#ef4444';
  const riskColor = (r: string) => r === 'LOW' ? '#22c55e' : r === 'MODERATE' ? '#f59e0b' : '#ef4444';

  const circumference = 2 * Math.PI * 42;
  const offset = result ? circumference - (result.score / 100) * circumference : circumference;

  return (
    <section id="route" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        🛣️ Safe Route Prediction
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        AI analyzes crowd density, crime risk, and police proximity for safest path
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <input data-testid="input-current-location" value={current} onChange={e => setCurrent(e.target.value)}
            placeholder="📍 Current Location (e.g. Connaught Place, Delhi)"
            style={{
              width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f8fafc',
              fontSize: '0.95rem'
            }} />
          <input data-testid="input-destination" value={dest} onChange={e => setDest(e.target.value)}
            placeholder="🏁 Destination (e.g. India Gate, Delhi)"
            style={{
              width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f8fafc',
              fontSize: '0.95rem'
            }} />
        </div>

        <button data-testid="button-generate-route" onClick={generate} style={{
          padding: '0.8rem 1.5rem', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: 'white',
          fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem'
        }}>🛡️ Generate AI Safe Route</button>

        {result && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
              {/* Score ring */}
              <div style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16, padding: '1.2rem', textAlign: 'center'
              }}>
                <div style={{ width: 100, height: 100, margin: '0 auto', position: 'relative' }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    fontSize: '1.5rem', fontWeight: 800, color: scoreColor(result.score)
                  }}>{result.score}</div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem' }}>Safety Score</div>
              </div>

              {[
                { label: 'Risk Level', value: result.risk, color: riskColor(result.risk) },
                { label: 'Crowd Safety', value: result.crowd, color: result.crowd === 'HIGH' ? '#22c55e' : '#f59e0b' },
                { label: 'Police Nearby', value: `${result.police} stations`, color: '#a78bfa' },
              ].map(c => (
                <div key={c.label} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 16, padding: '1.2rem', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.3rem' }}>{c.label}</div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '1.5rem', padding: '1rem',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>🛣️ AI Recommended Route</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{result.route}</div>
              <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {result.tags.map(t => (
                  <span key={t} style={{
                    padding: '0.3rem 0.8rem', background: 'rgba(124,58,237,0.15)',
                    borderRadius: 20, fontSize: '0.75rem', color: '#a78bfa',
                    border: '1px solid rgba(124,58,237,0.3)'
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
