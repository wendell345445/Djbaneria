import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#050916] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1280px] items-center gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1.05fr)_520px]">
        <section className="relative hidden overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] lg:block">
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                DJ Banner AI
              </p>
              <h1 className="mt-4 text-[42px] font-semibold leading-[1.02] text-white">
                Crie sua conta e comece a gerar banners profissionais com IA
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
                Configure sua base inicial, organize seu workspace e acesse um fluxo simples
                para gerar artes, ajustar com IA e baixar versões prontas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard
                number="01"
                title="Conta pronta"
                description="Cadastre nome, e-mail, senha e nome artístico."
              />
              <FeatureCard
                number="02"
                title="Workspace criado"
                description="Seu workspace inicial é criado automaticamente."
              />
              <FeatureCard
                number="03"
                title="Acesso imediato"
                description="Após o cadastro, você entra direto no dashboard."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[520px]">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
        {number}
      </p>
      <h2 className="mt-2 text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}
