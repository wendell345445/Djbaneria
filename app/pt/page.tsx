import type { ComponentType } from "react";
import Link from "next/link";
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

const metrics = [
  { value: "Feed + Story", label: "formatos prontos para divulgação" },
  { value: "1 briefing", label: "para gerar artes com visual premium" },
  {
    value: "100% online",
    label: "sem depender de designer para testar ideias",
  },
];

const advantages = [
  {
    icon: Zap,
    title: "Criação muito mais rápida",
    description:
      "Monte o briefing, escolha o estilo e receba uma arte pronta em minutos para divulgar seu evento.",
  },
  {
    icon: Sparkles,
    title: "Visual pensado para DJs",
    description:
      "Layouts com cara de flyer premium, focados em impacto visual, presença do artista e leitura forte nas redes sociais.",
  },
  {
    icon: Layers3,
    title: "Variações sem começar do zero",
    description:
      "Teste novos visuais, ajuste a arte com IA e itere rapidamente até encontrar a versão ideal para publicar.",
  },
  {
    icon: ImageIcon,
    title: "Use sua própria foto",
    description:
      "Envie sua imagem de referência para aproximar o banner da sua identidade e manter o material mais pessoal.",
  },
  {
    icon: Gauge,
    title: "Fluxo simples para leigos",
    description:
      "Mesmo sem experiência em design, você consegue criar banners profissionais em um processo guiado e intuitivo.",
  },
  {
    icon: ShieldCheck,
    title: "Controle de acesso e segurança",
    description:
      "Cadastro com verificação por e-mail, proteção no registro e estrutura pronta para crescer com mais confiança.",
  },
];

const steps = [
  {
    step: "01",
    title: "Monte seu briefing",
    description:
      "Informe nome principal, data, local, estilo visual e formato. Se quiser, envie também sua foto.",
  },
  {
    step: "02",
    title: "Gere e refine com IA",
    description:
      "Receba o banner, teste novas versões e faça alterações com poucos cliques até chegar no visual ideal.",
  },
  {
    step: "03",
    title: "Baixe e publique",
    description:
      "Use seu banner em feed, story, tráfego pago, WhatsApp, agenda semanal e divulgação de eventos.",
  },
];

