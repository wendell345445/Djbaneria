const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'components/new-banner-form.tsx';
const filePath = path.resolve(process.cwd(), target);

if (!fs.existsSync(filePath)) {
  console.error(`Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

let source = fs.readFileSync(filePath, 'utf8');
const original = source;

function replaceOnce(pattern, replacement, label) {
  if (!pattern.test(source)) {
    console.error(`Não consegui localizar o trecho para aplicar: ${label}`);
    process.exit(1);
  }
  source = source.replace(pattern, replacement);
}

// 1) Garantir useEffect no import do React.
source = source.replace(
  /import \{([^}]*?)\} from "react";/,
  (match, imports) => {
    if (/\buseEffect\b/.test(imports)) return match;
    return `import { useEffect,${imports.trim().startsWith(',') ? '' : ' '}${imports.trim()} } from "react";`;
  },
);

// Corrige espaçamento caso o import tenha ficado estranho.
source = source.replace(/import \{ useEffect,\s+/g, 'import { useEffect, ');

// 2) Inserir helpers de localStorage para geração pendente.
const helpers = `
const PENDING_BANNER_STORAGE_KEY = "djproia_pending_banner_generation";
const PENDING_BANNER_MAX_AGE_MS = 1000 * 60 * 60 * 3;

type PendingBannerGeneration = {
  bannerId: string;
  createdAt: number;
};

function readPendingBannerGeneration(): PendingBannerGeneration | null {
  try {
    const raw = window.localStorage.getItem(PENDING_BANNER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingBannerGeneration>;

    if (!parsed.bannerId || typeof parsed.createdAt !== "number") {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.createdAt > PENDING_BANNER_MAX_AGE_MS) {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
      return null;
    }

    return {
      bannerId: parsed.bannerId,
      createdAt: parsed.createdAt,
    };
  } catch {
    window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
    return null;
  }
}

function savePendingBannerGeneration(bannerId: string) {
  window.localStorage.setItem(
    PENDING_BANNER_STORAGE_KEY,
    JSON.stringify({
      bannerId,
      createdAt: Date.now(),
    } satisfies PendingBannerGeneration),
  );
}

function clearPendingBannerGeneration(bannerId?: string) {
  try {
    if (!bannerId) {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
      return;
    }

    const pending = readPendingBannerGeneration();

    if (!pending || pending.bannerId === bannerId) {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
    }
  } catch {
    window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
  }
}
`;

if (!source.includes('PENDING_BANNER_STORAGE_KEY')) {
  if (source.includes('type NewBannerFormLocale =')) {
    source = source.replace(/type NewBannerFormLocale =[^;]+;\n/, (match) => `${helpers}\n${match}`);
  } else {
    replaceOnce(
      /function isCreditExhaustedMessage\(message: string\) \{[\s\S]*?\n\}\n/,
      (match) => `${match}\n${helpers}\n`,
      'helpers de geração pendente',
    );
  }
}

// 3) Limpar pendente quando a geração completar.
if (!source.includes('clearPendingBannerGeneration(bannerId);')) {
  replaceOnce(
    /if \(data\.status === "COMPLETED"\) \{([\s\S]*?)return \{/,
    (match, body) => `if (data.status === "COMPLETED") {${body}clearPendingBannerGeneration(bannerId);\n\n        return {`,
    'limpeza ao completar geração',
  );
}

// 4) Limpar pendente quando a geração falhar explicitamente.
if (!source.includes('clearPendingBannerGeneration(bannerId);\n        throw new Error')) {
  replaceOnce(
    /if \(data\.status === "FAILED"\) \{\n\s*throw new Error\(/,
    `if (data.status === "FAILED") {\n        clearPendingBannerGeneration(bannerId);\n        throw new Error(`,
    'limpeza ao falhar geração',
  );
}

// 5) Inserir useEffect para retomar geração pendente depois de reload.
const resumeEffect = `
  useEffect(() => {
    let ignore = false;
    const pending = readPendingBannerGeneration();

    if (!pending?.bannerId) return;

    setLoading(true);
    setLoadingMode("generate");
    setActiveStep(0);
    setError("");
    setResult(null);
    setEditError("");
    setEditSuccess("");
    setStatusText("Retomando a geração em andamento...");

    waitForGeneratedBanner(pending.bannerId)
      .then((completedBanner) => {
        if (ignore) return;

        setActiveStep(3);
        setStatusText("Banner gerado e salvo com sucesso.");
        setResult(completedBanner);
        clearPendingBannerGeneration(pending.bannerId);
        router.refresh();
      })
      .catch((err) => {
        if (ignore) return;

        const message =
          err instanceof Error
            ? err.message
            : "Não foi possível retomar a geração do banner.";

        setError(message);
        setStatusText("");
        setActiveStep(0);
      })
      .finally(() => {
        if (ignore) return;

        setLoading(false);
        setLoadingMode(null);
      });

    return () => {
      ignore = true;
    };
    // A retomada deve rodar apenas uma vez ao montar a página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
`;

if (!source.includes('Retomando a geração em andamento')) {
  if (source.includes('async function waitForGeneratedBanner(')) {
    source = source.replace(/\n\s*async function waitForGeneratedBanner\(/, `${resumeEffect}\n  async function waitForGeneratedBanner(`);
  } else {
    console.error('Não encontrei waitForGeneratedBanner para inserir o useEffect de retomada.');
    process.exit(1);
  }
}

// 6) Salvar banner pendente quando API retornar PENDING/202.
if (!source.includes('savePendingBannerGeneration(data.bannerId);')) {
  replaceOnce(
    /setStatusText\("Banner criado\. Aguardando a IA finalizar a imagem\.\.\."\);/,
    `savePendingBannerGeneration(data.bannerId);\n        setStatusText("Banner criado. Aguardando a IA finalizar a imagem...");`,
    'salvar bannerId pendente',
  );
}

// 7) Limpar em respostas síncronas com sucesso, caso existam.
if (!source.includes('clearPendingBannerGeneration(data.bannerId);\n\n      router.refresh();')) {
  source = source.replace(
    /\n\s*router\.refresh\(\);\n\s*}\s*catch \(err\) \{/,
    (match) => `\n      if (data.bannerId) {\n        clearPendingBannerGeneration(data.bannerId);\n      }\n\n      router.refresh();\n    } catch (err) {`,
  );
}

if (source === original) {
  console.log('Nenhuma alteração necessária. O arquivo já parece estar atualizado.');
  process.exit(0);
}

const backupPath = `${filePath}.bak-pending-generation`;
fs.writeFileSync(backupPath, original);
fs.writeFileSync(filePath, source);

console.log('Funcionalidade de retomada de geração pendente aplicada com sucesso.');
console.log(`Backup criado em: ${backupPath}`);
