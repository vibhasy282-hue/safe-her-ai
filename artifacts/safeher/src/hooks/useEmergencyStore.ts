import { create } from 'zustand';

interface TimelineEvent {
  time: string;
  title: string;
  desc: string;
}

interface EmergencyState {
  isOnline: boolean;
  sosActive: boolean;
  sosCount: number;
  location: { lat: number; lng: number } | null;
  locationStatus: string;
  guardianOn: boolean;
  timeline: TimelineEvent[];
  countdownActive: boolean;
  countdownType: string | null;
  countdownValue: number;
  fakeCallActive: boolean;
  popupActive: boolean;
  popupDetails: string;
  setOnline: (status: boolean) => void;
  activateSOS: () => void;
  stopSOS: () => void;
  toggleGuardian: () => void;
  addTimelineEvent: (title: string, desc: string) => void;
  triggerCountdown: (type: string) => void;
  cancelCountdown: () => void;
  tickCountdown: () => void;
  triggerFakeCall: () => void;
  endFakeCall: () => void;
  showPopup: (details: string) => void;
  dismissPopup: () => void;
  initApp: () => void;
  updateLocation: () => void;
  clearData: () => void;
  loadData: () => void;
}

// Create an audio context for the alarm
let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;

const playAlarm = () => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.2); // C#6
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.4);
    
    // Loop frequency modulation manually or just let it be annoying
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // not too loud
    oscillator.start();
  } catch(e) { console.error("Audio error", e); }
};

const stopAlarm = () => {
  if (oscillator) {
    try {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    } catch(e) {}
  }
};

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  isOnline: navigator.onLine,
  sosActive: false,
  sosCount: parseInt(localStorage.getItem('safeher_sos_count') || '0'),
  location: null,
  locationStatus: 'Acquiring...',
  guardianOn: false,
  timeline: JSON.parse(localStorage.getItem('safeher_timeline') || '[]'),
  countdownActive: false,
  countdownType: null,
  countdownValue: 5,
  fakeCallActive: false,
  popupActive: false,
  popupDetails: '',

  setOnline: (status) => set({ isOnline: status }),

  activateSOS: () => {
    if (get().sosActive) return;

    const count = get().sosCount + 1;
    localStorage.setItem('safeher_sos_count', count.toString());

    const data = {
      time: new Date().toISOString(),
      location: get().location,
      sosCount: count,
      device: navigator.userAgent
    };
    localStorage.setItem('safeher_emergency', JSON.stringify(data));

    if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    playAlarm();

    get().addTimelineEvent('🚨 SOS ACTIVATED', 'Emergency signal and location broadcasted locally.');
    set({ sosActive: true, sosCount: count });

    // Send real SMS to trusted contacts
    try {
      const contacts: string[] = JSON.parse(localStorage.getItem('safeher_contacts') || '[]');
      if (contacts.length > 0) {
        fetch('/api/sms/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts, location: get().location }),
        })
          .then(r => r.json())
          .then((result: { sent: string[]; failed: { to: string; error: string }[] }) => {
            if (result.sent?.length > 0) {
              get().addTimelineEvent('📱 SMS Sent', `Alert sent to: ${result.sent.join(', ')}`);
            }
            if (result.failed?.length > 0) {
              get().addTimelineEvent('⚠️ SMS Failed', `Failed: ${result.failed.map((f: { to: string; error: string }) => f.to).join(', ')}`);
            }
          })
          .catch(() => {
            get().addTimelineEvent('⚠️ SMS Error', 'Could not reach SMS server.');
          });
      }
    } catch (_e) { /* ignore */ }
  },

  stopSOS: () => {
    stopAlarm();
    if (navigator.vibrate) navigator.vibrate(0);
    set({ sosActive: false });
    get().addTimelineEvent('✅ SOS Deactivated', 'Emergency signal cancelled.');
  },

  toggleGuardian: () => set(state => {
    const isNowOn = !state.guardianOn;
    get().addTimelineEvent(isNowOn ? '👼 Guardian Mode ON' : '👼 Guardian Mode OFF', isNowOn ? 'AI continuous monitoring activated' : 'AI monitoring disabled');
    return { guardianOn: isNowOn };
  }),

  addTimelineEvent: (title, desc) => set(state => {
    const newEvent = { time: new Date().toISOString(), title, desc };
    const newTimeline = [newEvent, ...state.timeline].slice(0, 50);
    localStorage.setItem('safeher_timeline', JSON.stringify(newTimeline));
    return { timeline: newTimeline };
  }),

  triggerCountdown: (type) => set({ countdownActive: true, countdownType: type, countdownValue: 5 }),
  cancelCountdown: () => set({ countdownActive: false }),
  tickCountdown: () => set(state => {
    if (state.countdownValue <= 1) {
      setTimeout(() => get().activateSOS(), 0);
      return { countdownActive: false, countdownValue: 0 };
    }
    return { countdownValue: state.countdownValue - 1 };
  }),

  triggerFakeCall: () => {
    set({ fakeCallActive: true });
    get().addTimelineEvent('📞 Fake Call Triggered', 'Simulated incoming police call');
  },
  endFakeCall: () => set({ fakeCallActive: false }),

  showPopup: (details) => set({ popupActive: true, popupDetails: details }),
  dismissPopup: () => {
    set({ popupActive: false });
    get().addTimelineEvent('⚠️ Alert Dismissed', 'User dismissed AI emergency detection');
  },

  updateLocation: () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          set({ location: loc, locationStatus: 'Secured' });
          localStorage.setItem('safeher_location', JSON.stringify(loc));
        },
        (err) => {
          console.warn("Location error:", err);
          set({ locationStatus: 'Failed' });
        }
      );
    } else {
      set({ locationStatus: 'Unsupported' });
    }
  },

  clearData: () => {
    ['safeher_emergency', 'safeher_sos_count', 'safeher_voice_triggers', 'safeher_location', 'safeher_timeline'].forEach(k => localStorage.removeItem(k));
    set({ timeline: [], sosCount: 0, location: null });
  },

  loadData: () => {
    // refresh from localstorage
    set({
      timeline: JSON.parse(localStorage.getItem('safeher_timeline') || '[]'),
      sosCount: parseInt(localStorage.getItem('safeher_sos_count') || '0')
    });
  },

  initApp: () => {
    window.addEventListener('online', () => get().setOnline(true));
    window.addEventListener('offline', () => get().setOnline(false));
    get().updateLocation();
    setInterval(() => get().updateLocation(), 60000);
  }
}));