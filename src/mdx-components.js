import PostAudio from './app/components/PostAudio';

export function useMDXComponents(components) {
  return {
    Audio: ({ src }) => <PostAudio src={src} />,

    h1: ({ children }) => (
      <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 44, letterSpacing: 2, color: '#111', lineHeight: 1, margin: '0 0 24px' }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 30, letterSpacing: 2, color: '#111', lineHeight: 1.1, margin: '2.5em 0 0.6em' }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#E8473F', margin: '2.5em 0 0.6em' }}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 26, letterSpacing: 2, color: '#E8473F', lineHeight: 1.1, margin: '2.5em 0 0.5em' }}>
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#3a3a3a', lineHeight: 1.85, margin: '0 0 1.4em' }}>
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a href={href} style={{ color: '#E8473F', textDecoration: 'none', borderBottom: '1.5px solid #E8473F', paddingBottom: 1 }}>
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ fontFamily: 'var(--font-space-mono), monospace', fontStyle: 'normal', fontSize: 10, letterSpacing: 1, color: '#888', display: 'block', textAlign: 'center', margin: '-0.8em 0 1.4em' }}>
        {children}
      </em>
    ),
    img: ({ src, alt }) => (
      <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '2em auto 0.5em', border: '2px solid #CCC8BC' }} />
    ),
    ul: ({ children }) => (
      <ul style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#3a3a3a', lineHeight: 1.85, paddingLeft: 24, margin: '0 0 1.4em' }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#3a3a3a', lineHeight: 1.85, paddingLeft: 24, margin: '0 0 1.4em' }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: 8 }}>{children}</li>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: '2px solid #F5C842', margin: '3em 0' }} />
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: '4px solid #F5C842', paddingLeft: 20, margin: '2em 0', color: '#555', fontStyle: 'italic' }}>
        {children}
      </blockquote>
    ),
    ...components,
  };
}
