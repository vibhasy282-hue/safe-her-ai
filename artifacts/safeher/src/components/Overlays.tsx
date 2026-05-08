import { useEffect, useRef } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

export default function Overlays() {
  const {
    countdownActive, countdownValue, countdownType,
    cancelCountdown, tickCountdown,
    fakeCallActive, endFakeCall,
    popupActive, popupDetails, dismissPopup, activateSOS,
    sosActive, stopSOS,
    notification,
  } = useEmergencyStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (countdownActive) {
      timerRef.current = setInterval(() => tickCountdown(), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdownActive]);

  const confirmEmergency = () => {
    dismissPopup();
    if (!sosActive) { activateSOS(); setTimeout(() => stopSOS(), 5000); }
  };

  const triggerNames: Record<string, string> = {
    shake: '📳 Shake Detection',
    power: '🔌 Triple Power Press',
    volume: '🔊 Long Volume Press',
    watch: '⌚ Smartwatch Trigger',
  };

  return (
    <>
      {/* Countdown overlay */}
      {countdownActive && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15,12,41,0.96)', zIndex: 10000,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '1rem' }}>
            {countdownType ? triggerNames[countdownType] : 'SOS'} — Sending SOS in...
          </div>
          <div data-testid="status-countdown" className="countdown-number" style={{
            fontSize: '8rem', fontWeight: 900, color: '#ef4444'
          }}>
            {countdownValue}
          </div>
          <button
            data-testid="button-cancel-countdown"
            onClick={cancelCountdown}
            style={{
              marginTop: '2rem', padding: '0.8rem 2rem', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.07)', color: '#f8fafc',
              fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
            }}
          >
            ✋ Cancel Emergency
          </button>
        </div>
      )}

      {/* Fake call overlay */}
      {fakeCallActive && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(180deg,#1e293b,#0f172a)', zIndex: 10001,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="fake-avatar" style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', marginBottom: '1.5rem'
          }}>👮</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Police Station</div>
          <div style={{ color: '#94a3b8', marginBottom: '2rem' }}>Incoming Call...</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button data-testid="button-fake-decline" onClick={endFakeCall} style={{
              width: 70, height: 70, borderRadius: '50%', border: 'none',
              background: '#ef4444', color: 'white', fontSize: '1.5rem', cursor: 'pointer'
            }}>📵</button>
            <button data-testid="button-fake-accept" onClick={endFakeCall} style={{
              width: 70, height: 70, borderRadius: '50%', border: 'none',
              background: '#22c55e', color: 'white', fontSize: '1.5rem', cursor: 'pointer'
            }}>📞</button>
          </div>
        </div>
      )}

      {/* Emergency popup */}
      {popupActive && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', zIndex: 10001
          }} />
          <div className="emergency-popup" style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
            border: '2px solid #ef4444', borderRadius: 20,
            padding: '2rem', zIndex: 10002, textAlign: 'center',
            minWidth: 320
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>🚨 EMERGENCY DETECTED!</div>
            <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
              AI has detected a potential threat!<br />SOS has been activated automatically.
            </div>
            <div data-testid="status-popup-details" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{popupDetails}</div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button data-testid="button-confirm-emergency" onClick={confirmEmergency} style={{
                padding: '0.8rem 1.5rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white',
                fontWeight: 600, cursor: 'pointer'
              }}>Send SOS Now</button>
              <button data-testid="button-dismiss-emergency" onClick={dismissPopup} style={{
                padding: '0.8rem 1.5rem', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)', color: '#f8fafc',
                fontWeight: 600, cursor: 'pointer'
              }}>False Alarm</button>
            </div>
          </div>
        </>
      )}

      {/* Floating notification banner */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', left: '50%',
          transform: 'translateX(-50%)',
          background: notification.startsWith('✅') ? 'rgba(22,101,52,0.97)' :
                      notification.startsWith('❌') ? 'rgba(127,29,29,0.97)' :
                      notification.startsWith('⚠️') ? 'rgba(120,53,15,0.97)' :
                      'rgba(30,27,75,0.97)',
          border: `1px solid ${notification.startsWith('✅') ? '#22c55e' : notification.startsWith('❌') ? '#ef4444' : notification.startsWith('⚠️') ? '#f59e0b' : '#7c3aed'}`,
          borderRadius: 14, padding: '0.9rem 1.6rem',
          color: '#f8fafc', fontWeight: 600, fontSize: '1rem',
          zIndex: 20000, maxWidth: '90vw', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification}
        </div>
      )}
    </>
  );
}
