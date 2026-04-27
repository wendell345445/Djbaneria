import type { ComponentType } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import {
  BadgeCheck,
  Clock3,
  CreditCard,
  Gauge,
  ImageIcon,
  Layers3,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { RegisterForm } from "@/components/register-form";
import { LandingBannerCarousel } from "@/components/landing-banner-carousel";
import { landingBannerExamples } from "@/lib/landing-banner-examples";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const advantages = [
  {
    icon: Zap,
    title: "Creación mucho más rápida",
    description:
      "Crea el briefing, elige el estilo y recibe una pieza lista en minutos para promocionar tu evento.",
  },
  {
    icon: Sparkles,
    title: "Visuales pensados para DJs",
    description:
      "Layouts con estilo de flyer premium, enfocados en impacto visual, presencia del artista y lectura fuerte en redes sociales.",
  },
  {
    icon: Layers3,
    title: "Variaciones sin empezar desde cero",
    description:
      "Prueba nuevos estilos, ajusta la pieza con IA e itera rápidamente hasta encontrar la versión ideal para publicar.",
  },
  {
    icon: ImageIcon,
    title: "Usa tu propia foto",
    description:
      "Sube una imagen de referencia para acercar el banner a tu identidad y hacerlo más personal.",
  },
  {
    icon: Gauge,
    title: "Flujo simple para todos",
    description:
      "Aunque no tengas experiencia en diseño, puedes crear banners profesionales con un proceso guiado e intuitivo.",
  },
  {
    icon: ShieldCheck,
    title: "Control de acceso y seguridad",
    description:
      "Registro con verificación por e-mail, protección en el acceso y estructura lista para crecer con más confianza.",
  },
];

const steps = [
  {
    step: "01",
    title: "Crea tu briefing",
    description:
      "Agrega el texto principal, fecha, lugar, estilo visual y formato. Si quieres, también puedes subir tu foto.",
  },
  {
    step: "02",
    title: "Genera y mejora con IA",
    description:
      "Recibe el banner, prueba nuevas versiones y realiza cambios con pocos clics hasta llegar al visual ideal.",
  },
  {
    step: "03",
    title: "Descarga y publica",
    description:
      "Usa tu banner en feed, stories, anuncios pagos, WhatsApp, agenda semanal y promoción de eventos.",
  },
];

const faqs = [
  {
    question: "¿Necesito saber diseño para usarlo?",
    answer:
      "No. La plataforma está pensada para que DJs y productores creen piezas con apariencia profesional sin depender de conocimientos avanzados de diseño.",
  },
  {
    question: "¿Puedo usar mi propia foto en el banner?",
    answer:
      "Sí. Puedes subir una imagen como referencia para generar banners más alineados con tu identidad visual.",
  },
  {
    question: "¿Qué formatos puedo generar?",
    answer:
      "Actualmente el flujo está optimizado para Feed y Story, los formatos más usados para eventos, agendas y publicaciones promocionales.",
  },
  {
    question: "¿El registro libera el acceso al sistema?",
    answer:
      "Después de crear tu cuenta, confirmas tu e-mail con un código y puedes entrar al panel para comenzar a generar banners con IA.",
  },
];

export default function HomePage() {
  return (
    <main className={`${poppins.className} min-h-screen bg-[#060816] text-white`}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,153,225,0.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.1),transparent_28%)]" />

        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#060816]/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                DJ Banner AI
              </p>
              <p className="mt-1 hidden text-sm text-white/55 sm:block">
                Banners profesionales con IA para DJs y eventos
              </p>
            </div>

            <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              <a href="#vantagens" className="transition hover:text-white">
                Ventajas
              </a>
              <a href="#exemplos" className="transition hover:text-white">
                Ejemplos
              </a>
              <a href="#como-funciona" className="transition hover:text-white">
                Cómo funciona
              </a>
              <a href="#cadastro" className="transition hover:text-white">
                Crear cuenta
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white sm:inline-flex"
              >
                Entrar
              </Link>
              <a
                href="#cadastro"
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-95 sm:px-4 sm:text-sm"
              >
                Empezar gratis
              </a>
            </div>
          </div>
        </header>

        <section className="relative mx-auto grid w-full max-w-7xl gap-9 px-4 pb-12 pt-10 sm:gap-14 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-medium text-cyan-100">
              <BadgeCheck size={14} className="text-cyan-200" />
              Hecho para DJs, productores y promoción de eventos
            </div>

            <h1 className="mt-5 max-w-4xl text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:mt-6 sm:text-[52px] lg:text-[68px]">
              Crea banners de DJ con apariencia premium en minutos usando IA.
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/72 sm:mt-6 sm:text-lg sm:leading-8">
              Genera piezas impactantes para feed y story, fortalece tu imagen,
              promociona eventos con más velocidad y usa un flujo simple para
              crear banners profesionales sin depender de un diseñador en cada
              nueva campaña.
            </p>

            <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:gap-4">
              <a
                href="#cadastro"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                Crear mi cuenta gratis
              </a>
              <a
                href="#exemplos"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05] sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                Ver ejemplos de banners
              </a>
            </div>

            <div className="mt-7 grid gap-3 text-sm text-white/72 sm:mt-8 sm:grid-cols-2">
              {[
                "Generación pensada para eventos y agendas",
                "Flujo intuitivo para quienes no dominan diseño",
                "Ajustes rápidos con IA para probar nuevas versiones",
                "Registro simple con acceso online inmediato",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <BadgeCheck size={14} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-w-0 lg:pl-6">
            <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative mx-auto flex w-full max-w-[560px] min-w-0 flex-col gap-4 sm:gap-5">
              <div className="rounded-[24px]  sm:rounded-[32px] sm:p-5">
                <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"></div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FeatureMiniCard
                    icon={Wand2}
                    title="IA enfocada en flyers"
                    description="Piezas con visual más premium para eventos, agendas y promoción musical."
                  />
                  <FeatureMiniCard
                    icon={Clock3}
                    title="Ahorro de tiempo"
                    description="Reduce el tiempo entre tener la idea y publicar la pieza final en redes."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Perfecto para
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {[
                      "Promoción de fiestas y eventos",
                      "Stories de agenda semanal",
                      "Creativos para anuncios pagos",
                      "Posts promocionales para DJs y productores",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                          <BadgeCheck size={12} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Ventaja práctica
                  </p>
                  <div className="mt-4 space-y-4 text-sm text-white/72">
                    <div>
                      <p className="font-semibold text-white">
                        Menos fricción para promocionar tu evento
                      </p>
                      <p className="mt-1 leading-6 text-white/60">
                        Ten siempre una nueva pieza visual lista para promocionar,
                        reposicionar el anuncio y mantener tu comunicación activa.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Más consistencia visual
                      </p>
                      <p className="mt-1 leading-5 text-white/60">
                        Crea banners con una estética más alineada al universo DJ,
                        reforzando tu percepción de valor online.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        id="exemplos"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Ejemplos visuales
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            Mira algunos banners generados en nuestra plataforma
          </h2>
          <p className="mt-4  max-w-2xl text-base leading-5 text-white/66">
            Presenta tus eventos con una estética más profesional, destaca
            tu identidad como DJ y publica piezas de alto impacto en pocos
            minutos.
          </p>
        </div>

        <div className="mt-10">
          <LandingBannerCarousel examples={landingBannerExamples} />
        </div>
      </section>

      <section
        id="vantagens"
        className="border-y border-white/8 bg-white/[0.02]"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-200/75">
              Ventajas del sistema
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Todo lo que necesitas para crear banners con más velocidad y
              más impacto.
            </h2>
            <p className="mt-4 text-base leading-6 text-white/66">
              La plataforma fue diseñada para reducir fricción en la creación,
              mejorar tu presentación y facilitar la promoción de eventos y
              agendas.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {advantages.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-white/10 bg-[#0c1222] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-cyan-200">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-200/80">
              Cómo funciona
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              De la idea al banner listo en un flujo simple.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/66">
              Sin procesos complicados. Tú informas lo que necesitas, la IA crea la
              pieza y puedes promocionar con mucha más rapidez.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1020] p-6">
              <p className="text-sm font-semibold text-white">
                Ideal para quien quiere:
              </p>
              <div className="mt-5 space-y-4 text-sm text-white/70">
                {[
                  "promocionar fiestas con apariencia más profesional",
                  "publicar con más frecuencia sin bloquearse en la creación",
                  "probar campañas y creativos rápidamente",
                  "ahorrar tiempo en la producción de piezas para redes sociales",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <BadgeCheck size={12} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            {steps.map((item) => (
              <div
                key={item.step}
                className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.96),rgba(7,12,24,0.98))] p-6 sm:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                    Paso {item.step}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                    Proceso guiado
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[linear-gradient(180deg,rgba(10,16,32,0.92),rgba(7,12,24,0.95))]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
              Por qué esto convierte mejor
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Una pieza visual fuerte aumenta la percepción de valor de tu marca como DJ.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/66">
              Cuando tu promoción parece profesional, tu presencia digital
              gana fuerza. Esto ayuda a atraer más atención, fortalecer tu
              posicionamiento y hacer tu comunicación más consistente.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <BenefitCallout
              icon={CreditCard}
              title="Ahorra en producción visual"
              description="Ten un flujo accesible para generar banners rápidamente sin depender de una nueva contratación para cada promoción."
            />
            <BenefitCallout
              icon={MailCheck}
              title="Empieza con seguridad"
              description="Flujo de registro con verificación por e-mail para crear una base más confiable desde el inicio."
            />
            <BenefitCallout
              icon={Clock3}
              title="Gana velocidad operativa"
              description="Crea más rápido y aprovecha el tiempo ahorrado para enfocarte en agenda, promoción y relación con el público."
            />
            <BenefitCallout
              icon={Zap}
              title="Prueba más ideas"
              description="Valida propuestas visuales, campañas y nuevos anuncios sin la lentitud de empezar cada pieza desde cero."
            />
          </div>
        </div>
      </section>

      <section
        id="cadastro"
        className="border-t border-white/8 bg-white/[0.02]"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
              Empieza ahora
            </p>
            <h2 className="mt-4 max-w-xl text-[30px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[46px]">
              Crea tu cuenta y prueba una nueva forma de promocionar tus eventos.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/66">
              Regístrate, confirma tu e-mail y entra al panel para comenzar a
              generar banners con IA. Ideal para DJs que quieren más agilidad,
              presencia visual y una promoción más profesional.
            </p>

            <div className="mt-8 space-y-4 text-sm text-white/72">
              {[
                "Acceso online y flujo simple para empezar rápido",
                "Ideal para feed y story, los formatos más usados en promoción",
                "Registro con protección extra y confirmación por e-mail",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <BadgeCheck size={12} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1020] p-6">
              <p className="text-sm font-semibold text-white">
                Qué encuentras al entrar
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <MiniPill icon={Sparkles} label="Generación de banners con IA" />
                <MiniPill icon={Wand2} label="Edición y refinamiento" />
                <MiniPill icon={Gauge} label="Flujo intuitivo" />
                <MiniPill icon={MailCheck} label="Acceso validado por e-mail" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <RegisterForm locale="es" />
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Preguntas frecuentes
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            Resuelve tus dudas antes de empezar.
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
            >
              <summary className="cursor-pointer list-none text-left text-lg font-semibold text-white marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-white/35 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-white/62">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

    </main>
  );
}

function FeatureMiniCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-cyan-200">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>
    </div>
  );
}

function BenefitCallout({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-cyan-200">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/62">{description}</p>
    </div>
  );
}

function MiniPill({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-cyan-200">
        <Icon size={17} />
      </span>
      <span>{label}</span>
    </div>
  );
}
