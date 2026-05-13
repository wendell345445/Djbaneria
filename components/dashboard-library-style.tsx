export function DashboardLibraryStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

          .library-root {
            --cx: #00F5FF;
            --cv: #BF5FFF;
            --ce: #FF2D6B;
            --cg: #00FF9F;
            background:
              radial-gradient(circle at 18% 0%, rgba(0,245,255,0.10), transparent 30%),
              radial-gradient(circle at 90% 18%, rgba(191,95,255,0.13), transparent 34%),
              radial-gradient(circle at 30% 100%, rgba(255,45,107,0.08), transparent 32%),
              linear-gradient(180deg, #03040A 0%, #060816 45%, #03040A 100%);
            color: #E8EAF0;
            font-family: 'DM Sans', sans-serif;
          }

          .library-orb { font-family: 'Orbitron', monospace; }
          .library-mono { font-family: 'Space Mono', monospace; }

          .library-grid-bg {
            background-image:
              linear-gradient(rgba(0,245,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.018) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, rgba(0,0,0,0.72), transparent);
          }

          @keyframes libraryFloatA {
            0%,100% { transform: translate(0,0) scale(1); }
            45% { transform: translate(32px,-18px) scale(1.05); }
            75% { transform: translate(-18px,18px) scale(0.98); }
          }

          @keyframes libraryFloatB {
            0%,100% { transform: translate(0,0) scale(1); }
            45% { transform: translate(-24px,22px) scale(1.04); }
            75% { transform: translate(18px,-12px) scale(0.97); }
          }

          .library-glow-a { animation: libraryFloatA 22s ease-in-out infinite; }
          .library-glow-b { animation: libraryFloatB 28s ease-in-out infinite; }

          .library-panel,
          .library-card {
            position: relative;
            border: 1px solid rgba(0,245,255,0.16);
            background:
              linear-gradient(135deg, rgba(255,255,255,0.065), rgba(255,255,255,0.022)),
              radial-gradient(circle at top left, rgba(0,245,255,0.06), transparent 34%),
              rgba(3,4,10,0.78);
            box-shadow:
              0 22px 80px rgba(0,0,0,0.38),
              inset 0 1px 0 rgba(255,255,255,0.06);
            backdrop-filter: blur(18px);
          }

          .library-panel::before,
          .library-panel::after,
          .library-card::before,
          .library-card::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            pointer-events: none;
            opacity: 0.78;
            z-index: 4;
          }

          .library-panel::before,
          .library-card::before {
            top: -1px;
            left: -1px;
            border-top: 2px solid var(--cx);
            border-left: 2px solid var(--cx);
          }

          .library-panel::after,
          .library-card::after {
            right: -1px;
            bottom: -1px;
            border-right: 2px solid var(--cv);
            border-bottom: 2px solid var(--cv);
          }

          .library-card {
            overflow: hidden;
            transition: border-color 180ms ease, background 180ms ease, transform 180ms ease, box-shadow 180ms ease;
          }

          .library-card:hover {
            border-color: rgba(0,245,255,0.30);
            background:
              linear-gradient(135deg, rgba(0,245,255,0.08), rgba(191,95,255,0.045)),
              rgba(3,4,10,0.86);
            transform: translateY(-2px);
            box-shadow:
              0 0 58px rgba(0,245,255,0.10),
              0 24px 80px rgba(0,0,0,0.44),
              inset 0 1px 0 rgba(255,255,255,0.07);
          }

          .library-hero {
            border-color: rgba(0,245,255,0.22);
            box-shadow:
              0 0 90px rgba(0,245,255,0.10),
              0 28px 100px rgba(0,0,0,0.54),
              inset 0 1px 0 rgba(255,255,255,0.065);
          }

          .library-section-label {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .library-section-label::before {
            content: '';
            display: block;
            width: 24px;
            height: 1px;
            background: var(--cx);
            box-shadow: 0 0 8px var(--cx);
          }

          .library-chip,
          .library-chip-v,
          .library-chip-g,
          .library-status-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.24);
            background: rgba(0,245,255,0.08);
            color: var(--cx);
            font-family: 'Space Mono', monospace;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.14em;
            line-height: 1;
            padding: 8px 10px;
            text-transform: uppercase;
          }

          .library-chip-v {
            border-color: rgba(191,95,255,0.26);
            background: rgba(191,95,255,0.10);
            color: var(--cv);
          }

          .library-chip-g,
          .library-status-chip {
            border-color: rgba(0,255,159,0.24);
            background: rgba(0,255,159,0.08);
            color: var(--cg);
          }

          .library-btn,
          .library-btn-solid {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.28);
            background: rgba(0,245,255,0.055);
            color: var(--cx);
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            transition: all 180ms ease;
          }

          .library-btn:hover {
            background: rgba(0,245,255,0.10);
            box-shadow: 0 0 28px rgba(0,245,255,0.16);
          }

          .library-btn-solid {
            border-color: var(--cx);
            background: var(--cx);
            color: #03040A;
            box-shadow: 0 0 28px rgba(0,245,255,0.28);
          }

          .library-btn-solid:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 34px rgba(0,245,255,0.42), 0 18px 46px rgba(0,0,0,0.35);
          }

          .library-media {
            position: relative;
            background:
              radial-gradient(circle at top, rgba(0,245,255,0.16), transparent 36%),
              linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          }

          .library-media::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(180deg, transparent 48%, rgba(3,4,10,0.34) 100%);
          }

          .library-soft-panel {
            border: 1px solid rgba(0,245,255,0.14);
            background: rgba(0,245,255,0.035);
            box-shadow: inset 0 0 28px rgba(0,245,255,0.04);
          }

          .library-progress-track {
            height: 8px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255,255,255,0.12);
          }

          .library-progress-bar {
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, var(--cx), var(--cv), #FFD28A);
            box-shadow: 0 0 18px rgba(0,245,255,0.45);
            transition: width 500ms ease;
          }

          @media (max-width: 640px) {
            .library-panel::before,
            .library-panel::after,
            .library-card::before,
            .library-card::after {
              width: 14px;
              height: 14px;
            }
          }
        `,
      }}
    />
  );
}
