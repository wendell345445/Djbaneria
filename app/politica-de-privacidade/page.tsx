import { LegalPageShell } from "@/components/legal-page-shell";

const company = {
  name: "DJ Pro IA / DJ Banner AI",
  cnpj: "46.389.053/0001-47",
  email: "uendellalonso2013@gmail.com",
  domain: "https://djproia.com",
};

export const metadata = {
  title: "Política de Privacidade | DJ Pro IA",
  description: "Política de Privacidade da plataforma DJ Pro IA.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacidade e dados"
      title="Política de Privacidade"
      description="Entenda como o DJ Pro IA coleta, utiliza, armazena, compartilha e protege dados pessoais, arquivos enviados e informações de uso da plataforma."
      lastUpdated="27 de abril de 2026"
    >
      <h2>1. Quem somos</h2>
      <p>
        Esta Política de Privacidade explica como a plataforma <strong>{company.name}</strong>, disponível em <strong>{company.domain}</strong>, coleta, utiliza, armazena, compartilha e protege dados pessoais de visitantes, usuários cadastrados e assinantes.
      </p>
      <p>
        <strong>Controlador dos dados:</strong> {company.name}<br />
        <strong>CNPJ:</strong> {company.cnpj}<br />
        <strong>E-mail para privacidade:</strong> {company.email}
      </p>

      <h2>2. Aplicação desta Política</h2>
      <p>Esta Política se aplica a:</p>
      <ul>
        <li>visitantes das páginas públicas;</li>
        <li>usuários cadastrados;</li>
        <li>assinantes de planos pagos;</li>
        <li>pessoas que interagem com campanhas, anúncios ou formulários;</li>
        <li>usuários que enviam fotos, textos, nomes artísticos ou outros dados para gerar banners.</li>
      </ul>
      <p>Ao utilizar a plataforma, você reconhece que seus dados serão tratados conforme esta Política.</p>

      <h2>3. Dados que coletamos</h2>
      <h3>3.1 Dados de cadastro</h3>
      <ul>
        <li>nome;</li>
        <li>e-mail;</li>
        <li>senha criptografada/hash;</li>
        <li>nome artístico ou identificação profissional;</li>
        <li>idioma preferido;</li>
        <li>data de criação da conta;</li>
        <li>status de verificação de e-mail;</li>
        <li>workspace vinculado.</li>
      </ul>

      <h3>3.2 Dados de uso da plataforma</h3>
      <ul>
        <li>banners criados;</li>
        <li>prompts, títulos, datas, locais e textos informados;</li>
        <li>estilo visual, formato e qualidade selecionados;</li>
        <li>créditos usados;</li>
        <li>histórico de geração, edição e variações;</li>
        <li>data e hora de ações realizadas;</li>
        <li>status de processamento.</li>
      </ul>

      <h3>3.3 Arquivos enviados</h3>
      <ul>
        <li>fotos do usuário, DJ, artista ou imagem de referência;</li>
        <li>imagens usadas para gerar ou editar banners;</li>
        <li>arquivos temporários necessários à operação do serviço.</li>
      </ul>

      <h3>3.4 Dados de pagamento e assinatura</h3>
      <p>Por meio de provedores de pagamento, especialmente Stripe, podemos tratar:</p>
      <ul>
        <li>plano contratado;</li>
        <li>status da assinatura;</li>
        <li>identificadores de cliente, checkout, invoice e assinatura;</li>
        <li>histórico de pagamento;</li>
        <li>valor pago e moeda;</li>
        <li>status de fatura;</li>
        <li>eventos de checkout, compra e assinatura.</li>
      </ul>
      <p>Não armazenamos dados completos de cartão de crédito.</p>

      <h3>3.5 Dados técnicos e de segurança</h3>
      <ul>
        <li>endereço IP;</li>
        <li>user agent;</li>
        <li>identificadores de sessão;</li>
        <li>cookies e identificadores de navegador;</li>
        <li>logs de acesso, erro, segurança e desempenho;</li>
        <li>informações de origem da requisição;</li>
        <li>dados de proteção contra abuso, spam ou fraude.</li>
      </ul>

      <h3>3.6 Dados de marketing e mensuração</h3>
      <p>
        Podemos coletar e enviar eventos relacionados a visitas, visualização de conteúdo, cadastro, teste, início de checkout, compra e assinatura por meio de ferramentas como Meta Pixel e Conversions API.
      </p>

      <h2>4. Como usamos os dados</h2>
      <p>Usamos dados pessoais para:</p>
      <ul>
        <li>criar e autenticar contas;</li>
        <li>verificar e-mail;</li>
        <li>gerar, editar, armazenar e disponibilizar banners;</li>
        <li>controlar créditos, plano e assinatura;</li>
        <li>processar pagamentos e confirmações via Stripe;</li>
        <li>enviar e-mails transacionais por provedores como Resend;</li>
        <li>proteger a plataforma contra fraude, abuso e automações indevidas;</li>
        <li>prestar suporte e responder solicitações;</li>
        <li>melhorar funcionalidades, desempenho e experiência do usuário;</li>
        <li>mensurar campanhas e otimizar tráfego pago;</li>
        <li>cumprir obrigações legais, regulatórias e contratuais.</li>
      </ul>

      <h2>5. Bases legais</h2>
      <p>
        O tratamento de dados pessoais pode se basear, conforme o caso, em execução de contrato, procedimentos preliminares relacionados a contrato, cumprimento de obrigação legal ou regulatória, legítimo interesse, prevenção à fraude, exercício regular de direitos e consentimento quando aplicável.
      </p>

      <h2>6. Inteligência artificial e arquivos enviados</h2>
      <p>
        Fotos, imagens, textos, prompts e demais dados enviados podem ser processados por provedores de IA para gerar ou editar banners. Esses provedores podem operar infraestrutura própria ou de terceiros, inclusive fora do Brasil.
      </p>
      <p>
        O usuário deve enviar apenas arquivos e informações que tenha direito ou autorização para utilizar. Recomendamos evitar dados sensíveis, documentos, imagens íntimas, dados de menores ou informações que não sejam necessárias para criar o banner.
      </p>

      <h2>7. Compartilhamento com terceiros</h2>
      <p>Podemos compartilhar dados com fornecedores necessários à operação da plataforma, incluindo:</p>
      <ul>
        <li>processadores de pagamento, como Stripe;</li>
        <li>provedores de inteligência artificial;</li>
        <li>infraestrutura, hospedagem e banco de dados, como Vercel e Neon;</li>
        <li>armazenamento e segurança, como Cloudflare;</li>
        <li>envio de e-mails transacionais, como Resend;</li>
        <li>ferramentas de marketing e mensuração, como Meta;</li>
        <li>autoridades públicas quando exigido por lei;</li>
        <li>consultores, advogados, contadores e prestadores profissionais quando necessário.</li>
      </ul>
      <p>Não vendemos dados pessoais como atividade principal.</p>

      <h2>8. Cookies, Pixel e tecnologias similares</h2>
      <p>
        Podemos usar cookies, pixels, identificadores e tecnologias similares para autenticação, segurança, funcionamento do serviço, análise de uso, medição de campanhas e otimização de anúncios.
      </p>
      <p>Essas tecnologias podem incluir:</p>
      <ul>
        <li>cookies de sessão e autenticação;</li>
        <li>identificadores de navegador;</li>
        <li>Meta Pixel;</li>
        <li>Meta Conversions API;</li>
        <li>cookies de clique e navegador, como fbc e fbp;</li>
        <li>eventos de conversão, como PageView, ViewContent, CompleteRegistration, InitiateCheckout, Purchase e Subscribe.</li>
      </ul>
      <p>
        O usuário pode gerenciar cookies no navegador. Bloquear cookies pode afetar funcionalidades, login, mensuração ou personalização.
      </p>

      <h2>9. Transferência internacional de dados</h2>
      <p>
        Alguns fornecedores podem processar dados fora do Brasil. Quando isso ocorrer, adotaremos medidas razoáveis para que o tratamento respeite a legislação aplicável e padrões adequados de segurança.
      </p>

      <h2>10. Segurança dos dados</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger dados pessoais contra acesso não autorizado, uso indevido, perda, alteração ou divulgação indevida, incluindo autenticação, criptografia/hash de senhas, validação de origem, logs, controle de acesso e provedores de infraestrutura seguros.
      </p>
      <p>
        Apesar dos esforços, nenhum sistema é 100% seguro. O usuário deve proteger suas credenciais e comunicar qualquer uso não autorizado da conta.
      </p>

      <h2>11. Retenção e exclusão</h2>
      <p>
        Mantemos dados pelo tempo necessário para prestar o serviço, cumprir obrigações legais, resolver disputas, prevenir fraude, manter registros financeiros e exercer direitos. Arquivos e banners podem ser retidos enquanto a conta estiver ativa ou pelo período necessário ao funcionamento do histórico.
      </p>
      <p>
        Solicitações de exclusão serão analisadas conforme obrigações legais, necessidade técnica e bases legais aplicáveis.
      </p>

      <h2>12. Direitos do titular</h2>
      <p>Nos termos da LGPD, o titular pode solicitar, quando aplicável:</p>
      <ul>
        <li>confirmação da existência de tratamento;</li>
        <li>acesso aos dados;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
        <li>portabilidade, quando regulamentada e aplicável;</li>
        <li>informação sobre compartilhamento;</li>
        <li>revogação de consentimento;</li>
        <li>oposição a tratamento em determinadas hipóteses.</li>
      </ul>
      <p>
        Solicitações devem ser enviadas para <strong>{company.email}</strong>. Podemos solicitar informações adicionais para confirmar a identidade do solicitante.
      </p>

      <h2>13. Dados de crianças e adolescentes</h2>
      <p>
        A plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifiquemos uso indevido por menor, poderemos restringir ou excluir a conta.
      </p>

      <h2>14. Comunicações por e-mail</h2>
      <p>
        Podemos enviar e-mails transacionais, incluindo verificação de e-mail, recuperação ou segurança de conta, confirmações operacionais, informações de assinatura, suporte e avisos importantes. Também podemos enviar comunicações relacionadas ao serviço, respeitando opções de descadastro quando aplicáveis.
      </p>

      <h2>15. Alterações desta Política</h2>
      <p>
        Podemos atualizar esta Política para refletir mudanças na plataforma, legislação, fornecedores ou práticas de tratamento. A versão atualizada será publicada nesta página com a data de atualização.
      </p>

      <h2>16. Contato</h2>
      <p>
        Para exercer direitos, tirar dúvidas ou tratar de privacidade, entre em contato pelo e-mail: <strong>{company.email}</strong>.
      </p>
    </LegalPageShell>
  );
}
