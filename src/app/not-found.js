'use client';

import Link from 'next/link';
import { colors, fonts, styles } from './styles';

export default function NotFound() {
  return (
    <div style={{ padding: '60px 32px', textAlign: 'center' }}>
      <div style={{ ...styles.pageTitle, fontSize: 64, marginBottom: 24, color: colors.red }}>
        404
      </div>
      
      <p style={{ fontFamily: fonts.serif, fontSize: 16, marginBottom: 40, color: colors.black }}>
        Oops, that page doesn&apos;t exist.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link 
          href="/" 
          style={{ 
            ...styles.btn,
            background: colors.red,
            color: colors.cream,
          }}
        >
          Back to home
        </Link>
        
        <Link 
          href="/lessons" 
          style={{ 
            ...styles.btn,
            background: colors.yellow,
          }}
        >
          Browse lessons
        </Link>

        <Link 
          href="/contact" 
          style={{ 
            ...styles.btn,
            background: colors.black,
            color: colors.cream,
          }}
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
