#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

const targetFiles = [
  "app/dashboard/page.tsx",
  "app/dashboard/banners/new/page.tsx",
  "app/dashboard/billing/page.tsx",
  "app/dashboard/checkout/return/page.tsx",
  "app/api/banners/generate/route.ts",
  "app/api/banners/edit/route.ts",
  "app/api/banners/status/[bannerId]/route.ts",
  "app/api/ai/professional-image/route.ts",
  "app/api/billing/change-plan/route.ts",
  "app/api/billing/webhook/route.ts",
];

function patchMotionCreditType(source) {
  if (!source.includes("UsageEventType.BANNER_GENERATION")) {
    return source;
  }

  if (source.includes("UsageEventType.BANNER_MOTION_RENDER")) {
    return source;
  }

  let next = source;

  next = next.replace(
    /(UsageEventType\.BANNER_VARIATION,\s*)/g,
    `$1\n            UsageEventType.BANNER_MOTION_RENDER,`,
  );

  // Some arrays use a different indentation level.
  next = next.replace(
    /(UsageEventType\.BANNER_VARIATION,\s*)\n(\s*\])/g,
    `$1\n            UsageEventType.BANNER_MOTION_RENDER,\n$2`,
  );

  return next;
}

const changed = [];
const missing = [];

for (const relativePath of targetFiles) {
  const filePath = path.join(root, relativePath);

  if (!fs.existsSync(filePath)) {
    missing.push(relativePath);
    continue;
  }

  const before = fs.readFileSync(filePath, "utf8");
  const after = patchMotionCreditType(before);

  if (after !== before) {
    fs.writeFileSync(filePath, after);
    changed.push(relativePath);
  }
}

console.log("Motion credit display/check sync finished.");
console.log("Changed files:", changed.length ? changed : "none");
console.log("Missing files:", missing.length ? missing : "none");

if (!changed.length) {
  console.log("If nothing changed, the files may already be synchronized or the code format is different.");
}
