// Global MDX component overrides — typography styled to match the site.
export function useMDXComponents(components) {
  return {
    h1: ({ children }) => (
      <h1 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 42, letterSpacing: 2, color: '#111', lineHeight: 1.05, marginBottom: 8, marginTop: 0 }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontFamily: 'var(--font-bebas-neue), sans-serif', fontSize: 26, letterSpacing: 2, color: '#111', lineHeight: 1.1, marginBottom: 10, marginTop: 32 }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#E8473F', marginBottom: 8, marginTop: 28 }}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#444', lineHeight: 1.75, marginBottom: 18, marginTop: 0 }}>
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a href={href} style={{ color: '#E8473F', textDecoration: 'none', borderBottom: '1.5px solid #E8473F' }}>
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ fontStyle: 'italic' }}>{children}</em>
    ),
    ul: ({ children }) => (
      <ul style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#444', lineHeight: 1.75, paddingLeft: 20, marginBottom: 18 }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#444', lineHeight: 1.75, paddingLeft: 20, marginBottom: 18 }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ marginBottom: 6 }}>{children}</li>
    ),
    hr: () => (
      <hr style={{ border: 'none', borderTop: '1.5px solid #CCC8BC', margin: '32px 0' }} />
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: '3px solid #E8473F', paddingLeft: 16, margin: '24px 0', color: '#666' }}>
        {children}
      </blockquote>
    ),
    ...components,
  }
}
