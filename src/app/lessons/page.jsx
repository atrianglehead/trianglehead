'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Arrow from '../components/Arrow';
import { CATEGORIES } from './data';
import { colors, fonts, styles } from '../styles';

function LessonsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('category') || 'all';
  const type = searchParams.get('type') || '';

  const currentCat = category === 'all' ? null : CATEGORIES.find(c => c.id === category);

  const setCategory = (catId) => {
    if (catId === 'all') {
      router.replace('/lessons', { scroll: false });
    } else {
      router.replace(`/lessons?category=${catId}`, { scroll: false });
    }
  };

  const setType = (typeId) => {
    const next = type === typeId ? '' : typeId;
    if (next) {
      router.replace(`/lessons?category=${category}&type=${next}`, { scroll: false });
    } else {
      router.replace(`/lessons?category=${category}`, { scroll: false });
    }
  };

  const groups = category === 'all'
    ? CATEGORIES.map(cat => ({ cat, subs: cat.subcategories }))
    : currentCat
      ? [{ cat: currentCat, subs: type ? currentCat.subcategories.filter(s => s.id === type) : currentCat.subcategories }]
      : [];

  return (
    <>
      {/* Red top section */}
      <div style={{ background: colors.red, padding: '28px', borderBottom: `3px solid ${colors.black}` }}>
        <div style={{ ...styles.sectionTitle, color: '#fff', marginBottom: 20 }}>
          What is a typical lesson like?
        </div>
        <div style={{ background: colors.cream, border: `2px solid ${colors.black}` }}>
          {[
            { label: 'Collaborative', text: 'A lesson is collaborative. I understand you while you understand the subject.' },
            { label: 'Customisable', text: 'The duration, frequency and roadmap of lessons can be adjusted to your requirements.' },
            { label: 'Online', text: 'All lessons are online. Join in from anywhere in the world.' },
          ].map(({ label, text }, i, arr) => (
            <details key={label} style={{ borderBottom: i < arr.length - 1 ? '1.5px solid rgba(0,0,0,0.12)' : 'none' }}>
              <summary
                className="lesson-summary"
                style={{
                  fontFamily: fonts.display,
                  fontSize: 18,
                  letterSpacing: 2,
                  color: colors.red,
                  padding: '12px 22px',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                {label}
                <span style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, letterSpacing: 0, color: colors.black }}>+</span>
              </summary>
              <p style={{ ...styles.bodyText, color: '#333', margin: 0, padding: '0 22px 16px' }}>{text}</p>
            </details>
          ))}
        </div>
      </div>

    <div style={{ padding: '40px 28px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 32, letterSpacing: 2, color: colors.black, lineHeight: 1.05 }}>
          What would you like to learn today?
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {[{ id: 'all', title: 'All' }, ...CATEGORIES].map(cat => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                ...styles.btn,
                fontSize: 10,
                letterSpacing: 1.5,
                background: active ? colors.red : '#fff',
                color: active ? colors.cream : colors.black,
                cursor: 'pointer',
              }}
            >
              {cat.title}
            </button>
          );
        })}
      </div>

      {/* Subcategory pills */}
      {currentCat && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          <button
            onClick={() => router.replace(`/lessons?category=${category}`, { scroll: false })}
            style={{
              ...styles.btn,
              fontSize: 10,
              letterSpacing: 1,
              padding: '6px 12px',
              background: !type ? colors.black : colors.bg,
              color: !type ? colors.cream : colors.black,
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {currentCat.subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setType(sub.id)}
              style={{
                ...styles.btn,
                fontSize: 10,
                letterSpacing: 1,
                padding: '6px 12px',
                background: type === sub.id ? colors.black : colors.bg,
                color: type === sub.id ? colors.cream : colors.black,
                cursor: 'pointer',
              }}
            >
              {sub.title}
            </button>
          ))}
        </div>
      )}

      {/* Card groups */}
      {groups.map(({ cat, subs }) => (
        <div key={cat.id} style={{ marginBottom: 36 }}>
          {category === 'all' && (
            <div style={{ fontFamily: fonts.display, fontSize: 18, letterSpacing: 2, color: colors.black, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              {cat.title}
              <span style={{ flex: 1, height: 2, background: colors.divider, display: 'block' }} />
            </div>
          )}
          <div className="subcategory-grid">
            {subs.map(sub => (
              <div key={`${cat.id}-${sub.id}`} style={{ ...styles.card, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Red card header */}
                <div style={{ background: colors.red, padding: '14px 18px', borderBottom: `2px solid ${colors.black}` }}>
                  <div style={{ ...styles.label, fontSize: 8, letterSpacing: 2, color: 'rgba(238,232,208,0.7)', marginBottom: 8 }}>
                    {cat.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ ...styles.cardTitle, color: '#fff' }}>
                      {sub.title}
                    </div>
                    <div style={{ background: colors.cream, border: `1.5px solid ${colors.black}`, padding: '7px 11px', flexShrink: 0, textAlign: 'center' }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: colors.black, whiteSpace: 'nowrap' }}>2150 INR</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: colors.mutedText, whiteSpace: 'nowrap' }}>/ HOUR</div>
                    </div>
                  </div>
                </div>
                {/* Card body */}
                <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ ...styles.bodyText, margin: '0 0 14px', flex: 1 }}>
                    {sub.desc}
                  </p>
                  {cat.id === 'voice' && cat.styles && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                      {cat.styles.map(s => (
                        <span key={s} style={{ ...styles.label, fontSize: 8, letterSpacing: 1, background: colors.bg, border: `1.5px solid ${colors.divider}`, padding: '3px 7px', color: colors.dimText }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <a href={`/contact?category=${cat.id}&type=${sub.id}#message`} className="btn" style={{ ...styles.btn, padding: '9px 15px', fontSize: 10, ...styles.btnShadow }}>
                    Book a session<Arrow />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottom CTA */}
      <div style={{ marginTop: 16, paddingTop: 28, borderTop: `2px solid ${colors.divider}` }}>
        <p style={{ ...styles.bodyText, margin: '0 0 16px', fontStyle: 'italic' }}>
          Reach out with any questions. You don&apos;t need to be ready - just curious.
        </p>
        <a href="/contact" className="btn" style={{ ...styles.btn, padding: '10px 18px' }}>
          Get in touch<Arrow />
        </a>
      </div>

    </div>
    </>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px 28px' }} />}>
      <LessonsPageInner />
    </Suspense>
  );
}
