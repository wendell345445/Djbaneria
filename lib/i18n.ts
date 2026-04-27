export const SUPPORTED_LOCALES = ["pt-BR", "en", "es"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export type SupportedLocale = AppLocale;

export const DEFAULT_LOCALE: AppLocale = "en";

export type LanguageOption = {
  value: AppLocale;
  label: string;
  nativeLabel: string;
  description: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    value: "en",
    label: "English",
    nativeLabel: "English",
    description: "Main interface in English.",
  },
  {
    value: "pt-BR",
    label: "Portuguese (Brazil)",
    nativeLabel: "Português (Brasil)",
    description: "Interface principal em português do Brasil.",
  },
  {
    value: "es",
    label: "Spanish",
    nativeLabel: "Español",
    description: "Interfaz principal en español.",
  },
];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  "pt-BR": "Português (Brasil)",
  es: "Español",
};

export const LOCALE_DESCRIPTIONS: Record<AppLocale, string> = {
  en: "Main interface in English.",
  "pt-BR": "Interface principal em português do Brasil.",
  es: "Interfaz principal en español.",
};

export type AppCopy = {
  common: {
    appName: string;
    language: string;
    settings: string;
    save: string;
    saveLanguage: string;
    saving: string;
    saved: string;
    cancel: string;
    continue: string;
    loading: string;
    error: string;
    success: string;
    logout: string;
  };
  nav: {
    dashboard: string;
    newBanner: string;
    myBanners: string;
    billing: string;
    language: string;
    settings: string;
  };
  shell: {
    panel: string;
    new: string;
    workspace: string;
    workspaceDescription: string;
    information: string;
    informationTitle: string;
    informationDescription: string;
    logout: string;
    openMenu: string;
    closeMenu: string;
    fallbackPage: string;
  };
  brand: {
    studio: string;
  };
  settings: {
    eyebrow: string;
    title: string;
    description: string;
    languageEyebrow: string;
    languageTitle: string;
    languageDescription: string;
    currentLanguage: string;
    changeLanguage: string;
    saveLanguage: string;
    saving: string;
    saved: string;
  };
  language: {
    eyebrow: string;
    title: string;
    description: string;
    pageEyebrow: string;
    pageTitle: string;
    pageDescription: string;
  };
  onboarding: {
    eyebrow: string;
    title: string;
    description: string;
    continue: string;
    intro: string;
  };
};

