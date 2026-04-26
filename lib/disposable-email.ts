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

const TRUSTED_EMAIL_DOMAINS = new Set([
  // Globais / América do Norte
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.ca",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.de",
  "hotmail.it",
  "hotmail.es",
  "live.com",
  "live.ca",
  "live.co.uk",
  "live.fr",
  "live.de",
  "msn.com",
  "yahoo.com",
  "yahoo.ca",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.it",
  "yahoo.es",
  "yahoo.nl",
  "ymail.com",
  "rocketmail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "fastmail.com",
  "hey.com",
  "zoho.com",
  "zohomail.com",
  "hushmail.com",
  "mail.com",

  // Provedores norte-americanos de internet/e-mail
  "comcast.net",
  "verizon.net",
  "att.net",
  "sbcglobal.net",
  "bellsouth.net",
  "earthlink.net",
  "charter.net",
  "spectrum.net",
  "cox.net",
  "optonline.net",
  "frontier.com",
  "frontiernet.net",
  "centurylink.net",
  "juno.com",
  "netzero.net",
  "bell.net",
  "sympatico.ca",
  "rogers.com",
  "shaw.ca",
  "telus.net",
  "cogeco.ca",
  "videotron.ca",

  // Alemanha / Áustria / Suíça
  "gmx.com",
  "gmx.net",
  "gmx.de",
  "gmx.at",
  "gmx.ch",
  "web.de",
  "freenet.de",
  "t-online.de",
  "mail.de",
  "mailbox.org",
  "posteo.de",
  "tuta.com",
  "tutanota.com",
  "tutanota.de",
  "bluewin.ch",
  "sunrise.ch",
  "hispeed.ch",
  "aon.at",
  "chello.at",

  // França
  "orange.fr",
  "wanadoo.fr",
  "laposte.net",
  "sfr.fr",
  "free.fr",
  "bbox.fr",
  "numericable.fr",
  "gmx.fr",

  // Reino Unido / Irlanda
  "btinternet.com",
  "btopenworld.com",
  "sky.com",
  "virginmedia.com",
  "ntlworld.com",
  "talktalk.net",
  "blueyonder.co.uk",
  "plus.com",
  "freeserve.co.uk",
  "eircom.net",

  // Itália
  "libero.it",
  "virgilio.it",
  "alice.it",
  "tin.it",
  "tiscali.it",

  // Espanha / Portugal
  "telefonica.net",
  "movistar.es",
  "terra.es",
  "ono.com",
  "sapo.pt",
  "mail.telepac.pt",

  // Holanda / Bélgica
  "ziggo.nl",
  "kpnmail.nl",
  "xs4all.nl",
  "planet.nl",
  "home.nl",
  "casema.nl",
  "skynet.be",
  "proximus.be",
  "telenet.be",

  // Países nórdicos
  "telia.com",
  "telia.se",
  "bredband.net",
  "comhem.se",
  "spray.se",
  "online.no",
  "getmail.no",
  "sol.dk",
  "yousee.dk",
  "stofanet.dk",
  "webspeed.dk",

  // Europa Central e Leste
  "seznam.cz",
  "email.cz",
  "post.cz",
  "centrum.cz",
  "wp.pl",
  "o2.pl",
  "onet.pl",
  "interia.pl",
  "gazeta.pl",
  "inbox.lv",
  "mail.ee",
  "otenet.gr",
  "freemail.gr",

  // Brasil / América Latina, mantendo os principais que seu público pode usar
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "globo.com",
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

function domainMatches(domain: string, listedDomain: string) {
  return domain === listedDomain || domain.endsWith(`.${listedDomain}`);
}

function isEnabled(value?: string) {
  return ["1", "true", "yes", "on"].includes((value || "").trim().toLowerCase());
}

export function isTrustedEmailDomain(email: string) {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  const envAllowlist = parseCsvDomains(process.env.EMAIL_DOMAIN_ALLOWLIST);
  const trustedDomains = new Set([
    ...TRUSTED_EMAIL_DOMAINS,
    ...envAllowlist,
  ]);

  return [...trustedDomains].some((trustedDomain) =>
    domainMatches(domain, trustedDomain),
  );
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

export function validateSignupEmailDomain(email: string) {
  if (isDisposableEmail(email)) {
    return {
      allowed: false,
      error:
        "Não aceitamos e-mails temporários. Use Gmail, Outlook, Yahoo, iCloud, Proton ou um e-mail profissional válido.",
    };
  }

  const requireTrustedDomain = isEnabled(process.env.REQUIRE_TRUSTED_EMAIL_DOMAIN);

  if (requireTrustedDomain && !isTrustedEmailDomain(email)) {
    return {
      allowed: false,
      error:
        "Use um e-mail conhecido, como Gmail, Outlook, Yahoo, iCloud, Proton, ou solicite liberação do seu domínio profissional.",
    };
  }

  return { allowed: true, error: null };
}
