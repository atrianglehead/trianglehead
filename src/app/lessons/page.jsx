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
    <div style={{ padding: '40px 28px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        
        <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 40, letterSpacing: 2, color: '#111', lineHeight: 1.05, marginBottom: 10 }}>
          What would you like to learn today?
        </div>
        <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#E8473F', marginBottom: 10 }}>
          A lesson is collaborative: I understand you while you understand the subject.
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#555', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>
          
        </p>
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
              <div key={`${cat.id}-${sub.id}`} style={{ border: '2px solid #111', background: '#fff', padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#E8473F', marginBottom: 6 }}>
                  {cat.title}
                </div>
                <div style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 20, letterSpacing: 1, color: '#111', lineHeight: 1.1, marginBottom: 8 }}>
                  {sub.title}
                </div>
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
            ))}
          </div>
        </div>
      ))}

      {/* Bottom CTA */}
      <div style={{ marginTop: 16, paddingTop: 28, borderTop: '2px solid #CCC8BC' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#555', lineHeight: 1.75, margin: '0 0 16px', fontStyle: 'italic' }}>
          All lessons happen online from the comfort of your home. Feel free to reach out with any questions — you don't need to be ready, just curious.
        </p>
        <a href="/contact" className="btn" style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#111', textDecoration: 'none', border: '2px solid #111', padding: '10px 18px', display: 'inline-block', background: '#F5C842' }}>
          Get in touch →
        </a>
      </div>

    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px 28px' }} />}>
      <LessonsPageInner />
    </Suspense>
  );
}
