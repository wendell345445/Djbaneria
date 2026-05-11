#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const candidates = [
  "app/dashboard/page.tsx",
  "app/app/dashboard/page.tsx",
];

const filePath = candidates.map((file) => path.join(ROOT, file)).find((file) => fs.existsSync(file));

if (!filePath) {
  console.error("Não encontrei app/dashboard/page.tsx.");
  process.exit(1);
}

const relative = path.relative(ROOT, filePath).replaceAll("\\", "/");
let source = fs.readFileSync(filePath, "utf8");
const original = source;

function replaceFirst(pattern, replacement, label) {
  if (!pattern.test(source)) {
    console.warn(`Não encontrei: ${label}`);
    return false;
  }

  source = source.replace(pattern, replacement);
  console.log(`OK: ${label}`);
  return true;
}

// Remove possible duplicated variables from previous attempts.
source = source.replace(/\n\s*const dashboardUsedCredits\s*=\s*Number\([\s\S]*?\);\n/g, "\n");
source = source.replace(/\n\s*const dashboardRemainingCredits\s*=\s*Number\([\s\S]*?\);\n/g, "\n");
source = source.replace(/\n\s*const dashboardCreditLimit\s*=\s*Math\.max\([\s\S]*?\);\n/g, "\n");

// Replace usageLabel with a coherent total:
// total shown in dashboard = used + remaining.
// This hides the "+X upgrade credits" note, but keeps Usage and Remaining mathematically consistent.
const usageLabelPatterns = [
  {
    label: "usageLabel com baseMonthlyLimit",
    pattern: /(\n\s*)const usageLabel\s*=\s*`\$\{summary\.usedThisMonth\}\s*\/\s*\$\{summary\.baseMonthlyLimit\s*\?\?\s*summary\.monthlyLimit\}`;/,
  },
  {
    label: "usageLabel com monthlyLimit",
    pattern: /(\n\s*)const usageLabel\s*=\s*`\$\{summary\.usedThisMonth\}\s*\/\s*\$\{summary\.monthlyLimit\}`;/,
  },
  {
    label: "usageLabel genérico",
    pattern: /(\n\s*)const usageLabel\s*=\s*`[^`]*summary\.usedThisMonth[^`]*`;/,
  },
];

let usageChanged = false;
for (const item of usageLabelPatterns) {
  if (item.pattern.test(source)) {
    source = source.replace(
      item.pattern,
      `$1const dashboardUsedCredits = Number(summary.usedThisMonth || 0);
$1const dashboardRemainingCredits = Number(
$1  (summary as any).remainingCredits ??
$1    (summary as any).remaining ??
$1    (summary as any).availableCredits ??
$1    0,
$1);
$1const dashboardCreditLimit = Math.max(
$1  Number(summary.monthlyLimit || 0),
$1  dashboardUsedCredits + dashboardRemainingCredits,
$1);
$1const usageLabel = \`\${dashboardUsedCredits} / \${dashboardCreditLimit}\`;`,
    );
    console.log(`OK: ${item.label}`);
    usageChanged = true;
    break;
  }
}

if (!usageChanged) {
  console.warn("Não encontrei usageLabel automaticamente.");
}

// Replace usagePercent denominator with dashboardCreditLimit.
const percentPatterns = [
  {
    label: "usagePercent padrão",
    pattern:
      /const usagePercent\s*=\s*summary\.monthlyLimit\s*>\s*0\s*\?\s*Math\.min\(\s*100,\s*Math\.round\(\(summary\.usedThisMonth\s*\/\s*summary\.monthlyLimit\)\s*\*\s*100\),?\s*\)\s*:\s*0;/,
  },
  {
    label: "usagePercent baseMonthlyLimit",
    pattern:
      /const usagePercent\s*=\s*\(summary\.baseMonthlyLimit\s*\?\?\s*summary\.monthlyLimit\)\s*>\s*0[\s\S]*?:\s*0;/,
  },
];

let percentChanged = false;
for (const item of percentPatterns) {
  if (item.pattern.test(source)) {
    source = source.replace(
      item.pattern,
      "const usagePercent =\n  dashboardCreditLimit > 0\n    ? Math.min(100, Math.round((dashboardUsedCredits / dashboardCreditLimit) * 100))\n    : 0;",
    );
    console.log(`OK: ${item.label}`);
    percentChanged = true;
    break;
  }
}

if (!percentChanged) {
  console.warn("Não alterei usagePercent automaticamente. Se a barra ficar errada, ajuste para usar dashboardCreditLimit.");
}

// Dashboard should hide upgrade carryover details.
if (source.includes("<PlanUsageCard") && !source.includes("carryoverLabel={null}")) {
  source = source.replace(
    /(<PlanUsageCard[\s\S]*?remainingLabel=\{remainingLabel\})/,
    "$1\n            carryoverLabel={null}",
  );
  console.log("OK: carryoverLabel={null}");
}

if (source === original) {
  console.log("Nenhuma alteração aplicada.");
  process.exit(0);
}

fs.writeFileSync(filePath, source);
console.log(`\nArquivo atualizado: ${relative}`);
console.log("Agora rode: npm run build");