const faqs = [
  {
    question: "Preciso saber design para usar?",
    answer:
      "Não. O foco da plataforma é justamente permitir que DJs e produtores criem artes com aparência profissional sem depender de conhecimentos avançados em design.",
  },
  {
    question: "Posso usar minha própria foto no banner?",
    answer:
      "Sim. Você pode enviar uma imagem para servir como referência e gerar banners mais alinhados com sua identidade visual.",
  },
  {
    question: "Quais formatos consigo gerar?",
    answer:
      "Hoje o fluxo está otimizado para Feed e Story, os formatos mais usados para divulgação de eventos, agendas e posts promocionais.",
  },
  {
    question: "O cadastro já libera acesso ao sistema?",
    answer:
      "Após criar a conta, você confirma seu e-mail com um código e já pode entrar no painel para começar a gerar banners com IA.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#060816] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,153,225,0.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.1),transparent_28%)]" />

        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#060816]/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                DJ Banner AI
              </p>
              <p className="mt-1 hidden text-sm text-white/55 sm:block">
                Banners profissionais com IA para DJs e eventos
              </p>
            </div>

            <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              <a href="#vantagens" className="transition hover:text-white">
                Vantagens
              </a>
              <a href="#exemplos" className="transition hover:text-white">
                Exemplos
              </a>
              <a href="#como-funciona" className="transition hover:text-white">
                Como funciona
              </a>
              <a href="#cadastro" className="transition hover:text-white">
                Criar conta
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
                Começar grátis
              </a>
            </div>
          </div>
        </header>

        <section className="relative mx-auto grid w-full max-w-7xl gap-9 px-4 pb-12 pt-10 sm:gap-14 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-medium text-cyan-100">
              <BadgeCheck size={14} className="text-cyan-200" />
              Feito para DJs, produtores e divulgação de eventos
            </div>

            <h1 className="mt-5 max-w-4xl text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:mt-6 sm:text-[52px] lg:text-[68px]">
              Crie banners de DJ com aparência premium em minutos usando IA.
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/72 sm:mt-6 sm:text-lg sm:leading-8">
              Gere artes impactantes para feed e story, valorize sua imagem,
              divulgue eventos com mais velocidade e tenha um fluxo simples para
              criar banners profissionais sem depender de designer para cada
              nova divulgação.
            </p>

            <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:gap-4">
              <a
                href="#cadastro"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                Criar minha conta gratuita
              </a>
              <a
                href="#exemplos"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05] sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                Ver exemplos de banners
              </a>
            </div>

            <div className="mt-7 grid gap-3 text-sm text-white/72 sm:mt-8 sm:grid-cols-2">
              {[
                "Geração pensada para divulgação de eventos e agendas",
                "Fluxo intuitivo para quem não domina design",
                "Refino rápido com IA para testar novas versões",
                "Cadastro simples com acesso online imediato",
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

            <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 backdrop-blur sm:rounded-[26px] sm:p-5"
                >
                  <p className="text-[22px] font-semibold tracking-[-0.03em] text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {metric.label}
                  </p>
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
                    title="IA focada em flyer"
                    description="Arte com visual mais premium para posts de evento, agenda e divulgação musical."
                  />
                  <FeatureMiniCard
                    icon={Clock3}
                    title="Economia de tempo"
                    description="Reduza o tempo entre ter a ideia e publicar a peça pronta nas redes."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Perfeito para
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {[
                      "Divulgação de festas e eventos",
                      "Stories de agenda semanal",
                      "Criativos para tráfego pago",
                      "Posts promocionais de DJ e produtor",
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
                    Vantagem prática
                  </p>
                  <div className="mt-4 space-y-4 text-sm text-white/72">
                    <div>
                      <p className="font-semibold text-white">
                        Menos atrito para vender seu evento
                      </p>
                      <p className="mt-1 leading-6 text-white/60">
                        Tenha sempre uma nova peça visual pronta para divulgar,
                        reposicionar o anúncio e manter sua comunicação ativa.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Mais consistência visual
                      </p>
                      <p className="mt-1 leading-5 text-white/60">
                        Crie banners com estética mais alinhada ao universo DJ,
                        reforçando sua percepção de valor online.
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
            Exemplos visuais
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            Veja alguns baners gerados em nossa plataforma
          </h2>
          <p className="mt-4  max-w-2xl text-base leading-5 text-white/66">
            Apresente seus eventos com uma estética mais profissional, destaque
            sua identidade como DJ e publique artes com impacto visual em poucos
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
              Vantagens do sistema
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Tudo o que você precisa para criar banners com mais velocidade e
              mais impacto.
            </h2>
            <p className="mt-4 text-base leading-6 text-white/66">
              A plataforma foi desenhada para reduzir atrito na criação,
              melhorar sua apresentação e facilitar a divulgação de eventos e
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
              Como funciona
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Da ideia ao banner pronto em um fluxo simples.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/66">
              Sem processos complicados. Você informa o que precisa, a IA cria a
              arte e você segue para divulgação com muito mais rapidez.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b1020] p-6">
              <p className="text-sm font-semibold text-white">
                Ideal para quem quer:
              </p>
              <div className="mt-5 space-y-4 text-sm text-white/70">
                {[
                  "divulgar festas com aparência mais profissional",
                  "postar com mais frequência sem travar na criação",
                  "testar campanhas e criativos com rapidez",
                  "economizar tempo na produção de arte para redes sociais",
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
                    Etapa {item.step}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                    Processo guiado
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
              Por que isso converte melhor
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Uma arte forte aumenta a percepção de valor da sua marca como DJ.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/66">
              Quando sua divulgação parece profissional, sua presença digital
              ganha força. Isso ajuda a atrair mais atenção, fortalecer seu
              posicionamento e tornar sua comunicação mais consistente.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <BenefitCallout
              icon={CreditCard}
              title="Economize na produção de arte"
              description="Tenha um fluxo acessível para gerar banners com rapidez sem depender de uma nova contratação para cada divulgação."
            />
            <BenefitCallout
              icon={MailCheck}
              title="Comece com segurança"
              description="Fluxo de cadastro com verificação por e-mail para criar uma base mais confiável desde a entrada do usuário."
            />
            <BenefitCallout
              icon={Clock3}
              title="Ganhe velocidade operacional"
              description="Crie mais rápido e aproveite o tempo economizado para focar em agenda, divulgação e relacionamento com o público."
            />
            <BenefitCallout
              icon={Zap}
              title="Teste mais ideias"
              description="Valide propostas visuais, campanhas e novos anúncios sem a lentidão de começar cada peça do zero."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Perguntas frequentes
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            Tire suas dúvidas antes de começar.
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

      <section
        id="cadastro"
        className="border-t border-white/8 bg-white/[0.02]"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
              Comece agora
            </p>
            <h2 className="mt-4 max-w-xl text-[30px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[46px]">
              Crie sua conta e teste um novo jeito de divulgar seus eventos.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/66">
              Cadastre-se, confirme seu e-mail e entre no painel para começar a
              gerar banners com IA. Ideal para DJs que querem mais agilidade,
              presença visual e uma divulgação mais profissional.
            </p>

            <div className="mt-8 space-y-4 text-sm text-white/72">
              {[
                "Acesso online e fluxo simples para começar rápido",
                "Ideal para feed e story, os formatos mais usados na divulgação",
                "Cadastro com proteção extra e confirmação por e-mail",
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
                O que você encontra ao entrar
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <MiniPill icon={Sparkles} label="Geração de banners com IA" />
                <MiniPill icon={Wand2} label="Edição e refinamento" />
                <MiniPill icon={Gauge} label="Fluxo intuitivo" />
                <MiniPill icon={MailCheck} label="Acesso validado por e-mail" />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <RegisterForm locale="pt-BR" />
          </div>
        </div>
      </section>
      <footer className="border-t border-white/8 bg-[#060816]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/50 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 DJ Banner AI. All rights reserved.</p>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="transition hover:text-white">
              Terms of Use
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>

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
