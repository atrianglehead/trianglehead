"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/bio" },
  { label: "Articles", href: "https://soundinsight.substack.com/" },
  { label: "Music", href: "https://www.youtube.com/@trianglehead" },
  { label: "Lessons", href: "https://www.superprof.co.in/learn-from-professional-musician-how-sing-with-your-free-natural-voice.html" },
  { label: "Contact", href: "/contact" },
];

export default function StickyNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <>
      <style>{`
        .sticky-nav-link:hover { border-bottom-color: #111 !important; }
        .hamburger-btn { display: none; }
        .sticky-nav-links { display: flex; gap: 24px; align-items: center; }
        @media (max-width: 620px) {
          .hamburger-btn { display: flex !important; }
          .sticky-nav-links { display: none !important; }
          .sticky-nav-links.open {
            display: flex !important;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            padding: 14px 16px;
            background: #F5C842;
            border-top: 2px solid #111;
            position: absolute;
            top: 100%;
            right: 0;
            left: 0;
            z-index: 100;
          }
        }
      `}</style>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#F5C842",
          borderBottom: "2px solid #111",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "8px 24px",
        }}
      >
        {/* Desktop links */}
        <nav className={`sticky-nav-links${open ? " open" : ""}`}>
          {navItems.map((item) => {
            const isExternal = item.href.startsWith("http");
            return (
              <a
                key={item.label}
                href={item.href}
                className="sticky-nav-link"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                style={linkStyle(item.href)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Hamburger button (mobile only) */}
        <button
          className="hamburger-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            display: "none",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {open ? (
            <span style={{ fontSize: 18, fontWeight: 700, color: "#111", lineHeight: 1 }}>✕</span>
          ) : (
            <>
              <span style={{ display: "block", width: 22, height: 2, background: "#111" }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#111" }} />
              <span style={{ display: "block", width: 22, height: 2, background: "#111" }} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
