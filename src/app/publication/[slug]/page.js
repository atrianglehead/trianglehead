import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { colors, fonts, styles } from '../../styles';
import posts from '../../../content/posts-index.json';

// Add slug here as each post is converted to MDX
const mdxPosts = {
  'naming-pitches': () => import('../../../content/posts/naming-pitches.mdx'),
};

const MEDIA_BASE = 'https://media.trianglehead.in';

function formatDate(dateStr) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getPostHtml(id, slug, audioFiles) {
  const filePath = path.join(process.cwd(), 'public', 'posts', `${id}.${slug}.html`);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/<div class="subscription-widget-wrap-editor"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  html = html.replace(/<div[^>]*subscription-widget[^>]*>[\s\S]*?<\/div>/g, '');
  let i = 0;
  html = html.replace(/<div class="native-audio-embed"[^>]*><\/div>/g, () => {
    if (!audioFiles || i >= audioFiles.length) return '';
    const src = `${MEDIA_BASE}/${slug}/${audioFiles[i++]}`;
    return `<audio controls style="width:100%;margin:1.5em 0;display:block"><source src="${src}" /></audio>`;
  });
  return html;
}

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — Sound Insight`,
    description: `Sound Insight article by Anirudh Venkatesh, published ${formatDate(post.date)}.`,
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = posts.find(p => p.slug === slug);
  if (!post) notFound();

  let PostContent = null;
  if (mdxPosts[slug]) {
    const mod = await mdxPosts[slug]();
    PostContent = mod.default;
  }

  const html = PostContent ? null : getPostHtml(post.id, post.slug, post.audio);
  const coverUrl = post.cover ? `${MEDIA_BASE}/${slug}/${post.cover}` : null;

  return (
    <div>
      {/* Header */}
      <div style={{ background: colors.cream, padding: '36px 28px 28px', borderBottom: `3px solid ${colors.black}` }}>
        <Link href="/publication" style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: colors.dimText,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 20,
        }}>
          ← Sound Insight
        </Link>

        <div style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: 3, color: colors.red, marginBottom: 10 }}>
          The Music Guide
        </div>

        <h1 style={{
          fontFamily: fonts.display,
          fontSize: 52,
          letterSpacing: 2,
          color: colors.black,
          lineHeight: 1,
          margin: '0 0 20px',
        }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.dimText }}>
            {formatDate(post.date)}
          </span>
          {post.tags && post.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: fonts.mono,
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: colors.black,
              background: colors.yellow,
              padding: '3px 8px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Cover image */}
      {coverUrl && (
        <div style={{ borderBottom: `3px solid ${colors.black}`, lineHeight: 0 }}>
          <img
            src={coverUrl}
            alt={post.title}
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Body */}
      <div style={{ background: colors.bg, padding: '52px 28px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }} className="post-body">
          {PostContent
            ? <PostContent />
            : <div dangerouslySetInnerHTML={{ __html: html }} />
          }
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: colors.cream,
        borderTop: `3px solid ${colors.black}`,
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/publication" style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: colors.dimText,
          textDecoration: 'none',
        }}>
          ← All articles
        </Link>
        <span style={{ fontFamily: fonts.display, fontSize: 13, letterSpacing: 3, color: colors.dimText }}>
          Sound Insight
        </span>
      </div>
    </div>
  );
}
