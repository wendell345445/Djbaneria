import { SettingsPasswordForm } from "@/components/settings-password-form";
import { SettingsProfileForm } from "@/components/settings-profile-form";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function SettingsPage() {
  const workspace = await requireCurrentWorkspace();

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Configurações
        </p>
        <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
          Conta e workspace
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-white/60">
          Atualize as informações principais da conta e do seu workspace. O e-mail fica visível para consulta, e agora você também pode alterar sua senha com segurança.
        </p>
      </div>

      <div className="grid gap-6">
        <SettingsProfileForm
          initialData={{
            workspaceName: workspace.name ?? "",
            userName: workspace.user?.name ?? "",
            email: workspace.user?.email ?? "",
          }}
        />

        <SettingsPasswordForm />
      </div>
    </main>
  );
}
