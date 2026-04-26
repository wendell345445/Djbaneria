import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050916] text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1280px] items-center justify-center px-5 py-8">
        <section className="w-full max-w-[520px]">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
