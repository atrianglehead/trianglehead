export const colors = {
  red: '#E8473F',
  yellow: '#F5C842',
  black: '#111',
  cream: '#EEE8D0',
  bg: '#F5F2EB',
  divider: '#CCC8BC',
  mutedText: '#555',
  dimText: '#888',
};

export const fonts = {
  display: 'var(--font-bebas-neue), sans-serif',
  mono: 'var(--font-space-mono), monospace',
  serif: 'Georgia, serif',
};

export const styles = {
  // Buttons
  btn: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    background: colors.yellow,
    color: colors.black,
    border: `2px solid ${colors.black}`,
    padding: '10px 18px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  btnShadow: {
    boxShadow: `3px 3px 0 ${colors.black}`,
  },

  // Typography
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 48,
    letterSpacing: 2,
    color: colors.black,
    lineHeight: 1,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: 3,
    lineHeight: 1.1,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 1,
    lineHeight: 1.1,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.dimText,
  },
  bodyText: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: '#444',
    lineHeight: 1.7,
  },
  readLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    whiteSpace: 'nowrap',
    fontSize: 9,
    fontWeight: 700,
    color: colors.red,
  },

  // Layout
  section: {
    borderBottom: `3px solid ${colors.black}`,
  },
  card: {
    border: `2px solid ${colors.black}`,
    background: '#fff',
  },
  dividerLine: {
    flex: 1,
    height: 2,
    background: colors.black,
    display: 'block',
  },

  // Forms
  formLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.dimText,
    marginBottom: 6,
    display: 'block',
  },
  formInput: {
    fontFamily: fonts.mono,
    fontSize: 14,
    padding: '10px 14px',
    border: `2px solid ${colors.divider}`,
    background: '#fff',
    color: colors.black,
    outline: 'none',
    width: '100%',
    letterSpacing: 0.5,
  },
};
