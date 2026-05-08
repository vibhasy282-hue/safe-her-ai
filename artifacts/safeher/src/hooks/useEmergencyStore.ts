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
  notification: string;
  setNotification: (msg: string) => void;
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
  notification: '',

  setNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => set({ notification: '' }), 5000);
  },

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
    const rawContacts = localStorage.getItem('safeher_contacts');
    console.log('[SafeHer SOS] Raw safeher_contacts from localStorage:', rawContacts);

    let contacts: string[] = [];
    try {
      contacts = JSON.parse(rawContacts || '[]');
    } catch (parseErr) {
      console.error('[SafeHer SOS] Failed to parse contacts:', parseErr);
    }

    console.log('[SafeHer SOS] Parsed contacts array:', contacts);
    console.log('[SafeHer SOS] Number of contacts:', contacts.length);

    if (contacts.length === 0) {
      console.warn('[SafeHer SOS] No contacts found — SMS will NOT be sent.');
      get().setNotification('⚠️ No emergency contacts! Scroll down to add contacts first.');
      get().addTimelineEvent('⚠️ No Contacts', 'Add trusted contacts so SMS alerts can be sent.');
    } else {
      const location = get().location;
      const requestBody = { contacts, location };
      console.log('[SafeHer SOS] Sending SMS to recipients:', contacts);
      console.log('[SafeHer SOS] Request body:', JSON.stringify(requestBody));
      console.log('[SafeHer SOS] Fetching: /api/sms/sos');

      get().setNotification(`📡 Sending SOS SMS to ${contacts.length} contact(s): ${contacts.join(', ')}`);

      fetch('/api/sms/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
        .then(r => {
          console.log('[SafeHer SOS] HTTP response status:', r.status);
          return r.json();
        })
        .then((result: { sent: string[]; failed: { to: string; error: string }[]; error?: string }) => {
          console.log('[SafeHer SOS] API response:', JSON.stringify(result));
          if (result.error) {
            console.error('[SafeHer SOS] Server error:', result.error);
            get().setNotification(`❌ Server error: ${result.error}`);
            get().addTimelineEvent('⚠️ SMS Error', result.error);
            return;
          }
          if (result.sent?.length > 0) {
            console.log('[SafeHer SOS] Successfully sent to:', result.sent);
            get().setNotification(`✅ SMS sent to: ${result.sent.join(', ')}`);
            get().addTimelineEvent('📱 SMS Sent', `Alert sent to: ${result.sent.join(', ')}`);
          }
          if (result.failed?.length > 0) {
            console.error('[SafeHer SOS] Failed to send to:', result.failed);
            const failDetails = result.failed.map((f: { to: string; error: string }) => `${f.to}: ${f.error}`).join(' | ');
            get().setNotification(`❌ SMS failed — ${result.failed.map((f: { to: string; error: string }) => f.to).join(', ')}`);
            get().addTimelineEvent('⚠️ SMS Failed', failDetails);
          }
        })
        .catch((fetchErr: unknown) => {
          console.error('[SafeHer SOS] Fetch error:', fetchErr);
          get().setNotification('❌ Could not reach SMS server. Check your connection.');
          get().addTimelineEvent('⚠️ SMS Error', `Fetch failed: ${String(fetchErr)}`);
        });
    }
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