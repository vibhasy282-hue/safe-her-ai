import { useEffect, useState } from 'react';

const PRIVACY_ITEMS = [
  { icon: '🔐', label: 'Encrypted Protection', desc: 'AES-256 encryption simulation', target: 100, id: 'enc1' },
  { icon: '📍', label: 'Secure Location Sharing', desc: 'End-to-end encrypted sharing', target: 95, id: 'enc2' },
  { icon: '🤖', label: 'AI Threat Monitoring', desc: 'Real-time AI analysis', target: 92, id: 'enc3' },
  { icon: '🛡️', label: 'Overall Privacy Score', desc: 'Combined protection level', target: 98, id: 'enc4' },
];

const CHARS = '0123456789ABCDEFabcdef!@#$%^&*';

function EncryptAnim() {
  const [text, setText] = useState('');
  useEffect(() => {
    const iv = setInterval(() => {
      setText(Array(28).fill(0).map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join(''));
    }, 120);
    return () => clearInterval(iv);
  }, []);
  return <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#a78bfa', marginTop: '0.3rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>{text}</div>;
}

export default function PrivacyNetwork() {
  const [widths, setWidths] = useState(PRIVACY_ITEMS.map(() => 0));

  useEffect(() => {
    const t = setTimeout(() => setWidths(PRIVACY_ITEMS.map(i => i.target)), 300);
    return () => clearTimeout(t);
  }, []);

  const half = Math.ceil(PRIVACY_ITEMS.length / 2);
  const cols = [PRIVACY_ITEMS.slice(0, half), PRIVACY_ITEMS.slice(half)];

  return (
    <section id="privacy" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        🔐 Privacy &amp; Encrypted Safety Network
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Enterprise-grade protection for your safety data
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{
            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
          }}>
            {col.map((item, li) => {
              const idx = ci * half + li;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: ci * half + li < PRIVACY_ITEMS.length - 1 ? '1rem' : 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg,#7c3aed,#3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                  }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.desc}</div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: '0.3rem' }}>
                      <div style={{
                        height: '100%', borderRadius: 4,
                        background: 'linear-gradient(90deg,#22c55e,#7c3aed)',
                        width: `${widths[idx]}%`, transition: 'width 1.5s ease'
                      }} />
                    </div>
                    <EncryptAnim />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
