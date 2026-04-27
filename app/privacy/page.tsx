import { LegalPageShellEn } from "@/components/legal-page-shell-en";

const company = {
  name: "DJ Pro IA / DJ Banner AI",
  cnpj: "46.389.053/0001-47",
  email: "uendellalonso2013@gmail.com",
  domain: "https://djproia.com",
};

export const metadata = {
  title: "Privacy Policy | DJ Pro IA",
  description: "Privacy Policy for the DJ Pro IA platform.",
};

export default function PrivacyPolicyEnglishPage() {
  return (
    <LegalPageShellEn
      eyebrow="Privacy and data"
      title="Privacy Policy"
      description="Learn how DJ Pro IA collects, uses, stores, shares, and protects personal data, uploaded files, marketing events, and platform usage information."
      lastUpdated="April 27, 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        This Privacy Policy explains how <strong>{company.name}</strong>, available at <strong>{company.domain}</strong>, collects, uses, stores, shares, and protects personal data from visitors, registered users, subscribers, and people who interact with our campaigns, forms, and platform features.
      </p>
      <p>
        <strong>Data controller/operator:</strong> {company.name}<br />
        <strong>Brazilian CNPJ:</strong> {company.cnpj}<br />
        <strong>Privacy contact:</strong> {company.email}
      </p>

      <h2>2. Scope of this Policy</h2>
      <p>This Policy applies to:</p>
      <ul>
        <li>visitors of public pages and landing pages;</li>
        <li>registered users;</li>
        <li>paid subscribers;</li>
        <li>people who interact with ads, campaigns, forms, or emails;</li>
        <li>users who upload photos, names, artist information, prompts, or other data to generate banners.</li>
      </ul>
      <p>
        By using the platform, you acknowledge that your data will be processed as described in this Policy.
      </p>

      <h2>3. Data we collect</h2>
      <h3>3.1 Account data</h3>
      <ul>
        <li>name;</li>
        <li>email address;</li>
        <li>password hash;</li>
        <li>artist name or professional identifier;</li>
        <li>preferred language;</li>
        <li>account creation date;</li>
        <li>email verification status;</li>
        <li>workspace information.</li>
      </ul>

      <h3>3.2 Platform usage data</h3>
      <ul>
        <li>banners created or edited;</li>
        <li>prompts, titles, event dates, locations, and text inputs;</li>
        <li>selected style presets, formats, and quality options;</li>
        <li>credits used and remaining;</li>
        <li>generation, editing, and variation history;</li>
        <li>dates and times of platform actions;</li>
        <li>processing status and error logs.</li>
      </ul>

      <h3>3.3 Uploaded files and visual references</h3>
      <ul>
        <li>photos of the user, DJ, artist, or other reference images;</li>
        <li>images used to generate or edit banners;</li>
        <li>temporary files needed to operate the service;</li>
        <li>final generated image URLs and related metadata.</li>
      </ul>

      <h3>3.4 Payment and subscription data</h3>
      <p>
        Through payment providers, especially Stripe, we may process:
      </p>
      <ul>
        <li>selected plan;</li>
        <li>subscription status;</li>
        <li>customer, checkout session, invoice, and subscription identifiers;</li>
        <li>payment history and invoice status;</li>
        <li>amount paid and currency;</li>
        <li>checkout, purchase, subscription, and renewal events.</li>
      </ul>
      <p>
        We do not store full credit card numbers. Card and payment details are processed by the payment provider according to its own security standards and policies.
      </p>

      <h3>3.5 Technical and security data</h3>
      <ul>
        <li>IP address;</li>
        <li>browser and device user agent;</li>
        <li>session identifiers;</li>
        <li>cookies and browser identifiers;</li>
        <li>access, security, performance, and error logs;</li>
        <li>request origin and anti-abuse signals;</li>
        <li>CAPTCHA or Turnstile verification data.</li>
      </ul>

      <h3>3.6 Marketing and measurement data</h3>
      <p>
        We may collect and send events related to page visits, content views, registration, trial, checkout start, purchase, and subscription through tools such as Meta Pixel and Meta Conversions API.
      </p>
      <p>
        Such events may include event name, event time, event ID, event source URL, action source, IP address, user agent, email hash, external ID, fbc/fbp cookies, plan, value, currency, subscription identifiers, and related conversion parameters.
      </p>

      <h2>4. How we use data</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>create, authenticate, and manage accounts;</li>
        <li>verify email addresses;</li>
        <li>generate, edit, store, and deliver banners;</li>
        <li>control credits, plans, billing, and subscription status;</li>
        <li>process payment confirmations and webhooks through Stripe;</li>
        <li>send transactional emails through providers such as Resend;</li>
        <li>protect the platform against fraud, spam, abuse, bots, and unauthorized access;</li>
        <li>provide support and respond to user requests;</li>
        <li>improve features, performance, usability, and security;</li>
        <li>measure campaigns and optimize paid traffic;</li>
        <li>comply with legal, regulatory, contractual, accounting, and security obligations.</li>
      </ul>

      <h2>5. Legal bases</h2>
      <p>
        Depending on the context, we may process personal data based on contract performance, pre-contractual procedures, compliance with legal or regulatory obligations, legitimate interests, fraud prevention, regular exercise of rights, and consent where applicable.
      </p>
      <p>
        For users located in Brazil, processing is governed by the Brazilian General Data Protection Law (LGPD) where applicable. For users in other jurisdictions, additional rights may apply according to local law.
      </p>

      <h2>6. AI processing and uploaded content</h2>
      <p>
        Photos, images, prompts, text inputs, and other submitted data may be processed by AI providers to generate or edit banners. These providers may operate infrastructure inside or outside Brazil.
      </p>
      <p>
        You should only upload files and information that you are authorized to use. Avoid uploading sensitive data, identity documents, intimate images, data of minors, confidential information, or anything unnecessary for banner creation.
      </p>

      <h2>7. Sharing with third parties</h2>
      <p>
        We may share data with service providers necessary to operate the platform, including:
      </p>
      <ul>
        <li>payment processors such as Stripe;</li>
        <li>AI generation and image processing providers;</li>
        <li>hosting, deployment, and database providers such as Vercel and Neon;</li>
        <li>storage, CDN, DNS, security, and anti-abuse providers such as Cloudflare;</li>
        <li>transactional email providers such as Resend;</li>
        <li>analytics, advertising, and measurement providers such as Meta;</li>
        <li>public authorities when required by law;</li>
        <li>lawyers, accountants, consultants, auditors, and professional service providers when necessary.</li>
      </ul>
      <p>
        We do not sell personal data as our primary business activity.
      </p>

      <h2>8. Cookies, Pixel, and similar technologies</h2>
      <p>
        We may use cookies, pixels, browser identifiers, and similar technologies for authentication, security, service functionality, analytics, campaign measurement, and ad optimization.
      </p>
      <p>These technologies may include:</p>
      <ul>
        <li>session and authentication cookies;</li>
        <li>browser identifiers;</li>
        <li>Meta Pixel;</li>
        <li>Meta Conversions API;</li>
        <li>click and browser cookies such as fbc and fbp;</li>
        <li>conversion events such as PageView, ViewContent, CompleteRegistration, StartTrial, InitiateCheckout, Purchase, and Subscribe.</li>
      </ul>
      <p>
        You may be able to manage cookies through your browser settings. Blocking cookies may affect login, checkout, analytics, security, and certain platform features.
      </p>

      <h2>9. International data transfers</h2>
      <p>
        Some providers used by the platform may process or store data outside Brazil. By using the platform, you understand that data may be transferred internationally as necessary for service operation, subject to provider safeguards, contractual protections, and applicable law.
      </p>

      <h2>10. Data retention</h2>
      <p>
        We keep personal data for as long as necessary to provide the service, maintain accounts, store banners, manage credits and subscriptions, comply with legal obligations, resolve disputes, prevent fraud, enforce terms, and maintain business records.
      </p>
      <p>
        Uploaded images, generated banners, logs, and billing records may be retained according to operational, legal, tax, accounting, security, and contractual needs. We may delete, anonymize, or aggregate data when it is no longer needed.
      </p>

      <h2>11. Security</h2>
      <p>
        We use technical and organizational measures designed to protect data, including authentication, password hashing, secure cookies, server-side validation, email verification, anti-abuse checks, provider security controls, and restricted access to systems.
      </p>
      <p>
        However, no digital service is completely secure. You are responsible for keeping your credentials confidential and immediately notifying us of any suspected unauthorized access.
      </p>

      <h2>12. User rights</h2>
      <p>
        Depending on applicable law, you may request access, confirmation of processing, correction, deletion, portability, anonymization, information about sharing, withdrawal of consent, objection to certain processing, or review of automated decisions where legally applicable.
      </p>
      <p>
        To make a privacy request, contact us at <strong>{company.email}</strong>. We may need to verify your identity before responding.
      </p>

      <h2>13. Children and minors</h2>
      <p>
        The platform is not intended for children. Users should not submit data of minors, including photos, unless they have the appropriate legal authorization and the use is lawful.
      </p>

      <h2>14. Payment data</h2>
      <p>
        Payments are processed by Stripe or another payment provider. We may receive customer IDs, subscription IDs, invoice IDs, checkout session IDs, payment status, amount, currency, and plan information, but we do not store full card numbers.
      </p>

      <h2>15. Marketing, emails, and notifications</h2>
      <p>
        We may send transactional messages related to account creation, email verification, security, billing, subscriptions, credits, and platform operation. We may also send communications related to product updates or marketing where permitted.
      </p>

      <h2>16. Account deletion and data removal</h2>
      <p>
        Users may request deletion or removal of certain data by contacting us. Some records may be retained where necessary for legal, tax, accounting, fraud prevention, security, billing, dispute resolution, or legitimate business purposes.
      </p>

      <h2>17. Changes to this Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The updated version will be published on this page with a new update date. Continued use of the platform after publication means you acknowledge the updated Policy.
      </p>

      <h2>18. Contact</h2>
      <p>
        For privacy questions or requests, contact us at <strong>{company.email}</strong>.
      </p>
    </LegalPageShellEn>
  );
}
