'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

const LESSON_OPTIONS = [
  { value: '', label: 'Select a lesson type' },
  { value: 'voice', label: 'Free Your Voice (singing & voice)' },
  { value: 'instrument', label: 'Connect With Your Instrument (guitar / cello / flute)' },
  { value: 'musicianship', label: 'Understand Music (theory, ear training, improvisation)' },
  { value: 'rhythm', label: 'Rhythm & percussion' },
  { value: 'general', label: 'General enquiry' },
];

const INPUT_STYLE = {
  fontFamily: 'var(--font-space-mono), monospace',
  fontSize: 12,
  padding: '10px 14px',
  border: '2px solid #CCC8BC',
  background: '#fff',
  color: '#111',
  outline: 'none',
  width: '100%',
  letterSpacing: 0.5,
};

const LABEL_STYLE = {
  fontFamily: 'var(--font-space-mono), monospace',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: 6,
  display: 'block',
};

function ContactPageInner() {
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get('lesson') || '';
  const [status, setStatus] = useState('idle');
  const [lesson, setLesson] = useState(lessonParam);

  useEffect(() => {
    if (lessonParam) setLesson(lessonParam);
  }, [lessonParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const data = new FormData(e.target);
    try {
      const res = await fetch('https://formspree.io/f/xrerdoll', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) { setStatus('success'); e.target.reset(); setLesson(''); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <div style={{ padding: '40px 32px', maxWidth: 560 }}>

      {/* Page title */}
      <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 48, letterSpacing: 2, color: '#111', lineHeight: 1, marginBottom: 32 }}>
        Get in touch
      </div>

      {/* Contact info cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>

        <div style={{ border: '2px solid #111', padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#E8473F', marginBottom: 6 }}>Email</div>
          <a href="mailto:anirudh@trianglehead.in" style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#111', textDecoration: 'none', borderBottom: '1.5px solid #111', paddingBottom: 1 }}>
            anirudh@trianglehead.in
          </a>
        </div>

        <div style={{ border: '2px solid #111', padding: '16px 20px', background: '#fff' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#E8473F', marginBottom: 6 }}>Instagram</div>
          <a href="https://www.instagram.com/a.trianglehead/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#111', textDecoration: 'none', borderBottom: '1.5px solid #111', paddingBottom: 1 }}>
            @a.trianglehead
          </a>
        </div>


      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <span style={{ flex: 1, height: 2, background: '#111', display: 'block' }} />
        <span style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#888', whiteSpace: 'nowrap' }}>
          Or send a message
        </span>
        <span style={{ flex: 1, height: 2, background: '#111', display: 'block' }} />
      </div>

      {/* Form */}
      {status === 'success' ? (
        <div style={{ border: '2px solid #111', padding: '32px 24px', background: '#fff', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 32, letterSpacing: 2, color: '#111', marginBottom: 10 }}>
            Message sent!
          </div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#555', lineHeight: 1.7, fontStyle: 'italic' }}>
            Thanks for reaching out. I&apos;ll be in touch soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Honeypot */}
          <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div>
            <label style={LABEL_STYLE} htmlFor="name">Name *</label>
            <input id="name" name="name" type="text" required placeholder="Your name" style={INPUT_STYLE} />
          </div>

          <div>
            <label style={LABEL_STYLE} htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" required placeholder="your@email.com" style={INPUT_STYLE} />
          </div>

          <div>
            <label style={LABEL_STYLE} htmlFor="phone">
              Phone <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input id="phone" name="phone" type="tel" placeholder="+91 00000 00000" style={INPUT_STYLE} />
          </div>

          <div>
            <label style={LABEL_STYLE} htmlFor="lesson">Lesson type *</label>
            <select
              id="lesson" name="lesson" required
              value={lesson}
              onChange={e => setLesson(e.target.value)}
              style={{
                ...INPUT_STYLE,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23111' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: 36,
              }}
            >
              {LESSON_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={LABEL_STYLE} htmlFor="message">Message *</label>
            <textarea
              id="message" name="message" required rows={5}
              placeholder="Tell me about yourself and when you're generally available."
              style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {status === 'error' && (
            <p style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, color: '#E8473F' }}>
              Something went wrong. Please try again or email me at anirudh@trianglehead.in
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn"
            style={{
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase',
              background: status === 'submitting' ? '#CCC8BC' : '#F5C842',
              color: '#111',
              border: '2px solid #111',
              padding: '12px 24px',
              cursor: status === 'submitting' ? 'default' : 'pointer',
              width: 'fit-content',
              alignSelf: 'flex-start',
              boxShadow: status === 'submitting' ? 'none' : '3px 3px 0 #111',
            }}
          >
            {status === 'submitting' ? 'Sending...' : 'Send message →'}
          </button>

        </form>
      )}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px 32px' }} />}>
      <ContactPageInner />
    </Suspense>
  );
}