export const APP_COPY: Record<AppLocale, AppCopy> = {
  en: {
    common: {
      appName: "DJ Banner AI",
      language: "Language",
      settings: "Settings",
      save: "Save",
      saveLanguage: "Save language",
      saving: "Saving...",
      saved: "Saved successfully.",
      cancel: "Cancel",
      continue: "Continue",
      loading: "Loading...",
      error: "Something went wrong.",
      success: "Success.",
      logout: "Log out",
    },
    nav: {
      dashboard: "Dashboard",
      newBanner: "New banner",
      myBanners: "My banners",
      billing: "Subscription",
      language: "Language",
      settings: "Settings",
    },
    shell: {
      panel: "Panel",
      new: "New",
      workspace: "Workspace",
      workspaceDescription:
        "Creative panel with a fast workflow for generating AI banners.",
      information: "Information",
      informationTitle: "Create a banner in a few steps",
      informationDescription: "To create your first banner, click New banner.",
      logout: "Log out",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      fallbackPage: "Panel",
    },
    brand: {
      studio: "Creative Studio",
    },
    settings: {
      eyebrow: "Settings",
      title: "Account and workspace",
      description:
        "Update your account information, change your password and choose the main platform language.",
      languageEyebrow: "Language",
      languageTitle: "Language",
      languageDescription:
        "Choose your account language. This preference will be used as the platform translation is expanded.",
      currentLanguage: "Current language",
      changeLanguage: "Change language",
      saveLanguage: "Save language",
      saving: "Saving...",
      saved: "Language saved successfully.",
    },
    language: {
      eyebrow: "Settings",
      title: "Language",
      description:
        "Choose your account language. This preference is saved and will be used to translate more areas of the dashboard.",
      pageEyebrow: "Settings",
      pageTitle: "Language",
      pageDescription:
        "Choose your account language. This preference is saved and will be used to translate more areas of the dashboard.",
    },
    onboarding: {
      eyebrow: "First setup",
      title: "Choose your language",
      description:
        "English is selected by default. You can change this later from the sidebar.",
      continue: "Continue to dashboard",
      intro: "Select your language before entering the dashboard.",
    },
  },
  "pt-BR": {
    common: {
      appName: "DJ Banner AI",
      language: "Idioma",
      settings: "Configurações",
      save: "Salvar",
      saveLanguage: "Salvar idioma",
      saving: "Salvando...",
      saved: "Salvo com sucesso.",
      cancel: "Cancelar",
      continue: "Continuar",
      loading: "Carregando...",
      error: "Algo deu errado.",
      success: "Sucesso.",
      logout: "Sair",
    },
    nav: {
      dashboard: "Dashboard",
      newBanner: "Novo banner",
      myBanners: "Meus banners",
      billing: "Assinatura",
      language: "Idioma",
      settings: "Configurações",
    },
    shell: {
      panel: "Painel",
      new: "Novo",
      workspace: "Workspace",
      workspaceDescription:
        "Painel criativo com fluxo rápido para gerar banners com IA.",
      information: "Informação",
      informationTitle: "Novo banner em poucos passos",
      informationDescription:
        "Para criar seu primeiro banner, basta clicar em Novo banner.",
      logout: "Sair",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      fallbackPage: "Painel",
    },
    brand: {
      studio: "Estúdio criativo",
    },
    settings: {
      eyebrow: "Configurações",
      title: "Conta e workspace",
      description:
        "Atualize as informações principais da conta, altere sua senha e escolha o idioma principal da plataforma.",
      languageEyebrow: "Idioma",
      languageTitle: "Idioma",
      languageDescription:
        "Escolha o idioma da sua conta. Essa preferência será usada conforme as traduções do painel forem expandidas.",
      currentLanguage: "Idioma atual",
      changeLanguage: "Alterar idioma",
      saveLanguage: "Salvar idioma",
      saving: "Salvando...",
      saved: "Idioma salvo com sucesso.",
    },
    language: {
      eyebrow: "Configurações",
      title: "Idioma",
      description:
        "Escolha o idioma da sua conta. Essa preferência fica salva e será usada para traduzir novas áreas do painel.",
      pageEyebrow: "Configurações",
      pageTitle: "Idioma",
      pageDescription:
        "Escolha o idioma da sua conta. Essa preferência fica salva e será usada para traduzir novas áreas do painel.",
    },
    onboarding: {
      eyebrow: "Primeira configuração",
      title: "Escolha seu idioma",
      description:
        "Inglês vem selecionado por padrão. Você pode alterar essa opção depois pela sidebar.",
      continue: "Continuar para o dashboard",
      intro: "Selecione seu idioma antes de entrar no dashboard.",
    },
  },
  es: {
    common: {
      appName: "DJ Banner AI",
      language: "Idioma",
      settings: "Configuración",
      save: "Guardar",
      saveLanguage: "Guardar idioma",
      saving: "Guardando...",
      saved: "Guardado correctamente.",
      cancel: "Cancelar",
      continue: "Continuar",
      loading: "Cargando...",
      error: "Algo salió mal.",
      success: "Éxito.",
      logout: "Cerrar sesión",
    },
    nav: {
      dashboard: "Panel",
      newBanner: "Nuevo banner",
      myBanners: "Mis banners",
      billing: "Suscripción",
      language: "Idioma",
      settings: "Configuración",
    },
    shell: {
      panel: "Panel",
      new: "Nuevo",
      workspace: "Workspace",
      workspaceDescription:
        "Panel creativo con flujo rápido para generar banners con IA.",
      information: "Información",
      informationTitle: "Nuevo banner en pocos pasos",
      informationDescription:
        "Para crear tu primer banner, haz clic en Nuevo banner.",
      logout: "Cerrar sesión",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      fallbackPage: "Panel",
    },
    brand: {
      studio: "Estudio creativo",
    },
    settings: {
      eyebrow: "Configuración",
      title: "Cuenta y workspace",
      description:
        "Actualiza la información principal de la cuenta, cambia tu contraseña y elige el idioma principal de la plataforma.",
      languageEyebrow: "Idioma",
      languageTitle: "Idioma",
      languageDescription:
        "Elige el idioma de tu cuenta. Esta preferencia se usará a medida que se amplíen las traducciones del panel.",
      currentLanguage: "Idioma actual",
      changeLanguage: "Cambiar idioma",
      saveLanguage: "Guardar idioma",
      saving: "Guardando...",
      saved: "Idioma guardado correctamente.",
    },
    language: {
      eyebrow: "Configuración",
      title: "Idioma",
      description:
        "Elige el idioma de tu cuenta. Esta preferencia queda guardada y se usará para traducir más áreas del panel.",
      pageEyebrow: "Configuración",
      pageTitle: "Idioma",
      pageDescription:
        "Elige el idioma de tu cuenta. Esta preferencia queda guardada y se usará para traducir más áreas del panel.",
    },
    onboarding: {
      eyebrow: "Primera configuración",
      title: "Elige tu idioma",
      description:
        "Inglés viene seleccionado por defecto. Puedes cambiarlo después desde la barra lateral.",
      continue: "Continuar al panel",
      intro: "Selecciona tu idioma antes de entrar al panel.",
    },
  },
};

export const DASHBOARD_COPY = APP_COPY;

export function isSupportedLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function normalizeLocale(value: unknown): AppLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function getAppCopy(locale: unknown): AppCopy {
  return APP_COPY[normalizeLocale(locale)];
}

export function getDashboardCopy(locale: unknown): AppCopy {
  return getAppCopy(locale);
}

export function getLocaleLabel(locale: unknown): string {
  return LOCALE_LABELS[normalizeLocale(locale)];
}

export function getLanguageLabel(locale: unknown): string {
  return getLocaleLabel(locale);
}
