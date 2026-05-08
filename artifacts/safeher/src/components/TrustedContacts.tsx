import { useState } from 'react';
import { useEmergencyStore } from '@/hooks/useEmergencyStore';

const STORAGE_KEY = 'safeher_contacts';

function loadContacts(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export default function TrustedContacts() {
  const { addTimelineEvent } = useEmergencyStore();
  const [contacts, setContacts] = useState<string[]>(loadContacts);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const save = (list: string[]) => {
    setContacts(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const add = () => {
    const num = input.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(num)) {
      setError('Use E.164 format, e.g. +14155552671');
      return;
    }
    if (contacts.includes(num)) { setError('Already added.'); return; }
    if (contacts.length >= 5) { setError('Max 5 contacts.'); return; }
    const next = [...contacts, num];
    save(next);
    setInput('');
    setError('');
    addTimelineEvent('👤 Contact Added', `${num} added as emergency contact`);
  };

  const remove = (num: string) => {
    save(contacts.filter(c => c !== num));
    addTimelineEvent('👤 Contact Removed', `${num} removed`);
  };

  return (
    <section id="contacts" style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
      <h2 className="section-title fade-in" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        👥 Trusted Emergency Contacts
      </h2>
      <p className="fade-in" style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Add up to 5 phone numbers. They'll receive a real SMS with your location when SOS fires.
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '1.5rem'
      }}>
        {/* Input row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input
            data-testid="input-contact-number"
            type="tel"
            placeholder="+14155552671"
            value={input}
            onChange={e => { setInput(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && add()}
            style={{
              flex: 1, minWidth: 200, padding: '0.75rem 1rem', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)', color: '#f8fafc',
              fontSize: '1rem', outline: 'none'
            }}
          />
          <button
            data-testid="button-add-contact"
            onClick={add}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
            }}
          >
            ➕ Add
          </button>
        </div>

        {error && (
          <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</div>
        )}

        {contacts.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem' }}>
            No contacts yet. Add a phone number above.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {contacts.map(num => (
              <li key={num} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', borderRadius: 12,
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)'
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem' }}>📱 {num}</span>
                <button
                  data-testid={`button-remove-contact-${num}`}
                  onClick={() => remove(num)}
                  style={{
                    background: 'none', border: 'none', color: '#f87171',
                    cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.25rem'
                  }}
                  title="Remove"
                >✕</button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
          Phone numbers are stored locally on your device only.
          They are sent to our server only at the moment SOS is activated.
        </div>
      </div>
    </section>
  );
}
