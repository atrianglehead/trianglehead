import Link from 'next/link';
import { colors, fonts, styles } from '../styles';
import posts from '../../content/posts-index.json';

const MEDIA_BASE = 'https://media.trianglehead.in';

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const metadata = {
  title: 'Sound Insight — Trianglehead',
  description: 'Weekly articles on musical concepts by Anirudh Venkatesh.',
};

export default function PublicationPage() {
  const sorted = [...posts].reverse();

  return (
    <div>
      {/* Header */}
      <div style={{ background: colors.black, padding: '28px 24px 24px', borderBottom: `3px solid ${colors.black}` }}>
        <div style={{ fontFamily: fonts.display, fontSize: 11, letterSpacing: 3, color: colors.dimText, marginBottom: 6 }}>
          PUBLICATION
        </div>
        <div style={{ ...styles.pageTitle, color: colors.cream, fontSize: 42 }}>
          Sound Insight
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 14, letterSpacing: 2, color: '#666', marginTop: 4 }}>
          The Music Guide
        </div>
      </div>

      {/* Post list */}
      <div style={{ background: colors.bg }}>
        {sorted.map((post, i) => {
          const coverUrl = post.cover ? `${MEDIA_BASE}/${post.slug}/${post.cover}` : null;
          return (
            <Link
              key={post.slug}
              href={`/publication/${post.slug}`}
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                padding: '16px 24px',
                borderBottom: `1.5px solid ${colors.divider}`,
                textDecoration: 'none',
                background: i % 2 === 0 ? colors.bg : colors.panel,
              }}
            >
              {/* Cover thumbnail */}
              <div style={{ flexShrink: 0, width: 56, height: 56, background: colors.panel, border: `1.5px solid ${colors.divider}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {coverUrl
                  ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: fonts.display, fontSize: 22, color: colors.divider }}>♪</span>
                }
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: 1, color: colors.black, lineHeight: 1.2 }}>
                  {post.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ ...styles.label, fontSize: 8 }}>{formatDate(post.date)}</span>
                  {post.tags && post.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{ fontFamily: fonts.mono, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: colors.dimText }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
