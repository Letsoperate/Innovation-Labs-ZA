export default function CrownedAvatar({ rank, avatarUrl, name, initials }) {
  const size = 32;
  if (!rank || rank < 1 || rank > 3) {
    return (
      <span className="relative inline-flex">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full ring-1 ring-border ring-offset-1 ring-offset-background object-cover" />
        ) : (
          <span className="h-8 w-8 rounded-full ring-1 ring-border ring-offset-1 ring-offset-background bg-foreground text-background font-semibold flex items-center justify-center text-[10px]">{initials}</span>
        )}
      </span>
    );
  }

  const colors = {
    1: { ring: "#FFD700", sparkle: "#FFD700", badge: "#E8A800", crownFill: "#FFD700", crownStroke: "#E8A800" },
    2: { ring: "#C0C0C0", sparkle: "#C0C0C0", badge: "#A0A0A0", crownFill: "#C0C0C0", crownStroke: "#A0A0A0" },
    3: { ring: "#CD7F32", sparkle: "#CD7F32", badge: "#B8700A", crownFill: "#CD7F32", crownStroke: "#B8700A" },
  };
  const c = colors[rank];

  return (
    <span style={{ position: "relative", display: "inline-flex", width: "32px", height: "32px" }}>
      <style>{`
        @keyframes pulse-ring-${rank} {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
        @keyframes crown-float-${rank} {
          0%   { transform: translateX(-50%) translateY(0px) rotate(-2deg); }
          25%  { transform: translateX(-50%) translateY(-4px) rotate(1deg); }
          50%  { transform: translateX(-50%) translateY(-6px) rotate(2deg); }
          75%  { transform: translateX(-50%) translateY(-3px) rotate(-1deg); }
          100% { transform: translateX(-50%) translateY(0px) rotate(-2deg); }
        }
        @keyframes twinkle-${rank} {
          0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.3) rotate(30deg); }
        }
      `}</style>

      {/* Glow ring */}
      <span style={{
        position: "absolute", inset: "-4px", borderRadius: "50%",
        border: `2px solid ${c.ring}`,
        animation: `pulse-ring-${rank} 2s ease-in-out infinite`,
        pointerEvents: "none",
      }} />

      {/* Sparkles */}
      <span style={{ position: "absolute", inset: "-18px", pointerEvents: "none", zIndex: 0 }}>
        {[
          { top: "5%", left: "0%", delay: "0.0s", dur: "2.1s" },
          { top: "0%", right: "0%", delay: "0.4s", dur: "2.4s" },
          { top: "40%", left: "-5%", delay: "0.8s", dur: "1.9s" },
          { top: "40%", right: "-5%", delay: "0.2s", dur: "2.6s" },
          { bottom: "0%", left: "5%", delay: "1.0s", dur: "2.2s" },
          { bottom: "-5%", right: "5%", delay: "0.6s", dur: "2.0s" },
        ].map((sp, i) => (
          <span key={i} style={{
            position: "absolute", ...sp,
            width: "6px", height: "6px",
            background: c.sparkle,
            clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            animation: `twinkle-${rank} ${sp.dur} ${sp.delay} ease-in-out infinite`,
          }} />
        ))}
      </span>

      {/* Floating Crown */}
      <span style={{
        position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)",
        zIndex: 20, animation: `crown-float-${rank} 3s ease-in-out infinite`,
        filter: `drop-shadow(0 4px 8px ${c.ring}80)`,
        pointerEvents: "none",
      }}>
        <svg width="40" height="26" viewBox="0 0 68 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 38 L10 16 L22 28 L34 6 L46 28 L58 16 L62 38 Z" fill={c.crownFill} stroke={c.crownStroke} strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="4" y="36" width="60" height="7" rx="3" fill={c.crownStroke} />
          <circle cx="34" cy="39.5" r="3" fill="#E24B4A" />
          <circle cx="20" cy="39.5" r="2.2" fill="#378ADD" />
          <circle cx="48" cy="39.5" r="2.2" fill="#378ADD" />
          <circle cx="34" cy="6" r="4" fill="#E24B4A" stroke="#fff" strokeWidth="1" />
          <circle cx="10" cy="16" r="3" fill={c.crownFill} stroke="#fff" strokeWidth="1" />
          <circle cx="58" cy="16" r="3" fill={c.crownFill} stroke="#fff" strokeWidth="1" />
          <path d="M14 22 Q20 17 26 21" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M18 30 Q22 26 27 29" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </svg>
      </span>

      {/* Rank badge */}
      <span style={{
        position: "absolute", bottom: "-2px", right: "-2px",
        width: "18px", height: "18px",
        background: c.badge, borderRadius: "50%",
        border: "2px solid var(--color-background-primary, #fff)",
        fontSize: "9px", fontWeight: 700, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}>
        {rank}
      </span>

      {/* Avatar */}
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-9 w-9 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background object-cover relative z-[1]" />
      ) : (
        <span className="h-9 w-9 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background bg-foreground text-background font-semibold flex items-center justify-center text-xs relative z-[1]">{initials}</span>
      )}
    </span>
  );
}
