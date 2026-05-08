import { useEmergencyStore } from '@/hooks/useEmergencyStore';

export default function Hero() {
  const { sosActive, activateSOS, stopSOS, locationStatus, location } = useEmergencyStore();

  const handleSOS = () => {
    if (sosActive) {
      stopSOS();
    } else {
      activateSOS();
      setTimeout(() => stopSOS(), 5000);
    }
  };

  return (
    <section id="hero" style={{
      minHeight: '90vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      position: 'relative', padding: '4rem 2rem'
    }}>
      <h1 className="fade-in" style={{
        fontSize: 'clamp(3rem,8vw,6rem)', fontWeight: 900, lineHeight: 1, marginBottom: '1rem'
      }}>
        Safe<span className="hero-title span">Her</span>
      </h1>
      <p className="fade-in delay-1" style={{
        fontSize: '1.2rem', color: '#94a3b8', letterSpacing: '0.2em',
        textTransform: 'uppercase', marginBottom: '3rem'
      }}>
        Predict. Protect. Prevent.
      </p>

      <div className="sos-wrapper fade-in delay-2" style={{ position: 'relative', margin: '2rem 0' }}>
        {[0,1,2].map(i => (
          <div key={i} className="sos-ring" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%', opacity: 0,
            animationDelay: `${i * 0.5}s`
          }} />
        ))}
        <button
          data-testid="button-main-sos"
          className={`sos-btn ${sosActive ? 'active' : ''}`}
          onClick={handleSOS}
          style={{
            width: 180, height: 180, borderRadius: '50%', border: 'none',
            color: 'white', fontSize: '2.5rem', fontWeight: 900,
            cursor: 'pointer', position: 'relative', zIndex: 2,
            transition: 'transform 0.3s'
          }}
        >
          {sosActive ? '!' : 'SOS'}
        </button>
      </div>

      <div className="fade-in delay-3" style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
        gap: '1rem', width: '100%', maxWidth: 800, marginTop: '3rem'
      }}>
        {[
          { icon: '🤖', label: 'AI Guardian', value: 'Active', cls: 'safe' },
          { icon: '📡', label: 'Location', value: location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : locationStatus, cls: location ? 'safe' : 'warn' },
          { icon: '🎙️', label: 'Voice AI', value: 'Standby', cls: 'safe' },
          { icon: '🔒', label: 'Privacy Score', value: '98%', cls: 'safe' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16,
            padding: '1.2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{card.label}</div>
            <div style={{
              fontSize: '1.2rem', fontWeight: 700, marginTop: '0.3rem', wordBreak: 'break-all',
              color: card.cls === 'safe' ? '#22c55e' : card.cls === 'warn' ? '#f59e0b' : '#ef4444'
            }}>{card.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
