import { useEmergencyStore } from '@/hooks/useEmergencyStore';

export default function FloatingSOS() {
  const { activateSOS, stopSOS, sosActive } = useEmergencyStore();

  const handleClick = () => {
    if (sosActive) { stopSOS(); }
    else { activateSOS(); setTimeout(() => stopSOS(), 5000); }
  };

  return (
    <button
      data-testid="button-floating-sos"
      className="floating-sos"
      onClick={handleClick}
      title="Emergency SOS"
      style={{
        position: 'fixed', bottom: '2rem', right: '2rem',
        width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        border: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 800,
        cursor: 'pointer', zIndex: 999, boxShadow: '0 5px 30px rgba(239,68,68,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      SOS
    </button>
  );
}
