import { LegalPageShellEn } from "@/components/legal-page-shell-en";

const company = {
  name: "DJ Pro IA / DJ Banner AI",
  cnpj: "46.389.053/0001-47",
  email: "uendellalonso2013@gmail.com",
  domain: "https://djproia.com",
};

export const metadata = {
  title: "Terms of Use | DJ Pro IA",
  description: "Terms of Use for the DJ Pro IA platform.",
};

export default function TermsOfUseEnglishPage() {
  return (
    <LegalPageShellEn
      eyebrow="Legal terms"
      title="Terms of Use"
      description="Please read these terms carefully before accessing or using DJ Pro IA, including AI banner generation, credits, subscriptions, payments, and user responsibilities."
      lastUpdated="April 27, 2026"
    >
      <h2>1. Platform identification</h2>
      <p>
        These Terms of Use govern access to and use of <strong>{company.name}</strong>, available at <strong>{company.domain}</strong>, an online software platform for creating banners, promotional artwork, and visual materials with the assistance of artificial intelligence, mainly for DJs, music producers, events, nightclubs, and digital promotion.
      </p>
      <p>
        <strong>Platform operator:</strong> {company.name}<br />
        <strong>Brazilian CNPJ:</strong> {company.cnpj}<br />
        <strong>Contact email:</strong> {company.email}
      </p>
      <p>
        By creating an account, accessing, purchasing, subscribing to, or using the platform, you confirm that you have read, understood, and agreed to these Terms.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>User:</strong> any person or entity that accesses or uses the platform.</li>
        <li><strong>Account:</strong> the registration created by the user to access the dashboard and platform features.</li>
        <li><strong>Workspace:</strong> the user environment where banners, history, credits, subscription data, and settings are stored.</li>
        <li><strong>Credits:</strong> usage units that allow the user to generate, edit, or request AI variations of banners.</li>
        <li><strong>Banner:</strong> an image, artwork, or visual asset generated, edited, stored, or downloaded through the platform.</li>
        <li><strong>AI:</strong> artificial intelligence technologies and external models used for image generation or editing.</li>
        <li><strong>Plan:</strong> the Free, Pro, Professional, or Studio subscription option, each with its own limits and benefits.</li>
        <li><strong>Third-party services:</strong> integrated providers such as Stripe, AI providers, Vercel, Neon, Resend, Cloudflare, Meta, and other tools necessary for operation.</li>
      </ul>

      <h2>3. Eligibility and account creation</h2>
      <p>
        To use the platform, you must provide accurate information, maintain your account credentials securely, and comply with all applicable laws. You are responsible for all activity performed through your account.
      </p>
      <p>
        We may require email verification, anti-abuse checks, rate limits, CAPTCHA or Turnstile validation, domain restrictions, and other security measures to prevent fraud, spam, disposable-email abuse, and multiple-account misuse.
      </p>
      <p>
        We may refuse, suspend, restrict, or terminate accounts that violate these Terms, attempt to bypass limitations, abuse free credits, misuse the platform, or create risk for the platform, users, third parties, payment processors, advertising platforms, or service providers.
      </p>

      <h2>4. Services provided</h2>
      <p>
        The platform allows users to create AI-generated promotional banners based on form inputs, uploaded reference images, selected visual styles, formats, quality levels, and editing instructions. Features may include banner generation, AI editing, credits, subscriptions, downloads, account settings, language preferences, and billing management.
      </p>
      <p>
        We may modify, improve, remove, suspend, or limit features at any time for technical, operational, legal, security, cost, product, or business reasons.
      </p>

      <h2>5. Plans, credits, and usage limits</h2>
      <p>
        Access to generation and editing features may depend on credits. Each generation, edit, or variation may consume one or more credits according to the rules displayed in the platform.
      </p>
      <p>
        Paid plans may include monthly credit allowances. Free accounts may include a limited number of credits for testing. Credit limits, plan names, benefits, quality levels, and availability may change over time.
      </p>
      <p>
        Credits are not cash, do not represent stored value, and are not transferable, refundable, or redeemable for money unless required by law or expressly stated by us.
      </p>

      <h2>6. Subscriptions, payments, upgrades, and billing</h2>
      <p>
        Paid subscriptions and checkout flows are processed by third-party payment providers, especially Stripe. By subscribing, you authorize the payment provider to charge the selected plan, applicable taxes, renewals, upgrades, and any other amounts shown at checkout.
      </p>
      <p>
        Subscription renewals, plan upgrades, cancellations, failed payments, invoice status, and billing data are handled according to the payment provider flow and platform rules. Access to paid credits may depend on payment confirmation.
      </p>
      <p>
        The platform may grant, renew, or adjust credits only after payment confirmation. If a payment fails, is reversed, disputed, refunded, canceled, or considered fraudulent, we may suspend access, revert plan status, remove credits, or restrict use.
      </p>

      <h2>7. Refunds and cancellations</h2>
      <p>
        Unless required by applicable law or expressly stated in writing, payments for digital subscriptions, used credits, generated images, AI processing, or consumed services are not automatically refundable.
      </p>
      <p>
        Users may cancel subscriptions through the available billing management flow when enabled. Cancellation may stop future renewals, but it does not automatically refund amounts already charged or restore credits already consumed.
      </p>

      <h2>8. Acceptable use</h2>
      <p>
        The platform is intended for lawful creation of promotional materials, event announcements, social media posts, DJ schedules, paid traffic creatives, professional communication, and similar visual assets.
      </p>
      <p>You may not use the platform to:</p>
      <ul>
        <li>violate copyrights, trademarks, image rights, publicity rights, privacy rights, or any rights of third parties;</li>
        <li>upload a person&apos;s photo without authorization when such authorization is required;</li>
        <li>create misleading, fraudulent, defamatory, discriminatory, illegal, explicit, harmful, or rights-infringing content;</li>
        <li>simulate endorsements, partnerships, artists, labels, venues, sponsors, or events that do not exist or are unauthorized;</li>
        <li>bypass credit limits, payment rules, verification systems, security controls, or platform restrictions;</li>
        <li>use bots, scraping, reverse engineering, automated abuse, credential sharing, or attacks against the infrastructure;</li>
        <li>resell, sublicense, rent, or commercially redistribute platform access without authorization;</li>
        <li>use the service for spam, phishing, malware, scams, unlawful advertising, or manipulation of ad platforms.</li>
      </ul>

      <h2>9. User-uploaded images and materials</h2>
      <p>
        By uploading photos, images, names, artist names, event details, trademarks, logos, prompts, or any other materials, you represent and warrant that you have all necessary rights, licenses, consents, permissions, and legal basis to use those materials.
      </p>
      <p>
        You are solely responsible for obtaining authorization from people depicted in images, photographers, designers, agencies, event organizers, venues, labels, brands, artists, and any other third parties related to the materials you submit.
      </p>
      <p>
        You agree not to upload sensitive, illegal, unauthorized, confidential, intimate, or third-party protected materials unless you have the proper right to do so and the use is lawful.
      </p>

      <h2>10. AI-generated content</h2>
      <p>
        The platform uses artificial intelligence to generate and edit images. AI results may include imperfections, visual errors, unexpected variations, inaccurate text, artifacts, stylistic similarities, or outputs that differ from the user&apos;s instructions.
      </p>
      <p>
        We do not guarantee absolute exclusivity, legal originality, suitability for advertising approval, absence of similarity to third-party works, or compliance with every platform, venue, label, artist, or advertising rule. You must review every banner before publishing, selling, promoting, or using it commercially.
      </p>

      <h2>11. Rights to generated banners</h2>
      <p>
        Subject to these Terms, applicable law, third-party provider rules, and the rights contained in uploaded materials, you may use banners generated through the platform for your own lawful promotional and commercial purposes.
      </p>
      <p>
        This permission does not grant you rights over third-party materials, brands, names, people, copyrighted works, or protected elements you included without authorization.
      </p>
      <p>
        We may display non-confidential examples, aggregated usage statistics, or anonymized results for product improvement, security, analytics, and marketing, subject to our Privacy Policy and applicable law.
      </p>

      <h2>12. Intellectual property of the platform</h2>
      <p>
        The platform, interface, software, code, design, visual identity, workflows, prompts, systems, documentation, brand assets, and other proprietary elements belong to us or our licensors. You may not copy, reproduce, modify, reverse engineer, or exploit the platform except as expressly permitted.
      </p>

      <h2>13. Third-party services</h2>
      <p>
        The platform may depend on third-party providers for payments, hosting, database, AI generation, storage, email delivery, anti-abuse protection, analytics, advertising, and other services. These providers may have their own terms, policies, limits, fees, availability, and compliance requirements.
      </p>
      <p>
        We are not responsible for third-party outages, changes, restrictions, rejections, pricing, policies, decisions, or data processing practices beyond our reasonable control.
      </p>

      <h2>14. Advertising, tracking, and campaign optimization</h2>
      <p>
        The platform may use tracking and advertising technologies such as Meta Pixel and Meta Conversions API to measure visits, registrations, checkout starts, purchases, subscriptions, and campaign performance. These tools are described in our Privacy Policy.
      </p>
      <p>
        You are responsible for ensuring your own advertising campaigns, creatives, targeting, claims, and use of generated banners comply with the rules of each advertising platform and applicable laws.
      </p>

      <h2>15. Availability and changes</h2>
      <p>
        We aim to provide a stable and useful service, but we do not guarantee uninterrupted availability, error-free operation, permanent storage, exact generation time, specific results, or compatibility with every device, browser, third-party platform, or ad network.
      </p>
      <p>
        We may perform maintenance, suspend features, adjust limits, change providers, or modify the service whenever reasonably necessary.
      </p>

      <h2>16. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for indirect, incidental, special, punitive, reputational, business, advertising, lost profit, lost opportunity, data loss, campaign rejection, or third-party claims arising from use of the platform.
      </p>
      <p>
        The user is responsible for reviewing outputs, verifying rights, ensuring legal compliance, validating advertising claims, and deciding whether a banner is suitable for publication or commercial use.
      </p>

      <h2>17. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless the platform operator from claims, losses, damages, liabilities, costs, and expenses arising from your use of the platform, uploaded materials, generated banners, violation of these Terms, violation of law, or infringement of third-party rights.
      </p>

      <h2>18. Account suspension or termination</h2>
      <p>
        We may suspend, restrict, or terminate access if we detect abuse, payment issues, security risks, rights violations, fraud, illegal activity, unauthorized automation, multiple-account abuse, or breach of these Terms.
      </p>

      <h2>19. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The updated version will be published on this page with a new update date. Continued use of the platform after publication means acceptance of the updated Terms.
      </p>

      <h2>20. Governing law and jurisdiction</h2>
      <p>
        These Terms are governed by the laws of Brazil, without prejudice to any mandatory consumer or data protection rights that may apply. Any disputes will be handled by the competent courts under Brazilian law, unless another mandatory forum applies.
      </p>

      <h2>21. Contact</h2>
      <p>
        For questions about these Terms, contact us at <strong>{company.email}</strong>.
      </p>
    </LegalPageShellEn>
  );
}
