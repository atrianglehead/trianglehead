'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from './data';

const BOOK_BTN = {
  fontFamily: 'var(--font-space-mono), monospace',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#111',
  textDecoration: 'none',
  border: '2px solid #111',
  padding: '8px 14px',
  display: 'inline-block',
  background: '#F5C842',
  boxShadow: '3px 3px 0 #111',
};

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
      <div style={{ background: '#E8473F', padding: '28px', borderBottom: '3px solid #111' }}>
        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 28, letterSpacing: 2, color: '#fff', lineHeight: 1.05, marginBottom: 20 }}>
          What is a typical lesson like?
        </div>
        <div style={{ background: '#EEE8D0', border: '2px solid #111' }}>
          {[
            { label: 'Collaborative', text: 'A lesson is collaborative. I understand you while you understand the subject.' },
            { label: 'Online', text: 'All lessons are online. Join in from anywhere in the world.' },
            { label: 'Customisable', text: 'A typical lesson lasts for 1 hour, but the duration and frequency can be adjusted to your requirements.' },
          ].map(({ label, text }, i, arr) => (
            <div key={label} style={{ padding: '16px 22px', borderBottom: i < arr.length - 1 ? '1.5px solid rgba(0,0,0,0.12)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 18, letterSpacing: 2, color: '#E8473F', marginBottom: 4 }}>
                {label}
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#333', lineHeight: 1.7, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

    <div style={{ padding: '40px 28px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 32, letterSpacing: 2, color: '#111', lineHeight: 1.05 }}>
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
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                background: active ? '#E8473F' : '#fff',
                color: active ? '#EEE8D0' : '#111',
                border: '2px solid #111',
                padding: '8px 14px',
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
              fontFamily: 'var(--font-space-mono), monospace',
              fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              background: !type ? '#111' : '#F5F2EB',
              color: !type ? '#EEE8D0' : '#111',
              border: '2px solid #111',
              padding: '6px 12px',
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
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                background: type === sub.id ? '#111' : '#F5F2EB',
                color: type === sub.id ? '#EEE8D0' : '#111',
                border: '2px solid #111',
                padding: '6px 12px',
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
            <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 18, letterSpacing: 2, color: '#111', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              {cat.title}
              <span style={{ flex: 1, height: 2, background: '#CCC8BC', display: 'block' }} />
            </div>
          )}
          <div className="subcategory-grid">
            {subs.map(sub => (
              <div key={`${cat.id}-${sub.id}`} style={{ border: '2px solid #111', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Red card header */}
                <div style={{ background: '#E8473F', padding: '14px 18px', borderBottom: '2px solid #111' }}>
                  <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(238,232,208,0.7)', marginBottom: 8 }}>
                    {cat.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 22, letterSpacing: 1, color: '#fff', lineHeight: 1.1 }}>
                      {sub.title}
                    </div>
                    <div style={{ background: '#EEE8D0', border: '1.5px solid #111', padding: '4px 9px', flexShrink: 0, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, fontWeight: 700, letterSpacing: 0.5, color: '#111', whiteSpace: 'nowrap' }}>2150 INR</div>
                      <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 7, fontWeight: 700, letterSpacing: 0.5, color: '#555', whiteSpace: 'nowrap' }}>/ HOUR</div>
                    </div>
                  </div>
                </div>
                {/* Card body */}
                <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#444', lineHeight: 1.6, margin: '0 0 14px', flex: 1 }}>
                    {sub.desc}
                  </p>
                  {cat.id === 'voice' && cat.styles && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                      {cat.styles.map(s => (
                        <span key={s} style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', background: '#F5F2EB', border: '1.5px solid #CCC8BC', padding: '3px 7px', color: '#888' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <a href={`/contact?category=${cat.id}&type=${sub.id}`} className="btn" style={BOOK_BTN}>
                    Book a session →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottom CTA */}
      <div style={{ marginTop: 16, paddingTop: 28, borderTop: '2px solid #CCC8BC' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#555', lineHeight: 1.75, margin: '0 0 16px', fontStyle: 'italic' }}>
          Reach out with any questions — you don't need to be ready, just curious.
        </p>
        <a href="/contact" className="btn" style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#111', textDecoration: 'none', border: '2px solid #111', padding: '10px 18px', display: 'inline-block', background: '#F5C842' }}>
          Get in touch →
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
