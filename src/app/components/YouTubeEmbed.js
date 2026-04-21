"use client";

import { useState } from "react";
import Image from "next/image";

export default function YouTubeEmbed({ videoId, title, thumbnail, overlay }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
      />
    );
  }

  return (
    <button
      onClick={() => setActive(true)}
      aria-label={`Play ${title}`}
      style={{ position: "relative", width: "100%", display: "block", padding: 0, border: "none", cursor: "pointer", background: "#000" }}
    >
      <Image
        src={thumbnail}
        alt={title}
        width={860}
        height={484}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {overlay}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "24px solid #fff", marginLeft: 5 }} />
        </div>
      </div>
    </button>
  );
}
