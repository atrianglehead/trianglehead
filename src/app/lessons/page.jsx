'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Arrow from '../components/Arrow';
import { CATEGORIES } from './data';
import { colors, fonts, styles } from '../styles';
import VoiceDesc from '@/content/lessons/voice.mdx';
import InstrumentDesc from '@/content/lessons/instrument.mdx';
import RhythmDesc from '@/content/lessons/rhythm.mdx';
import PoetryDesc from '@/content/lessons/poetry.mdx';
import MusicDesc from '@/content/lessons/music.mdx';

const DESCS = {
  voice: VoiceDesc,
  instrument: InstrumentDesc,
  rhythm: RhythmDesc,
  poetry: PoetryDesc,
  music: MusicDesc,
};

function LessonsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = searchParams.get('category') || CATEGORIES[0].id;
  const currentCat = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);

  useEffect(() => {
    setSelectedTypes([]);
    setSelectedStyles([]);
  }, [categoryId]);

  const setCategory = (catId) => {
    router.replace(`/lessons?category=${catId}`, { scroll: false });
  };

  const toggleType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(id => id !== typeId) : [...prev, typeId]
    );
  };

  const toggleStyle = (style) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const bookingHref = `/contact?category=${currentCat.id}` +
    (selectedTypes.length > 0 ? `&types=${selectedTypes.join(',')}` : '') +
    (selectedStyles.length > 0 ? `&styles=${selectedStyles.join(',')}` : '') +
    '#message';


  return (
    <>
      <style>{`
        .lesson-chip:hover { background: ${colors.black} !important; color: ${colors.cream} !important; }
        .lesson-cat-tab:not(.active):hover { background: ${colors.black} !important; color: ${colors.cream} !important; }
      `}</style>

      <div style={{ padding: '40px 28px' }}>

        {/* Header */}
        <div style={{ fontFamily: fonts.display, fontSize: 32, letterSpacing: 2, color: colors.black, lineHeight: 1.05, marginBottom: 24 }}>
          What would you like to learn?
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 36 }}>
          {CATEGORIES.map(cat => {
            const active = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`lesson-cat-tab${active ? ' active' : ''}`}
                style={{
                  ...styles.btn,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  background: active ? colors.red : colors.yellow,
                  color: active ? colors.cream : colors.black,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {cat.filterTitle}
              </button>
            );
          })}
        </div>

        {/* Category content */}
        <div style={{ maxWidth: 620 }}>

          <div style={{ borderLeft: `3px solid ${colors.red}`, paddingLeft: 18, marginBottom: 32 }}>
            {(() => { const Desc = DESCS[currentCat.id]; return Desc ? <Desc components={{ p: ({ children }) => <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#444', lineHeight: 1.75, margin: '0 0 10px' }}>{children}</p> }} /> : null; })()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ ...styles.label, fontSize: 12 }}>Areas covered</div>
            <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.dimText, letterSpacing: 0.5 }}>· tap to select (optional)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {currentCat.subcategories.map(sub => {
              const selected = selectedTypes.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => toggleType(sub.id)}
                  className="lesson-chip"
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 14,
                    color: selected ? colors.cream : colors.black,
                    border: `2px solid ${colors.black}`,
                    padding: '7px 14px',
                    background: selected ? colors.red : colors.white,
                    transition: 'background 0.15s, color 0.15s',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
                    {selected ? '✓' : '+'}
                  </span>
                  {sub.title}
                </button>
              );
            })}
          </div>

          {currentCat.styles && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ ...styles.label, fontSize: 12 }}>Styles</div>
                <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.dimText, letterSpacing: 0.5 }}>· tap to select (optional)</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
                {currentCat.styles.map(s => {
                  const selected = selectedStyles.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      className="lesson-chip"
                      style={{
                        fontFamily: fonts.serif,
                        fontSize: 14,
                        color: selected ? colors.cream : colors.black,
                        border: `2px solid ${colors.black}`,
                        padding: '7px 14px',
                        background: selected ? colors.red : colors.white,
                        transition: 'background 0.15s, color 0.15s',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
                        {selected ? '✓' : '+'}
                      </span>
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}

        </div>

      </div>

      {/* What is a typical lesson like */}
      <div style={{ background: colors.red, padding: '28px', borderTop: `3px solid ${colors.black}` }}>
        <div style={{ ...styles.sectionTitle, color: colors.white, marginBottom: 20 }}>
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

      {/* Bottom CTA */}
      <div style={{ padding: '28px', paddingBottom: 96, textAlign: 'center' }}>
        <p style={{ ...styles.bodyText, margin: '0 0 16px', fontStyle: 'italic' }}>
          Reach out with any questions. You don&apos;t need to be ready — just curious.
        </p>
        <a href="/contact" className="btn" style={{ ...styles.btn, padding: '10px 18px' }}>
          Get in touch<Arrow />
        </a>
      </div>

      {/* Sticky book button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: colors.cream,
        borderTop: `2px solid ${colors.black}`,
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        zIndex: 50,
      }}>
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 18, letterSpacing: 1, color: colors.black, lineHeight: 1 }}>
            {currentCat.title}
          </div>
          {(selectedTypes.length > 0 || selectedStyles.length > 0) && (
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.dimText, letterSpacing: 0.5, marginTop: 3 }}>
              {[
                ...selectedTypes.map(id => currentCat.subcategories.find(s => s.id === id)?.title ?? id),
                ...selectedStyles,
              ].join(' · ')}
            </div>
          )}
        </div>
        <a href={bookingHref} className="btn" style={{ ...styles.btn, ...styles.btnShadow, flexShrink: 0 }}>
          Book a session<Arrow />
        </a>
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
