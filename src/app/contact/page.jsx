'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import { CATEGORIES } from '../lessons/data';
import { colors, fonts, styles } from '../styles';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  ...CATEGORIES.map(c => ({ value: c.id, label: c.title })),
  { value: 'general', label: 'General enquiry' },
];

const getSubcategoryOptions = (categoryId) => {
  if (!categoryId || categoryId === 'general') return [];
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return [];
  return [
    { value: '', label: 'All / not sure yet' },
    ...cat.subcategories.map(s => ({ value: s.id, label: s.title })),
  ];
};

const SELECT_STYLE = {
  ...styles.formInput,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23111' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
};

function ContactForm({ initialCategory, initialType }) {
  const nameInputRef = useRef(null);
  const [arrivedFromBooking, setArrivedFromBooking] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#message'
  );
  const [status, setStatus] = useState('idle');
  const [category, setCategory] = useState(initialCategory);
  const [type, setType] = useState(initialType);

  useEffect(() => {
    if (window.location.hash !== '#message') return;
    const focusTimer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 150);
    return () => window.clearTimeout(focusTimer);
  }, []);

  const subcategoryOptions = getSubcategoryOptions(category);
  const showSubcategory = category && category !== 'general';

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setType('');
  };

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
      if (res.ok) {
        setStatus('success');
        e.target.reset();
        setCategory('');
        setType('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="contact-page-shell">
      <div className="contact-panel" style={{ ...styles.card, textAlign: 'center' }}>

        {/* Page title */}
        <div style={{ ...styles.pageTitle, marginBottom: 32 }}>
          Get in touch
        </div>

        {/* Contact info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>

          <div style={{ border: `2px solid ${colors.black}`, background: colors.cream, padding: '16px 20px' }}>
            <div style={{ ...styles.label, letterSpacing: 2.5, color: colors.red, marginBottom: 6 }}>Email</div>
            <a href="mailto:anirudh@trianglehead.in" style={{ fontFamily: fonts.serif, fontSize: 15, color: colors.black, textDecoration: 'none', borderBottom: `1.5px solid ${colors.black}`, paddingBottom: 1 }}>
              anirudh@trianglehead.in
            </a>
          </div>

          <div style={{ border: `2px solid ${colors.black}`, background: colors.cream, padding: '16px 20px' }}>
            <div style={{ ...styles.label, letterSpacing: 2.5, color: colors.red, marginBottom: 6 }}>Instagram</div>
            <a href="https://www.instagram.com/a.trianglehead/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: fonts.serif, fontSize: 15, color: colors.black, textDecoration: 'none', borderBottom: `1.5px solid ${colors.black}`, paddingBottom: 1 }}>
              @a.trianglehead
            </a>
          </div>

        </div>

        <div id="message" style={{ scrollMarginTop: 96 }}>
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <span style={styles.dividerLine} />
            <span style={{ ...styles.label, whiteSpace: 'nowrap' }}>
              Book lesson / General Enquiry
            </span>
            <span style={styles.dividerLine} />
          </div>

          {/* Form */}
          {status === 'success' ? (
            <div style={{ border: `2px solid ${colors.black}`, background: colors.cream, padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ fontFamily: fonts.display, fontSize: 32, letterSpacing: 2, color: colors.black, marginBottom: 10 }}>
                Message sent!
              </div>
              <p style={{ ...styles.bodyText, fontStyle: 'italic' }}>
                Thanks for reaching out. I&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form
              className={`contact-form-box${arrivedFromBooking ? ' booking-focus' : ''}`}
              onSubmit={handleSubmit}
              style={{
                border: `2px solid ${colors.black}`,
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                textAlign: 'left',
              }}
            >

              {/* Honeypot */}
              <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <div>
                <label style={styles.formLabel} htmlFor="name">Name *</label>
                <input ref={nameInputRef} className={`contact-field${arrivedFromBooking ? ' contact-field-arrival' : ''}`} id="name" name="name" type="text" required placeholder="Your name" style={styles.formInput} onBlur={() => setArrivedFromBooking(false)} />
              </div>

              <div>
                <label style={styles.formLabel} htmlFor="email">Email *</label>
                <input className="contact-field" id="email" name="email" type="email" required placeholder="your@email.com" style={styles.formInput} />
              </div>

              <div>
                <label style={styles.formLabel} htmlFor="phone">
                  Phone <span style={{ opacity: 0.5 }}>(optional)</span>
                </label>
                <input className="contact-field" id="phone" name="phone" type="tel" placeholder="+91 00000 00000" style={styles.formInput} />
              </div>

              <div>
                <label style={styles.formLabel} htmlFor="category">I&apos;m interested in *</label>
                <select
                  id="category"
                  name="category"
                  required
                  value={category}
                  onChange={handleCategoryChange}
                  className="contact-field"
                  style={SELECT_STYLE}
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {showSubcategory && (
                <div key={category} className="subcategory-reveal">
                  <label style={styles.formLabel} htmlFor="specific_interest">
                    Specific interest <span style={{ opacity: 0.5 }}>(optional)</span>
                  </label>
                  <select
                    key={category}
                    id="specific_interest"
                    name="specific_interest"
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="contact-field"
                    style={SELECT_STYLE}
                  >
                    {subcategoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={styles.formLabel} htmlFor="message_text">Message *</label>
                <textarea
                  className="contact-field"
                  id="message_text" name="message" required rows={5}
                  placeholder="Tell me about yourself and when you're generally available."
                  style={{ ...styles.formInput, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              {status === 'error' && (
                <p style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.red, textAlign: 'center' }}>
                  Something went wrong. Please try again or email me at anirudh@trianglehead.in
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn"
                style={{
                  ...styles.btn,
                  fontSize: 11,
                  padding: '12px 24px',
                  background: status === 'submitting' ? colors.divider : colors.yellow,
                  cursor: status === 'submitting' ? 'default' : 'pointer',
                  width: 'fit-content',
                  alignSelf: 'center',
                  boxShadow: status === 'submitting' ? 'none' : `5px 5px 0 ${colors.black}`,
                }}
              >
                {status === 'submitting' ? 'Sending...' : 'Send to Anirudh'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactPageInner() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const typeParam = searchParams.get('type') || '';

  return (
    <ContactForm
      key={`${categoryParam}:${typeParam}`}
      initialCategory={categoryParam}
      initialType={typeParam}
    />
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px 32px' }} />}>
      <ContactPageInner />
    </Suspense>
  );
}
