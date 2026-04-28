"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRef } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/bio" },
  { label: "Music", href: "https://www.youtube.com/@trianglehead" },
  { label: "Explorations", href: "/explorations" },
  { label: "Articles", href: "https://soundinsight.substack.com/" },
  { label: "Lessons", href: "/lessons" },
  { label: "Contact", href: "/contact" },
];

export default function StickyNav() {
  const pathname = usePathname();
  const mobileMenuRef = useRef(null);

  function closeMobileMenu() {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  }

  function isActive(href) {
    if (href.startsWith("http")) return false;
    return pathname === href;
  }

  function linkStyle(href) {
    const active = isActive(href);
    return {
      fontFamily: "var(--font-space-mono), monospace",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: "#111",
      textDecoration: "none",
      paddingBottom: 2,
      borderBottom: active ? "2px solid #111" : "2px solid transparent",
      transition: "border-color 0.15s",
    };
  }

  function renderLinks() {
    return navItems.map((item) => {
      const isExternal = item.href.startsWith("http");
      return (
        <a
          key={item.label}
          href={item.href}
          className="sticky-nav-link"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={closeMobileMenu}
          style={linkStyle(item.href)}
        >
          {item.label}
        </a>
      );
    });
  }

  return (
    <>
      <style>{`
        .sticky-nav-link:hover { border-bottom-color: #111 !important; }
        .mobile-nav-menu { display: none; }
        .mobile-nav-summary::-webkit-details-marker { display: none; }
        .mobile-nav-summary::marker { content: ""; }
        .sticky-nav-links { display: flex; gap: 24px; align-items: center; }
        @media (max-width: 620px) {
          .sticky-nav-shell {
            flex-wrap: wrap;
            gap: 10px;
            padding: 12px 16px !important;
            align-items: center !important;
          }
          .sticky-nav-links { display: none !important; }
          .mobile-nav-menu {
            display: block !important;
            margin-left: auto;
          }
          .mobile-nav-menu[open] {
            display: block !important;
          }
          .mobile-nav-menu[open] .mobile-nav-panel {
            display: flex !important;
          }
          .mobile-nav-panel {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            align-items: flex-end;
            gap: 14px;
            box-sizing: border-box;
            padding: 14px 16px;
            background: #F5C842;
            border-bottom: 2px solid #111;
            border-top: 2px solid #111;
            z-index: 60;
          }
        }
      `}</style>
      <div
        className="sticky-nav-shell"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#F5C842",
          borderBottom: "2px solid #111",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 24px",
        }}
      >
        {/* Logo */}
        <Link href="/" onClick={closeMobileMenu} style={{ textDecoration: "none", lineHeight: 1 }}>
          <span style={{ fontFamily: "var(--font-bebas-neue), sans-serif", fontSize: 26, letterSpacing: 2, lineHeight: 1 }}>
            <span style={{ color: "#111" }}>TRI</span>
            <span style={{ color: "#E8473F" }}>ANGLE</span>
            <span style={{ color: "#111" }}>HEAD</span>
          </span>
        </Link>

        <nav className="sticky-nav-links">
          {renderLinks()}
        </nav>

        <details ref={mobileMenuRef} className="mobile-nav-menu">
          <summary
            className="mobile-nav-summary"
            aria-label="Open menu"
            style={{
              cursor: "pointer",
              padding: 4,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              listStyle: "none",
            }}
          >
            <span style={{ display: "block", width: 22, height: 2, background: "#111" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#111" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#111" }} />
          </summary>
          <nav className="mobile-nav-panel">
            {renderLinks()}
          </nav>
        </details>
      </div>
    </>
  );
}
