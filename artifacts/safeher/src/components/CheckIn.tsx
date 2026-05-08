import { useState, useEffect, useRef } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

const DURATIONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
];

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function CheckIn() {
  const { activateSOS, addTimelineEvent, setNotification } = useEmergencyStore();
  const [selected, setSelected] = useState(DURATIONS[1].seconds);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pct = remaining !== null ? (remaining / selected) * 100 : 100;
  const urgent = remaining !== null && remaining <= 60;
  const warning = remaining !== null && remaining <= 180 && !urgent;

  const start = () => {
    setRemaining(selected);
    setActive(true);
    setExpired(false);
    addTimelineEvent('⏱️ Check-In Timer Started', `You must check in within ${DURATIONS.find(d => d.seconds === selected)?.label}`);
    setNotification(`⏱️ Check-in timer started — tap "I'm Safe" before it expires!`);
  };

  const checkIn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActive(false);
    setRemaining(null);
    setExpired(false);
    addTimelineEvent('✅ Safe Check-In', 'User confirmed safety — timer reset.');
    setNotification('✅ Check-in confirmed! You\'re marked safe.');
  };

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActive(false);
    setRemaining(null);
    setExpired(false);
    addTimelineEvent('❌ Check-In Cancelled', 'Timer cancelled by user.');
  };

  useEffect(() => {
    if (!active || remaining === null) return;
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          setActive(false);
          setExpired(true);
          addTimelineEvent('🚨 Check-In EXPIRED', 'No check-in received — SOS auto-activated!');
          activateSOS();
          return 0;
        }
        if (prev === 60) setNotification('⚠️ 1 minute left to check in!');
        if (prev === 180) setNotification('⚠️ 3 minutes left to check in!');
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]);

  const color = urgent ? '#ef4444' : warning ? '#f59e0b' : '#22c55e';

  return (
    <section id="checkin" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        ⏱️ Safe Check-In Timer
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Set a timer — if you don't tap "I'm Safe" before it expires, SOS fires automatically and alerts your contacts.
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '2rem'
      }}>
        {!active && !expired ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Select check-in window
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {DURATIONS.map(d => (
                  <button
                    key={d.seconds}
                    onClick={() => setSelected(d.seconds)}
                    style={{
                      padding: '0.6rem 1.2rem', borderRadius: 10,
                      border: `1px solid ${selected === d.seconds ? '#7c3aed' : 'rgba(255,255,255,0.12)'}`,
                      background: selected === d.seconds ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                      color: selected === d.seconds ? '#a78bfa' : '#94a3b8',
                      fontWeight: selected === d.seconds ? 700 : 400,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >{d.label}</button>
                ))}
              </div>
            </div>
            <button onClick={start} style={{
              width: '100%', padding: '1rem', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: 'white', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer'
            }}>
              ▶ Start Check-In Timer
            </button>
          </>
        ) : expired ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚨</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.5rem' }}>
              Timer Expired — SOS Sent!
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Your emergency contacts have been alerted automatically.
            </div>
            <button onClick={() => setExpired(false)} style={{
              padding: '0.8rem 2rem', borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.1)', color: '#f8fafc',
              fontWeight: 600, cursor: 'pointer'
            }}>Reset Timer</button>
          </div>
        ) : (
          <>
            {/* Circular progress ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', width: 180, height: 180 }}>
                <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                  <circle
                    cx="90" cy="90" r="80" fill="none"
                    stroke={color} strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - pct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(remaining ?? 0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>remaining</div>
                </div>
              </div>

              {urgent && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: 8,
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#f87171', fontWeight: 600, fontSize: '0.85rem', animation: 'pulse 1s infinite'
                }}>
                  ⚠️ SOS will fire soon — tap I'm Safe!
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={checkIn} style={{
                flex: 1, padding: '1rem', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: 'white', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer'
              }}>
                ✅ I'm Safe
              </button>
              <button onClick={cancel} style={{
                padding: '1rem 1.5rem', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
              }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
