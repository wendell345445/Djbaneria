const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "anonbox.net",
  "burnermail.io",
  "byom.de",
  "disposablemail.com",
  "dispostable.com",
  "dropmail.me",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.biz",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "inboxbear.com",
  "mail.tm",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "moakt.com",
  "mohmal.com",
  "mytemp.email",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "temp-mail.org",
  "tempail.com",
  "tempmail.com",
  "tempmail.dev",
  "tempmail.net",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "trashmail.de",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

function parseCsvDomains(value?: string) {
  return (value || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function getEmailDomain(email: string) {
  const [, rawDomain] = email.trim().toLowerCase().split("@");
  return rawDomain || "";
}

function domainMatches(domain: string, blockedDomain: string) {
  return domain === blockedDomain || domain.endsWith(`.${blockedDomain}`);
}

export function isDisposableEmail(email: string) {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  const allowlist = parseCsvDomains(process.env.EMAIL_DOMAIN_ALLOWLIST);
  if (allowlist.some((allowedDomain) => domainMatches(domain, allowedDomain))) {
    return false;
  }

  const envBlocklist = parseCsvDomains(process.env.DISPOSABLE_EMAIL_BLOCKLIST);
  const blockedDomains = new Set([
    ...DISPOSABLE_EMAIL_DOMAINS,
    ...envBlocklist,
  ]);

  return [...blockedDomains].some((blockedDomain) =>
    domainMatches(domain, blockedDomain),
  );
}
