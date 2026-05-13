import { StandaloneSeedanceGenerator } from "@/components/standalone-seedance-generator";
import { normalizeLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function AnimatedFlyerPage() {
  const workspace = await requireCurrentWorkspace();

  const userLanguage = await prisma.user.findUnique({
    where: { id: workspace.userId },
    select: { preferredLocale: true },
  });

  const locale = normalizeLocale(
    userLanguage?.preferredLocale ?? workspace.user?.preferredLocale,
  );

  return (
    <main className="av-shell relative min-h-screen overflow-hidden bg-[#03040A] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_6%_0%,rgba(0,245,255,0.17),transparent_31%),radial-gradient(circle_at_88%_5%,rgba(191,95,255,0.18),transparent_33%),radial-gradient(circle_at_50%_100%,rgba(0,245,255,0.07),transparent_36%),linear-gradient(180deg,#03040A_0%,#050713_46%,#03040A_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.10] [background-image:linear-gradient(rgba(0,245,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(191,95,255,0.14)_1px,transparent_1px)] [background-size:46px_46px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.035)_42%,transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,transparent_0px,transparent_5px,rgba(255,255,255,0.12)_6px)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1480px]">
        <StandaloneSeedanceGenerator key={locale} locale={locale} />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

            .av-shell {
              --cx: #00F5FF;
              --cv: #BF5FFF;
              --surface: rgba(5,7,19,0.88);
              --border-x: rgba(0,245,255,0.22);
              --border-v: rgba(191,95,255,0.18);
              font-family: 'DM Sans', sans-serif;
            }
            .av-orb { font-family: 'Orbitron', monospace; }
            .av-mono { font-family: 'Space Mono', monospace; }

            .av-hud, .av-hud-v {
              position: relative;
              background: var(--surface);
              border: 1px solid var(--border-x);
              box-shadow: 0 0 70px rgba(0,245,255,0.08), 0 28px 90px rgba(0,0,0,0.50);
            }
            .av-hud-v { border-color: var(--border-v); }
            .av-hud::before, .av-hud::after, .av-hud-v::before, .av-hud-v::after {
              content: '';
              position: absolute;
              z-index: 5;
              width: 16px;
              height: 16px;
              pointer-events: none;
            }
            .av-hud::before { top: -1px; left: -1px; border-top: 2px solid var(--cx); border-left: 2px solid var(--cx); }
            .av-hud::after { bottom: -1px; right: -1px; border-bottom: 2px solid var(--cv); border-right: 2px solid var(--cv); }
            .av-hud-v::before { top: -1px; left: -1px; border-top: 2px solid var(--cv); border-left: 2px solid var(--cv); }
            .av-hud-v::after { bottom: -1px; right: -1px; border-bottom: 2px solid var(--cx); border-right: 2px solid var(--cx); }

            .av-scan::after {
              content: '';
              position: absolute;
              inset: 0;
              pointer-events: none;
              background: linear-gradient(90deg, transparent, rgba(0,245,255,0.12), transparent);
              transform: translateX(-120%);
              animation: avScan 4.5s ease-in-out infinite;
            }
            @keyframes avScan {
              0%, 55% { transform: translateX(-120%); opacity: 0; }
              68% { opacity: 1; }
              100% { transform: translateX(120%); opacity: 0; }
            }

            .av-btn-solid {
              position: relative;
              overflow: hidden;
              background: var(--cx);
              color: #03040A;
              border: 0;
              font-family: 'Orbitron', monospace;
              letter-spacing: .16em;
              text-transform: uppercase;
              box-shadow: 0 0 46px rgba(0,245,255,0.20), 0 18px 70px rgba(0,0,0,0.44);
            }
            .av-btn-solid::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
              transform: translateX(-120%);
              transition: transform .75s ease;
            }
            .av-btn-solid:hover::before { transform: translateX(120%); }
            .av-btn-solid:disabled::before { display: none; }
          `,
        }}
      />
    </main>
  );
}
