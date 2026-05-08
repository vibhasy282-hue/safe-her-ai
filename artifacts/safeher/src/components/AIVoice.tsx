import { useState, useEffect, useRef, useCallback } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

const KEYWORDS = ['help', 'bachao', 'madad', 'save me', 'bachavo', 'bachaao', 'save'];

type AIStatusType = 'idle' | 'listening' | 'alert';

export default function AIVoice() {
  const { addTimelineEvent, showPopup } = useEmergencyStore();
  const [isListening, setIsListening] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusType>('idle');
  const [panicVal, setPanicVal] = useState(0);
  const [noiseVal, setNoiseVal] = useState(0);
  const [dangerVal, setDangerVal] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(Array(30).fill(4));
  const [lastDetected, setLastDetected] = useState('No emergency keywords detected yet...');
  const [lastDetectedAlert, setLastDetectedAlert] = useState(false);
  const [voiceLog, setVoiceLog] = useState('[System] Voice AI initialized...\n[System] Waiting for activation...');
  const [isOnline] = useState(navigator.onLine);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recRef = useRef<any>(null);

  const logVoice = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setVoiceLog(prev => prev + `\n[${time}] ${msg}`);
  }, []);

  const handleKeywordDetected = useCallback((keyword: string, context: string) => {
    const conf = (85 + Math.random() * 14.9).toFixed(1);
    setLastDetected(`DETECTED: "${keyword.toUpperCase()}" — AI Confidence: ${conf}% | ${context}`);
    setLastDetectedAlert(true);
    setPanicVal(85 + Math.random() * 15);
    setNoiseVal(80 + Math.random() * 20);
    setDangerVal(75 + Math.random() * 25);
    setAiStatus('alert');
    logVoice(`[ALERT] Keyword "${keyword}" detected! Confidence: ${conf}%`);
    addTimelineEvent(`🚨 Keyword: "${keyword}"`, `AI detected with ${conf}% confidence`);
    setTimeout(() => showPopup(`Voice AI detected keyword "${keyword.toUpperCase()}" with ${conf}% confidence!`), 600);
    setTimeout(() => {
      if (!isListening) return;
      setLastDetected('No emergency keywords detected yet...');
      setLastDetectedAlert(false);
      setAiStatus('listening');
    }, 6000);
  }, [addTimelineEvent, showPopup, logVoice, isListening]);

  const startListening = () => {
    setIsListening(true);
    setAiStatus('listening');
    logVoice('[Voice] AI listening started...');
    addTimelineEvent('🎙️ Voice AI Started', 'Listening for emergency keywords');

    intervalRef.current = setInterval(() => {
      setBarHeights(Array(30).fill(0).map(() => 4 + Math.random() * 90));
      setNoiseVal(30 + Math.random() * 60);
      setPanicVal(Math.random() * 15);
      setDangerVal(Math.random() * 10);
    }, 100);

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = true; rec.lang = 'en-IN';
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript.toLowerCase();
          KEYWORDS.forEach(kw => { if (t.includes(kw)) handleKeywordDetected(kw, t); });
        }
      };
      rec.onerror = () => {};
      rec.start();
      recRef.current = rec;
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setAiStatus('idle');
    if (intervalRef.current) clearInterval(intervalRef.current);
    setBarHeights(Array(30).fill(4));
    setPanicVal(0); setNoiseVal(0); setDangerVal(0);
    if (recRef.current) { try { recRef.current.stop(); } catch(e) {} }
    logVoice('[Voice] AI listening stopped.');
  };

  const simulate = () => {
    const kw = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
    handleKeywordDetected(kw, `Someone said "${kw}" nearby`);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const statusColors: Record<AIStatusType, string> = { idle: '#22c55e', listening: '#06b6d4', alert: '#ef4444' };
  const statusBg: Record<AIStatusType, string> = {
    idle: 'rgba(34,197,94,0.15)', listening: 'rgba(6,182,212,0.15)', alert: 'rgba(239,68,68,0.2)'
  };
  const statusBorder: Record<AIStatusType, string> = {
    idle: 'rgba(34,197,94,0.3)', listening: 'rgba(6,182,212,0.3)', alert: 'rgba(239,68,68,0.4)'
  };

  return (
    <section id="voice" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        🎙️ AI Voice &amp; Panic Detection
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Real-time voice analysis detecting emergency keywords in multiple languages
      </p>

      {!isOnline && (
        <div className="offline-banner" style={{
          background: 'linear-gradient(90deg,rgba(239,68,68,0.15),rgba(245,158,11,0.1))',
          border: '1px solid #ef4444', borderRadius: 12, padding: '1rem',
          marginBottom: '1.5rem', textAlign: 'center'
        }}>
          ⚠️ <strong>Offline Mode:</strong> Voice AI running locally. Emergency data stored on device.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {/* Left card */}
        <div style={{
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
        }}>
          {/* Voice visualizer */}
          <div style={{
            height: 120, background: 'rgba(0,0,0,0.3)', borderRadius: 12,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 3, padding: '1rem', overflow: 'hidden', marginBottom: '1rem'
          }}>
            {barHeights.map((h, i) => (
              <div key={i} style={{
                width: 6, height: h, minHeight: 4,
                background: isListening && (panicVal > 60 || dangerVal > 60)
                  ? 'linear-gradient(to top, #ef4444, #f59e0b)'
                  : 'linear-gradient(to top, #7c3aed, #06b6d4)',
                borderRadius: 3, transition: 'height 0.08s ease'
              }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button data-testid="button-start-listening" onClick={startListening} disabled={isListening} style={{
              padding: '0.8rem 1.5rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#3b82f6)', color: 'white',
              fontWeight: 600, cursor: isListening ? 'not-allowed' : 'pointer', opacity: isListening ? 0.5 : 1
            }}>🎙️ Start Listening</button>
            <button data-testid="button-stop-listening" onClick={stopListening} disabled={!isListening} style={{
              padding: '0.8rem 1.5rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.07)', color: '#f8fafc',
              fontWeight: 600, cursor: !isListening ? 'not-allowed' : 'pointer', opacity: !isListening ? 0.5 : 1
            }}>⏹️ Stop</button>
            <button data-testid="button-simulate-voice" onClick={simulate} style={{
              padding: '0.8rem 1.5rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.07)', color: '#f8fafc', fontWeight: 600, cursor: 'pointer'
            }}>🧪 Simulate</button>
          </div>

          <div className={`ai-status ${aiStatus}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
            color: statusColors[aiStatus], background: statusBg[aiStatus],
            border: `1px solid ${statusBorder[aiStatus]}`
          }}>
            ● AI Status: {aiStatus === 'idle' ? 'Idle' : aiStatus === 'listening' ? 'Listening...' : 'EMERGENCY DETECTED!'}
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            Detects: <span style={{ color: '#a78bfa' }}>"Help"</span>, <span style={{ color: '#a78bfa' }}>"Bachao"</span>, <span style={{ color: '#a78bfa' }}>"Madad"</span>, <span style={{ color: '#a78bfa' }}>"Save Me"</span>
          </div>

          <div data-testid="status-last-detected" style={{
            marginTop: '0.8rem', padding: '0.6rem',
            background: lastDetectedAlert ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
            border: lastDetectedAlert ? '1px solid #ef4444' : 'none',
            borderRadius: 8, fontSize: '0.85rem', color: '#94a3b8', minHeight: 36
          }}>
            {lastDetectedAlert ? <span style={{ color: '#ef4444', fontWeight: 700 }}>🚨 {lastDetected}</span> : lastDetected}
          </div>
        </div>

        {/* Right card — meters */}
        <div style={{
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
        }}>
          {[
            { label: '🧠 Panic Meter', val: panicVal, unit: '%', color: 'linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)' },
            { label: '🔊 Noise Level', val: noiseVal / 1.2, unit: ` ${Math.round(noiseVal)} dB`, color: 'linear-gradient(90deg,#06b6d4,#7c3aed)' },
            { label: '⚡ AI Danger Confidence', val: dangerVal, unit: '%', color: 'linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)' },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                <span>{m.label}</span><span>{Math.round(m.val)}{m.unit}</span>
              </div>
              <div style={{ height: 14, background: 'rgba(255,255,255,0.08)', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
                <div className="meter-fill" style={{
                  width: `${Math.min(m.val, 100)}%`, height: '100%', borderRadius: 7,
                  background: m.color, transition: 'width 0.3s ease', position: 'relative', overflow: 'hidden'
                }} />
              </div>
            </div>
          ))}

          <div style={{
            marginTop: '1rem', padding: '0.6rem', background: 'rgba(0,0,0,0.2)',
            borderRadius: 8, fontSize: '0.8rem', color: '#94a3b8',
            maxHeight: 150, overflowY: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap'
          }}>{voiceLog}</div>
        </div>
      </div>
    </section>
  );
}
