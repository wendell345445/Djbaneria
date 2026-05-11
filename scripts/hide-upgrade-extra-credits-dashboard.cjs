#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();

const dashboardCandidates = [
  "app/dashboard/page.tsx",
  "app/app/dashboard/page.tsx",
];

const componentCandidates = [
  "components/plan-usage-card.tsx",
  "components/dashboard-plan-usage-card.tsx",
  "components/dashboard-usage-card.tsx",
  "components/billing-summary-card.tsx",
];

const allCandidates = [...dashboardCandidates, ...componentCandidates]
  .map((file) => path.join(ROOT, file))
  .filter((file) => fs.existsSync(file));

if (!allCandidates.length) {
  console.error("Nenhum arquivo candidato encontrado. Verifique se você está na raiz do projeto.");
  process.exit(1);
}

const dashboardOnlyProps = [
  "upgradeExtraCreditsLabel",
  "upgradeCreditLabel",
  "upgradeCreditsLabel",
  "extraCreditsLabel",
  "extraUpgradeCreditsLabel",
  "carryoverLabel",
  "upgradeCarryoverLabel",
  "bonusCreditsLabel",
  "creditBonusLabel",
  "upgradeBonusLabel",
  "extraCreditsDescription",
  "upgradeExtraCreditsDescription",
];

function replacePropWithNull(source, propName) {
  return source.replace(
    new RegExp(`\\s+${propName}=\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}`, "g"),
    "",
  );
}

function removeLiteralUpgradeTextBlocks(source) {
  // Removes simple JSX nodes that contain the specific user-facing upgrade note.
  // It intentionally targets only dashboard/customer-facing text around upgrade extra credits.
  const keywords = [
    "créditos extras de upgrade",
    "creditos extras de upgrade",
    "extra upgrade credits",
    "upgrade extra credits",
    "vencem em",
    "expires on",
  ];

  let output = source;

  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Remove simple paragraphs/spans/divs containing the literal text.
    output = output.replace(
      new RegExp(`\\n\\s*<p[^>]*>[^<]*${escaped}[^<]*<\\/p>`, "gi"),
      "",
    );
    output = output.replace(
      new RegExp(`\\n\\s*<span[^>]*>[^<]*${escaped}[^<]*<\\/span>`, "gi"),
      "",
    );
    output = output.replace(
      new RegExp(`\\n\\s*<div[^>]*>[^<]*${escaped}[^<]*<\\/div>`, "gi"),
      "",
    );
  }

  return output;
}

function forceDashboardBaseLimit(source) {
  // Keep total remaining credits intact, but make dashboard "Uso" use base plan limit.
  // Billing page remains untouched.
  let output = source;

  output = output.replace(
    /`\$\{summary\.usedThisMonth\} \/ \$\{summary\.monthlyLimit\}`/g,
    "`${summary.usedThisMonth} / ${summary.baseMonthlyLimit ?? summary.monthlyLimit}`",
  );

  output = output.replace(
    /summary\.monthlyLimit > 0\s*\?\s*Math\.min\(\s*100,\s*Math\.round\(\(summary\.usedThisMonth \/ summary\.monthlyLimit\) \* 100\),\s*\)\s*:\s*0/g,
    "(summary.baseMonthlyLimit ?? summary.monthlyLimit) > 0\n      ? Math.min(\n          100,\n          Math.round((summary.usedThisMonth / (summary.baseMonthlyLimit ?? summary.monthlyLimit)) * 100),\n        )\n      : 0",
  );

  return output;
}

let changedFiles = [];

for (const filePath of allCandidates) {
  const relative = path.relative(ROOT, filePath).replaceAll("\\", "/");
  const original = fs.readFileSync(filePath, "utf8");
  let next = original;

  if (dashboardCandidates.includes(relative)) {
    next = forceDashboardBaseLimit(next);

    for (const propName of dashboardOnlyProps) {
      next = replacePropWithNull(next, propName);
    }

    next = removeLiteralUpgradeTextBlocks(next);

    // If your PlanUsageCard supports this prop, this forces the dashboard to hide the note.
    // If it does not support the prop, the next build will complain; remove this insertion.
    // To avoid that, we only insert it if the prop already appears in the file/component ecosystem.
    const ecosystemHasShowProp = allCandidates.some((candidate) => {
      const content = fs.readFileSync(candidate, "utf8");
      return content.includes("showUpgradeExtraCredits") || content.includes("showCarryoverCredits");
    });

    if (ecosystemHasShowProp) {
      next = next.replace(
        /<PlanUsageCard(\s+)/g,
        (match) => match.includes("showUpgradeExtraCredits") ? match : `<PlanUsageCard$1showUpgradeExtraCredits={false}\n            `,
      );
    }
  } else {
    // Component-level fallback:
    // If a reusable card has a prop to control display, default it to false unless explicitly true.
    next = next.replace(
      /showUpgradeExtraCredits\s*=\s*true/g,
      "showUpgradeExtraCredits = false",
    );
    next = next.replace(
      /showCarryoverCredits\s*=\s*true/g,
      "showCarryoverCredits = false",
    );
  }

  if (next !== original) {
    fs.writeFileSync(filePath, next);
    changedFiles.push(relative);
  }
}

console.log("Arquivos analisados:");
for (const file of allCandidates) {
  console.log(" -", path.relative(ROOT, file).replaceAll("\\", "/"));
}

if (!changedFiles.length) {
  console.log("\nNenhuma alteração automática foi aplicada.");
  console.log("Abra o VS Code e pesquise por: créditos extras de upgrade");
  console.log("Remova esse bloco apenas de app/dashboard/page.tsx, mantendo app/dashboard/billing/page.tsx.");
} else {
  console.log("\nArquivos alterados:");
  for (const file of changedFiles) console.log(" -", file);
}

console.log("\nAgora rode: npm run build");
